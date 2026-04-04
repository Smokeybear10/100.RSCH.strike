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

    // Eager: first 30 frames
    for (let i = 0; i < eager; i++) loadFrame(i);

    // Background: rest
    let bgIndex = eager;
    const loadBatch = () => {
      const end = Math.min(bgIndex + 10, totalFrames);
      for (let i = bgIndex; i < end; i++) loadFrame(i);
      bgIndex = end;
      if (bgIndex < totalFrames) requestIdleCallback(loadBatch);
    };
    if (eager < totalFrames) requestIdleCallback(loadBatch);
  }, [frameDir, totalFrames]);

  // Draw frame to canvas
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
        // Placeholder when frame not loaded
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#333";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          `Loading frame ${frameIndex}...`,
          canvas.width / 2,
          canvas.height / 2
        );
      }
    },
    [frameDir]
  );

  // Animation loop
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

  // Draw on frame change
  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  // Scrub bar interaction
  const scrubToPosition = useCallback(
    (clientX: number) => {
      const bar = scrubRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setCurrentFrame(clampFrame(Math.round(pct * (totalFrames - 1)), 0, totalFrames - 1));
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
    <div className="w-full max-w-[900px] mx-auto">
      {/* Clip selector */}
      <div className="flex gap-2 mb-3">
        {clips.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveClipIndex(i);
              setCurrentFrame(0);
              setIsPlaying(true);
            }}
            className={`px-3 py-1.5 text-xs font-medium tracking-wide rounded transition-colors ${
              i === activeClipIndex
                ? "bg-strike-red text-white"
                : "bg-surface text-muted border border-border hover:text-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Player container */}
      <div className="border border-border rounded overflow-hidden">
        {/* Canvas + overlays */}
        <div className="relative aspect-video bg-surface">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            width={960}
            height={540}
          />

          {/* Loading state */}
          {!imagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface">
              <span className="text-dim text-sm font-mono animate-pulse">
                Loading frames...
              </span>
            </div>
          )}

          {/* Strike/neutral badge */}
          <div
            className={`absolute top-4 left-4 px-4 py-1.5 text-[13px] font-bold tracking-[2px] rounded-sm transition-colors ${
              prediction?.label === "strike"
                ? "bg-strike-red/90 text-white"
                : "bg-white/10 text-muted"
            }`}
          >
            {prediction?.label === "strike" ? "STRIKE" : "NEUTRAL"}
          </div>

          {/* Confidence bar */}
          <div className="absolute top-4 right-4 w-[120px] flex flex-col gap-1">
            <span className="text-[10px] text-muted uppercase tracking-[1px]">
              Confidence
            </span>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${confidence * 100}%`,
                  background: `linear-gradient(90deg, #dc2626, #f97316)`,
                }}
              />
            </div>
            <span className="text-[11px] text-strike-orange font-semibold text-right font-mono">
              {confidence.toFixed(2)}
            </span>
          </div>

          {/* Decision boundary indicator */}
          {showBoundary && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 border border-strike-orange px-3 py-1 text-[11px] text-strike-orange tracking-[1px] rounded-sm">
              DECISION BOUNDARY
            </div>
          )}
        </div>

        {/* Scrub bar */}
        <div className="px-4 py-3 bg-surface border-t border-white/5 flex items-center gap-3">
          <span className="text-[11px] text-dim font-mono min-w-[80px]">
            {currentFrame} / {totalFrames - 1}
          </span>

          <div
            ref={scrubRef}
            className="flex-1 h-1 bg-white/10 rounded-sm relative cursor-pointer group"
            onMouseDown={handleScrubDown}
            onTouchStart={handleScrubDown}
          >
            {/* Progress */}
            <div
              className="h-full bg-strike-red rounded-sm"
              style={{
                width: `${(currentFrame / (totalFrames - 1)) * 100}%`,
              }}
            />

            {/* Strike markers */}
            {strikeWindows.map((w) => (
              <div
                key={w}
                className="absolute top-[-3px] w-[3px] h-[10px] bg-strike-orange rounded-sm"
                style={{
                  left: `${((w * windowSize) / (totalFrames - 1)) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-1.5">
            <button
              onClick={() => stepFrame(-1)}
              className="w-7 h-7 bg-white/5 border border-border rounded-sm text-muted text-[11px] flex items-center justify-center hover:text-white transition-colors"
            >
              &lt;
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 bg-white/5 border border-border rounded-sm text-muted text-[11px] flex items-center justify-center hover:text-white transition-colors"
            >
              {isPlaying ? "||" : "▶"}
            </button>
            <button
              onClick={() => stepFrame(1)}
              className="w-7 h-7 bg-white/5 border border-border rounded-sm text-muted text-[11px] flex items-center justify-center hover:text-white transition-colors"
            >
              &gt;
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
    </div>
  );
}
