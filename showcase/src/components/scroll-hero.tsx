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
      className="relative h-[220vh] bg-paper"
      aria-label="Strike detection — scroll-scrubbed inference figure"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Full-bleed canvas */}
        <canvas
          ref={canvasRef}
          aria-label="Strike detection video frame playback"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: loaded ? "none" : "blur(20px)" }}
        />

        {/* Vignette — subtle, just for HUD legibility */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-paper/55 via-transparent via-40% to-paper/80" />

        {/* Strike flash — quieter than the broadcast version */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: isStrike
              ? "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.18) 0%, transparent 65%)"
              : "transparent",
            opacity: isStrike ? 1 : 0,
          }}
        />

        {/* ───── PRE-ROLL LABEL ───── */}
        <div
          ref={titleRef}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center pointer-events-none"
        >
          <div className="mx-auto max-w-[680px]">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
              Pre-roll · scroll-scrubbed inference, 5 fps virtual playback
            </div>
            <p className="mt-5 font-serif text-[clamp(20px,2.6vw,32px)] italic leading-[1.3] text-ink">
              UFC 308 · Topuria vs. Holloway · Round 2 — the model reading
              every five frames as it goes.
            </p>
            <div className="mt-7 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              <span className="h-px w-6 bg-ink-faint/60" />
              scroll to advance
              <span className="h-px w-6 bg-ink-faint/60" />
            </div>
          </div>
        </div>

        {/* ───── HUD ───── */}
        <div
          ref={hudRef}
          className="absolute inset-0 pointer-events-none opacity-0"
        >
          {/* Top-left: model identity */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
              model
            </div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.12em] text-ink">
              tsn · resnet-50 · k400 → mma
            </div>
          </div>

          {/* Top-right: sequence */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-right">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
              sequence
            </div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.12em] text-ink">
              {clip.name.toLowerCase()} · {clip.totalFrames}f @ {clip.fps}fps
            </div>
          </div>

          {/* Prediction tag — quiet, no glow, no Oswald */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] sm:-translate-y-[240%]">
            <div
              className={[
                "border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur-md transition-colors",
                isStrike
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-rule bg-paper/55 text-ink-mute",
              ].join(" ")}
            >
              {isStrike ? "● strike" : "○ neutral"}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 inset-x-0 px-6 sm:px-8 pb-6 sm:pb-8">
            {/* Clip indicators */}
            <div className="flex items-center gap-3 mb-3">
              {heroClips.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 transition-opacity duration-300"
                  style={{ opacity: i === clipIndex ? 1 : 0.35 }}
                >
                  <span
                    className="w-1 h-1 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        i === clipIndex ? "#dc2626" : "rgba(232,230,225,0.35)",
                    }}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-mute">
                    {c.name.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            {/* Confidence meter — single weight, no orange gradient */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                <span>P(strike)</span>
                <span
                  className="tnum text-[16px] tracking-tight"
                  style={{
                    color: isStrike ? "#dc2626" : "var(--color-ink)",
                  }}
                >
                  {confidence.toFixed(3)}
                </span>
              </div>
              <div className="relative h-px bg-ink/15">
                <div
                  className="absolute inset-y-0 left-0 bg-red-600 transition-[width] duration-100"
                  style={{ width: `${confidence * 100}%` }}
                />
                <div className="absolute -top-0.5 -bottom-0.5 left-1/2 w-px bg-ink/30" />
              </div>
            </div>

            {/* Frame · window · progress */}
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
              <div className="flex items-center gap-6">
                <span>
                  frame{" "}
                  <span className="tnum text-ink">
                    {String(localFrame).padStart(3, "0")}
                  </span>
                  <span className="text-ink-faint"> / {clip.totalFrames - 1}</span>
                </span>
                <span className="hidden sm:inline">
                  window{" "}
                  <span className="tnum text-ink">
                    {String(currentWindow).padStart(2, "0")}
                  </span>
                  <span className="text-ink-faint"> / {predictions.length - 1}</span>
                </span>
              </div>
              <span className="tnum">{(progress * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* ───── OUTRO ───── */}
        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-[16%] text-center px-8 pointer-events-none opacity-0"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            ↓ continue to the report
          </div>
        </div>
      </div>
    </section>
  );
}
