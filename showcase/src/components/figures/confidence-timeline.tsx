"use client";

/* Per-window P(strike) timeline for one clip. Hover anywhere to scrub the
   underlying numbers; peaks above the 0.5 threshold get marked. */

import { useRef, useState } from "react";
import type { Clip } from "@/lib/types";

type Props = { clip: Clip };

export function ConfidenceTimelineFigure({ clip }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 1000;
  const H = 280;
  const PAD_L = 48;
  const PAD_R = 16;
  const PAD_T = 24;
  const PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const points = clip.predictions.map((p, i) => {
    const x = PAD_L + (i / (clip.predictions.length - 1)) * innerW;
    const y = PAD_T + (1 - p.confidence) * innerH;
    return { x, y, p, i };
  });

  const pathD = points
    .map(
      (pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
    )
    .join(" ");
  const fillD = `${pathD} L ${points[points.length - 1].x} ${
    PAD_T + innerH
  } L ${PAD_L} ${PAD_T + innerH} Z`;

  const peaks = clip.predictions
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => {
      if (p.confidence < 0.5) return false;
      const prev = clip.predictions[i - 1]?.confidence ?? 0;
      const next = clip.predictions[i + 1]?.confidence ?? 0;
      return p.confidence >= prev && p.confidence >= next;
    });

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < PAD_L || px > W - PAD_R) {
      setHover(null);
      return;
    }
    const idx = Math.round(((px - PAD_L) / innerW) * (clip.predictions.length - 1));
    setHover(Math.max(0, Math.min(clip.predictions.length - 1, idx)));
  };

  const hoverPt = hover != null ? points[hover] : null;

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-[1fr_220px]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full cursor-crosshair bg-paper"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Y grid + threshold */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={PAD_T + (1 - v) * innerH}
              y2={PAD_T + (1 - v) * innerH}
              stroke={v === 0.5 ? "#dc2626" : "#2a2a2a"}
              strokeWidth={v === 0.5 ? 1 : 0.5}
              strokeDasharray={v === 0.5 ? "4 4" : "0"}
            />
            <text
              x={PAD_L - 8}
              y={PAD_T + (1 - v) * innerH + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              fill={v === 0.5 ? "#dc2626" : "#666"}
            >
              {v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {[0, 10, 20, 30, clip.predictions.length - 1].map((i) => {
          const x = PAD_L + (i / (clip.predictions.length - 1)) * innerW;
          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={PAD_T + innerH}
                y2={PAD_T + innerH + 4}
                stroke="#444"
              />
              <text
                x={x}
                y={PAD_T + innerH + 18}
                textAnchor="middle"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                fill="#888"
              >
                w{i}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="ct-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#ct-fill)" />
        <path d={pathD} fill="none" stroke="#dc2626" strokeWidth={1.6} />

        {/* Peak markers */}
        {peaks.map(({ p, i }) => {
          const pt = points[i];
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={3.5} fill="#dc2626" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={6}
                fill="none"
                stroke="#dc2626"
                strokeOpacity={0.4}
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                fill="#dc2626"
                fontWeight={600}
              >
                {p.confidence.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Hover marker */}
        {hoverPt && (
          <g>
            <line
              x1={hoverPt.x}
              x2={hoverPt.x}
              y1={PAD_T}
              y2={PAD_T + innerH}
              stroke="#e8e6e1"
              strokeWidth={0.5}
              strokeDasharray="2 3"
            />
            <circle
              cx={hoverPt.x}
              cy={hoverPt.y}
              r={5}
              fill="#e8e6e1"
              stroke="#0a0a0a"
              strokeWidth={2}
            />
          </g>
        )}

        {/* Axis labels */}
        <text
          x={PAD_L + innerW / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize={11}
          fontFamily="ui-monospace, monospace"
          fill="#888"
          letterSpacing="0.15em"
        >
          WINDOW INDEX (5 frames each, 167ms)
        </text>
        <text
          x={12}
          y={PAD_T + innerH / 2}
          textAnchor="middle"
          fontSize={11}
          fontFamily="ui-monospace, monospace"
          fill="#888"
          letterSpacing="0.15em"
          transform={`rotate(-90 12 ${PAD_T + innerH / 2})`}
        >
          P(STRIKE)
        </text>
      </svg>

      {/* Hover read-out sidebar */}
      <div className="flex flex-col gap-2.5 border border-rule bg-paper p-4 font-mono text-[11px]">
        {hoverPt ? (
          <>
            <Row label="window" value={`w${hoverPt.p.window}`} />
            <Row
              label="frames"
              value={`f${hoverPt.p.startFrame}–f${hoverPt.p.endFrame}`}
            />
            <Row
              label="time"
              value={`${(hoverPt.p.startFrame / clip.fps).toFixed(2)}s`}
            />
            <Row
              label="p(strike)"
              value={hoverPt.p.confidence.toFixed(3)}
              red={hoverPt.p.confidence >= 0.5}
            />
            <Row
              label="call"
              value={hoverPt.p.label.toUpperCase()}
              red={hoverPt.p.confidence >= 0.5}
            />
          </>
        ) : (
          <p className="m-0 py-5 text-center font-serif text-[13px] italic text-ink-faint">
            hover to scrub
          </p>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  red,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <span className={`tnum ${red ? "text-red-600" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
