import { ScrollHero } from "@/components/scroll-hero";
import {
  Ticker,
  Masthead,
  Abstract,
  Section,
  Figure,
  PipelineSteps,
  KvGrid,
  FailGrid,
  SpecTable,
  CodeBlock,
  Code,
  DemoPlayer,
  Upload,
} from "@/components/paper";
import {
  TSNDiagram,
  SAM2Slider,
  TrainingCurves,
  ConfidenceTimelineFigure,
} from "@/components/figures";
import { researchClips, FAILURES } from "@/lib/research-data";

export default function Home() {
  const knockdownClip = researchClips.find((c) => c.id === "knockdown")!;

  return (
    <main id="main" className="relative bg-paper text-ink">
      {/* CINEMATIC INTRO — preserved scroll-scrubbed fight sequence. */}
      <ScrollHero />

      {/* Sticky research ticker — engages once the intro is past. */}
      <Ticker />

      <div className="mx-auto max-w-[1180px] px-8">
        {/* ───────────────────────────────  Masthead  ─────────────────────────────── */}
        <Masthead
          title={
            <>
              Strike detection in MMA broadcast video with a{" "}
              <em>5-frame</em> temporal classifier on top of SAM2 silhouettes.
            </>
          }
          deck={
            <>
              A three-stage pipeline — segment, annotate, classify — that calls
              strike or neutral on every 5-frame window. Trained on 38
              hand-labeled windows and a Kinetics-400 prior. This page presents
              the system, the design decisions, and the failure modes that
              survive them.
            </>
          }
          meta={[
            { label: "Author", value: "Thomas Ou" },
            {
              label: "Code",
              value: (
                <a
                  href="https://github.com/Smokeybear10/STR1KE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-rule hover:border-red-600 hover:text-red-600"
                >
                  github.com/Smokeybear10/STR1KE
                </a>
              ),
            },
            { label: "Source", value: "UFC 308 · Topuria vs. Holloway" },
            { label: "Read time", value: "≈ 7 min" },
            {
              label: "Status",
              value: <span className="text-red-600">technical preview</span>,
            },
          ]}
        />

        {/* ───────────────────────────────  Abstract  ─────────────────────────────── */}
        <Abstract>
          <p>
            We fine-tune a Temporal Segment Network (ResNet-50, Kinetics-400
            pretrain) for binary strike / neutral classification on 5-frame
            windows of MMA footage. SAM2 segmentation removes the broadcast
            (cage, crowd, overlays) before classification, reducing the
            domain-shift burden on a dataset of only 38 hand-labeled windows.
            The pipeline reaches 0.83 validation accuracy after under one
            minute of training on a free-tier Colab GPU. A from-scratch 3D CNN
            baseline never converges — we report both, and discuss where the
            small-data regime forces transfer learning to do almost all the
            work.
          </p>
        </Abstract>

        {/* ───────────────────────────────  § 01 Problem  ─────────────────────────────── */}
        <Section
          id="problem"
          number="§ 01 · Problem"
          rail={[
            {
              heading: "In one line",
              body: "A strike lands in roughly 150 ms — five frames at 30 fps. The whole action lives in a window narrower than human reaction time.",
            },
            {
              heading: "Why public datasets fail",
              body: "Action-recognition corpora (Kinetics, AVA) treat punches as a coarse label across seconds of context. We need the millisecond.",
            },
            {
              heading: "Constraints",
              body: "Free-tier GPU. One labeler. One weekend. No premium annotation tools.",
            },
          ]}
        >
          <p>
            Detecting a strike in broadcast MMA video is, on the surface, a
            1-class action-recognition problem. Three things make it
            specifically hard.
          </p>
          <p>
            <strong>Temporal scale.</strong> A jab takes 100–200 ms from
            initiation to contact. At 30 fps that is five frames. Most
            action-recognition models read seconds of context; here the entire
            signal is shorter than a sneeze. Either the model reads all five
            frames at once, or it misses the action.
          </p>
          <p>
            <strong>Domain noise.</strong> Broadcast footage carries cage
            geometry, crowd parallax, scorebugs, corporate overlays, and a
            camera that pans on contact. A naïve classifier will happily learn
            to predict <em>strike</em> whenever the Monster Energy logo enters
            frame.
          </p>
          <p>
            <strong>No data.</strong> There is no public, labeled dataset for
            MMA strike detection. Every sample in this work was created from
            scratch.
          </p>
        </Section>

        {/* ───────────────────────────────  § 02 First attempt  ─────────────────────────────── */}
        <Section
          id="ablation"
          number="§ 02 · First attempt — 3D CNN from scratch"
          rail={[
            {
              heading: "What we tried",
              body: "Custom 3D CNN. 4-channel input (RGB + SAM2 mask). Conv3D → MaxPool3D → GAP → FC.",
            },
            {
              heading: "Result",
              body: "Validation accuracy stuck at 37.5% across all 20 epochs. The model never learned.",
            },
            {
              heading: "Lesson",
              body: "n = 38 cannot teach a randomly-initialized 3D conv anything about human motion.",
            },
          ]}
          extras={
            <Figure
              number="FIG 01"
              title="20-epoch training comparison"
              scale="n=38 · Colab T4"
              caption={
                <>
                  <strong>Solid:</strong> TSN with K400 pretrain, head-only
                  fine-tune (introduced in §03). <strong>Dashed:</strong> 3D
                  CNN trained from scratch on RGB + mask. The 3D-CNN curve is
                  reconstructed from logged values — flat at 37.5% is the
                  literal result we observed. The takeaway is not that 3D
                  convolutions are wrong for this task; it is that, in the
                  small-data regime, transfer learning beats theoretically-
                  better-suited architectures that lack a useful prior.
                </>
              }
            >
              <TrainingCurves />
            </Figure>
          }
        >
          <p>
            The architecturally cleaner option came first: a small 3D CNN that
            ingests RGB and the SAM2 mask jointly as a 4-channel volume. The
            hypothesis was that explicit mask information, fed end-to-end,
            would let the network learn fighter-aware spatiotemporal features.
          </p>
          <p>
            It never converged. With 38 training samples, no pretrain is
            available for 4-channel 3D convolutions; the model is initialized
            from scratch and asked to learn human-motion priors from a
            kitchen-table dataset. Validation accuracy flatlined at the
            majority baseline.
          </p>
          <p>
            The pivot: trade architectural elegance for a strong prior.
            ResNet-50 has already seen{" "}
            <strong>~300 K Kinetics-400 video clips</strong> covering human
            action. Fine-tuning only adapts the final layer. The backbone does
            the heavy lifting; the head learns the strike/neutral boundary.
            That move is the whole pipeline below.
          </p>
        </Section>

        {/* ───────────────────────────────  § 03 Pipeline  ─────────────────────────────── */}
        <Section
          id="pipeline"
          number="§ 03 · Pipeline"
          rail={[
            {
              heading: "Three stages",
              body: "Each stage emits artifacts the next consumes. SAM2 masks → frame folders → softmax.",
            },
            {
              heading: "Format",
              body: (
                <>
                  MMAction2 RawframeDataset. Per-clip JPEG folders. Annotation
                  is one line per window:{" "}
                  <span className="font-mono">path n_frames label</span>.
                </>
              ),
            },
          ]}
          extras={
            <>
              <PipelineSteps
                steps={[
                  {
                    number: "Stage 01",
                    title: "Segment",
                    role: "SAM2 · Meta",
                    description:
                      "Promptable segmentation, prompted once per fighter on frame 0 of a clip. SAM2's streaming memory propagates masks forward through fast occlusion and overlapping bodies — exactly the failure modes that defeat simpler trackers.",
                    meta: [
                      { label: "Input", value: "RGB frames" },
                      { label: "Output", value: "per-frame binary mask" },
                      { label: "Prompt", value: "1 click / fighter" },
                    ],
                  },
                  {
                    number: "Stage 02",
                    title: "Annotate",
                    role: "Label Studio · SAM2 backend",
                    description:
                      "38 five-frame windows hand-verified over one weekend at a kitchen table. Balanced 19 / 19. Without ML-assisted propagation (premium-only), every mask had to be inspected manually — the bottleneck is the eye, not the GPU.",
                    meta: [
                      { label: "Windows", value: "38 (19 strike · 19 neutral)" },
                      { label: "Frames each", value: "5 @ 30 fps" },
                      { label: "Split", value: "30 / 6 / 2" },
                    ],
                  },
                  {
                    number: "Stage 03",
                    title: "Classify",
                    role: "TSN · ResNet-50 · K400 pretrain",
                    description:
                      "Temporal Segment Network. Each of the 5 frames passes through a shared ResNet-50; features are averaged into a single 2048-d vector; a fresh FC head produces the binary softmax. Backbone frozen, head fine-tuned.",
                    meta: [
                      {
                        label: "Pretrain",
                        value: "tsn_r50_1x1x3_100e_k400",
                      },
                      { label: "Epochs", value: "20" },
                      { label: "Train time", value: "< 1 min · 1 GPU" },
                    ],
                  },
                ]}
              />

              <Figure
                number="FIG 02"
                title="Drag to reveal: SAM2 mask vs. broadcast frame"
                scale="stage 01"
                caption={
                  <>
                    The classifier never sees the left side; it sees only the
                    right. Removing the broadcast before classification
                    sidesteps the bulk of domain-shift, which the dataset is
                    too small to absorb directly. Background-removal as
                    preprocessing — not as architecture — is the single most
                    consequential design decision in the project.
                  </>
                }
              >
                <SAM2Slider />
              </Figure>

              <Figure
                number="FIG 03"
                title="TSN forward pass on one 5-frame window"
                scale="stage 03"
                caption={
                  <>
                    Sparse sampling: TSN was designed for untrimmed video, but
                    its consensus rule — average per-frame features before the
                    head — is exactly right for our 5-frame window. The model
                    is forced to pick up patterns that hold across the whole
                    strike, not single-frame artifacts.
                  </>
                }
              >
                <TSNDiagram />
              </Figure>
            </>
          }
        >
          <p>
            The system is staged so each step is independently inspectable.
            Mask quality can be audited without re-running training; classifier
            output can be re-aggregated without re-running segmentation.
          </p>
        </Section>

        {/* ───────────────────────────────  § 04 Results  ─────────────────────────────── */}
        <Section
          id="results"
          number="§ 04 · Results"
          rail={[
            {
              heading: "What this shows",
              body: "Per-window confidence on the Knockdown clip. Three real strike events sit clearly above the threshold; the rest is appropriately quiet.",
            },
            {
              heading: "What it can't show",
              body: "n = 38 means error bars are essentially the entire range. Read this as a working pipeline, not a benchmark.",
            },
          ]}
          extras={
            <>
              <KvGrid
                items={[
                  {
                    k: "val accuracy",
                    v: "0.83",
                    sub: "5 / 6 windows",
                    emphasize: true,
                  },
                  {
                    k: "peak confidence",
                    v: "0.98",
                    sub: "pressure clip · w13",
                  },
                  {
                    k: "3D CNN baseline",
                    v: "0.375",
                    sub: "majority-class",
                  },
                  {
                    k: "train time",
                    v: "< 60 s",
                    sub: "colab T4 · 20 epochs",
                  },
                ]}
              />

              <Figure
                number="FIG 04"
                title="Per-window P(strike) on Knockdown clip · interactive"
                scale={`${knockdownClip.predictions.length} windows · ${knockdownClip.totalFrames} frames · ${(knockdownClip.totalFrames / knockdownClip.fps).toFixed(1)} s`}
                caption={
                  <>
                    Each x-tick is one 5-frame window. Red dots mark
                    above-threshold local maxima; the dashed line is the 0.5
                    decision boundary. The three peaks at{" "}
                    <span className="font-mono">w3</span>,{" "}
                    <span className="font-mono">w20</span> and{" "}
                    <span className="font-mono">w35</span> correspond to the
                    left hook, the follow-up ground strike, and the referee&apos;s
                    intervention motion respectively — the model is detecting
                    all three and quieting in between.
                  </>
                }
              >
                <ConfidenceTimelineFigure clip={knockdownClip} />
              </Figure>
            </>
          }
        >
          <p>
            The plot below is the model&apos;s softmax output, window-by-window,
            on the Knockdown clip. Hover anywhere to read the underlying
            numbers.
          </p>
        </Section>

        {/* ───────────────────────────────  § 05 Failures  ─────────────────────────────── */}
        <Section
          id="failures"
          number="§ 05 · What the model gets wrong"
          rail={[
            {
              heading: "Honest limits",
              body: "One source fight. One labeler. No multi-fighter generalization claim is made.",
            },
            {
              heading: "Recurring patterns",
              body: "Clinch breaks, missed jabs, and strikes that straddle non-overlapping windows.",
            },
          ]}
          extras={<FailGrid items={FAILURES} />}
        >
          <p>
            Three failure modes recur across the test clips. They are not
            bugs; they are the load-bearing limits of a 38-sample classifier
            with no temporal context between windows.
          </p>
        </Section>

        {/* ───────────────────────────────  § 06 Future  ─────────────────────────────── */}
        <Section
          id="future"
          number="§ 06 · What ten times the data would change"
          rail={[
            {
              heading: "Bottleneck",
              body: "Labeled windows. Everything else is configured.",
            },
            {
              heading: "Order of operations",
              body: "1 · more annotation. 2 · multi-class. 3 · sliding windows. 4 · multi-fight.",
            },
          ]}
        >
          <p>
            The 0.83 number is a ceiling against the 38-window dataset, not
            against the task. The path from here is unglamorous:{" "}
            <strong>more annotation</strong>. Even 200–500 windows would be
            transformative. With ML-assisted propagation the same weekend
            yields ~10× the data.
          </p>
          <p>
            Beyond volume, three structural changes are queued.{" "}
            <strong>Multi-class labels</strong> (jab, cross, hook, kick,
            elbow, knee, takedown) make the output useful for fight analytics,
            not just highlight detection.{" "}
            <strong>Overlapping sliding windows</strong> recover strikes that
            currently fragment across the boundary at{" "}
            <span className="font-mono">w14/w15</span>.{" "}
            <strong>Multi-fight, multi-fighter</strong> training breaks the
            implicit overfit to Topuria&apos;s stance and Holloway&apos;s
            volume.
          </p>
        </Section>

        {/* ───────────────────────────────  § 07 Reproducibility  ─────────────────────────────── */}
        <Section
          id="repro"
          number="§ 07 · Reproducibility"
          rail={[
            {
              heading: "Stack",
              body: "MMAction2 · PyTorch · SAM2 · Label Studio",
            },
            {
              heading: "Hardware",
              body: "Single Colab T4 (free tier)",
            },
            {
              heading: "Determinism",
              body: "Seed 42 · cudnn benchmark off",
            },
          ]}
          extras={
            <>
              <CodeBlock>
                <Code.comment>
                  # annotations/train.txt — MMAction2 RawframeDataset format
                </Code.comment>
                {"\n"}
                <Code.comment>
                  {"# <folder> <n_frames> <class_label>   (0 = neutral, 1 = strike)"}
                </Code.comment>
                {"\n\n"}
                {"strike/0  5 1\n"}
                {"strike/1  5 1\n"}
                {"neutral/0 5 0\n"}
                {"neutral/1 5 0\n"}
                <Code.comment>...</Code.comment>
                {"\n\n"}
                <Code.comment># inference (per clip)</Code.comment>
                {"\n"}
                <Code.keyword>from</Code.keyword>
                {" mmaction.apis "}
                <Code.keyword>import</Code.keyword>
                {" inference_recognizer, init_recognizer\n\n"}
                {"model  = init_recognizer("}
                <Code.string>{"'configs/tsn_r50_strike.py'"}</Code.string>
                {", "}
                <Code.string>{"'work_dirs/best.pth'"}</Code.string>
                {")\n"}
                {"result = inference_recognizer(model, "}
                <Code.string>{"'window_w20.mp4'"}</Code.string>
                {")\n"}
                <Code.comment>
                  # result.pred_score → tensor([0.04, 0.96])  →  STRIKE @ 0.96
                </Code.comment>
              </CodeBlock>

              <SpecTable
                rows={[
                  {
                    setting: "backbone",
                    value: "ResNet-50",
                    notes:
                      "ImageNet → Kinetics-400 → frozen during fine-tune",
                  },
                  {
                    setting: "checkpoint",
                    value: "tsn_r50_1x1x3_100e_kinetics400_rgb",
                    notes: "OpenMMLab model zoo",
                  },
                  {
                    setting: "input",
                    value: "5 × 224 × 224 RGB",
                    notes: "center crop · ImageNet norm",
                  },
                  {
                    setting: "head",
                    value: "FC 2048 → 2 · softmax",
                    notes: "only learnable parameters",
                  },
                  {
                    setting: "optimizer",
                    value: "SGD · lr 0.001 · momentum 0.9",
                    notes: "linear warmup · cosine decay",
                  },
                  {
                    setting: "epochs",
                    value: "20",
                    notes: "val acc converged by epoch 9",
                  },
                  {
                    setting: "data format",
                    value: "RawframeDataset",
                    notes: "JPEG sequences, not video files",
                  },
                ]}
              />
            </>
          }
        >
          <p>
            The annotation format is intentionally simple. Each line in{" "}
            <span className="font-mono">train.txt</span> is a folder, a frame
            count, and an integer class label — readable by MMAction2&apos;s
            RawframeDataset out of the box.
          </p>
        </Section>

        {/* ───────────────────────────────  § 08 Live inference  ─────────────────────────────── */}
        <section
          id="demo"
          className="border-b border-rule pb-22 pt-22"
        >
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-red-600">
            § 08 · Live inference
          </div>
          <h2 className="mb-7 max-w-[720px] font-serif text-[clamp(28px,3.5vw,40px)] font-normal leading-[1.15] tracking-[-0.01em] text-ink">
            The model, running on three held-out clips.
          </h2>
          <DemoPlayer clips={researchClips} />
        </section>

        {/* ───────────────────────────────  § 09 Try it  ─────────────────────────────── */}
        <section id="try" className="border-b border-rule py-22">
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-red-600">
            § 09 · Try it
          </div>
          <h2 className="mb-7 max-w-[720px] font-serif text-[clamp(28px,3.5vw,40px)] font-normal leading-[1.15] tracking-[-0.01em] text-ink">
            Run the pipeline on a clip you choose.
          </h2>
          <div className="max-w-[760px]">
            <Upload />
          </div>
        </section>

        {/* ───────────────────────────────  Footer  ─────────────────────────────── */}
        <footer className="py-14 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <span>STR1KE · technical preview · MMXXVI</span>
            <span className="font-serif text-[12px] italic normal-case tracking-normal">
              Built by{" "}
              <a
                href="https://thomasou.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-red-600"
              >
                Thomas Ou
              </a>
            </span>
            <span className="flex gap-4">
              <a
                href="https://github.com/Smokeybear10"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-red-600"
              >
                github
              </a>
              <span aria-hidden>·</span>
              <a
                href="https://www.linkedin.com/in/thomasou0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-red-600"
              >
                linkedin
              </a>
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
