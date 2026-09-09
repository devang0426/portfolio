"use client";

import { blueprintFigures, navSections, site } from "@/data/site";

interface Props {
  active: string;
  paper: "paper" | "ink";
  onTogglePaper: () => void;
}

/** Sections before the closing call to action, and the call to action itself. */
const leading = navSections.slice(0, -1);
const cta = navSections[navSections.length - 1];

/**
 * Blueprint navigates like a drawing set: a figure rail down the left margin,
 * and a document header naming the file and its revision.
 */
export function BlueprintNavigation({ active, paper, onTogglePaper }: Props) {
  const index = Math.max(
    0,
    blueprintFigures.findIndex((figure) => figure.id === active),
  );
  const last = blueprintFigures[blueprintFigures.length - 1].number;

  return (
    <>
      <div className="bp-rail">
        <a href="#hero" className="bp-rail__mark">
          {site.initials}
          <span className="visually-hidden"> — back to top</span>
        </a>

        <nav className="bp-rail__figures" aria-label="Figures">
          {blueprintFigures.map((figure, i) => (
            <a
              key={figure.id}
              href={figure.href}
              className="bp-rail__figure"
              aria-current={figure.id === active ? "true" : undefined}
            >
              <span className="bp-rail__dot" aria-hidden="true" />
              {i < blueprintFigures.length - 1 ? (
                <span className="bp-rail__tick" aria-hidden="true" />
              ) : null}
              {/* Announces what the page now shows. Reading out "fig. 02
                  about" to a screen reader while sighted visitors see "about"
                  would be two different sites. */}
              <span className="visually-hidden">{figure.label}</span>
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="bp-rail__lamp"
          onClick={onTogglePaper}
          aria-pressed={paper === "ink"}
          /* An unlabelled circle in the margin told a sighted visitor nothing;
             the drawing set calls this choosing your stock. */
          title="Paper / ink stock"
        >
          <span className="bp-rail__lamp-dot" aria-hidden="true" />
          <span className="visually-hidden">
            {paper === "ink" ? "Switch to paper stock" : "Switch to ink stock"}
          </span>
        </button>

        <p className="bp-rail__index" aria-hidden="true">
          sheet {blueprintFigures[index].number} / {last}
        </p>
      </div>

      <header className="bp-topbar">
        <nav aria-label="Primary" className="bp-topbar__links">
          {leading.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.blueprintNav ?? section.blueprint}
            </a>
          ))}
          {site.resume ? (
            <a href={site.resume} target="_blank" rel="noreferrer">
              résumé
              <span aria-hidden="true"> ↗</span>
              <span className="visually-hidden"> (PDF, opens in a new tab)</span>
            </a>
          ) : null}
          {/* The closing entry is the call to action, drawn strong with its
              arrow — which is why it is rendered here rather than falling out
              of an index check the résumé link would have shifted. */}
          <a href={`#${cta.id}`} className="bp-topbar__link--strong">
            {cta.blueprintNav ?? cta.blueprint} →
          </a>
        </nav>
      </header>
    </>
  );
}
