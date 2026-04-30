"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Clip } from "@/lib/types";
import { framePath, getPrediction } from "@/lib/player-utils";
import styles from "./demo-player.module.css";

type ModelRun = { name: string; threshold: number; trainingClipCount: number; checkpointSha256: string };
type Props = { clips: Clip[]; model: ModelRun };
type FrameStatus = "loading" | "ready" | "unavailable";

export function DemoPlayer({ clips, model }: Props) {
  const [clipIdx, setClipIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  return <ClipPlayer key={clips[clipIdx].id} clips={clips} model={model} clipIdx={clipIdx}
    onClipChange={setClipIdx} playing={playing} setPlaying={setPlaying} />;
}

function ClipPlayer({ clips, model, clipIdx, onClipChange, playing, setPlaying }: Props & {
  clipIdx: number;
  onClipChange: (index: number) => void;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
}) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [frameStatus, setFrameStatus] = useState<FrameStatus>("loading");
  const clip = clips[clipIdx];
  const { totalFrames, fps, windowSize, predictions, frameDir } = clip;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef(new Map<number, HTMLImageElement>());
  const failedRef = useRef(new Set<number>());
  const currentFrameRef = useRef(0);

  const drawFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const image = cacheRef.current.get(frame);
    if (!image) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFrameStatus(failedRef.current.has(frame) ? "unavailable" : "loading");
      if (failedRef.current.has(frame)) setPlaying(false);
      return;
    }
    if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
    }
    ctx.drawImage(image, 0, 0);
    setFrameStatus("ready");
  }, [setPlaying]);

  useEffect(() => {
    const cache = new Map<number, HTMLImageElement>();
    const failed = new Set<number>();
    cacheRef.current = cache;
    failedRef.current = failed;
    let active = true;
    let completed = 0;
    const eager = Math.min(30, totalFrames);
    let timer: ReturnType<typeof setTimeout>;

    function finish(index: number) {
      if (!active) return;
      if (index === currentFrameRef.current) drawFrame(index);
      if (index < eager && ++completed === eager) setLoaded(true);
    }
    function load(index: number) {
      const image = new Image();
      image.onload = () => { if (active) { cache.set(index, image); finish(index); } };
      image.onerror = () => { if (active) { failed.add(index); finish(index); } };
      image.src = framePath(frameDir, index);
    }
    for (let index = 0; index < eager; index++) load(index);
    let next = eager;
    function loadBatch() {
      if (!active) return;
      const end = Math.min(next + 20, totalFrames);
      for (let index = next; index < end; index++) load(index);
      next = end;
      if (next < totalFrames) timer = setTimeout(loadBatch, 20);
    }
    timer = setTimeout(loadBatch, 20);
    return () => { active = false; clearTimeout(timer); };
  }, [drawFrame, frameDir, totalFrames]);

  useEffect(() => {
    currentFrameRef.current = frameIdx;
    drawFrame(frameIdx);
  }, [drawFrame, frameIdx]);

  useEffect(() => {
    if (!loaded || !playing) return;
    let raf: number;
    let last = performance.now();
    const interval = 1000 / fps;
    const tick = (now: number) => {
      const steps = Math.floor((now - last) / interval);
      if (steps > 0) {
        last += steps * interval;
        setFrameIdx((frame) => (frame + steps) % totalFrames);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, loaded, playing, totalFrames]);

  const windowIdx = Math.floor(frameIdx / windowSize);
  const prediction = getPrediction(frameIdx, predictions, windowSize);
  const score = prediction?.confidence ?? 0;
  const chartX = (index: number) => 8 + index / Math.max(1, predictions.length - 1) * 624;
  const chartY = (value: number) => 80 - value * 72;
  const points = predictions.map((row, index) => `${chartX(index)},${chartY(row.confidence)}`).join(" ");

  function seek(frame: number) {
    setPlaying(false);
    setFrameIdx(Math.max(0, Math.min(totalFrames - 1, frame)));
  }

  return (
    <div className={styles.player}>
      <div className={styles.clipTabs} role="group" aria-label="Choose a demo clip">
        {clips.map((item, index) => <button key={item.id} type="button" aria-pressed={index === clipIdx}
          onClick={() => { setPlaying(false); onClipChange(index); }}>{item.name}</button>)}
      </div>

      <div className={styles.stage}>
        <canvas ref={canvasRef} aria-label={`${clip.name}, frame ${frameIdx + 1} of ${totalFrames}`} />
        {frameStatus !== "ready" && <div className={styles.frameStatus} role="status">
          {frameStatus === "loading" ? "Loading footage…" : <><strong>This frame could not load.</strong><span>Choose another clip or reload the page.</span></>}
        </div>}
        <button className={styles.stageControl} type="button" disabled={!loaded || frameStatus !== "ready"}
          aria-label={playing ? "Pause playback" : `Play ${clip.name}`} onClick={() => setPlaying((value) => !value)}>
          {!playing && frameStatus === "ready" && <span className={styles.playButton} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z" /></svg>
          </span>}
        </button>
      </div>

      <div className={styles.transport}>
        <button type="button" disabled={!loaded || frameStatus !== "ready"} onClick={() => setPlaying((value) => !value)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">{playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="M4 2l10 6-10 6z" />}</svg>
          {playing ? "Pause" : "Play"}
        </button>
        <input type="range" aria-label="Playback position" min={0} max={totalFrames - 1} value={frameIdx}
          aria-valuetext={`Frame ${frameIdx + 1} of ${totalFrames}`} onPointerDown={() => setPlaying(false)} onChange={(event) => seek(Number(event.target.value))} />
        <span className={styles.frameCounter}>Frame {frameIdx + 1} / {totalFrames}</span>
      </div>

      <div className={styles.readout}>
        <div><span className={styles.caption}>Prediction</span><strong>{frameStatus !== "ready" ? "Frame unavailable" : score >= model.threshold ? "Attempt" : "No attempt"}</strong></div>
        <div><span className={styles.caption}>Score</span><strong className={styles.score}>{frameStatus === "ready" ? score.toFixed(3) : "—"}</strong></div>
        <div className={styles.windowNav}>
          <button type="button" aria-label="Previous scored window" disabled={windowIdx === 0} onClick={() => seek((windowIdx - 1) * windowSize)}>←</button>
          <span>Window {windowIdx + 1} / {predictions.length}</span>
          <button type="button" aria-label="Next scored window" disabled={windowIdx === predictions.length - 1} onClick={() => seek((windowIdx + 1) * windowSize)}>→</button>
        </div>
      </div>

      <div className={styles.notes}>
        <p>Recorded predictions · Accuracy on these clips has not been measured.</p>
        <details><summary>Model details</summary>
          <div className={styles.timeline}>
            <div className={styles.timelineHeading}><span>Scores across the clip</span><span>Threshold {model.threshold.toFixed(2)}</span></div>
            <svg viewBox="0 0 640 88" preserveAspectRatio="none" role="img" aria-label={`${predictions.length} recorded model scores, threshold ${model.threshold}`}>
              <line className={styles.threshold} x1="0" x2="640" y1={chartY(model.threshold)} y2={chartY(model.threshold)} />
              <polyline className={styles.scoreLine} points={points} />
              <line className={styles.playhead} x1={chartX(windowIdx)} x2={chartX(windowIdx)} y1="0" y2="88" />
              {frameStatus === "ready" && <circle className={styles.scorePoint} cx={chartX(windowIdx)} cy={chartY(score)} r="3" />}
            </svg>
          </div>
          <dl><div><dt>Checkpoint</dt><dd>{model.name}</dd></div><div><dt>Training data</dt><dd>{model.trainingClipCount} legacy windows</dd></div><div><dt>Input</dt><dd>{windowSize} sampled frames per window</dd></div><div><dt>Preview speed</dt><dd>{fps} frames per second</dd></div></dl>
          <p>Source timing was not recorded; preview speed is for playback only. Clips may include cuts and replays. Scores are model outputs, not calibrated confidence or verified strike counts.</p>
          <code>{model.checkpointSha256}</code>
        </details>
      </div>
    </div>
  );
}
