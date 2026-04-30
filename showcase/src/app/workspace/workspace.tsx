"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createClip, createProject, formatTime, hashVideo, parsePredictions, parseProject,
  type Clip, type Label, type Outcome, type Project, type Source,
} from "@/lib/workspace/data";
import { deleteProject, listProjects, saveProject } from "@/lib/workspace/storage";
import styles from "./workspace.module.css";

type Filter = "all" | "unreviewed" | "uncertain" | "disagreement";
type PendingVideo = { source: Source; file: File };
const LABELS: Record<Label, string> = { attempt: "Attempt", no_attempt: "No attempt", uncertain: "Uncertain", unreviewed: "Needs label" };

function downloadProject(project: Project) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.title.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "strike"}-annotations.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function readDuration(url: string, signal: AbortSignal): Promise<number> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Canceled", "AbortError")); return; }
    const video = document.createElement("video");
    const cleanup = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      video.onloadedmetadata = null;
      video.onloadeddata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
    };
    const abort = () => { cleanup(); reject(new DOMException("Canceled", "AbortError")); };
    const timeout = setTimeout(() => { cleanup(); reject(new Error("This video could not be opened. Try an MP4 or WebM supported by your browser.")); }, 15000);
    signal.addEventListener("abort", abort, { once: true });
    video.preload = "auto";
    video.onloadeddata = () => {
      const duration = video.duration;
      const initialTime = video.currentTime;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) reject(new Error("This file has no readable video duration. Try a standard MP4 or WebM."));
      else if (initialTime > 0.05) reject(new Error("This video has a shifted playback timeline. Re-encode it to start at zero, then open that copy before labeling."));
      else resolve(duration);
    };
    video.onerror = () => { cleanup(); reject(new Error("Your browser cannot play this video. Try an MP4 or WebM.")); };
    video.src = url;
  });
}

function isDisagreement(clip: Clip, project: Project): boolean {
  const prediction = project.prediction_run?.predictions.find((row) => row.clip_id === clip.clip_id);
  if (!prediction || !project.prediction_run || !["attempt", "no_attempt"].includes(clip.label)) return false;
  return (prediction.probability_strike >= project.prediction_run.model.threshold) !== (clip.label === "attempt");
}

