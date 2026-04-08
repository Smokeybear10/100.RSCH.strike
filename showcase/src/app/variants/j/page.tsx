import { HeroPlayer } from "@/components/hero-player";
import { VariantNav } from "@/components/variant-nav";
import { demoClips } from "@/lib/demo-data";

export default function VariantJ() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-[family-name:var(--font-space-mono)]">
      <VariantNav tone="light" />

      {/* Classification banner */}
      <div className="bg-[#1a3a2e] text-white border-b-4 border-[#c9a227]">
        <div className="max-w-[960px] mx-auto px-6 py-2 flex items-center justify-between text-[10px] tracking-[3px] uppercase font-bold">
          <span>· Distribution Limited ·</span>
          <span>Internal Engineering Review</span>
          <span>· Uncontrolled If Printed ·</span>
        </div>
      </div>

      {/* Doc code bar */}
      <div className="border-b border-[#0a0a0a]/20 bg-[#f5f5f0]">
        <div className="max-w-[960px] mx-auto px-6 py-2 flex items-center justify-between text-[10px] tracking-[2px] uppercase text-[#0a0a0a]/70">
          <span>DOC-ID: STR1KE/AAR/2025.04</span>
          <span>REV: 01</span>
          <span>PAGES: 01 / 12</span>
          <span className="text-[#1a3a2e] font-bold">Status: Cleared</span>
        </div>
      </div>

      <article className="max-w-[960px] mx-auto px-8 py-16">
        {/* Title block */}
        <header className="mb-12 pb-8 border-b-[3px] border-[#1a3a2e]">
          <div className="text-[10px] tracking-[3px] uppercase text-[#1a3a2e] font-bold mb-3">
            After-Action Report · Computer Vision Systems
          </div>
          <h1 className="text-[44px] sm:text-[52px] font-[family-name:var(--font-oswald)] font-bold leading-[1.05] text-[#0a0a0a] uppercase tracking-tight">
            Strike Detection Deployment
            <br />
            <span className="text-[#1a3a2e]">Technical Review</span>
          </h1>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
            {[
              ["Program", "STR1KE"],
              ["Domain", "Combat Sports CV"],
              ["Engineer", "T. Ou"],
              ["Reporting Period", "Q2 · 2025"],
            ].map(([k, v]) => (
              <div key={k} className="border-l-2 border-[#1a3a2e] pl-3">
                <div className="tracking-[2px] uppercase text-[#0a0a0a]/50 mb-1 text-[9px]">{k}</div>
                <div className="font-bold text-[#0a0a0a] tracking-wide">{v}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Executive summary */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 border-b border-[#0a0a0a]/30 pb-2">
            <span className="text-[10px] tracking-[3px] uppercase font-bold text-[#1a3a2e] bg-[#c9a227]/20 px-2 py-0.5">§ 1.0</span>
            <h2 className="text-[18px] font-[family-name:var(--font-oswald)] font-bold uppercase tracking-wide">
              Executive Summary
            </h2>
          </div>
          <p className="text-[13px] leading-[1.7] text-[#0a0a0a]/90">
            A binary strike classifier was trained on thirty-eight (38)
            hand-labeled five-frame windows extracted from a single broadcast
            MMA fight. The backbone architecture was a Temporal Segment Network
            pretrained on Kinetics-400. Per-frame fighter isolation was
            performed via Segment Anything 2. Fine-tuning converged in under
            sixty seconds on one consumer-grade GPU. System is operational at
            thirty frames per second across held-out broadcast inputs.
          </p>
        </section>

        {/* Key observations */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 border-b border-[#0a0a0a]/30 pb-2">
            <span className="text-[10px] tracking-[3px] uppercase font-bold text-[#1a3a2e] bg-[#c9a227]/20 px-2 py-0.5">§ 2.0</span>
            <h2 className="text-[18px] font-[family-name:var(--font-oswald)] font-bold uppercase tracking-wide">
              Key Observations
            </h2>
          </div>
          <ol className="space-y-5">
            {[
              {
                id: "2.1",
                finding: "Pretraining Dominates",
                body: "Transfer from Kinetics-400 reduced the marginal supervision cost from thousands of samples to tens. Target concept (strike vs. neutral) required only 38 labeled windows to converge above threshold on held-out footage.",
              },
              {
                id: "2.2",
                finding: "Masking Is Load-Bearing",
                body: "Removal of broadcast chrome (cage, logos, crowd, overlays) via SAM2 masks eliminated the most common spurious correlations. Downstream classifier attends to fighter silhouettes exclusively.",
              },
              {
                id: "2.3",
                finding: "Windowing Matches Physics",
                body: "Five-frame windows at 30 fps yield ~150 ms temporal receptive fields. This aligns with the empirical duration of a landed strike (guard to impact), making per-window inference physically grounded.",
              },
              {
                id: "2.4",
                finding: "Labeling Cost: One Weekend",
                body: "End-to-end annotation (strike / neutral) across 38 windows completed in a single weekend using Label Studio. No augmentation, synthesis, or auto-annotation was employed.",
              },
            ].map(({ id, finding, body }) => (
              <li key={id} className="grid grid-cols-[80px_1fr] gap-4 pb-4 border-b border-dashed border-[#0a0a0a]/15 last:border-b-0">
                <div className="text-[11px] tracking-[2px] uppercase font-bold text-[#1a3a2e]">§ {id}</div>
                <div>
                  <div className="text-[13px] font-bold uppercase tracking-wide mb-1.5 text-[#0a0a0a]">
                    {finding}
                  </div>
                  <p className="text-[12px] leading-[1.65] text-[#0a0a0a]/80">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Exhibit */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 border-b border-[#0a0a0a]/30 pb-2">
            <span className="text-[10px] tracking-[3px] uppercase font-bold text-[#1a3a2e] bg-[#c9a227]/20 px-2 py-0.5">§ 3.0</span>
            <h2 className="text-[18px] font-[family-name:var(--font-oswald)] font-bold uppercase tracking-wide">
              Exhibit A · Inference Trace
            </h2>
          </div>
          <div className="border-2 border-[#1a3a2e] bg-white">
            <div className="bg-[#1a3a2e] text-white px-4 py-2 flex justify-between text-[9px] tracking-[2px] uppercase font-bold">
              <span>Evidence · Held-Out Footage</span>
              <span>3 Clips · 30 fps · Masked Input</span>
            </div>
            <div className="p-3">
              <HeroPlayer clips={demoClips} />
            </div>
          </div>
          <div className="mt-2 text-[10px] tracking-[1px] uppercase text-[#0a0a0a]/60 flex justify-between">
            <span>Fig. 3-1 — Per-window confidence with strike-window highlights</span>
            <span>Threshold: c ≥ 0.5</span>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 border-b border-[#0a0a0a]/30 pb-2">
            <span className="text-[10px] tracking-[3px] uppercase font-bold text-[#1a3a2e] bg-[#c9a227]/20 px-2 py-0.5">§ 4.0</span>
            <h2 className="text-[18px] font-[family-name:var(--font-oswald)] font-bold uppercase tracking-wide">
              Development Timeline
            </h2>
          </div>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b-2 border-[#1a3a2e]">
                <th className="text-left py-2 px-3 tracking-[2px] uppercase text-[10px] text-[#1a3a2e] bg-[#f5f5f0]">T</th>
                <th className="text-left py-2 px-3 tracking-[2px] uppercase text-[10px] text-[#1a3a2e] bg-[#f5f5f0]">Milestone</th>
                <th className="text-left py-2 px-3 tracking-[2px] uppercase text-[10px] text-[#1a3a2e] bg-[#f5f5f0]">Cost</th>
                <th className="text-left py-2 px-3 tracking-[2px] uppercase text-[10px] text-[#1a3a2e] bg-[#f5f5f0]">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["T+0", "Broadcast fight selected · single-source corpus", "0 h", "COMPLETE"],
                ["T+1", "SAM2 mask pipeline stood up · per-frame", "2 h", "COMPLETE"],
                ["T+2", "Label Studio annotation · 38 windows", "8 h", "COMPLETE"],
                ["T+3", "TSN backbone loaded · Kinetics-400 weights", "< 1 m", "COMPLETE"],
                ["T+4", "Fine-tune classification head · 1 epoch", "< 1 m", "COMPLETE"],
                ["T+5", "Held-out inference · 3 clips · per-window", "RT", "OPERATIONAL"],
              ].map(([t, milestone, cost, status], i) => (
                <tr key={t} className={i % 2 === 1 ? "bg-[#f5f5f0]/50" : ""}>
                  <td className="py-2 px-3 font-bold text-[#1a3a2e]">{t}</td>
                  <td className="py-2 px-3 text-[#0a0a0a]/90">{milestone}</td>
                  <td className="py-2 px-3 text-[#0a0a0a]/70">{cost}</td>
                  <td className="py-2 px-3 text-[9px] tracking-[1px] font-bold text-[#1a3a2e]">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Recommendations */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 border-b border-[#0a0a0a]/30 pb-2">
            <span className="text-[10px] tracking-[3px] uppercase font-bold text-[#1a3a2e] bg-[#c9a227]/20 px-2 py-0.5">§ 5.0</span>
            <h2 className="text-[18px] font-[family-name:var(--font-oswald)] font-bold uppercase tracking-wide">
              Recommendations
            </h2>
          </div>
          <ul className="space-y-2 text-[12px] leading-[1.65] text-[#0a0a0a]/85">
            <li className="flex gap-3">
              <span className="text-[#c9a227] font-bold">▸</span>
              <span>Continue single-source supervision strategy for near-neighbor concepts (takedown, clinch break, knockdown).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#c9a227] font-bold">▸</span>
              <span>Evaluate on multi-broadcast corpus before production deployment. Current eval is single-source.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#c9a227] font-bold">▸</span>
              <span>Formalize windowing contract (5 frames, 150 ms) as a system invariant. Downstream consumers should aggregate windows, not override them.</span>
            </li>
          </ul>
        </section>

        {/* Sign-off */}
        <footer className="mt-16 pt-6 border-t-[3px] border-[#1a3a2e] grid grid-cols-1 sm:grid-cols-3 gap-6 text-[10px] tracking-[2px] uppercase">
          <div>
            <div className="text-[#0a0a0a]/50 mb-2">Prepared By</div>
            <div className="font-bold text-[#0a0a0a] text-[13px] tracking-wide">T. Ou</div>
            <div className="text-[#0a0a0a]/60 mt-0.5">Engineering · Vision</div>
          </div>
          <div>
            <div className="text-[#0a0a0a]/50 mb-2">Report Date</div>
            <div className="font-bold text-[#0a0a0a] text-[13px] tracking-wide">04 Apr 2025</div>
            <div className="text-[#0a0a0a]/60 mt-0.5">Q2 · FY25</div>
          </div>
          <div>
            <div className="text-[#0a0a0a]/50 mb-2">Classification</div>
            <div className="font-bold text-[#1a3a2e] text-[13px] tracking-wide">Internal · Cleared</div>
            <div className="text-[#0a0a0a]/60 mt-0.5">Variant J</div>
          </div>
        </footer>
      </article>
    </div>
  );
}
