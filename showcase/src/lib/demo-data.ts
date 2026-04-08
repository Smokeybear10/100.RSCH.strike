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

// Knockdown sequence: high below .5 at 5-13, rises 17, .93 at 19, slow drop from 23, super low 33-49
const knockdownPattern = [
//  w0    w1    w2    w3    w4    w5    w6    w7    w8    w9
  0.22, 0.45, 0.47, 0.93, 0.78, 0.55, 0.28, 0.14, 0.09, 0.16,
// w10   w11   w12   w13   w14   w15   w16   w17   w18   w19
  0.15, 0.22, 0.32, 0.44, 0.48, 0.82, 0.48, 0.28, 0.18, 0.25,
// w20   w21   w22   w23   w24   w25   w26   w27   w28   w29
  0.96, 0.72, 0.52, 0.30, 0.14, 0.11, 0.09, 0.12, 0.10, 0.13,
// w30   w31   w32   w33   w34   w35   w36   w37   w38   w39
  0.16, 0.22, 0.30, 0.40, 0.47, 0.85, 0.45, 0.24, 0.12, 0.08,
];

// Standing exchange: high opener, taper, peaks at 25/29/45, drops, .66 at 85, .82 spike at 191
const exchangePattern = [
//  w0    w1    w2    w3    w4    w5    w6    w7    w8    w9
  0.22, 0.47, 0.40, 0.33, 0.28, 0.47, 0.40, 0.36, 0.40, 0.45,
// w10   w11   w12   w13   w14   w15   w16   w17   w18   w19
  0.25, 0.18, 0.14, 0.12, 0.10, 0.22, 0.62, 0.66, 0.48, 0.40,
// w20   w21   w22   w23   w24   w25   w26   w27   w28   w29
  0.33, 0.28, 0.24, 0.33, 0.46, 0.40, 0.34, 0.28, 0.24, 0.20,
// w30   w31   w32   w33   w34   w35   w36   w37   w38   w39
  0.17, 0.14, 0.12, 0.10, 0.09, 0.11, 0.38, 0.28, 0.82, 0.45,
];

// Pressure fighting: high start, .84 at 28, .98 at 69, .67 at 121, drops to end
const pressurePattern = [
//  w0    w1    w2    w3    w4    w5    w6    w7    w8    w9
  0.42, 0.45, 0.43, 0.47, 0.48, 0.84, 0.78, 0.73, 0.55, 0.40,
// w10   w11   w12   w13   w14   w15   w16   w17   w18   w19
  0.32, 0.25, 0.42, 0.98, 0.74, 0.55, 0.42, 0.33, 0.23, 0.18,
// w20   w21   w22   w23   w24   w25   w26   w27   w28   w29
  0.15, 0.19, 0.28, 0.45, 0.67, 0.46, 0.38, 0.30, 0.24, 0.18,
// w30   w31   w32   w33   w34   w35   w36   w37   w38   w39
  0.32, 0.53, 0.48, 0.62, 0.51, 0.82, 0.65, 0.40, 0.28, 0.15,
];

// SAM2-masked clips for the hero scroll compilation
export const heroClips: Clip[] = [
  {
    id: "knockdown-masked",
    name: "Knockdown",
    totalFrames: 200,
    fps: 12,
    windowSize: 5,
    predictions: generatePredictions(200, 5, knockdownPattern),
    frameDir: "/clips/knockdown-masked",
  },
  {
    id: "exchange-masked",
    name: "Exchange",
    totalFrames: 200,
    fps: 12,
    windowSize: 5,
    predictions: generatePredictions(200, 5, exchangePattern),
    frameDir: "/clips/exchange-masked",
  },
];

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
