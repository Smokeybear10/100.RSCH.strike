"use client";

import { useState, useRef, useCallback } from "react";

export function FCUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Rules card header */}
      <div className="bg-[#dc2626] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] live-dot" />
          <span className="text-[11px] font-black tracking-[4px] uppercase text-white font-[family-name:var(--font-oswald)]">
            Step Into The Octagon
          </span>
        </div>
        <span className="text-[9px] font-mono tracking-[3px] uppercase text-white/80">
          Rules · MP4 · ≤ 3s · ≤ 10MB
        </span>
      </div>

      {/* Drop zone */}
      <div
        className={`border-[3px] border-dashed ${
          dragOver
            ? "border-[#f59e0b] bg-[#f59e0b]/10 scale-[1.01]"
            : fileName
            ? "border-[#f59e0b] bg-[#1a0000]"
            : "border-[#dc2626] bg-[#0a0000] hover:bg-[#1a0000]"
        } transition-all cursor-pointer px-12 py-16 text-center`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {fileName ? (
          <>
            <div className="text-[8px] font-black tracking-[4px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
              ● Tale Of The Tape ●
            </div>
            <div className="text-[24px] font-black text-white font-[family-name:var(--font-oswald)] tracking-wide uppercase break-all px-4">
              {fileName}
            </div>
            <div className="mt-6 inline-block border-2 border-[#f59e0b] bg-black px-5 py-2">
              <span className="text-[10px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                Fighter Entered ▸ Click to Change
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Big arrow */}
            <div className="mx-auto mb-5 w-16 h-16 border-2 border-[#dc2626] bg-black rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
            </div>
            <div className="text-[22px] sm:text-[28px] font-black text-white font-[family-name:var(--font-oswald)] tracking-wide uppercase mb-2">
              Drop your video in the ring
            </div>
            <div className="text-[11px] font-mono tracking-[3px] uppercase text-[#f59e0b]">
              Or click to select a challenger
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4"
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {/* Sanction footer */}
      <div className="bg-black border-2 border-t-0 border-[#dc2626] px-6 py-3 flex items-center justify-between text-[9px] font-mono tracking-[2px] uppercase">
        <span className="text-white/50">Live Inference · Modal GPU</span>
        <span className="text-[#f59e0b]">Video Deleted After Fight</span>
      </div>
    </div>
  );
}
