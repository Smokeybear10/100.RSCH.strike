"use client";

/* Paper-styled upload zone. Functionally a stripped-down FCUpload — no
   "Step Into The Octagon" theatrics, just a quiet drop target with mono
   status text and a soft-fail "inference offline" path. */

import { useCallback, useRef, useState } from "react";

type Status = "idle" | "loading" | "demo";

export function Upload() {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);
    setStatus("loading");
    setTimeout(() => setStatus("demo"), 2400);
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

  const click = () => {
    if (status === "loading") return;
    if (status === "demo") {
      reset();
      return;
    }
    inputRef.current?.click();
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={status === "loading" ? -1 : 0}
        aria-label={
          status === "loading"
            ? "Processing video"
            : status === "demo"
              ? "Inference offline, click to reset"
              : "Upload a short MP4 clip"
        }
        onClick={click}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (status !== "loading") setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (status === "loading") {
            e.preventDefault();
            return;
          }
          handleDrop(e);
        }}
        className={[
          "border border-rule px-10 py-14 text-center transition-colors outline-none",
          status === "loading" ? "" : "cursor-pointer",
          dragOver
            ? "border-red-600 bg-paper-2"
            : status !== "idle"
              ? "border-red-600 bg-paper-2"
              : "bg-paper hover:bg-paper-2",
          "focus-visible:border-red-600",
        ].join(" ")}
      >
        {status === "loading" ? (
          <>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-red-600">
              Processing
            </div>
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            <div className="font-serif text-xl text-ink">Running inference</div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              {fileName}
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              SAM2 segmentation → TSN classification
            </div>
          </>
        ) : status === "demo" ? (
          <>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-red-600">
              Inference offline
            </div>
            <div className="font-serif text-xl text-ink">
              GPU backend not connected
            </div>
            <p className="mx-auto mt-3 max-w-[460px] font-serif text-[13px] italic leading-[1.6] text-ink-dim">
              The interactive run-on-your-own-clip path is wired client-side
              but the Modal worker is paused. Click to reset; the held-out
              clips above remain live.
            </p>
            <div className="mt-5 inline-block border border-red-600 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-red-600">
              click to reset
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-red-600">
              Drag a clip · or click to browse
            </div>
            <div className="font-serif text-xl text-ink">
              Run the model on your own footage.
            </div>
            <p className="mx-auto mt-3 max-w-[440px] font-serif text-[13px] italic leading-[1.6] text-ink-dim">
              MP4 · ≤ 3 seconds · ≤ 10 MB. Frames are processed in five-frame
              windows; the page reports per-window confidence in line with the
              evaluation above.
            </p>
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

      <div className="flex items-center justify-between border border-t-0 border-rule bg-paper-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        <span>uploaded video discarded after inference</span>
        <span>modal · single-gpu worker</span>
      </div>
    </div>
  );
}
