"use client";

import { useEffect } from "react";
import { projects } from "@/data/projects";
import { ScrollTrigger } from "./gsap";
import { scrollToY } from "./useSmoothScroll";
import { workChapterScrollY } from "./work-scrub";

/**
 * Lands an incoming `#hash` where it actually belongs.
 *
 * `useSmoothScroll` already corrects the anchors *clicked on this page*, but a
 * hash arriving with the navigation — `/#work` from the hire page, or a pasted
 * link — is resolved by the browser instead, and the browser resolves it too
 * early. The pinned work track's ScrollTrigger has not settled its start and
 * end by then, so the position the browser rests at maps to a scrub progress
 * some way into the track: the link said "the work" and the page opened on the
 * second project.
 *
 * So the landing is redone once the track can be asked where it is, using the
 * same `workChapterScrollY` the click handler uses. It runs after a refresh
 * and after two frames of headroom — one for the incoming tree's first paint,
 * one so the measurement is taken against a settled layout rather than a
 * reflow — which is late enough that fonts and the hero canvas have stopped
 * moving things around underneath it.
 */
export function useHashLanding() {
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    if (!raw) return;

    let frame = 0;

    const land = () => {
      // The starts and ends this depends on are only as good as the last
      // refresh, and layout has been moving since the navigation began.
      ScrollTrigger.refresh();

      /* `#work` names a section, but inside the pinned track the section has no
         single position — it has four. The one it means is the first chapter.
         Only when the track is actually running, though: on a phone, under
         reduced motion and in Blueprint the chapters simply stack, and there
         the section's own position is already the truth. */
      const first = projects[0]?.id;
      const trackRunning =
        first !== undefined && workChapterScrollY(first) !== null;
      const id = raw === "work" && trackRunning ? first : raw;

      const chapter = workChapterScrollY(id);
      if (chapter !== null) {
        scrollToY(chapter, true);
        return;
      }

      const target = document.getElementById(id);
      if (target) {
        scrollToY(target.getBoundingClientRect().top + window.scrollY, true);
      }
    };

    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(land);
    });

    return () => cancelAnimationFrame(frame);
  }, []);
}
