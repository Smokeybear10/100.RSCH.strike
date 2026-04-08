"use client";

import { useState, useRef, useCallback } from "react";
import { Reveal } from "./reveal";

export function UploadSection() {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <section className="relative text-center py-32 px-5">
      <Reveal delay={0}>
        <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-3">
          Try It
        </span>
      </Reveal>

      <Reveal delay={150}>
        <h2 className="text-[36px] sm:text-[44px] font-black text-white tracking-tight mb-4">
          Test the model.
        </h2>
      </Reveal>

      <Reveal delay={300}>
        <p className="text-[15px] text-muted max-w-[520px] mx-auto mb-12 leading-relaxed">
          Upload a short MMA clip and watch STR1KE analyze it in real time.
        </p>
      </Reveal>

      <Reveal delay={450}>
        <div
          className={`max-w-[620px] mx-auto p-12 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            dragOver
              ? "border-strike-orange bg-strike-orange/5 scale-[1.01]"
              : "border-border hover:border-dim bg-surface/30"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 mx-auto mb-4 border border-border rounded-full flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-dim"
            >
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
          </div>
          <div className="text-sm text-muted mb-2">
            Drop a video file or click to upload
          </div>
          <div className="text-[10px] text-dimmer font-mono tracking-[2px] uppercase">
            Max 3s · MP4 · 10MB
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4"
            className="hidden"
          />
        </div>
      </Reveal>

      <Reveal delay={600}>
        <p className="text-[10px] text-dimmer/80 mt-6 max-w-[500px] mx-auto font-mono tracking-wide uppercase">
          Live inference · Modal serverless GPU · Video deleted after processing
        </p>
      </Reveal>
    </section>
  );
}
