"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  WORK_ROUTE,
  clientWork,
  hire,
  hireVideo,
  strengths,
  testimonialReady,
} from "@/data/hire";
import { site } from "@/data/site";
import { signalMotion } from "@/aesthetics/signal/animations";
import { gsap } from "@/lib/gsap";
import { useHireIntro } from "@/lib/useHireIntro";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import { nudgeIntoView } from "@/lib/useSmoothScroll";

const copy = hire.signal;
const intro = hire.intro.signal;
const client = hire.client.signal;

/** The client section follows the strength groups, so it takes the next ordinal. */
const clientNumber = String(strengths.length + 1).padStart(2, "0");

/** Signal numbers everything it sets, so the two groups carry ordinals too. */
const numbered = strengths.map((group, index) => ({
  ...group,
  number: String(index + 1).padStart(2, "0"),
}));

export function SignalHire() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const player = useHireIntro(videoRef);
  const { revealed, revealReason, status, reduced } = player;

  const caseRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = caseRef.current;
    if (!root || !revealed) return;
    if (reduced) return;

    const context = gsap.context(() => {
      const { enter, stagger, travel, gsapEase } = signalMotion;
      const timeline = gsap.timeline();

      // The rule draws itself first, then the argument follows it in — the case
      // arrives after the clip rather than on top of its last frame.
      timeline
        .from(".sg-hire__rule", {
          scaleX: 0,
          duration: enter * 0.55,
          ease: gsapEase,
          transformOrigin: "left center",
        })
        .from(
          ".sg-hire__group-head",
          {
            opacity: 0,
            y: travel * 0.5,
            duration: enter * 0.7,
            ease: gsapEase,
            stagger: stagger * 3,
          },
          "-=0.25",
        )
        .from(
          ".sg-hire__card",
          { opacity: 0, y: travel, duration: enter, ease: gsapEase, stagger },
          "<0.12",
        )
        .from(
          ".sg-hire__client-panel, .sg-hire__quote",
          {
            opacity: 0,
            y: travel,
            duration: enter,
            ease: gsapEase,
            stagger: stagger * 2,
          },
          "-=0.5",
        )
        .from(
          ".sg-hire__closer",
          { opacity: 0, y: travel, duration: enter, ease: gsapEase },
          "-=0.6",
        );
    }, root);

    if (revealReason === "watched") {
      // The clip has just finished, so the page follows through and puts the
      // case where the eye already is. Focus goes with it, or the keyboard is
      // left behind on a control that is no longer the thing to do.
      root.focus({ preventScroll: true });
      nudgeIntoView(root);
    }

    return () => context.revert();
    // `reduced` is read once, at the reveal it cannot change in the middle of.
  }, [revealed, reduced, revealReason]);

  return (
    <div className="portfolio-root sg-root sg-hire">
      <header className="sg-nav">
        <Link href="/" className="sg-nav__mark">
          {site.initials}
          <span className="visually-hidden"> — back to the portfolio</span>
        </Link>
        <nav aria-label="Primary" className="sg-nav__links">
          <Link href="/">{copy.back}</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
      </header>

      <main id="main">
        <section className="sg-hire__intro" aria-labelledby="sg-hire-title">
          {/* One grid cell for the words, one for the clip: the title and lede
              have to share a column or the intro grid puts the lede beside the
              title and drops the video to a row of its own. */}
          <div className="sg-hire__copy">
            <h1 id="sg-hire-title" className="sg-hire__title">
              {copy.lines.map((line, i) => (
                <span
                  key={line}
                  className={
                    i === copy.lines.length - 1
                      ? "sg-hire__line sg-hire__line--outline"
                      : "sg-hire__line"
                  }
                >
                  {line}
                </span>
              ))}
            </h1>

            <p className="sg-hire__lede">{copy.lede}</p>
          </div>

          <figure className="sg-hire__stage" data-status={status}>
            <video
              ref={videoRef}
              className="sg-hire__video"
              aria-label={hireVideo.label}
              /* `muted` and `playsInline` are what make an autoplay legal on a
                 phone at all; the hook offers the unmute the moment it runs. */
              muted
              playsInline
              preload="auto"
              /* Not `autoPlay`: the hook calls play() itself so a refusal is
                 something this page can see and answer, rather than a silent
                 black rectangle nothing ever happens in. */
              onPlay={player.onPlay}
              onEnded={player.onEnded}
              onError={player.onError}
              onTimeUpdate={player.onTimeUpdate}
              onLoadedMetadata={player.onLoadedMetadata}
            >
              {/* onError here as well as on the video: a source failure fires on the
                  source and does not bubble, so the video never hears it. */}
              <source
                src={hireVideo.src}
                type={hireVideo.type}
                onError={player.onError}
              />
              {/* Appears the moment `captions` names a WebVTT file. */}
              {hireVideo.captions ? (
                <track
                  kind="captions"
                  src={hireVideo.captions}
                  srcLang={hireVideo.captionsLang}
                  label="English"
                  default
                />
              ) : null}
            </video>

            <span
              className="sg-hire__progress"
              style={{ transform: `scaleX(${player.progress})` }}
              aria-hidden="true"
            />

            <figcaption className="sg-hire__controls">
              <span className="sg-hire__meta">
                {status === "failed"
                  ? intro.failed
                  : status === "blocked"
                    ? intro.blocked
                    : intro.eyebrow}
              </span>

              <span className="sg-hire__actions">
                {status === "playing" ? (
                  <button
                    type="button"
                    className="sg-hire__control"
                    onClick={player.toggleMute}
                    data-on={!player.muted || undefined}
                  >
                    {player.muted ? intro.unmute : intro.mute}
                  </button>
                ) : null}

                {status === "blocked" || status === "ended" ? (
                  <button
                    type="button"
                    className="sg-hire__control"
                    onClick={player.play}
                  >
                    {status === "ended" ? intro.replay : intro.play}
                  </button>
                ) : null}
              </span>
            </figcaption>
          </figure>
        </section>

        {/* Always in the document — a crawler, and anyone who lands here with a
            broken clip, gets the written case either way. It is only held back
            from the eye and the tab order until the reveal. */}
        <div
          ref={caseRef}
          className="sg-hire__case"
          data-state={revealed ? "open" : "closed"}
          inert={!revealed || undefined}
          tabIndex={-1}
        >
          <span className="sg-hire__rule" aria-hidden="true" />

          {numbered.map((group) => (
            <section
              key={group.id}
              className="sg-hire__group"
              aria-labelledby={`sg-hire-${group.id}`}
            >
              <div className="sg-hire__group-head">
                <p className="sg-section-label">
                  {group.number} — {group.signal}
                </p>
                <h2 id={`sg-hire-${group.id}`} className="sg-hire__group-title">
                  {group.signal}
                </h2>
              </div>

              <ul className="sg-hire__cards">
                {group.items.map((item) => (
                  <li key={item.id} className="sg-hire__card">
                    <span className="sg-hire__card-number" aria-hidden="true">
                      {item.number}
                    </span>
                    <h3 className="sg-hire__card-title">{item.title}</h3>
                    <p className="sg-hire__card-detail">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="sg-hire__client" aria-labelledby="sg-hire-client">
            <div className="sg-hire__group-head">
              <p className="sg-section-label">
                {clientNumber} — {client.label}
              </p>
              <h2 id="sg-hire-client" className="sg-hire__group-title">
                {client.lines.map((line) => (
                  <span key={line} className="sg-hire__line">
                    {line}
                  </span>
                ))}
              </h2>
            </div>

            <p className="sg-hire__client-lede">{client.lede}</p>

            <div className="sg-hire__client-panel">
              <p className="sg-hire__client-meta">
                <span>{clientWork.kind}</span>
                {clientWork.year ? <span>{clientWork.year}</span> : null}
              </p>

              <h3 className="sg-hire__client-name">{clientWork.name}</h3>
              <p className="sg-hire__client-summary">{clientWork.summary}</p>

              {clientWork.scope.length > 0 ? (
                <p className="sg-hire__client-scope">
                  <span className="sg-hire__client-scope-label">
                    {client.scopeLabel}
                  </span>
                  {clientWork.scope.join(" · ")}
                </p>
              ) : null}

              <a
                className="sg-hire__client-link"
                href={clientWork.url}
                target="_blank"
                rel="noreferrer"
              >
                {clientWork.displayUrl}
                <span aria-hidden="true"> ↗</span>
                <span className="visually-hidden">
                  {" "}
                  — {client.visit} (opens in a new tab)
                </span>
              </a>
            </div>

            {/* Absent until the client has read the words and agreed to them.
                The work above stands on its own in the meantime. */}
            {testimonialReady ? (
              <figure className="sg-hire__quote">
                <blockquote className="sg-hire__quote-text">
                  {clientWork.testimonial.quote}
                </blockquote>
                <figcaption className="sg-hire__quote-source">
                  <span className="sg-hire__quote-author">
                    {clientWork.testimonial.author}
                  </span>
                  {clientWork.testimonial.role ? (
                    <span>{clientWork.testimonial.role}</span>
                  ) : null}
                </figcaption>
              </figure>
            ) : null}
          </section>

          <section className="sg-hire__closer" aria-labelledby="sg-hire-closer">
            <h2 id="sg-hire-closer" className="sg-hire__closer-title">
              {copy.closer.lines.map((line) => (
                <span key={line} className="sg-hire__line">
                  {line}
                </span>
              ))}
            </h2>
            <p className="sg-hire__closer-lede">{copy.closer.lede}</p>
            <div className="sg-hero__ctas sg-hire__closer-ctas">
              <Link href="/#contact" className="sg-hero__cta">
                {copy.closer.cta}
                <span aria-hidden="true">→</span>
              </Link>
              {/* Straight to the chapters rather than the top of the page: the
                  case has just been made, and the evidence for it is the work. */}
              <Link href={WORK_ROUTE} className="sg-hero__cta sg-hero__cta--ghost">
                {copy.closer.work}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
