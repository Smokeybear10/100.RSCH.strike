"use client";

import type { Prediction } from "@/lib/types";

type Props = {
  predictions: Prediction[];
  currentWindow: number;
  totalFrames: number;
  windowSize: number;
};

export function ConfidenceTimeline({
  predictions,
  currentWindow,
  totalFrames,
  windowSize,
}: Props) {
  const width = 100;
  const height = 32;
  const threshold = 0.5;

  const points = predictions.map((p, i) => {
    const x = (i / (predictions.length - 1)) * width;
    const y = height - p.confidence * height;
    return `${x},${y}`;
  });

  const areaPoints = [
    `0,${height}`,
    ...points,
    `${width},${height}`,
  ].join(" ");

  const linePoints = points.join(" ");
  const thresholdY = height - threshold * height;
  const playheadX =
    predictions.length > 1
      ? (currentWindow / (predictions.length - 1)) * width
      : 0;

  return (
    <div className="px-4 py-2 pb-3 bg-[#0d0d0d] border-t border-white/5">
      <span className="text-[9px] text-dim uppercase tracking-[1px] block mb-1">
        Strike Confidence Over Time
      </span>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-8"
        preserveAspectRatio="none"
      >
        {/* Filled area under curve */}
        <polygon points={areaPoints} fill="rgba(220,38,38,0.15)" />

        {/* Confidence line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#dc2626"
          strokeWidth="0.5"
        />

        {/* Threshold line */}
        <line
          x1="0"
          y1={thresholdY}
          x2={width}
          y2={thresholdY}
          stroke="#555"
          strokeWidth="0.3"
          strokeDasharray="1,1"
        />

        {/* Playhead */}
        <line
          x1={playheadX}
          y1="0"
          x2={playheadX}
          y2={height}
          stroke="#f97316"
          strokeWidth="0.4"
        />
      </svg>
    </div>
  );
}
