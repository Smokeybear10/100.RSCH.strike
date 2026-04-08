import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantE() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-[family-name:var(--font-eb-garamond)]">
      <VariantNav tone="light" />

      {/* arXiv-style header bar */}
      <div className="border-b border-[#1a1a1a]/20 bg-[#fafafa]">
        <div className="max-w-[820px] mx-auto px-6 py-2 flex items-center justify-between text-[10px] font-mono text-[#1a1a1a]/60">
          <span>arXiv:2501.STR1KE [cs.CV]</span>
          <span>2025-04-04</span>
        </div>
      </div>

      {/* Paper body */}
      <article className="max-w-[720px] mx-auto px-6 py-20">
        {/* Title block */}
        <header className="mb-12 border-b border-[#1a1a1a]/20 pb-8">
          <div className="text-[9px] font-mono tracking-[2px] uppercase text-[#9b1c1c] mb-3">
            Preprint · Under Review
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-semibold leading-[1.15] text-[#1a1a1a] tracking-tight">
            STR1KE: Few-Shot Action Recognition for
            Combat Sports via Pretrained Temporal Networks
          </h1>
          <div className="mt-6 text-[15px] text-[#1a1a1a]/80">
            <span className="italic">Thomas Ou</span>
            <sup className="text-[10px]">1</sup>
          </div>
          <div className="text-[11px] text-[#1a1a1a]/60 mt-1 font-[family-name:var(--font-space-mono)]">
            <sup>1</sup>Independent Research
          </div>
        </header>

        {/* Abstract */}
        <section className="mb-12">
          <h2 className="text-[11px] font-bold tracking-[1px] uppercase text-[#1a1a1a] mb-3 font-[family-name:var(--font-space-mono)]">
            Abstract
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 italic indent-0 text-justify">
            We present STR1KE, a temporal action classifier trained on a
            minimal dataset of 38 hand-labeled five-frame clips from
            mixed-martial-arts broadcast footage. Exploiting transfer from a
            Kinetics-400 pretrained Temporal Segment Network (TSN) and
            isolating fighters via Segment Anything (SAM2), we show that a
            single weekend of annotation is sufficient to reach a usable
            strike/neutral discriminator over per-window inference at 30 fps.
            We report per-window confidence trajectories and describe
            engineering choices that make this practical as an independent
            project.
          </p>
        </section>

        {/* Figure 1 — the player */}
        <figure className="my-12">
          <div className="border border-[#1a1a1a]/20 p-3 bg-[#fafafa]">
            <HeroPlayer clips={demoClips} />
          </div>
          <figcaption className="text-[12px] text-[#1a1a1a]/70 mt-3 leading-[1.5] italic">
            <span className="font-semibold not-italic font-[family-name:var(--font-space-mono)] text-[11px] tracking-wide">
              Figure 1:
            </span>{" "}
            Qualitative results on three held-out broadcast clips. Top: input
            frame sequence with SAM2-generated fighter masks. Middle: per-window
            strike confidence (threshold = 0.5). Bottom: scrubbable timeline
            with strike windows highlighted. Clips differ in fight phase
            (knockdown, exchange, pressure) to span the model&rsquo;s operating
            regime.
          </figcaption>
        </figure>

        {/* Section 1 — Introduction */}
        <section className="mb-12">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-4">
            1. &nbsp; Introduction
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify indent-8">
            Action recognition in combat sports is hard for reasons that are
            not about motion. Broadcast footage is a noisy composite: cage
            mesh, overlay graphics, sponsor logos, and a crowd that moves
            almost as much as the fighters. A model trained naïvely will
            learn shortcuts. We apply two ideas to avoid this. First, we
            isolate the fighters with Segment Anything 2 [2] so the classifier
            observes motion, not broadcast chrome. Second, we transfer from
            Kinetics-400 [1], where the network has already seen 400,000
            labeled clips of human motion, and fine-tune on only the strike
            concept.
          </p>
        </section>

        {/* Table 1 — dataset */}
        <section className="my-12">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-4">
            2. &nbsp; Dataset
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify mb-6 indent-8">
            We construct a minimal supervised set from a single broadcast
            fight. Clips are sampled at 30 fps and windowed at 5 frames
            (~150 ms). Annotations were produced in one weekend using Label
            Studio. No augmentation, no synthetic data, no auto-annotation is
            used. The full statistics are reported in Table 1.
          </p>
          <div className="border-t-2 border-b-2 border-[#1a1a1a] my-6">
            <div className="text-[10px] font-bold tracking-[1px] uppercase text-center py-2 border-b border-[#1a1a1a] font-[family-name:var(--font-space-mono)]">
              Table 1 &middot; Dataset Statistics
            </div>
            <table className="w-full text-[13px] font-[family-name:var(--font-space-mono)]">
              <tbody>
                {[
                  ["n_windows (strike)", "19"],
                  ["n_windows (neutral)", "19"],
                  ["window_size (frames)", "5"],
                  ["n_frames total", "190"],
                  ["sample rate (fps)", "30"],
                  ["window duration (ms)", "≈150"],
                  ["annotator hours", "~8"],
                  ["source", "1 broadcast fight"],
                ].map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 1 ? "bg-[#fafafa]" : ""}>
                    <td className="py-1.5 px-4 text-[#1a1a1a]/80">{k}</td>
                    <td className="py-1.5 px-4 text-right font-bold text-[#1a1a1a] tabular-nums">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 — Method */}
        <section className="mb-12">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-4">
            3. &nbsp; Method
          </h2>

          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2 mt-6">
            3.1 &nbsp; Segmentation
          </h3>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify indent-8">
            We apply SAM2 [2] to each frame with fighter-centered prompts and
            retain the union of the two resulting masks. Everything outside
            the mask is zeroed before the classifier runs. This removes the
            cage, the canvas, the crowd, and most broadcast overlays.
          </p>

          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2 mt-6">
            3.2 &nbsp; Windowing
          </h3>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify indent-8 mb-4">
            Define the input to the classifier at time <em>t</em> as the
            sequence:
          </p>
          <div className="text-center my-5 text-[15px] font-[family-name:var(--font-space-mono)] text-[#1a1a1a]">
            w<sub>t</sub>&nbsp;=&nbsp;[ f<sub>t</sub>,&nbsp; f<sub>t+1</sub>,&nbsp; f<sub>t+2</sub>,&nbsp; f<sub>t+3</sub>,&nbsp; f<sub>t+4</sub> ]
            <span className="text-[#1a1a1a]/40 ml-8">(1)</span>
          </div>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify indent-8">
            where <em>f<sub>i</sub></em> is the masked RGB frame. A single
            confidence score <em>c(w<sub>t</sub>)</em> ∈ [0, 1] is produced
            per window. We threshold at 0.5 for the binary decision.
          </p>

          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2 mt-6">
            3.3 &nbsp; Classifier
          </h3>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify indent-8">
            The backbone is a Temporal Segment Network [3] pretrained on
            Kinetics-400 [1]. We fine-tune only the classification head for
            binary output (strike / neutral) with the 38-sample supervised
            set. Training runs in under a minute on a single consumer GPU.
          </p>
        </section>

        {/* Figure 2 — confidence curve */}
        <figure className="my-12">
          <div className="border border-[#1a1a1a]/20 bg-[#fafafa] p-6">
            <svg
              viewBox="0 0 100 40"
              className="w-full h-32"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="5"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 5"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="0.1"
                    opacity="0.15"
                  />
                </pattern>
              </defs>
              <rect width="100" height="40" fill="url(#grid)" />
              <line
                x1="0"
                y1="20"
                x2="100"
                y2="20"
                stroke="#9b1c1c"
                strokeWidth="0.3"
                strokeDasharray="2,2"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points="0,32 5,30 10,28 15,25 20,22 25,18 30,12 33,7 36,4 40,6 44,12 48,18 52,15 56,10 60,5 64,10 68,18 72,25 76,30 80,33 84,35 88,36 92,37 96,36 100,35"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
              {/* Axis ticks */}
              <text x="0" y="39" fontSize="2.5" fill="#1a1a1a" opacity="0.6">0</text>
              <text x="48" y="39" fontSize="2.5" fill="#1a1a1a" opacity="0.6">19</text>
              <text x="94" y="39" fontSize="2.5" fill="#1a1a1a" opacity="0.6">38</text>
              <text x="0" y="22" fontSize="2.5" fill="#9b1c1c" opacity="0.8">0.5</text>
            </svg>
            <div className="flex justify-between text-[10px] font-[family-name:var(--font-space-mono)] text-[#1a1a1a]/70 mt-2">
              <span>window index</span>
              <span>→</span>
            </div>
          </div>
          <figcaption className="text-[12px] text-[#1a1a1a]/70 mt-3 leading-[1.5] italic">
            <span className="font-semibold not-italic font-[family-name:var(--font-space-mono)] text-[11px] tracking-wide">
              Figure 2:
            </span>{" "}
            Per-window confidence trajectory <em>c(w<sub>t</sub>)</em> across
            a 38-window held-out clip. Dashed line denotes the decision
            threshold (0.5). Peaks correspond to strike landings; troughs to
            resets and neutral phases.
          </figcaption>
        </figure>

        {/* Section 4 */}
        <section className="mb-12">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-4">
            4. &nbsp; Discussion
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#1a1a1a]/90 text-justify indent-8">
            The central claim is not that 38 samples are sufficient in
            general, but that a sufficiently pretrained backbone reduces the
            marginal cost of a new concept to the cost of labeling that
            concept alone. In our case, that cost was one weekend.
            Kinetics-400 provides a general prior over human action; SAM2
            strips the distractors; the 38 hand-labeled windows teach only
            the delta between strike and stillness.
          </p>
        </section>

        {/* References */}
        <section className="mt-16 pt-8 border-t border-[#1a1a1a]/20">
          <h2 className="text-[11px] font-bold tracking-[1px] uppercase text-[#1a1a1a] mb-4 font-[family-name:var(--font-space-mono)]">
            References
          </h2>
          <ol className="text-[12px] text-[#1a1a1a]/80 leading-[1.6] space-y-2 list-none">
            <li>
              [1] Kay, W. et al. <em>The Kinetics Human Action Video Dataset.</em>{" "}
              arXiv:1705.06950, 2017.
            </li>
            <li>
              [2] Ravi, N. et al. <em>SAM 2: Segment Anything in Images and Videos.</em>{" "}
              Meta FAIR, 2024.
            </li>
            <li>
              [3] Wang, L. et al. <em>Temporal Segment Networks: Towards Good
              Practices for Deep Action Recognition.</em> ECCV, 2016.
            </li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#1a1a1a]/20 text-center text-[10px] font-[family-name:var(--font-space-mono)] tracking-[2px] uppercase text-[#1a1a1a]/50">
          Variant E · Research Paper · Thomas Ou 2025
        </footer>
      </article>
    </div>
  );
}
