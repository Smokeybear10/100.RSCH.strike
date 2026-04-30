import argparse
from bisect import bisect_left
from collections import defaultdict
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import struct

import av
import PIL

from .annotations import file_sha256, read_annotations
from .data import audit_manifest


def display_rotation(frame: av.VideoFrame) -> int:
    for data in frame.side_data:
        if data.type.name != "DISPLAYMATRIX":
            continue
        matrix = struct.unpack("=9i", bytes(data))
        a, b, c, d = matrix[0], matrix[1], matrix[3], matrix[4]
        unit = 1 << 16
        simple_rotation = (
            all(value in {-unit, 0, unit} for value in (a, b, c, d))
            and a * a + b * b == unit * unit and c * c + d * d == unit * unit
            and a * c + b * d == 0 and a * d - b * c == unit * unit
            and all(matrix[index] == 0 for index in (2, 5, 6, 7)) and matrix[8] == 1 << 30
        )
        if not simple_rotation:
            raise ValueError("Video has a mirrored or nonstandard display transform. Re-encode it with the displayed orientation baked in, then reopen and label that version.")
    return frame.rotation


def video_timestamps(video: Path, end_time: float) -> tuple[list[dict], dict]:
    frames = []
    with av.open(str(video), options={"protocol_whitelist": "file,pipe"}) as container:
        if not container.streams.video:
            raise ValueError("The source has no video stream")
        stream = container.streams.video[0]
        stream.codec_context.thread_count = 1
        if stream.sample_aspect_ratio is not None and stream.sample_aspect_ratio != 1:
            raise ValueError("Video uses non-square display pixels. Re-encode to square pixels, then reopen and label that version.")
        origin = Fraction(container.start_time, av.time_base) if container.start_time is not None else None
        if origin is not None and abs(origin) > Fraction(1, av.time_base):
            raise ValueError("Video has a nonzero presentation origin that browsers may seek incorrectly. Re-encode it with a zero-based timeline, reopen it in the workspace, and label that version.")
        duration = container.duration / av.time_base if container.duration is not None else None
        for index, frame in enumerate(container.decode(stream)):
            if frame.pts is None or frame.time_base is None:
                raise ValueError("Source frames have no presentation timestamps; cannot trace annotation intervals")
            pts_time = frame.pts * frame.time_base
            if origin is None:
                origin = pts_time
                if abs(origin) > Fraction(1, av.time_base):
                    raise ValueError("Video has no zero-based presentation timeline. Re-encode it, reopen it in the workspace, and label that version.")
            timestamp = float(pts_time - origin)
            if timestamp < 0:
                continue
            if frames and timestamp <= frames[-1]["time_s"]:
                raise ValueError("Source presentation timestamps are not strictly increasing")
            if timestamp >= end_time:
                break
            frames.append({
                "index": index, "pts": frame.pts, "time_base": str(frame.time_base),
                "time_s": timestamp, "rotation_degrees": display_rotation(frame),
            })
        info = {
            "video_stream_index": stream.index, "timeline_origin_s": float(origin) if origin is not None else None,
            "container_duration_s": duration, "codec": stream.codec_context.name,
            "pyav_version": av.__version__, "pillow_version": PIL.__version__,
            "ffmpeg_libraries": {name: list(version) for name, version in av.library_versions.items()},
            "recipe": "five evenly spaced distinct decoded frames inside [start_time_s, end_time_s); zero-origin presentation timeline required; timestamps use exact rational PTS/timebase arithmetic; PNG RGB with display rotation applied",
        }
    if not frames:
        raise ValueError("No timestamped video frames fall inside the requested intervals")
    return frames, info


