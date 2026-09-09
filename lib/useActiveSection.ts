"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section owns the middle of the viewport. Uses one observer for
 * all ids rather than one per section, and re-runs only when the id list changes.
 */
export function useActiveSection(ids: string[], initial = ids[0]) {
  const [active, setActive] = useState(initial);
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|");
    const seen = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          seen.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of seen) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-35% 0px -35% 0px" },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
