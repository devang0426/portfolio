"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { workChapterScrollY } from "./work-scrub";

/**
 * The Lenis instance currently driving the page, if any. Held at module scope
 * so code that needs to move the page — the pinned work track's focus handling,
 * for one — goes through the same clock as every other scroll instead of
 * fighting it with a native `scrollTo`.
 */
let driver: Lenis | null = null;

/**
 * Scroll the page, through Lenis when it is driving and natively when not.
 *
 * `immediate` skips the glide. It is for arriving somewhere rather than
 * travelling there — landing on a hash from another route, where a second of
 * animated scroll past everything in between is not a transition, just a wait.
 */
export function scrollToY(y: number, immediate = false) {
  if (driver) driver.scrollTo(y, { offset: 0, immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

/**
 * Drives the page with Lenis and hands ScrollTrigger the same clock, so pinned
 * sections stay in lockstep with the smoothed scroll position. Disabled entirely
 * under reduced-motion, where native scrolling is the correct behaviour.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      // Native touch scrolling stays native: smoothing it fights the platform.
      syncTouch: false,
    });

    driver = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onAnchor = (event: MouseEvent) => {
      // A component that has already handled the click owns it.
      if (event.defaultPrevented) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      // A chapter inside the pinned horizontal track is not where the document
      // says it is; its scrub position is.
      const chapter = workChapterScrollY(id);
      if (chapter !== null) lenis.scrollTo(chapter, { offset: 0 });
      else lenis.scrollTo(target, { offset: 0 });
    };
    document.addEventListener("click", onAnchor);

    return () => {
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      if (driver === lenis) driver = null;
    };
  }, [enabled]);
}
