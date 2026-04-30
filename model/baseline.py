import csv
import hashlib
import json
import math
import os
import platform
import random
import subprocess
from itertools import groupby
from pathlib import Path

import numpy as np
import PIL
import torch
import torchvision
from PIL import Image
from torch import nn
from torchvision.models import ResNet50_Weights, resnet50


ARCHITECTURE = "resnet50_frozen_frame_average_linear"
PREPROCESS = {
    "frames": 5,
    "resize_short_edge": 256,
    "center_crop": 224,
    "interpolation": "bilinear",
    "antialias": True,
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225],
}


class FrameAverageBaseline(nn.Module):
    def __init__(self, weights: str = "imagenet1k_v1") -> None:
        super().__init__()
        if weights not in {"imagenet1k_v1", "none"}:
            raise ValueError(f"Unknown backbone weights: {weights}")
        pretrained = ResNet50_Weights.IMAGENET1K_V1 if weights == "imagenet1k_v1" else None
        self.backbone = resnet50(weights=pretrained)
        self.backbone.fc = nn.Identity()
        self.backbone.requires_grad_(False)
        self.head = nn.Linear(2048, 2)
        self.backbone.eval()

    def train(self, mode: bool = True) -> "FrameAverageBaseline":
        super().train(mode)
        self.backbone.eval()
        return self

    def encode(self, frames: torch.Tensor) -> torch.Tensor:
        batch_size, frame_count = frames.shape[:2]
        with torch.no_grad():
            features = self.backbone(frames.flatten(0, 1))
        return features.reshape(batch_size, frame_count, -1).mean(dim=1)

    def forward(self, frames: torch.Tensor) -> torch.Tensor:
        return self.head(self.encode(frames))


def configure_runtime(seed: int, device: str, threads: int) -> torch.device:
    os.environ.setdefault("CUBLAS_WORKSPACE_CONFIG", ":4096:8")
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.set_num_threads(threads)
    torch.use_deterministic_algorithms(True)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True
    if device == "cuda" and not torch.cuda.is_available():
        raise ValueError("CUDA was requested but is not available; use --device cpu")
    return torch.device(device)


def environment() -> dict:
    root = Path(__file__).resolve().parents[1]
    git = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True
    )
    status = subprocess.run(
        ["git", "status", "--porcelain"], cwd=root, capture_output=True, text=True
    )
    return {
        "python": platform.python_version(),
        "platform": platform.platform(),
        "torch": str(torch.__version__),
        "torchvision": str(torchvision.__version__),
        "numpy": np.__version__,
        "pillow": PIL.__version__,
        "git_commit": git.stdout.strip() if git.returncode == 0 else None,
        "git_dirty": bool(status.stdout) if status.returncode == 0 else None,
        "source_sha256": {
            path.name: hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(Path(__file__).parent.glob("*.py"))
        },
    }


def extract_features(
    model: FrameAverageBaseline, examples: list[dict], device: torch.device, batch_size: int
) -> tuple[torch.Tensor, torch.Tensor]:
    transform = ResNet50_Weights.IMAGENET1K_V1.transforms()
    features = []
    model.eval()
    for start in range(0, len(examples), batch_size):
        batch = examples[start : start + batch_size]
        clips = []
        for example in batch:
            frames = []
            for frame_path in example["frame_paths"]:
                with Image.open(frame_path) as image:
                    frames.append(transform(image.convert("RGB")))
            clips.append(torch.stack(frames))
        with torch.no_grad():
            features.append(model.encode(torch.stack(clips).to(device)).cpu())
    labels = torch.tensor([example["label"] for example in examples], dtype=torch.long)
    return torch.cat(features), labels


def predict(head: nn.Module, features: torch.Tensor) -> list[float]:
    head.eval()
    with torch.no_grad():
        return head(features).softmax(dim=1)[:, 1].tolist()


def binary_metrics(labels: list[int], probabilities: list[float], threshold: float = 0.5) -> dict:
    if not labels or len(labels) != len(probabilities):
        raise ValueError("Metrics require equally sized, nonempty labels and predictions")
    if any(label not in {0, 1} for label in labels):
        raise ValueError("Labels must be binary")
    if any(not math.isfinite(p) or not 0 <= p <= 1 for p in probabilities):
        raise ValueError("Probabilities must be finite values between 0 and 1")
    if not math.isfinite(threshold) or not 0 < threshold < 1:
        raise ValueError("Threshold must be between 0 and 1")
    predictions = [int(p >= threshold) for p in probabilities]
    tp = sum(y == 1 and p == 1 for y, p in zip(labels, predictions))
    tn = sum(y == 0 and p == 0 for y, p in zip(labels, predictions))
    fp = sum(y == 0 and p == 1 for y, p in zip(labels, predictions))
    fn = sum(y == 1 and p == 0 for y, p in zip(labels, predictions))
    positives = tp + fn
    negatives = tn + fp
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / positives if positives else None
    specificity = tn / negatives if negatives else None

    ranked = sorted(zip(probabilities, labels), reverse=True)
    seen_positive = seen = 0
    ap = 0.0
    for _, group in groupby(ranked, key=lambda item: item[0]):
        tied = [label for _, label in group]
        found = sum(tied)
        seen_positive += found
        seen += len(tied)
        ap += found * seen_positive / seen

    clipped = [min(1 - 1e-7, max(1e-7, p)) for p in probabilities]
    return {
        "n_clips": len(labels),
        "positive_clips": positives,
        "negative_clips": negatives,
        "threshold": threshold,
        "accuracy": (tp + tn) / len(labels),
        "precision": precision,
        "recall": recall,
        "specificity": specificity,
        "balanced_accuracy": (recall + specificity) / 2 if positives and negatives else None,
        "f1": 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else None,
        "average_precision": ap / positives if positives else None,
        "log_loss": -sum(y * math.log(p) + (1 - y) * math.log(1 - p) for y, p in zip(labels, clipped)) / len(labels),
        "brier_score": sum((p - y) ** 2 for y, p in zip(labels, probabilities)) / len(labels),
        "confusion_matrix": {"labels": [0, 1], "rows_true_columns_predicted": [[tn, fp], [fn, tp]]},
    }


def prediction_report(examples: list[dict], probabilities: list[float], threshold: float) -> dict:
    labels = [example["label"] for example in examples]
    fights = sorted({example.get("fight_id") or "unknown" for example in examples})
    per_fight = {}
    for fight in fights:
        indices = [i for i, example in enumerate(examples) if (example.get("fight_id") or "unknown") == fight]
        per_fight[fight] = binary_metrics([labels[i] for i in indices], [probabilities[i] for i in indices], threshold)
    return {"overall": binary_metrics(labels, probabilities, threshold), "by_fight": per_fight}


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + "\n")


def write_predictions(path: Path, examples: list[dict], probabilities: list[float], variant: str, threshold: float) -> None:
    with path.open("w", newline="") as handle:
        columns = ["clip_id", "fight_id", "split", "variant", "label", "probability_strike", "predicted_label"]
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for example, probability in zip(examples, probabilities):
            writer.writerow({
                "clip_id": example["clip_id"], "fight_id": example.get("fight_id"),
                "split": example["split"], "variant": variant, "label": example["label"],
                "probability_strike": probability, "predicted_label": int(probability >= threshold),
            })