def prepare(args: argparse.Namespace) -> dict:
    annotations, annotation_bytes = read_annotations(args.annotations)
    video = args.video.resolve(strict=True)
    if not video.is_file():
        raise ValueError("--video must refer to a local file")
    source = annotations["source"]
    if video.stat().st_size != source["size_bytes"] or file_sha256(video) != source["sha256"]:
        raise ValueError("Source video differs from the video labeled in the workspace (size or SHA-256 mismatch)")
    frames, extraction = video_timestamps(video, max(clip["end_time_s"] for clip in annotations["clips"]))
    duration = extraction["container_duration_s"]
    if duration is not None and abs(duration - source["duration_s"]) > max(0.25, duration * 0.001):
        raise ValueError("Source duration differs from the workspace export; reopen the video and export again")
    timestamps = [frame["time_s"] for frame in frames]
    wanted = defaultdict(list)
    records = []
    for number, clip in enumerate(annotations["clips"]):
        first = bisect_left(timestamps, clip["start_time_s"])
        stop = bisect_left(timestamps, clip["end_time_s"])
        if stop - first < 5:
            raise ValueError(f"{clip['clip_id']}: interval contains fewer than five distinct source frames; widen it in the workspace")
        chosen = [frames[first + i * (stop - first - 1) // 4] for i in range(5)]
        paths = [f"frames/clip_{number:06d}/img_{i + 1:05d}.png" for i in range(5)]
        for frame, path in zip(chosen, paths):
            wanted[frame["index"]].append(path)
        records.append({**clip, "frames": paths, "frame_provenance": chosen})
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / "annotations.json").write_bytes(annotation_bytes)
    frame_hashes = {}
    with av.open(str(video), options={"protocol_whitelist": "file,pipe"}) as container:
        stream = container.streams.video[0]
        stream.codec_context.thread_count = 1
        last = max(wanted)
        for index, frame in enumerate(container.decode(stream)):
            if index in wanted:
                image = frame.to_image().convert("RGB")
                if frame.rotation:
                    image = image.rotate(frame.rotation, expand=True)
                for relative in wanted[index]:
                    path = args.output / relative
                    path.parent.mkdir(parents=True, exist_ok=True)
                    image.save(path, format="PNG", optimize=False, compress_level=6)
                    frame_hashes[relative] = file_sha256(path)
            if index >= last:
                break
    if len(frame_hashes) != sum(len(paths) for paths in wanted.values()):
        raise ValueError("Source ended before all requested frames could be extracted; preparation is incomplete")
    if file_sha256(video) != source["sha256"]:
        raise ValueError("Source changed during extraction; preparation is incomplete")
    manifest_clips = []
    for clip in records:
        if clip["label"] not in {"attempt", "no_attempt"}:
            continue
        manifest_clips.append({
            "clip_id": clip["clip_id"], "fight_id": annotations["fight_id"],
            "source": source["source_id"], "source_sha256": source["sha256"],
            "start_time_s": clip["start_time_s"], "end_time_s": clip["end_time_s"],
            "label": 1 if clip["label"] == "attempt" else 0,
            "annotation_status": "reviewed", "split": "development", "frames": clip["frames"],
            "outcome": clip["outcome"], "notes": clip["notes"],
        })
    if manifest_clips:
        manifest_path = args.output / "manifest.json"
        manifest_path.write_text(json.dumps({
            "schema_version": 1, "label_definition": "strike_attempt", "clips": manifest_clips,
        }, indent=2, allow_nan=False) + "\n")
        audit = audit_manifest(manifest_path, args.output, require_research=False)
        if not audit["valid"]:
            raise ValueError("Prepared manifest failed its audit; preparation is incomplete:\n" + "\n".join(audit["errors"]))
        (args.output / "audit.json").write_text(json.dumps(audit, indent=2, allow_nan=False) + "\n")
    report = {
        "schema_version": 1, "kind": "strike_prepared", "status": "complete",
        "project_id": annotations["project_id"], "fight_id": annotations["fight_id"],
        "source": source, "annotation_sha256": hashlib.sha256(annotation_bytes).hexdigest(),
        "extraction": extraction, "frame_sha256": frame_hashes, "clips": records,
        "training_manifest_clips": len(manifest_clips),
        "review_only_clips": len(records) - len(manifest_clips),
    }
    (args.output / "review.json").write_text(json.dumps(report, indent=2, allow_nan=False) + "\n")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract timestamped five-frame development windows from workspace annotations.")
    parser.add_argument("--annotations", type=Path, required=True)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="New directory for frames, review.json, and any reviewed-label manifest")
    args = parser.parse_args()
    try:
        report = prepare(args)
    except (OSError, ValueError, av.error.FFmpegError) as error:
        parser.exit(2, f"{error}\n")
    print(json.dumps({"prepared": str(args.output), "reviewed": report["training_manifest_clips"], "review_only": report["review_only_clips"]}))


if __name__ == "__main__":
    main()
