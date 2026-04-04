import { HeroPlayer } from "@/components/hero-player";
import { CounterSection } from "@/components/counter-section";
import { StorySection } from "@/components/story-section";
import { UploadSection } from "@/components/upload-section";
import { Reveal } from "@/components/reveal";
import { demoClips } from "@/lib/demo-data";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/Smokeybear10" },
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "Website", href: "#" },
];

export default function Home() {
  return (
    <main className="relative z-10">
      {/* Hero — exactly one viewport */}
      <section className="relative h-[100svh] flex flex-col items-center justify-center px-5 py-6 overflow-hidden">
        <div className="fade-up mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/50 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-strike-red animate-pulse" />
          <span className="text-[10px] font-mono tracking-[2px] text-muted uppercase">
            TSN · Kinetics-400 · 38 samples
          </span>
        </div>

        <h1 className="fade-up fade-up-delay-1 text-[56px] sm:text-[80px] font-black tracking-[8px] text-white leading-none">
          STR<span className="text-strike-red">1</span>KE
        </h1>
        <p className="fade-up fade-up-delay-2 text-[11px] text-dim tracking-[4px] uppercase mt-2 mb-6">
          AI-Powered Strike Detection
        </p>

        <div className="fade-up fade-up-delay-3 w-full max-w-[820px]">
          <HeroPlayer clips={demoClips} />
        </div>

        {/* Scroll indicator */}
        <div className="fade-up fade-up-delay-3 absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-[9px] text-dim font-mono tracking-[3px] uppercase">
            Scroll
          </span>
          <svg
            width="10"
            height="14"
            viewBox="0 0 10 14"
            fill="none"
            className="text-dim animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <path d="M5 1v12M1 9l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      </section>

      {/* 38 Training Moments */}
      <CounterSection />

      {/* Scroll-driven story */}
      <StorySection />

      {/* Upload Demo */}
      <UploadSection />

      {/* Footer */}
      <footer className="border-t border-border/50 py-20 px-5">
        <div className="max-w-[960px] mx-auto">
          <Reveal delay={0}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-[28px] font-black tracking-[6px] text-white">
                STR<span className="text-strike-red">1</span>KE
              </div>
              <div className="text-[10px] text-dim tracking-[3px] uppercase font-mono">
                by Thomas Ou
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 flex items-center justify-center gap-8">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted tracking-[2px] uppercase font-mono hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </footer>
    </main>
  );
}
