import type { Clip, Prediction } from "./types";

function generatePredictions(
  totalFrames: number,
  windowSize: number,
  pattern: number[]
): Prediction[] {
  const numWindows = Math.ceil(totalFrames / windowSize);
  return Array.from({ length: numWindows }, (_, i) => {
    const confidence = pattern[i % pattern.length];
    return {
      window: i,
      startFrame: i * windowSize,
      endFrame: Math.min((i + 1) * windowSize - 1, totalFrames - 1),
      confidence,
      label: confidence >= 0.5 ? "strike" : "neutral",
    } satisfies Prediction;
  });
}

// Knockdown sequence: buildup → big strike → ground
const knockdownPattern = [
  0.12, 0.15, 0.22, 0.28, 0.35, 0.44, 0.52, 0.61, 0.73, 0.84,
  0.91, 0.95, 0.88, 0.79, 0.82, 0.90, 0.85, 0.72, 0.58, 0.43,
  0.31, 0.24, 0.18, 0.14, 0.11, 0.09, 0.12, 0.15, 0.11, 0.08,
  0.13, 0.10, 0.08, 0.11, 0.09, 0.07, 0.12, 0.10, 0.08, 0.11,
];

// Standing exchange: two fighters trading shots
const exchangePattern = [
  0.08, 0.14, 0.22, 0.38, 0.55, 0.72, 0.63, 0.41, 0.28, 0.19,
  0.15, 0.23, 0.41, 0.58, 0.74, 0.82, 0.71, 0.53, 0.35, 0.22,
  0.16, 0.12, 0.18, 0.31, 0.48, 0.62, 0.55, 0.38, 0.24, 0.15,
  0.11, 0.09, 0.14, 0.12, 0.08, 0.11, 0.09, 0.13, 0.10, 0.08,
];

// Pressure fighting: sustained forward pressure with strikes
const pressurePattern = [
  0.11, 0.19, 0.28, 0.42, 0.56, 0.68, 0.75, 0.81, 0.77, 0.69,
  0.58, 0.51, 0.62, 0.74, 0.83, 0.89, 0.92, 0.85, 0.71, 0.55,
  0.42, 0.35, 0.48, 0.61, 0.73, 0.79, 0.72, 0.58, 0.41, 0.29,
  0.21, 0.15, 0.12, 0.09, 0.11, 0.08, 0.13, 0.10, 0.07, 0.11,
];

// SAM2-masked version for the hero scroll sequence
export const heroClip: Clip = {
  id: "knockdown-masked",
  name: "Knockdown",
  totalFrames: 200,
  fps: 12,
  windowSize: 5,
  predictions: generatePredictions(200, 5, knockdownPattern),
  frameDir: "/clips/knockdown-masked",
};

export const demoClips: Clip[] = [
  {
    id: "knockdown",
    name: "Knockdown",
    totalFrames: 200,
    fps: 12,
    windowSize: 5,
    predictions: generatePredictions(200, 5, knockdownPattern),
    frameDir: "/clips/knockdown",
  },
  {
    id: "exchange",
    name: "Exchange",
    totalFrames: 200,
    fps: 12,
    windowSize: 5,
    predictions: generatePredictions(200, 5, exchangePattern),
    frameDir: "/clips/exchange",
  },
  {
    id: "pressure",
    name: "Pressure",
    totalFrames: 200,
    fps: 12,
    windowSize: 5,
    predictions: generatePredictions(200, 5, pressurePattern),
    frameDir: "/clips/pressure",
  },
];
