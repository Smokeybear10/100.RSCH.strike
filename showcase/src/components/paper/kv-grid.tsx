import { ReactNode } from "react";

export type KvItem = {
  k: string;
  v: ReactNode;
  sub?: ReactNode;
  /** Render value in red (used for headline metric). */
  emphasize?: boolean;
};

export function KvGrid({ items }: { items: KvItem[] }) {
  const cols =
    items.length === 4
      ? "md:grid-cols-4"
      : items.length === 3
        ? "md:grid-cols-3"
        : items.length === 2
          ? "md:grid-cols-2"
          : "md:grid-cols-1";

  return (
    <div className={`my-7 grid border border-rule ${cols}`}>
      {items.map((item, i) => (
        <div
          key={item.k}
          className={`p-5 ${
            i < items.length - 1
              ? "border-b border-rule md:border-b-0 md:border-r"
              : ""
          }`}
        >
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {item.k}
          </div>
          <div
            className={`font-serif text-[28px] leading-none ${
              item.emphasize ? "text-red-600" : "text-ink"
            }`}
          >
            {item.v}
          </div>
          {item.sub && (
            <div className="mt-1 font-serif text-xs italic text-ink-dim">
              {item.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
