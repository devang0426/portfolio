"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (listener: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** Live `prefers-reduced-motion` state. Server-renders as `false`. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
