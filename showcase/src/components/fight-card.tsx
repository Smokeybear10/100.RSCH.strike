"use client";

import { SlamIn } from "./slam-in";

type Props = {
  bout: string;
  title: string;
  subtitle: string;
  label?: string;
};

export function FightCard({
  bout,
  title,
  subtitle,
  label = "Main Card",
}: Props) {
  return (
    <section className="relative bg-black overflow-hidden">
      <div className="h-[3px] bg-[#dc2626]" />

      <div className="py-16 sm:py-24 px-5">
        {/* Watermark bout number */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[280px] sm:text-[400px] font-black text-white/[0.015] leading-none pointer-events-none select-none font-[family-name:var(--font-anton)]">
          {bout}
        </div>

        {/* Diagonal slash accent */}
        <div className="absolute top-0 right-0 w-[35%] h-full bg-gradient-to-l from-[#dc2626]/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-[700px] mx-auto relative">
          <div className="relative border border-white/10 px-8 sm:px-14 py-10 sm:py-14">
            {/* Corner marks */}
            <div className="absolute -top-px -left-px w-6 h-6 border-l-[3px] border-t-[3px] border-[#f59e0b]" />
            <div className="absolute -top-px -right-px w-6 h-6 border-r-[3px] border-t-[3px] border-[#f59e0b]" />
            <div className="absolute -bottom-px -left-px w-6 h-6 border-l-[3px] border-b-[3px] border-[#f59e0b]" />
            <div className="absolute -bottom-px -right-px w-6 h-6 border-r-[3px] border-b-[3px] border-[#f59e0b]" />

            <div className="text-center">
              {/* Event label */}
              <SlamIn variant="sweep" delay={0}>
                <div className="text-[9px] font-black tracking-[6px] uppercase text-[#f59e0b] mb-6 font-[family-name:var(--font-oswald)]">
                  ● {label} ●
                </div>
              </SlamIn>

              {/* Top divider */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-[2px] bg-[#dc2626]" />
                <div className="w-2 h-2 rotate-45 bg-[#dc2626]" />
                <div className="w-16 h-[2px] bg-[#dc2626]" />
              </div>

              {/* Title */}
              <SlamIn variant="slam" delay={100}>
                <h2 className="text-[48px] sm:text-[80px] font-black tracking-[6px] uppercase text-white leading-[0.85] font-[family-name:var(--font-anton)]">
                  {title}
                </h2>
              </SlamIn>

              {/* Bottom divider */}
              <div className="flex items-center justify-center gap-3 mt-6 mb-6">
                <div className="w-16 h-[2px] bg-[#dc2626]" />
                <div className="w-2 h-2 rotate-45 bg-[#dc2626]" />
                <div className="w-16 h-[2px] bg-[#dc2626]" />
              </div>

              {/* Subtitle */}
              <SlamIn variant="sweep" delay={250}>
                <div className="text-[11px] sm:text-[13px] font-black tracking-[5px] uppercase text-white/40 font-[family-name:var(--font-oswald)]">
                  {subtitle}
                </div>
              </SlamIn>

              {/* Bout number */}
              <SlamIn variant="stamp" delay={350}>
                <div className="mt-8 inline-flex items-center gap-3">
                  <div className="w-8 h-px bg-white/20" />
                  <div className="text-[10px] font-black tracking-[4px] uppercase text-white/25 font-[family-name:var(--font-oswald)]">
                    Bout {bout}
                  </div>
                  <div className="w-8 h-px bg-white/20" />
                </div>
              </SlamIn>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[3px] bg-[#dc2626]" />
    </section>
  );
}
