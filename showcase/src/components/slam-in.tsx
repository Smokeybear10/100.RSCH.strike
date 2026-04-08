"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "slam" | "stamp" | "sweep" | "sweep-right" | "clip-reveal";

type Props = {
  children: React.ReactNode;
  delay?: number;
  variant?: Variant;
  className?: string;
  threshold?: number;
  as?: "div" | "span" | "section";
};

export function SlamIn({
  children,
  delay = 0,
  variant = "slam",
  className = "",
  threshold = 0.3,
  as = "div",
}: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const animClass = visible
    ? {
        slam: "animate-slam-in",
        stamp: "animate-stamp-in",
        sweep: "animate-sweep-in",
        "sweep-right": "animate-sweep-right",
        "clip-reveal": "animate-clip-reveal",
      }[variant]
    : "opacity-0";

  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${animClass} ${className}`}
      style={{
        animationDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </Tag>
  );
}
