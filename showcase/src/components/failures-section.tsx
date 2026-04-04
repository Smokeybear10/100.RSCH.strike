const failures = [
  {
    type: "FALSE POSITIVE",
    title: "Clinch Misread",
    desc: "Clinch position misread as an active strike. The close body contact triggers the model's strike signature.",
    badgeColor: "bg-yellow-500",
  },
  {
    type: "FALSE NEGATIVE",
    title: "Fast Jab Missed",
    desc: "Quick jab at close range. The strike happens across only 2 frames, below the model's 5-frame temporal window.",
    badgeColor: "bg-yellow-500",
  },
];

export function FailuresSection() {
  return (
    <section className="max-w-[900px] mx-auto px-5 py-20">
      <span className="text-[11px] text-strike-red uppercase tracking-[3px] block mb-3">
        Transparency
      </span>
      <h2 className="text-[32px] font-bold text-white mb-3">
        Where It Breaks
      </h2>
      <p className="text-[15px] text-muted mb-6">
        No model is perfect, especially on 38 data points. These are real
        failure cases.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {failures.map((f) => (
          <div
            key={f.type}
            className="bg-surface border border-border rounded overflow-hidden"
          >
            <div className="aspect-video bg-background flex items-center justify-center relative">
              <span className="text-dim text-xs italic">
                [ {f.title.toLowerCase()} clip ]
              </span>
              <span
                className={`absolute top-2 left-2 ${f.badgeColor} text-black px-2 py-0.5 text-[10px] font-bold tracking-[1px] rounded-sm`}
              >
                {f.type}
              </span>
            </div>
            <div className="p-3 text-xs text-muted leading-relaxed">
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
