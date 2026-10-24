"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { goToStep, useActiveStep, useScrollStyle } from "./store";
import { STEPS, accentFor } from "./steps";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * One section's text. Always in the DOM (readable by search engines and
 * screen readers). Its visibility follows the scroll continuously: it fades
 * in as its step approaches and drifts up and out as the next one arrives.
 */
export function StepPanel({
  anchor,
  children,
  labelledBy,
  className,
}: {
  anchor: string;
  children: ReactNode;
  labelledBy?: string;
  className?: string;
}) {
  const index = STEPS.findIndex((s) => s.anchor === anchor);
  if (index < 0) throw new Error(`Unknown step anchor: ${anchor}`);
  const active = useActiveStep() === index;
  const { side, focus } = STEPS[index];
  const ref = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const apply = useCallback(
    (el: HTMLElement, progress: number) => {
      const d = progress - index;
      el.style.setProperty("--vis", (1 - smooth(0.2, 0.58, Math.abs(d))).toFixed(3));
      el.style.setProperty("--drift", `${(-d * 90).toFixed(1)}px`);
    },
    [index],
  );
  useScrollStyle(ref, apply);

  // Keep every section to one screen with no inner scrolling: if the text (and
  // photo) would run taller than the space available, shrink it to fit.
  useEffect(() => {
    const section = ref.current;
    const card = cardRef.current;
    if (!section || !card) return;
    const fit = () => {
      const phone = window.innerWidth < 768;
      const available = window.innerHeight - (phone ? 96 : 120); // clear the top figure label
      const scale = Math.min(1, available / Math.max(1, card.offsetHeight));
      section.style.setProperty("--fit", scale.toFixed(3));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(card);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      data-side={side}
      // Keyboard users tabbing into a hidden panel are glided to it.
      onFocus={() => !active && goToStep(index, STEPS.length)}
      style={{ "--accent": accentFor(focus) } as CSSProperties}
      className={cn(
        "step-panel absolute inset-x-0 bottom-0 flex items-end p-3 sm:p-6 md:inset-y-0 md:items-center md:px-[5vw]",
        side === "right" && "md:justify-end",
        side === "center" && "md:justify-center",
      )}
    >
      <div
        ref={cardRef}
        className={cn(
          // No pointer capture on the text itself, so a swipe anywhere scrolls the page;
          // only links and buttons take touches, and only on the visible section.
          "panel-card w-full px-3 pb-4 md:w-[min(560px,44vw)] md:px-0",
          active && "[&_a]:pointer-events-auto [&_button]:pointer-events-auto",
          className,
        )}
      >
        <div className="panel-body">{children}</div>
      </div>
    </section>
  );
}
