import { HeroPlayer } from "@/components/hero-player";
import { FCCounter } from "@/components/fc-counter";
import { FCUpload } from "@/components/fc-upload";
import { SlamIn } from "@/components/slam-in";
import { CountUp } from "@/components/count-up";
import { demoClips } from "@/lib/demo-data";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/Smokeybear10" },
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "Website", href: "#" },
];

const tickerItems = [
  "N_STRIKES = 19",
  "N_NEUTRAL = 19",
  "WINDOW = 5 FRAMES",
  "FPS = 30",
  "DURATION = 150 MS",
  "BASELINE = KINETICS-400",
  "BACKBONE = TSN",
  "MASK = SAM2",
  "TRAINED IN < 60 S",
  "ONE WEEKEND · ONE BROADCAST",
];

export default function Home() {
  return (
    <main className="relative z-10 bg-black text-white font-[family-name:var(--font-barlow)] overflow-x-hidden">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BROADCAST CHROME — sticky top                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-black border-b-[3px] border-[#dc2626] shadow-[0_4px_20px_rgba(220,38,38,0.2)]">
        <div className="flex items-center justify-between px-5 py-2 bg-gradient-to-r from-[#dc2626] via-[#dc2626]/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white live-dot" />
              <span className="text-[10px] font-black tracking-[4px] uppercase text-white font-[family-name:var(--font-oswald)]">
                LIVE
              </span>
            </div>
            <span className="text-[9px] text-white/40 font-mono">●</span>
            <span className="text-[10px] font-black tracking-[3px] uppercase text-white/95 font-[family-name:var(--font-oswald)]">
              STR1KE Main Card
            </span>
            <span className="hidden sm:inline text-[9px] text-white/40 font-mono">
              ●
            </span>
            <span className="hidden sm:inline text-[9px] font-mono tracking-[2px] uppercase text-white/75">
              04 · 04 · 2025
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono tracking-[2px] text-white/85">
            TSN · KINETICS-400 · 38 SAMPLES
          </div>
        </div>
        {/* Ticker */}
        <div className="overflow-hidden bg-[#0a0000] border-t border-[#dc2626]/60">
          <div className="flex gap-10 py-1.5 text-[10px] font-mono tracking-[2px] uppercase text-[#f59e0b] whitespace-nowrap animate-ticker w-max">
            {Array.from({ length: 3 }).map((_, rep) => (
              <span key={rep} className="flex gap-10 shrink-0">
                {tickerItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-10 shrink-0">
                    <span>{item}</span>
                    <span className="text-white/30">//</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO — MAIN EVENT title card                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative px-5 pt-8 pb-10 overflow-hidden">
        {/* Pre-fight intro */}
        <div className="fade-up text-center mb-4">
          <div className="inline-flex items-center gap-3 text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
            <span className="w-8 h-px bg-[#f59e0b]" />
            <span>Tonight · Pay-Per-View</span>
            <span className="w-8 h-px bg-[#f59e0b]" />
          </div>
        </div>

        {/* Title card */}
        <div className="fade-up fade-up-delay-1 relative flex items-center justify-center mb-4">
          {/* Diagonal belt-reveal slash — dark red so the bright red "1" pops */}
          <div className="absolute inset-x-0 h-[200px] bg-gradient-to-r from-transparent via-[#7f1d1d]/50 to-transparent skew-y-[-3deg] blur-md" />
          <div className="absolute inset-x-0 h-[140px] bg-gradient-to-r from-transparent via-[#450a0a] to-transparent skew-y-[-3deg]" />

          <div className="relative text-center">
            <div className="text-[9px] font-black tracking-[8px] uppercase text-[#f59e0b] mb-2 font-[family-name:var(--font-oswald)]">
              ⟨ Main Event ⟩
            </div>
            <h1 className="text-[88px] sm:text-[160px] font-black tracking-[4px] leading-[0.85] text-white font-[family-name:var(--font-anton)]">
              STR
              <span
                className="text-[#dc2626]"
                style={{
                  textShadow:
                    "0 0 24px rgba(220,38,38,1), 0 0 48px rgba(220,38,38,0.6)",
                }}
              >
                1
              </span>
              KE
            </h1>
            <div className="text-[11px] font-black tracking-[6px] uppercase text-white/70 mt-1 font-[family-name:var(--font-oswald)]">
              VS · A Weekend Of Footage
            </div>
          </div>
        </div>

        {/* Venue bar */}
        <div className="fade-up fade-up-delay-1 max-w-[820px] mx-auto mb-5 flex items-center justify-between text-[9px] font-black tracking-[4px] uppercase text-white/60 font-[family-name:var(--font-oswald)] border-t border-b border-white/10 py-2">
          <span>● T-Mobile Arena</span>
          <span className="hidden sm:inline">Las Vegas · NV</span>
          <span>38 Windows · 190 Frames</span>
        </div>

        {/* Tale of the Tape */}
        <div className="fade-up fade-up-delay-2 max-w-[820px] mx-auto mb-6">
          <div className="text-center mb-2 text-[9px] font-black tracking-[4px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
            ▸ Tale Of The Tape ▸
          </div>
          <div className="grid grid-cols-4 gap-px bg-[#dc2626] p-px">
            {[
              { label: "Model", val: "TSN", sub: "Backbone" },
              { label: "Pretrain", val: "400K", sub: "Kinetics clips" },
              { label: "Fine-tune", val: "38", sub: "Hand-labeled" },
              { label: "Window", val: "150ms", sub: "5 frames" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`bg-black px-3 py-2 text-center ${
                  i === 2 ? "ring-2 ring-[#f59e0b] ring-inset" : ""
                }`}
              >
                <div className="text-[8px] font-mono tracking-[2px] uppercase text-[#f59e0b]">
                  {s.label}
                </div>
                <div className="text-[20px] sm:text-[24px] font-black tracking-wide text-white font-[family-name:var(--font-oswald)] leading-none mt-1">
                  {s.val}
                </div>
                <div className="text-[7px] font-mono tracking-[1px] uppercase text-white/50 mt-0.5">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player with broadcast frame */}
        <div className="fade-up fade-up-delay-3 max-w-[920px] mx-auto">
          <div className="relative border-[3px] border-[#dc2626] bg-black p-2">
            {/* Feed label */}
            <div className="absolute -top-2.5 left-4 bg-black px-2 text-[9px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              ● Main Feed · Cam 01
            </div>
            {/* Corner brackets */}
            <div className="absolute top-1 left-1 w-5 h-5 border-l-2 border-t-2 border-[#f59e0b]" />
            <div className="absolute top-1 right-1 w-5 h-5 border-r-2 border-t-2 border-[#f59e0b]" />
            <div className="absolute bottom-1 left-1 w-5 h-5 border-l-2 border-b-2 border-[#f59e0b]" />
            <div className="absolute bottom-1 right-1 w-5 h-5 border-r-2 border-b-2 border-[#f59e0b]" />
            <HeroPlayer clips={demoClips} />
          </div>
          {/* Scorecard strip below player */}
          <div className="mt-2 flex items-center justify-between text-[9px] font-mono tracking-[2px] uppercase text-white/50 px-2">
            <span>Scrub · Playlist · 3 Clips</span>
            <span className="text-[#f59e0b]">Confidence Overlay · Live</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="fade-up fade-up-delay-4 mt-10 text-center">
          <div className="inline-flex flex-col items-center gap-1 opacity-50">
            <span className="text-[9px] text-[#f59e0b] font-black tracking-[4px] uppercase font-[family-name:var(--font-oswald)]">
              Scroll · Fight Starts Below
            </span>
            <svg
              width="12"
              height="16"
              viewBox="0 0 12 16"
              fill="none"
              className="text-[#f59e0b] animate-bounce"
              style={{ animationDuration: "1.8s" }}
            >
              <path d="M6 1v14M1 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </section>

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
      {/* WEIGH-IN — 38 scoreboard                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-5 overflow-hidden">
        <FCCounter />
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* COMMENTARY BREAK                                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t-2 border-b-2 border-[#dc2626]/60 bg-[#0a0000] py-5 overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-5 flex items-center gap-4">
          <SlamIn variant="sweep" delay={0}>
            <div className="shrink-0 bg-[#dc2626] px-3 py-1 text-[9px] font-black tracking-[3px] uppercase text-white font-[family-name:var(--font-oswald)]">
              ● Corner Cam
            </div>
          </SlamIn>
          <SlamIn variant="sweep-right" delay={150} className="flex-1">
            <p className="text-[13px] sm:text-[14px] text-white/80 italic font-[family-name:var(--font-barlow)] tracking-wide">
              &ldquo;Thirty-eight windows. Most people would say that&apos;s not a
              dataset, that&apos;s a rounding error. But with the right
              backbone...&rdquo;
            </p>
          </SlamIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* THREE ROUNDS — Pipeline with slam-in numerals                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-5 relative">
        <div className="max-w-[1100px] mx-auto">
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-3 text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                <span className="w-8 h-px bg-[#f59e0b]" />
                <span>⟨ The Pipeline ⟩</span>
                <span className="w-8 h-px bg-[#f59e0b]" />
              </div>
            </div>
          </SlamIn>
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
            <div className="text-center mb-16 text-[11px] font-black tracking-[4px] uppercase text-white/50 font-[family-name:var(--font-oswald)]">
              ▸ Broadcast → Fighter Isolation → Per-Window Call ▸
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
                  {/* Bell icon */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-[12px] font-black bell-pulse">
                    ●
                  </div>
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 150MS — scroll-linked giant number + frame-pop cards            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-5 relative">
        {/* Diagonal red slash background */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[280px] bg-gradient-to-r from-transparent via-[#dc2626]/8 to-transparent skew-y-[-2deg] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative">
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-12 text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              ⟨ The Call ⟩
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
                        <span className="absolute top-1 right-1 text-[7px] font-mono text-white/40">
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* REPLAY — Scroll-draw confidence curve                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-5">
        <div className="max-w-[980px] mx-auto">
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-3 text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              ⟨ Replay ⟩
            </div>
          </SlamIn>
          <SlamIn variant="slam" delay={150}>
            <h2 className="text-center text-[44px] sm:text-[64px] font-black tracking-[2px] uppercase leading-[1.05] text-white font-[family-name:var(--font-anton)]">
              The line above the player?
              <br />
              <span className="text-[#dc2626] drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                That&apos;s this. Every 5 frames.
              </span>
            </h2>
          </SlamIn>

          <SlamIn variant="clip-reveal" delay={300}>
            <div className="mt-14 border-[3px] border-[#dc2626] bg-[#0a0000] p-6 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
              {/* Scorecard header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#dc2626]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] live-dot" />
                  <span className="text-[10px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
                    Round-By-Round Scorecard
                  </span>
                </div>
                <span className="text-[9px] font-mono tracking-[2px] text-white/60">
                  38 WINDOWS · 190 FRAMES
                </span>
              </div>

              <svg
                viewBox="0 0 100 32"
                className="w-full h-32"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="fc-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid */}
                <line x1="0" y1="8" x2="100" y2="8" stroke="#dc2626" strokeWidth="0.15" strokeDasharray="1,2" vectorEffect="non-scaling-stroke" opacity="0.3" />
                <line x1="0" y1="16" x2="100" y2="16" stroke="#dc2626" strokeWidth="0.4" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="24" x2="100" y2="24" stroke="#dc2626" strokeWidth="0.15" strokeDasharray="1,2" vectorEffect="non-scaling-stroke" opacity="0.3" />
                <polygon
                  points="0,32 0,26 5,24 10,21 15,18 20,14 25,10 30,5 33,2 36,1 40,4 44,10 48,16 52,13 56,8 60,3 64,7 68,14 72,21 76,26 80,29 84,30 88,31 92,30 96,29 100,28 100,32"
                  fill="url(#fc-grad)"
                />
                <polyline
                  className="scroll-draw-path"
                  points="0,26 5,24 10,21 15,18 20,14 25,10 30,5 33,2 36,1 40,4 44,10 48,16 52,13 56,8 60,3 64,7 68,14 72,21 76,26 80,29 84,30 88,31 92,30 96,29 100,28"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.9"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Peak markers */}
                <circle cx="36" cy="1" r="0.8" fill="#dc2626" vectorEffect="non-scaling-stroke" className="animate-dot-pop" style={{ animationDelay: "1200ms" }} />
                <circle cx="60" cy="3" r="0.8" fill="#dc2626" vectorEffect="non-scaling-stroke" className="animate-dot-pop" style={{ animationDelay: "1500ms" }} />
              </svg>

              {/* Axis + stats */}
              <div className="mt-3 pt-3 border-t border-[#dc2626]/40 grid grid-cols-4 gap-4 text-[9px] font-mono tracking-[2px] uppercase">
                <div>
                  <div className="text-white/50 text-[8px]">Peak</div>
                  <div className="font-black text-[#f59e0b] text-[20px] font-[family-name:var(--font-oswald)] leading-none mt-0.5">
                    <CountUp target={0.947} decimals={3} duration={1800} />
                  </div>
                </div>
                <div>
                  <div className="text-white/50 text-[8px]">Threshold</div>
                  <div className="font-black text-white text-[20px] font-[family-name:var(--font-oswald)] leading-none mt-0.5">
                    <CountUp target={0.5} decimals={3} duration={1400} />
                  </div>
                </div>
                <div>
                  <div className="text-white/50 text-[8px]">Hits</div>
                  <div className="font-black text-[#dc2626] text-[20px] font-[family-name:var(--font-oswald)] leading-none mt-0.5">
                    <CountUp target={7} duration={1200} /> / 38
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-[8px]">Decision</div>
                  <div className="font-black text-[#dc2626] text-[20px] font-[family-name:var(--font-oswald)] leading-none mt-0.5">
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
      <section className="py-32 px-5 relative">
        <div className="max-w-[900px] mx-auto">
          <SlamIn variant="sweep" delay={0}>
            <div className="text-center mb-3 text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              ⟨ Your Turn ⟩
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
      <footer className="border-t-[3px] border-[#dc2626] bg-[#0a0000] relative overflow-hidden">
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
          <div className="flex items-center justify-center gap-10 mb-10">
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
          </div>

          {/* Sanction bar */}
          <div className="border-t border-[#dc2626]/40 pt-5 flex items-center justify-between text-[9px] font-mono tracking-[2px] uppercase">
            <span className="text-white/40">MMXXV · Independent</span>
            <span className="text-[#f59e0b]">End Of Card</span>
            <span className="text-white/40">Thomas Ou · 2025</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
