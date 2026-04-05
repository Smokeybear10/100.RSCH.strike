import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantI() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1a1a1a] font-[family-name:var(--font-eb-garamond)]">
      <VariantNav tone="light" />

      {/* Masthead */}
      <header className="border-b-[3px] border-double border-[#1a1a1a] bg-[#faf7f2]">
        <div className="max-w-[1100px] mx-auto px-8 py-4 flex items-end justify-between">
          <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase text-[#1a1a1a]/70">
            Volume 38 · No. 1
          </div>
          <div className="text-center">
            <div className="text-[56px] font-[family-name:var(--font-playfair)] italic font-black leading-none text-[#1a1a1a]">
              The Strike Chronicle
            </div>
            <div className="text-[9px] font-[family-name:var(--font-oswald)] tracking-[6px] uppercase text-[#1a1a1a]/70 mt-1">
              · A Record of Motion, Labeled and Observed ·
            </div>
          </div>
          <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase text-[#1a1a1a]/70 text-right">
            April 04, 2025
            <br />
            <span className="text-[#8b0000]">Section S · Sports</span>
          </div>
        </div>
      </header>

      {/* Secondary bar */}
      <div className="border-b border-[#1a1a1a]/40 bg-[#faf7f2]">
        <div className="max-w-[1100px] mx-auto px-8 py-1.5 flex justify-between text-[9px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#1a1a1a]/60">
          <span>Combat Sports</span>
          <span>Machine Vision</span>
          <span>The Weekend Edition</span>
          <span>Price: Free Forever</span>
        </div>
      </div>

      <article className="max-w-[1100px] mx-auto px-8 py-12">
        {/* Deck / byline */}
        <div className="mb-6 text-center">
          <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[4px] uppercase text-[#8b0000] mb-4 font-bold">
            · Special Feature · The Engineering Notebook ·
          </div>
          <h1 className="text-[64px] sm:text-[84px] font-[family-name:var(--font-playfair)] font-black leading-[0.95] text-[#1a1a1a] tracking-tight max-w-[900px] mx-auto">
            Thirty-Eight Strikes Taught
            <br />
            <em className="italic">a Machine to See Violence</em>
          </h1>
          <div className="mt-6 text-[17px] italic text-[#1a1a1a]/80 leading-[1.5] max-w-[680px] mx-auto font-[family-name:var(--font-playfair)]">
            A single weekend of hand labeling produced a working strike detector.
            How a pretrained backbone and one hundred fifty milliseconds changed
            the economics of combat-sports computer vision.
          </div>
          <div className="mt-8 pt-4 border-t border-b border-[#1a1a1a]/30 py-2.5 inline-flex items-center gap-3 text-[10px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase">
            <span className="font-bold">By Thomas Ou</span>
            <span className="text-[#1a1a1a]/40">·</span>
            <span className="text-[#1a1a1a]/70">Staff Correspondent</span>
            <span className="text-[#1a1a1a]/40">·</span>
            <span className="text-[#8b0000] font-bold">19 Strikes · 19 Moments of Stillness</span>
          </div>
        </div>

        {/* Photo feature */}
        <figure className="my-10 border-t-2 border-b-2 border-[#1a1a1a] py-6">
          <HeroPlayer clips={demoClips} />
          <figcaption className="mt-4 text-center text-[12px] italic text-[#1a1a1a]/70 font-[family-name:var(--font-playfair)]">
            <span className="font-bold not-italic font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[10px] text-[#1a1a1a]">
              The Archive —
            </span>{" "}
            Three held-out clips from live broadcast. The classifier, trained on
            only thirty-eight windows, calls strikes per-window across each feed.
            The line overhead is the model&apos;s confidence, rising and falling.
          </figcaption>
        </figure>

        {/* Multi-column body */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_300px] gap-8 mt-12">
          {/* Column 1 */}
          <div className="text-[14px] leading-[1.65] text-[#1a1a1a]/90 text-justify">
            <p className="first-letter:text-[56px] first-letter:font-black first-letter:font-[family-name:var(--font-playfair)] first-letter:float-left first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1">
              The received wisdom in computer vision is that you need thousands
              of labeled examples. The number gets bigger every year. A common
              benchmark, Kinetics-400, contains four hundred thousand labeled
              clips of human motion. Another, Something-Something V2, has two
              hundred twenty thousand. The usual advice to a builder is to
              collect data first and worry about models second.
            </p>
            <p className="mt-4 indent-6">
              This piece is about the opposite. A single weekend of hand
              labeling, a pretrained backbone, and a narrow task was sufficient
              to produce a working strike detector on MMA broadcast footage.
              Nineteen strikes. Nineteen moments of stillness. Thirty-eight
              windows, five frames each. That was the dataset.
            </p>
            <h3 className="mt-6 mb-2 text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[2px] uppercase text-[#8b0000]">
              The Constraint
            </h3>
            <p className="indent-6">
              Most broadcast footage is a noisy composite. Cage mesh. Sponsor
              logos. Overlay graphics. A crowd moving almost as much as the
              fighters. A vision model trained on raw frames will learn
              shortcuts, not motion. The first job was to strip the broadcast
              chrome and give the classifier silhouettes.
            </p>
          </div>

          {/* Column 2 */}
          <div className="text-[14px] leading-[1.65] text-[#1a1a1a]/90 text-justify">
            <p>
              Segment Anything 2, the Meta vision model released in twenty
              twenty-four, handled this cleanly. Fighter-centered prompts
              produced per-frame masks. The union of two masks was retained,
              everything else zeroed. The classifier now saw two silhouettes
              against void, nothing else.
            </p>
            <blockquote className="my-6 border-l-[3px] border-[#8b0000] pl-4 text-[18px] italic leading-[1.4] text-[#1a1a1a] font-[family-name:var(--font-playfair)]">
              &ldquo;A strike does not happen in one frame. It unfolds across
              one hundred fifty milliseconds.&rdquo;
            </blockquote>
            <p className="indent-6">
              The second choice was a temporal one. A strike isn&apos;t visible
              in a single frame. Neither is stillness. The decision has to be
              made over time. Five frames at thirty frames per second gives one
              hundred fifty milliseconds of evidence, which is about how long a
              punch takes to travel from guard to impact.
            </p>
            <h3 className="mt-6 mb-2 text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[2px] uppercase text-[#8b0000]">
              The Result
            </h3>
            <p className="indent-6">
              Training ran in under a minute on a single consumer GPU. The
              classifier issues one confidence per five-frame window. Above
              the threshold, it calls strike. Below, neutral. Simple.
            </p>
          </div>

          {/* Stats sidebar */}
          <aside className="border-2 border-[#1a1a1a] bg-white p-5">
            <div className="text-[10px] font-[family-name:var(--font-oswald)] font-bold tracking-[3px] uppercase text-[#8b0000] border-b-2 border-[#8b0000] pb-2 mb-4">
              By The Numbers
            </div>
            <dl className="space-y-4">
              {[
                ["38", "Training windows"],
                ["5", "Frames per window"],
                ["150 ms", "Decision horizon"],
                ["30 fps", "Sample rate"],
                ["400,000", "Kinetics-400 pretrain"],
                ["< 1 min", "Fine-tune time"],
                ["1", "Consumer GPU"],
                ["1", "Weekend to label"],
              ].map(([num, label]) => (
                <div key={label} className="border-b border-[#1a1a1a]/20 pb-3 last:border-b-0">
                  <div className="text-[28px] font-[family-name:var(--font-playfair)] font-black leading-none text-[#1a1a1a]">
                    {num}
                  </div>
                  <div className="text-[9px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#1a1a1a]/60 mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* Pull quote full width */}
        <div className="my-16 border-t-2 border-b-2 border-[#1a1a1a] py-10 text-center">
          <div className="text-[11px] font-[family-name:var(--font-oswald)] font-bold tracking-[4px] uppercase text-[#8b0000] mb-4">
            · The Thesis ·
          </div>
          <blockquote className="text-[32px] sm:text-[44px] italic font-[family-name:var(--font-playfair)] font-black leading-[1.15] text-[#1a1a1a] max-w-[820px] mx-auto">
            &ldquo;Kinetics provides the prior. SAM strips the distractors. Thirty-eight
            windows teach only the delta between strike and stillness.&rdquo;
          </blockquote>
          <div className="mt-5 text-[10px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase text-[#1a1a1a]/60">
            — From the Author&apos;s Notes, April 2025
          </div>
        </div>
      </article>

      {/* Newspaper footer */}
      <footer className="border-t-2 border-[#1a1a1a] bg-[#faf7f2]">
        <div className="max-w-[1100px] mx-auto px-8 py-6 text-center">
          <div className="text-[10px] font-[family-name:var(--font-oswald)] tracking-[3px] uppercase text-[#1a1a1a]/60">
            The Strike Chronicle · Published Independently · Thomas Ou 2025
          </div>
          <div className="text-[9px] font-[family-name:var(--font-oswald)] tracking-[2px] uppercase text-[#1a1a1a]/40 mt-2">
            Variant I · Sports Broadsheet
          </div>
        </div>
      </footer>
    </div>
  );
}
