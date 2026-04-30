import Link from "next/link";

type TickerLink = { href: string; label: string };

const DEFAULT_LINKS: TickerLink[] = [
  { href: "/#abstract", label: "Research" },
  { href: "/demo", label: "Demo" },
  { href: "/workspace", label: "Workspace" },
];

export function Ticker({ links = DEFAULT_LINKS, active }: { links?: TickerLink[]; active?: string }) {
  return (
    <header className="sticky top-0 z-50 flex min-h-16 flex-wrap items-center justify-between gap-x-6 border-b border-rule bg-paper px-4 sm:px-8" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <Link href="/" className="py-3 text-lg font-semibold tracking-tight text-ink">Strike</Link>
      <nav aria-label="Main navigation" className="flex items-center gap-4 sm:gap-7">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={active === l.href ? "page" : undefined}
            className="flex min-h-16 items-center border-b-2 border-transparent text-[13px] text-ink-mute hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink sm:text-sm">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
