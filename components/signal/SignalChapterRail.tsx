"use client";

import { signalChapters } from "@/data/site";

/**
 * Bottom rail: the chapter index.
 *
 * The right end used to scroll an endless list of the stack. It has been given
 * over to the music player instead — the ticker named sixteen technologies at a
 * reader who could not click any of them, while the work section says the same
 * thing per project, with the thing each one was actually used to build. The
 * stack data itself is untouched: `page.tsx` still publishes it as `knowsAbout`
 * in the structured data, which is where a list like that is genuinely read.
 */
export function SignalChapterRail({ active }: { active: string }) {
  return (
    <div className="sg-rail">
      <nav className="sg-rail__chapters" aria-label="Chapters">
        {signalChapters.map((chapter) => (
          <a
            key={chapter.id}
            href={chapter.href}
            className="sg-rail__chapter"
            aria-current={chapter.id === active ? "true" : undefined}
          >
            {chapter.number} {chapter.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
