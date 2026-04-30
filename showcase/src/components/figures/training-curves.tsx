"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TRAINING } from "@/lib/research-data";

type Metric = "val_acc" | "train_loss";

export function TrainingCurves() {
  const [metric, setMetric] = useState<Metric>("val_acc");
  const summaryId = useId();

  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(200, entry.contentRect.width)));
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const W = width;
  const H = 280;
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 40;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const epochs = TRAINING.epochs.map((row) => row.epoch);
  const yMin = 0;
  const yMax = metric === "val_acc" ? 1 : 0.8;

  const seriesPath = (vals: number[]) =>
    vals
      .map((v, i) => {
        const x = PAD_L + (i / (epochs.length - 1)) * innerW;
        const y = PAD_T + (1 - (v - yMin) / (yMax - yMin)) * innerH;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const tsnVals = TRAINING.epochs.map((row) =>
    metric === "val_acc" ? row.val_accuracy : row.train_loss
  );
  const finalTSN = tsnVals[tsnVals.length - 1];
  const summary = metric === "val_acc"
    ? `Validation accuracy ranges from ${Number((Math.min(...tsnVals) * 100).toFixed(2))}% to ${Number((Math.max(...tsnVals) * 100).toFixed(2))}%, ending at ${Number((finalTSN * 100).toFixed(2))}% after ${epochs.length} epochs.`
    : `Training loss starts at ${tsnVals[0].toFixed(4)} and ends at ${finalTSN.toFixed(4)} after ${epochs.length} epochs.`;
  const yTickLabel = (t: number) => (yMin + t * (yMax - yMin)).toFixed(2);

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="mb-5 flex gap-5 border-b border-rule" role="group" aria-label="Chart metric">
        {(["val_acc", "train_loss"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            aria-pressed={metric === m}
            className={[
              "min-h-11 border-b-2 px-1 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-sm",
              metric === m
                ? "border-ink text-ink"
                : "border-transparent text-[#aaa8a1] hover:text-ink",
            ].join(" ")}
          >
            {m === "val_acc" ? "Validation accuracy" : "Training loss"}
          </button>
        ))}
      </div>

      <div ref={chartRef}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Recorded legacy TSN ${metric === "val_acc" ? "validation accuracy" : "training loss"}; not independent test performance`} aria-describedby={summaryId}>
          {/* Y-axis ticks + grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD_T + (1 - t) * innerH;
            return (
              <g key={t}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={y}
                  y2={y}
                  stroke={t === 0 ? "#8a877f" : "#30302d"}
                  strokeWidth={1}
                />
                <text
                  x={PAD_L - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fontFamily="Arial, Helvetica, sans-serif"
                  fill="#aaa8a1"
                >
                  {yTickLabel(t)}
                </text>
              </g>
            );
          })}

          {/* X-axis ticks */}
          {[1, 5, 10, 15, 20].map((e) => {
            const x = PAD_L + ((e - 1) / (epochs.length - 1)) * innerW;
            return (
              <g key={e}>
                <line
                  x1={x}
                  x2={x}
                  y1={PAD_T + innerH}
                  y2={PAD_T + innerH + 4}
                  stroke="#8a877f"
                />
                <text
                  x={x}
                  y={PAD_T + innerH + 18}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="Arial, Helvetica, sans-serif"
                  fill="#aaa8a1"
                >
                  {e}
                </text>
              </g>
            );
          })}

          <path
            d={seriesPath(tsnVals)}
            fill="none"
            stroke="#e8e6e1"
            strokeWidth={2}
          />

          {/* End-of-line value labels */}
          <text
            x={W - PAD_R - 4}
            y={PAD_T + (1 - (finalTSN - yMin) / (yMax - yMin)) * innerH - 6}
            fontSize={11}
            textAnchor="end"
            fontFamily="Arial, Helvetica, sans-serif"
            fill="#e8e6e1"
            fontWeight={600}
          >
            {finalTSN.toFixed(metric === "val_acc" ? 2 : 3)}
          </text>
          {/* Axis labels */}
          <text
            x={PAD_L + innerW / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize={11}
            fontFamily="Arial, Helvetica, sans-serif"
            fill="#aaa8a1"
          >
            Epoch
          </text>
          <text
            x={14}
            y={PAD_T + innerH / 2}
            textAnchor="middle"
            fontSize={11}
            fontFamily="Arial, Helvetica, sans-serif"
            fill="#aaa8a1"
            transform={`rotate(-90 14 ${PAD_T + innerH / 2})`}
          >
            {metric === "val_acc" ? "Accuracy" : "Loss"}
          </text>
        </svg>
      </div>
      <p id={summaryId} className="mt-3 text-[13px] leading-relaxed text-[#aaa8a1]">
        {summary} Both test clips also occur in the six-clip validation set.
      </p>
      <details className="mt-1 text-[13px] leading-relaxed text-[#aaa8a1]">
        <summary className="min-h-11 cursor-pointer py-3 hover:text-ink">Notebook source</summary>
        <div className="pb-3 [overflow-wrap:anywhere]">
          {TRAINING.source} · cell {TRAINING.cell_indices.join(", ")} (zero-based)
          <br />SHA-256: <code className="text-xs">{TRAINING.source_sha256}</code>
        </div>
      </details>
    </div>
  );
}
