"use client";

import { cn } from "@/lib/utils";
import { goToStep, useActiveStep } from "./store";
import { STEPS, accentFor } from "./steps";

/** Figure label + section rail. Hidden on the opening frame so only the name shows. */
export function Hud() {
  const active = useActiveStep();
  const step = STEPS[active] ?? STEPS[0];
  const hidden = active === 0;

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-20 transition-opacity duration-700", hidden && "opacity-0")}
      aria-hidden={hidden}
    >
      <div className="absolute left-4 top-4 flex items-start gap-3 [text-shadow:0_1px_10px_rgb(22_30_41/0.85)] md:left-8 md:top-7">
        <span
          aria-hidden
          className="mt-1 size-2.5 rounded-full transition-colors duration-700"
          style={{ background: accentFor(step.focus) }}
        />
        <div aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">Fig. {step.num}</p>
          <p key={active} className="text-sm font-semibold text-white animate-in fade-in slide-in-from-left-2 duration-700">
            {step.figure}
            <span className="font-normal text-white/60"> — {step.caption}</span>
          </p>
        </div>
      </div>

      <nav aria-label="Sections" className="pointer-events-auto absolute right-5 top-1/2 hidden -translate-y-1/2 md:block">
        <ol className="flex flex-col items-center gap-0.5">
          {STEPS.map((s, i) => (
            <li key={s.anchor}>
              <button
                type="button"
                tabIndex={hidden ? -1 : 0}
                onClick={() => goToStep(i, STEPS.length)}
                aria-label={`${s.num} — ${s.figure}: ${s.caption}`}
                aria-current={i === active ? "step" : undefined}
                className="group flex h-4 w-6 items-center justify-center"
              >
                <span
                  className="block h-0.5 transition-[width,background-color] duration-500"
                  style={{
                    width: i === active ? 20 : 8,
                    background: i === active ? accentFor(s.focus) : "rgba(255,255,255,0.35)",
                  }}
                />
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
