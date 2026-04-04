"use client";

import { useEffect, useRef, useState } from "react";

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
          let frame = 0;
          const target = 38;
          const duration = 1500;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={ref}
      className="text-center py-24 border-t border-white/5"
    >
      <div className="text-[120px] font-extrabold leading-none text-strike-red">
        {count}
      </div>
      <div className="text-sm text-dim tracking-[4px] uppercase mt-2">
        Training Moments
      </div>
      <p className="text-[15px] text-muted max-w-[500px] mx-auto mt-6 leading-relaxed">
        Most ML models need thousands of labeled examples. STR1KE was trained on
        just 38 five-frame moments, using SAM2 for segmentation and transfer
        learning to punch above its weight.
      </p>
    </section>
  );
}
