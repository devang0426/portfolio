"use client";

import type { ScrollTrigger } from "./gsap";

/**
 * Signal's work chapters live inside a pinned, horizontally scrubbed track, so
 * a chapter's position on the page has nothing to do with where it sits in the
 * document. An ordinary `#fuse` anchor therefore lands at the top of the pinned
 * section for every chapter alike, and the bottom rail — the primary way to
 * reach a project on desktop — stops navigating anywhere.
 *
 * The running track registers itself here, and both the smooth-scroll anchor
 * handler and the track's own focus management convert a chapter id into the
 * document position at which that chapter fills the frame. When the track is
 * not running — narrow viewports, reduced motion, the Blueprint tree — nothing
 * is registered, every lookup returns null, and the element's own position is
 * already the truth.
 */
interface WorkScrub {
  trigger: ScrollTrigger;
  /** Chapter ids, in track order. */
  ids: string[];
}

let active: WorkScrub | null = null;

/** Returns the release function; call it when the track is torn down. */
export function registerWorkScrub(scrub: WorkScrub) {
  active = scrub;
  return () => {
    if (active === scrub) active = null;
  };
}

/** The scroll position at which chapter `index` fills the frame. */
const positionOf = (scrub: WorkScrub, index: number) => {
  const { start, end } = scrub.trigger;
  return start + ((end - start) * index) / (scrub.ids.length - 1);
};

/** Document Y for a chapter id, or null when the track is not running. */
export function workChapterScrollY(id: string): number | null {
  if (!active || active.ids.length < 2) return null;
  const index = active.ids.indexOf(id);
  return index < 0 ? null : positionOf(active, index);
}

/**
 * Which chapter a given scroll position is showing. The inverse of
 * `positionOf`, so the rail's highlight and the anchor targets can never drift
 * apart the way two hand-tuned formulas would.
 */
export function workChapterIndexAt(y: number): number | null {
  if (!active || active.ids.length < 2) return null;
  const { start, end } = active.trigger;
  const span = end - start;
  if (span <= 0) return null;
  const progress = Math.min(1, Math.max(0, (y - start) / span));
  return Math.round(progress * (active.ids.length - 1));
}
