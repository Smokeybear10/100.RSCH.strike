import { createSHA256 } from "hash-wasm";

export type Label = "attempt" | "no_attempt" | "uncertain" | "unreviewed";
export type Outcome = "landed" | "blocked" | "missed" | "unknown";

export type Source = {
  source_id: string;
  file_name: string;
  size_bytes: number;
  last_modified_ms: number;
  duration_s: number;
  sha256: string;
};

export type Clip = {
  clip_id: string;
  start_time_s: number;
  end_time_s: number;
  label: Label;
  outcome: Outcome;
  notes: string;
  updated_at: string;
};

export type PredictionRun = {
  schema_version: 1;
  kind: "strike_predictions";
  project_id: string;
  source_sha256: string;
  model: {
    name: string;
    purpose: string;
    variant: "raw";
    checkpoint_sha256: string;
    threshold: number;
  };
  predictions: {
    clip_id: string;
    start_time_s: number;
    end_time_s: number;
    probability_strike: number;
  }[];
};

export type Project = {
  schema_version: 1;
  kind: "strike_annotations";
  project_id: string;
  title: string;
  fight_id: string;
  source: Source;
  clips: Clip[];
  created_at: string;
  updated_at: string;
  prediction_run?: PredictionRun;
};

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string, limit = 200): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > limit) {
    throw new Error(`${name} must be nonempty, without surrounding spaces, and at most ${limit} characters.`);
  }
  return value;
}

function number(value: unknown, name: string, minimum = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) {
    throw new Error(`${name} must be a finite number of at least ${minimum}.`);
  }
  return value;
}

function integer(value: unknown, name: string, minimum = 0): number {
  const result = number(value, name, minimum);
  if (!Number.isSafeInteger(result)) throw new Error(`${name} must be a whole number.`);
  return result;
}

function hash(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) {
    throw new Error(`${name} must be a lowercase SHA-256 hash.`);
  }
  return value;
}

