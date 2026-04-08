import { Reveal } from "./reveal";

const failures = [
  {
    type: "FALSE POSITIVE",
    title: "Clinch Misread",
    desc: "Clinch position misread as an active strike. The close body contact triggers the model's strike signature.",
  },
  {
    type: "FALSE NEGATIVE",
    title: "Fast Jab Missed",
    desc: "Quick jab at close range. The strike happens across only 2 frames, below the model's 5-frame temporal window.",
  },
];

export function FailuresSection() {
  return (
    <section className="max-w-[960px] mx-auto px-5 py-28">
      <div className="mb-12">
        <Reveal delay={0}>
          <span className="text-[10px] text-strike-red uppercase tracking-[4px] font-mono block mb-3">
            Transparency
          </span>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="text-[36px] sm:text-[44px] font-black text-white tracking-tight leading-tight mb-4">
            Where it breaks.
          </h2>
        </Reveal>
        <Reveal delay={300}>
          <p className="text-[15px] text-muted max-w-[540px] leading-relaxed">
            No model is perfect, especially on 38 data points. These are real
            failure cases, shown on purpose.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {failures.map((f, i) => (
          <Reveal key={f.type} delay={450 + i * 150}>
            <div className="bg-surface/50 border border-border rounded-md overflow-hidden hover:border-border-bright transition-colors h-full">
              <div className="aspect-video bg-black flex items-center justify-center relative border-b border-border">
                <span className="text-dimmer text-[11px] italic font-mono">
                  {f.title.toLowerCase()} clip
                </span>
                <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 text-[9px] font-black tracking-[2px] rounded-sm">
                  {f.type}
                </div>
                <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-white/20" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-white/20" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-white/20" />
              </div>
              <div className="p-4">
                <div className="text-sm font-bold text-white mb-2">
                  {f.title}
                </div>
                <div className="text-[13px] text-muted leading-relaxed">
                  {f.desc}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
