"use client";

import { useState, useRef, useCallback } from "react";

export function FCUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);
    setStatus("loading");
    // Simulate upload + inference, then fail
    setTimeout(() => setStatus("error"), 3000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setFileName(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
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
            : status === "error"
            ? "border-[#dc2626] bg-[#1a0000]"
            : fileName
            ? "border-[#f59e0b] bg-[#1a0000]"
            : "border-[#dc2626] bg-[#0a0000] hover:bg-[#1a0000]"
        } transition-all ${status === "loading" ? "" : "cursor-pointer"} px-12 py-16 text-center`}
        onClick={() => {
          if (status === "loading") return;
          if (status === "error") { reset(); return; }
          inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (status !== "loading") setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (status === "loading") { e.preventDefault(); return; }
          handleDrop(e);
        }}
      >
        {status === "loading" ? (
          <>
            <div className="text-[8px] font-black tracking-[4px] uppercase text-[#f59e0b] mb-4 font-[family-name:var(--font-oswald)]">
              ● Processing ●
            </div>
            <div className="mx-auto mb-5 w-14 h-14 border-[3px] border-[#dc2626] border-t-transparent rounded-full animate-spin" />
            <div className="text-[20px] sm:text-[24px] font-black text-white font-[family-name:var(--font-oswald)] tracking-wide uppercase mb-2">
              Running Inference
            </div>
            <div className="text-[11px] font-mono tracking-[3px] uppercase text-white/50">
              {fileName}
            </div>
            <div className="mt-4 text-[9px] font-mono tracking-[2px] uppercase text-[#f59e0b] animate-pulse">
              SAM2 Segmentation → TSN Classification
            </div>
          </>
        ) : status === "error" ? (
          <>
            <div className="text-[8px] font-black tracking-[4px] uppercase text-[#dc2626] mb-4 font-[family-name:var(--font-oswald)]">
              ● No Contest ●
            </div>
            <div className="mx-auto mb-5 w-14 h-14 border-[3px] border-[#dc2626] bg-black rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <div className="text-[20px] sm:text-[24px] font-black text-white font-[family-name:var(--font-oswald)] tracking-wide uppercase mb-2">
              Something Went Wrong
            </div>
            <div className="text-[11px] font-mono tracking-[3px] uppercase text-white/50 mb-4">
              Could not process video
            </div>
            <div className="inline-block border-2 border-[#dc2626] bg-black px-5 py-2 cursor-pointer hover:bg-[#dc2626]/20 transition-colors">
              <span className="text-[10px] font-black tracking-[3px] uppercase text-[#dc2626] font-[family-name:var(--font-oswald)]">
                Click to try again
              </span>
            </div>
          </>
        ) : (
          <>
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
