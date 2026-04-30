import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image
import torch
from torchvision.models import ResNet50_Weights

from .annotations import file_sha256, read_annotations
from .baseline import ARCHITECTURE, PREPROCESS, FrameAverageBaseline, configure_runtime, environment
from .data import _frame_path


def read_prepared(directory: Path) -> tuple[dict, list[dict], str]:
    annotations, annotation_bytes = read_annotations(directory / "annotations.json")
    review_bytes = (directory / "review.json").read_bytes()
    review = json.loads(review_bytes)
    json.dumps(review, allow_nan=False)
    if not isinstance(review, dict) or type(review.get("schema_version")) is not int or review["schema_version"] != 1 or review.get("kind") != "strike_prepared" or review.get("status") != "complete":
        raise ValueError("Expected a completed prepared dataset in --prepared")
    if review.get("annotation_sha256") != hashlib.sha256(annotation_bytes).hexdigest():
        raise ValueError("Annotations changed after preparation; prepare the updated export again")
    for field in ("project_id", "fight_id", "source"):
        if review.get(field) != annotations[field]:
            raise ValueError(f"Prepared {field} differs from the annotation export")
    records = review.get("clips")
    if not isinstance(records, list) or len(records) != len(annotations["clips"]):
        raise ValueError("Prepared clips do not match the annotation export")
    hashes = review.get("frame_sha256")
    if not isinstance(hashes, dict):
        raise ValueError("Prepared dataset is missing its frame hashes")
    examples = []
    used_paths = set()
    for record, original in zip(records, annotations["clips"]):
        if not isinstance(record, dict) or any(record.get(field) != value for field, value in original.items()):
            raise ValueError("Prepared clip annotations changed; prepare the export again")
        frames = record.get("frames")
        if not isinstance(frames, list) or len(frames) != 5 or not all(isinstance(path, str) for path in frames) or len(set(frames)) != 5:
            raise ValueError(f"{record['clip_id']}: expected five distinct ordered frame paths")
        paths = [_frame_path(directory, relative) for relative in frames]
        if len(set(paths)) != 5:
            raise ValueError(f"{record['clip_id']}: frame paths alias the same file")
        sizes = set()
        for relative, path in zip(frames, paths):
            if hashes.get(relative) != file_sha256(path):
                raise ValueError(f"Prepared frame changed or is missing a hash: {relative}")
            with Image.open(path) as image:
                image.load()
                sizes.add(image.size)
            used_paths.add(relative)
        if len(sizes) != 1:
            raise ValueError(f"{record['clip_id']}: frame dimensions differ")
        examples.append({**record, "frame_paths": paths})
    if used_paths != set(hashes):
        raise ValueError("Prepared frame inventory differs from its hash record")
    return review, examples, hashlib.sha256(review_bytes).hexdigest()


