"use client";

import { useState, useRef, useCallback } from "react";

export function UploadSection() {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Upload handling will be wired up when FastAPI backend is ready
  }, []);

  return (
    <section className="text-center py-20 border-t border-white/5">
      <span className="text-[11px] text-strike-red uppercase tracking-[3px] block mb-3">
        Try It
      </span>
      <h2 className="text-[32px] font-bold text-white mb-3">Test the Model</h2>
      <p className="text-[15px] text-muted max-w-[500px] mx-auto mb-8">
        Upload a short MMA clip and see STR1KE analyze it in real time.
      </p>

      <div
        className={`max-w-[600px] mx-auto p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? "border-strike-orange bg-strike-orange/5"
            : "border-border hover:border-muted"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-3xl text-dim mb-3">&uarr;</div>
        <div className="text-sm text-dim">
          Drop a video file or click to upload
        </div>
        <div className="text-[11px] text-dim/60 mt-2">
          Max 3 seconds &middot; MP4 &middot; MMA footage recommended
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4"
          className="hidden"
        />
      </div>

      <p className="text-[11px] text-dim/40 mt-4 max-w-[500px] mx-auto">
        Live inference powered by Modal serverless GPU. Your video is processed
        and deleted immediately.
      </p>
    </section>
  );
}
