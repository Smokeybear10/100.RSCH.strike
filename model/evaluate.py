import argparse
import hashlib
import io
import json
from pathlib import Path

import torch

from .baseline import (
    ARCHITECTURE, PREPROCESS, FrameAverageBaseline, configure_runtime, environment,
    extract_features, predict, prediction_report, write_json, write_predictions,
)
from .data import audit_manifest, read_examples


def evaluate(args: argparse.Namespace) -> dict:
    if args.batch_size < 1 or args.threads < 1:
        raise ValueError("Batch size and threads must be positive")
    checkpoint_path = args.run / "best.pt"
    checkpoint_bytes = checkpoint_path.read_bytes()
    checkpoint_hash = hashlib.sha256(checkpoint_bytes).hexdigest()
    checkpoint = torch.load(io.BytesIO(checkpoint_bytes), map_location="cpu", weights_only=True)
    del checkpoint_bytes
    if checkpoint.get("format_version") != 1:
        raise ValueError("Unsupported checkpoint format")
    config = checkpoint["config"]
    if config.get("purpose") != "research" or config.get("status") != "complete":
        raise ValueError("Test evaluation requires a completed research checkpoint, not a development run")
    if config["architecture"] != ARCHITECTURE or config["preprocess"] != PREPROCESS:
        raise ValueError("Checkpoint architecture or preprocessing does not match this evaluator")
    recorded = json.loads((args.run / "config.json").read_text())
    if recorded != config:
        raise ValueError("Run config differs from the configuration stored inside the checkpoint")
    config_hash = hashlib.sha256(json.dumps(config, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    training_record = json.loads((args.run / "validation_metrics.json").read_text())
    if not isinstance(training_record, dict) or training_record.get("checkpoint_sha256") != checkpoint_hash:
        raise ValueError("Checkpoint differs from the checkpoint selected during training")
    expected_training_record = {
        "purpose": "research", "split": "val", "variant": config["variant"],
        "configuration_sha256": config_hash,
        "dataset_fingerprint": config["dataset_fingerprint"],
        "manifest_sha256": config["manifest_sha256"],
        "threshold": config["threshold"], "selected_epoch": config["selected_epoch"],
    }
    if any(training_record.get(field) != value for field, value in expected_training_record.items()):
        raise ValueError("Training validation record differs from the run configuration")
    current_environment = environment()
    for filename in ("baseline.py", "data.py"):
        if current_environment["source_sha256"].get(filename) != config["environment"]["source_sha256"].get(filename):
            raise ValueError(f"{filename} changed since training; restore the recorded implementation before evaluating")
    for package in ("torch", "torchvision", "numpy", "pillow"):
        if current_environment[package] != config["environment"].get(package):
            raise ValueError(f"{package} version differs from training; use the recorded environment")
    audit = audit_manifest(args.manifest, args.data_root, config["variant"], True)
    if not audit["valid"]:
        raise ValueError("Dataset audit failed:\n" + "\n".join(audit["errors"]))
    if audit["dataset_fingerprint"] != config["dataset_fingerprint"]:
        raise ValueError("Dataset content differs from the training manifest; do not replace the test set after training")
    if audit["manifest_sha256"] != config["manifest_sha256"]:
        raise ValueError("Manifest differs from the training manifest")
    testing = read_examples(args.manifest, args.data_root, "test", config["variant"])
    if not testing:
        raise ValueError("No test clips; reserve and label untouched fights before running a research experiment")
    used = set(config["training_clip_ids"]) | set(config["validation_clip_ids"])
    if used.intersection(example["clip_id"] for example in testing):
        raise ValueError("A test clip was used for fitting or model selection")
    output = args.output or args.run / "evaluation"
    output.mkdir(parents=True, exist_ok=False)
    device = configure_runtime(config["seed"], args.device, args.threads)
    model = FrameAverageBaseline("none")
    model.load_state_dict(checkpoint["model_state"], strict=True)
    model.to(device)
    features, _ = extract_features(model, testing, device, args.batch_size)
    probabilities = predict(model.head.cpu(), features)
    final_audit = audit_manifest(args.manifest, args.data_root, config["variant"], True)
    if not final_audit["valid"] or final_audit["dataset_fingerprint"] != config["dataset_fingerprint"]:
        raise ValueError("Dataset changed during evaluation; this evaluation is incomplete")
    predictions_path = output / "test_predictions.csv"
    write_predictions(predictions_path, testing, probabilities, config["variant"], config["threshold"])
    report = {
        "purpose": "research", "split": "test", "variant": config["variant"],
        "dataset_fingerprint": audit["dataset_fingerprint"],
        "manifest_sha256": config["manifest_sha256"],
        "checkpoint_sha256": checkpoint_hash,
        "configuration_sha256": config_hash,
        "predictions_sha256": hashlib.sha256(predictions_path.read_bytes()).hexdigest(),
        "threshold": config["threshold"], "selected_epoch": config["selected_epoch"],
        "environment": current_environment,
        "execution": {"device": args.device, "batch_size": args.batch_size, "threads": args.threads},
        "interpretation": "Fight-separated test estimate; repeated model selection against this result invalidates its holdout status",
        **prediction_report(testing, probabilities, config["threshold"]),
    }
    write_json(output / "test_metrics.json", report)
    write_json(output / "audit.json", audit)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate a completed baseline on reserved test fights exactly as trained.")
    parser.add_argument("--run", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--data-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, help="New output directory; defaults to RUN/evaluation")
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--threads", type=int, default=4)
    args = parser.parse_args()
    try:
        report = evaluate(args)
    except (ValueError, FileNotFoundError, FileExistsError) as error:
        parser.exit(2, f"{error}\n")
    print(json.dumps(report["overall"], indent=2))


if __name__ == "__main__":
    main()
