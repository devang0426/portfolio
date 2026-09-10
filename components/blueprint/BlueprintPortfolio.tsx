"use client";

import { useActiveSection } from "@/lib/useActiveSection";
import { useBlueprintStock } from "@/lib/blueprint-stock";
import { BlueprintNavigation } from "./BlueprintNavigation";
import { BlueprintHero } from "./BlueprintHero";
import { BlueprintWork } from "./BlueprintWork";
import { BlueprintAbout } from "./BlueprintAbout";
import { BlueprintContact } from "./BlueprintContact";

const SECTIONS = ["hero", "work", "about", "contact"];

/**
 * Blueprint's paper/ink toggle is a property of this aesthetic — a drafting-table
 * lamp, not a site-wide dark mode — so it lives in Blueprint's own store rather
 * than in shared state. The hire page reads the same one, which is why it is a
 * module in `lib/` and not a constant in this file.
 */
export function BlueprintPortfolio() {
  const active = useActiveSection(SECTIONS);
  const [paper, togglePaper] = useBlueprintStock();

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
