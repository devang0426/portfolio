"use client";

import { useRef } from "react";
import { projects } from "@/data/projects";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import { registerWorkScrub, workChapterIndexAt, workChapterScrollY } from "@/lib/work-scrub";
import { scrollToY } from "@/lib/useSmoothScroll";
import { SignalProject } from "./SignalProject";

interface Props {
  onChapterChange: (id: string) => void;
}

/**
 * Work as one continuous take: the section pins and the chapters travel
 * sideways under it, so scrolling reads as a camera move rather than a list.
 * Below 900px — and under reduced motion — the same chapters simply stack, which
 * is the right composition for a thumb rather than a downgraded one.
 */
export function SignalWork({ onChapterChange }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const changeRef = useRef(onChapterChange);
  useIsomorphicLayoutEffect(() => {
    changeRef.current = onChapterChange;
  });

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const distance = () => track.scrollWidth - window.innerWidth;
          const lastChapter = projects.length - 1;
          let lastIndex = -1;

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (progressRef.current)
                  progressRef.current.style.transform = `scaleX(${self.progress})`;
                // The track travels one chapter per 1/(n-1) of progress, so the
                // chapter on screen is that same fraction rounded — not a count
                // over n, which ran a third of a chapter ahead of the visuals
                // and lit the wrong rail entry for most of the scrub.
                const index = Math.round(self.progress * lastChapter);
                if (index !== lastIndex) {
                  lastIndex = index;
                  changeRef.current(projects[index].id);
                }
              },
            },
          });

          const release = registerWorkScrub({
            trigger: tween.scrollTrigger!,
            ids: projects.map((project) => project.id),
          });

          /**
           * Tabbing into a chapter that is parked off-screen would otherwise
           * focus something invisible — and tempt the browser into scrolling
           * the clipped section sideways, which tears the track away from the
           * transform driving it. Bring the chapter into frame instead, and
           * undo any horizontal nudge the browser managed first.
           */
          const onFocusIn = (event: FocusEvent) => {
            const chapter = (event.target as HTMLElement | null)?.closest?.(
              ".sg-project",
            ) as HTMLElement | null;
            if (!chapter) return;
            section.scrollLeft = 0;
            const index = projects.findIndex((p) => p.id === chapter.id);
            if (index < 0 || workChapterIndexAt(window.scrollY) === index) return;
            const y = workChapterScrollY(chapter.id);
            if (y !== null) scrollToY(y);
          };
          section.addEventListener("focusin", onFocusIn);

          return () => {
            section.removeEventListener("focusin", onFocusIn);
            release();
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        },
      );

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="sg-work"
      aria-labelledby="sg-work-title"
    >
      <h2 id="sg-work-title" className="visually-hidden">
        Selected work
      </h2>

      <div className="sg-work__timeline" aria-hidden="true">
        <span>2025</span>
        <span className="sg-work__progress">
          <span className="sg-work__progress-fill" ref={progressRef} />
        </span>
        <span>2026</span>
        <span className="sg-work__hint">scroll ↓ moves →</span>
      </div>

      <div className="sg-work__track" ref={trackRef}>
        {projects.map((project) => (
          <SignalProject key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
