"use client";

import { useEffect, useRef } from "react";
import { useAesthetic } from "@/lib/aesthetic-context";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

const BAND_COUNT = 6;

/**
 * The identity change itself. Bands sweep across the viewport in the direction
 * of travel while the outgoing world compresses behind them, then withdraw to
 * reveal the new one.
 *
 * The sequence is deliberately split in two rather than run as one timeline:
 * swapping the trees is a ~200ms blocking commit, and a single timeline would
 * have that commit eat the second half. Closing plays on the switch; opening
 * waits until the incoming world has actually painted, so the reveal is smooth
 * every time and the veil never lifts on a half-built page.
 */
export function AestheticTransition() {
  const { aesthetic, pending } = useAesthetic();
  const reduced = useReducedMotion();
  const veilRef = useRef<HTMLDivElement>(null);

  // True once the tree has been swapped and we are waiting to be revealed.
  const swapped = pending !== null && pending === aesthetic;

  useEffect(() => {
    if (!pending || reduced) return;
    const veil = veilRef.current;
    if (!veil) return;

    const bands = Array.from(
      veil.querySelectorAll<HTMLElement>(".transition-veil__band"),
    );
    // Signal charges in from the left; Blueprint files in from the right.
    const forward = pending === "blueprint";
    const leadingEdge = (i: number) =>
      (i % 2 === 0) === forward ? "left center" : "right center";
    const trailingEdge = (i: number) =>
      (i % 2 === 0) === forward ? "right center" : "left center";

    let frame = 0;
    const timeline = gsap.timeline();

    if (!swapped) {
      timeline
        .set(bands, { scaleX: 0, transformOrigin: leadingEdge })
        .to(bands, {
          scaleX: 1,
          duration: 0.4,
          ease: "power3.inOut",
          stagger: { each: 0.035, from: forward ? "start" : "end" },
        });
    } else {
      // Two frames of headroom: one for the incoming tree's first paint, one so
      // the reveal starts against a settled layout rather than a reflow.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          timeline.to(bands, {
            scaleX: 0,
            duration: 0.44,
            ease: "power3.inOut",
            transformOrigin: trailingEdge,
            stagger: { each: 0.03, from: forward ? "end" : "start" },
          });
        });
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      timeline.kill();
    };
  }, [pending, swapped, reduced]);

  // Leave the bands retracted once a sequence ends, so the next one starts clean.
  useEffect(() => {
    if (pending || !veilRef.current) return;
    gsap.set(veilRef.current.querySelectorAll(".transition-veil__band"), {
      scaleX: 0,
    });
  }, [pending]);

  return (
    <>
      <div className="transition-veil" ref={veilRef} aria-hidden="true">
        {Array.from({ length: BAND_COUNT }, (_, i) => (
          <span key={i} className="transition-veil__band" />
        ))}
      </div>
      <div className="transition-veil__readout" aria-hidden="true">
        {pending ?? ""}
      </div>
      <p role="status" aria-live="polite" className="visually-hidden">
        {pending ? `Switching to the ${pending} aesthetic` : ""}
      </p>
    </>
  );
}
