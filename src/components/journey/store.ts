"use client";

import type Lenis from "lenis";
import { useEffect, useSyncExternalStore, type RefObject } from "react";
import type { Organelle } from "./steps";

/**
 * Shared scroll state. `progress` is read every frame by the 3D scene and the
 * scroll-linked text (no React re-render); `active` and `hovered` notify React subscribers.
 */
type JourneyState = {
  /** continuous step position: 0 = first step, 1 = second, … */
  progress: number;
  active: number;
  hovered: Organelle | null;
};

export const journey: JourneyState = { progress: 0, active: 0, hovered: null };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Per-frame callbacks that restyle DOM directly from `journey.progress`. */
const frameCallbacks = new Set<(progress: number) => void>();

export function setProgress(p: number) {
  journey.progress = p;
  frameCallbacks.forEach((cb) => cb(p));
  const next = Math.round(p);
  if (next !== journey.active) {
    journey.active = next;
    emit();
  }
}

export function setHovered(o: Organelle | null) {
  if (o === journey.hovered) return;
  journey.hovered = o;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useActiveStep() {
  return useSyncExternalStore(
    subscribe,
    () => journey.active,
    () => 0,
  );
}

/**
 * Style an element straight from scroll progress on every frame. `apply`
 * receives the element and the continuous progress; nothing re-renders.
 */
export function useScrollStyle<T extends HTMLElement>(ref: RefObject<T | null>, apply: (el: T, progress: number) => void) {
  useEffect(() => {
    const cb = (p: number) => {
      if (ref.current) apply(ref.current, p);
    };
    cb(journey.progress);
    frameCallbacks.add(cb);
    return () => {
      frameCallbacks.delete(cb);
    };
  }, [ref, apply]);
}

/** The smooth-scroll engine, once the shell has started it (absent with reduced motion). */
let lenis: Lenis | null = null;
export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Scroll range per step, so progress maps exactly onto the page height. */
export function stepHeight(stepCount: number) {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable / Math.max(1, stepCount - 1);
}

/** Glide the page so that step `index` is in focus. */
export function goToStep(index: number, stepCount: number) {
  const top = index * stepHeight(stepCount);
  if (lenis) lenis.scrollTo(top, { duration: 1.8 });
  else window.scrollTo({ top });
}
