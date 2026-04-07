#!/usr/bin/env python3
"""
SAM2 Video Segmentation Pipeline for STR1KE

Uses SAM2's video predictor with hard-coded point prompts on each fighter,
then propagates masks through all frames for temporal consistency.

Setup:
    cd showcase
    source .venv/bin/activate
    pip install torch torchvision pillow numpy sam2

Usage:
    python3 scripts/sam2_overlay.py                    # all clips
    python3 scripts/sam2_overlay.py --clip knockdown   # one clip
    python3 scripts/sam2_overlay.py --preview          # frame 0 only, all clips
"""

import argparse
import shutil
import sys
import tempfile
import time
from pathlib import Path

import numpy as np
import torch
from PIL import Image

ROOT = Path(__file__).parent.parent
CLIPS_DIR = ROOT / "public" / "clips"
CHECKPOINTS_DIR = ROOT / "checkpoints"
ALL_CLIPS = ["knockdown", "exchange", "pressure"]

# Hard-coded point prompts per clip (x, y on 960x540 frames)
# Multiple points per fighter for robust initial segmentation
CLIP_PROMPTS = {
    "knockdown": {
        # Fighter 1: Herbert (left, back to camera)
        1: [[370, 200], [360, 290], [380, 360]],
        # Fighter 2: Topuria (right, facing camera)
        2: [[570, 150], [580, 250], [560, 330]],
    },
    "exchange": {
        # Fighter 1: left, throwing kick (centered ~x=410)
        1: [[400, 90], [420, 220], [410, 340]],
        # Fighter 2: right, absorbing (centered ~x=780)
        2: [[780, 140], [790, 240], [780, 340]],
    },
    "pressure": {
        # Fighter 1: left (centered ~x=360)
        1: [[370, 130], [360, 250], [340, 360]],
        # Fighter 2: right, Topuria (centered ~x=540)
        2: [[530, 150], [550, 260], [560, 360]],
    },
}

SEGMENT_COLORS = {
    1: np.array([220, 38, 38], dtype=np.float32),   # STR1KE red
    2: np.array([59, 130, 246], dtype=np.float32),   # Blue
}


def get_device():
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def dilate_mask(mask: np.ndarray, iterations: int = 3) -> np.ndarray:
    """Binary dilation using shifts. No scipy needed."""
    result = mask.copy()
    for _ in range(iterations):
        padded = np.pad(result, 1, mode="constant", constant_values=False)
        result = (
            padded[1:-1, 1:-1]
            | padded[:-2, 1:-1]
            | padded[2:, 1:-1]
            | padded[1:-1, :-2]
            | padded[1:-1, 2:]
        )
    return result


def create_overlay(image: np.ndarray, masks: dict[int, np.ndarray]) -> np.ndarray:
    """
    Overlay fighter masks on darkened/desaturated background.
    Each fighter gets a distinct color with edge glow.
    """
    result = image.astype(np.float32)
    gray = np.mean(result, axis=2, keepdims=True)
    composite = result * 0.25 + gray * 0.15

    for obj_id, mask in masks.items():
        color = SEGMENT_COLORS.get(obj_id, np.array([255, 255, 255], dtype=np.float32))

        # Semi-transparent color fill
        for c in range(3):
            composite[:, :, c] = np.where(
                mask,
                result[:, :, c] * 0.6 + color[c] * 0.4,
                composite[:, :, c],
            )

        # Edge glow
        dilated = dilate_mask(mask, iterations=3)
        edge = dilated & ~mask
        for c in range(3):
            composite[:, :, c] = np.where(edge, color[c] * 0.9, composite[:, :, c])

    return np.clip(composite, 0, 255).astype(np.uint8)


