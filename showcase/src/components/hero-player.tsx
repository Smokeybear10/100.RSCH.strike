"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/types";
import {
  clampFrame,
  framePath,
  getConfidence,
  getPrediction,
  isThresholdCrossing,
  frameToWindow,
} from "@/lib/player-utils";
import { ConfidenceTimeline } from "./confidence-timeline";

type Props = {
  clips: Clip[];
};

export function HeroPlayer({ clips }: Props) {
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const scrubRef = useRef<HTMLDivElement>(null);

  const clip = clips[activeClipIndex];
  const { totalFrames, fps, windowSize, predictions, frameDir } = clip;
  const confidence = getConfidence(currentFrame, predictions, windowSize);
  const prediction = getPrediction(currentFrame, predictions, windowSize);
  const currentWindow = frameToWindow(currentFrame, windowSize);
  const prevPrediction = predictions[currentWindow - 1];
  const showBoundary = isThresholdCrossing(prevPrediction, prediction);
  const isStrike = prediction?.label === "strike";

  // Preload frames
  useEffect(() => {
    const cache = imageCache.current;
    cache.clear();
    setImagesLoaded(false);

    let loaded = 0;
    const eager = Math.min(30, totalFrames);

    const loadFrame = (i: number) => {
      const path = framePath(frameDir, i);
      if (cache.has(path)) return;
      const img = new Image();
      img.src = path;
      img.onload = () => {
        cache.set(path, img);
        loaded++;
        if (loaded >= eager) setImagesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= eager) setImagesLoaded(true);
      };
    };

    for (let i = 0; i < eager; i++) loadFrame(i);

    let bgIndex = eager;
    const loadBatch = () => {
      const end = Math.min(bgIndex + 10, totalFrames);
      for (let i = bgIndex; i < end; i++) loadFrame(i);
      bgIndex = end;
      if (bgIndex < totalFrames) requestIdleCallback(loadBatch);
    };
    if (eager < totalFrames) requestIdleCallback(loadBatch);
  }, [frameDir, totalFrames]);

  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const path = framePath(frameDir, frameIndex);
      const img = imageCache.current.get(path);

      if (img) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      } else {
        ctx.fillStyle = "#0f0f0f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    [frameDir]
  );

  useEffect(() => {
    if (!isPlaying || isDragging) return;

    const interval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime.current >= interval) {
        lastFrameTime.current = timestamp;
        setCurrentFrame((prev) => {
          const next = prev + 1;
          return next >= totalFrames ? 0 : next;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, isDragging, fps, totalFrames]);

  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  const scrubToPosition = useCallback(
    (clientX: number) => {
      const bar = scrubRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setCurrentFrame(
        clampFrame(Math.round(pct * (totalFrames - 1)), 0, totalFrames - 1)
      );
    },
    [totalFrames]
  );

  const handleScrubDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      setIsPlaying(false);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      scrubToPosition(clientX);
    },
    [scrubToPosition]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      scrubToPosition(clientX);
    };

    const handleUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, scrubToPosition]);

  const stepFrame = (delta: number) => {
    setIsPlaying(false);
    setCurrentFrame((prev) => clampFrame(prev + delta, 0, totalFrames - 1));
  };

  const strikeWindows = predictions
    .filter((p) => p.label === "strike")
    .map((p) => p.window);

  return (
    <div className="w-full mx-auto">
      {/* Clip selector */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span className="text-[9px] font-mono tracking-[2px] text-dim uppercase mr-1">
          Clip
        </span>
        {clips.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveClipIndex(i);
              setCurrentFrame(0);
              setIsPlaying(true);
            }}
            className={`px-2.5 py-1 text-[10px] font-medium tracking-wide rounded-sm transition-all ${
              i === activeClipIndex
                ? "bg-strike-red text-white border border-strike-red"
                : "bg-surface/50 text-muted border border-border hover:border-border-bright hover:text-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Player container */}
      <div className="relative border border-border rounded-md overflow-hidden bg-surface shadow-[0_0_80px_rgba(220,38,38,0.1)]">
        {/* Canvas + overlays */}
        <div className="relative aspect-video bg-black">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            width={960}
            height={540}
          />

          {/* Loading state */}
          {!imagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-strike-red animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-strike-red animate-pulse"
                    style={{ animationDelay: "200ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-strike-red animate-pulse"
                    style={{ animationDelay: "400ms" }}
                  />
                </div>
                <span className="text-dim text-[10px] font-mono tracking-[2px] uppercase">
                  Loading frames
                </span>
              </div>
            </div>
          )}

          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-white/30 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-white/30 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-white/30 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-white/30 pointer-events-none" />

          {/* Strike/neutral badge */}
          <div
            className={`absolute top-4 left-4 px-3 py-1.5 text-[11px] font-black tracking-[3px] rounded-sm transition-all duration-200 ${
              isStrike
                ? "bg-strike-red text-white strike-active"
                : "bg-black/60 text-muted border border-border backdrop-blur-sm"
            }`}
          >
            {isStrike ? "STRIKE" : "NEUTRAL"}
          </div>

          {/* Confidence readout */}
          <div className="absolute top-4 right-4 min-w-[140px] bg-black/60 border border-border backdrop-blur-sm p-2.5 rounded-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] text-dim uppercase tracking-[2px] font-mono">
                Confidence
              </span>
              <span
                className={`text-[15px] font-bold font-mono tabular-nums ${
                  isStrike ? "text-strike-orange" : "text-muted"
                }`}
              >
                {confidence.toFixed(3)}
              </span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${confidence * 100}%`,
                  background: `linear-gradient(90deg, #dc2626, #f97316)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[8px] text-dimmer font-mono">0.0</span>
              <span className="text-[8px] text-dimmer font-mono">
                threshold 0.5
              </span>
              <span className="text-[8px] text-dimmer font-mono">1.0</span>
            </div>
          </div>

          {/* Decision boundary indicator */}
          {showBoundary && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 border border-strike-orange px-4 py-1.5 text-[10px] font-mono text-strike-orange tracking-[2px] rounded-sm uppercase backdrop-blur-sm">
              ◆ Decision Boundary
            </div>
          )}

          {/* Frame counter bottom-left */}
          <div className="absolute bottom-4 left-4 text-[9px] font-mono text-dim tracking-wider">
            FRAME <span className="text-muted tabular-nums">{String(currentFrame).padStart(3, "0")}</span>
            <span className="text-dimmer"> / {totalFrames - 1}</span>
          </div>

          {/* Window indicator bottom-right */}
          <div className="absolute bottom-4 right-4 text-[9px] font-mono text-dim tracking-wider">
            WIN <span className="text-muted tabular-nums">{String(currentWindow).padStart(2, "0")}</span>
            <span className="text-dimmer"> / {predictions.length - 1}</span>
          </div>
        </div>

        {/* Scrub bar */}
        <div className="px-4 py-3 bg-surface-2 border-t border-border flex items-center gap-3">
          <div
            ref={scrubRef}
            className="flex-1 h-1.5 bg-white/10 rounded-sm relative cursor-pointer group"
            onMouseDown={handleScrubDown}
            onTouchStart={handleScrubDown}
          >
            {/* Strike window backgrounds */}
            {strikeWindows.map((w) => (
              <div
                key={`bg-${w}`}
                className="absolute top-0 h-full bg-strike-red/20"
                style={{
                  left: `${((w * windowSize) / (totalFrames - 1)) * 100}%`,
                  width: `${(windowSize / (totalFrames - 1)) * 100}%`,
                }}
              />
            ))}

            {/* Progress */}
            <div
              className="h-full bg-strike-red rounded-sm relative z-10"
              style={{
                width: `${(currentFrame / (totalFrames - 1)) * 100}%`,
              }}
            />

            {/* Playhead */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-strike-red z-20 shadow-lg"
              style={{
                left: `${(currentFrame / (totalFrames - 1)) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Strike markers */}
            {strikeWindows.map((w) => (
              <div
                key={w}
                className="absolute top-[-4px] w-[2px] h-[14px] bg-strike-orange rounded-sm z-10"
                style={{
                  left: `${((w * windowSize) / (totalFrames - 1)) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => stepFrame(-1)}
              className="w-8 h-8 bg-surface border border-border rounded-sm text-muted flex items-center justify-center hover:border-border-bright hover:text-white transition-colors"
              aria-label="Previous frame"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 2v8l6-4z" transform="scale(-1,1) translate(-12,0)" />
              </svg>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-8 bg-strike-red/10 border border-strike-red/40 rounded-sm text-strike-orange flex items-center justify-center hover:bg-strike-red/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="3" y="2" width="2" height="8" />
                  <rect x="7" y="2" width="2" height="8" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 2v8l6-4z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => stepFrame(1)}
              className="w-8 h-8 bg-surface border border-border rounded-sm text-muted flex items-center justify-center hover:border-border-bright hover:text-white transition-colors"
              aria-label="Next frame"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 2v8l6-4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Confidence timeline */}
        <ConfidenceTimeline
          predictions={predictions}
          currentWindow={currentWindow}
          totalFrames={totalFrames}
          windowSize={windowSize}
        />
      </div>

      {/* Hint */}
      <div className="mt-2.5 flex items-center justify-center gap-5 text-[9px] font-mono text-dimmer tracking-wider uppercase">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-strike-orange" />
          Strike window
        </span>
        <span className="hidden sm:inline text-dim">
          Drag the bar to scrub
        </span>
      </div>
    </div>
  );
}
