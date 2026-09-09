"use client";

import { useEffect } from "react";

/**
 * Keeps `<meta name="theme-color">` in step with whatever ground the page is
 * currently standing on. Mobile browsers paint their chrome with it, so without
 * this the address bar stays Signal's near-black while Blueprint's paper fills
 * the page beneath it — the one part of the viewport the identity switch was
 * visibly failing to reach.
 *
 * The value is read from the live `--background` token rather than mapped from
 * a list, so Blueprint's paper/ink stock is covered by the same three lines and
 * a new palette needs no change here at all.
 */
export function useThemeColor() {
  useEffect(() => {
    const root = document.documentElement;

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    // A media-scoped pair from the static viewport export would keep winning
    // over this one; drop them so there is a single source of truth.
    for (const stale of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"][media]',
    )) {
      stale.remove();
    }

    const sync = () => {
      const background = getComputedStyle(root)
        .getPropertyValue("--background")
        .trim();
      if (background && meta.content !== background) meta.content = background;
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-aesthetic", "data-paper"],
    });
    return () => observer.disconnect();
  }, []);
}
