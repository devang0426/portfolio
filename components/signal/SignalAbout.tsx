"use client";

import Image from "next/image";
import { about } from "@/data/about";
import { timeline } from "@/data/experience";
import { signalNumber } from "@/data/site";

export function SignalAbout() {
  return (
    <section id="about" className="sg-about" aria-labelledby="sg-about-title">
      <span className="sg-about__ghost" aria-hidden="true">
        {signalNumber("about")}
      </span>

      <div className="sg-about__body">
        <p className="sg-section-label">{signalNumber("about")} — About</p>
        <h2 id="sg-about-title" className="sg-about__title">
          {about.headline.signal.map((line, i) => (
            <span key={line} className="sg-about__line">
              {line}
              {i < about.headline.signal.length - 1 ? <br /> : null}
            </span>
          ))}
        </h2>
        <p className="sg-about__bio">{about.bio}</p>

        <dl className="sg-about__timeline">
          {timeline.map((entry) => (
            <div key={entry.year + (entry.text ?? "credentials")} className="sg-about__row">
              <dt>{entry.year}</dt>
              <dd className={entry.current ? "sg-about__current" : undefined}>
                {entry.links
                  ? entry.links.map((link, i) => (
                      <span key={link.href}>
                        {i > 0 ? " · " : null}
                        <a
                          className="sg-about__cert"
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link.label}
                        </a>
                      </span>
                    ))
                  : entry.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className="sg-about__figure">
        <Image
          src={about.portrait.src}
          alt={about.portrait.alt}
          width={520}
          height={650}
          sizes="(max-width: 900px) 100vw, 520px"
          className="sg-about__portrait"
        />
        <figcaption className="sg-about__caption">
          <span>fig. {signalNumber("about")} — the human</span>
          <span aria-hidden="true">Jaipur · 2026</span>
        </figcaption>
      </figure>
    </section>
  );
}
