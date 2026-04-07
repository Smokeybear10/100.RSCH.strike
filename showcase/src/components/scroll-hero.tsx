"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { demoClips } from "@/lib/demo-data";
import { framePath, getConfidence, getPrediction } from "@/lib/player-utils";

gsap.registerPlugin(ScrollTrigger);

const clip = demoClips[0]; // knockdown sequence

export function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  const imageCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const { totalFrames, frameDir, windowSize, predictions } = clip;
  const confidence = getConfidence(currentFrame, predictions, windowSize);
  const prediction = getPrediction(currentFrame, predictions, windowSize);
  const isStrike = prediction?.label === "strike";
  const currentWindow = Math.floor(currentFrame / windowSize);

  // Preload all frames aggressively — this is the cinematic hero, it must be smooth
  useEffect(() => {
    const cache = imageCache.current;
    cache.clear();
    let loadedCount = 0;
    const eager = Math.min(40, totalFrames);

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

    // Background-load the rest
    let bg = eager;
    const loadBatch = () => {
      const end = Math.min(bg + 20, totalFrames);
      for (let i = bg; i < end; i++) loadFrame(i);
      bg = end;
      if (bg < totalFrames) requestIdleCallback(loadBatch);
    };
    if (eager < totalFrames) requestIdleCallback(loadBatch);
  }, [totalFrames, frameDir]);

  // Draw frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imageCache.current.get(currentFrame);
    if (img) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    } else {
      // Find nearest cached frame to avoid flash
      for (let offset = 1; offset < 20; offset++) {
        const near =
          imageCache.current.get(currentFrame - offset) ||
          imageCache.current.get(currentFrame + offset);
        if (near) {
          canvas.width = near.naturalWidth;
          canvas.height = near.naturalHeight;
          ctx.drawImage(near, 0, 0);
          return;
        }
      }
    }
  }, [currentFrame]);

  // Scroll orchestration
  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      // Frame scrubber — scroll drives currentFrame via a proxy object
      const proxy = { frame: 0 };
      gsap.to(proxy, {
        frame: totalFrames - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: () => {
            setCurrentFrame(Math.round(proxy.frame));
          },
        },
      });

      // Title fade — first 15% of scroll
      gsap.to(titleRef.current, {
        opacity: 0,
        scale: 0.85,
        y: -40,
        filter: "blur(8px)",
        ease: "power2.in",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "15% top",
          scrub: true,
        },
      });

      // HUD fade-in — 10-20% of scroll
      gsap.fromTo(
        hudRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "10% top",
            end: "20% top",
            scrub: true,
          },
        }
      );

      // Outro text — last 15%
      gsap.fromTo(
        outroRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "80% top",
            end: "95% top",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [totalFrames]);

  const progress = currentFrame / (totalFrames - 1);

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] bg-black"
      aria-label="Strike detection scroll sequence"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Full-bleed canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: loaded ? "none" : "blur(20px)" }}
        />

        {/* Vignette — top + bottom gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent via-40% to-black/90 pointer-events-none" />

        {/* Strike detected flash — pulses when model crosses threshold */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: isStrike
              ? "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.25) 0%, transparent 60%)"
              : "transparent",
            opacity: isStrike ? 1 : 0,
          }}
        />

        {/* ───────────────────────────────────────────────────── */}
        {/* TITLE — opening shot                                   */}
        {/* ───────────────────────────────────────────────────── */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 pointer-events-none"
        >
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[6px] uppercase text-white/40 mb-6">
            Strike Detection · Frame-by-Frame · By Thomas Ou
          </div>
          <h1 className="text-[clamp(80px,18vw,280px)] font-black leading-[0.82] tracking-[-0.02em] text-white font-[family-name:var(--font-anton)]">
            STR
            <span
              className="text-[#dc2626]"
              style={{
                textShadow:
                  "0 0 60px rgba(220,38,38,0.9), 0 0 120px rgba(220,38,38,0.4)",
              }}
            >
              1
            </span>
            KE
          </h1>
          <div className="mt-4 text-[11px] sm:text-[13px] font-mono tracking-[4px] uppercase text-white/60 max-w-[520px]">
            scroll to witness inference
          </div>
          <div className="mt-8 flex items-center gap-2 text-white/30">
            <span className="w-6 h-px bg-white/30" />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 9L2 5h8L6 9z" />
            </svg>
            <span className="w-6 h-px bg-white/30" />
          </div>
        </div>

        {/* ───────────────────────────────────────────────────── */}
        {/* HUD — mono telemetry, always legible                   */}
        {/* ───────────────────────────────────────────────────── */}
        <div
          ref={hudRef}
          className="absolute inset-0 pointer-events-none opacity-0"
        >
          {/* Top-left: model identity */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <div className="text-[9px] font-mono tracking-[3px] uppercase text-white/40 mb-1">
              Model
            </div>
            <div className="text-[11px] font-mono tracking-[2px] text-white/80">
              TSN · KINETICS-400
            </div>
          </div>

          {/* Top-right: clip identity */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-right">
            <div className="text-[9px] font-mono tracking-[3px] uppercase text-white/40 mb-1">
              Sequence
            </div>
            <div className="text-[11px] font-mono tracking-[2px] text-white/80 uppercase">
              {clip.name} · 200 Frames
            </div>
          </div>

          {/* Prediction badge — center-top, morphs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] sm:-translate-y-[240%]">
            <div
              className="px-5 py-2 text-[11px] sm:text-[13px] font-black tracking-[5px] uppercase font-[family-name:var(--font-oswald)] transition-all duration-300"
              style={{
                background: isStrike ? "#dc2626" : "rgba(0,0,0,0.6)",
                color: isStrike ? "#ffffff" : "rgba(255,255,255,0.8)",
                border: isStrike
                  ? "1px solid #dc2626"
                  : "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                boxShadow: isStrike
                  ? "0 0 40px rgba(220,38,38,0.6)"
                  : "none",
              }}
            >
              {isStrike ? "● STRIKE DETECTED" : "○ NEUTRAL"}
            </div>
          </div>

          {/* Bottom bar: confidence + frame + progress */}
          <div className="absolute bottom-0 inset-x-0 px-6 sm:px-8 pb-6 sm:pb-8">
            {/* Confidence meter */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[9px] font-mono tracking-[3px] uppercase mb-2">
                <span className="text-white/40">Confidence</span>
                <span
                  className="tabular-nums text-[18px] sm:text-[22px] font-bold tracking-tight"
                  style={{
                    color: isStrike ? "#f97316" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {confidence.toFixed(3)}
                </span>
              </div>
              <div className="relative h-[2px] bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 transition-[width] duration-100"
                  style={{
                    width: `${confidence * 100}%`,
                    background:
                      confidence >= 0.5
                        ? "linear-gradient(90deg, #dc2626, #f97316)"
                        : "rgba(255,255,255,0.4)",
                  }}
                />
                {/* Threshold marker at 0.5 */}
                <div className="absolute top-[-4px] bottom-[-4px] left-1/2 w-px bg-white/30" />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/30 tracking-[2px]">
                  0.5
                </div>
              </div>
            </div>

            {/* Frame + window + scroll progress */}
            <div className="flex items-center justify-between text-[9px] font-mono tracking-[3px] uppercase text-white/50">
              <div className="flex items-center gap-6">
                <span>
                  Frame{" "}
                  <span className="text-white/80 tabular-nums">
                    {String(currentFrame).padStart(3, "0")}
                  </span>
                  <span className="text-white/25"> / {totalFrames - 1}</span>
                </span>
                <span className="hidden sm:inline">
                  Window{" "}
                  <span className="text-white/80 tabular-nums">
                    {String(currentWindow).padStart(2, "0")}
                  </span>
                  <span className="text-white/25"> / {predictions.length - 1}</span>
                </span>
              </div>
              <span className="tabular-nums">
                {(progress * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Corner brackets — cinematic */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-3 h-3 border-l border-t border-white/20 pointer-events-none hidden" />
        </div>

        {/* ───────────────────────────────────────────────────── */}
        {/* OUTRO — exit text                                      */}
        {/* ───────────────────────────────────────────────────── */}
        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-[20%] text-center px-5 pointer-events-none opacity-0"
        >
          <div className="text-[10px] font-mono tracking-[5px] uppercase text-[#f97316] mb-3">
            Peak Confidence {Math.max(...predictions.map((p) => p.confidence)).toFixed(2)}
          </div>
          <div className="text-[clamp(32px,5vw,64px)] font-black leading-tight tracking-tight text-white font-[family-name:var(--font-anton)]">
            One Weekend.<br />
            38 Hand-Labeled Windows.
          </div>
          <div className="mt-4 text-[11px] font-mono tracking-[3px] uppercase text-white/40">
            Continue ↓
          </div>
        </div>
      </div>
    </section>
  );
}
