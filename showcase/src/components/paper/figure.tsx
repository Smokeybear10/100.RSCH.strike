import { ReactNode } from "react";

type FigureProps = {
  /** e.g. "FIG 01" */
  number: string;
  title: ReactNode;
  /** Right-aligned slug (e.g. "stage 01", "n=38 · Colab T4"). */
  scale?: ReactNode;
  children: ReactNode;
  caption: ReactNode;
};

export function Figure({ number, title, scale, children, caption }: FigureProps) {
  return (
    <figure className="my-9 border border-rule bg-paper-2 p-6">
      <header className="mb-3.5 flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
        <span>
          <span className="text-red-600">{number}</span> · {title}
        </span>
        {scale && <span>{scale}</span>}
      </header>
      <div>{children}</div>
      <figcaption className="mt-4 border-t border-rule pt-3.5 font-serif text-[13px] italic leading-[1.5] text-ink-dim">
        {caption}
      </figcaption>
    </figure>
  );
}
