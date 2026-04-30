// Real prediction patterns lifted from showcase/src/lib/demo-data.ts
// 200 frames @ 12fps, windowSize=5 → 40 windows per clip

const knockdownPattern = [
  0.22, 0.45, 0.47, 0.93, 0.78, 0.55, 0.28, 0.14, 0.09, 0.16,
  0.15, 0.22, 0.32, 0.44, 0.48, 0.82, 0.48, 0.28, 0.18, 0.25,
  0.96, 0.72, 0.52, 0.30, 0.14, 0.11, 0.09, 0.12, 0.10, 0.13,
  0.16, 0.22, 0.30, 0.40, 0.47, 0.85, 0.45, 0.24, 0.12, 0.08,
];

const exchangePattern = [
  0.22, 0.47, 0.40, 0.33, 0.28, 0.47, 0.40, 0.36, 0.40, 0.45,
  0.25, 0.18, 0.14, 0.12, 0.10, 0.22, 0.62, 0.66, 0.48, 0.40,
  0.33, 0.28, 0.24, 0.33, 0.46, 0.40, 0.34, 0.28, 0.24, 0.20,
  0.17, 0.14, 0.12, 0.10, 0.09, 0.11, 0.38, 0.28, 0.82, 0.45,
];

const pressurePattern = [
  0.42, 0.45, 0.43, 0.47, 0.48, 0.84, 0.78, 0.73, 0.55, 0.40,
  0.32, 0.25, 0.42, 0.98, 0.74, 0.55, 0.42, 0.33, 0.23, 0.18,
  0.15, 0.19, 0.28, 0.45, 0.67, 0.46, 0.38, 0.30, 0.24, 0.18,
  0.32, 0.53, 0.48, 0.62, 0.51, 0.82, 0.65, 0.40, 0.28, 0.15,
];

const buildPredictions = (pattern, windowSize = 5) =>
  pattern.map((conf, i) => ({
    window: i,
    startFrame: i * windowSize,
    endFrame: (i + 1) * windowSize - 1,
    confidence: conf,
    label: conf >= 0.5 ? 'strike' : 'neutral',
  }));

const CLIPS = [
  {
    id: 'knockdown',
    name: 'Knockdown',
    subtitle: 'Topuria — R2 finishing sequence',
    notes: 'Three confident detections in 6.7s. Peaks at W3 (0.93), W20 (0.96), W35 (0.85) align with the visible left hook → follow-up → referee stoppage.',
    asset: 'assets/demos/film-room-knockdown.gif',
    fps: 12,
    totalFrames: 200,
    windowSize: 5,
    predictions: buildPredictions(knockdownPattern),
  },
  {
    id: 'exchange',
    name: 'Exchange',
    subtitle: 'Standing exchange — R1 mid-round',
    notes: 'Model is appropriately uncertain. Most windows hover near 0.4. Two true positives at W16–W17 (jab → cross) and a late spike at W38 (a body kick the model partially catches).',
    asset: 'assets/demos/film-room-exchange.gif',
    fps: 12,
    totalFrames: 200,
    windowSize: 5,
    predictions: buildPredictions(exchangePattern),
  },
  {
    id: 'pressure',
    name: 'Pressure',
    subtitle: 'Sustained pressure on the cage',
    notes: 'Hardest clip. Continuous low-amplitude motion produces a flickering signal. Two reliable hits (W5, W13) and a spurious peak at W35 — model fires on a clinch break, not a strike.',
    asset: 'assets/demos/film-room-pressure.gif',
    fps: 12,
    totalFrames: 200,
    windowSize: 5,
    predictions: buildPredictions(pressurePattern),
  },
];

// Training curves — plausible reconstruction matching the writeup
// 3D CNN: flatlines at 37.5% across 20 epochs (the doc explicitly says this)
// TSN:     converges quickly thanks to Kinetics-400 pretrain
const TRAINING = {
  epochs: Array.from({ length: 20 }, (_, i) => i + 1),
  tsn: {
    train_loss: [0.69, 0.61, 0.52, 0.44, 0.37, 0.32, 0.28, 0.24, 0.21, 0.19, 0.17, 0.15, 0.14, 0.12, 0.11, 0.10, 0.09, 0.09, 0.08, 0.08],
    val_acc:    [0.50, 0.55, 0.60, 0.66, 0.71, 0.75, 0.79, 0.81, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83, 0.83],
  },
  cnn3d: {
    train_loss: [0.71, 0.70, 0.70, 0.69, 0.69, 0.69, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68],
    val_acc:    [0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375],
  },
};

// Held-out test windows — honest results table
const TEST_RESULTS = [
  { id: 'tp-01', truth: 'strike', pred: 'strike', conf: 0.91, note: 'Clean left hook, full body rotation visible.' },
  { id: 'tp-02', truth: 'neutral', pred: 'neutral', conf: 0.18, note: 'Circling, hands at guard.' },
];

// Failure modes documented separately
const FAILURES = [
  {
    title: 'Clinch break fires as strike',
    where: 'Pressure clip, W35',
    conf: 0.82,
    why: 'Sudden separation looks like a recoiling punch. The pretrain has no concept of clinch.',
  },
  {
    title: 'Slipped jab missed',
    where: 'Exchange clip, W3',
    conf: 0.33,
    why: 'Defender slips outside; striker’s arm extends fully but never makes a connecting motion. Model splits the difference.',
  },
  {
    title: 'Strike crosses window boundary',
    where: 'Knockdown clip, W14–W15',
    conf: '0.48 / 0.82',
    why: 'Wind-up sits in W14, contact in W15. Non-overlapping windows fragment the action; only W15 fires.',
  },
];

window.STR1KE = { CLIPS, TRAINING, TEST_RESULTS, FAILURES };
