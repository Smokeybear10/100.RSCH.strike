import { ReactNode } from "react";

export type FailItem = {
  title: string;
  where: string;
  conf: string;
  why: ReactNode;
};

export function FailGrid({ items }: { items: FailItem[] }) {
  return (
    <div className="my-6 grid border border-rule md:grid-cols-3">
      {items.map((f, i) => (
        <div
          key={f.title}
          className={`flex flex-col gap-2.5 p-5 ${
            i < items.length - 1
              ? "border-b border-rule md:border-b-0 md:border-r"
              : ""
          }`}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {f.where}
          </div>
          <h4 className="m-0 font-serif text-lg font-normal leading-tight text-ink">
            {f.title}
          </h4>
          <span className="self-start bg-red-600/10 px-2 py-0.5 font-mono text-[11px] tracking-[0.08em] text-red-600">
            P(strike) = {f.conf}
          </span>
          <p className="m-0 font-serif text-[13px] leading-[1.5] text-ink-mute">
            {f.why}
          </p>
        </div>
      ))}
    </div>
  );
}
