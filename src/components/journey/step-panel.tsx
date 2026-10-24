"use client";

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
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

  const apply = useCallback(
    (el: HTMLElement, progress: number) => {
      const d = progress - index;
      el.style.setProperty("--vis", (1 - smooth(0.2, 0.58, Math.abs(d))).toFixed(3));
      el.style.setProperty("--drift", `${(-d * 90).toFixed(1)}px`);
    },
    [index],
  );
  useScrollStyle(ref, apply);

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
        className={cn(
          "panel-card w-full max-h-[60svh] overflow-y-auto overscroll-contain px-3 pb-4 md:max-h-[88svh] md:w-[min(560px,44vw)] md:px-0",
          active && "pointer-events-auto",
          className,
        )}
      >
        <div className="panel-body">{children}</div>
      </div>
    </section>
  );
}
