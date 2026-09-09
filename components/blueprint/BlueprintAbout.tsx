"use client";

import Image from "next/image";
import { about } from "@/data/about";
import { timeline } from "@/data/experience";

export function BlueprintAbout() {
  return (
    <section id="about" className="bp-about" aria-labelledby="bp-about-title">
      <div>
        <p className="bp-figure-label">about</p>

        <div className="bp-about__head">
          <Image
            src={about.portrait.src}
            alt={about.portrait.alt}
            width={140}
            height={176}
            sizes="140px"
            className="bp-about__portrait"
          />
          <h2 id="bp-about-title" className="bp-about__title">
            {about.headline.blueprint.lead}{" "}
            <em className="bp-serif">{about.headline.blueprint.accent}</em>
          </h2>
        </div>

        <p className="bp-about__bio">{about.bioLong}</p>
      </div>

      <ol className="bp-timeline">
        {timeline.map((entry) => (
          <li key={entry.year + (entry.text ?? "credentials")} className="bp-timeline__row">
            <span
              className="bp-timeline__marker"
              data-fill={entry.filled || undefined}
              data-current={entry.current || undefined}
              aria-hidden="true"
            />
            <p className="bp-timeline__text">
              <span className="bp-timeline__year">{entry.year.toLowerCase()}</span>
              {entry.links
                ? entry.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? " · " : null}
                      <a
                        className="bp-timeline__cert"
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </a>
                    </span>
                  ))
                : entry.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
