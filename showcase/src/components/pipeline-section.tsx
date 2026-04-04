const steps = [
  {
    name: "SAM2",
    desc: "Segment Anything Model generates precise masks for fighters in each frame",
  },
  {
    name: "Label Studio",
    desc: "38 five-frame moments annotated with strike or neutral classifications",
  },
  {
    name: "TSN",
    desc: "Temporal Segment Network classifies actions via transfer learning from Kinetics-400",
  },
];

export function PipelineSection() {
  return (
    <section className="max-w-[900px] mx-auto px-5 py-20">
      <span className="text-[11px] text-strike-red uppercase tracking-[3px] block mb-3">
        How It Works
      </span>
      <h2 className="text-[32px] font-bold text-white mb-10">
        From Raw Footage to Detection
      </h2>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {steps.map((step, i) => (
          <div key={step.name} className="contents">
            <div className="w-[220px] p-5 border border-border rounded bg-surface text-center">
              <div className="text-sm font-semibold text-white mb-1">
                {step.name}
              </div>
              <div className="text-[11px] text-dim leading-relaxed">
                {step.desc}
              </div>
            </div>
            {i < steps.length - 1 && (
              <span className="text-xl text-border hidden sm:block">&rarr;</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
