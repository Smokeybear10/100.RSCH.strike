import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

function Bracket({ className = "" }: { className?: string }) {
  return (
    <>
      <span className={`absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00d9ff] ${className}`} />
      <span className={`absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00d9ff] ${className}`} />
      <span className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00d9ff] ${className}`} />
      <span className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00d9ff] ${className}`} />
    </>
  );
}

export default function VariantG() {
  return (
    <div className="min-h-screen bg-[#000814] text-[#00d9ff] font-[family-name:var(--font-space-mono)] relative overflow-hidden">
      <VariantNav tone="dark" />

      {/* Animated scanning line */}
      <div
        className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d9ff] to-transparent pointer-events-none z-[60] opacity-40"
        style={{
          top: 0,
          animation: "scanDown 8s linear infinite",
        }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#00d9ff 1px, transparent 1px), linear-gradient(90deg, #00d9ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top system bar */}
      <div className="sticky top-0 z-50 bg-[#000814]/90 backdrop-blur-sm border-b border-[#00d9ff]/20">
        <div className="flex items-center justify-between px-5 py-2 text-[9px] tracking-[3px] uppercase">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff7f] animate-pulse" />
              <span className="text-[#00ff7f]">SYS · ONLINE</span>
            </span>
            <span className="text-[#00d9ff]/60">STR1KE.v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#00d9ff]/60">LAT: 37.7749</span>
            <span className="text-[#00d9ff]/60">LON: -122.4194</span>
            <span className="text-[#ff6b00]">◈ TRACKING</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative px-5 py-12">
        <div className="max-w-[1100px] mx-auto">
          {/* System ID */}
          <div className="flex items-center justify-between mb-6 text-[9px] tracking-[3px] uppercase">
            <span className="text-[#00d9ff]/60">
              [ TARGET ACQUISITION PROTOCOL ]
            </span>
            <span className="text-[#00d9ff]/60">
              SESSION 0xA3F4D21 · UPTIME 0:03:47
            </span>
          </div>

          {/* Title with HUD chrome */}
          <div className="relative border border-[#00d9ff]/30 p-12 mb-10">
            <Bracket />
            <div className="text-center">
              <div className="text-[9px] tracking-[6px] uppercase text-[#00d9ff]/60 mb-4">
                ◂ Classifier · Active ▸
              </div>
              <h1 className="text-[72px] sm:text-[120px] font-bold tracking-[8px] leading-none text-[#00d9ff] font-[family-name:var(--font-orbitron)]"
                style={{ textShadow: "0 0 20px rgba(0, 217, 255, 0.4)" }}
              >
                STR<span className="text-[#00ff7f]">1</span>KE
              </h1>
              <div className="text-[10px] tracking-[4px] uppercase text-[#00d9ff]/60 mt-3">
                Human Motion · Action Recognition · Real-Time
              </div>
            </div>
          </div>

          {/* Player with HUD chrome */}
          <div className="relative">
            {/* Top data bar */}
            <div className="flex items-center justify-between mb-2 text-[9px] tracking-[2px] uppercase">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff7f] animate-pulse" />
                <span className="text-[#00ff7f]">FEED ACTIVE</span>
              </span>
              <span className="text-[#00d9ff]/60">
                CH.1 · BROADCAST · 1920×1080
              </span>
              <span className="text-[#ff6b00]">◈ LOCKED</span>
            </div>

            <div className="relative border border-[#00d9ff]/30 p-3 bg-black/40">
              <Bracket />
              <HeroPlayer clips={demoClips} />
            </div>

            {/* Bottom data row */}
            <div className="grid grid-cols-4 gap-px mt-2 bg-[#00d9ff]/20">
              {[
                { k: "TARGETS", v: "2", c: "#00d9ff" },
                { k: "WINDOW", v: "5 / 38", c: "#00d9ff" },
                { k: "CONFIDENCE", v: "0.847", c: "#00ff7f" },
                { k: "CLASS", v: "STRIKE", c: "#ff6b00" },
              ].map((d) => (
                <div
                  key={d.k}
                  className="bg-[#000814] px-4 py-2.5"
                >
                  <div className="text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60">
                    {d.k}
                  </div>
                  <div
                    className="text-[16px] font-bold tabular-nums font-[family-name:var(--font-orbitron)]"
                    style={{ color: d.c }}
                  >
                    {d.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 38 — Holographic counter */}
      <section className="relative py-32 px-5">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="text-[9px] tracking-[4px] uppercase text-[#00d9ff]/60 mb-6">
            [ TRAINING SET LOADED ]
          </div>

          {/* Giant 38 with orbit rings */}
          <div className="relative inline-block mb-8">
            {/* Orbital rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[320px] h-[320px] rounded-full border border-[#00d9ff]/20" />
              <div
                className="absolute w-[260px] h-[260px] rounded-full border border-[#00d9ff]/30 border-dashed"
                style={{ animation: "spin 30s linear infinite" }}
              />
              <div
                className="absolute w-[380px] h-[380px] rounded-full border border-[#00d9ff]/10"
              />
            </div>

            <div
              className="relative text-[200px] sm:text-[280px] font-bold leading-none text-[#00d9ff] tabular-nums font-[family-name:var(--font-orbitron)] px-20"
              style={{ textShadow: "0 0 40px rgba(0, 217, 255, 0.5)" }}
            >
              038
            </div>
          </div>

          <div className="relative z-10">
            <div className="text-[11px] tracking-[4px] uppercase text-[#00ff7f] mb-6">
              TRAINING.SAMPLES.LOADED = 038 / 038
            </div>

            {/* Progress bars */}
            <div className="max-w-[480px] mx-auto space-y-3 mb-10">
              <div>
                <div className="flex items-center justify-between text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60 mb-1">
                  <span>KINETICS-400.PRETRAIN</span>
                  <span className="text-[#00d9ff]">400,000 / 400,000</span>
                </div>
                <div className="h-1 bg-[#00d9ff]/10 rounded-sm">
                  <div className="h-full bg-[#00d9ff] rounded-sm" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60 mb-1">
                  <span>STR1KE.FINETUNE</span>
                  <span className="text-[#00ff7f]">038 / 038</span>
                </div>
                <div className="h-1 bg-[#00d9ff]/10 rounded-sm">
                  <div className="h-full bg-[#00ff7f] rounded-sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-[9px] tracking-[3px] uppercase">
              <span>
                <span className="text-[#ff6b00]">STRIKE:</span>
                <span className="text-[#00d9ff] ml-2 tabular-nums">019</span>
              </span>
              <span className="text-[#00d9ff]/30">|</span>
              <span>
                <span className="text-[#00d9ff]/60">NEUTRAL:</span>
                <span className="text-[#00d9ff] ml-2 tabular-nums">019</span>
              </span>
              <span className="text-[#00d9ff]/30">|</span>
              <span>
                <span className="text-[#00d9ff]/60">FRAMES:</span>
                <span className="text-[#00d9ff] ml-2 tabular-nums">190</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline — Mission Phases */}
      <section className="py-28 px-5 border-t border-[#00d9ff]/20">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[9px] tracking-[4px] uppercase text-[#00d9ff]/60 mb-2">
              [ PIPELINE · 3 PHASES ]
            </div>
            <h2 className="text-[40px] sm:text-[56px] font-bold tracking-[3px] uppercase leading-none text-[#00d9ff] font-[family-name:var(--font-orbitron)]"
              style={{ textShadow: "0 0 20px rgba(0, 217, 255, 0.3)" }}
            >
              Target → Signal
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                phase: "01",
                code: "ISOLATE",
                tool: "SAM2.SEGMENT",
                desc: "Strip broadcast chrome. Crowd, cage, overlays discarded. Only fighter pixels survive.",
              },
              {
                phase: "02",
                code: "CATALOG",
                tool: "LABELSTUDIO.ANNOTATE",
                desc: "38 hand-classified moments. 19 strike signatures, 19 neutral baselines. Weekend acquired.",
              },
              {
                phase: "03",
                code: "IDENTIFY",
                tool: "TSN.CLASSIFY",
                desc: "Kinetics-400 backbone. Per-window inference. Binary output, confidence 0-1.",
              },
            ].map((p) => (
              <div
                key={p.phase}
                className="relative border border-[#00d9ff]/30 bg-black/30 p-6 grid grid-cols-[80px_1fr_200px] gap-6 items-center"
              >
                <Bracket />
                <div>
                  <div className="text-[9px] tracking-[3px] uppercase text-[#00d9ff]/60">
                    PHASE
                  </div>
                  <div
                    className="text-[40px] font-bold tabular-nums leading-none text-[#00d9ff] font-[family-name:var(--font-orbitron)]"
                    style={{ textShadow: "0 0 15px rgba(0, 217, 255, 0.4)" }}
                  >
                    {p.phase}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[18px] font-bold tracking-[3px] uppercase text-[#00d9ff] font-[family-name:var(--font-orbitron)]">
                      {p.code}
                    </span>
                    <span className="text-[9px] tracking-[2px] uppercase text-[#00ff7f]/80">
                      // {p.tool}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#00d9ff]/70 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60 mb-1">
                    Status
                  </div>
                  <div className="text-[11px] tracking-[2px] uppercase text-[#00ff7f] font-bold">
                    ◈ COMPLETE
                  </div>
                  <div className="text-[8px] tracking-[2px] text-[#00d9ff]/40 mt-1 font-mono">
                    0x{Math.floor(Math.random() * 1000000).toString(16).toUpperCase().padStart(6, "0")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 150ms — Temporal Window */}
      <section className="py-28 px-5 border-t border-[#00d9ff]/20">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[9px] tracking-[4px] uppercase text-[#00d9ff]/60 mb-4">
                [ TEMPORAL WINDOW · ANALYSIS ]
              </div>
              <div
                className="text-[72px] sm:text-[120px] font-bold leading-[0.9] text-[#00d9ff] font-[family-name:var(--font-orbitron)] tabular-nums"
                style={{ textShadow: "0 0 20px rgba(0, 217, 255, 0.4)" }}
              >
                150<span className="text-[#00ff7f]">MS</span>
              </div>
              <div className="text-[18px] tracking-[3px] uppercase text-[#ff6b00] mt-2 font-[family-name:var(--font-orbitron)] font-bold">
                5 FRAMES · 1 DECISION
              </div>
              <p className="text-[12px] text-[#00d9ff]/70 mt-5 max-w-[400px] leading-relaxed">
                Strike signatures span multiple frames. Single frames are
                ambiguous. Model integrates 5 consecutive frames to resolve
                intent vs. contact.
              </p>
            </div>

            <div className="relative border border-[#00d9ff]/30 p-5 bg-black/30">
              <Bracket />
              <div className="text-[9px] tracking-[3px] uppercase text-[#00d9ff]/60 mb-3 flex items-center justify-between">
                <span>◈ FRAME BUFFER</span>
                <span className="text-[#00ff7f]">LOCKED</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square border border-[#00d9ff]/40 bg-[#000814] relative flex items-center justify-center"
                  >
                    <div className="absolute inset-1 border border-[#00d9ff]/20" />
                    <span className="text-[11px] font-bold text-[#00d9ff] tabular-nums font-[family-name:var(--font-orbitron)]">
                      F{i + 1}
                    </span>
                    <div
                      className="absolute bottom-1 left-1 right-1 h-px bg-[#00ff7f]"
                      style={{ opacity: 0.4 + i * 0.15 }}
                    />
                  </div>
                ))}
              </div>
              {/* Signal bar */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60">SIG</span>
                <div className="flex-1 h-1 bg-[#00d9ff]/10">
                  <div className="h-full bg-gradient-to-r from-[#00d9ff] via-[#00ff7f] to-[#ff6b00]" style={{ width: "84.7%" }} />
                </div>
                <span className="text-[9px] tabular-nums text-[#00ff7f] font-bold">0.847</span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#00d9ff]/20 flex items-center justify-between">
                <div>
                  <div className="text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60">
                    CLASSIFICATION
                  </div>
                  <div className="text-[18px] font-bold tracking-[3px] uppercase text-[#ff6b00] font-[family-name:var(--font-orbitron)]">
                    STRIKE
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] tracking-[2px] uppercase text-[#00d9ff]/60">
                    THRESHOLD
                  </div>
                  <div className="text-[18px] font-bold tabular-nums text-[#00d9ff] font-[family-name:var(--font-orbitron)]">
                    ≥0.500
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Callback — Radar signal */}
      <section className="py-28 px-5 border-t border-[#00d9ff]/20">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="text-[9px] tracking-[4px] uppercase text-[#00d9ff]/60 mb-4">
            [ SIGNAL TRACE · FULL CLIP ]
          </div>
          <h2
            className="text-[32px] sm:text-[44px] font-bold tracking-[3px] uppercase leading-[1.1] text-[#00d9ff] font-[family-name:var(--font-orbitron)]"
            style={{ textShadow: "0 0 20px rgba(0, 217, 255, 0.3)" }}
          >
            That line over the target?
            <br />
            <span className="text-[#00ff7f]">Per-window confidence.</span>
          </h2>

          <div className="mt-14 mx-auto max-w-[720px] relative border border-[#00d9ff]/30 bg-black/40 p-6">
            <Bracket />
            <div className="flex items-center justify-between mb-3 text-[8px] tracking-[2px] uppercase">
              <span className="text-[#00d9ff]/60">◈ TRACE · c(w_t)</span>
              <span className="text-[#00ff7f]">38 WINDOWS ACQUIRED</span>
            </div>
            <svg
              viewBox="0 0 100 30"
              className="w-full h-24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="hud-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff7f" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid ticks */}
              {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="30"
                  stroke="#00d9ff"
                  strokeWidth="0.1"
                  opacity="0.2"
                />
              ))}
              <polygon
                points="0,30 0,23 8,21 16,18 24,13 32,7 38,3 42,5 46,11 52,15 58,10 64,5 70,11 76,17 82,21 88,23 94,25 100,24 100,30"
                fill="url(#hud-grad)"
              />
              <polyline
                points="0,23 8,21 16,18 24,13 32,7 38,3 42,5 46,11 52,15 58,10 64,5 70,11 76,17 82,21 88,23 94,25 100,24"
                fill="none"
                stroke="#00ff7f"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="15"
                x2="100"
                y2="15"
                stroke="#ff6b00"
                strokeWidth="0.3"
                strokeDasharray="2,2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mt-2 flex items-center justify-between text-[8px] tracking-[2px] uppercase text-[#00d9ff]/50">
              <span>w_0</span>
              <span className="text-[#ff6b00]">THRESHOLD 0.500</span>
              <span>w_37</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 px-5 border-t border-[#00d9ff]/20 relative">
        <div className="max-w-[900px] mx-auto flex items-center justify-between text-[9px] tracking-[3px] uppercase">
          <span className="text-[#00d9ff]/60">
            STR1KE // BY T.OU // 2025
          </span>
          <span className="text-[#00d9ff]/60">
            VARIANT G · HUD TARGETING
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff7f] animate-pulse" />
            <span className="text-[#00ff7f]">END OF FEED</span>
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes scanDown {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
