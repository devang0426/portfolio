"use client";

import { stack } from "@/data/skills";
import { signalChapters } from "@/data/site";

/** Bottom rail: chapter index on the left, an infinite stack ticker on the right. */
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
      <div className="sg-rail__ticker" aria-hidden="true">
        <div className="sg-rail__ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy} className="sg-rail__ticker-group">
              {stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
