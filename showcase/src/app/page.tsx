import { ScrollHero } from "@/components/scroll-hero";
import { BroadcastChrome } from "@/components/broadcast-chrome";
import { ScrollFilmRoom } from "@/components/scroll-film-room";
import { FCCounter } from "@/components/fc-counter";
import { FCUpload } from "@/components/fc-upload";
import { SlamIn } from "@/components/slam-in";
import { CountUp } from "@/components/count-up";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/Smokeybear10" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/thomasou0/" },
  { name: "Website", href: "https://thomasou.com/" },
];

export default function Home() {
  return (
    <main className="relative z-10 bg-black text-white font-[family-name:var(--font-barlow)] overflow-x-clip">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BROADCAST CHROME — fixed, appears at weigh-in                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <BroadcastChrome />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO — cinematic scroll-scrubbed sequence                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <ScrollHero />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HIGHLIGHT REEL — stat callouts between rounds                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t-2 border-b-2 border-[#dc2626] bg-[#0a0000] py-6">
        <div className="max-w-[1100px] mx-auto px-5 flex items-center justify-between gap-6 flex-wrap">
          <SlamIn variant="sweep" delay={0}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] live-dot" />
              <span className="text-[9px] font-black tracking-[4px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                Highlight Reel
              </span>
            </div>
          </SlamIn>
          {[
            ["< 1 min", "Training time"],
            ["1 GPU", "Consumer grade"],
            ["1 weekend", "To label"],
            ["3 clips", "Held-out"],
          ].map(([val, lbl], i) => (
            <SlamIn key={lbl} variant="slam" delay={100 + i * 80}>
              <div className="text-center">
                <div className="text-[22px] font-black text-white leading-none font-[family-name:var(--font-anton)]">
                  {val}
                </div>
                <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/50 mt-1">
                  {lbl}
                </div>
              </div>
            </SlamIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CHAPTER 1 — WEIGH-IN 38 (sticky)                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="weigh-in"
        className="sticky top-0 min-h-screen bg-black flex items-center justify-center overflow-hidden relative px-5"
      >
        <FCCounter />
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* THREE ROUNDS — Pipeline with slam-in numerals                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="sticky top-0 min-h-screen mt-[30vh] bg-[#0a0000] flex items-center overflow-hidden relative px-5">
        <div className="max-w-[1100px] mx-auto w-full relative border-2 border-white/10 p-6 sm:p-10">
          {/* Corner marks */}
          <div className="absolute -top-px -left-px w-6 h-6 border-l-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -top-px -right-px w-6 h-6 border-r-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -left-px w-6 h-6 border-l-[3px] border-b-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -right-px w-6 h-6 border-r-[3px] border-b-[3px] border-[#f59e0b]" />

          {/* Fight card header */}
          <div className="text-center mb-2">
            <SlamIn variant="sweep" delay={0}>
              <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-4 font-[family-name:var(--font-oswald)]">
                ● Main Card · Bout 02 ●
              </div>
            </SlamIn>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-12 h-[2px] bg-[#dc2626]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
              <div className="w-12 h-[2px] bg-[#dc2626]" />
            </div>
          </div>

          <SlamIn variant="slam" delay={150}>
            <div className="text-center mb-4">
              <h2 className="text-[56px] sm:text-[88px] font-black tracking-[2px] uppercase leading-[0.9] text-white font-[family-name:var(--font-anton)]">
                Three Rounds.
                <br />
                <span className="text-[#dc2626] drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                  One Decision.
                </span>
              </h2>
            </div>
          </SlamIn>

          <SlamIn variant="sweep" delay={300}>
            <div className="text-center mb-8 text-[11px] font-black tracking-[4px] uppercase text-white/60 font-[family-name:var(--font-oswald)]">
              Segment · Annotate · Classify
            </div>
          </SlamIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#dc2626] relative">
            {[
              {
                round: 1,
                title: "Segment",
                tagline: "Isolate the fighters",
                desc: "SAM2 strips the broadcast. No cage. No crowd. No Monster logos. The classifier sees silhouettes, not television.",
                stats: [
                  ["Tool", "SAM2"],
                  ["Output", "Per-frame masks"],
                ],
              },
              {
                round: 2,
                title: "Annotate",
                tagline: "Label the moments",
                desc: "38 five-frame windows marked by hand. 19 strikes, 19 neutral. Label Studio. One weekend at a kitchen table.",
                stats: [
                  ["Windows", "38"],
                  ["Frames each", "5"],
                ],
              },
              {
                round: 3,
                title: "Classify",
                tagline: "Call the strike",
                desc: "Temporal Segment Network fine-tuned from Kinetics-400. One confidence score every five frames. Strike or neutral.",
                stats: [
                  ["Backbone", "TSN"],
                  ["Pretrain", "Kinetics-400"],
                ],
              },
            ].map((r, i) => (
              <SlamIn key={r.round} variant="slam" delay={i * 150}>
                <div className="bg-black p-8 relative min-h-[340px] group h-full">
                  {/* Round label */}
                  <div className="flex items-end gap-3 mb-4">
                    <div className="text-[88px] font-black leading-none text-[#dc2626] tabular-nums font-[family-name:var(--font-anton)] drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                      {r.round}
                    </div>
                    <div className="pb-2">
                      <div className="text-[9px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                        Round {r.round}
                      </div>
                      <div className="text-[28px] font-black tracking-wide uppercase text-white leading-none font-[family-name:var(--font-oswald)]">
                        {r.title}
                      </div>
                      <div className="text-[10px] font-mono tracking-[2px] uppercase text-white/50 mt-1">
                        {r.tagline}
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/70 leading-relaxed mb-5">
                    {r.desc}
                  </p>
                  {/* Mini stats */}
                  <div className="mt-auto pt-4 border-t border-[#dc2626]/40 grid grid-cols-2 gap-3">
                    {r.stats.map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[8px] font-mono tracking-[2px] uppercase text-[#f59e0b]">
                          {k}
                        </div>
                        <div className="text-[13px] font-black tracking-wide uppercase text-white font-[family-name:var(--font-oswald)] mt-0.5">
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SlamIn>
            ))}
          </div>

          {/* Bottom divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-[2px] bg-[#dc2626]" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
            <div className="w-12 h-[2px] bg-[#dc2626]" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 150MS — scroll-linked giant number + frame-pop cards            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section id="the-call" className="sticky top-0 min-h-screen mt-[30vh] bg-black flex items-center overflow-hidden relative px-5">
        {/* Diagonal red slash background */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[280px] bg-gradient-to-r from-transparent via-[#dc2626]/8 to-transparent skew-y-[-2deg] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative w-full border-2 border-white/10 p-6 sm:p-10">
          {/* Corner marks */}
          <div className="absolute -top-px -left-px w-6 h-6 border-l-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -top-px -right-px w-6 h-6 border-r-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -left-px w-6 h-6 border-l-[3px] border-b-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -right-px w-6 h-6 border-r-[3px] border-b-[3px] border-[#f59e0b]" />

          {/* Fight card header */}
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-6">
              <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
                ● Main Event · Bout 03 ●
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-[2px] bg-[#dc2626]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
                <div className="w-12 h-[2px] bg-[#dc2626]" />
              </div>
            </div>
          </SlamIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="scroll-scale-hero origin-left text-[110px] sm:text-[180px] font-black leading-[0.8] text-white font-[family-name:var(--font-anton)] tracking-tight">
                150
                <span className="text-[52px] sm:text-[72px] text-[#f59e0b] tracking-wider ml-2 align-top">
                  MS
                </span>
              </div>
              <SlamIn variant="sweep" delay={100}>
                <div className="text-[30px] sm:text-[40px] font-black tracking-[2px] uppercase text-[#dc2626] mt-2 font-[family-name:var(--font-oswald)] leading-none">
                  5 Frames. 1 Decision.
                </div>
              </SlamIn>
              <SlamIn variant="sweep" delay={250}>
                <div className="mt-6 border-l-[4px] border-[#f59e0b] pl-4">
                  <p className="text-[15px] text-white/80 max-w-[440px] leading-relaxed">
                    A strike lands in 150 milliseconds. Five frames at 30fps. Not a
                    wind-up, not a follow-through, the whole thing. The model
                    reads the full sequence at once, calls strike or neutral.
                    <span className="text-[#f59e0b] font-bold">
                      {" "}
                      That&apos;s the fight.
                    </span>
                  </p>
                </div>
              </SlamIn>
            </div>

            <SlamIn variant="clip-reveal" delay={0}>
              <div className="relative">
                {/* Judge scorecard */}
                <div className="border-[3px] border-[#f59e0b] bg-black p-5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#f59e0b]/40">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#dc2626] live-dot" />
                      <span className="text-[10px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                        Judge&apos;s Scorecard
                      </span>
                    </div>
                    <span className="text-[9px] font-mono tracking-[2px] text-white/60">
                      WIN 15 · ROUND 02
                    </span>
                  </div>

                  {/* 5 frames */}
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="animate-frame-pop aspect-square border-2 border-[#f59e0b]/70 bg-[#0a0000] flex items-center justify-center relative overflow-hidden"
                        style={{ animationDelay: `${400 + i * 120}ms` }}
                      >
                        {/* Progress bar */}
                        <div
                          className="absolute bottom-0 left-0 h-[3px] bg-[#dc2626] animate-bar-fill"
                          style={{
                            width: `${20 * (i + 1)}%`,
                            animationDelay: `${600 + i * 120}ms`,
                          }}
                        />
                        <span className="text-[14px] font-black text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                          F{i + 1}
                        </span>
                        <span className="absolute top-1 right-1 text-[7px] font-mono text-white/60">
                          {String(i * 33).padStart(3, "0")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bracket */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-2 border-t-2 border-l-2 border-[#f59e0b]" />
                    <span className="text-[8px] font-black tracking-[3px] uppercase text-[#f59e0b] whitespace-nowrap font-[family-name:var(--font-oswald)]">
                      1 Window · 1 Prediction
                    </span>
                    <div className="flex-1 h-2 border-t-2 border-r-2 border-[#f59e0b]" />
                  </div>

                  {/* Verdict */}
                  <div className="mt-5 pt-4 border-t-2 border-[#f59e0b]/40 flex items-end justify-between">
                    <div>
                      <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60">
                        Confidence
                      </div>
                      <div className="text-[44px] font-black text-[#f59e0b] font-mono tabular-nums leading-none">
                        <CountUp target={0.847} decimals={3} duration={1800} />
                      </div>
                    </div>
                    <div className="text-right">
                      <SlamIn variant="stamp" delay={1200}>
                        <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60">
                          Verdict
                        </div>
                        <div className="text-[24px] font-black tracking-[3px] text-[#dc2626] font-[family-name:var(--font-oswald)] drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                          STRIKE
                        </div>
                      </SlamIn>
                    </div>
                  </div>
                </div>
              </div>
            </SlamIn>
          </div>

          {/* Bottom divider */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-12 h-[2px] bg-[#dc2626]" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
            <div className="w-12 h-[2px] bg-[#dc2626]" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FILM ROOM — scroll-driven clip switching (3 clips × 1vh each)   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <ScrollFilmRoom />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* REPLAY — Scroll-draw confidence curve                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="sticky top-0 z-10 min-h-screen -mt-[100vh] bg-[#0a0000] flex items-center overflow-hidden px-5">
        <div className="max-w-[980px] mx-auto w-full relative border-2 border-white/10 p-6 sm:p-10">
          {/* Corner marks */}
          <div className="absolute -top-px -left-px w-6 h-6 border-l-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -top-px -right-px w-6 h-6 border-r-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -left-px w-6 h-6 border-l-[3px] border-b-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -right-px w-6 h-6 border-r-[3px] border-b-[3px] border-[#f59e0b]" />

          {/* Fight card header */}
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-3">
              <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
                ● Replay · Bout 04 ●
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-[2px] bg-[#dc2626]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
                <div className="w-12 h-[2px] bg-[#dc2626]" />
              </div>
            </div>
          </SlamIn>

          <SlamIn variant="slam" delay={150}>
            <h2 className="text-center text-[44px] sm:text-[64px] font-black tracking-[2px] uppercase leading-[0.95] text-white font-[family-name:var(--font-anton)] mb-2">
              Every 5 Frames.
              <br />
              <span className="text-[#dc2626] drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                One Confidence Score.
              </span>
            </h2>
          </SlamIn>

          {/* Confidence curve */}
          <SlamIn variant="clip-reveal" delay={300}>
            <div className="mt-8">
              {/* Chart area */}
              <div className="relative">
                {/* Y-axis labels */}
                <div className="absolute -left-1 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-white/50 -translate-x-full pr-2">
                  <span>1.0</span>
                  <span>0.5</span>
                  <span>0.0</span>
                </div>

                <svg viewBox="0 0 100 40" className="w-full h-40 sm:h-48">
                  <defs>
                    <linearGradient id="replay-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Threshold line at 0.5 */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#dc2626" strokeWidth="0.3" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                  {/* Fill */}
                  <polygon
                    points="0,40 0,33 5,30 10,26 15,23 20,17 25,12 30,6 33,3 36,1 40,5 44,12 48,20 52,16 56,10 60,4 64,9 68,17 72,26 76,33 80,36 84,38 88,39 92,37 96,36 100,35 100,40"
                    fill="url(#replay-grad)"
                  />
                  {/* Line */}
                  <polyline
                    className="scroll-draw-path"
                    points="0,33 5,30 10,26 15,23 20,17 25,12 30,6 33,3 36,1 40,5 44,12 48,20 52,16 56,10 60,4 64,9 68,17 72,26 76,33 80,36 84,38 88,39 92,37 96,36 100,35"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Peak dots */}
                  <circle cx="36" cy="1" r="0.8" fill="#dc2626" />
                  <circle cx="60" cy="4" r="0.8" fill="#dc2626" />
                </svg>
              </div>

              {/* Stats row */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-6">
                <div>
                  <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60 mb-1">Peak</div>
                  <div className="text-[24px] font-black text-[#f59e0b] font-[family-name:var(--font-anton)] leading-none">
                    <CountUp target={0.947} decimals={3} duration={1800} />
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60 mb-1">Threshold</div>
                  <div className="text-[24px] font-black text-white/70 font-[family-name:var(--font-anton)] leading-none">
                    <CountUp target={0.500} decimals={3} duration={1400} />
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60 mb-1">Strikes</div>
                  <div className="text-[24px] font-black text-[#dc2626] font-[family-name:var(--font-anton)] leading-none">
                    <CountUp target={7} duration={1200} />
                    <span className="text-[14px] text-white/50"> / 38</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-mono tracking-[2px] uppercase text-white/60 mb-1">Decision</div>
                  <div className="text-[24px] font-black text-[#dc2626] font-[family-name:var(--font-anton)] leading-none">
                    KO · R2
                  </div>
                </div>
              </div>
            </div>
          </SlamIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* STEP INTO THE OCTAGON — Upload                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="sticky top-0 z-10 min-h-screen mt-[30vh] bg-black flex items-center overflow-hidden relative px-5">
        <div className="max-w-[900px] mx-auto w-full relative border-2 border-white/10 p-6 sm:p-10">
          {/* Corner marks */}
          <div className="absolute -top-px -left-px w-6 h-6 border-l-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -top-px -right-px w-6 h-6 border-r-[3px] border-t-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -left-px w-6 h-6 border-l-[3px] border-b-[3px] border-[#f59e0b]" />
          <div className="absolute -bottom-px -right-px w-6 h-6 border-r-[3px] border-b-[3px] border-[#f59e0b]" />

          {/* Fight card header */}
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-3">
              <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
                ● Your Turn · Bout 05 ●
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-[2px] bg-[#dc2626]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
                <div className="w-12 h-[2px] bg-[#dc2626]" />
              </div>
            </div>
          </SlamIn>
          <SlamIn variant="slam" delay={150}>
            <h2 className="text-center text-[48px] sm:text-[72px] font-black tracking-[2px] uppercase leading-[0.95] text-white font-[family-name:var(--font-anton)] mb-4">
              Book the fight.
              <br />
              <span className="text-[#dc2626] drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                Drop the tape.
              </span>
            </h2>
          </SlamIn>
          <SlamIn variant="sweep" delay={300}>
            <p className="text-center text-[14px] text-white/60 max-w-[520px] mx-auto leading-relaxed mb-12">
              Upload a short MMA clip. The model calls strike or neutral,
              window by window, in real time. Max 3 seconds.
            </p>
          </SlamIn>

          <SlamIn variant="clip-reveal" delay={450}>
            <FCUpload />
          </SlamIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* END OF CARD — Footer                                            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <footer id="footer" className="relative z-10 border-t-[3px] border-[#dc2626] bg-[#0a0000] overflow-hidden mt-[30vh]">
        {/* Diagonal banner */}
        <div className="absolute -top-6 inset-x-0 h-10 bg-[#dc2626] skew-y-[-2deg]" />

        <div className="max-w-[1100px] mx-auto px-5 pt-20 pb-10 relative">
          {/* Decision card */}
          <SlamIn variant="stamp" delay={0}>
            <div className="text-center mb-10">
              <div className="inline-block border-[3px] border-[#f59e0b] bg-black px-10 py-6 relative">
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#f59e0b]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f59e0b]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#f59e0b]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#f59e0b]" />
                <div className="text-[8px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-1 font-[family-name:var(--font-oswald)]">
                  ● Official Decision ●
                </div>
                <div className="text-[32px] sm:text-[44px] font-black tracking-[4px] uppercase text-white font-[family-name:var(--font-anton)] leading-none">
                  STR<span className="text-[#dc2626]">1</span>KE
                </div>
                <div className="text-[9px] font-black tracking-[4px] uppercase text-white/60 mt-1 font-[family-name:var(--font-oswald)]">
                  by Thomas Ou
                </div>
              </div>
            </div>
          </SlamIn>

          {/* Socials as corners */}
          <nav aria-label="Social links" className="flex items-center justify-center gap-10 mb-10">
            {socialLinks.map((link, i) => (
              <SlamIn key={link.name} variant="sweep" delay={i * 100}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-black tracking-[3px] uppercase text-white/60 hover:text-[#f59e0b] transition-colors font-[family-name:var(--font-oswald)]"
                >
                  ▸ {link.name}
                </a>
              </SlamIn>
            ))}
          </nav>

          {/* Sanction bar */}
          <div className="border-t border-[#dc2626]/40 pt-5 flex items-center justify-between text-[9px] font-mono tracking-[2px] uppercase">
            <span className="text-white/60">MMXXV · Independent</span>
            <span className="text-[#f59e0b]">End Of Card</span>
            <span className="text-white/60">Thomas Ou · 2025</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
