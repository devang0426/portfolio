"use client";

import { useSyncExternalStore } from "react";

export type ViewportTier = "compact" | "medium" | "wide";

const tierFor = (width: number): ViewportTier =>
  width < 640 ? "compact" : width < 1100 ? "medium" : "wide";

const subscribe = (listener: () => void) => {
  window.addEventListener("resize", listener, { passive: true });
  window.addEventListener("orientationchange", listener);
  return () => {
    window.removeEventListener("resize", listener);
    window.removeEventListener("orientationchange", listener);
  };
};

/**
 * Coarse viewport bucket. Deliberately coarse: canvas work budgets should change
 * at a handful of thresholds, not on every pixel of a resize.
 */
export function useViewportTier(): ViewportTier {
  return useSyncExternalStore(
    subscribe,
    () => tierFor(window.innerWidth),
    () => "wide" as const,
  );
}
