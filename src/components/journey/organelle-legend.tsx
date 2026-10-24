"use client";

import { goToStep, setHovered } from "./store";
import { ORGANELLE_LABELS, ORGANELLE_ORDER, ORGANELLE_STEP, STEPS } from "./steps";

/** Key to the whole cell; hovering lights the organelle, clicking flies to it. */
export function OrganelleLegend() {
  return (
    <ul className="mt-7 border-t border-white/10" onMouseLeave={() => setHovered(null)}>
      {ORGANELLE_ORDER.map((o) => {
        const { name, field } = ORGANELLE_LABELS[o];
        return (
          <li key={o} className="border-b border-white/10">
            <button
              type="button"
              onMouseEnter={() => setHovered(o)}
              onFocus={() => setHovered(o)}
              onBlur={() => setHovered(null)}
              onClick={() => {
                setHovered(null);
                goToStep(ORGANELLE_STEP[o], STEPS.length);
              }}
              className="group flex w-full items-baseline gap-3 py-3 text-left"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 -translate-y-px rounded-full"
                style={{ background: `var(--${o})` }}
              />
              <span className="flex-1 text-sm font-medium text-white transition-colors">{name}</span>
              <span
                className="text-right text-xs text-white/55 transition-colors group-hover:text-[color:var(--c)]"
                style={{ ["--c" as string]: `var(--${o})` }}
              >
                {field}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
