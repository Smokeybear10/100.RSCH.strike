import type { Metadata } from "next";
import { Ticker } from "@/components/paper/ticker";
import { RecordedDemoPlayer } from "@/components/paper/recorded-demo-player";

export const metadata: Metadata = {
  title: "Strike — Demo",
  description: "Inspect recorded outputs from Strike's appearance baseline alongside the source frames.",
};

export default function DemoPage() {
  return (
    <>
      <Ticker active="/demo" />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[1040px] px-4 pb-12 pt-6 sm:px-8 sm:pt-8" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Demo</h1>
          <p className="text-sm text-ink-mute">Inspect recorded outputs from the appearance baseline.</p>
        </div>
        <RecordedDemoPlayer />
      </main>
    </>
  );
}
