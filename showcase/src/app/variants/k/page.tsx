import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantK() {
  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#0a0a0a] font-[family-name:var(--font-eb-garamond)]">
      <VariantNav tone="light" />

      {/* Cover spread */}
      <section className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
        {/* Top program bar */}
        <div className="border-b border-[#c9a227]/40 bg-black">
          <div className="max-w-[1200px] mx-auto px-8 py-3 flex items-center justify-between text-[9px] font-[family-name:var(--font-oswald)] tracking-[4px] uppercase">
            <span className="text-[#c9a227]">Official Fight Program</span>
            <span className="text-white/60">Issue 001 · Spring 2025</span>
            <span className="text-[#c9a227]">$0.00 · Keepsake Edition</span>
          </div>
        </div>

        {/* Cover art */}
        <div className="flex-1 flex items-center justify-center relative px-8 py-24">
          {/* Gold corner brackets */}
          <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-[#c9a227]" />
          <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-[#c9a227]" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-[#c9a227]" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-[#c9a227]" />

          {/* Background huge number */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="text-[480px] font-[family-name:var(--font-oswald)] font-black text-white/[0.025] leading-none">
              38
            </div>
          </div>

          <div className="relative text-center max-w-[900px]">
            <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[8px] uppercase text-[#c9a227] mb-6">
              · Feature Presentation ·
            </div>
            <div className="text-[11px] italic text-white/60 mb-8 font-[family-name:var(--font-playfair)]">
              In the main event, at a catchweight of thirty-eight training windows...
            </div>
            <h1 className="text-[84px] sm:text-[144px] font-[family-name:var(--font-oswald)] font-black italic leading-[0.85] tracking-tight uppercase text-white">
              Str<span className="text-[#c9a227] not-italic">1</span>ke
            </h1>
            <div className="mt-4 text-[22px] italic text-white/70 font-[family-name:var(--font-playfair)]">
              <em>The Making of a Machine That Sees Violence</em>
            </div>
            <div className="mt-12 inline-block border-y-2 border-[#c9a227] py-3 px-8">
              <div className="text-[9px] font-[family-name:var(--font-oswald)] tracking-[6px] uppercase text-[#c9a227]">
                · Tale of the Tape ·
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-8 max-w-[640px] mx-auto">
              {[
                ["Pretrain", "400K", "Kinetics clips"],
                ["Fine-tune", "38", "Hand-labeled"],
                ["Window", "150 ms", "Per decision"],
              ].map(([k, v, s]) => (
                <div key={k} className="text-center">
                  <div className="text-[8px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase text-[#c9a227]/70 mb-1">{k}</div>
                  <div className="text-[36px] font-[family-name:var(--font-oswald)] font-black text-white leading-none">{v}</div>
                  <div className="text-[9px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-white/50 mt-1">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#c9a227]/40 bg-black">
          <div className="max-w-[1200px] mx-auto px-8 py-4 flex justify-between items-center text-[10px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase">
            <span className="text-[#c9a227]">A Weekend · One Broadcast · 38 Windows</span>
            <span className="text-white/40">Presented by T. Ou · MMXXV</span>
          </div>
        </div>
      </section>

      {/* Inside feature */}
      <section className="px-8 py-24 bg-[#faf7f0]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[4px] uppercase text-[#8b0000] mb-4">
              · The Feature ·
            </div>
            <h2 className="text-[72px] sm:text-[96px] font-[family-name:var(--font-playfair)] italic font-black leading-[0.95] text-[#0a0a0a] tracking-tight">
              One Weekend,
              <br />
              Thirty-Eight Clips,
              <br />
              <span className="text-[#8b0000]">One Working Classifier.</span>
            </h2>
          </div>

          {/* Full-bleed feature image */}
          <figure className="my-12">
            <div className="border-[12px] border-[#0a0a0a] bg-black p-2 relative">
              <div className="absolute -top-3 left-8 bg-[#0a0a0a] text-[#c9a227] px-3 py-0.5 text-[9px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase">
                · The Reel ·
              </div>
              <HeroPlayer clips={demoClips} />
            </div>
            <figcaption className="mt-4 text-center text-[13px] italic text-[#0a0a0a]/70 font-[family-name:var(--font-playfair)] max-w-[760px] mx-auto">
              Three held-out clips. Every five frames, a decision. The line
              above the player is the model&apos;s belief, rising and falling
              as fighters move.
            </figcaption>
          </figure>

          {/* Feature essay multi-column */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 text-[15px] leading-[1.75] text-[#0a0a0a]/90">
            <div>
              <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#8b0000] mb-3">
                Round 01 · The Premise
              </div>
              <p className="first-letter:text-[64px] first-letter:font-[family-name:var(--font-playfair)] first-letter:font-black first-letter:float-left first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1 first-letter:text-[#8b0000] text-justify">
                The common advice to a builder is to gather a large dataset.
                This piece describes the opposite. A single broadcast MMA
                fight, thirty-eight hand-labeled five-frame windows, and a
                pretrained backbone. That is the entire training ingredient
                list. What falls out is a working classifier.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#8b0000] mb-3">
                Round 02 · The Edit
              </div>
              <p className="text-justify">
                Before the classifier runs, Segment Anything 2 strips the
                broadcast down to two silhouettes. No cage, no crowd, no
                sponsor logos. The model observes motion, not television. It
                is a narrow channel by design. The narrow channel is what
                allows thirty-eight windows to teach a concept.
              </p>
            </div>
          </div>

          {/* Editorial pull */}
          <div className="my-24 text-center border-t-4 border-b-4 border-double border-[#0a0a0a] py-12">
            <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[5px] uppercase text-[#8b0000] mb-4">
              · Pull Quote ·
            </div>
            <blockquote className="text-[40px] sm:text-[56px] font-[family-name:var(--font-playfair)] italic font-black leading-[1.1] text-[#0a0a0a] max-w-[900px] mx-auto">
              &ldquo;A strike does not happen in one frame.
              <br />
              It unfolds across one hundred fifty milliseconds.&rdquo;
            </blockquote>
            <div className="mt-6 text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[4px] uppercase text-[#c9a227]">
              · On Temporal Receptive Fields ·
            </div>
          </div>

          {/* Scorecard */}
          <div className="mt-20 border-4 border-[#0a0a0a] bg-white p-8">
            <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[4px] uppercase text-[#8b0000] text-center mb-6">
              · Official Scorecard · Strike Detection System ·
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { round: "I", title: "Isolate", score: "SAM2", detail: "Per-frame masks" },
                { round: "II", title: "Window", score: "5 Frames", detail: "150 ms each" },
                { round: "III", title: "Classify", score: "TSN", detail: "Kinetics prior" },
                { round: "IV", title: "Verdict", score: "≥ 0.5", detail: "Strike / Neutral" },
              ].map(({ round, title, score, detail }) => (
                <div key={round} className="text-center border-l border-[#0a0a0a]/20 first:border-l-0 pl-6 first:pl-0">
                  <div className="text-[64px] font-[family-name:var(--font-playfair)] italic font-black text-[#8b0000] leading-none">
                    {round}
                  </div>
                  <div className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#0a0a0a] mt-2">
                    {title}
                  </div>
                  <div className="text-[18px] font-[family-name:var(--font-playfair)] font-black text-[#0a0a0a] mt-3">
                    {score}
                  </div>
                  <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#0a0a0a]/60 mt-1">
                    {detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* End card */}
      <footer className="bg-[#0a0a0a] text-white border-t-4 border-[#c9a227]">
        <div className="max-w-[1100px] mx-auto px-8 py-16 text-center">
          <div className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[6px] uppercase text-[#c9a227] mb-4">
            · End of Program ·
          </div>
          <div className="text-[36px] font-[family-name:var(--font-playfair)] italic font-black leading-none">
            Until the next fight.
          </div>
          <div className="mt-8 text-[10px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase text-white/50">
            Thomas Ou · Independent · MMXXV · Variant K · Fight Program
          </div>
        </div>
      </footer>
    </div>
  );
}
