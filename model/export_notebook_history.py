import argparse
import hashlib
import json
import math
import re
from pathlib import Path


def export_history(notebook_path: Path) -> dict:
    raw = notebook_path.read_bytes()
    notebook = json.loads(raw)
    train = {}
    validation = {}
    cells = set()
    pattern = re.compile(r"Epoch\((train|val)\)\s+\[(\d+)\]\[(\d+)/(\d+)\](.*)")
    for cell_index, cell in enumerate(notebook["cells"]):
        for output in cell.get("outputs", []):
            for line in "".join(output.get("text", [])).splitlines():
                match = pattern.search(line)
                if not match:
                    continue
                phase, epoch, step, total, metrics = match.groups()
                if step != "1" or total != "1":
                    raise ValueError("This exporter requires the recorded one-batch legacy run; refusing to invent epoch averages.")
                values = dict(re.findall(r"([\w/]+):\s+([\d.eE+-]+)", metrics))
                epoch = int(epoch)
                target = train if phase == "train" else validation
                if epoch in target:
                    raise ValueError(f"Multiple {phase} records for epoch {epoch}; select a single recorded run.")
                target[epoch] = (
                    {"train_loss": float(values["loss"]), "train_accuracy": float(values["top1_acc"])}
                    if phase == "train"
                    else {"val_accuracy": float(values["acc/top1"])}
                )
                for name, value in target[epoch].items():
                    if not math.isfinite(value) or value < 0 or ("accuracy" in name and value > 1):
                        raise ValueError(f"Invalid {name} at epoch {epoch}: {value}")
                cells.add(cell_index)
    if not train or train.keys() != validation.keys():
        raise ValueError("Complete paired training and validation logs are required.")
    if sorted(train) != list(range(1, max(train) + 1)):
        raise ValueError("Missing epochs in the recorded run.")
    return {
        "source": notebook_path.resolve().relative_to(Path(__file__).resolve().parents[1]).as_posix()
        if notebook_path.resolve().is_relative_to(Path(__file__).resolve().parents[1])
        else notebook_path.name,
        "source_sha256": hashlib.sha256(raw).hexdigest(),
        "cell_indices": sorted(cells),
        "status": "legacy_validation_not_independent",
        "note": "Historical validation logs, not a held-out benchmark. Both legacy test clips also appear in validation. No independent test result is recorded.",
        "epochs": [{"epoch": epoch, **train[epoch], **validation[epoch]} for epoch in sorted(train)],
    }


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Export recorded TSN notebook metrics without reconstructing curves.")
    parser.add_argument("--notebook", type=Path, default=root / "model/notebooks/TSN_Pipeline.ipynb")
    parser.add_argument("--output", type=Path, default=root / "showcase/src/lib/legacy-training.json")
    args = parser.parse_args()
    if args.output.resolve() == args.notebook.resolve():
        parser.error("Export output must not overwrite the source notebook.")
    history = export_history(args.notebook)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(history, indent=2, allow_nan=False) + "\n")
    print(f"Exported {len(history['epochs'])} recorded epochs to {args.output}")


if __name__ == "__main__":
    main()
