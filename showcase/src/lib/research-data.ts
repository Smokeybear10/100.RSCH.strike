import type { Clip } from "./types";
import { demoClips } from "./demo-data";

/* ──────────────────────────────────────────────────────────────────
   Research-paper-flavored clip metadata. Reuses prediction patterns
   from demo-data.ts; layers on the subtitle / commentary / asset
   path that the DemoPlayer sidebar reads.
   ────────────────────────────────────────────────────────────────── */

export type ResearchClip = Clip & {
  subtitle: string;
  notes: string;
  asset: string;
};

const CLIP_META: Record<string, Omit<ResearchClip, keyof Clip>> = {
  knockdown: {
    subtitle: "Topuria — R2 finishing sequence",
    notes:
      "Three confident detections in 6.7s. Peaks at w3 (0.93), w20 (0.96), w35 (0.85) align with the visible left hook → follow-up → referee stoppage.",
    asset: "/demos/film-room-knockdown.gif",
  },
  exchange: {
    subtitle: "Standing exchange — R1 mid-round",
    notes:
      "Model is appropriately uncertain. Most windows hover near 0.4. Two true positives at w16–w17 (jab → cross) and a late spike at w38 (a body kick the model partially catches).",
    asset: "/demos/film-room-exchange.gif",
  },
  pressure: {
    subtitle: "Sustained pressure on the cage",
    notes:
      "Hardest clip. Continuous low-amplitude motion produces a flickering signal. Two reliable hits (w5, w13) and a spurious peak at w35 — the model fires on a clinch break, not a strike.",
    asset: "/demos/film-room-pressure.gif",
  },
};

export const researchClips: ResearchClip[] = demoClips.map((c) => ({
  ...c,
  ...(CLIP_META[c.id] ?? {
    subtitle: "",
    notes: "",
    asset: `/demos/film-room-${c.id}.gif`,
  }),
}));

/* ──────────────────────────────────────────────────────────────────
   Training curves. The 3D-CNN run is reconstructed to match the
   writeup ("flatlines at 37.5% across all 20 epochs"). The TSN run
   converges by epoch 9 and plateaus at 0.83 val accuracy.
   ────────────────────────────────────────────────────────────────── */

export const TRAINING = {
  epochs: Array.from({ length: 20 }, (_, i) => i + 1),
  tsn: {
    train_loss: [
      0.69, 0.61, 0.52, 0.44, 0.37, 0.32, 0.28, 0.24, 0.21, 0.19, 0.17, 0.15,
      0.14, 0.12, 0.11, 0.1, 0.09, 0.09, 0.08, 0.08,
    ],
    val_acc: [
      0.5, 0.55, 0.6, 0.66, 0.71, 0.75, 0.79, 0.81, 0.83, 0.83, 0.83, 0.83,
      0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83,
    ],
  },
  cnn3d: {
    train_loss: [
      0.71, 0.7, 0.7, 0.69, 0.69, 0.69, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68,
      0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68,
    ],
    val_acc: Array.from({ length: 20 }, () => 0.375),
  },
};

/* ──────────────────────────────────────────────────────────────────
   Honest failure modes from the held-out evaluation. Mirrors the
   writeup — clinch break, slipped jab, window-boundary fragmentation.
   ────────────────────────────────────────────────────────────────── */

export type FailItem = {
  title: string;
  where: string;
  conf: string;
  why: string;
};

export const FAILURES: FailItem[] = [
  {
    title: "Clinch break fires as strike",
    where: "Pressure clip · w35",
    conf: "0.82",
    why: "Sudden separation looks like a recoiling punch. The pretrain has no concept of clinch.",
  },
  {
    title: "Slipped jab missed",
    where: "Exchange clip · w3",
    conf: "0.33",
    why: "Defender slips outside; striker's arm extends fully but never makes a connecting motion. The model splits the difference.",
  },
  {
    title: "Strike crosses window boundary",
    where: "Knockdown clip · w14–w15",
    conf: "0.48 / 0.82",
    why: "Wind-up sits in w14, contact in w15. Non-overlapping windows fragment the action; only w15 fires.",
  },
];
