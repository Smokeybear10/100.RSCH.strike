"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./reveal";

export function CounterSection() {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const target = 38;
          const duration = 1800;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={ref}
      className="relative text-center py-32 px-5"
    >
      <Reveal delay={0}>
        <span className="text-[10px] text-dim uppercase tracking-[4px] font-mono block mb-8">
          The Constraint
        </span>
      </Reveal>

      <Reveal delay={150}>
        <div className="relative inline-block">
          <div className="text-[180px] sm:text-[240px] font-black leading-none text-strike-red tabular-nums">
            {count}
          </div>
          <div className="absolute inset-0 text-[180px] sm:text-[240px] font-black leading-none text-strike-red/20 blur-2xl tabular-nums pointer-events-none">
            {count}
          </div>
        </div>
      </Reveal>

      <Reveal delay={300}>
        <div className="text-sm text-muted tracking-[6px] uppercase mt-4 font-mono">
          Training Moments
        </div>
      </Reveal>

      <Reveal delay={450}>
        <p className="text-[17px] sm:text-[19px] text-muted max-w-[560px] mx-auto mt-10 leading-relaxed">
          Most ML models need thousands of labeled examples. STR1KE was trained
          on just 38 five-frame moments, using SAM2 for segmentation and
          transfer learning to punch above its weight.
        </p>
      </Reveal>

      <Reveal delay={600}>
        <div className="mt-12 flex items-center justify-center gap-8 text-[10px] font-mono text-dim tracking-[2px] uppercase">
          <span>
            <span className="text-strike-red font-bold">19</span> Strike
          </span>
          <span className="text-dimmer">·</span>
          <span>
            <span className="text-muted font-bold">19</span> Neutral
          </span>
          <span className="text-dimmer">·</span>
          <span>
            <span className="text-muted font-bold">190</span> Total Frames
          </span>
        </div>
      </Reveal>
    </section>
  );
}
