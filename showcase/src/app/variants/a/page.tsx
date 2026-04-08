import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantA() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-[family-name:var(--font-barlow)]">
      <VariantNav tone="dark" />

      {/* Broadcast top chrome */}
      <div className="sticky top-0 z-50 bg-black border-b-2 border-[#dc2626]">
        <div className="flex items-center justify-between px-5 py-2 bg-gradient-to-r from-[#dc2626] via-[#dc2626]/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-[3px] uppercase text-white font-[family-name:var(--font-oswald)]">
              ● LIVE
            </span>
            <span className="text-[10px] font-bold tracking-[2px] uppercase text-white/90">
              STR1KE Main Card
            </span>
          </div>
          <div className="text-[10px] font-mono tracking-[2px] text-white/80">
            TSN · KINETICS-400 · 38 SAMPLES
          </div>
        </div>
        {/* Scrolling ticker */}
        <div className="overflow-hidden bg-[#1a0000] border-t border-[#dc2626]/40">
          <div className="flex gap-10 py-1.5 text-[10px] font-mono tracking-[2px] uppercase text-[#f59e0b] whitespace-nowrap animate-[scroll_40s_linear_infinite]">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="flex gap-10 shrink-0">
                <span>N_STRIKES = 19</span>
                <span className="text-white/40">//</span>
                <span>N_NEUTRAL = 19</span>
                <span className="text-white/40">//</span>
                <span>WINDOW = 5 FRAMES</span>
                <span className="text-white/40">//</span>
                <span>FPS = 30</span>
                <span className="text-white/40">//</span>
                <span>BASELINE = KINETICS-400</span>
                <span className="text-white/40">//</span>
                <span>TRAINED ON 38 CLIPS</span>
                <span className="text-white/40">//</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative px-5 py-8">
        {/* Title card */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Diagonal belt-reveal behind title */}
          <div className="absolute left-0 right-0 h-[120px] bg-gradient-to-r from-transparent via-[#dc2626] to-transparent skew-y-[-2deg] opacity-40" />
          <div className="relative text-center">
            <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-1 font-[family-name:var(--font-oswald)]">
              ⟨ Main Event ⟩
            </div>
            <h1 className="text-[72px] sm:text-[120px] font-black tracking-[4px] leading-none text-white font-[family-name:var(--font-anton)]">
              STR<span className="text-[#dc2626]">1</span>KE
            </h1>
            <div className="text-[10px] font-black tracking-[4px] uppercase text-white/60 -mt-1 font-[family-name:var(--font-oswald)]">
              VS · A WEEKEND OF FOOTAGE
            </div>
          </div>
        </div>

        {/* Tale of the Tape */}
        <div className="max-w-[820px] mx-auto mb-6 grid grid-cols-3 gap-px bg-[#dc2626] p-px">
          <div className="bg-black px-4 py-2 text-center">
            <div className="text-[8px] font-mono tracking-[2px] uppercase text-[#f59e0b]">
              Model
            </div>
            <div className="text-[14px] font-black tracking-wide text-white font-[family-name:var(--font-oswald)]">
              TSN
            </div>
          </div>
          <div className="bg-black px-4 py-2 text-center border-x border-[#dc2626]/40">
            <div className="text-[8px] font-mono tracking-[2px] uppercase text-[#f59e0b]">
              Pretrain
            </div>
            <div className="text-[14px] font-black tracking-wide text-white font-[family-name:var(--font-oswald)]">
              400,000
            </div>
          </div>
          <div className="bg-black px-4 py-2 text-center">
            <div className="text-[8px] font-mono tracking-[2px] uppercase text-[#f59e0b]">
              Fine-tune
            </div>
            <div className="text-[14px] font-black tracking-wide text-white font-[family-name:var(--font-oswald)]">
              38
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="max-w-[820px] mx-auto">
          <HeroPlayer clips={demoClips} />
        </div>
      </section>

      {/* 38 Scoreboard */}
      <section className="relative py-28 px-5 border-t-2 border-[#dc2626]/30 mt-8">
        {/* Diagonal red banner */}
        <div className="absolute top-12 left-0 right-0 h-10 bg-[#dc2626] skew-y-[-3deg] flex items-center justify-center">
          <span className="text-[11px] font-black tracking-[6px] uppercase text-white font-[family-name:var(--font-oswald)] skew-y-[3deg]">
            ▸ Training Data ▸
          </span>
        </div>

        <div className="relative text-center mt-20">
          <div className="inline-block border-4 border-[#f59e0b] bg-black px-12 py-8">
            <div className="text-[8px] font-black tracking-[3px] uppercase text-[#f59e0b] mb-2 font-[family-name:var(--font-oswald)]">
              Official Weigh-In
            </div>
            <div className="text-[160px] sm:text-[220px] font-black leading-none text-[#dc2626] tabular-nums font-[family-name:var(--font-anton)]">
              38
            </div>
            <div className="text-[11px] font-black tracking-[4px] uppercase text-white mt-2 font-[family-name:var(--font-oswald)]">
              Training Moments
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-[11px] font-black tracking-[3px] uppercase font-[family-name:var(--font-oswald)]">
            <span>
              <span className="text-[#dc2626]">19</span>{" "}
              <span className="text-white/60">Strike</span>
            </span>
            <span className="text-white/20">·</span>
            <span>
              <span className="text-white">19</span>{" "}
              <span className="text-white/60">Neutral</span>
            </span>
            <span className="text-white/20">·</span>
            <span>
              <span className="text-[#f59e0b]">190</span>{" "}
              <span className="text-white/60">Frames</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pipeline — Three Rounds */}
      <section className="py-28 px-5 border-t-2 border-[#dc2626]/30">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[9px] font-black tracking-[4px] uppercase text-[#f59e0b] mb-2 font-[family-name:var(--font-oswald)]">
              ⟨ The Pipeline ⟩
            </div>
            <h2 className="text-[48px] sm:text-[72px] font-black tracking-[2px] uppercase leading-none text-white font-[family-name:var(--font-anton)]">
              Three Rounds.
              <br />
              <span className="text-[#dc2626]">One Decision.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#dc2626]">
            {[
              {
                round: 1,
                title: "Segment",
                desc: "SAM2 isolates fighters from broadcast chrome. No crowd. No logos. No cage. Just motion.",
              },
              {
                round: 2,
                title: "Annotate",
                desc: "38 five-frame moments labeled by hand. 19 strikes, 19 neutral. One weekend in Label Studio.",
              },
              {
                round: 3,
                title: "Classify",
                desc: "TSN predicts per window. Fine-tuned from Kinetics-400. One confidence score every 5 frames.",
              },
            ].map((r) => (
              <div
                key={r.round}
                className="bg-black p-8 relative min-h-[260px]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-[72px] font-black leading-none text-[#dc2626] tabular-nums font-[family-name:var(--font-anton)]">
                    {r.round}
                  </div>
                  <div className="pt-2">
                    <div className="text-[9px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                      Round {r.round}
                    </div>
                    <div className="text-[24px] font-black tracking-wide uppercase text-white leading-none font-[family-name:var(--font-oswald)]">
                      {r.title}
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed">
                  {r.desc}
                </p>
                {/* Bell icon corner */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-[10px] font-black">
                  ●
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 150ms — The Call */}
      <section className="py-28 px-5 border-t-2 border-[#dc2626]/30">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[9px] font-black tracking-[4px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
                ⟨ The Call ⟩
              </div>
              <div className="text-[96px] sm:text-[140px] font-black leading-[0.85] text-white font-[family-name:var(--font-anton)]">
                150
                <span className="text-[48px] sm:text-[64px] text-[#f59e0b]">
                  MS
                </span>
              </div>
              <div className="text-[32px] font-black tracking-[2px] uppercase text-[#dc2626] mt-2 font-[family-name:var(--font-oswald)]">
                5 Frames. 1 Decision.
              </div>
              <p className="text-[14px] text-white/70 mt-4 max-w-[420px] leading-relaxed">
                A strike lands in 150 milliseconds. Five frames at 30fps. The
                model watches the whole sequence, calls strike or neutral.
                That&apos;s the fight.
              </p>
            </div>

            <div className="relative">
              {/* Scorecard-style frame strip */}
              <div className="border-2 border-[#f59e0b] bg-black p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f59e0b]/40">
                  <span className="text-[9px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                    Judge Scorecard
                  </span>
                  <span className="text-[9px] font-mono tracking-[2px] text-white/60">
                    Window 15
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square border border-[#f59e0b]/60 bg-black/60 flex items-center justify-center relative"
                    >
                      <span className="text-[11px] font-black text-[#f59e0b] font-mono">
                        F{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#f59e0b]/40 flex items-end justify-between">
                  <div>
                    <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60">
                      Confidence
                    </div>
                    <div className="text-[36px] font-black text-[#f59e0b] font-mono tabular-nums leading-none">
                      0.847
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60">
                      Verdict
                    </div>
                    <div className="text-[20px] font-black tracking-[3px] text-[#dc2626] font-[family-name:var(--font-oswald)]">
                      STRIKE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Callback */}
      <section className="py-28 px-5 border-t-2 border-[#dc2626]/30">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="text-[9px] font-black tracking-[4px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
            ⟨ Replay ⟩
          </div>
          <h2 className="text-[36px] sm:text-[56px] font-black tracking-[2px] uppercase leading-[1.05] text-white font-[family-name:var(--font-anton)]">
            The line above the player?
            <br />
            <span className="text-[#dc2626]">
              That&apos;s this. Every 5 frames.
            </span>
          </h2>

          <div className="mt-12 border-2 border-[#dc2626] bg-[#1a0000] p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                Round-by-Round Scorecard
              </span>
              <span className="text-[9px] font-mono tracking-[2px] text-white/60">
                38 WINDOWS
              </span>
            </div>
            <svg
              viewBox="0 0 100 28"
              className="w-full h-24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="fc-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points="0,28 0,22 8,20 16,17 24,12 32,6 38,2 42,4 46,10 52,14 58,9 64,4 70,10 76,16 82,20 88,22 94,24 100,23 100,28"
                fill="url(#fc-grad)"
              />
              <polyline
                points="0,22 8,20 16,17 24,12 32,6 38,2 42,4 46,10 52,14 58,9 64,4 70,10 76,16 82,20 88,22 94,24 100,23"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="14"
                x2="100"
                y2="14"
                stroke="#dc2626"
                strokeWidth="0.4"
                strokeDasharray="2,2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </section>

      <footer className="py-12 px-5 border-t-2 border-[#dc2626]/30 bg-[#0a0000]">
        <div className="text-center">
          <div className="text-[11px] font-black tracking-[4px] uppercase text-white font-[family-name:var(--font-oswald)]">
            STR1KE · BY THOMAS OU
          </div>
          <div className="text-[9px] font-mono tracking-[2px] uppercase text-[#f59e0b]/60 mt-2">
            Variant A · Fight Card
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
