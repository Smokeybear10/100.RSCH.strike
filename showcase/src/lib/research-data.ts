import type { Clip } from "./types";
import { demoClips } from "./demo-data";
import legacyTraining from "./legacy-training.json";

export type ResearchClip = Clip & {
  subtitle: string;
  notes: string;
  asset: string;
};

const CLIP_META: Record<string, Omit<ResearchClip, keyof Clip>> = {
  knockdown: {
    subtitle: "Knockdown sequence · interface example",
    notes: "Scores are hand-authored to demonstrate the player. They are not checkpoint predictions or an evaluation of this footage.",
    asset: "/demos/film-room-knockdown.gif",
  },
  exchange: {
    subtitle: "Standing exchange · interface example",
    notes: "Illustrative scores demonstrate uncertain windows. Neither strike labels nor model accuracy have been measured on this sequence.",
    asset: "/demos/film-room-exchange.gif",
  },
  pressure: {
    subtitle: "Cage pressure · interface example",
    notes: "Illustrative scores demonstrate repeated threshold crossings. These are not observed model failures.",
    asset: "/demos/film-room-pressure.gif",
  },
};

export const researchClips: ResearchClip[] = demoClips.map((clip) => ({
  ...clip,
  ...(CLIP_META[clip.id] ?? {
    subtitle: "Interface example",
    notes: "Illustrative scores; not measured model predictions.",
    asset: `/demos/film-room-${clip.id}.gif`,
  }),
}));

export const TRAINING = legacyTraining;

export type FailItem = {
  title: string;
  where: string;
  conf: string;
  why: string;
};

export const FAILURES: FailItem[] = [
  {
    title: "Clinch breaks and feints",
    where: "Evaluation slice to collect",
    conf: "Not measured",
    why: "Include non-strike movement as hard negatives. Fast movement alone should not count as a strike attempt.",
  },
  {
    title: "Missed and blocked strikes",
    where: "Positive examples to collect",
    conf: "Not measured",
    why: "A committed strike attempt is positive even without contact. Contact outcome must not define the target label.",
  },
  {
    title: "Window boundaries and occlusion",
    where: "Evaluation slice to collect",
    conf: "Not measured",
    why: "Record attempt timestamps and ambiguous windows before measuring missed events or double counting adjacent predictions.",
  },
];
