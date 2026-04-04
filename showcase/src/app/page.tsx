import { HeroPlayer } from "@/components/hero-player";
import { CounterSection } from "@/components/counter-section";
import { PipelineSection } from "@/components/pipeline-section";
import { FailuresSection } from "@/components/failures-section";
import { UploadSection } from "@/components/upload-section";
import { demoClips } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
        <h1 className="text-[64px] font-extrabold tracking-[8px] text-white mb-2">
          STR1KE
        </h1>
        <p className="text-base text-muted tracking-[3px] uppercase mb-12">
          AI-Powered Strike Detection
        </p>
        <HeroPlayer clips={demoClips} />
      </section>

      {/* 38 Training Moments */}
      <CounterSection />

      {/* Pipeline */}
      <PipelineSection />

      {/* Failures */}
      <FailuresSection />

      {/* Upload Demo */}
      <UploadSection />

      {/* Footer */}
      <footer className="text-center py-12 border-t border-white/5">
        <p className="text-[11px] text-dim/40 tracking-wide">
          Built by Thomas Ou &middot; SAM2 + TSN &middot; 38 training moments
        </p>
      </footer>
    </main>
  );
}
