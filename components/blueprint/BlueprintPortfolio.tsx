"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useActiveSection } from "@/lib/useActiveSection";
import { createPersistedStore } from "@/lib/persisted-store";
import { BlueprintNavigation } from "./BlueprintNavigation";
import { BlueprintHero } from "./BlueprintHero";
import { BlueprintWork } from "./BlueprintWork";
import { BlueprintAbout } from "./BlueprintAbout";
import { BlueprintContact } from "./BlueprintContact";

const SECTIONS = ["hero", "work", "about", "contact"];

type Stock = "paper" | "ink";
const isStock = (value: string): value is Stock =>
  value === "paper" || value === "ink";
const stockStore = createPersistedStore<Stock>("ds-blueprint-stock", "paper", isStock);

/**
 * Blueprint's paper/ink toggle is a property of this aesthetic — a drafting-table
 * lamp, not a site-wide dark mode — so it lives here rather than in shared state.
 */
export function BlueprintPortfolio() {
  const active = useActiveSection(SECTIONS);
  const paper = useSyncExternalStore(
    stockStore.subscribe,
    stockStore.get,
    stockStore.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.dataset.paper = paper;
    return () => {
      delete document.documentElement.dataset.paper;
    };
  }, [paper]);

  const togglePaper = () => stockStore.set(paper === "paper" ? "ink" : "paper");

  return (
    <div className="portfolio-root bp-root">
      <BlueprintNavigation
        active={active}
        paper={paper}
        onTogglePaper={togglePaper}
      />
      <main id="main" className="bp-main">
        <BlueprintHero />
        <BlueprintWork />
        <BlueprintAbout />
        <BlueprintContact />
      </main>
    </div>
  );
}
