"use client";

import { useEffect, useRef } from "react";
import { about } from "@/data/about";
import { phoneHref, site } from "@/data/site";
import { ContactHoneypot, useContactForm } from "@/components/shared/ContactForm";

export function BlueprintContact() {
  const { ids, kinds, kind, setKind, status, transport, statusMessage, onSubmit, reset } =
    useContactForm();
  const copy = about.contact.blueprint;
  const done = status === "sent";
  const stamp = transport === "endpoint" ? copy.done.sent : copy.done.mail;
  const panel = useRef<HTMLDivElement>(null);

  // The form that held focus has just been replaced; focus follows it.
  useEffect(() => {
    if (done) panel.current?.focus();
  }, [done]);

  return (
    <section id="contact" className="bp-contact" aria-labelledby="bp-contact-title">
      <div>
        <p className="bp-figure-label">spec sheet</p>
        <h2 id="bp-contact-title" className="bp-contact__title">
          {copy.title}
          <em className="bp-serif">{copy.suffix}</em>
        </h2>
        <p className="bp-contact__lede">{copy.lede}</p>
        <ul className="bp-contact__links">
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <a href={phoneHref}>{site.phone}</a>
          </li>
          {site.resume ? (
            <li>
              <a href={site.resume} target="_blank" rel="noreferrer">
                résumé.pdf ↗
              </a>
            </li>
          ) : null}
          <li>
            <a href={site.github} target="_blank" rel="noreferrer">
              github ↗
            </a>
          </li>
          <li>
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              linkedin ↗
            </a>
          </li>
        </ul>
      </div>

      {done ? (
        <div
          className="bp-confirm"
          ref={panel}
          tabIndex={-1}
          role="status"
          aria-live="polite"
        >
          <p className="bp-confirm__stamp" aria-hidden="true">
            ✓ logged
          </p>
          <h3 className="bp-confirm__title">
            {stamp.title}
            <em className="bp-serif">{stamp.suffix}</em>
          </h3>
          <p className="bp-confirm__lede">{statusMessage}</p>
          <button type="button" className="bp-confirm__again" onClick={reset}>
            {copy.again}
          </button>
        </div>
      ) : (
      <form className="bp-form" onSubmit={onSubmit}>
        <ContactHoneypot />

        <label className="bp-form__row" htmlFor={ids.name}>
          <span>name:</span>
          <input id={ids.name} name="name" type="text" autoComplete="name" required />
        </label>

        <label className="bp-form__row" htmlFor={ids.email}>
          <span>email:</span>
          <input id={ids.email} name="email" type="email" autoComplete="email" required />
        </label>

        <fieldset className="bp-form__row bp-form__row--kinds">
          <legend>subject:</legend>
          {kinds.map((option) => (
            <button
              key={option}
              type="button"
              className="bp-form__kind"
              aria-pressed={option === kind}
              onClick={() => setKind(option)}
            >
              {option.toLowerCase()}
            </button>
          ))}
        </fieldset>

        <label className="bp-form__row bp-form__row--brief" htmlFor={ids.brief}>
          <span>brief:</span>
          <textarea id={ids.brief} name="brief" rows={4} required />
        </label>

        <button
          type="submit"
          className="bp-form__submit"
          disabled={status === "sending"}
          /* So the outcome — an error above all — is read out when focus
             returns to the button rather than only when it first appears. */
          aria-describedby={ids.status}
        >
          {status === "sending" ? copy.pending : copy.submit}
        </button>

        {/* Visible as well as announced — the drawing-set equivalent of a
            stamped note in the margin. */}
        <p
          id={ids.status}
          role="status"
          aria-live="polite"
          className="bp-form__status"
          data-state={status === "idle" ? undefined : status}
        >
          {statusMessage}
        </p>
      </form>
      )}

      <footer className="bp-footer">
        <span>
          © {site.year} {site.name} · drawn in Jaipur
        </span>
      </footer>
    </section>
  );
}
