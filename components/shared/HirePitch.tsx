"use client";

import { AestheticProvider, useAesthetic } from "@/lib/aesthetic-context";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { useThemeColor } from "@/lib/useThemeColor";
import { AestheticSwitcher } from "./AestheticSwitcher";
import { AestheticTransition } from "./AestheticTransition";
import { SignalHire } from "@/components/signal/SignalHire";
import { BlueprintHire } from "@/components/blueprint/BlueprintHire";

/**
 * The hire page's shell — the same arrangement `Portfolio` uses, because the
 * identity a visitor chose has to survive the navigation. The store behind
 * `AestheticProvider` is module scope plus localStorage, so arriving here with
 * Blueprint committed lands on Blueprint, and the inline restore script in the
 * root layout has already put the right palette on <html> before first paint.
 */
function HirePitchBody() {
  const { aesthetic } = useAesthetic();
  const reduced = useReducedMotion();
  useSmoothScroll(!reduced);
  useThemeColor();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* Keyed for the same reason the portfolio is: the two trees share no
          markup worth reconciling, and a stale timeline from the outgoing one
          would animate elements the incoming one does not have. */}
      {aesthetic === "signal" ? (
        <SignalHire key="signal" />
      ) : (
        <BlueprintHire key="blueprint" />
      )}
      <AestheticSwitcher />
      <AestheticTransition />
    </>
  );
}

export function HirePitch() {
  return (
    <AestheticProvider>
      <HirePitchBody />
    </AestheticProvider>
  );
}
