import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantH() {
  return (
    <div className="min-h-screen bg-[#f4f1e8] text-[#1a2332] font-[family-name:var(--font-eb-garamond)]">
      <VariantNav tone="light" />

      {/* Classification header */}
      <div className="border-b-2 border-[#9b1c1c] bg-[#f4f1e8]">
        <div className="max-w-[900px] mx-auto px-6 py-2 flex items-center justify-between text-[10px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase">
          <span className="text-[#9b1c1c] font-bold">· Pre-Fight Intel ·</span>
          <span className="text-[#1a2332]/60">File No. STR1KE-2025.04 / Page 01 of 08</span>
          <span className="text-[#1a2332]/60">Distribution: Internal</span>
        </div>
      </div>

      <article className="max-w-[820px] mx-auto px-8 py-16 relative">
        {/* Red stamp */}
        <div className="absolute top-8 right-8 border-[3px] border-[#9b1c1c] px-4 py-2 rotate-[-8deg] text-[#9b1c1c] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[14px]">
          Confidential
          <div className="text-[9px] tracking-[1px] text-center mt-0.5">For Film Review Only</div>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[4px] uppercase text-[#1a2332]/50 mb-3">
            Scouting Department · Film Breakdown
          </div>
          <h1 className="text-[56px] font-[family-name:var(--font-oswald)] font-bold leading-[0.95] text-[#1a2332] tracking-tight uppercase">
            Strike Detection
            <br />
            Methodology Report
          </h1>
          <div className="mt-4 text-[14px] text-[#1a2332]/70 italic">
            A study of temporal action recognition in MMA broadcast footage
            <br />
            using 38 hand-labeled training windows.
          </div>
          <div className="mt-6 flex items-center gap-4 text-[11px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#1a2332]/60 border-t border-[#1a2332]/20 pt-4">
            <span>Analyst: T. Ou</span>
            <span>·</span>
            <span>Date: 04 · 04 · 2025</span>
            <span>·</span>
            <span>Duration: One Weekend</span>
          </div>
        </header>

        {/* Target Profile card */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8">
          <div>
            <h2 className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#9b1c1c] border-b-2 border-[#9b1c1c] pb-2 mb-4">
              § 1 · Target Profile
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#1a2332]/90 text-justify">
              Subject: a binary action classifier trained to distinguish a
              strike landing from neutral stillness in live MMA broadcast
              footage. Input is a sequence of five consecutive RGB frames at
              30 frames per second, or approximately 150 milliseconds of
              motion. Output is a single confidence score in the range zero
              to one. The decision threshold is fixed at 0.5 for binary
              call-outs.
            </p>
          </div>

          {/* Scout card sidebar */}
          <aside className="border-2 border-[#1a2332] bg-white p-4">
            <div className="text-[9px] font-[family-name:var(--font-oswald)] font-bold tracking-[2px] uppercase text-[#9b1c1c] border-b border-[#1a2332] pb-2 mb-3">
              Scout Card
            </div>
            <dl className="text-[11px] font-[family-name:var(--font-oswald)] tracking-wide space-y-2">
              {[
                ["Class", "Binary"],
                ["Input", "5 × RGB"],
                ["Rate", "30 fps"],
                ["Window", "~150 ms"],
                ["Threshold", "0.5"],
                ["Backbone", "TSN"],
                ["Pretrain", "Kinetics-400"],
                ["Fine-tune", "38 windows"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-dashed border-[#1a2332]/20 pb-1.5">
                  <dt className="uppercase text-[#1a2332]/60">{k}</dt>
                  <dd className="font-bold text-[#1a2332] uppercase">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </section>

        {/* Film review — the player */}
        <section className="mb-12">
          <h2 className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#9b1c1c] border-b-2 border-[#9b1c1c] pb-2 mb-4">
            § 2 · Film Review
          </h2>
          <div className="relative border-2 border-[#1a2332] bg-white p-2">
            {/* Reel tag */}
            <div className="absolute -top-3 left-4 bg-[#f4f1e8] px-2 text-[9px] font-[family-name:var(--font-oswald)] font-bold tracking-[2px] uppercase text-[#9b1c1c]">
              Reel 01 · Three Clips
            </div>
            <HeroPlayer clips={demoClips} />
          </div>
          <div className="mt-3 text-[11px] font-[family-name:var(--font-oswald)] tracking-[1px] uppercase text-[#1a2332]/60 flex justify-between">
            <span>Exhibit A · Held-out broadcast footage</span>
            <span>Marks indicate strike windows (c &gt; 0.5)</span>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-12">
          <h2 className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#9b1c1c] border-b-2 border-[#9b1c1c] pb-2 mb-4">
            § 3 · Detection Methodology
          </h2>
          <div className="space-y-5">
            {[
              {
                num: "3.1",
                title: "Isolation",
                body: "Segment Anything 2 is applied frame-by-frame with fighter-centered prompts. The union of two masks is retained; everything outside is zeroed. The classifier sees motion, not broadcast chrome.",
              },
              {
                num: "3.2",
                title: "Windowing",
                body: "Input is a sliding five-frame window, producing one confidence score per inference. Strike calls are issued per-window; the downstream consumer can aggregate.",
              },
              {
                num: "3.3",
                title: "Transfer",
                body: "A Temporal Segment Network pretrained on Kinetics-400 provides the motion prior. Only the classification head is fine-tuned. Training converges in under a minute on one GPU.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="flex gap-4">
                <div className="text-[20px] font-[family-name:var(--font-oswald)] font-bold text-[#9b1c1c] w-12 flex-shrink-0">
                  {num}
                </div>
                <div>
                  <div className="text-[13px] font-[family-name:var(--font-oswald)] font-bold tracking-[1px] uppercase text-[#1a2332] mb-1">
                    {title}
                  </div>
                  <p className="text-[14px] leading-[1.65] text-[#1a2332]/85 text-justify">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Observed windows chart */}
        <section className="mb-12">
          <h2 className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#9b1c1c] border-b-2 border-[#9b1c1c] pb-2 mb-4">
            § 4 · Observed Windows
          </h2>
          <div className="border-2 border-[#1a2332] bg-white p-5">
            <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#1a2332]/60 mb-3 flex justify-between">
              <span>Exhibit B · Per-window confidence trajectory</span>
              <span>n = 38 windows</span>
            </div>
            <svg viewBox="0 0 100 32" className="w-full h-28" preserveAspectRatio="none">
              <line x1="0" y1="16" x2="100" y2="16" stroke="#9b1c1c" strokeWidth="0.3" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
              <polyline
                points="0,28 5,26 10,23 15,20 20,17 25,13 30,8 33,4 36,2 40,5 44,11 48,17 52,14 56,9 60,3 64,8 68,16 72,22 76,27 80,29 84,30 88,31 92,30 96,29 100,28"
                fill="none"
                stroke="#1a2332"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <text x="0" y="31.5" fontSize="2.5" fill="#1a2332" opacity="0.6" fontFamily="var(--font-oswald)">FRAME 00</text>
              <text x="45" y="31.5" fontSize="2.5" fill="#1a2332" opacity="0.6" fontFamily="var(--font-oswald)">FRAME 95</text>
              <text x="85" y="31.5" fontSize="2.5" fill="#1a2332" opacity="0.6" fontFamily="var(--font-oswald)">FRAME 190</text>
              <text x="0.5" y="17.5" fontSize="2.5" fill="#9b1c1c" fontFamily="var(--font-oswald)" fontWeight="bold">0.50</text>
            </svg>
            <div className="mt-3 pt-3 border-t border-[#1a2332]/20 grid grid-cols-3 gap-4 text-[11px] font-[family-name:var(--font-oswald)] tracking-[1px] uppercase">
              <div>
                <div className="text-[#1a2332]/50">Peak</div>
                <div className="font-bold text-[#1a2332] text-[16px]">0.947</div>
              </div>
              <div>
                <div className="text-[#1a2332]/50">Mean</div>
                <div className="font-bold text-[#1a2332] text-[16px]">0.312</div>
              </div>
              <div>
                <div className="text-[#1a2332]/50">Hits</div>
                <div className="font-bold text-[#9b1c1c] text-[16px]">07 / 38</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footnotes */}
        <section className="pt-6 border-t-2 border-[#1a2332] mt-16">
          <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#9b1c1c] mb-3">
            Footnotes & References
          </div>
          <ol className="text-[11px] text-[#1a2332]/80 leading-[1.55] space-y-1.5 list-none">
            <li>[1] Kinetics-400 — 400K labeled clips of human action. Kay et al., 2017.</li>
            <li>[2] SAM2 — Ravi et al., Meta FAIR, 2024. Used for per-frame fighter isolation.</li>
            <li>[3] Temporal Segment Networks — Wang et al., ECCV 2016. Backbone architecture.</li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-[#1a2332]/30 flex justify-between text-[9px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#1a2332]/50">
          <span>End of File · STR1KE-2025.04</span>
          <span>T. Ou · Scouting Department</span>
          <span>Variant H</span>
        </footer>
      </article>
    </div>
  );
}
