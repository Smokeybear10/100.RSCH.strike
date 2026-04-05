# Cinematic Scroll Playbook

Drop-in brief for building scroll-as-experience websites. Hand this to Claude Code on a new project and it should be able to reproduce the pattern.

## What you're building

A website that is **experienced, not seen**. Scroll drives everything: frame-by-frame video scrubbing, text fades, element morphs, state changes synced to scroll percentage. Page hijacks the scrollbar with smoothing so motion feels like film, not browser UI.

Target aesthetic: cinematic + editorial + technical. Big type, monospace telemetry, dense info density, black backgrounds, one signal color. Think NYT "Snow Fall" meets Stripe Press meets a Bloomberg terminal.

## Reference sites (study these before writing code)

| Site | What to steal |
|------|---------------|
| rauno.me | Microinteractions, cursor awareness, restraint |
| linear.app | Typography scale, dark gradients, product chrome as art |
| stripe.com/press | Editorial layout, confidence of whitespace |
| pudding.cool | Scrollytelling with data, sticky chapters |
| distill.pub | Interactive figures, academic but beautiful |
| karpathy.github.io | Dense technical writing as design |
| igloo.inc | Scroll-scrubbed 3D, one product to sell |
| bruno-simon.com | Scroll as game, physics feel |
| active-theory.com | Studio reel, maximalist motion |
| studiofreight.com | Lenis creators, reference implementation |
| obys.agency | Swiss grid meets chaos, type as hero |
| NYT "Snow Fall" | The original scrollytelling piece |
| Anthropic research pages | Dense info + cinematic typography |

## Stack

```bash
npm install lenis gsap @gsap/react
```

- **Next.js 15+** App Router with client components
- **Lenis** smooth scroll (Studio Freight)
- **GSAP + ScrollTrigger** for timeline scrubbing
- **Tailwind v4** for styling
- **Canvas** for frame-by-frame playback (no `<video>` tag, you need scroll-accurate scrubbing)

## Core pattern

Three ingredients make this work:

1. **Lenis smooths the native scroll** (inertia, easing, wheel multiplier).
2. **GSAP ticker drives Lenis** so RAF timing matches tween timing.
3. **ScrollTrigger reads Lenis's scroll position** via `lenis.on("scroll", ScrollTrigger.update)`.

Without step 2 and 3 you get jank. Scroll animations drift from scrollbar position.

## Code

### 1. SmoothScroll provider (wrap your layout)

`src/components/smooth-scroll.tsx`:

```tsx
"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

Then in `app/layout.tsx`:

```tsx
<body>
  <SmoothScroll>{children}</SmoothScroll>
</body>
```

### 2. Scroll-scrubbed canvas hero

The core trick: a `500vh` section with a `sticky top-0 h-screen` child. As the user scrolls through 5 viewport heights, GSAP animates a proxy `{ frame: 0 }` object whose `onUpdate` callback draws the corresponding preloaded image to a canvas.

`src/components/scroll-hero.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 200;
const FRAME_DIR = "/clips/my-sequence";

const framePath = (i: number) =>
  `${FRAME_DIR}/img_${String(i + 1).padStart(5, "0")}.jpg`;

