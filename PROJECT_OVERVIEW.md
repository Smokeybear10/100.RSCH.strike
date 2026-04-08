# STR1KE — Project Overview

**Live demo: [str1ke.vercel.app](https://str1ke.vercel.app)**

Real-time strike detection in MMA footage using computer vision and temporal action recognition. Given a short video clip, the system classifies every 5-frame window as "strike" or "neutral" and outputs a per-window confidence score.

---

## Problem

Detecting strikes in combat sports footage is hard because:

- A strike lands in ~150ms (5 frames at 30fps). The entire action — wind-up, contact, follow-through — lives in a tiny temporal window.
- Broadcast footage is noisy: cage, crowd, overlays, camera movement, Monster Energy logos. The model needs to see fighters, not television.
- There is no public labeled dataset for MMA strike detection. Every sample had to be created from scratch.

## Architecture

### Pipeline: Segment, Annotate, Classify

The system is a three-stage pipeline. Each stage is independent and produces artifacts consumed by the next.

#### Stage 1 — Segmentation (SAM2)

**What:** Meta's Segment Anything Model 2 (SAM2) isolates fighter silhouettes from broadcast footage, producing per-frame binary masks.

**Why:** Removing background noise (cage, crowd, graphics) forces the downstream classifier to learn from body motion rather than incidental visual features. Without segmentation, the model could overfit to arena-specific textures or broadcast overlays that have nothing to do with strikes.

**How it works:**
- SAM2 is a promptable visual segmentation foundation model. You give it a point or bounding box on an object in one frame, and it tracks that object across subsequent frames, generating pixel-level masks.
- For this project, SAM2 was prompted on each fighter in the first frame of a clip. It then propagated masks forward through all frames automatically.
- The output is a masked version of each frame: fighter silhouettes on a black background. This is what the classifier actually sees.

**Technical detail:** SAM2 uses a streaming architecture with memory attention — it maintains a memory bank of recently processed frames, allowing it to handle occlusions and fast motion without re-prompting. This is why it works well for MMA where fighters overlap frequently.

#### Stage 2 — Annotation (Label Studio + SAM2 Backend)

**What:** 38 five-frame windows hand-labeled as "strike" or "neutral" using Label Studio with a SAM2 backend for mask generation assistance.

**Dataset composition:**
- 19 strike windows, 19 neutral windows
- Each window = 5 consecutive frames (matching the model's temporal receptive field)
- Source: UFC broadcast footage, single fight (Topuria vs. Holloway)
- Total: 200 frames (38 windows × 5 frames + held-out test windows)

**Annotation format:** MMAction2 RawframeDataset format. Each window is a folder of 5 JPEG frames (`img_00001.jpg` through `img_00005.jpg`). Annotation text files map folder paths to frame counts and class labels:
```
strike/0 5 1    # folder_path  num_frames  class_label
neutral/0 5 0
```

**Split:**
- Train: 15 strike + 15 neutral = 30 windows
- Validation: 2 strike + 2 neutral + 1 strike + 1 neutral = 6 windows
- Test (held-out): 1 strike + 1 neutral = 2 windows

**Why so small?** Label Studio's ML-assisted labeling (which auto-propagates labels after a few manual examples) requires a premium subscription that wasn't available. Every mask had to be manually verified/adjusted, making the process slow. The 38 windows were created over one weekend.

#### Stage 3 — Classification (TSN Fine-tuned from Kinetics-400)

**What:** A Temporal Segment Network (TSN) with a ResNet-50 backbone, pretrained on Kinetics-400, fine-tuned for binary strike/neutral classification.

**Why TSN over 3D CNN:**
- A custom 3D CNN was attempted first (see `3DCNN_Pipeline.ipynb`). It used Conv3D layers to learn spatiotemporal features directly from raw frames + masks (4 channels: RGB + mask). However:
  - It was too RAM-intensive for Google Colab's free tier
  - With only 38 data points, a from-scratch 3D CNN couldn't learn meaningful features
  - Validation accuracy flatlined at 37.5% across all 20 epochs — the model never learned
- TSN was chosen because it comes pretrained on Kinetics-400 (400 human action classes, ~300K video clips). The backbone already understands human body motion, poses, and temporal dynamics. Fine-tuning only needs to adapt the final classification layer to the new domain.

**How TSN works:**

TSN is designed for temporal action recognition in untrimmed videos. The core idea:

1. **Sparse temporal sampling:** Instead of processing every frame (expensive), TSN divides a video into segments and samples one frame per segment. For this project: `clip_len=5, frame_interval=1, num_clips=1` — it takes 5 consecutive frames as one clip.

2. **Per-frame feature extraction:** Each frame passes through a shared ResNet-50 backbone (pretrained on ImageNet, then Kinetics-400). The backbone extracts a 2048-dimensional feature vector per frame.

3. **Temporal consensus:** Frame-level features are aggregated (averaged) into a single video-level representation. This forces the model to learn patterns that hold across the full 5-frame window, not just single-frame artifacts.

4. **Classification head:** A fully connected layer maps the aggregated features to class probabilities. For this project: 2 classes (strike, neutral), output is a softmax probability.

**Training configuration:**
- Framework: MMAction2 (OpenMMLab)
- Backbone: ResNet-50
- Pretrain: Kinetics-400 (checkpoint: `tsn_r50_1x1x3_100e_kinetics400_rgb`)
- Input: 224×224 center-cropped frames, ImageNet normalization (mean=[123.675, 116.28, 103.53], std=[58.395, 57.12, 57.375])
- Epochs: 20
- Data format: RawframeDataset (individual JPEG frames, not video files)
- Hardware: Google Colab free tier (single GPU)
- Training time: < 1 minute

**Inference pipeline:**
1. Extract frames from input video using OpenCV
2. Group frames into non-overlapping 5-frame windows
3. For each window: write frames to a temporary video file, run `inference_recognizer()` from MMAction2
4. Output: per-window class label and confidence score (softmax probability of the predicted class)

## The 3D CNN Approach (Attempted, Abandoned)

The 3D CNN approach is documented in `3DCNN_Pipeline.ipynb` and represents an important design decision.

**Architecture:**
```
Conv3D(16, kernel=(2,2,2), relu)
→ MaxPooling3D(pool=(1,2,2))
→ GlobalAveragePooling3D
→ Dense(32, relu, L2 reg)
→ Dropout(0.5)
→ Dense(2, softmax)
```

**Key difference from TSN:** The 3D CNN took 4-channel input (RGB + SAM2 mask) rather than 3-channel RGB. The idea was that explicit mask information would help the model focus on fighters. However, this also meant no transfer learning was possible — no pretrained weights exist for 4-channel 3D convolutions on action recognition data.

**Why it failed:**
- 38 training samples is orders of magnitude too few for a from-scratch CNN
- The model never converged — validation accuracy stayed at 37.5% (equivalent to always predicting one class)
- RAM constraints on Colab made even this tiny model painful to train

**Lesson:** With extremely small datasets, transfer learning from a large pretrained model (TSN + Kinetics-400) dramatically outperforms training from scratch, even if the from-scratch architecture is theoretically better suited to the task.

## Key Technical Decisions

### Why 5-frame windows?
- At 30fps, 5 frames = ~167ms. A typical MMA strike (jab, cross, hook) takes 100-200ms from initiation to landing. A 5-frame window captures the full strike action without including too much pre/post context that would dilute the signal.
- Shorter windows (3 frames) risk cutting off the follow-through. Longer windows (10 frames) include neutral movement that confuses the classifier.

### Why binary classification?
- With only 38 labeled windows, multi-class classification (jab vs. cross vs. kick vs. elbow) would mean ~5 samples per class — not enough for any model to learn.
- Binary strike/neutral is the simplest formulation that still produces a useful output. A positive detection tells you when a strike happens, and the confidence score indicates how certain the model is.

### Why SAM2 masking before classification?
- Domain shift: broadcast footage varies dramatically across events (lighting, camera angles, arena design). Masking normalizes the input — the classifier sees silhouettes, not television production.
- Data efficiency: with only 38 windows, the model can't afford to spend capacity learning what's background vs. fighter. SAM2 handles this pre-classification, letting the TSN focus entirely on body motion patterns.

### Why not use video files directly?
- MMAction2's RawframeDataset format (individual frame images) was chosen over VideoDataset because it allows frame-level preprocessing (applying SAM2 masks) and simpler data augmentation. It also avoids video codec decoding overhead during training.

## Results and Limitations

**What works:**
- The model correctly identifies obvious strikes (clear punches, knockdowns) with high confidence
- Transfer learning from Kinetics-400 gives the model a strong prior on human body motion
- SAM2 segmentation significantly reduces background noise

**Limitations:**
- 38 training windows is extremely small. The model is likely overfitting to the specific fight (Topuria vs. Holloway) and would struggle to generalize to different fighters, weight classes, or camera angles.
- Binary classification can't distinguish strike types (jab vs. power shot vs. body kick)
- No temporal context between windows — each 5-frame window is classified independently. A strike that starts in one window and lands in the next gets split.
- Inference requires writing temporary video files to disk for each window (MMAction2's inference API constraint), which is slow for real-time applications.

**What would improve it:**
1. More data — even 200-500 labeled windows would dramatically improve generalization
2. Label Studio Premium's ML-assisted annotation to speed up labeling
3. Multi-fight dataset covering different fighters, weight classes, and camera setups
4. Sliding window with overlap instead of non-overlapping windows, to catch strikes that span window boundaries
5. Multi-class labels: jab, cross, hook, kick, elbow, knee, takedown, neutral

## Project Structure

```
STR1KE/
├── model/
│   ├── notebooks/
│   │   ├── TSN_Pipeline.ipynb       # TSN fine-tuning + inference
│   │   └── 3DCNN_Pipeline.ipynb     # 3D CNN attempt (abandoned)
│   └── data/
│       ├── annotations/             # train/val/test splits
│       └── frames/
│           ├── strike/              # 19 windows, 5 frames each
│           └── neutral/             # 19 windows, 5 frames each
├── showcase/                        # Next.js interactive demo site
│   └── src/
│       ├── app/                     # Next.js pages
│       ├── components/              # Scroll hero, film room, upload
│       └── lib/                     # Clip data, player utils
├── PROJECT_OVERVIEW.md              # Deep technical writeup
└── README.md
```

## Tech Stack

| Layer | Tools |
|-------|-------|
| Segmentation | SAM2 (Meta) |
| Annotation | Label Studio + SAM2 backend |
| ML Framework | MMAction2 (OpenMMLab) |
| Model | TSN (ResNet-50 backbone, Kinetics-400 pretrain) |
| Failed attempt | Custom 3D CNN (TensorFlow/Keras) |
| Training | PyTorch, Google Colab (free tier, single GPU) |
| Showcase | Next.js 15, Tailwind CSS, GSAP (scroll-driven animations) |

## Interview Talking Points

**"Walk me through the project."**
> I built a strike detection system for MMA footage. The pipeline has three stages: SAM2 segments fighters from the broadcast, I hand-labeled 38 five-frame windows as strike or neutral, then I fine-tuned a Temporal Segment Network pretrained on Kinetics-400. The model outputs a confidence score for each 5-frame window.

**"Why not train from scratch?"**
> I tried. Built a 3D CNN that takes RGB + mask as 4 channels. It never converged — 37.5% accuracy after 20 epochs. With only 38 data points, the model couldn't learn spatial features from scratch. TSN comes pretrained on 300K videos of human actions, so it already understands body motion. I only needed to teach it the difference between a strike and neutral movement.

**"How did you handle the small dataset?"**
> Three ways. First, SAM2 masking reduces the input space — the classifier sees silhouettes, not full broadcast footage, so it doesn't waste capacity on background features. Second, transfer learning from Kinetics-400 provides strong priors on human motion. Third, the 5-frame window size matches the temporal duration of a real strike, so each window captures a complete action rather than a fragment.

**"What would you do differently with more time/resources?"**
> The bottleneck is labeled data. With Label Studio Premium's ML-assisted annotation, I could label 10x more windows in the same time. I'd also expand to multiple fights across different weight classes for generalization, add multi-class labels (jab, kick, takedown), and implement sliding windows with overlap instead of non-overlapping chunks.

**"What's the most interesting technical decision?"**
> Using SAM2 as a preprocessing step rather than an architectural component. Most approaches would feed raw video to the classifier and hope it learns to ignore the background. By explicitly removing the background first, I turned a hard problem (action recognition in noisy broadcast footage) into a simpler one (action recognition on clean silhouettes). It's a domain adaptation technique that also makes the tiny dataset go further.

---

Built by Thomas Ou
