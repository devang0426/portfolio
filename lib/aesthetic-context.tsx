"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Aesthetic } from "@/aesthetics/types";
import { createPersistedStore } from "./persisted-store";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export const STORAGE_KEY = "ds-aesthetic";
export const DEFAULT_AESTHETIC: Aesthetic = "signal";

const isAesthetic = (value: string): value is Aesthetic =>
  value === "signal" || value === "blueprint";

const store = createPersistedStore<Aesthetic>(
  STORAGE_KEY,
  DEFAULT_AESTHETIC,
  isAesthetic,
);

/**
 * Out-phase and full sequence length, in ms. The total covers the exit (460),
 * the blocking commit that swaps the trees (~200 on a mid laptop) and the
 * reveal (~520) — the veil must outlast all three.
 */
const OUT_MS = 420;
const TOTAL_MS = 1220;
const REDUCED_OUT_MS = 70;
const REDUCED_TOTAL_MS = 160;

interface AestheticContextValue {
  /** The aesthetic currently on screen. */
  aesthetic: Aesthetic;
  /** The aesthetic being transitioned to, or null when settled. */
  pending: Aesthetic | null;
  isTransitioning: boolean;
  setAesthetic: (next: Aesthetic) => void;
}

const AestheticContext = createContext<AestheticContextValue | null>(null);

export function AestheticProvider({ children }: { children: React.ReactNode }) {
  // The committed choice. Renders as Signal on the server and during hydration,
  // then adopts the stored value in the same commit — no flash, no cascade.
  const committed = useSyncExternalStore(
    store.subscribe,
    store.get,
    store.getServerSnapshot,
  );

  // While the outgoing world plays its exit, the screen keeps showing it.
  const [holding, setHolding] = useState<Aesthetic | null>(null);
  // The destination, held for the whole sequence so the veil can play both halves.
  const [pending, setPending] = useState<Aesthetic | null>(null);
  const timers = useRef<number[]>([]);

  const aesthetic = holding ?? committed;

  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.aesthetic = aesthetic;
    // Whatever the stored choice was, the tree on screen now matches it.
    delete document.documentElement.dataset.restoring;
  }, [aesthetic]);

  const setAesthetic = useCallback((next: Aesthetic) => {
    if (store.get() === next || timers.current.length > 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const outMs = reduced ? REDUCED_OUT_MS : OUT_MS;
    const totalMs = reduced ? REDUCED_TOTAL_MS : TOTAL_MS;

    // Pin the current world on screen, then commit the choice: the switcher
    // updates immediately while the outgoing aesthetic plays its exit.
    setHolding(store.get());
    setPending(next);
    document.documentElement.dataset.transition = "out";
    store.set(next);

    timers.current.push(
      window.setTimeout(() => {
        document.documentElement.dataset.transition = "in";
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        setHolding(null);
      }, outMs),
      window.setTimeout(() => {
        delete document.documentElement.dataset.transition;
        setPending(null);
        timers.current.length = 0;
      }, totalMs),
    );
  }, []);

  useEffect(() => {
    const timeouts = timers.current;
    return () => {
      for (const id of timeouts) window.clearTimeout(id);
      // Emptying matters as much as clearing. `timers.current.length` is the
      // lock that refuses a second switch while one is running, and the only
      // other thing that releases it is the timeout just cancelled above —
      // so leaving the ids behind would strand the switcher inert, with no
      // way back but a full reload.
      timeouts.length = 0;
      delete document.documentElement.dataset.transition;
    };
  }, []);

  const value = useMemo<AestheticContextValue>(
    () => ({
      aesthetic,
      pending,
      isTransitioning: pending !== null,
      setAesthetic,
    }),
    [aesthetic, pending, setAesthetic],
  );

  return (
    <AestheticContext.Provider value={value}>
      {children}
    </AestheticContext.Provider>
  );
}

export function useAesthetic() {
  const context = useContext(AestheticContext);
  if (!context)
    throw new Error("useAesthetic must be used inside <AestheticProvider>");
  return context;
}

/** The committed choice, for controls that should update ahead of the visuals. */
export function useCommittedAesthetic(): Aesthetic {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}
