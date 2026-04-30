"use client";

/* Drag-to-reveal split between the original broadcast frame and the SAM2
   mask of the same frame. Both are real frames pulled from the knockdown
   sequence — broadcast layer underneath, mask clipped to the right strip
   above it. Drag the handle to wipe between them. */

import { useRef, useState } from "react";

const FRAME = "img_00102.jpg"; // mid-strike on the knockdown clip (w20 peak)

export function SAM2Slider() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const setFromEvent = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className="relative aspect-video cursor-ew-resize select-none overflow-hidden border border-rule bg-black"
      onMouseDown={(e) => setFromEvent(e.clientX)}
      onMouseMove={(e) => {
        if (e.buttons !== 0) setFromEvent(e.clientX);
      }}
      onTouchMove={(e) => setFromEvent(e.touches[0].clientX)}
    >
      {/* Back layer — broadcast frame (always visible) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/clips/knockdown/${FRAME}`}
        alt="Original broadcast frame from Topuria vs. Holloway, round 2"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Front layer — SAM2-masked frame, clipped to the right strip */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(${pos}% 0, 100% 0, 100% 100%, ${pos}% 100%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/clips/knockdown-masked/${FRAME}`}
          alt="SAM2 silhouette mask of the same frame, fighters isolated on black"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Side labels — match what's actually showing on each side */}
      <div
        className="pointer-events-none absolute left-4 top-4 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute backdrop-blur-sm transition-opacity"
        style={{ opacity: pos > 18 ? 1 : 0.3 }}
      >
        BROADCAST
      </div>
      <div
        className="pointer-events-none absolute right-4 top-4 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-red-600 backdrop-blur-sm transition-opacity"
        style={{ opacity: pos < 82 ? 1 : 0.3 }}
      >
        SAM2 MASK
      </div>

      {/* Drag handle */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute inset-y-0 -left-px w-0.5 bg-red-600" />
        <div className="absolute left-0 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 ring-2 ring-paper">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3 L1 7 L3 11 M11 3 L13 7 L11 11"
              stroke="#0a0a0a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
