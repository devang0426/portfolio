"use client";

import { useState } from "react";
import { about } from "@/data/about";
import { blueprintNumber, site } from "@/data/site";
import { BlueprintGraph } from "./BlueprintGraph";

const copy = about.hero.blueprint;

export function BlueprintHero() {
  const [mode, setMode] = useState(0);

  return (
    <section id="hero" className="bp-hero" aria-labelledby="bp-hero-title">
      <div className="bp-hero__body">
        <p className="bp-eyebrow">{copy.eyebrow}</p>

        <h1 id="bp-hero-title" className="bp-hero__title">
          {copy.lead}{" "}
          <em className="bp-serif">{copy.accent}</em>.
        </h1>

        <p className="bp-hero__lede">{copy.lede}</p>

        <div className="bp-hero__actions">
          <a href="#contact" className="bp-button">
            {copy.cta}
          </a>
          <a href="#work" className="bp-hero__secondary">
            {copy.secondaryCta} ↓
          </a>
        </div>
      </div>

      <figure className="bp-graph">
        <BlueprintGraph onModeChange={setMode} />
        <figcaption className="bp-graph__label">
          fig. {blueprintNumber("hero")} —{" "}
          {mode === 0 ? "monogram state" : "fuse ai architecture"}
        </figcaption>
        <p className="bp-graph__hint" aria-hidden="true">
          drag nodes · click to re-route
        </p>
      </figure>

      <p className="bp-hero__footnote">
        <span>fig. {blueprintNumber("hero")} — monogram → architecture</span>
        <span>
          {site.location.toLowerCase()} · {site.coordinates.toLowerCase()}
        </span>
      </p>
    </section>
  );
}
