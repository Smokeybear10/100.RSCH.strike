import Link from "next/link";

type TickerLink = { href: string; label: string };
type TickerProps = {
  links?: TickerLink[];
  active?: string;
  onNavigate?: (event: { preventDefault: () => void }) => void;
};

const DEFAULT_LINKS: TickerLink[] = [
  { href: "/workspace", label: "Workspace" },
  { href: "/demo", label: "Demo" },
];

export function Ticker({ links = DEFAULT_LINKS, active, onNavigate }: TickerProps) {
  return (
    <header className="sticky top-0 z-50 flex min-h-16 flex-wrap items-center justify-between gap-x-6 border-b border-rule bg-paper px-4 leading-normal sm:px-8" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <Link href="/workspace" onNavigate={active === "/workspace" ? undefined : onNavigate} className="py-3 text-lg font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">Strike</Link>
      <nav aria-label="Main navigation" className="flex items-center gap-4 sm:gap-7">
        {links.map((l) => (
          <Link key={l.href} href={l.href} onNavigate={active === l.href ? undefined : onNavigate} aria-current={active === l.href ? "page" : undefined}
            className="flex min-h-16 items-center border-b-2 border-transparent text-[13px] text-ink-mute hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ink aria-[current=page]:border-ink aria-[current=page]:text-ink sm:text-sm">
            {l.label}
          </Link>
        ))}
        <a href="https://github.com/Smokeybear10/100.RSCH.strike/blob/main/model/notebooks/Research_Notes.ipynb" target="_blank" rel="noreferrer" aria-label="Research notebook on GitHub (opens a new tab)"
          className="flex min-h-16 items-center border-b-2 border-transparent text-[13px] text-ink-mute hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ink sm:text-sm">
          Notebook
        </a>
      </nav>
    </header>
  );
}