function timestamp(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${name} must be an ISO timestamp.`);
  }
  return value;
}

function parseSource(value: unknown): Source {
  const source = record(value, "Source");
  const duration = number(source.duration_s, "Video duration");
  if (duration <= 0) throw new Error("Video duration must be greater than zero.");
  return {
    source_id: text(source.source_id, "Source ID"),
    file_name: text(source.file_name, "Video filename", 255),
    size_bytes: integer(source.size_bytes, "Video size", 1),
    last_modified_ms: integer(source.last_modified_ms, "Video modified time"),
    duration_s: duration,
    sha256: hash(source.sha256, "Video hash"),
  };
}

function parseClip(value: unknown, duration: number): Clip {
  const clip = record(value, "Clip");
  const start = number(clip.start_time_s, "Clip start");
  const end = number(clip.end_time_s, "Clip end");
  if (end <= start || end > duration) throw new Error("Clip end must follow its start and remain within the video.");
  const label = clip.label;
  if (label !== "attempt" && label !== "no_attempt" && label !== "uncertain" && label !== "unreviewed") {
    throw new Error("Clip label must be attempt, no_attempt, uncertain, or unreviewed.");
  }
  const outcome = clip.outcome;
  if (outcome !== "landed" && outcome !== "blocked" && outcome !== "missed" && outcome !== "unknown") {
    throw new Error("Clip outcome must be landed, blocked, missed, or unknown.");
  }
  if (label !== "attempt" && outcome !== "unknown") {
    throw new Error("Only an attempt can have a landed, blocked, or missed outcome.");
  }
  if (typeof clip.notes !== "string" || clip.notes.length > 5000) {
    throw new Error("Clip notes must be text of at most 5,000 characters.");
  }
  return {
    clip_id: text(clip.clip_id, "Clip ID"),
    start_time_s: start,
    end_time_s: end,
    label,
    outcome,
    notes: clip.notes,
    updated_at: timestamp(clip.updated_at, "Clip updated time"),
  };
}

export function parseProject(value: unknown): Project {
  const project = record(value, "Project");
  if (project.schema_version !== 1 || project.kind !== "strike_annotations") {
    throw new Error("Choose a version 1 Strike annotation backup.");
  }
  if (!Array.isArray(project.clips) || project.clips.length > 10000) {
    throw new Error("A project must contain a clips list with at most 10,000 entries.");
  }
  const source = parseSource(project.source);
  const clips = project.clips.map((clip: unknown) => parseClip(clip, source.duration_s));
  if (new Set(clips.map((clip) => clip.clip_id)).size !== clips.length) {
    throw new Error("The project contains duplicate clip IDs.");
  }
  const parsed: Project = {
    schema_version: 1,
    kind: "strike_annotations",
    project_id: text(project.project_id, "Project ID"),
    title: text(project.title, "Project title"),
    fight_id: text(project.fight_id, "Fight ID"),
    source,
    clips,
    created_at: timestamp(project.created_at, "Project created time"),
    updated_at: timestamp(project.updated_at, "Project updated time"),
  };
  if (project.prediction_run !== undefined) {
    parsed.prediction_run = parsePredictions(project.prediction_run, parsed);
  }
  return parsed;
}

export function parsePredictions(value: unknown, project: Project): PredictionRun {
  const run = record(value, "Prediction file");
  if (run.schema_version !== 1 || run.kind !== "strike_predictions") {
    throw new Error("Choose the prediction JSON exported by model.predict, not a CSV or annotation file.");
  }
  if (run.project_id !== project.project_id || run.source_sha256 !== project.source.sha256) {
    throw new Error("These predictions belong to a different project or video.");
  }
  const model = record(run.model, "Prediction model");
  const threshold = number(model.threshold, "Decision threshold");
  if (threshold <= 0 || threshold >= 1) throw new Error("Decision threshold must be between 0 and 1.");
  if (model.variant !== "raw") throw new Error("This workspace currently accepts raw-video predictions only.");
  if (!Array.isArray(run.predictions) || !run.predictions.length || run.predictions.length > project.clips.length) {
    throw new Error("Predictions must contain one or more clips from this project.");
  }
  const byId = new Map(project.clips.map((clip) => [clip.clip_id, clip]));
  const seen = new Set<string>();
  const predictions = run.predictions.map((item: unknown) => {
    const prediction = record(item, "Prediction");
    const id = text(prediction.clip_id, "Prediction clip ID");
    const clip = byId.get(id);
    if (!clip) throw new Error(`Prediction ${id} does not match a clip in this project.`);
    if (seen.has(id)) throw new Error(`Duplicate prediction for clip ${id}.`);
    seen.add(id);
    const start = number(prediction.start_time_s, "Prediction start");
    const end = number(prediction.end_time_s, "Prediction end");
    if (start !== clip.start_time_s || end !== clip.end_time_s) {
      throw new Error(`Clip ${id} has changed boundaries. Generate new predictions for this annotation backup.`);
    }
    const probability = number(prediction.probability_strike, "Strike probability");
    if (probability > 1) throw new Error("Strike probabilities must be between 0 and 1.");
    return { clip_id: id, start_time_s: start, end_time_s: end, probability_strike: probability };
  });
  return {
    schema_version: 1,
    kind: "strike_predictions",
    project_id: project.project_id,
    source_sha256: project.source.sha256,
    model: {
      name: text(model.name, "Model name"),
      purpose: text(model.purpose, "Model purpose"),
      variant: "raw",
      checkpoint_sha256: hash(model.checkpoint_sha256, "Checkpoint hash"),
      threshold,
    },
    predictions,
  };
}

export function createProject(source: Source, title: string, fightId: string): Project {
  const now = new Date().toISOString();
  return parseProject({
    schema_version: 1,
    kind: "strike_annotations",
    project_id: crypto.randomUUID(),
    title,
    fight_id: fightId,
    source,
    clips: [],
    created_at: now,
    updated_at: now,
  });
}

export function createClip(start: number, end: number): Clip {
  return parseClip({
    clip_id: crypto.randomUUID(),
    start_time_s: start,
    end_time_s: end,
    label: "unreviewed",
    outcome: "unknown",
    notes: "",
    updated_at: new Date().toISOString(),
  }, end);
}

export function formatTime(seconds: number): string {
  const hundredths = Math.round(Math.max(0, Number.isFinite(seconds) ? seconds : 0) * 100);
  const minutes = Math.floor(hundredths / 6000);
  const remainder = Math.floor((hundredths % 6000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}.${String(hundredths % 100).padStart(2, "0")}`;
}

export async function hashVideo(file: File, onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<string> {
  const checkAborted = () => {
    if (signal?.aborted) throw new DOMException("Video loading was canceled.", "AbortError");
  };
  checkAborted();
  if (!file.size) throw new Error("Choose a nonempty video file.");
  const hasher = await createSHA256();
  checkAborted();
  hasher.init();
  onProgress?.(0);
  const chunkSize = 4 * 1024 * 1024;
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    checkAborted();
    const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
    checkAborted();
    hasher.update(new Uint8Array(chunk));
    onProgress?.(Math.min(1, (offset + chunkSize) / file.size));
  }
  checkAborted();
  return hasher.digest("hex");
}
