"use client";

import { navSections, site } from "@/data/site";

/** Sections before the closing call to action, and the call to action itself. */
const leading = navSections.slice(0, -1);
const cta = navSections[navSections.length - 1];

/** Fixed top chrome. Difference blending keeps it legible over the network and
    over the lime contact plane without any per-section colour logic. */
export function SignalNavigation() {
  return (
    <header className="sg-nav">
      <a href="#hero" className="sg-nav__mark">
        {site.initials}
        <span className="visually-hidden"> — back to top</span>
      </a>
      <nav aria-label="Primary" className="sg-nav__links">
        {leading.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.signal}
          </a>
        ))}
        {site.resume ? (
          <a href={site.resume} target="_blank" rel="noreferrer">
            Résumé
            <span aria-hidden="true"> ↗</span>
            <span className="visually-hidden"> (PDF, opens in a new tab)</span>
          </a>
        ) : null}
        {/* Contact stays last: it is the end of the line in both aesthetics,
            and the résumé slots in ahead of it rather than after the call to
            action it would otherwise trail. */}
        <a href={`#${cta.id}`}>{cta.signal}</a>
      </nav>
    </header>
  );
}
