import { ReactNode } from "react";

type RailItem = { heading: string; body: ReactNode };

type SectionProps = {
  id?: string;
  /** e.g. "§ 02 · Problem" */
  number: string;
  rail?: RailItem[];
  children: ReactNode;
  /** Figures, grids, tables that render full-width below the rail+body block. */
  extras?: ReactNode;
  /** Drop the bottom rule (use for the final section). */
  last?: boolean;
};

export function Section({
  id,
  number,
  rail,
  children,
  extras,
  last,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-22 ${last ? "" : "border-b border-rule"}`}
    >
      <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-red-600">
        {number}
      </div>
      <div className="grid max-w-[920px] gap-14 md:grid-cols-[200px_1fr]">
        {rail && rail.length > 0 ? (
          <aside className="font-mono text-[11px] leading-[1.7] tracking-[0.06em] text-ink-dim">
            {rail.map((r) => (
              <div key={r.heading} className="mb-3.5 last:mb-0">
                <div className="mb-2 uppercase tracking-[0.16em] text-ink-faint">
                  {r.heading}
                </div>
                <p className="m-0">{r.body}</p>
              </div>
            ))}
          </aside>
        ) : (
          <div aria-hidden />
        )}
        <div className="research-prose max-w-[660px] font-serif">
          {children}
        </div>
      </div>
      {extras}
    </section>
  );
}
