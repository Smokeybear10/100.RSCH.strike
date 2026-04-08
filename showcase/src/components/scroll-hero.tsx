"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroClips } from "@/lib/demo-data";
import { framePath, getConfidence, getPrediction } from "@/lib/player-utils";

gsap.registerPlugin(ScrollTrigger);

const ric = typeof window !== "undefined" && window.requestIdleCallback
  ? window.requestIdleCallback
  : (cb: () => void) => setTimeout(cb, 1) as unknown as number;

const TOTAL_VIRTUAL_FRAMES = heroClips.reduce((sum, c) => sum + c.totalFrames, 0);

function virtualToClip(virtualFrame: number) {
  let remaining = virtualFrame;
  for (let i = 0; i < heroClips.length; i++) {
    if (remaining < heroClips[i].totalFrames) {
      return { clipIndex: i, localFrame: remaining };
    }
    remaining -= heroClips[i].totalFrames;
  }
  const last = heroClips.length - 1;
  return { clipIndex: last, localFrame: heroClips[last].totalFrames - 1 };
}

export function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const lastClipWindow = useRef({ clipIndex: -1, windowIndex: -1 });
  const [virtualFrame, setVirtualFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const { clipIndex, localFrame } = virtualToClip(virtualFrame);
  const clip = heroClips[clipIndex];
  const { windowSize, predictions } = clip;
  const confidence = getConfidence(localFrame, predictions, windowSize);
  const prediction = getPrediction(localFrame, predictions, windowSize);
  const isStrike = prediction?.label === "strike";
  const currentWindow = Math.floor(localFrame / windowSize);

  const drawToCanvas = (vFrame: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { clipIndex: ci, localFrame: lf } = virtualToClip(vFrame);
    const key = `${ci}-${lf}`;
    const img = imageCache.current.get(key);
    const draw = (image: HTMLImageElement) => {
      if (canvasSizeRef.current.w !== image.naturalWidth || canvasSizeRef.current.h !== image.naturalHeight) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvasSizeRef.current = { w: image.naturalWidth, h: image.naturalHeight };
      }
      ctx.drawImage(image, 0, 0);
    };
    if (img) {
      draw(img);
    } else {
      for (let offset = 1; offset < 20; offset++) {
        const near = imageCache.current.get(`${ci}-${lf - offset}`) || imageCache.current.get(`${ci}-${lf + offset}`);
        if (near) { draw(near); return; }
      }
    }
  };

  // Preload all frames for all clips
  useEffect(() => {
    const cache = imageCache.current;
    cache.clear();
    let loadedCount = 0;
    const totalToLoad = TOTAL_VIRTUAL_FRAMES;
    const eager = Math.min(60, totalToLoad);

    const loadFrame = (clipIdx: number, frameIdx: number) => {
      const key = `${clipIdx}-${frameIdx}`;
      if (cache.has(key)) return;
      const img = new Image();
      img.src = framePath(heroClips[clipIdx].frameDir, frameIdx);
      img.onload = () => {
        cache.set(key, img);
        loadedCount++;
        if (loadedCount >= eager) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= eager) setLoaded(true);
      };
    };

    // Eagerly load first N frames across clips
    let count = 0;
    for (let ci = 0; ci < heroClips.length && count < eager; ci++) {
      const framesFromThis = Math.min(heroClips[ci].totalFrames, eager - count);
      for (let fi = 0; fi < framesFromThis; fi++) {
        loadFrame(ci, fi);
        count++;
      }
    }

    // Background-load the rest
    const loadRemaining = () => {
      let batch = 0;
      for (let ci = 0; ci < heroClips.length; ci++) {
        for (let fi = 0; fi < heroClips[ci].totalFrames; fi++) {
          const key = `${ci}-${fi}`;
          if (!cache.has(key)) {
            loadFrame(ci, fi);
            batch++;
            if (batch >= 20) {
              ric(loadRemaining);
              return;
            }
          }
        }
      }
    };
    ric(loadRemaining);
  }, []);

  // Scroll orchestration
  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      const proxy = { frame: 0 };
      gsap.to(proxy, {
        frame: TOTAL_VIRTUAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: () => {
            const vf = Math.round(proxy.frame);
            drawToCanvas(vf);
            const { clipIndex: ci, localFrame: lf } = virtualToClip(vf);
            const wi = Math.floor(lf / heroClips[ci].windowSize);
            if (ci !== lastClipWindow.current.clipIndex || wi !== lastClipWindow.current.windowIndex) {
              lastClipWindow.current = { clipIndex: ci, windowIndex: wi };
              setVirtualFrame(vf);
            }
          },
        },
      });

      // Title fade — first 10% of scroll
      gsap.to(titleRef.current, {
        opacity: 0,
        scale: 0.85,
        y: -40,
        filter: "blur(8px)",
        ease: "power2.in",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "10% top",
          scrub: true,
        },
      });

      // HUD fade-in — 8-15% of scroll
      gsap.fromTo(
        hudRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "8% top",
            end: "15% top",
            scrub: true,
          },
        }
      );

      // Outro text
      gsap.fromTo(
        outroRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "85% top",
            end: "93% top",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const progress = virtualFrame / (TOTAL_VIRTUAL_FRAMES - 1);

  return (
    <section
      ref={containerRef}
      className="relative h-[540vh] bg-black"
      aria-label="Strike detection scroll sequence"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Full-bleed canvas */}
        <canvas
          ref={canvasRef}
          aria-label="Strike detection video frame playback"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: loaded ? "none" : "blur(20px)" }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent via-40% to-black/90 pointer-events-none" />

        {/* Strike flash */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: isStrike
              ? "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.25) 0%, transparent 60%)"
              : "transparent",
            opacity: isStrike ? 1 : 0,
          }}
        />

        {/* ───── TITLE ───── */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 pointer-events-none"
        >
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[6px] uppercase text-white/60 mb-6">
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

        {/* ───── HUD ───── */}
        <div
          ref={hudRef}
          className="absolute inset-0 pointer-events-none opacity-0"
        >
          {/* Top-left: model identity */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <div className="text-[9px] font-mono tracking-[3px] uppercase text-white/60 mb-1">
              Model
            </div>
            <div className="text-[11px] font-mono tracking-[2px] text-white/80">
              TSN · KINETICS-400
            </div>
          </div>

          {/* Top-right: clip identity */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-right">
            <div className="text-[9px] font-mono tracking-[3px] uppercase text-white/60 mb-1">
              Sequence
            </div>
            <div className="text-[11px] font-mono tracking-[2px] text-white/80 uppercase">
              {clip.name} · {clip.totalFrames} Frames
            </div>
          </div>

          {/* Prediction badge */}
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

          {/* Bottom bar */}
          <div className="absolute bottom-0 inset-x-0 px-6 sm:px-8 pb-6 sm:pb-8">
            {/* Clip indicators */}
            <div className="flex items-center gap-2 mb-3">
              {heroClips.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 transition-opacity duration-300"
                  style={{ opacity: i === clipIndex ? 1 : 0.3 }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{ background: i === clipIndex ? "#dc2626" : "rgba(255,255,255,0.3)" }}
                  />
                  <span className="text-[8px] font-mono tracking-[2px] uppercase text-white/70">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Confidence meter */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[9px] font-mono tracking-[3px] uppercase mb-2">
                <span className="text-white/60">Confidence</span>
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
                <div className="absolute top-[-4px] bottom-[-4px] left-1/2 w-px bg-white/30" />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/50 tracking-[2px]">
                  0.5
                </div>
              </div>
            </div>

            {/* Frame + window + scroll progress */}
            <div className="flex items-center justify-between text-[9px] font-mono tracking-[3px] uppercase text-white/60">
              <div className="flex items-center gap-6">
                <span>
                  Frame{" "}
                  <span className="text-white/80 tabular-nums">
                    {String(localFrame).padStart(3, "0")}
                  </span>
                  <span className="text-white/50"> / {clip.totalFrames - 1}</span>
                </span>
                <span className="hidden sm:inline">
                  Window{" "}
                  <span className="text-white/80 tabular-nums">
                    {String(currentWindow).padStart(2, "0")}
                  </span>
                  <span className="text-white/50"> / {predictions.length - 1}</span>
                </span>
              </div>
              <span className="tabular-nums">
                {(progress * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* ───── OUTRO ───── */}
        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-[20%] text-center px-5 pointer-events-none opacity-0"
        >
          <div className="text-[10px] font-mono tracking-[5px] uppercase text-[#f97316] mb-3">
            {heroClips.length} Clips · {TOTAL_VIRTUAL_FRAMES} Frames
          </div>
          <div className="text-[clamp(32px,5vw,64px)] font-black leading-tight tracking-tight text-white font-[family-name:var(--font-anton)]">
            One Weekend.<br />
            38 Hand-Labeled Windows.
          </div>
          <div className="mt-4 text-[11px] font-mono tracking-[3px] uppercase text-white/60">
            Continue ↓
          </div>
        </div>
      </div>
    </section>
  );
}
