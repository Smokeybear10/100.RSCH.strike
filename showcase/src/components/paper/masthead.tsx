import { ReactNode } from "react";

type MetaItem = { label: string; value: ReactNode };

type MastheadProps = {
  eyebrow?: string;
  /** Headline. Wrap red italic phrases with <em>. */
  title: ReactNode;
  deck: ReactNode;
  meta: MetaItem[];
};

export function Masthead({
  eyebrow = "Technical report · 2026",
  title,
  deck,
  meta,
}: MastheadProps) {
  return (
    <header className="border-b border-rule pb-16 pt-20">
      <div className="mb-7 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-red-600">
        <span aria-hidden className="inline-block h-px w-4 bg-red-600" />
        {eyebrow}
      </div>
      <h1 className="m-0 max-w-[920px] font-serif text-[clamp(40px,6vw,76px)] font-normal leading-[1.04] tracking-[-0.02em] text-ink [&_em]:italic [&_em]:text-red-600">
        {title}
      </h1>
      <p className="mt-6 max-w-[660px] font-serif text-[19px] leading-[1.5] text-ink-mute">
        {deck}
      </p>
      <dl className="mt-9 flex flex-wrap gap-9 border-t border-rule pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-dim">
        {meta.map((m) => (
          <div key={m.label}>
            <dt className="mb-1 font-normal text-ink-faint">{m.label}</dt>
            <dd className="m-0">{m.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
