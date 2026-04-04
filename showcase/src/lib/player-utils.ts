import type { Prediction } from "./types";

export function frameToWindow(
  frameIndex: number,
  windowSize: number
): number {
  return Math.floor(frameIndex / windowSize);
}

export function getConfidence(
  frameIndex: number,
  predictions: Prediction[],
  windowSize: number
): number {
  const windowIndex = frameToWindow(frameIndex, windowSize);
  const prediction = predictions[windowIndex];
  return prediction?.confidence ?? 0;
}

export function getPrediction(
  frameIndex: number,
  predictions: Prediction[],
  windowSize: number
): Prediction | undefined {
  const windowIndex = frameToWindow(frameIndex, windowSize);
  return predictions[windowIndex];
}

export function isThresholdCrossing(
  windowA: Prediction | undefined,
  windowB: Prediction | undefined,
  threshold: number = 0.5
): boolean {
  if (!windowA || !windowB) return false;
  const aAbove = windowA.confidence >= threshold;
  const bAbove = windowB.confidence >= threshold;
  return aAbove !== bAbove;
}

export function clampFrame(index: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, index));
}

export function framePath(frameDir: string, frameIndex: number): string {
  const padded = String(frameIndex + 1).padStart(5, "0");
  return `${frameDir}/img_${padded}.jpg`;
}
