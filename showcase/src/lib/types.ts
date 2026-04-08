export type Prediction = {
  window: number;
  startFrame: number;
  endFrame: number;
  confidence: number;
  label: "strike" | "neutral";
};

export type Clip = {
  id: string;
  name: string;
  totalFrames: number;
  fps: number;
  windowSize: number;
  predictions: Prediction[];
  frameDir: string;
};
