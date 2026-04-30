import { ReactNode } from "react";

export function Abstract({ children }: { children: ReactNode }) {
  return (
    <section
      id="abstract"
      className="research-prose border-b border-rule py-14"
    >
      <h2 className="m-0 mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-red-600">
        Abstract
      </h2>
      <div className="max-w-[760px] font-serif text-[19px] leading-[1.6] text-ink">
        {children}
      </div>
    </section>
  );
}
