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
}: Props) {
  const width = 100;
  const height = 40;
  const threshold = 0.5;

  const points = predictions.map((p, i) => {
    const x = (i / (predictions.length - 1)) * width;
    const y = height - p.confidence * height;
    return `${x},${y}`;
  });

  const areaPoints = [`0,${height}`, ...points, `${width},${height}`].join(
    " "
  );

  const linePoints = points.join(" ");
  const thresholdY = height - threshold * height;
  const playheadX =
    predictions.length > 1
      ? (currentWindow / (predictions.length - 1)) * width
      : 0;

  return (
    <div className="px-4 pt-2 pb-3 bg-surface-2 border-t border-border">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[8px] text-dim uppercase tracking-[2px] font-mono">
          Strike Confidence · Per Window
        </span>
        <span className="text-[8px] text-dimmer font-mono tabular-nums">
          {predictions.length} windows · 5 frames each
        </span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-8"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="conf-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Filled area under curve */}
          <polygon points={areaPoints} fill="url(#conf-gradient)" />

          {/* Confidence line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#dc2626"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />

          {/* Threshold line */}
          <line
            x1="0"
            y1={thresholdY}
            x2={width}
            y2={thresholdY}
            stroke="#525252"
            strokeWidth="0.3"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Playhead */}
          <line
            x1={playheadX}
            y1="0"
            x2={playheadX}
            y2={height}
            stroke="#f97316"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Current window marker */}
          <circle
            cx={playheadX}
            cy={height - predictions[currentWindow].confidence * height}
            r="1.2"
            fill="#f97316"
            stroke="#000"
            strokeWidth="0.3"
          />
        </svg>
      </div>
    </div>
  );
}
