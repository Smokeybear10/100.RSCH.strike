"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const variants = [
  { slug: "a", label: "Fight" },
  { slug: "d", label: "Cine" },
  { slug: "e", label: "Paper" },
  { slug: "g", label: "HUD" },
  { slug: "h", label: "Scout" },
  { slug: "i", label: "Broad" },
  { slug: "j", label: "Brief" },
  { slug: "k", label: "Prog" },
  { slug: "l", label: "Edit" },
];

type Props = {
  tone?: "dark" | "light";
};

export function VariantNav({ tone = "dark" }: Props) {
  const pathname = usePathname();
  const activeSlug = pathname?.split("/").pop();

  const isDark = tone === "dark";
  const wrapper = isDark
    ? "bg-black/80 border-white/10 text-white"
    : "bg-white/90 border-black/10 text-black";
  const activeCls = isDark
    ? "bg-white text-black"
    : "bg-black text-white";
  const inactiveCls = isDark
    ? "text-white/60 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className={`inline-flex items-center gap-0.5 rounded-full border px-1 py-1 backdrop-blur-md ${wrapper}`}
      >
        <Link
          href="/variants"
          className={`text-[9px] font-mono tracking-[1.5px] uppercase px-2 py-1 rounded-full ${inactiveCls}`}
        >
          All
        </Link>
        <span className={isDark ? "text-white/20" : "text-black/20"}>·</span>
        {variants.map((v) => {
          const active = activeSlug === v.slug;
          return (
            <Link
              key={v.slug}
              href={`/variants/${v.slug}`}
              className={`text-[9px] font-mono tracking-[1.5px] uppercase px-2 py-1 rounded-full transition-colors ${
                active ? activeCls : inactiveCls
              }`}
            >
              {v.slug.toUpperCase()}·{v.label}
            </Link>
          );
        })}
        <span className={isDark ? "text-white/20" : "text-black/20"}>·</span>
        <Link
          href="/"
          className={`text-[9px] font-mono tracking-[1.5px] uppercase px-2 py-1 rounded-full ${inactiveCls}`}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
