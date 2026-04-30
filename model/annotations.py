import hashlib
import json
import math
import re
from datetime import datetime
from pathlib import Path


LABELS = {"attempt", "no_attempt", "uncertain", "unreviewed"}
OUTCOMES = {"landed", "blocked", "missed", "unknown"}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def text_field(value: object, name: str, limit: int = 200) -> str:
    if not isinstance(value, str) or not value or value != value.strip() or len(value) > limit:
        raise ValueError(f"{name} must be nonempty, without surrounding whitespace, and at most {limit} characters")
    return value


def time_field(value: object, name: str) -> float:
    if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
        raise ValueError(f"{name} must be a finite nonnegative number")
    return float(value)


def integer_field(value: object, name: str, minimum: int = 0) -> int:
    number = time_field(value, name)
    if not number.is_integer() or number < minimum or number > 2**53 - 1:
        raise ValueError(f"{name} must be a safe integer of at least {minimum}")
    return int(number)


def timestamp_field(value: object, name: str) -> None:
    if not isinstance(value, str) or re.fullmatch(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)", value) is None:
        raise ValueError(f"{name} must be an ISO timestamp")
    datetime.fromisoformat(value)


def read_annotations(path: Path) -> tuple[dict, bytes]:
    raw = path.read_bytes()
    value = json.loads(raw)
    json.dumps(value, allow_nan=False)
    if not isinstance(value, dict) or type(value.get("schema_version")) is not int or value["schema_version"] != 1 or value.get("kind") != "strike_annotations":
        raise ValueError("Expected a schema_version 1 strike_annotations export")
    for field in ("project_id", "title", "fight_id"):
        text_field(value.get(field), field)
    for field in ("created_at", "updated_at"):
        timestamp_field(value.get(field), field)
    source = value.get("source")
    if not isinstance(source, dict):
        raise ValueError("source must be an object")
    text_field(source.get("source_id"), "source.source_id")
    text_field(source.get("file_name"), "source.file_name", 255)
    integer_field(source.get("size_bytes"), "source.size_bytes", 1)
    integer_field(source.get("last_modified_ms"), "source.last_modified_ms")
    duration = time_field(source.get("duration_s"), "source.duration_s")
    if duration == 0:
        raise ValueError("source.duration_s must be positive")
    if not isinstance(source.get("sha256"), str) or re.fullmatch(r"[a-f0-9]{64}", source["sha256"]) is None:
        raise ValueError("source.sha256 must be a lowercase SHA-256 digest")
    clips = value.get("clips")
    if not isinstance(clips, list) or not 1 <= len(clips) <= 10000:
        raise ValueError("Prepare between one and 10,000 clips per export")
    seen = set()
    for clip in clips:
        if not isinstance(clip, dict):
            raise ValueError("Every clip must be an object")
        clip_id = text_field(clip.get("clip_id"), "clip_id")
        if clip_id in seen:
            raise ValueError(f"Duplicate clip_id: {clip_id}")
        seen.add(clip_id)
        start = time_field(clip.get("start_time_s"), f"{clip_id}: start_time_s")
        end = time_field(clip.get("end_time_s"), f"{clip_id}: end_time_s")
        if end <= start or end > duration:
            raise ValueError(f"{clip_id}: interval must be nonempty and within the video duration")
        if not isinstance(clip.get("label"), str) or clip["label"] not in LABELS:
            raise ValueError(f"{clip_id}: invalid annotation label")
        if not isinstance(clip.get("outcome"), str) or clip["outcome"] not in OUTCOMES:
            raise ValueError(f"{clip_id}: invalid outcome")
        if clip["label"] != "attempt" and clip["outcome"] != "unknown":
            raise ValueError(f"{clip_id}: only attempts can have a landed, blocked, or missed outcome")
        if not isinstance(clip.get("notes"), str) or len(clip["notes"]) > 5000:
            raise ValueError(f"{clip_id}: notes must be text of at most 5,000 characters")
        timestamp_field(clip.get("updated_at"), f"{clip_id}: updated_at")
    return value, raw
