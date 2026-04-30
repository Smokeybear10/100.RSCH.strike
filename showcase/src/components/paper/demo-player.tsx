"use client";

/* Three-tab clip player. Loads individual JPG frames from /clips/<name>/
   and plays them on a canvas at the clip's fps — same frame loader as the
   FilmRoom in the cinematic variant, restyled for paper. The sidebar reads
   the model call, confidence bar, and clip commentary in real time. */

import { useEffect, useRef, useState } from "react";
import type { ResearchClip } from "@/lib/research-data";
import { framePath, getConfidence, getPrediction } from "@/lib/player-utils";

const ric =
  typeof window !== "undefined" && window.requestIdleCallback
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1) as unknown as number;

type Props = { clips: ResearchClip[] };

export function DemoPlayer({ clips }: Props) {
  const [clipIdx, setClipIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const clip = clips[clipIdx];
  const { totalFrames, fps, windowSize, predictions, frameDir } = clip;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const sizeRef = useRef({ w: 0, h: 0 });

  // Preload frames whenever the clip changes
  useEffect(() => {
    const cache = new Map<number, HTMLImageElement>();
    cacheRef.current = cache;
    setLoaded(false);
    setFrameIdx(0);

    const eager = Math.min(30, totalFrames);
    let loadedCount = 0;

    const loadFrame = (i: number) => {
      const img = new Image();
      img.src = framePath(frameDir, i);
      img.onload = () => {
        cache.set(i, img);
        loadedCount++;
        if (loadedCount >= eager) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= eager) setLoaded(true);
      };
    };

    for (let i = 0; i < eager; i++) loadFrame(i);

    let bg = eager;
    const loadBatch = () => {
      const end = Math.min(bg + 20, totalFrames);
      for (let i = bg; i < end; i++) loadFrame(i);
      bg = end;
      if (bg < totalFrames) ric(loadBatch);
    };
    if (eager < totalFrames) ric(loadBatch);
  }, [totalFrames, frameDir]);

  // Draw the current frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw = (image: HTMLImageElement) => {
      if (
        sizeRef.current.w !== image.naturalWidth ||
        sizeRef.current.h !== image.naturalHeight
      ) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        sizeRef.current = {
          w: image.naturalWidth,
          h: image.naturalHeight,
        };
      }
      ctx.drawImage(image, 0, 0);
    };
    const img = cacheRef.current.get(frameIdx);
    if (img) {
      draw(img);
      return;
    }
    // Fall back to nearest cached neighbor while we wait for this frame
    for (let off = 1; off < 20; off++) {
      const near =
        cacheRef.current.get(frameIdx - off) ||
        cacheRef.current.get(frameIdx + off);
      if (near) {
        draw(near);
        return;
      }
    }
  }, [frameIdx]);

  // Playback loop at clip fps
  useEffect(() => {
    if (!loaded || !playing) return;
    let raf: number;
    let last = performance.now();
    const interval = 1000 / fps;
    const tick = (now: number) => {
      if (now - last >= interval) {
        last = now;
        setFrameIdx((p) => (p + 1) % totalFrames);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded, playing, fps, totalFrames]);

  const confidence = getConfidence(frameIdx, predictions, windowSize);
  const pred = getPrediction(frameIdx, predictions, windowSize);
  const isStrike = pred?.label === "strike";
  const winIdx = Math.floor(frameIdx / windowSize);

  return (
    <div className="grid">
      {/* Tabs */}
      <div className="flex border border-b-0 border-rule">
        {clips.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClipIdx(i)}
            className={[
              "flex flex-1 items-baseline gap-2.5 border-r border-rule px-4 py-3.5 text-left font-mono transition-colors last:border-r-0",
              i === clipIdx
                ? "bg-paper-2 text-ink"
                : "text-ink-dim hover:text-ink",
            ].join(" ")}
          >
            <span
              className={`text-[10px] tracking-[0.2em] ${
                i === clipIdx ? "text-red-600" : "text-ink-faint"
              }`}
            >
              0{i + 1}
            </span>
            <span className="text-sm uppercase tracking-[0.12em]">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Stage: canvas + sidebar */}
      <div className="grid border border-rule bg-paper-2 md:grid-cols-[1fr_320px]">
        <div
          role="button"
          tabIndex={0}
          aria-label={playing ? "Pause playback" : "Play playback"}
          onClick={() => setPlaying((p) => !p)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            setPlaying((p) => !p);
          }}
          className="relative aspect-video cursor-pointer overflow-hidden border-rule bg-black outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 md:border-r"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-contain transition-[filter] duration-300"
            style={{ filter: loaded ? "none" : "blur(14px)" }}
            aria-label="Live frame playback"
          />
          {/* Strike flash */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-150"
            style={{
              opacity: isStrike ? 1 : 0,
              background:
                "radial-gradient(circle, rgba(220,38,38,0.22) 0%, transparent 60%)",
            }}
          />
          <Corners />

          {/* Top overlay */}
          <div className="absolute inset-x-0 top-0 flex justify-between px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
            <span className="inline-flex items-center gap-2 text-red-600">
              <span className="paper-pulse h-1.5 w-1.5 rounded-full bg-red-600" />
              live inference
            </span>
            <span>{fps} fps · 5-frame windows</span>
          </div>
          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
            <span>
              f{String(frameIdx).padStart(3, "0")} / {totalFrames - 1}
            </span>
            <span>
              w{String(winIdx).padStart(2, "0")} / {predictions.length - 1}
            </span>
          </div>
        </div>

        {/* Telemetry sidebar */}
        <div className="flex flex-col gap-5 bg-paper p-5">
          <Block label="model call">
            <div
              className={
                isStrike
                  ? "font-mono text-[26px] uppercase leading-none tracking-[0.15em] text-red-600"
                  : "font-serif text-[28px] italic leading-none text-ink-mute"
              }
            >
              {isStrike ? "STRIKE" : "neutral"}
            </div>
          </Block>

          <Block label="P(strike)">
            <div className="tnum mb-2.5 font-mono text-[30px] leading-none text-ink">
              {confidence.toFixed(3)}
            </div>
            <div className="relative h-[3px] bg-paper-3">
              <div
                className="absolute inset-y-0 left-0 bg-red-600 transition-[width] duration-100"
                style={{ width: `${confidence * 100}%` }}
              />
              <div className="absolute -top-1 -bottom-1 left-1/2 w-px bg-ink-faint" />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] tracking-[0.1em] text-ink-faint">
              <span>0.0</span>
              <span>0.5</span>
              <span>1.0</span>
            </div>
          </Block>

          <Block label="clip">
            <div className="font-serif text-xl text-ink">{clip.name}</div>
            <div className="mt-0.5 font-serif text-[13px] italic text-ink-dim">
              {clip.subtitle}
            </div>
          </Block>

          <Block label="commentary">
            <p className="m-0 font-serif text-[13px] leading-[1.5] text-ink-mute">
              {clip.notes}
            </p>
          </Block>
        </div>
      </div>

      {/* Per-window bars strip */}
      <div className="border border-t-0 border-rule bg-paper-2 px-4 py-3.5">
        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          <span>per-window calls</span>
          <span>
            {predictions.length} windows · {totalFrames} frames
          </span>
        </div>
        <div className="relative flex h-14 items-end gap-px">
          {predictions.map((p, i) => {
            const cur = i === winIdx;
            const hit = p.confidence >= 0.5;
            return (
              <button
                key={i}
                type="button"
                title={`w${i} · ${p.confidence.toFixed(3)}`}
                onClick={() => setFrameIdx(i * windowSize)}
                className={[
                  "flex-1 cursor-pointer transition-colors",
                  cur
                    ? "bg-red-600"
                    : hit
                      ? "bg-red-600/50 hover:bg-red-700"
                      : "bg-ink/20 hover:bg-ink",
                ].join(" ")}
                style={{ height: `${Math.max(4, p.confidence * 100)}%` }}
                aria-label={`Jump to window ${i}, P(strike) ${p.confidence.toFixed(3)}`}
              />
            );
          })}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-ink/20" />
        </div>
      </div>

      {/* Controls + scrub bar */}
      <div className="flex items-center gap-5 border border-t-0 border-rule px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-red-600"
        >
          {playing ? "◼ pause" : "▶ play"}
        </button>
        <ScrubBar
          frameIdx={frameIdx}
          totalFrames={totalFrames}
          onSeek={(f) => setFrameIdx(f)}
          onSeekStart={() => setPlaying(false)}
        />
        <span className="tnum text-ink-mute whitespace-nowrap">
          {(frameIdx / fps).toFixed(2)}s /{" "}
          {((totalFrames - 1) / fps).toFixed(2)}s
        </span>
      </div>
    </div>
  );
}

