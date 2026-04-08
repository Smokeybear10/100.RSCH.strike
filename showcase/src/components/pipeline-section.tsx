import { Reveal } from "./reveal";

const steps = [
  {
    step: "01",
    name: "SAM2",
    desc: "Segment Anything Model generates precise masks for fighters in each frame.",
    detail: "Meta · 2024",
  },
  {
    step: "02",
    name: "Label Studio",
    desc: "38 five-frame moments annotated as strike or neutral by hand.",
    detail: "Manual · 38 samples",
  },
  {
    step: "03",
    name: "TSN",
    desc: "Temporal Segment Network classifies actions via transfer learning.",
    detail: "Pretrained on Kinetics-400",
  },
];

export function PipelineSection() {
  return (
    <section className="max-w-[960px] mx-auto px-5 py-28">
      <div className="mb-14">
        <Reveal delay={0}>
          <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-3">
            How It Works
          </span>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="text-[36px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
            From raw footage
            <br />
            to detection.
          </h2>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <Reveal key={step.name} delay={300 + i * 150}>
            <div className="group relative p-6 border border-border rounded-md bg-surface/50 hover:bg-surface hover:border-border-bright transition-all h-full">
              <div className="text-[11px] font-mono text-dimmer tracking-[2px] mb-4">
                {step.step}
              </div>
              <div className="text-lg font-bold text-white mb-2">{step.name}</div>
              <div className="text-[13px] text-muted leading-relaxed mb-4">
                {step.desc}
              </div>
              <div className="text-[9px] font-mono text-dim tracking-[2px] uppercase pt-4 border-t border-border">
                {step.detail}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
