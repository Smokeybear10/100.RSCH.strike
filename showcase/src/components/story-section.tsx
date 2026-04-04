import { Reveal } from "./reveal";

export function StorySection() {
  return (
    <div className="relative">
      {/* Moment 2 — Pipeline as vertical journey */}
      <section className="max-w-[900px] mx-auto px-5 py-32">
        <Reveal delay={0}>
          <div className="mb-20 text-center">
            <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-4">
              The Pipeline
            </span>
            <h2 className="text-[36px] sm:text-[52px] font-black text-white tracking-tight leading-[1.05]">
              Raw footage becomes
              <br />a decision.
            </h2>
          </div>
        </Reveal>

        {/* Asymmetric cascade, alternating sides */}
        <div className="relative">
          {/* Connecting vertical line */}
          <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent md:-translate-x-1/2 pointer-events-none" />

          {/* Step 1 — left side on desktop */}
          <Reveal delay={100}>
            <div className="relative flex items-start gap-6 mb-20 md:mb-28 md:pr-[52%]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-strike-red bg-background flex items-center justify-center font-black text-strike-red z-10">
                1
              </div>
              <div className="pt-1">
                <div className="text-[10px] font-mono text-dim tracking-[3px] uppercase mb-2">
                  Segment
                </div>
                <div className="text-[24px] sm:text-[28px] font-black text-white mb-3 leading-tight">
                  SAM2 masks the fighters.
                </div>
                <p className="text-[14px] text-muted leading-relaxed max-w-[380px]">
                  Broadcast footage is noisy. Cage, crowd, logos, overlays.
                  SAM2 isolates the two fighters so the model trains on motion,
                  not on the Monster logo.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 2 — right side on desktop */}
          <Reveal delay={100}>
            <div className="relative flex items-start gap-6 mb-20 md:mb-28 md:pl-[52%]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-strike-red bg-background flex items-center justify-center font-black text-strike-red z-10">
                2
              </div>
              <div className="pt-1">
                <div className="text-[10px] font-mono text-dim tracking-[3px] uppercase mb-2">
                  Annotate
                </div>
                <div className="text-[24px] sm:text-[28px] font-black text-white mb-3 leading-tight">
                  38 moments labeled by hand.
                </div>
                <p className="text-[14px] text-muted leading-relaxed max-w-[380px]">
                  Each moment is 5 frames long. 19 strikes, 19 neutral. One
                  weekend of labeling in Label Studio. No auto-annotation,
                  no synthetic data.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 3 — left side on desktop */}
          <Reveal delay={100}>
            <div className="relative flex items-start gap-6 md:pr-[52%]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-strike-red bg-background flex items-center justify-center font-black text-strike-red z-10">
                3
              </div>
              <div className="pt-1">
                <div className="text-[10px] font-mono text-dim tracking-[3px] uppercase mb-2">
                  Classify
                </div>
                <div className="text-[24px] sm:text-[28px] font-black text-white mb-3 leading-tight">
                  TSN predicts per window.
                </div>
                <p className="text-[14px] text-muted leading-relaxed max-w-[380px]">
                  Temporal Segment Network fine-tuned from Kinetics-400. One
                  prediction every 5 frames. The confidence line you scrubbed
                  through is exactly this output.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Moment 3 — 5 frames = 150ms statement */}
      <section className="max-w-[1100px] mx-auto px-5 py-32">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-16 items-center">
          <Reveal delay={0}>
            <div>
              <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-6">
                Temporal Window
              </span>
              <div className="text-[48px] sm:text-[64px] font-black text-white tracking-tight leading-[0.95] mb-6">
                150ms.
                <br />
                <span className="text-strike-red">5 frames.</span>
                <br />
                <span className="text-white/50">1 decision.</span>
              </div>
              <p className="text-[14px] text-muted leading-relaxed max-w-[400px]">
                A strike doesn&apos;t happen in one frame. It unfolds across
                roughly 150 milliseconds, which is 5 frames at 30fps. Single
                frames can&apos;t tell a wind-up from a land. The model reads
                the whole window at once.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative">
              {/* Frame strip visualization */}
              <div className="relative">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square border border-border-bright bg-black rounded-sm relative overflow-hidden group"
                      style={{
                        animationDelay: `${i * 100}ms`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] font-mono text-dimmer">
                          f{i + 1}
                        </span>
                      </div>
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-strike-red/60"
                        style={{
                          width: `${20 * (i + 1)}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                {/* Bracket */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 border-t border-l border-strike-orange" />
                  <span className="text-[9px] font-mono text-strike-orange tracking-[2px] uppercase whitespace-nowrap">
                    Window · 1 Prediction
                  </span>
                  <div className="flex-1 h-2 border-t border-r border-strike-orange" />
                </div>

                <div className="flex items-baseline justify-between mt-10 pt-6 border-t border-border">
                  <div>
                    <div className="text-[9px] font-mono text-dim tracking-[2px] uppercase mb-1">
                      Model Output
                    </div>
                    <div className="text-[28px] font-black text-strike-orange font-mono tabular-nums">
                      0.847
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-dim tracking-[2px] uppercase mb-1">
                      Label
                    </div>
                    <div className="text-[11px] font-black text-strike-red tracking-[2px]">
                      STRIKE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Moment 4 — Callback to the player */}
      <section className="max-w-[900px] mx-auto px-5 py-32">
        <Reveal delay={0}>
          <div className="text-center">
            <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-6">
              Callback
            </span>
            <div className="text-[40px] sm:text-[56px] font-black text-white tracking-tight leading-[1.1] max-w-[700px] mx-auto">
              That line above the player?
              <br />
              <span className="text-strike-red">
                It&apos;s this, every 5 frames.
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={250}>
          <div className="mt-14 mx-auto max-w-[640px] p-6 border border-border rounded-md bg-surface/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] text-dim uppercase tracking-[2px] font-mono">
                Strike Confidence · Per Window
              </span>
              <span className="text-[9px] text-dimmer font-mono tabular-nums">
                38 windows
              </span>
            </div>
            <svg
              viewBox="0 0 100 28"
              className="w-full h-20"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="callback-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points="0,28 0,22 8,20 16,17 24,12 32,6 38,2 42,4 46,10 52,14 58,9 64,4 70,10 76,16 82,20 88,22 94,24 100,23 100,28"
                fill="url(#callback-grad)"
              />
              <polyline
                points="0,22 8,20 16,17 24,12 32,6 38,2 42,4 46,10 52,14 58,9 64,4 70,10 76,16 82,20 88,22 94,24 100,23"
                fill="none"
                stroke="#dc2626"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="14"
                x2="100"
                y2="14"
                stroke="#525252"
                strokeWidth="0.3"
                strokeDasharray="2,2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-dimmer tracking-wide">
              <span>0.0</span>
              <span className="text-dim">threshold 0.5</span>
              <span>1.0</span>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
