"use client";

import { useEffect, useRef, useState } from "react";
import { demoClips } from "@/lib/demo-data";
import { framePath, getConfidence, getPrediction } from "@/lib/player-utils";

type Props = { clipIdx: number; onClipChange?: (idx: number) => void; clipProgress?: number };

export function FilmRoom({ clipIdx, onClipChange, clipProgress = 0 }: Props) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);

  // Clip name visible for first 60% of each clip's scroll, then fades out over next 20%
  const nameOpacity = clipProgress < 0.60
    ? 1
    : clipProgress < 0.80
      ? 1 - (clipProgress - 0.60) / 0.20
      : 0;

  const clip = demoClips[clipIdx];
  const { totalFrames, fps, windowSize, predictions, frameDir, name } = clip;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<Map<number, HTMLImageElement>>(new Map());

  // Preload frames when clip changes
  useEffect(() => {
    const cache = new Map<number, HTMLImageElement>();
    cacheRef.current = cache;
    setLoaded(false);
    setFrameIdx(0);

    let loadedCount = 0;
    const eager = Math.min(30, totalFrames);

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
      if (bg < totalFrames) requestIdleCallback(loadBatch);
    };
    if (eager < totalFrames) requestIdleCallback(loadBatch);
  }, [totalFrames, frameDir]);

  // Draw current frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = cacheRef.current.get(frameIdx);
    if (img) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    } else {
      for (let offset = 1; offset < 20; offset++) {
        const near =
          cacheRef.current.get(frameIdx - offset) ||
          cacheRef.current.get(frameIdx + offset);
        if (near) {
          canvas.width = near.naturalWidth;
          canvas.height = near.naturalHeight;
          ctx.drawImage(near, 0, 0);
          return;
        }
      }
    }
  }, [frameIdx]);

  // Auto-playback loop
  useEffect(() => {
    if (!loaded || !playing) return;
    let rafId: number;
    let last = performance.now();
    const frameInterval = 1000 / fps;

    const tick = (now: number) => {
      if (now - last >= frameInterval) {
        last = now;
        setFrameIdx((prev) => (prev + 1) % totalFrames);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [loaded, playing, fps, totalFrames]);

  const confidence = getConfidence(frameIdx, predictions, windowSize);
  const prediction = getPrediction(frameIdx, predictions, windowSize);
  const isStrike = prediction?.label === "strike";
  const currentWindow = Math.floor(frameIdx / windowSize);
  const progress = frameIdx / (totalFrames - 1);

  return (
    <div className="h-full flex flex-col max-w-[1360px] mx-auto w-full px-4 py-2">
      {/* Header row */}
      <div className="flex items-end justify-between mb-2 flex-shrink-0">
        <div>
          <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
            ⟨ The Film Room ⟩
          </div>
          <h2 className="text-[18px] sm:text-[22px] font-black tracking-wide uppercase text-white leading-none mt-1 font-[family-name:var(--font-anton)]">
            Watch the model call the fight
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {demoClips.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onClipChange?.(i)}
              className="text-[10px] sm:text-[11px] font-black tracking-[3px] uppercase font-[family-name:var(--font-oswald)] px-2.5 py-1 transition-all duration-200 cursor-pointer"
              style={{
                background: i === clipIdx ? "#dc2626" : "transparent",
                color: i === clipIdx ? "#fff" : "rgba(255,255,255,0.4)",
                border: i === clipIdx ? "1px solid #dc2626" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main panel — stretches to fill remaining vertical space */}
      <div className="flex-1 min-h-0 flex items-stretch">
        <div className="w-full border-[3px] border-[#dc2626] bg-[#0a0000] shadow-[0_0_40px_rgba(220,38,38,0.2)] flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1 bg-[#dc2626]/15 border-b-2 border-[#dc2626]/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] live-dot" />
              <span className="text-[10px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                Live Inference · {name}
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-[2px] text-white/60 uppercase">
              {fps} FPS · Window {windowSize}F · {predictions.length} Calls
            </span>
          </div>

          {/* Video + telemetry split */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] min-h-0 flex-1">
            {/* Canvas */}
            <div
              className="relative bg-black overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-[#dc2626]/40 min-h-[280px] lg:min-h-0 cursor-pointer"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={() => setPlaying((p) => !p)}
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain transition-[filter] duration-300"
                style={{ filter: loaded ? "none" : "blur(14px)" }}
              />
              {/* Strike flash */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: isStrike
                    ? "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.28) 0%, transparent 60%)"
                    : "transparent",
                  opacity: isStrike ? 1 : 0,
                }}
              />
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#f59e0b]/70 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#f59e0b]/70 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#f59e0b]/70 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#f59e0b]/70 pointer-events-none" />
              {/* On-frame badge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <div
                  className="px-3 py-1 text-[10px] font-black tracking-[4px] uppercase font-[family-name:var(--font-oswald)] transition-all duration-200 backdrop-blur-md"
                  style={{
                    background: isStrike ? "#dc2626" : "rgba(0,0,0,0.6)",
                    color: isStrike ? "#ffffff" : "rgba(255,255,255,0.8)",
                    border: isStrike
                      ? "1px solid #dc2626"
                      : "1px solid rgba(255,255,255,0.15)",
                    boxShadow: isStrike
                      ? "0 0 24px rgba(220,38,38,0.6)"
                      : "none",
                  }}
                >
                  {isStrike ? "● STRIKE" : "○ NEUTRAL"}
                </div>
              </div>
              {/* Clip name overlay — scroll-driven fade */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: nameOpacity }}
              >
                <div className="flex flex-col items-center">
                  <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-2 font-[family-name:var(--font-oswald)]">
                    ● Bout {String(clipIdx + 1).padStart(2, "0")} ●
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-[2px] bg-[#dc2626]" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
                    <div className="w-10 h-[2px] bg-[#dc2626]" />
                  </div>
                  <div
                    className="text-[48px] sm:text-[64px] font-black tracking-[6px] uppercase text-white font-[family-name:var(--font-anton)] leading-none"
                    style={{ textShadow: "0 0 40px rgba(220,38,38,0.6), 0 4px 20px rgba(0,0,0,0.9)" }}
                  >
                    {name}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-[2px] bg-[#dc2626]" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
                    <div className="w-10 h-[2px] bg-[#dc2626]" />
                  </div>
                </div>
              </div>
              {/* Hover pause/play overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200"
                style={{ opacity: hovering ? 1 : 0 }}
              >
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border-2 border-white/20 flex items-center justify-center">
                  {playing ? (
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
                      <rect width="6" height="24" />
                      <rect x="14" width="6" height="24" />
                    </svg>
                  ) : (
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="white" className="ml-1">
                      <path d="M0 0l20 12-20 12z" />
                    </svg>
                  )}
                </div>
              </div>
              {/* Frame counter overlay */}
              <div className="absolute bottom-3 left-3 text-[9px] font-mono tracking-[2px] uppercase text-white/70 bg-black/50 backdrop-blur-sm px-2 py-1">
                F {String(frameIdx).padStart(3, "0")} / {totalFrames - 1}
              </div>
              {/* Hover hint */}
              <div
                className="absolute bottom-3 right-3 text-[8px] font-mono tracking-[2px] uppercase text-white/50 bg-black/50 backdrop-blur-sm px-2 py-1 transition-opacity duration-200"
                style={{ opacity: hovering ? 1 : 0 }}
              >
                {playing ? "CLICK TO PAUSE" : "CLICK TO PLAY"}
              </div>
            </div>

            {/* Telemetry panel */}
            <div className="p-3 flex flex-col gap-2 justify-center">
              <div>
                <div className="text-[8px] font-mono tracking-[3px] uppercase text-white/40 mb-1">
                  Prediction
                </div>
                <div
                  className="text-[24px] font-black tracking-[3px] uppercase font-[family-name:var(--font-oswald)] leading-none transition-colors duration-200"
                  style={{ color: isStrike ? "#dc2626" : "#ffffff" }}
                >
                  {isStrike ? "STRIKE" : "NEUTRAL"}
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between mb-1.5">
                  <div className="text-[8px] font-mono tracking-[3px] uppercase text-white/40">
                    Confidence
                  </div>
                  <div
                    className="text-[26px] font-black tabular-nums leading-none font-[family-name:var(--font-oswald)]"
                    style={{
                      color: isStrike ? "#f59e0b" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {confidence.toFixed(3)}
                  </div>
                </div>
                <div className="relative h-[3px] bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 transition-[width] duration-100"
                    style={{
                      width: `${confidence * 100}%`,
                      background:
                        confidence >= 0.5
                          ? "linear-gradient(90deg, #dc2626, #f59e0b)"
                          : "rgba(255,255,255,0.3)",
                    }}
                  />
                  <div className="absolute top-[-3px] bottom-[-3px] left-1/2 w-px bg-white/30" />
                </div>
                <div className="flex items-center justify-between mt-1 text-[7px] font-mono tracking-[2px] uppercase text-white/30">
                  <span>0.000</span>
                  <span>TH 0.5</span>
                  <span>1.000</span>
                </div>
              </div>

              <div>
                <div className="text-[8px] font-mono tracking-[3px] uppercase text-white/40 mb-1">
                  Window
                </div>
                <div className="text-[18px] font-mono font-bold tabular-nums text-white/90 leading-none">
                  {String(currentWindow).padStart(2, "0")}
                  <span className="text-white/30 text-[13px]">
                    {" "}
                    / {predictions.length - 1}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="text-[8px] font-mono tracking-[3px] uppercase text-white/40 mb-1">
                  Window Range
                </div>
                <div className="text-[11px] font-mono tabular-nums text-white/70">
                  F{prediction?.startFrame ?? 0}{" — "}F
                  {prediction?.endFrame ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline strip */}
          <div className="px-3 pt-1.5 pb-1.5 border-t-2 border-[#dc2626]/40 bg-black/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-1 text-[8px] font-mono tracking-[3px] uppercase text-white/40">
              <span>Per-Window Calls</span>
              <span>
                {predictions.length} Windows · {totalFrames} Frames
              </span>
            </div>
            <div className="flex items-end gap-[2px] h-8 relative">
              {predictions.map((p, i) => {
                const isCurrent = i === currentWindow;
                const h = Math.max(2, p.confidence * 100);
                const isHit = p.confidence >= 0.5;
                return (
                  <div
                    key={i}
                    className="flex-1 relative cursor-pointer"
                    style={{ height: "100%" }}
                    title={`W${i} · ${p.confidence.toFixed(3)}`}
                    onClick={() => setFrameIdx(i * windowSize)}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-100"
                      style={{
                        height: `${h}%`,
                        background: isHit
                          ? isCurrent
                            ? "#dc2626"
                            : "rgba(220,38,38,0.65)"
                          : isCurrent
                          ? "#ffffff"
                          : "rgba(255,255,255,0.22)",
                        boxShadow: isCurrent
                          ? isHit
                            ? "0 0 12px rgba(220,38,38,0.8)"
                            : "0 0 8px rgba(255,255,255,0.5)"
                          : "none",
                      }}
                    />
                    {isCurrent && (
                      <div className="absolute -top-1 left-0 right-0 h-[2px] bg-[#f59e0b]" />
                    )}
                  </div>
                );
              })}
              <div className="absolute left-0 right-0 top-[50%] h-px bg-white/20 pointer-events-none" />
            </div>
          </div>

          {/* Playback progress bar */}
          <div className="flex items-center gap-3 px-3 py-1.5 border-t-2 border-[#dc2626]/40 bg-[#dc2626]/10 flex-shrink-0">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="text-[9px] font-mono tracking-[2px] uppercase text-[#f59e0b] cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
            >
              {playing ? (
                <>
                  <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor"><rect width="2.5" height="10" /><rect x="5.5" width="2.5" height="10" /></svg>
                  PLAYING
                </>
              ) : (
                <>
                  <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor"><path d="M0 0l8 5-8 5z" /></svg>
                  PAUSED
                </>
              )}
            </button>
            <div
              className="flex-1 relative h-4 cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setFrameIdx(Math.round(pct * (totalFrames - 1)));
              }}
              onMouseDown={(e) => {
                setPlaying(false);
                const bar = e.currentTarget;
                const seek = (ev: MouseEvent) => {
                  const rect = bar.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                  setFrameIdx(Math.round(pct * (totalFrames - 1)));
                };
                const stop = () => {
                  window.removeEventListener("mousemove", seek);
                  window.removeEventListener("mouseup", stop);
                };
                window.addEventListener("mousemove", seek);
                window.addEventListener("mouseup", stop);
              }}
            >
              <div className="absolute inset-y-[6px] left-0 right-0 bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#dc2626]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f59e0b] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] group-hover:scale-125 transition-transform"
                style={{ left: `calc(${progress * 100}% - 6px)` }}
              />
            </div>
            <div className="text-[10px] font-mono tabular-nums tracking-[2px] text-white/70 whitespace-nowrap">
              {(frameIdx / fps).toFixed(2)}S /{" "}
              {((totalFrames - 1) / fps).toFixed(2)}S
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
