import argparse
import copy
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

import torch
from torch import nn

from .baseline import (
    ARCHITECTURE, PREPROCESS, FrameAverageBaseline, configure_runtime,
    environment, extract_features, predict, prediction_report, write_json, write_predictions,
)
from .data import audit_manifest, load_manifest, read_examples


def train(args: argparse.Namespace) -> dict:
    if args.epochs < 1 or args.batch_size < 1 or args.threads < 1:
        raise ValueError("Epochs, batch size and threads must be positive")
    if not math.isfinite(args.learning_rate) or args.learning_rate <= 0:
        raise ValueError("Learning rate must be positive and finite")
    if not 0 <= args.seed < 2**32:
        raise ValueError("Seed must be between 0 and 2**32 - 1")
    if args.weights == "none" and not args.development:
        raise ValueError("Random weights are only supported for --development smoke runs")
    audit = audit_manifest(args.manifest, args.data_root, args.variant, not args.development)
    if not audit["valid"]:
        raise ValueError("Dataset audit failed:\n" + "\n".join(audit["errors"]))
    train_split = "development" if args.development else "train"
    training = read_examples(args.manifest, args.data_root, train_split, args.variant)
    validation = [] if args.development else read_examples(args.manifest, args.data_root, "val", args.variant)
    if not training or (not args.development and not validation):
        raise ValueError("Training requires nonempty train and val splits, or development clips with --development")
    if not args.development and {example["label"] for example in training} != {0, 1}:
        raise ValueError("The training split must contain both labels")
    args.output.mkdir(parents=True, exist_ok=False)
    device = configure_runtime(args.seed, args.device, args.threads)
    config = {
        "format_version": 1,
        "status": "running",
        "purpose": "development_smoke" if args.development else "research",
        "architecture": ARCHITECTURE,
        "weights": args.weights,
        "backbone_frozen": True,
        "frame_order_sensitive": False,
        "preprocess": PREPROCESS,
        "threshold": 0.5,
        "variant": args.variant,
        "seed": args.seed,
        "device": args.device,
        "threads": args.threads,
        "dataset_fingerprint": audit["dataset_fingerprint"],
        "manifest_sha256": audit["manifest_sha256"],
        "training": {
            "epochs": args.epochs, "learning_rate": args.learning_rate,
            "batch_size": args.batch_size, "optimizer": "Adam", "weight_decay": 0,
        },
        "selection_metric": "training_loss_diagnostic_only" if args.development else "validation_loss",
        "training_clip_ids": [example["clip_id"] for example in training],
        "validation_clip_ids": [example["clip_id"] for example in validation],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "environment": environment(),
    }
    write_json(args.output / "config.json", config)
    write_json(args.output / "audit.json", audit)
    write_json(args.output / "manifest.json", load_manifest(args.manifest))
    model = FrameAverageBaseline(args.weights).to(device)
    config["trainable_parameters"] = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Extracting {args.variant} features for {len(training)} training and {len(validation)} validation clips", flush=True)
    train_features, train_labels = extract_features(model, training, device, args.batch_size)
    if validation:
        val_features, val_labels = extract_features(model, validation, device, args.batch_size)
    else:
        val_features, val_labels = train_features, train_labels
    # The frozen encoder runs once; head optimization stays on CPU for repeatability.
    head = model.head.cpu()
    optimizer = torch.optim.Adam(head.parameters(), lr=args.learning_rate)
    criterion = nn.CrossEntropyLoss()
    history = []
    best_loss = float("inf")
    best_state = None
    generator = torch.Generator().manual_seed(args.seed)
    for epoch in range(1, args.epochs + 1):
        head.train()
        order = torch.randperm(len(training), generator=generator)
        for start in range(0, len(training), args.batch_size):
            indices = order[start : start + args.batch_size]
            optimizer.zero_grad()
            loss = criterion(head(train_features[indices]), train_labels[indices])
            loss.backward()
            optimizer.step()
        head.eval()
        with torch.no_grad():
            train_logits = head(train_features)
            val_logits = head(val_features)
            train_loss = criterion(train_logits, train_labels).item()
            val_loss = criterion(val_logits, val_labels).item()
            train_acc = (train_logits.argmax(dim=1) == train_labels).float().mean().item()
            val_acc = (val_logits.argmax(dim=1) == val_labels).float().mean().item()
        if not math.isfinite(train_loss) or not math.isfinite(val_loss):
            raise ValueError("Training produced nonfinite loss; this run is incomplete")
        history.append({
            "epoch": epoch, "train_loss": train_loss, "train_accuracy": train_acc,
            "val_loss": val_loss if validation else None,
            "val_accuracy": val_acc if validation else None,
        })
        write_json(args.output / "history.json", history)
        if val_loss < best_loss:
            best_loss = val_loss
            best_state = copy.deepcopy(head.state_dict())
            config["selected_epoch"] = epoch
        label = "val_loss" if validation else "training_loss_diagnostic_only"
        print(f"epoch {epoch}/{args.epochs} train_loss={train_loss:.6f} {label}={val_loss:.6f}", flush=True)
    head.load_state_dict(best_state)
    final_audit = audit_manifest(args.manifest, args.data_root, args.variant, not args.development)
    if not final_audit["valid"] or final_audit["dataset_fingerprint"] != config["dataset_fingerprint"]:
        raise ValueError("Dataset changed during training; this run is incomplete")
    config["status"] = "complete"
    config["completed_at"] = datetime.now(timezone.utc).isoformat()
    checkpoint = args.output / "best.pt"
    torch.save({
        "format_version": 1, "config": config,
        "model_state": {name: value.detach().cpu() for name, value in model.state_dict().items()},
    }, checkpoint)
    checkpoint_hash = hashlib.sha256(checkpoint.read_bytes()).hexdigest()
    config_hash = hashlib.sha256(json.dumps(config, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    for name, examples, features in [
        ("training", training, train_features), ("validation", validation, val_features)
    ]:
        if not examples:
            continue
        probabilities = predict(head, features)
        predictions_path = args.output / f"{name}_predictions.csv"
        write_predictions(predictions_path, examples, probabilities, args.variant, config["threshold"])
        report = {
            "purpose": config["purpose"], "split": examples[0]["split"], "variant": args.variant,
            "dataset_fingerprint": config["dataset_fingerprint"],
            "manifest_sha256": config["manifest_sha256"],
            "checkpoint_sha256": checkpoint_hash, "threshold": config["threshold"],
            "configuration_sha256": config_hash,
            "predictions_sha256": hashlib.sha256(predictions_path.read_bytes()).hexdigest(),
            "selected_epoch": config["selected_epoch"],
            "interpretation": "Training-set diagnostic; not a holdout estimate" if name == "training" else "Used for model selection; not an independent test estimate",
            **prediction_report(examples, probabilities, config["threshold"]),
        }
        write_json(args.output / f"{name}_metrics.json", report)
    write_json(args.output / "config.json", config)
    return config


def main() -> None:
    parser = argparse.ArgumentParser(description="Train a frozen ImageNet appearance baseline; keep test fights untouched.")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--data-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="New run directory; existing directories are refused")
    parser.add_argument("--variant", choices=["raw", "masked"], default="raw")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--learning-rate", type=float, default=0.001)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--weights", choices=["imagenet1k_v1", "none"], default="imagenet1k_v1")
    parser.add_argument("--development", action="store_true", help="Only train on development clips; all scores are training-set diagnostics")
    args = parser.parse_args()
    try:
        result = train(args)
    except (ValueError, FileNotFoundError, FileExistsError) as error:
        parser.exit(2, f"{error}\n")
    print(f"Saved {result['purpose']} run to {args.output}. Selected epoch: {result['selected_epoch']}")


if __name__ == "__main__":
    main()
