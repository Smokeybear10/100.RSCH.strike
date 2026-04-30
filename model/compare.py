import argparse
import csv
import hashlib
import io
import json
from pathlib import Path

from model.baseline import prediction_report


def read_run(run: Path, variant: str, split: str, evaluation: Path | None = None) -> tuple[dict, dict, dict]:
    config = json.loads((run / "config.json").read_text())
    if config.get("purpose") != "research" or config.get("variant") != variant or config.get("status") != "complete":
        raise ValueError(f"{run}: expected a completed research run with variant={variant}")
    if evaluation is not None and split != "test":
        raise ValueError("Custom evaluation directories apply only to the test split")
    directory = (evaluation or run / "evaluation") if split == "test" else run
    metadata = json.loads((directory / f"{split}_metrics.json").read_text())
    checkpoint_hash = hashlib.sha256((run / "best.pt").read_bytes()).hexdigest()
    config_hash = hashlib.sha256(json.dumps(config, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    training_record = json.loads((run / "validation_metrics.json").read_text())
    if training_record.get("checkpoint_sha256") != checkpoint_hash:
        raise ValueError(f"{run}: best.pt differs from the checkpoint selected during training")
    if training_record.get("configuration_sha256") != config_hash:
        raise ValueError(f"{run}: configuration differs from the training record")
    if training_record.get("purpose") != "research" or training_record.get("split") != "val" or training_record.get("variant") != variant:
        raise ValueError(f"{run}: invalid training record purpose, split or variant")
    for field in ("dataset_fingerprint", "manifest_sha256", "threshold", "selected_epoch"):
        if training_record.get(field) != config.get(field):
            raise ValueError(f"{run}: training record differs from configuration: {field}")
    if metadata.get("checkpoint_sha256") != checkpoint_hash:
        raise ValueError(f"{run}: predictions do not refer to the current best.pt")
    if metadata.get("dataset_fingerprint") != config.get("dataset_fingerprint"):
        raise ValueError(f"{run}: predictions and configuration refer to different data")
    expected_split = "val" if split == "validation" else "test"
    if metadata.get("purpose") != "research" or metadata.get("split") != expected_split or metadata.get("variant") != variant:
        raise ValueError(f"{run}: metric purpose, split or variant does not match")
    if metadata.get("threshold") != config.get("threshold"):
        raise ValueError(f"{run}: prediction threshold differs from configuration")
    if metadata.get("configuration_sha256") != config_hash:
        raise ValueError(f"{run}: configuration changed after prediction")
    prediction_path = directory / f"{split}_predictions.csv"
    prediction_bytes = prediction_path.read_bytes()
    if metadata.get("predictions_sha256") != hashlib.sha256(prediction_bytes).hexdigest():
        raise ValueError(f"{run}: predictions changed after evaluation")
    with io.StringIO(prediction_bytes.decode("utf-8"), newline="") as handle:
        rows = list(csv.DictReader(handle))
    by_clip = {}
    for row in rows:
        clip_id = row["clip_id"]
        if not clip_id or clip_id in by_clip:
            raise ValueError(f"{run}: duplicate or empty prediction clip_id")
        if row["split"] != expected_split or row["variant"] != variant:
            raise ValueError(f"{run}: prediction split or variant does not match")
        by_clip[clip_id] = {
            "clip_id": clip_id,
            "fight_id": row["fight_id"],
            "label": int(row["label"]),
            "probability": float(row["probability_strike"]),
        }
    if not by_clip:
        raise ValueError(f"{run}: no predictions")
    return config, metadata, by_clip


def compare_runs(raw: Path, masked: Path, split: str, raw_evaluation: Path | None = None, masked_evaluation: Path | None = None) -> dict:
    raw_config, raw_metadata, raw_rows = read_run(raw, "raw", split, raw_evaluation)
    masked_config, masked_metadata, masked_rows = read_run(masked, "masked", split, masked_evaluation)
    for field in ("manifest_sha256", "dataset_fingerprint", "architecture", "weights", "preprocess", "seed", "training", "device", "threads", "selection_metric"):
        if raw_config.get(field) is None or raw_config[field] != masked_config.get(field):
            raise ValueError(f"Raw and masked runs must have matching {field}")
    for field in ("source_sha256", "python", "torch", "torchvision", "numpy", "pillow"):
        if raw_config["environment"].get(field) != masked_config["environment"].get(field):
            raise ValueError(f"Raw and masked runs use different {field}")
    if split == "test":
        if raw_metadata.get("execution") != masked_metadata.get("execution"):
            raise ValueError("Raw and masked test evaluations use different execution settings")
        for field in ("source_sha256", "python", "torch", "torchvision", "numpy", "pillow"):
            if raw_metadata["environment"].get(field) != masked_metadata["environment"].get(field):
                raise ValueError(f"Raw and masked test evaluations use different {field}")
    if set(raw_rows) != set(masked_rows):
        raise ValueError("Raw and masked predictions must cover the same clips")
    threshold = raw_metadata["threshold"]
    if threshold != masked_metadata["threshold"]:
        raise ValueError("Raw and masked runs must use the same decision threshold")
    ids = sorted(raw_rows)
    for clip_id in ids:
        for field in ("label", "fight_id"):
            if raw_rows[clip_id][field] != masked_rows[clip_id][field]:
                raise ValueError(f"{clip_id}: mismatched {field}")
    examples = [raw_rows[clip_id] for clip_id in ids]
    reports = {
        "raw": prediction_report(examples, [raw_rows[i]["probability"] for i in ids], threshold),
        "masked": prediction_report(examples, [masked_rows[i]["probability"] for i in ids], threshold),
    }
    metrics = ("accuracy", "precision", "recall", "f1", "balanced_accuracy", "average_precision", "log_loss", "brier_score")
    differences = {}
    for metric in metrics:
        a = reports["raw"]["overall"][metric]
        b = reports["masked"]["overall"][metric]
        differences[metric] = b - a if a is not None and b is not None else None
    transitions = {"both_correct": 0, "raw_only_correct": 0, "masked_only_correct": 0, "both_wrong": 0}
    changed = []
    for clip_id in ids:
        a, b = raw_rows[clip_id], masked_rows[clip_id]
        correct_a = int(a["probability"] >= threshold) == a["label"]
        correct_b = int(b["probability"] >= threshold) == b["label"]
        key = "both_correct" if correct_a and correct_b else "raw_only_correct" if correct_a else "masked_only_correct" if correct_b else "both_wrong"
        transitions[key] += 1
        if correct_a != correct_b:
            changed.append({"clip_id": clip_id, "fight_id": a["fight_id"], "label": a["label"], "raw_probability": a["probability"], "masked_probability": b["probability"]})
    return {
        "split": split,
        "manifest_sha256": raw_config["manifest_sha256"],
        "seed": raw_config["seed"],
        "threshold": threshold,
        "selected_epochs": {"raw": raw_config["selected_epoch"], "masked": masked_config["selected_epoch"]},
        "reports": reports,
        "masked_minus_raw": differences,
        "paired_outcomes": transitions,
        "changed_predictions": changed,
        "interpretation": "Descriptive paired comparison, not evidence of statistical significance. Lower log loss and Brier score are better; higher classification metrics are better. Validation is used for selection and is not a final test. Clips within a fight are dependent.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare matched raw/masked experiments from saved predictions.")
    parser.add_argument("--raw", type=Path, required=True)
    parser.add_argument("--masked", type=Path, required=True)
    parser.add_argument("--split", choices=("validation", "test"), default="validation")
    parser.add_argument("--raw-evaluation", type=Path, help="Raw test output directory; defaults to RAW/evaluation")
    parser.add_argument("--masked-evaluation", type=Path, help="Masked test output directory; defaults to MASKED/evaluation")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        parser.error(f"Output already exists: {args.output}")
    try:
        report = compare_runs(args.raw, args.masked, args.split, args.raw_evaluation, args.masked_evaluation)
    except (OSError, ValueError, KeyError) as exc:
        parser.error(str(exc))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    try:
        with args.output.open("x") as handle:
            handle.write(json.dumps(report, indent=2, allow_nan=False) + "\n")
    except OSError as exc:
        parser.error(str(exc))
    print(json.dumps(report["masked_minus_raw"], indent=2))


if __name__ == "__main__":
    main()
