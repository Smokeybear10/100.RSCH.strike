"use client";

import { useEffect, useRef, useState } from "react";

export function FCCounter() {
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
          const duration = 2000;
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
      { threshold: 0.45 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div ref={ref} className="relative text-center">
      {/* Diagonal banner */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-[#dc2626] skew-y-[-3deg] flex items-center justify-center shadow-[0_4px_0_0_#991b1b]">
        <span className="text-[13px] font-black tracking-[8px] uppercase text-white font-[family-name:var(--font-oswald)] skew-y-[3deg]">
          ▸ Official Weigh-In ▸
        </span>
      </div>

      <div className="relative pt-28 flex flex-col items-center">
        {/* Scoreboard frame */}
        <div className="relative border-[6px] border-[#f59e0b] bg-black px-12 sm:px-16 py-10 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
          {/* Corner markers */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-[#f59e0b]" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#f59e0b]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-[#f59e0b]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#f59e0b]" />

          {/* "UNDERWEIGHT" stamp — corner */}
          <div className="absolute -top-6 -right-8 rotate-[12deg] border-[3px] border-[#f59e0b] px-3 py-1 bg-black z-10">
            <div className="text-[9px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)] leading-none">
              Underweight
            </div>
            <div className="text-[7px] font-mono tracking-[1px] uppercase text-[#f59e0b]/70 mt-0.5">
              by 99.99%
            </div>
          </div>

          <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-3 font-[family-name:var(--font-oswald)]">
            ● Weigh-In Results ●
          </div>
          <div className="text-[200px] sm:text-[280px] font-black leading-[0.8] text-[#dc2626] tabular-nums font-[family-name:var(--font-anton)] drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]">
            {count}
          </div>
          <div className="text-[14px] font-black tracking-[6px] uppercase text-white mt-4 font-[family-name:var(--font-oswald)]">
            Training Moments
          </div>
        </div>

        {/* Scorecard breakdown */}
        <div className="mt-10 flex items-center border-2 border-[#dc2626] bg-black">
          <div className="px-6 sm:px-10 py-4 border-r border-[#dc2626]">
            <div className="text-[8px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              Strike
            </div>
            <div className="text-[36px] font-black text-[#dc2626] leading-none font-[family-name:var(--font-anton)]">
              19
            </div>
          </div>
          <div className="px-6 sm:px-10 py-4 border-r border-[#dc2626]">
            <div className="text-[8px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              Neutral
            </div>
            <div className="text-[36px] font-black text-white leading-none font-[family-name:var(--font-anton)]">
              19
            </div>
          </div>
          <div className="px-6 sm:px-10 py-4">
            <div className="text-[8px] font-black tracking-[3px] uppercase text-[#f59e0b] font-[family-name:var(--font-oswald)]">
              Frames
            </div>
            <div className="text-[36px] font-black text-[#f59e0b] leading-none font-[family-name:var(--font-anton)]">
              190
            </div>
          </div>
        </div>

        <p className="text-[14px] text-white/70 max-w-[560px] mt-10 leading-relaxed font-[family-name:var(--font-barlow)] tracking-wide">
          Most models need thousands of labels. <span className="text-[#dc2626] font-bold">STR1KE</span> got trained on{" "}
          <span className="text-[#f59e0b] font-bold">38 five-frame moments</span>. Transfer learning
          from Kinetics-400 + SAM2 fighter isolation. A weekend of Label Studio.
        </p>
      </div>
    </div>
  );
}
