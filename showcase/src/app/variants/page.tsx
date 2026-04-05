import Link from "next/link";

const variants = [
  {
    slug: "a",
    letter: "A",
    name: "Fight Card",
    tagline: "UFC broadcast graphics",
    palette: ["#000000", "#dc2626", "#f59e0b"],
    font: "Anton + Oswald",
    group: "Original",
    desc: "Heavyweight title-belt energy. Diagonal cuts, ticker tape, ROUND 1/2/3 pipeline, tale-of-the-tape stat overlays.",
  },
  {
    slug: "d",
    letter: "D",
    name: "Cinematic Doc",
    tagline: "A24 documentary",
    palette: ["#1a1a1a", "#e5e3dd", "#a80000"],
    font: "Playfair Display Serif",
    group: "Original",
    desc: "Letterbox bars, elegant serif, chapter cards (ACT ONE / TWO / THREE), slow emotional pacing. Data serves story.",
  },
  {
    slug: "e",
    letter: "E",
    name: "Research Paper",
    tagline: "arXiv preprint",
    palette: ["#ffffff", "#1a1a1a", "#9b1c1c"],
    font: "EB Garamond + Mono",
    group: "Original",
    desc: "Single-column academic PDF. Fig. captions, numbered sections, inline equations, footnote citations.",
  },
  {
    slug: "g",
    letter: "G",
    name: "HUD Targeting",
    tagline: "Sci-fi interface",
    palette: ["#000814", "#00d9ff", "#00ff7f"],
    font: "Orbitron + Space Mono",
    group: "Original",
    desc: "Wireframe targeting chrome, corner brackets, scanning lines, radial sonar, holographic cyan on space-black.",
  },
  {
    slug: "h",
    letter: "H",
    name: "Scouting Report",
    tagline: "Pre-fight intel dossier",
    palette: ["#f4f1e8", "#1a2332", "#9b1c1c"],
    font: "EB Garamond + Oswald",
    group: "Hybrid: Paper × Fight Card",
    desc: "Classified intel brief aesthetic. Red CONFIDENTIAL stamp, scout card sidebar, numbered observations, footnote references. Paper's discipline, fighter subject.",
  },
  {
    slug: "i",
    letter: "I",
    name: "Sports Broadsheet",
    tagline: "The Athletic long-form",
    palette: ["#faf7f2", "#1a1a1a", "#8b0000"],
    font: "Playfair Display + Oswald",
    group: "Hybrid: Paper × Fight Card",
    desc: "Newspaper feature layout. Didot headline, multi-column body with drop caps, pull quotes, by-the-numbers sidebar. Serious sports journalism gravitas.",
  },
  {
    slug: "j",
    letter: "J",
    name: "Technical Briefing",
    tagline: "After-action report",
    palette: ["#ffffff", "#1a3a2e", "#c9a227"],
    font: "Space Mono + Oswald",
    group: "Hybrid: Paper × Fight Card",
    desc: "Engineering postmortem. Classification banner, § numbered sections, timeline table, sign-off block. DARPA-coded discipline applied to combat CV.",
  },
  {
    slug: "k",
    letter: "K",
    name: "Fight Program",
    tagline: "Glossy event keepsake",
    palette: ["#0a0a0a", "#faf7f0", "#c9a227"],
    font: "Oswald + Playfair",
    group: "Hybrid: Paper × Fight Card",
    desc: "Printed fight night program. Cover spread with tale-of-the-tape, gold brackets, full-bleed feature photo, editorial pull quotes, double-ruled scorecard.",
  },
];

export default function VariantsIndex() {
  const originals = variants.filter((v) => v.group === "Original");
  const hybrids = variants.filter((v) => v.group !== "Original");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-5 py-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16 text-center">
          <div className="text-[10px] font-mono tracking-[4px] uppercase text-white/40 mb-4">
            Design Shotgun · 8 Directions · 2 Rounds
          </div>
          <h1 className="text-[48px] sm:text-[64px] font-black tracking-tight leading-[0.95]">
            Pick a direction.
          </h1>
          <p className="text-[15px] text-white/50 mt-4 max-w-[520px] mx-auto">
            Same content, eight aesthetics. Round 1 = four originals. Round 2 =
            four Paper × Fight Card hybrids.
          </p>
        </div>

        <div className="text-[10px] font-mono tracking-[3px] uppercase text-white/40 mb-4">
          · Round 1 · Originals ·
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {originals.map((v) => (
            <VariantCard key={v.slug} v={v} />
          ))}
        </div>

        <div className="text-[10px] font-mono tracking-[3px] uppercase text-[#c9a227] mb-4">
          · Round 2 · Paper × Fight Card Hybrids ·
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hybrids.map((v) => (
            <VariantCard key={v.slug} v={v} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-[10px] font-mono tracking-[3px] uppercase text-white/40 hover:text-white/80 transition-colors"
          >
            ← Back to current design
          </Link>
        </div>
      </div>
    </div>
  );
}

function VariantCard({ v }: { v: (typeof variants)[number] }) {
  return (
    <Link
      href={`/variants/${v.slug}`}
      className="group block p-8 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] uppercase text-white/40 mb-2">
            Variant {v.letter}
          </div>
          <h2 className="text-[32px] font-black tracking-tight leading-none">
            {v.name}
          </h2>
          <div className="text-[12px] text-white/60 mt-1 font-mono">
            {v.tagline}
          </div>
        </div>
        <div className="flex gap-1.5">
          {v.palette.map((c) => (
            <div
              key={c}
              className="w-5 h-5 rounded-full border border-white/20"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <p className="text-[13px] text-white/60 leading-relaxed mb-6">
        {v.desc}
      </p>

      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="text-[10px] font-mono tracking-[2px] uppercase text-white/40">
          {v.font}
        </div>
        <div className="text-[11px] font-mono tracking-[2px] uppercase text-white/60 group-hover:text-white transition-colors">
          View →
        </div>
      </div>
    </Link>
  );
}
