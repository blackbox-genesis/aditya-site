"use client";

import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import { setLenis, setProgress, stepHeight } from "./store";
import { STEPS } from "./steps";
import { Hud } from "./hud";

const CellScene = dynamic(() => import("@/components/cell3d/scene"), {
  ssr: false,
  loading: () => <div className="scene-fallback absolute inset-0" />,
});

/**
 * The 3D cell is fixed behind everything; the page scrolls through empty
 * "step" spacers. Lenis turns wheel and trackpad input into one continuous
 * glide, and that smoothed position drives the camera and the text together.
 */
export function JourneyShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce ? null : new Lenis({ autoRaf: true, lerp: 0.07, wheelMultiplier: 0.9, anchors: true });
    setLenis(lenis);

    let frame = 0;
    const update = () => {
      frame = 0;
      setProgress(window.scrollY / stepHeight(STEPS.length));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-0">
        <CellScene />
      </div>

      {/* Scroll track: one viewport per step; anchors make sections linkable */}
      <div aria-hidden>
        {STEPS.map((s) => (
          <div key={s.anchor} id={s.anchor} className="h-[100svh]" />
        ))}
      </div>

      <main className="pointer-events-none fixed inset-0 z-10">{children}</main>
      <Hud />
    </>
  );
}
