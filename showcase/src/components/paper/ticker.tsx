"use client";

import { useEffect, useState } from "react";

type TickerLink = { href: string; label: string };

const DEFAULT_LINKS: TickerLink[] = [
  { href: "#pipeline", label: "pipeline" },
  { href: "#results", label: "results" },
  { href: "#demo", label: "demo" },
  { href: "#try", label: "try" },
];

export function Ticker({ links = DEFAULT_LINKS }: { links?: TickerLink[] }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-50 flex items-center gap-6 border-b border-rule bg-paper px-8 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim">
      <span className="flex items-center gap-2">
        <span className="paper-pulse inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
        STR1KE
      </span>
      <span className="text-ink-faint">·</span>
      <span className="hidden sm:inline">tsn · resnet-50 · k400 → mma</span>
      <span className="hidden sm:inline text-ink-faint">·</span>
      <span className="hidden md:inline">n=38 · acc 0.83</span>
      <span className="ml-auto flex items-center gap-[18px]">
        <span className="tnum">{time}</span>
        {links.map((l) => (
          <a key={l.href} href={l.href} className="hover:text-red-600">
            {l.label}
          </a>
        ))}
      </span>
    </div>
  );
}