export function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  const imageCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Preload frames: 40 eager, rest via requestIdleCallback
  useEffect(() => {
    const cache = imageCache.current;
    cache.clear();
    let loadedCount = 0;
    const eager = Math.min(40, TOTAL_FRAMES);

    const loadFrame = (i: number) => {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        cache.set(i, img);
        loadedCount++;
        if (loadedCount >= eager) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= eager) setLoaded(true);
      };
    };

    for (let i = 0; i < eager; i++) loadFrame(i);

    let bg = eager;
    const loadBatch = () => {
      const end = Math.min(bg + 20, TOTAL_FRAMES);
      for (let i = bg; i < end; i++) loadFrame(i);
      bg = end;
      if (bg < TOTAL_FRAMES) requestIdleCallback(loadBatch);
    };
    if (eager < TOTAL_FRAMES) requestIdleCallback(loadBatch);
  }, []);

  // Draw current frame to canvas (with nearest-frame fallback)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imageCache.current.get(currentFrame);
    if (img) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    } else {
      for (let offset = 1; offset < 20; offset++) {
        const near =
          imageCache.current.get(currentFrame - offset) ||
          imageCache.current.get(currentFrame + offset);
        if (near) {
          canvas.width = near.naturalWidth;
          canvas.height = near.naturalHeight;
          ctx.drawImage(near, 0, 0);
          return;
        }
      }
    }
  }, [currentFrame]);

  // Scroll orchestration
  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      // Proxy scrub: drives the frame counter
      const proxy = { frame: 0 };
      gsap.to(proxy, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5, // 500ms catch-up for cinematic feel
          onUpdate: () => setCurrentFrame(Math.round(proxy.frame)),
        },
      });

      // Title fade: first 15% of scroll
      gsap.to(titleRef.current, {
        opacity: 0,
        scale: 0.85,
        y: -40,
        filter: "blur(8px)",
        ease: "power2.in",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "15% top",
          scrub: true,
        },
      });

      // Outro text: last 15% of scroll
      gsap.fromTo(
        outroRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "80% top",
            end: "95% top",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: loaded ? "none" : "blur(20px)" }}
        />

        {/* Vignette gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent via-40% to-black/90 pointer-events-none" />

        {/* Title — opening shot */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 pointer-events-none"
        >
          <h1 className="text-[clamp(80px,18vw,280px)] font-black leading-[0.82] tracking-[-0.02em] text-white">
            TITLE
          </h1>
          <div className="mt-4 text-[11px] font-mono tracking-[4px] uppercase text-white/60">
            scroll to begin
          </div>
        </div>

        {/* Outro */}
        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-[20%] text-center px-5 pointer-events-none opacity-0"
        >
          <div className="text-[clamp(32px,5vw,64px)] font-black text-white">
            Exit line here.
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 3. Frame prep (offline)

Extract frames from source video using ffmpeg. 1-indexed, 5-digit padded, jpeg for size:

```bash
ffmpeg -i source.mp4 -vf "fps=12,scale=1920:-2" public/clips/my-sequence/img_%05d.jpg
```

At 12fps × 200 frames that's ~16 seconds of footage stretched over 5 viewport heights of scroll. Tune fps and frame count to control pacing.

## Tuning knobs

| Value | Effect |
|-------|--------|
| `scrub: 0.5` | 500ms catch-up. Higher = more cinematic drag, lower = tighter response |
| `h-[500vh]` | Container height. More = slower scroll, more breathing room |
| Lenis `duration: 1.15` | Wheel smoothing. 0.8 snappy, 1.5 molasses |
| Lenis `wheelMultiplier: 1` | Lower = more scrolling per mouse flick |
| Eager preload `40` | How many frames load before UI appears |
| Frame count `200` | Match your narrative beats |

## Gotchas

- **Don't use `<video>` tags.** You cannot reliably scrub per-pixel with HTML video. Canvas + frames is the only way.
- **Image cache must be stable.** Put it in a `useRef<Map>`, not state. State update on every frame = re-render every frame.
- **`scrub: true` vs `scrub: 0.5`.** `true` is instant (jarring). A number gives you the smoothed lag that reads as "cinematic."
- **Sticky + Lenis plays nice.** Lenis uses native scroll with delta smoothing, doesn't break `position: sticky`.
- **`gsap.context()` is non-negotiable.** Wrap all ScrollTrigger setup in it so cleanup kills the right instances. Otherwise fast-refresh leaks triggers.
- **Canvas dimensions from image.** Set `canvas.width = img.naturalWidth` on every draw. CSS stretches it to the container.
- **Preload budget.** 200 frames × 80kb jpeg = 16MB. That's fine on desktop, rough on mobile 3G. Consider lower-res variants with srcset logic or mobile detection.
- **Reduced motion.** Respect `prefers-reduced-motion` and swap the scroll experience for a single hero image + static content.

## Adaptation checklist

Using this on a new project? Swap these:

- [ ] Your frame directory (`FRAME_DIR`) and count (`TOTAL_FRAMES`)
- [ ] Your title copy and outro copy
- [ ] Your brand color (replace `#dc2626` if using signal-color moments)
- [ ] Your fonts (Anton for display, mono for telemetry works hard)
- [ ] Your signal moments (where does the narrative peak? sync a visual flash there)
- [ ] Your reduced-motion fallback

## Prompt you can paste into Claude Code

> Build a scroll-driven hero for [PROJECT]. Tech: Next.js App Router, Lenis smooth scroll, GSAP ScrollTrigger. Pattern: 500vh container, sticky top-0 h-screen child, canvas that draws preloaded jpeg frames from `/public/clips/[NAME]/img_00001.jpg` (1-indexed, 5-digit padded). Drive frame index via `gsap.to(proxy, { frame: N-1, scrollTrigger: { scrub: 0.5, onUpdate } })`. Preload 40 frames eagerly, rest via requestIdleCallback. Add title fade 0-15%, outro fade 80-95%. Wrap layout with SmoothScroll provider that bridges Lenis and ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)` and drives Lenis via `gsap.ticker.add`. Use `gsap.context()` for cleanup. Reference the CINEMATIC_SCROLL_PLAYBOOK.md in this repo for the exact code. Aesthetic: cinematic, editorial, black bg, big type, mono telemetry, one signal color.

## What makes this feel expensive

- **One signal color, everywhere else monochrome.** Red or orange used once, everything else black/white/gray.
- **Type hierarchy is extreme.** 280px hero, 11px mono caption. Nothing in between on the hero.
- **Telemetry is real.** Show the actual frame count, the actual confidence number, the actual progress percentage. Don't fake it.
- **Motion follows physics.** `scrub: 0.5` mimics tape inertia. No linear eases on important moments.
- **Whitespace is confidence.** The sparsest frame is the most memorable.
