import argparse
from collections import Counter, defaultdict
import hashlib
import json
import math
from pathlib import Path

from PIL import Image, UnidentifiedImageError


SPLITS = {"train", "val", "test", "development"}
FRAME_COUNT = 5


def load_manifest(path: Path) -> dict:
    manifest = json.loads(Path(path).read_text())
    json.dumps(manifest, allow_nan=False)
    if not isinstance(manifest, dict):
        raise ValueError("Manifest must be a JSON object.")
    if type(manifest.get("schema_version")) is not int or manifest["schema_version"] != 1:
        raise ValueError("Expected schema_version: 1.")
    if not isinstance(manifest.get("clips"), list) or not manifest["clips"]:
        raise ValueError("Manifest must contain a nonempty clips list.")
    return manifest


def _frame_path(data_root: Path, relative: str) -> Path:
    if not isinstance(relative, str) or not relative.strip() or Path(relative).is_absolute():
        raise ValueError("Frame paths must be nonempty paths relative to data_root.")
    path = (data_root / relative).resolve()
    if not path.is_relative_to(data_root.resolve()):
        raise ValueError(f"Frame path leaves data_root: {relative}")
    return path


def _has_text(value: object) -> bool:
    return isinstance(value, str) and bool(value) and value == value.strip()


def _valid_time(value: object) -> bool:
    return type(value) in (int, float) and math.isfinite(value) and value >= 0


