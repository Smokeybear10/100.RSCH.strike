import recordedDemo from "@/lib/recorded-demo.json";
import type { Clip } from "@/lib/types";
import { DemoPlayer } from "./demo-player";

const clipNames: Record<string, string> = {
  knockdown: "Knockdown",
  exchange: "Exchange",
  pressure: "Pressure",
};

const clips: Clip[] = Object.entries(recordedDemo.clips).map(([id, clip]) => ({
  id,
  name: clipNames[id] ?? id,
  totalFrames: clip.totalFrames,
  fps: 12,
  windowSize: clip.windowSize,
  frameDir: clip.frameDir,
  predictions: clip.predictions.map((prediction) => ({
    ...prediction,
    label: prediction.confidence >= recordedDemo.model.threshold ? "strike" : "neutral",
  })),
}));

export function RecordedDemoPlayer() {
  return <DemoPlayer clips={clips} model={{
    name: recordedDemo.model.name,
    threshold: recordedDemo.model.threshold,
    trainingClipCount: recordedDemo.model.trainingClipCount,
    checkpointSha256: recordedDemo.model.checkpointSha256,
  }} />;
}
