"use client";

export function SkipLink() {
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
      onClick={(event) => {
        const main = document.getElementById("main");
        if (!main) return;
        event.preventDefault();
        main.tabIndex = -1;
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: "start" });
      }}>
      Skip to main content
    </a>
  );
}