function ScrubBar({
  frameIdx,
  totalFrames,
  onSeek,
  onSeekStart,
}: {
  frameIdx: number;
  totalFrames: number;
  onSeek: (f: number) => void;
  onSeekStart: () => void;
}) {
  const progress = frameIdx / Math.max(1, totalFrames - 1);

  const seekFromEvent = (clientX: number, rect: DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(Math.round(pct * (totalFrames - 1)));
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Playback position"
      aria-valuemin={0}
      aria-valuemax={totalFrames - 1}
      aria-valuenow={frameIdx}
      className="relative h-3 flex-1 cursor-pointer"
      onClick={(e) => seekFromEvent(e.clientX, e.currentTarget.getBoundingClientRect())}
      onMouseDown={(e) => {
        onSeekStart();
        const bar = e.currentTarget;
        const move = (ev: MouseEvent) => seekFromEvent(ev.clientX, bar.getBoundingClientRect());
        const stop = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", stop);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", stop);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          onSeek(Math.min(totalFrames - 1, frameIdx + 1));
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          onSeek(Math.max(0, frameIdx - 1));
        } else if (e.key === "Home") {
          e.preventDefault();
          onSeek(0);
        } else if (e.key === "End") {
          e.preventDefault();
          onSeek(totalFrames - 1);
        }
      }}
    >
      <div className="absolute inset-y-1 left-0 right-0 bg-ink/15">
        <div
          className="absolute inset-y-0 left-0 bg-red-600"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div
        className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-red-600"
        style={{ left: `calc(${progress * 100}% - 5px)` }}
      />
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </div>
      {children}
    </div>
  );
}

function Corners() {
  const base = "absolute h-3 w-3 border-red-600";
  return (
    <div className="pointer-events-none">
      <span className={`${base} top-2 left-2 border-t border-l`} />
      <span className={`${base} top-2 right-2 border-t border-r`} />
      <span className={`${base} bottom-2 left-2 border-b border-l`} />
      <span className={`${base} bottom-2 right-2 border-b border-r`} />
    </div>
  );
}
