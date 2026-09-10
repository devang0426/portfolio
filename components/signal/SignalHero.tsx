"use client";

import Link from "next/link";
import { about } from "@/data/about";
import { HIRE_ROUTE, hire } from "@/data/hire";
import { useViewportTier } from "@/lib/useViewportTier";
import { SignalNetwork } from "./SignalNetwork";

const [firstName, lastName] = about.hero.signal.lines;

/** Node budget scaled to the viewport — a phone renders a sparser, faster mesh. */
const NODE_BUDGET = { compact: 70, medium: 110, wide: 160 } as const;

export function SignalHero() {
  const nodeCount = NODE_BUDGET[useViewportTier()];

  return (
    <section id="hero" className="sg-hero" aria-labelledby="sg-hero-title">
      <SignalNetwork count={nodeCount} className="sg-hero__canvas" />

      <div className="sg-hero__inner">
        <p className="sg-hero__eyebrow">{about.hero.signal.eyebrow}</p>

        <h1 id="sg-hero-title" className="sg-hero__title">
          <span className="sg-hero__line">{firstName}</span>
          <span className="sg-hero__line sg-hero__line--outline">{lastName}</span>
        </h1>

        <div className="sg-hero__aside">
          <p className="sg-hero__lede">{about.hero.signal.lede}</p>
          <div className="sg-hero__ctas">
            <a href="#contact" className="sg-hero__cta">
              {about.hero.signal.cta}
              <span aria-hidden="true">→</span>
            </a>
            {/* A route, not an anchor, so it prefetches and the clip on the
                other side is ready by the time it is asked for. */}
            <Link href={HIRE_ROUTE} className="sg-hero__cta sg-hero__cta--ghost">
              {hire.cta.signal}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
