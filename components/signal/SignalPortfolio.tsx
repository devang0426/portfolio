"use client";

import { useCallback, useState } from "react";
import { useActiveSection } from "@/lib/useActiveSection";
import { SignalNavigation } from "./SignalNavigation";
import { SignalChapterRail } from "./SignalChapterRail";
import { SignalHero } from "./SignalHero";
import { SignalWork } from "./SignalWork";
import { SignalAbout } from "./SignalAbout";
import { SignalContact } from "./SignalContact";

const OBSERVED = ["hero", "work", "about", "contact"];

export function SignalPortfolio() {
  const observed = useActiveSection(OBSERVED);
  // Inside the pinned work track the horizontal scrub, not the observer, knows
  // which chapter is on screen.
  const [chapter, setChapter] = useState<string | null>(null);
  const onChapterChange = useCallback((id: string) => setChapter(id), []);

  const active = observed === "work" && chapter ? chapter : observed;

  return (
    <div className="portfolio-root sg-root">
      <SignalNavigation />
      <main id="main">
        <SignalHero />
        <SignalWork onChapterChange={onChapterChange} />
        <SignalAbout />
        <SignalContact />
      </main>
      <SignalChapterRail active={active} />
    </div>
  );
}