def read_checkpoint(run: Path) -> tuple[dict, dict, str]:
    raw = (run / "best.pt").read_bytes()
    checkpoint_hash = hashlib.sha256(raw).hexdigest()
    checkpoint = torch.load(io.BytesIO(raw), map_location="cpu", weights_only=True)
    del raw
    if not isinstance(checkpoint, dict) or checkpoint.get("format_version") != 1:
        raise ValueError("Unsupported checkpoint format")
    config = checkpoint.get("config")
    if not isinstance(config, dict) or config.get("status") != "complete" or config.get("purpose") not in {"research", "development_smoke"}:
        raise ValueError("Prediction requires a completed research or development checkpoint")
    if config.get("variant") != "raw":
        raise ValueError("The annotation workspace prepares raw frames; use a raw checkpoint")
    if config.get("architecture") != ARCHITECTURE or config.get("preprocess") != PREPROCESS:
        raise ValueError("Checkpoint architecture or preprocessing differs from this predictor")
    if json.loads((run / "config.json").read_text()) != config:
        raise ValueError("Run configuration differs from the checkpoint")
    record_name = "validation_metrics.json" if config["purpose"] == "research" else "training_metrics.json"
    record = json.loads((run / record_name).read_text())
    config_hash = hashlib.sha256(json.dumps(config, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    expected = {
        "checkpoint_sha256": checkpoint_hash, "configuration_sha256": config_hash,
        "purpose": config["purpose"], "variant": "raw", "threshold": config["threshold"],
        "split": "val" if config["purpose"] == "research" else "development",
        "dataset_fingerprint": config["dataset_fingerprint"],
        "manifest_sha256": config["manifest_sha256"], "selected_epoch": config["selected_epoch"],
    }
    if not isinstance(record, dict) or any(record.get(field) != value for field, value in expected.items()):
        raise ValueError("Checkpoint or configuration differs from its original training record")
    current = environment()
    for filename in ("baseline.py", "data.py"):
        if current["source_sha256"].get(filename) != config["environment"]["source_sha256"].get(filename):
            raise ValueError(f"{filename} changed since training; restore the recorded implementation")
    for package in ("torch", "torchvision", "numpy", "pillow"):
        if current[package] != config["environment"].get(package):
            raise ValueError(f"{package} differs from the training environment")
    return checkpoint, config, checkpoint_hash


def predict(args: argparse.Namespace) -> dict:
    if args.batch_size < 1 or args.threads < 1:
        raise ValueError("Batch size and threads must be positive")
    review, examples, prepared_hash = read_prepared(args.prepared)
    checkpoint, config, checkpoint_hash = read_checkpoint(args.run)
    args.output.mkdir(parents=True, exist_ok=False)
    device = configure_runtime(config["seed"], args.device, args.threads)
    model = FrameAverageBaseline("none")
    model.load_state_dict(checkpoint["model_state"], strict=True)
    model.to(device).eval()
    transform = ResNet50_Weights.IMAGENET1K_V1.transforms()
    predictions = []
    for start in range(0, len(examples), args.batch_size):
        batch = examples[start : start + args.batch_size]
        windows = []
        for example in batch:
            frames = []
            for path in example["frame_paths"]:
                with Image.open(path) as image:
                    frames.append(transform(image.convert("RGB")))
            windows.append(torch.stack(frames))
        with torch.no_grad():
            probabilities = model(torch.stack(windows).to(device)).softmax(dim=1)[:, 1].cpu().tolist()
        for example, probability in zip(batch, probabilities):
            predictions.append({
                "clip_id": example["clip_id"], "start_time_s": example["start_time_s"],
                "end_time_s": example["end_time_s"], "probability_strike": probability,
            })
    _, _, final_prepared_hash = read_prepared(args.prepared)
    if final_prepared_hash != prepared_hash:
        raise ValueError("Prepared dataset changed during prediction; this run is incomplete")
    result = {
        "schema_version": 1, "kind": "strike_predictions", "project_id": review["project_id"],
        "source_sha256": review["source"]["sha256"],
        "model": {"name": args.run.name, "purpose": config["purpose"], "variant": "raw",
                  "checkpoint_sha256": checkpoint_hash, "threshold": config["threshold"]},
        "predictions": predictions,
    }
    output = args.output / "predictions.json"
    output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
    provenance = {
        "purpose": "annotation_review", "prepared_sha256": prepared_hash,
        "predictions_sha256": file_sha256(output), "checkpoint_sha256": checkpoint_hash,
        "training_purpose": config["purpose"], "environment": environment(),
        "execution": {"device": args.device, "batch_size": args.batch_size, "threads": args.threads},
        "interpretation": "Real checkpoint scores for human annotation review, not an independent benchmark. No ground-truth labels are invented for uncertain or unreviewed clips. Model-assisted annotations remain development data.",
    }
    (args.output / "provenance.json").write_text(json.dumps(provenance, indent=2, allow_nan=False) + "\n")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a saved raw checkpoint on prepared annotation windows for human review, without benchmark metrics.")
    parser.add_argument("--prepared", type=Path, required=True)
    parser.add_argument("--run", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="New directory for predictions.json and provenance.json")
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cpu")
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--threads", type=int, default=4)
    args = parser.parse_args()
    try:
        result = predict(args)
    except (OSError, ValueError, KeyError) as error:
        parser.exit(2, f"{error}\n")
    print(json.dumps({"predictions": len(result["predictions"]), "model_purpose": result["model"]["purpose"], "output": str(args.output / "predictions.json")}))


if __name__ == "__main__":
    main()
