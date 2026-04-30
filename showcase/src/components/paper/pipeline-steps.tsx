import { ReactNode } from "react";

export type PipelineStep = {
  number: string;
  title: string;
  role: string;
  description: ReactNode;
  meta: { label: string; value: ReactNode }[];
};

export function PipelineSteps({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="my-9 grid border border-rule md:grid-cols-3">
      {steps.map((s, i) => (
        <div
          key={s.number}
          className={`flex flex-col gap-3 p-7 ${
            i < steps.length - 1
              ? "border-b border-rule md:border-b-0 md:border-r"
              : ""
          }`}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-600">
            {s.number}
          </div>
          <h3 className="m-0 font-serif text-2xl font-normal leading-tight tracking-[-0.01em] text-ink">
            {s.title}
          </h3>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            {s.role}
          </div>
          <p className="m-0 font-serif text-sm leading-[1.55] text-ink-mute">
            {s.description}
          </p>
          <dl className="mt-auto grid gap-1 border-t border-rule pt-3.5 font-mono text-[11px]">
            {s.meta.map((m) => (
              <div key={m.label} className="grid grid-cols-[1fr_2fr] gap-2">
                <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                  {m.label}
                </dt>
                <dd className="m-0 text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
