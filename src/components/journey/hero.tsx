"use client";

import { useCallback, useRef } from "react";
import { useScrollStyle } from "./store";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Opening frame: only the name. The first bit of scroll eases in the
 * introduction, and the whole block drifts away as the nucleus approaches —
 * all tied to the scroll position, so it flows with no pauses.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);

  const apply = useCallback((el: HTMLElement, p: number) => {
    el.style.setProperty("--hero", (1 - smooth(1.15, 1.6, p)).toFixed(3));
    el.style.setProperty("--hero-drift", `${(-smooth(1, 1.7, p) * 70).toFixed(1)}px`);
    el.style.setProperty("--intro", smooth(0.2, 0.75, p).toFixed(3));
    el.style.setProperty("--cue", (1 - smooth(0, 0.25, p)).toFixed(3));
  }, []);
  useScrollStyle(ref, apply);

  return (
    <section
      ref={ref}
      aria-labelledby="h-name"
      className="absolute inset-0 isolate flex flex-col items-center justify-center px-6 text-center opacity-[var(--hero,1)] [transform:translate3d(0,var(--hero-drift,0px),0)]"
    >
      {/* Soft shade so the name stays legible over the cell */}
      <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0 -z-10" />
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-white/65 opacity-[var(--intro,0)] [transform:translate3d(0,calc((1-var(--intro,0))*12px),0)]">
        01 · The Cell — Introduction
      </p>
      <h1 id="h-name" className="font-extrabold leading-[0.9] tracking-[-0.03em] text-white [font-size:clamp(3.6rem,12vw,11rem)]">
        Aditya Raj
      </h1>
      <p className="mt-5 text-lg font-semibold uppercase tracking-[0.3em] text-white/80 opacity-[var(--intro,0)] [transform:translate3d(0,calc((1-var(--intro,0))*20px),0)] md:text-2xl">
        Systems Bioengineer
      </p>

      <span aria-hidden className="scroll-cue absolute bottom-10 left-1/2 h-14 w-px opacity-[var(--cue,1)]" />
    </section>
  );
}
