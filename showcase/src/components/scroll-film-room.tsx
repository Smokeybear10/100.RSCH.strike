"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FilmRoom } from "./film-room";
import { demoClips } from "@/lib/demo-data";

gsap.registerPlugin(ScrollTrigger);

export function ScrollFilmRoom() {
  const containerRef = useRef<HTMLElement>(null);
  const [clipIdx, setClipIdx] = useState(0);
  const [clipProgress, setClipProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      // Weighted clip ranges: Knockdown 25%, Exchange 25%, Pressure 50%
      const clipRanges = [0, 0.25, 0.50, 1.0];

      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            let idx = 0;
            for (let i = 0; i < clipRanges.length - 1; i++) {
              if (p >= clipRanges[i]) idx = i;
            }
            idx = Math.min(demoClips.length - 1, idx);
            setClipIdx(idx);
            const rangeStart = clipRanges[idx];
            const rangeEnd = clipRanges[idx + 1];
            setClipProgress((p - rangeStart) / (rangeEnd - rangeStart));
          },
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="film-room"
      ref={containerRef}
      className="relative h-[450vh] bg-black"
      aria-label="Film Room — live inference demo"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="h-[80vh] w-full">
          <FilmRoom clipIdx={clipIdx} onClipChange={setClipIdx} clipProgress={clipProgress} />
        </div>
      </div>
    </section>
  );
}
