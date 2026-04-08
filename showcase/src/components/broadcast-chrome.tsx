"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const tickerItems = [
  "N_STRIKES = 19",
  "N_NEUTRAL = 19",
  "WINDOW = 5 FRAMES",
  "FPS = 30",
  "DURATION = 150 MS",
  "BASELINE = KINETICS-400",
  "BACKBONE = TSN",
  "MASK = SAM2",
  "TRAINED IN < 60 S",
  "ONE WEEKEND · ONE BROADCAST",
];

export function BroadcastChrome() {
  const chromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;

    gsap.set(el, { y: "-100%", opacity: 0 });

    const show = () =>
      gsap.to(el, { y: "0%", opacity: 1, duration: 0.5, ease: "power2.out" });
    const hide = () =>
      gsap.to(el, { y: "-100%", opacity: 0, duration: 0.4, ease: "power2.in" });

    const weighIn = document.getElementById("weigh-in");
    const theCall = document.getElementById("the-call");
    const footer = document.getElementById("footer");

    const triggers: ScrollTrigger[] = [];

    if (weighIn) {
      triggers.push(
        ScrollTrigger.create({
          trigger: weighIn,
          start: "top top",
          onEnter: show,
          onLeaveBack: hide,
        })
      );
    }

    if (theCall) {
      triggers.push(
        ScrollTrigger.create({
          trigger: theCall,
          start: "top top",
          onEnter: hide,
          onLeaveBack: show,
        })
      );
    }

    if (footer) {
      triggers.push(
        ScrollTrigger.create({
          trigger: footer,
          start: "top bottom",
          onEnter: show,
          onLeaveBack: hide,
        })
      );
    }

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div
      ref={chromeRef}
      className="fixed top-0 inset-x-0 z-50 bg-black border-b-[3px] border-[#dc2626] shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
    >
      <div className="flex items-center justify-between px-5 py-2 bg-gradient-to-r from-[#dc2626] via-[#dc2626]/70 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white live-dot" />
            <span className="text-[10px] font-black tracking-[4px] uppercase text-white font-[family-name:var(--font-oswald)]">
              LIVE
            </span>
          </div>
          <span className="text-[9px] text-white/60 font-mono">●</span>
          <span className="text-[10px] font-black tracking-[3px] uppercase text-white/95 font-[family-name:var(--font-oswald)]">
            STR1KE Main Card
          </span>
          <span className="hidden sm:inline text-[9px] text-white/60 font-mono">
            ●
          </span>
          <span className="hidden sm:inline text-[9px] font-mono tracking-[2px] uppercase text-white/75">
            04 · 04 · 2025
          </span>
          <span className="hidden md:inline text-[9px] text-white/60 font-mono">●</span>
          <span className="hidden md:inline text-[9px] font-mono tracking-[2px] uppercase text-white/75">
            Thomas Ou
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] font-mono tracking-[2px] text-white/85">
          TSN · KINETICS-400 · 38 SAMPLES
        </div>
      </div>
      <div className="overflow-hidden bg-[#0a0000] border-t border-[#dc2626]/60">
        <div className="flex gap-10 py-1.5 text-[10px] font-mono tracking-[2px] uppercase text-[#f59e0b] whitespace-nowrap animate-ticker w-max">
          {Array.from({ length: 3 }).map((_, rep) => (
            <span key={rep} className="flex gap-10 shrink-0">
              {tickerItems.map((item, i) => (
                <span key={i} className="flex items-center gap-10 shrink-0">
                  <span>{item}</span>
                  <span className="text-white/50">//</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