def audit_manifest(
    manifest_path: Path, data_root: Path, variant: str = "raw", require_research: bool = True
) -> dict:
    report = {
        "valid": False,
        "mode": "research" if require_research else "development",
        "variant": variant,
        "errors": [],
        "warnings": [],
        "summary": {},
        "dataset_fingerprint": None,
        "manifest_sha256": None,
    }
    errors = report["errors"]
    warnings = report["warnings"]
    if variant not in {"raw", "masked"}:
        errors.append("variant must be raw or masked.")
        return report
    try:
        manifest = load_manifest(manifest_path)
    except (OSError, ValueError) as exc:
        errors.append(f"Cannot read manifest: {exc}")
        return report

    data_root = Path(data_root).resolve()
    if not data_root.is_dir():
        errors.append(f"Data root is not a directory: {data_root}")
        return report
    definition = manifest.get("label_definition")
    if not isinstance(definition, str) or definition not in {"strike_attempt", "legacy_unknown"}:
        errors.append("label_definition must be strike_attempt or legacy_unknown.")
    if require_research and definition != "strike_attempt":
        errors.append("Research requires reviewed strike_attempt labels, including missed attempts.")

    split_counts = Counter()
    label_counts = defaultdict(Counter)
    fight_counts = defaultdict(Counter)
    fight_splits = defaultdict(set)
    seen_clips = set()
    seen_frames = defaultdict(list)
    seen_pixels = defaultdict(list)
    window_labels = defaultdict(list)
    intervals = defaultdict(list)
    source_intervals = defaultdict(list)
    frame_hashes = {}
    frame_cache = {}
    missing_provenance = []
    unreviewed = []
    legacy_membership = defaultdict(list)
    unused_legacy = []

    for index, clip in enumerate(manifest["clips"]):
        if not isinstance(clip, dict):
            errors.append(f"clips[{index}] must be an object.")
            continue
        clip_id = clip.get("clip_id")
        display = clip_id if _has_text(clip_id) else f"clips[{index}]"
        if not _has_text(clip_id):
            errors.append(f"{display}: clip_id must be a nonempty string without surrounding whitespace.")
        elif clip_id in seen_clips:
            errors.append(f"{display}: duplicate clip_id.")
        else:
            seen_clips.add(clip_id)
        split = clip.get("split")
        if not isinstance(split, str) or split not in SPLITS:
            errors.append(f"{display}: split must be train, val, test, or development.")
            continue
        split_counts[split] += 1
        label = clip.get("label")
        if type(label) is not int or label not in {0, 1}:
            errors.append(f"{display}: label must be integer 0 or 1.")
        else:
            label_counts[split][str(label)] += 1

        fight = clip.get("fight_id")
        source = clip.get("source")
        start, end = clip.get("start_time_s"), clip.get("end_time_s")
        has_times = _valid_time(start) and _valid_time(end) and end > start
        has_provenance = _has_text(fight) and _has_text(source) and has_times
        reviewed = clip.get("annotation_status") == "reviewed"
        status = clip.get("annotation_status")
        if not isinstance(status, str) or status not in {"reviewed", "unreviewed", "legacy_unreviewed"}:
            errors.append(f"{display}: invalid annotation_status.")
        if fight is not None and not _has_text(fight):
            errors.append(f"{display}: fight_id must be a nonempty string without surrounding whitespace, or null.")
        if source is not None and not _has_text(source):
            errors.append(f"{display}: source must be a nonempty string without surrounding whitespace, or null.")
        if not has_provenance:
            missing_provenance.append(display)
        if not reviewed:
            unreviewed.append(display)
        if require_research and split == "development":
            errors.append(f"{display}: development clips cannot be used in a research manifest.")
        if split != "development":
            if definition != "strike_attempt" or not reviewed:
                errors.append(f"{display}: research splits require reviewed strike_attempt labels.")
            if not has_provenance:
                errors.append(f"{display}: research splits require fight_id, source, and valid start/end times.")
        elif start is not None or end is not None:
            if not has_times:
                errors.append(f"{display}: provide both valid start_time_s and end_time_s, or both null.")
        if _has_text(fight):
            fight_counts[fight][split] += 1
            fight_splits[fight].add(split)
            if _has_text(source) and has_times:
                intervals[(fight, source, split)].append((start, end, display))
                source_intervals[source].append((start, end, split, display))

        memberships = clip.get("legacy_splits", [])
        if split == "test" and "legacy_splits" in clip:
            errors.append(f"{display}: legacy development clips cannot become an untouched research test set.")
        if not isinstance(memberships, list) or any(
            not isinstance(item, str) or item not in {"train", "val", "test"}
            for item in memberships
        ):
            errors.append(f"{display}: legacy_splits must list train, val, or test.")
        else:
            for member in memberships:
                legacy_membership[member].append(display)
            if "legacy_splits" in clip and not memberships:
                unused_legacy.append(display)

        sizes = set()
        fields = ["frames"]
        if variant == "masked" or "masked_frames" in clip:
            fields.append("masked_frames")
        for field in fields:
            frames = clip.get(field)
            if not isinstance(frames, list) or len(frames) != FRAME_COUNT:
                errors.append(f"{display}: {field} must list exactly {FRAME_COUNT} ordered frames.")
                continue
            if not all(isinstance(frame, str) for frame in frames):
                errors.append(f"{display}: every {field} entry must be a relative path string.")
                continue
            if len(set(frames)) != len(frames):
                errors.append(f"{display}: repeated path in {field}.")
            paths_in_clip = set()
            window_pixels = []
            for frame in frames:
                try:
                    path = _frame_path(data_root, frame)
                    if path in paths_in_clip:
                        errors.append(f"{display}: multiple {field} entries resolve to {frame}.")
                    paths_in_clip.add(path)
                    if path not in frame_cache:
                        digest = hashlib.sha256(path.read_bytes()).hexdigest()
                        with Image.open(path) as image:
                            pixels = image.convert("RGB")
                            size = pixels.size
                            pixel_digest = hashlib.sha256(
                                f"{size[0]}x{size[1]}:RGB:".encode() + pixels.tobytes()
                            ).hexdigest()
                        frame_cache[path] = (digest, pixel_digest, size)
                    digest, pixel_digest, size = frame_cache[path]
                except (OSError, ValueError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
                    errors.append(f"{display}: cannot read {frame}: {exc}")
                    continue
                sizes.add(size)
                frame_hashes[frame] = digest
                seen_frames[digest].append((split, display, frame))
                seen_pixels[pixel_digest].append((split, display, frame))
                window_pixels.append(pixel_digest)
            if field == "frames" and len(window_pixels) == FRAME_COUNT and type(label) is int and label in {0, 1}:
                window_labels[tuple(window_pixels)].append((display, label))
        if len(sizes) > 1:
            errors.append(f"{display}: frames have inconsistent image dimensions.")

    for fight, splits in sorted(fight_splits.items()):
        if len(splits) > 1:
            errors.append(f"Fight {fight} occurs in multiple splits: {', '.join(sorted(splits))}.")
    for source, group in source_intervals.items():
        group.sort()
        for index, (_, end, split, clip_id) in enumerate(group):
            for start, _, other_split, other_clip in group[index + 1 :]:
                if start >= end:
                    break
                if split != other_split:
                    errors.append(f"Overlapping source interval across splits: {clip_id}, {other_clip} ({source}).")

    duplicate_groups = []
    for matches in window_labels.values():
        if len({label for _, label in matches}) > 1:
            clips = ", ".join(sorted(clip_id for clip_id, _ in matches))
            errors.append(f"Identical raw frame windows have conflicting labels: {clips}.")
    reported_groups = set()
    for kind, groups in (("file", seen_frames), ("decoded pixels", seen_pixels)):
        for matches in groups.values():
            splits = {match[0] for match in matches}
            if len(splits) <= 1:
                continue
            clips = tuple(sorted({match[1] for match in matches}))
            if clips in reported_groups:
                continue
            reported_groups.add(clips)
            duplicate_groups.append({"clips": list(clips), "splits": sorted(splits), "match": kind})
            errors.append(f"Duplicate frame {kind} across splits: {', '.join(clips)}.")

    overlap_count = 0
    for group in intervals.values():
        group.sort()
        for index, (_, end, _) in enumerate(group):
            for start, _, _ in group[index + 1 :]:
                if start >= end:
                    break
                overlap_count += 1
    if overlap_count:
        warnings.append(f"{overlap_count} overlapping clip pairs within splits; they are not independent observations.")
    if missing_provenance:
        warnings.append(f"{len(missing_provenance)} clips have incomplete source/fight/timestamp provenance.")
    if unreviewed:
        warnings.append(f"{len(unreviewed)} clips need review against the strike-attempt definition.")
    for split, counts in label_counts.items():
        if len(counts) != 2:
            warnings.append(f"{split} contains only one class; precision/recall comparisons will be limited.")

    legacy_overlap = sorted(
        set(legacy_membership["train"]) & set(legacy_membership["val"])
        | set(legacy_membership["train"]) & set(legacy_membership["test"])
        | set(legacy_membership["val"]) & set(legacy_membership["test"])
    )
    if legacy_overlap:
        warnings.append(f"Legacy splits overlap on {len(legacy_overlap)} clips; imported clips are development-only.")
    report["summary"] = {
        "clips": len(manifest["clips"]),
        "frames": len(frame_hashes),
        "splits": dict(sorted(split_counts.items())),
        "labels_by_split": {split: dict(counts) for split, counts in sorted(label_counts.items())},
        "fights": len(fight_counts),
        "clips_by_fight": {fight: dict(counts) for fight, counts in sorted(fight_counts.items())},
        "missing_provenance": missing_provenance,
        "unreviewed_clips": unreviewed,
        "duplicate_frame_groups": duplicate_groups,
        "overlapping_pairs_within_splits": overlap_count,
        "legacy_split_counts": {split: len(legacy_membership[split]) for split in ("train", "val", "test")},
        "legacy_overlapping_clips": legacy_overlap,
        "legacy_unreferenced_clips": sorted(unused_legacy),
    }
    report["valid"] = not errors
    if report["valid"]:
        report["manifest_sha256"] = hashlib.sha256(
            json.dumps(manifest, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()
        ).hexdigest()
        fingerprint = {"manifest": manifest, "frame_sha256": frame_hashes}
        report["dataset_fingerprint"] = hashlib.sha256(
            json.dumps(fingerprint, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()
        ).hexdigest()
    return report


def read_examples(
    manifest_path: Path, data_root: Path, split: str, variant: str = "raw"
) -> list[dict]:
    if split not in SPLITS or variant not in {"raw", "masked"}:
        raise ValueError("Invalid split or variant.")
    field = "frames" if variant == "raw" else "masked_frames"
    return [
        {**clip, "frame_paths": [_frame_path(Path(data_root), frame) for frame in clip[field]]}
        for clip in load_manifest(manifest_path)["clips"]
        if clip["split"] == split
    ]


def import_legacy(data_root: Path, output: Path) -> dict:
    data_root, output = Path(data_root).resolve(), Path(output)
    if output.exists():
        raise FileExistsError(f"Refusing to overwrite manifest: {output}")
    annotations = {}
    for split in ("train", "val", "test"):
        annotation_path = data_root / "annotations" / f"{split}.txt"
        for number, line in enumerate(annotation_path.read_text().splitlines(), start=1):
            if not line.strip():
                continue
            parts = line.split()
            if len(parts) != 3:
                raise ValueError(f"{annotation_path}:{number}: expected path, frame count, label.")
            relative, count, label = parts
            if count != str(FRAME_COUNT) or label not in {"0", "1"}:
                raise ValueError(f"{annotation_path}:{number}: expected 5 frames and binary label.")
            _frame_path(data_root, f"frames/{relative}")
            entry = annotations.setdefault(relative, {"label": int(label), "splits": []})
            if entry["label"] != int(label) or split in entry["splits"]:
                raise ValueError(f"{annotation_path}:{number}: conflicting or duplicate annotation.")
            entry["splits"].append(split)
    clip_dirs = {
        path.relative_to(data_root / "frames").as_posix()
        for path in (data_root / "frames").glob("*/*")
        if path.is_dir()
    } | set(annotations)
    if not clip_dirs:
        raise ValueError("No legacy clip directories found.")
    clips = []
    for relative in sorted(clip_dirs):
        category = Path(relative).parts[0]
        if category not in {"strike", "neutral"}:
            raise ValueError(f"Cannot infer legacy label for {relative}.")
        expected_label = int(category == "strike")
        annotation = annotations.get(relative, {"label": expected_label, "splits": []})
        if annotation["label"] != expected_label:
            raise ValueError(f"Label disagrees with legacy directory: {relative}")
        directory = _frame_path(data_root, f"frames/{relative}")
        frames = sorted(
            path.relative_to(data_root).as_posix()
            for path in directory.glob("*")
            if path.suffix.lower() in {".jpg", ".jpeg", ".png"}
        )
        clips.append({
            "clip_id": relative,
            "fight_id": None,
            "source": None,
            "start_time_s": None,
            "end_time_s": None,
            "label": annotation["label"],
            "split": "development",
            "annotation_status": "legacy_unreviewed",
            "frames": frames,
            "legacy_splits": annotation["splits"],
        })
    manifest = {"schema_version": 1, "label_definition": "legacy_unknown", "clips": clips}
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x") as handle:
        handle.write(json.dumps(manifest, indent=2) + "\n")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Import and audit Strike's external frame data.")
    commands = parser.add_subparsers(dest="command", required=True)
    legacy = commands.add_parser("import-legacy", help="Inventory old data without inventing a held-out split.")
    legacy.add_argument("--data-root", type=Path, required=True)
    legacy.add_argument("--output", type=Path, required=True)
    audit = commands.add_parser("audit", help="Validate provenance, frames, and fight-separated splits.")
    audit.add_argument("--manifest", type=Path, required=True)
    audit.add_argument("--data-root", type=Path, required=True)
    audit.add_argument("--variant", choices=("raw", "masked"), default="raw")
    audit.add_argument("--output", type=Path, required=True)
    audit.add_argument("--development", action="store_true", help="Allow unknown metadata only in development clips.")
    args = parser.parse_args()
    try:
        if args.command == "import-legacy":
            manifest = import_legacy(args.data_root, args.output)
            print(f"Imported {len(manifest['clips'])} development clips to {args.output}")
            return
        if args.output.resolve() == args.manifest.resolve():
            raise ValueError("Audit output must not overwrite the manifest.")
        if args.output.exists():
            raise FileExistsError(f"Refusing to overwrite audit output: {args.output}")
        report = audit_manifest(args.manifest, args.data_root, args.variant, not args.development)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open("x") as handle:
            handle.write(json.dumps(report, indent=2) + "\n")
        print(json.dumps(report, indent=2))
        if not report["valid"]:
            raise SystemExit(1)
    except (OSError, ValueError) as exc:
        parser.exit(2, f"Error: {exc}\n")


if __name__ == "__main__":
    main()
