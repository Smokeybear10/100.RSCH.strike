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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      // Map scroll progress to clip index.
      // 3 clips, divide the scroll range into thirds.
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
            const idx = Math.min(
              demoClips.length - 1,
              Math.floor(self.progress * demoClips.length)
            );
            setClipIdx(idx);
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
      className="relative h-[300vh] bg-black"
      aria-label="Film Room — live inference demo"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="h-[80vh] w-full">
          <FilmRoom clipIdx={clipIdx} onClipChange={setClipIdx} />
        </div>
      </div>
    </section>
  );
}
