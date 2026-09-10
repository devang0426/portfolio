"use client";

import { AestheticProvider, useAesthetic } from "@/lib/aesthetic-context";
import { useHashLanding } from "@/lib/useHashLanding";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { useThemeColor } from "@/lib/useThemeColor";
import { AestheticSwitcher } from "./AestheticSwitcher";
import { AestheticTransition } from "./AestheticTransition";
import { SignalPortfolio } from "@/components/signal/SignalPortfolio";
import { BlueprintPortfolio } from "@/components/blueprint/BlueprintPortfolio";

function PortfolioBody() {
  const { aesthetic } = useAesthetic();
  const reduced = useReducedMotion();
  useSmoothScroll(!reduced);
  useThemeColor();
  /* After `useSmoothScroll`, so Lenis is the thing doing the landing rather
     than a native scroll it then has to be talked out of. */
  useHashLanding();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* Keying on the aesthetic tears down every canvas, ScrollTrigger and
          listener belonging to the outgoing world instead of reconciling two
          fundamentally different trees into each other. */}
      {aesthetic === "signal" ? (
        <SignalPortfolio key="signal" />
      ) : (
        <BlueprintPortfolio key="blueprint" />
      )}
      <AestheticSwitcher />
      <AestheticTransition />
    </>
  );
}

export function Portfolio() {
  return (
    <AestheticProvider>
      <PortfolioBody />
    </AestheticProvider>
  );
}
