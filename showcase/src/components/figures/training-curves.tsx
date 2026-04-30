"use client";

/* Toggle between validation accuracy and training loss across 20 epochs.
   Solid red line is the TSN run; dashed gray is the from-scratch 3D CNN
   that flatlines at the majority-class baseline. */

import { useState } from "react";
import { TRAINING } from "@/lib/research-data";

type Metric = "val_acc" | "train_loss";

export function TrainingCurves() {
  const [metric, setMetric] = useState<Metric>("val_acc");

  const W = 720;
  const H = 280;
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 40;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const epochs = TRAINING.epochs;
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

  const tsnVals = TRAINING.tsn[metric];
  const cnnVals = TRAINING.cnn3d[metric];
  const finalTSN = tsnVals[tsnVals.length - 1];
  const finalCNN = cnnVals[cnnVals.length - 1];
  const yTickLabel = (t: number) => (yMin + t * (yMax - yMin)).toFixed(2);

  return (
    <div className="border border-rule bg-paper p-4">
      <div className="mb-3.5 flex">
        {(["val_acc", "train_loss"] as const).map((m, i, all) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            className={[
              "border border-rule px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              i < all.length - 1 ? "border-r-0" : "",
              metric === m
                ? "border-red-600 bg-red-600 text-white"
                : "text-ink-dim hover:text-ink",
            ].join(" ")}
          >
            {m === "val_acc" ? "validation accuracy" : "training loss"}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
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
                stroke="#2a2a2a"
                strokeWidth={0.5}
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                fill="#666"
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
                {e}
              </text>
            </g>
          );
        })}

        {/* 3D CNN — dashed gray */}
        <path
          d={seriesPath(cnnVals)}
          fill="none"
          stroke="#666"
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
        {/* TSN — solid red */}
        <path
          d={seriesPath(tsnVals)}
          fill="none"
          stroke="#dc2626"
          strokeWidth={2}
        />

        {/* End-of-line value labels */}
        <text
          x={W - PAD_R - 4}
          y={PAD_T + (1 - (finalTSN - yMin) / (yMax - yMin)) * innerH - 6}
          fontSize={11}
          textAnchor="end"
          fontFamily="ui-monospace, monospace"
          fill="#dc2626"
          fontWeight={600}
        >
          TSN → {finalTSN.toFixed(metric === "val_acc" ? 2 : 3)}
        </text>
        <text
          x={W - PAD_R - 4}
          y={PAD_T + (1 - (finalCNN - yMin) / (yMax - yMin)) * innerH + 14}
          fontSize={11}
          textAnchor="end"
          fontFamily="ui-monospace, monospace"
          fill="#888"
        >
          3D CNN → {finalCNN.toFixed(3)}
        </text>

        {/* Axis labels */}
        <text
          x={PAD_L + innerW / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize={11}
          fontFamily="ui-monospace, monospace"
          fill="#888"
          letterSpacing="0.15em"
        >
          EPOCH
        </text>
        <text
          x={14}
          y={PAD_T + innerH / 2}
          textAnchor="middle"
          fontSize={11}
          fontFamily="ui-monospace, monospace"
          fill="#888"
          letterSpacing="0.15em"
          transform={`rotate(-90 14 ${PAD_T + innerH / 2})`}
        >
          {metric === "val_acc" ? "VAL ACC" : "TRAIN LOSS"}
        </text>
      </svg>
    </div>
  );
}
