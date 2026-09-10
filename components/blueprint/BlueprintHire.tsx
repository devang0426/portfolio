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
import { blueprintMotion } from "@/aesthetics/blueprint/animations";
import { useBlueprintStock } from "@/lib/blueprint-stock";
import { gsap } from "@/lib/gsap";
import { useHireIntro } from "@/lib/useHireIntro";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import { nudgeIntoView } from "@/lib/useSmoothScroll";

const copy = hire.blueprint;
const intro = hire.intro.blueprint;
const client = hire.client.blueprint;

/** The client sheet follows the two strength figures, so it takes the next one. */
const clientNumber = String(strengths.length + 1).padStart(2, "0");

/** Blueprint numbers by figure, and this sheet carries two of them. */
const figures = strengths.map((group, index) => ({
  ...group,
  number: String(index + 1).padStart(2, "0"),
}));

export function BlueprintHire() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const player = useHireIntro(videoRef);
  const { revealed, revealReason, status, reduced } = player;
  const [stock, toggleStock] = useBlueprintStock();

  const caseRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = caseRef.current;
    if (!root || !revealed) return;
    if (reduced) return;

    const context = gsap.context(() => {
      const { enter, stagger, travel, gsapEase } = blueprintMotion;
      const timeline = gsap.timeline();

      // Blueprint draws rather than arrives: the rule is ruled in, the figure
      // labels are lettered, then the sheets are laid down one after another.
      timeline
        .from(".bp-hire__rule", {
          scaleX: 0,
          duration: enter,
          ease: gsapEase,
          transformOrigin: "left center",
        })
        .from(
          ".bp-hire__group-head",
          {
            opacity: 0,
            y: travel * 0.6,
            duration: enter * 0.8,
            ease: gsapEase,
            stagger: stagger * 4,
          },
          "-=0.3",
        )
        .from(
          ".bp-hire__card",
          { opacity: 0, y: travel, duration: enter, ease: gsapEase, stagger },
          "<0.08",
        )
        .from(
          ".bp-hire__client-panel, .bp-hire__quote",
          {
            opacity: 0,
            y: travel,
            duration: enter,
            ease: gsapEase,
            stagger: stagger * 2,
          },
          "-=0.25",
        )
        .from(
          ".bp-hire__closer",
          { opacity: 0, y: travel, duration: enter, ease: gsapEase },
          "-=0.3",
        );
    }, root);

    if (revealReason === "watched") {
      // The clip has just finished, so the sheet moves to the case and the
      // keyboard goes with it.
      root.focus({ preventScroll: true });
      nudgeIntoView(root);
    }

    return () => context.revert();
    // `reduced` is read once, at the reveal it cannot change in the middle of.
  }, [revealed, reduced, revealReason]);

  return (
    <div className="portfolio-root bp-root bp-hire">
      <div className="bp-rail">
        <Link href="/" className="bp-rail__mark">
          {site.initials}
          <span className="visually-hidden"> — back to the portfolio</span>
        </Link>

        {/* No figure list on this sheet: it is one drawing, not a set. The lamp
            still belongs here — losing the paper/ink stock on the way to this
            page would be losing Blueprint's dark mode. */}
        <button
          type="button"
          className="bp-rail__lamp bp-hire__lamp"
          onClick={toggleStock}
          aria-pressed={stock === "ink"}
          title="Paper / ink stock"
        >
          <span className="bp-rail__lamp-dot" aria-hidden="true" />
          <span className="visually-hidden">
            {stock === "ink" ? "Switch to paper stock" : "Switch to ink stock"}
          </span>
        </button>

        <p className="bp-rail__index" aria-hidden="true">
          sheet 00 / 03
        </p>
      </div>

      <header className="bp-topbar">
        <nav aria-label="Primary" className="bp-topbar__links">
          <Link href="/">{copy.back}</Link>
          <Link href="/#contact" className="bp-topbar__link--strong">
            contact →
          </Link>
        </nav>
      </header>

      <main id="main" className="bp-main">
        <section className="bp-hire__intro" aria-labelledby="bp-hire-title">
          <h1 id="bp-hire-title" className="bp-hire__title">
            {copy.title} <em className="bp-serif">{copy.accent}</em>.
          </h1>

          <p className="bp-hire__lede">{copy.lede}</p>

          <figure className="bp-hire__stage" data-status={status}>
            <video
              ref={videoRef}
              className="bp-hire__video"
              aria-label={hireVideo.label}
              /* `muted` and `playsInline` are what make an autoplay legal on a
                 phone at all; the hook offers the unmute the moment it runs. */
              muted
              playsInline
              preload="auto"
              /* Not `autoPlay`: the hook calls play() itself so a refusal is
                 something this sheet can see and answer, rather than a frame
                 that silently never becomes a second frame. */
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

            <span className="bp-hire__track" aria-hidden="true">
              <span
                className="bp-hire__progress"
                style={{ transform: `scaleX(${player.progress})` }}
              />
            </span>

            <figcaption className="bp-hire__controls">
              <span className="bp-hire__meta">
                {status === "failed"
                  ? intro.failed
                  : status === "blocked"
                    ? intro.blocked
                    : intro.eyebrow}
              </span>

              <span className="bp-hire__actions">
                {status === "playing" ? (
                  <button
                    type="button"
                    className="bp-hire__control"
                    onClick={player.toggleMute}
                    data-on={!player.muted || undefined}
                  >
                    {player.muted ? intro.unmute : intro.mute}
                  </button>
                ) : null}

                {status === "blocked" || status === "ended" ? (
                  <button
                    type="button"
                    className="bp-hire__control"
                    onClick={player.play}
                  >
                    {status === "ended" ? intro.replay : intro.play}
                  </button>
                ) : null}
</span>
            </figcaption>
          </figure>
        </section>

        {/* Always in the document — a crawler, and anyone who lands here with a
            broken clip, gets the written case either way. It is only held back
            from the eye and the tab order until the reveal. */}
        <div
          ref={caseRef}
          className="bp-hire__case"
          data-state={revealed ? "open" : "closed"}
          inert={!revealed || undefined}
          tabIndex={-1}
        >
          <span className="bp-hire__rule" aria-hidden="true" />

          {figures.map((group) => (
            <section
              key={group.id}
              className="bp-hire__group"
              aria-labelledby={`bp-hire-${group.id}`}
            >
              <div className="bp-hire__group-head">
                <p className="bp-figure-label">
                  fig. {group.number} — {group.blueprint}
                </p>
                <h2 id={`bp-hire-${group.id}`} className="bp-hire__group-title">
                  {group.blueprint}
                </h2>
              </div>

              <ul className="bp-hire__cards">
                {group.items.map((item) => (
                  <li key={item.id} className="bp-hire__card">
                    <p className="bp-hire__card-meta">
                      <span>
                        fig. {group.number}.{item.number}
                      </span>
                      <span>{group.blueprint}</span>
                    </p>
                    <h3 className="bp-hire__card-title">{item.title}</h3>
                    <p className="bp-hire__card-detail">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="bp-hire__client" aria-labelledby="bp-hire-client">
            <div className="bp-hire__group-head">
              <p className="bp-figure-label">
                fig. {clientNumber} — {client.label}
              </p>
              <h2 id="bp-hire-client" className="bp-hire__group-title">
                {client.title} <em className="bp-serif">{client.accent}</em>.
              </h2>
            </div>

            <p className="bp-hire__client-lede">{client.lede}</p>

            <div className="bp-hire__client-panel">
              <p className="bp-hire__card-meta">
                <span>{clientWork.kind.toLowerCase()}</span>
                {clientWork.year ? <span>{clientWork.year}</span> : null}
              </p>

              <h3 className="bp-hire__client-name">{clientWork.name}</h3>
              <p className="bp-hire__client-summary">{clientWork.summary}</p>

              {clientWork.scope.length > 0 ? (
                <p className="bp-hire__client-scope">
                  <span className="bp-hire__client-scope-label">
                    {client.scopeLabel}
                  </span>
                  {clientWork.scope.join(" · ")}
                </p>
              ) : null}

              <a
                className="bp-hire__client-link"
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
              <figure className="bp-hire__quote">
                <blockquote className="bp-hire__quote-text">
                  <em className="bp-serif">“</em>
                  {clientWork.testimonial.quote}
                </blockquote>
                <figcaption className="bp-hire__quote-source">
                  <span className="bp-hire__quote-author">
                    {clientWork.testimonial.author}
                  </span>
                  {clientWork.testimonial.role ? (
                    <span>{clientWork.testimonial.role}</span>
                  ) : null}
                </figcaption>
              </figure>
            ) : null}
          </section>

          <section className="bp-hire__closer" aria-labelledby="bp-hire-closer">
            <h2 id="bp-hire-closer" className="bp-hire__closer-title">
              {copy.closer.title}
              <em className="bp-serif">{copy.closer.suffix}</em>
            </h2>
            <p className="bp-hire__closer-lede">{copy.closer.lede}</p>
            <div className="bp-hire__closer-actions">
              <Link href="/#contact" className="bp-button">
                {copy.closer.cta}
              </Link>
              {/* Straight to fig. 01 rather than the top of the sheet set: the
                  case has just been made, and the evidence for it is the work. */}
              <Link href={WORK_ROUTE} className="bp-button bp-button--ghost">
                {copy.closer.work}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
