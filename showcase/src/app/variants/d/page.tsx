import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantD() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e5e3dd] font-[family-name:var(--font-eb-garamond)]">
      <VariantNav tone="dark" />

      {/* Hero — full-bleed cinematic */}
      <section className="relative min-h-screen flex flex-col">
        {/* Top letterbox bar */}
        <div className="h-[60px] bg-black" />

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-16 relative">
          {/* Chapter marker */}
          <div className="text-[9px] tracking-[6px] uppercase text-[#b89256] mb-12 font-[family-name:var(--font-space-mono)]">
            · A Film by Thomas Ou ·
          </div>

          {/* Title */}
          <h1 className="text-[72px] sm:text-[140px] font-normal italic leading-[0.85] text-[#e5e3dd] text-center tracking-tight font-[family-name:var(--font-playfair)]">
            Str<span className="not-italic text-[#a80000]">1</span>ke
          </h1>
          <div className="text-[11px] tracking-[8px] uppercase text-[#b89256] mt-6 font-[family-name:var(--font-space-mono)]">
            Detection, By Machine
          </div>

          {/* Title attribution */}
          <div className="text-[13px] italic text-[#e5e3dd]/40 mt-3 tracking-wide">
            A study of motion, taught with thirty-eight clips.
          </div>

          {/* Player framed as archival footage */}
          <div className="w-full max-w-[900px] mt-16">
            <div className="text-[9px] tracking-[4px] uppercase text-[#b89256]/60 mb-3 font-[family-name:var(--font-space-mono)]">
              Archival footage · 30fps
            </div>
            <HeroPlayer clips={demoClips} />
          </div>
        </div>

        {/* Bottom letterbox bar */}
        <div className="h-[60px] bg-black relative">
          <div className="absolute inset-0 flex items-center justify-between px-6 text-[9px] tracking-[3px] uppercase text-white/30 font-[family-name:var(--font-space-mono)]">
            <span>2.39 : 1</span>
            <span>Roll 01 · Take 38</span>
          </div>
        </div>
      </section>

      {/* Chapter II — The Constraint */}
      <section className="py-40 px-5 relative">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="text-[140px] font-normal italic text-[#b89256]/40 leading-none font-[family-name:var(--font-playfair)]">
            II.
          </div>
          <div className="text-[9px] tracking-[6px] uppercase text-[#b89256] mb-12 font-[family-name:var(--font-space-mono)]">
            The Constraint
          </div>

          <h2 className="text-[60px] sm:text-[96px] font-normal italic leading-[0.95] text-[#e5e3dd] tracking-tight font-[family-name:var(--font-playfair)]">
            Thirty-
            <br />
            eight.
          </h2>

          <div className="mx-auto w-16 h-px bg-[#b89256]/40 my-12" />

          <p className="text-[19px] italic text-[#e5e3dd]/70 max-w-[600px] mx-auto leading-[1.5] tracking-wide">
            Most vision models demand thousands of labels. This one was taught
            with thirty-eight &#8212; nineteen strikes, nineteen moments of
            stillness. A weekend&apos;s work.
          </p>
        </div>
      </section>

      {/* Chapter III — Three Acts */}
      <section className="py-32 px-5">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-24">
            <div className="text-[140px] font-normal italic text-[#b89256]/40 leading-none font-[family-name:var(--font-playfair)]">
              III.
            </div>
            <div className="text-[9px] tracking-[6px] uppercase text-[#b89256] font-[family-name:var(--font-space-mono)]">
              Three Acts
            </div>
          </div>

          <div className="space-y-32">
            {[
              {
                act: "ONE",
                title: "The Mask",
                body: "Broadcast footage arrives contaminated. Cage. Crowd. Logos. The model, asked to learn motion, would instead learn the placement of the Monster Energy bug. So we masked the fighters. Two silhouettes against the void. Nothing else.",
              },
              {
                act: "TWO",
                title: "The Label",
                body: "Nineteen strikes. Nineteen moments of stillness. Each five frames long, each marked by hand in a single weekend at a kitchen table. No augmentation, no synthesis, no shortcuts. The smallest honest dataset we could assemble.",
              },
              {
                act: "THREE",
                title: "The Decision",
                body: "A Temporal Segment Network, fine-tuned from Kinetics-400, learns to tell them apart. It watches five frames &#8212; one hundred fifty milliseconds &#8212; and calls strike, or calls neutral. Once every window. All the way through.",
              },
            ].map((act, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
                <div>
                  <div className="text-[8px] tracking-[4px] uppercase text-[#b89256]/60 font-[family-name:var(--font-space-mono)] mb-2">
                    Act
                  </div>
                  <div className="text-[36px] sm:text-[44px] font-normal italic text-[#a80000] leading-none font-[family-name:var(--font-playfair)]">
                    {act.act}
                  </div>
                </div>
                <div>
                  <h3 className="text-[32px] sm:text-[40px] font-normal italic text-[#e5e3dd] leading-[1.1] mb-6 font-[family-name:var(--font-playfair)]">
                    {act.title}
                  </h3>
                  <p
                    className="text-[17px] italic text-[#e5e3dd]/70 leading-[1.6] max-w-[520px]"
                    dangerouslySetInnerHTML={{ __html: act.body }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter IV — Pull quote */}
      <section className="py-40 px-5 relative">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-[140px] font-normal italic text-[#b89256]/40 leading-none text-center font-[family-name:var(--font-playfair)]">
            IV.
          </div>
          <div className="text-[9px] tracking-[6px] uppercase text-[#b89256] text-center mb-16 font-[family-name:var(--font-space-mono)]">
            On Time
          </div>

          <figure className="text-center">
            <blockquote className="text-[36px] sm:text-[56px] font-normal italic text-[#e5e3dd] leading-[1.2] tracking-tight font-[family-name:var(--font-playfair)]">
              &ldquo;A strike doesn&apos;t happen in one frame.
              <br />
              It unfolds across one hundred
              <br />
              and fifty milliseconds.&rdquo;
            </blockquote>
            <figcaption className="mt-10 text-[10px] tracking-[4px] uppercase text-[#b89256]/80 font-[family-name:var(--font-space-mono)]">
              · On Temporal Windows ·
            </figcaption>
          </figure>

          {/* 5-frame film strip */}
          <div className="mt-20 mx-auto max-w-[640px]">
            <div className="text-[8px] tracking-[3px] uppercase text-[#b89256]/60 mb-3 text-center font-[family-name:var(--font-space-mono)]">
              Five Frames · One Window · One Prediction
            </div>
            <div className="grid grid-cols-5 gap-0 border border-[#b89256]/30 p-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-black relative border-r border-[#b89256]/20 last:border-r-0"
                >
                  <div className="absolute bottom-1 left-1 text-[8px] font-[family-name:var(--font-space-mono)] text-[#b89256]/60">
                    {String(i + 1).padStart(3, "0")}
                  </div>
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#a80000]" />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-[11px] italic text-[#e5e3dd]/50 tracking-wide">
              Confidence, this window: <span className="text-[#b89256] not-italic font-[family-name:var(--font-space-mono)]">0.847</span> &#8212; Call: <span className="text-[#a80000] not-italic font-bold">STRIKE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter V — Callback */}
      <section className="py-40 px-5">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="text-[140px] font-normal italic text-[#b89256]/40 leading-none font-[family-name:var(--font-playfair)]">
            V.
          </div>
          <div className="text-[9px] tracking-[6px] uppercase text-[#b89256] mb-12 font-[family-name:var(--font-space-mono)]">
            The Signal
          </div>

          <h2 className="text-[40px] sm:text-[64px] font-normal italic leading-[1.1] text-[#e5e3dd] tracking-tight font-[family-name:var(--font-playfair)]">
            That line above the player &#8212;
            <br />
            <span className="text-[#a80000]">belief, rising and falling.</span>
          </h2>

          <div className="mt-16 mx-auto max-w-[700px]">
            <svg
              viewBox="0 0 100 28"
              className="w-full h-24"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="doc-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a80000" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a80000" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points="0,28 0,22 8,20 16,17 24,12 32,6 38,2 42,4 46,10 52,14 58,9 64,4 70,10 76,16 82,20 88,22 94,24 100,23 100,28"
                fill="url(#doc-grad)"
              />
              <polyline
                points="0,22 8,20 16,17 24,12 32,6 38,2 42,4 46,10 52,14 58,9 64,4 70,10 76,16 82,20 88,22 94,24 100,23"
                fill="none"
                stroke="#b89256"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="14"
                x2="100"
                y2="14"
                stroke="#b89256"
                strokeWidth="0.2"
                strokeDasharray="1,2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mt-3 flex justify-between text-[9px] tracking-[3px] uppercase text-[#b89256]/40 font-[family-name:var(--font-space-mono)]">
              <span>Frame 0</span>
              <span>&#8212; threshold &#8212;</span>
              <span>Frame 190</span>
            </div>
          </div>
        </div>
      </section>

      {/* End credits */}
      <footer className="pt-40 pb-12 px-5 bg-black">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="text-[9px] tracking-[8px] uppercase text-[#b89256]/60 mb-4 font-[family-name:var(--font-space-mono)]">
            — Fin —
          </div>
          <div className="text-[11px] italic text-[#e5e3dd]/60 tracking-wide">
            Str<span className="text-[#a80000] not-italic">1</span>ke
            , by Thomas Ou &#8212; 2025
          </div>
          <div className="mt-12 text-[8px] tracking-[3px] uppercase text-[#b89256]/40 font-[family-name:var(--font-space-mono)]">
            Variant D · Cinematic Doc
          </div>
        </div>
      </footer>
    </div>
  );
}