export function Workspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState("Loading saved work…");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingVideo | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newFight, setNewFight] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0.5);
  const [time, setTime] = useState(0);
  const [loop, setLoop] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [undo, setUndo] = useState<{ projectId: string; clip: Clip } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const newVideoRef = useRef<HTMLInputElement>(null);
  const relinkRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const predictionRef = useRef<HTMLInputElement>(null);
  const loadingRef = useRef<AbortController | null>(null);
  const saves = useRef<Promise<void>>(Promise.resolve());
  const saveVersion = useRef(0);
  const pendingSaves = useRef(0);
  const unsavedProjects = useRef(new Map<string, number>());
  const windowPlayback = useRef(false);
  const savedVersions = useRef(new Map<string, string>());
  const project = projects.find((item) => item.project_id === activeId) ?? null;
  const selected = project?.clips.find((clip) => clip.clip_id === selectedId) ?? null;
  const changedRange = selected && (start !== selected.start_time_s || end !== selected.end_time_s);
  const prediction = changedRange ? undefined : project?.prediction_run?.predictions.find((row) => row.clip_id === selectedId);

  useEffect(() => {
    let active = true;
    listProjects().then((saved) => {
      if (!active) return;
      setProjects(saved);
      savedVersions.current = new Map(saved.map((item) => [item.project_id, item.updated_at]));
      setActiveId(saved[0]?.project_id ?? null);
      setSaveState(saved.length ? "Saved on this device" : "Local workspace");
    }).catch(() => {
      if (active) { setError("Local storage is unavailable. You can still work here; export a backup before leaving."); setSaveState("Storage unavailable"); }
    }).finally(() => { if (active) setReady(true); });
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (pendingSaves.current > 0 || unsavedProjects.current.size > 0) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => { active = false; loadingRef.current?.abort(); window.removeEventListener("beforeunload", beforeUnload); };
  }, []);

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  const commit = useCallback((next: Project) => {
    let updated: Project;
    try { updated = parseProject({ ...next, updated_at: new Date(Math.max(Date.now(), Date.parse(next.updated_at) + 1)).toISOString() }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Check the annotation before saving."); return; }
    setProjects((items) => [updated, ...items.filter((item) => item.project_id !== updated.project_id)]);
    const version = ++saveVersion.current;
    unsavedProjects.current.set(updated.project_id, version);
    pendingSaves.current++;
    setSaveState("Saving…");
    saves.current = saves.current.catch(() => {}).then(() => saveProject(updated, savedVersions.current.get(updated.project_id) ?? null)).then(() => {
      savedVersions.current.set(updated.project_id, updated.updated_at);
      if (unsavedProjects.current.get(updated.project_id) === version) unsavedProjects.current.delete(updated.project_id);
      if (version === saveVersion.current) setSaveState(unsavedProjects.current.size ? "Not saved — export a backup" : "Saved on this device");
    }).catch((cause: unknown) => {
      setSaveState("Not saved — export a backup");
      setError(`${cause instanceof Error ? cause.message : "Your browser could not save this change."} Export a backup to keep your annotations.`);
    }).finally(() => { pendingSaves.current--; });
  }, []);

  function resetSelection() { setSelectedId(null); setTime(0); setStart(0); setEnd(0.5); setFilter("all"); setLoop(false); setSpeed(1); setUndo(null); }

  function confirmLeave(event: { preventDefault: () => void }) {
    if ((pendingSaves.current > 0 || unsavedProjects.current.size > 0) && !window.confirm("Some annotations have not been saved. Cancel and export a backup to keep them, or leave and discard those changes.")) event.preventDefault();
  }

  function playhead() { return videoRef.current?.currentTime ?? time; }

  function switchProject(id: string) {
    loadingRef.current?.abort();
    setBusy(null);
    setPending(null);
    setVideoUrl(null);
    setActiveId(id || null);
    setError(""); setNotice(""); resetSelection();
  }

  async function openVideo(file: File, relink: boolean) {
    loadingRef.current?.abort();
    const controller = new AbortController();
    loadingRef.current = controller;
    const url = URL.createObjectURL(file);
    setBusy(0); setError(""); setNotice("");
    try {
      const [sha256, duration] = await Promise.all([
        hashVideo(file, (progress) => { if (!controller.signal.aborted) setBusy(progress); }, controller.signal),
        readDuration(url, controller.signal),
      ]);
      if (controller.signal.aborted) { URL.revokeObjectURL(url); return; }
      if (relink && project) {
        if (sha256 !== project.source.sha256) throw new Error("This is different footage. Reconnect the original video; filenames alone do not identify a source.");
        setVideoUrl(url);
        setNotice("Original footage verified. Your annotations are ready.");
      } else {
        setPending({ source: { source_id: crypto.randomUUID(), file_name: file.name, size_bytes: file.size, last_modified_ms: file.lastModified, duration_s: duration, sha256 }, file });
        URL.revokeObjectURL(url);
        setNewTitle(file.name.replace(/\.[^.]+$/, ""));
        setNewFight("");
      }
    } catch (cause) {
      URL.revokeObjectURL(url);
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not open this video.");
      controller.abort();
    } finally {
      if (loadingRef.current === controller) setBusy(null);
    }
  }

  function beginProject(event: React.FormEvent) {
    event.preventDefault();
    if (!pending) return;
    try {
      const next = createProject(pending.source, newTitle.trim(), newFight.trim());
      commit(next);
      setActiveId(next.project_id);
      setVideoUrl(URL.createObjectURL(pending.file));
      setPending(null); resetSelection(); setEnd(Math.min(0.5, next.source.duration_s));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Check the project details."); }
  }

  function seek(value: number) {
    if (!project || !videoRef.current || !videoUrl) return;
    const next = Math.max(0, Math.min(value, project.source.duration_s));
    videoRef.current.currentTime = next;
    windowPlayback.current = false;
    setTime(next);
  }

  function selectClip(clip: Clip) {
    setSelectedId(clip.clip_id); setStart(clip.start_time_s); setEnd(clip.end_time_s); seek(clip.start_time_s);
  }

  function openQueuedClip(clip: Clip) {
    selectClip(clip);
    if (window.matchMedia("(max-width: 900px)").matches) document.getElementById("footage")?.scrollIntoView({ block: "start" });
  }

  function newWindow() {
    if (!project) return;
    const current = Math.min(playhead(), Math.max(0, project.source.duration_s - 0.5));
    setSelectedId(null); setStart(current); setEnd(Math.min(current + 0.5, project.source.duration_s));
  }

  function validateRange() {
    if (!project || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > project.source.duration_s) {
      setError("Set an in point before the out point, within the video duration."); return false;
    }
    return true;
  }

  function saveWindow(label?: Label) {
    if (!project || !validateRange()) return;
    const duplicate = project.clips.find((clip) => clip.clip_id !== selectedId && clip.start_time_s === start && clip.end_time_s === end);
    if (duplicate) { selectClip(duplicate); setNotice("This window already exists. You can update its label."); return; }
    const clip = selected ?? createClip(start, end);
    const nextLabel = label ?? clip.label;
    const next = { ...clip, start_time_s: start, end_time_s: end, label: nextLabel, outcome: nextLabel === "attempt" ? clip.outcome : "unknown" as Outcome, updated_at: new Date().toISOString() };
    const timingChanged = selected && (selected.start_time_s !== start || selected.end_time_s !== end);
    const predictionRun = project.prediction_run && timingChanged ? { ...project.prediction_run, predictions: project.prediction_run.predictions.filter((row) => row.clip_id !== clip.clip_id) } : project.prediction_run;
    commit({ ...project, clips: [...project.clips.filter((item) => item.clip_id !== clip.clip_id), next].sort((a, b) => a.start_time_s - b.start_time_s), prediction_run: predictionRun?.predictions.length ? predictionRun : undefined });
    setSelectedId(clip.clip_id); setError("");
    setNotice(timingChanged ? "Window updated. Its old model score was removed; run prediction again for these times." : "");
  }

  function updateSelected(update: Partial<Pick<Clip, "notes" | "outcome">>) {
    if (!project || !selected) return;
    commit({ ...project, clips: project.clips.map((clip) => clip.clip_id === selectedId ? { ...clip, ...update, updated_at: new Date().toISOString() } : clip) });
  }

  function removeSelected() {
    if (!project || !selected) return;
    setUndo({ projectId: project.project_id, clip: selected });
    const predictionRun = project.prediction_run ? { ...project.prediction_run, predictions: project.prediction_run.predictions.filter((row) => row.clip_id !== selectedId) } : undefined;
    commit({ ...project, clips: project.clips.filter((clip) => clip.clip_id !== selectedId), prediction_run: predictionRun?.predictions.length ? predictionRun : undefined });
    setSelectedId(null); setNotice("Window removed.");
  }

  async function importJson(file: File, predictions: boolean) {
    setError(""); setNotice("");
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Choose an annotation or prediction JSON smaller than 10 MB.");
      const value: unknown = JSON.parse(await file.text());
      if (predictions) {
        if (!project) throw new Error("Open a project before importing predictions.");
        const run = parsePredictions(value, project);
        commit({ ...project, prediction_run: run });
        setNotice(`${run.predictions.length} model scores imported. Your labels are unchanged.`);
      } else {
        const restored = parseProject(value);
        if (projects.some((item) => item.project_id === restored.project_id) && !window.confirm("Replace the saved version of this project with the imported backup? Export your current work first if you need both versions.")) return;
        commit(restored); switchProject(restored.project_id);
        setNotice("Backup restored. Reconnect the original footage to continue.");
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not import this file."); }
  }

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!project || busy !== null || pending || event.ctrlKey || event.metaKey || event.altKey || target.closest("input, textarea, select, [contenteditable=true]")) return;
      if (["1", "2", "3"].includes(event.key)) { event.preventDefault(); saveWindow(({ "1": "attempt", "2": "no_attempt", "3": "uncertain" } as const)[event.key as "1" | "2" | "3"]); }
      if (event.key.toLowerCase() === "i") { event.preventDefault(); setStart(playhead()); }
      if (event.key.toLowerCase() === "o") { event.preventDefault(); setEnd(playhead()); }
      if (event.key.toLowerCase() === "n") { event.preventDefault(); newWindow(); }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); seek(playhead() + (event.key === "ArrowRight" ? 0.1 : -0.1)); }
      if (event.key === " " && !target.closest("button, a, video") && videoRef.current && videoUrl) { event.preventDefault(); if (videoRef.current.paused) void videoRef.current.play().catch(() => setError("Playback could not start. Try the video controls.")); else videoRef.current.pause(); }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });

  const clips = project?.clips ?? [];
  const selectedIndex = clips.findIndex((clip) => clip.clip_id === selectedId);
  const reviewed = clips.filter((clip) => ["attempt", "no_attempt"].includes(clip.label)).length;
  const visibleClips = clips.filter((clip) => filter === "all" || (filter === "disagreement" ? project && isDisagreement(clip, project) : clip.label === filter));
  const counts: Record<Filter, number> = { all: clips.length, unreviewed: clips.filter((clip) => clip.label === "unreviewed").length, uncertain: clips.filter((clip) => clip.label === "uncertain").length, disagreement: project ? clips.filter((clip) => isDisagreement(clip, project)).length : 0 };

  return (
    <main id="main" className={styles.workspace} data-lenis-prevent>
      <input ref={newVideoRef} type="file" accept="video/*" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void openVideo(file, false); }} />
      <input ref={relinkRef} type="file" accept="video/*" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void openVideo(file, true); }} />
      <input ref={backupRef} type="file" accept=".json,application/json" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void importJson(file, false); }} />
      <input ref={predictionRef} type="file" accept=".json,application/json" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void importJson(file, true); }} />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="STR1KE research report" onNavigate={confirmLeave}>STR1KE</Link>
        <div className={styles.projectPicker}>
          <label htmlFor="project">Film room</label>
          <select id="project" aria-label="Saved project" value={activeId ?? ""} disabled={!ready || busy !== null} onChange={(event) => switchProject(event.target.value)}>
            <option value="">{projects.length ? "Choose footage" : "No footage open"}</option>
            {projects.map((item) => <option key={item.project_id} value={item.project_id}>{item.title}</option>)}
          </select>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primary} disabled={!ready || busy !== null} onClick={() => newVideoRef.current?.click()}>Open footage</button>
          <button disabled={!ready || busy !== null} onClick={() => backupRef.current?.click()}>Import backup</button>
          <button disabled={!project} onClick={() => project && downloadProject(project)}>Export backup</button>
          <Link className={styles.demoLink} href="/demo" onNavigate={confirmLeave}>Demo</Link>
          <Link href="/" onNavigate={confirmLeave}>Research</Link>
        </div>
      </header>
      <div className={styles.statusBar}><span>{project ? project.source.file_name : "Video annotation"}</span><span role="status" className={styles.saveState}>{saveState}</span></div>

      {error && <div className={styles.error} role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
      {notice && <div className={styles.notice} role="status">{notice}{undo && undo.projectId === project?.project_id && <button onClick={() => { if (!project) return; commit({ ...project, clips: [...project.clips, undo.clip].sort((a, b) => a.start_time_s - b.start_time_s) }); setUndo(null); setNotice("Window restored. Model scores can be imported again."); }}>Undo</button>}<button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}
      {busy !== null && <div className={styles.hashProgress} role="status"><span>Verifying video · {Math.round(busy * 100)}%</span><progress max="1" value={busy} /><button onClick={() => { loadingRef.current?.abort(); setBusy(null); }}>Cancel</button></div>}

      {pending && <form className={styles.newProject} onSubmit={beginProject}>
        <div><span className={styles.eyebrow}>New source</span><h2>Name this footage</h2><p>{pending.source.file_name} · {formatTime(pending.source.duration_s)} · content verified</p></div>
        <label>Project name<input required maxLength={200} value={newTitle} onChange={(event) => setNewTitle(event.target.value)} /></label>
        <label>Fight ID<input required maxLength={200} placeholder="e.g. fighter-a-vs-fighter-b-2026" value={newFight} onChange={(event) => setNewFight(event.target.value)} /><small>Use the same ID for every camera angle and replay of this fight.</small></label>
        <div className={styles.actions}><button type="button" onClick={() => setPending(null)}>Cancel</button><button className={styles.primary} type="submit">Start labeling →</button></div>
      </form>}

      {!project ? pending ? null : <section className={`${styles.grid} ${styles.empty}`} aria-label="Open footage to begin">
        <div className={styles.review}>
          <div className={styles.stageHeading}><h1>Footage</h1><span>No video selected</span></div>
          <div className={styles.emptyViewer}>
            <div><h2>Open fight footage</h2><p>Choose a video from your computer to review and label.</p><button className={styles.primary} disabled={!ready || busy !== null} onClick={() => newVideoRef.current?.click()}>Choose video</button><small>MP4 or WebM · stays on your device</small></div>
          </div>
          <div className={styles.emptyCaption}><span>Mark a short window, watch it back, then label the action.</span><span><kbd>1</kbd> Attempt <kbd>2</kbd> No attempt <kbd>3</kbd> Uncertain</span></div>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sectionHeading}><h2>Review queue</h2><span>0 windows</span></div>
          <div className={styles.queueEmpty}><p>Your video windows will appear here.</p><button disabled={!ready || busy !== null} onClick={() => backupRef.current?.click()}>Restore a saved review</button></div>
          <div className={styles.emptyModel}><h2>Model predictions</h2><p>Scoring runs separately in Python. Import the results here to compare them with your labels.</p><span>Development model · accuracy on new fights is unverified.</span></div>
        </aside>
      </section> : <>
        <nav className={styles.mobileSections} aria-label="Workspace sections"><a href="#footage">Footage & labels</a><a href="#review-queue">Review queue <span>{clips.length}</span></a></nav>
        <div className={styles.grid}>
          <section id="footage" className={styles.review} aria-label="Footage and annotation controls">
            <div className={styles.stageHeading}><h1>{project.title}</h1><span>{formatTime(project.source.duration_s)}</span></div>
            <div className={styles.videoStage}>
              {videoUrl ? <video key={videoUrl} ref={videoRef} src={videoUrl} controls playsInline preload="metadata" onLoadedMetadata={(event) => { event.currentTarget.playbackRate = speed; seek(selected?.start_time_s ?? 0); }} onError={() => setError("Playback failed. Reconnect a video your browser can play.")} onTimeUpdate={(event) => { const video = event.currentTarget; setTime(video.currentTime); if (windowPlayback.current && end > start && video.currentTime >= end) { if (loop) video.currentTime = start; else { windowPlayback.current = false; video.pause(); video.currentTime = end; setTime(end); } } }} /> : <div className={styles.reconnect}><span className={styles.eyebrow}>Footage is local</span><h2>Reconnect your video</h2><p>{project.source.file_name}</p><button disabled={busy !== null} onClick={() => relinkRef.current?.click()}>Choose original file</button><small>Labels are saved. The video itself is never stored or uploaded.</small></div>}
            </div>
            <div className={styles.transport}><span className={styles.time}>{formatTime(time)} <small>/ {formatTime(project.source.duration_s)}</small></span><div className={styles.actions}><button disabled={!videoUrl} onClick={() => seek(playhead() - 0.1)} aria-label="Back 0.1 seconds">−0.1 s</button><button disabled={!videoUrl} onClick={() => seek(playhead() + 0.1)} aria-label="Forward 0.1 seconds">+0.1 s</button><select aria-label="Playback speed" value={speed} disabled={!videoUrl} onChange={(event) => { const value = Number(event.target.value); setSpeed(value); if (videoRef.current) videoRef.current.playbackRate = value; }}><option value="0.25">¼ speed</option><option value="0.5">½ speed</option><option value="1">1× speed</option></select></div></div>
            <div className={styles.annotation}>
              <div className={styles.sectionHeading}><h2>{selected ? "Review window" : "New window"}</h2><div className={styles.windowNavigation}><button aria-label="Previous window" disabled={selectedIndex <= 0} onClick={() => selectClip(clips[selectedIndex - 1])}>←</button><span>{selectedIndex >= 0 ? `${selectedIndex + 1} / ${clips.length}` : "—"}</span><button aria-label="Next window" disabled={!clips.length || selectedIndex >= clips.length - 1} onClick={() => selectClip(clips[selectedIndex + 1])}>→</button><button onClick={newWindow}>New window <kbd>N</kbd></button></div></div>
              <div className={styles.labelButtons} role="group" aria-label="Label this window">
                {(["attempt", "no_attempt", "uncertain"] as const).map((label, index) => <button key={label} aria-label={`${LABELS[label]} ${index + 1}`} aria-pressed={selected?.label === label} className={selected?.label === label ? styles.chosen : ""} onClick={() => saveWindow(label)}><kbd>{index + 1}</kbd><span>{LABELS[label]}</span></button>)}
              </div>
              <p className={styles.hint}>Label the attempt, including misses and blocks.</p>
              <div className={styles.range}>
                <label>In · seconds<div><input aria-label="Window in seconds" type="number" step="0.001" min="0" max={project.source.duration_s} value={Number.isNaN(start) ? "" : start} onChange={(event) => setStart(event.target.valueAsNumber)} /><button disabled={!videoUrl} onClick={() => setStart(Math.min(project.source.duration_s, Number(playhead().toFixed(3))))}>Set <kbd>I</kbd></button></div></label>
                <label>Out · seconds<div><input aria-label="Window out seconds" type="number" step="0.001" min="0" max={project.source.duration_s} value={Number.isNaN(end) ? "" : end} onChange={(event) => setEnd(event.target.valueAsNumber)} /><button disabled={!videoUrl} onClick={() => setEnd(Math.min(project.source.duration_s, Number(playhead().toFixed(3))))}>Set <kbd>O</kbd></button></div></label>
                <button className={styles.replay} disabled={!videoUrl} onClick={() => { if (validateRange()) { seek(start); windowPlayback.current = true; void videoRef.current?.play().catch(() => setError("Use the video controls to start playback.")); } }}>▶ Play window</button>
              </div>
              <div className={styles.rangeMeta}><label><input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} /> Repeat window</label><span>{Number.isFinite(end - start) && end > start ? `${(end - start).toFixed(3)} s selected` : "Set a valid range"}{changedRange ? " · unsaved times" : ""}</span><button onClick={() => saveWindow()}>{selected ? "Update times" : "Save unlabeled"}</button></div>
              {selected && <div className={styles.detailsEditor}>
                <label>Outcome<select aria-label="Attempt outcome" value={selected.outcome} disabled={selected.label !== "attempt"} onChange={(event) => updateSelected({ outcome: event.target.value as Outcome })}><option value="unknown">Not established</option><option value="landed">Landed</option><option value="blocked">Blocked</option><option value="missed">Missed</option></select></label>
                <label>Review notes<textarea rows={2} maxLength={4000} placeholder="What makes this window clear or ambiguous?" value={selected.notes} onChange={(event) => updateSelected({ notes: event.target.value })} /></label>
                <div className={styles.selectionFooter}><code>{selected.clip_id.slice(0, 8)}</code><button onClick={removeSelected}>Remove window</button></div>
              </div>}
            </div>
            <details className={styles.details}><summary>Footage details & saved project</summary><div className={styles.projectDetails}><label>Project name<input key={`${project.project_id}-${project.title}`} maxLength={200} defaultValue={project.title} onBlur={(event) => { const title = event.target.value.trim(); if (!title) { event.target.value = project.title; setError("Project name cannot be empty."); return; } if (title !== project.title) commit({ ...project, title }); }} /></label><label>Fight ID<input key={`${project.project_id}-${project.fight_id}`} maxLength={200} defaultValue={project.fight_id} onBlur={(event) => { const fight_id = event.target.value.trim(); if (!fight_id) { event.target.value = project.fight_id; setError("Fight ID cannot be empty."); return; } if (fight_id !== project.fight_id) commit({ ...project, fight_id }); }} /></label><p>All windows stay in development. Reviewing footage here does not make it an untouched test set.</p><p><strong>Source hash</strong><code className={styles.hash}>{project.source.sha256}</code></p><button className={styles.danger} onClick={async () => { if (!window.confirm(`Delete the saved project “${project.title}”? Export a backup first to keep these annotations.`)) return; try { await saves.current; await deleteProject(project.project_id, savedVersions.current.get(project.project_id) ?? null); savedVersions.current.delete(project.project_id); unsavedProjects.current.delete(project.project_id); setProjects((items) => items.filter((item) => item.project_id !== project.project_id)); switchProject(""); } catch { setError("Could not delete the saved project."); } }}>Delete saved project</button></div></details>
          </section>

          <aside className={styles.sidebar}>
            <section id="review-queue" className={styles.windows}>
              <div className={styles.sectionHeading}><h2>Review queue</h2><span>{clips.length} windows</span></div>
              <div className={styles.stats}><span>{reviewed} labeled</span><progress value={reviewed} max={clips.length || 1} aria-label="Windows with definitive labels" /><span>{counts.uncertain} uncertain</span></div>
              <div className={styles.filters} aria-label="Filter windows">{(["all", "unreviewed", "uncertain", "disagreement"] as const).map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{({ all: "All", unreviewed: "Needs label", uncertain: "Uncertain", disagreement: "Disagreements" })[value]}<span>{counts[value]}</span></button>)}</div>
              <div className={styles.queueColumns} aria-hidden="true"><span>Time</span><span>Label</span><span>Score</span></div>
              <div className={styles.clipList}>
                {visibleClips.length === 0 ? <div className={styles.queueEmpty}><strong>{clips.length ? "No matching windows" : "No windows yet"}</strong><p>{clips.length ? "Choose another filter to continue." : "Set in and out points, then choose a label."}</p></div> : visibleClips.map((clip) => {
                  const score = project.prediction_run?.predictions.find((row) => row.clip_id === clip.clip_id);
                  return <button key={clip.clip_id} className={`${styles.clipRow} ${selectedId === clip.clip_id ? styles.activeClip : ""}`} onClick={() => openQueuedClip(clip)} aria-label={`Review ${formatTime(clip.start_time_s)} to ${formatTime(clip.end_time_s)}, ${LABELS[clip.label]}`} aria-pressed={selectedId === clip.clip_id}><span className={styles.clipTime}>{formatTime(clip.start_time_s)}<span> — {formatTime(clip.end_time_s)}</span></span><span className={styles.clipLabel} data-label={clip.label}>{LABELS[clip.label]}{clip.label === "attempt" && clip.outcome !== "unknown" ? <small>{clip.outcome}</small> : null}</span><span className={styles.clipScore}>{score ? <>{score.probability_strike.toFixed(3)}{isDisagreement(clip, project) && <small>differs</small>}</> : "—"}</span></button>;
                })}
              </div>
            </section>
            <section className={styles.modelPanel}>
              <div className={styles.sectionHeading}><h2>Model predictions</h2><button onClick={() => predictionRef.current?.click()}>Import scores</button></div>
              {project.prediction_run ? <><p className={styles.modelName}>{project.prediction_run.predictions.length} windows scored · threshold {project.prediction_run.model.threshold}</p>{selected && prediction ? <div className={styles.predictionDetail}><span>{prediction.probability_strike >= project.prediction_run.model.threshold ? "Model: attempt" : "Model: no attempt"}</span><strong>{prediction.probability_strike.toFixed(3)}</strong>{isDisagreement(selected, project) && <p>Differs from your label. Check the footage before changing it.</p>}</div> : <p className={styles.hint}>{changedRange ? "Save the new times, then rerun predictions for this window." : "Select a window to inspect its score."}</p>}<p className={styles.hint}>Development model. Accuracy on new fights is unverified; scores never change your labels.</p></> : <p>Scoring runs separately in Python. Import <code>predictions.json</code> to review the results here.</p>}
              <details className={styles.runInstructions}><summary>Run predictions locally</summary><ol><li>Export your annotation backup.</li><li>Prepare the windows from the original video:<pre>python -m model.prepare \
  --annotations annotations.json \
  --video /path/to/footage.mp4 \
  --output data-local/reviewed</pre></li><li>Run a saved checkpoint:<pre>python -m model.predict \
  --prepared data-local/reviewed \
  --run runs/review-development \
  --output runs/workspace-review</pre></li><li>Import <code>runs/workspace-review/predictions.json</code> here.</li></ol><p>Run commands from the repository with its Python environment active. Use new output directories each time. The development checkpoint is for diagnostics; new-fight performance is not established.</p></details>
            </section>
          </aside>
        </div>
        <footer className={styles.footer}><span>Local footage · browser-saved annotations · development data</span><span><kbd>Space</kbd> Play / pause <kbd>← →</kbd> Seek <kbd>I O</kbd> Set range <kbd>1 2 3</kbd> Label</span></footer>
      </>}
    </main>
  );
}