def process_clip(predictor, clip_name: str, device: str, preview: bool = False):
    """Process a clip using SAM2 video predictor with hard-coded prompts."""
    input_dir = CLIPS_DIR / clip_name
    output_dir = CLIPS_DIR / f"{clip_name}-masked"
    output_dir.mkdir(exist_ok=True)

    prompts = CLIP_PROMPTS[clip_name]
    frames = sorted(input_dir.glob("img_*.jpg"))
    total = len(frames)

    print(f"\n{'Preview' if preview else 'Processing'} {clip_name}: {total} frames")
    print(f"  Prompts: {len(prompts)} fighters")

    # SAM2 video predictor expects numeric filenames (00000.jpg, 00001.jpg, ...)
    # Create temp dir with symlinks
    tmp_dir = tempfile.mkdtemp(prefix=f"sam2_{clip_name}_")
    for i, f in enumerate(frames):
        (Path(tmp_dir) / f"{i:05d}.jpg").symlink_to(f.resolve())

    # Initialize video state
    print("  Initializing video predictor...")
    with torch.inference_mode():
        state = predictor.init_state(video_path=tmp_dir)

        # Add point prompts for each fighter on frame 0
        for obj_id, points in prompts.items():
            predictor.add_new_points_or_box(
                inference_state=state,
                frame_idx=0,
                obj_id=obj_id,
                points=np.array(points, dtype=np.float32),
                labels=np.ones(len(points), dtype=np.int32),
            )
            print(f"  Fighter {obj_id}: {len(points)} prompt points")

        # Propagate through all frames
        print("  Propagating masks...")
        t0 = time.time()
        frame_masks: dict[int, dict[int, np.ndarray]] = {}

        for frame_idx, obj_ids, masks in predictor.propagate_in_video(state):
            per_obj = {}
            for i, obj_id in enumerate(obj_ids):
                mask = (masks[i, 0] > 0.0).cpu().numpy()
                per_obj[obj_id] = mask
            frame_masks[frame_idx] = per_obj

            if preview and frame_idx == 0:
                break

        propagate_time = time.time() - t0
        print(f"  Propagation done in {propagate_time:.1f}s")

    # Render overlays
    print("  Rendering overlays...")
    t0 = time.time()
    rendered = 0

    for frame_idx in sorted(frame_masks.keys()):
        frame_path = frames[frame_idx]
        image = np.array(Image.open(frame_path).convert("RGB"))
        overlay = create_overlay(image, frame_masks[frame_idx])

        out_path = output_dir / frame_path.name
        Image.fromarray(overlay).save(out_path, quality=90)
        rendered += 1

        if rendered % 20 == 0:
            elapsed = time.time() - t0
            print(f"  {rendered}/{len(frame_masks)} rendered ({elapsed:.1f}s)")

    elapsed = time.time() - t0
    print(f"  Rendered {rendered} frames in {elapsed:.1f}s → {output_dir}/")

    # Cleanup temp dir
    shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(description="SAM2 video overlay for STR1KE")
    parser.add_argument("--clip", choices=ALL_CLIPS, help="Process one clip")
    parser.add_argument("--preview", action="store_true", help="Frame 0 only")
    args = parser.parse_args()

    try:
        from sam2.build_sam import build_sam2_video_predictor  # noqa
    except ImportError:
        print("Missing sam2. Run: pip install sam2")
        sys.exit(1)

    device = get_device()
    clips = [args.clip] if args.clip else ALL_CLIPS

    # Check checkpoint
    ckpt = CHECKPOINTS_DIR / "sam2.1_hiera_tiny.pt"
    if not ckpt.exists():
        print(f"Checkpoint not found: {ckpt}")
        print("Run: curl -L -o checkpoints/sam2.1_hiera_tiny.pt https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_tiny.pt")
        sys.exit(1)

    print("=" * 50)
    print("STR1KE · SAM2 Video Predictor Pipeline")
    print("=" * 50)
    print(f"Device:  {device}")
    print(f"Clips:   {', '.join(clips)}")
    print()

    # Load model once
    print("Loading SAM2 video predictor...")
    predictor = build_sam2_video_predictor(
        "configs/sam2.1/sam2.1_hiera_t.yaml",
        str(ckpt),
        device=device,
    )

    for clip in clips:
        process_clip(predictor, clip, device, args.preview)

    print()
    print("Done! Masked frames saved to:")
    for clip in clips:
        print(f"  public/clips/{clip}-masked/")


if __name__ == "__main__":
    main()
