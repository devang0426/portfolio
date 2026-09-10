"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPersistedStore } from "./persisted-store";

export type Stock = "paper" | "ink";

const isStock = (value: string): value is Stock =>
  value === "paper" || value === "ink";

/**
 * Blueprint's paper/ink choice — a drafting-table lamp, not a site-wide dark
 * mode, which is why it is Blueprint's own state rather than something the
 * aesthetic context carries.
 *
 * It lives at module scope so every Blueprint surface reads and writes the one
 * store: two instances built from the same localStorage key would agree on the
 * stored value but keep separate listener sets, and a page that mounted its own
 * would stop updating the moment another one changed the stock.
 */
const stockStore = createPersistedStore<Stock>("ds-blueprint-stock", "paper", isStock);

/**
 * The current stock, applied to <html> for as long as a Blueprint surface is on
 * screen. The attribute is removed on unmount so Signal never inherits it, and
 * the inline restore script in the root layout puts it back before first paint
 * on the next load.
 */
export function useBlueprintStock(): [Stock, () => void] {
  const stock = useSyncExternalStore(
    stockStore.subscribe,
    stockStore.get,
    stockStore.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.dataset.paper = stock;
    return () => {
      delete document.documentElement.dataset.paper;
    };
  }, [stock]);

  return [stock, () => stockStore.set(stock === "paper" ? "ink" : "paper")];
}
