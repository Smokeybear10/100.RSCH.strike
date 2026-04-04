import { Reveal } from "./reveal";

export function DeepDiveSection() {
  return (
    <section className="max-w-[960px] mx-auto px-5 py-28">
      <div className="mb-14 text-center">
        <Reveal delay={0}>
          <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-3">
            Under the Hood
          </span>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="text-[36px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
            How 38 samples
            <br />
            become a model.
          </h2>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: Transfer learning scale */}
        <Reveal delay={300}>
          <div className="p-8 border border-border rounded-md bg-surface/50 h-full flex flex-col">
            <div className="text-[10px] font-mono text-dim tracking-[2px] uppercase mb-6">
              01 · Transfer Learning
            </div>

            <div className="flex-1 flex flex-col justify-center items-center gap-6 py-6">
              <div className="w-full">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] font-mono text-dim tracking-wide uppercase">
                    Kinetics-400
                  </span>
                  <span className="text-[22px] font-black text-muted tabular-nums">
                    400K
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
                  <div className="h-full bg-muted/60 rounded-sm w-full" />
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] font-mono text-strike-red tracking-wide uppercase">
                    STR1KE
                  </span>
                  <span className="text-[22px] font-black text-strike-red tabular-nums">
                    38
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-strike-red rounded-sm"
                    style={{ width: "0.01%" }}
                  />
                </div>
              </div>
            </div>

            <div className="text-[12px] text-muted leading-relaxed mt-6 pt-6 border-t border-border">
              Kinetics-400 taught it motion.
              <br />
              38 samples taught it strikes.
            </div>
          </div>
        </Reveal>

        {/* Panel 2: 5-frame window */}
        <Reveal delay={420}>
          <div className="p-8 border border-border rounded-md bg-surface/50 h-full flex flex-col">
            <div className="text-[10px] font-mono text-dim tracking-[2px] uppercase mb-6">
              02 · Temporal Window
            </div>

            <div className="flex-1 flex flex-col justify-center items-center gap-4 py-6">
              {/* 5 frame boxes with bracket */}
              <div className="relative w-full">
                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 max-w-[38px] aspect-square border border-border-bright bg-black rounded-sm relative flex items-center justify-center"
                    >
                      <span className="text-[9px] font-mono text-dimmer tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Bracket */}
                <div className="mt-2 flex items-center justify-center">
                  <div className="flex-1 max-w-[200px] h-2 border-t border-l border-r border-strike-orange/60" />
                </div>
                <div className="text-center mt-1 text-[9px] font-mono text-strike-orange tracking-[2px] uppercase">
                  1 prediction
                </div>
              </div>

              <div className="text-[22px] font-black text-white tabular-nums mt-2">
                5 <span className="text-dim text-[15px] font-mono">frames</span>{" "}
                <span className="text-dim">→</span> 1
              </div>
            </div>

            <div className="text-[12px] text-muted leading-relaxed mt-6 pt-6 border-t border-border">
              Strikes unfold across 150ms.
              <br />
              The model reads 5 frames at a time.
            </div>
          </div>
        </Reveal>

        {/* Panel 3: Confidence output */}
        <Reveal delay={540}>
          <div className="p-8 border border-border rounded-md bg-surface/50 h-full flex flex-col">
            <div className="text-[10px] font-mono text-dim tracking-[2px] uppercase mb-6">
              03 · Per-Window Output
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-6">
              <svg
                viewBox="0 0 100 50"
                className="w-full h-24"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="deep-grad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#dc2626"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="#dc2626"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {/* Area */}
                <polygon
                  points="0,50 0,42 10,38 20,30 30,18 40,8 45,5 50,12 55,20 65,32 75,40 85,44 95,46 100,45 100,50"
                  fill="url(#deep-grad)"
                />
                {/* Line */}
                <polyline
                  points="0,42 10,38 20,30 30,18 40,8 45,5 50,12 55,20 65,32 75,40 85,44 95,46 100,45"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Threshold */}
                <line
                  x1="0"
                  y1="25"
                  x2="100"
                  y2="25"
                  stroke="#525252"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Strike dot */}
                <circle cx="45" cy="5" r="1.5" fill="#f97316" />
              </svg>

              <div className="flex items-center justify-between w-full mt-3 text-[9px] font-mono text-dimmer tracking-wide">
                <span>0.0</span>
                <span className="text-dim">threshold 0.5</span>
                <span>1.0</span>
              </div>
            </div>

            <div className="text-[12px] text-muted leading-relaxed mt-6 pt-6 border-t border-border">
              One score per window.
              <br />
              Scrub and watch belief rise and fall.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
