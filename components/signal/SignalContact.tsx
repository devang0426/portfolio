"use client";

import { useEffect, useRef } from "react";
import { about } from "@/data/about";
import { phoneHref, signalNumber, site } from "@/data/site";
import { ContactHoneypot, useContactForm } from "@/components/shared/ContactForm";

export function SignalContact() {
  const { ids, kinds, kind, setKind, status, transport, statusMessage, onSubmit, reset } =
    useContactForm();
  const copy = about.contact.signal;
  const done = status === "sent";
  const panel = useRef<HTMLDivElement>(null);

  // The form that held focus has just been replaced. Without this, focus falls
  // back to the body and a keyboard visitor is dropped at the top of the page
  // with no idea whether anything happened.
  useEffect(() => {
    if (done) panel.current?.focus();
  }, [done]);

  return (
    <section id="contact" className="sg-contact" aria-labelledby="sg-contact-title">
      <div className="sg-contact__lead">
        <p className="sg-section-label sg-section-label--ink">
          {signalNumber("contact")} — Contact
        </p>
        <h2 id="sg-contact-title" className="sg-contact__title">
          {copy.lines[0]}
          <br />
          {copy.lines[1]}
        </h2>
        <p className="sg-contact__lede">{copy.lede}</p>
        <ul className="sg-contact__links">
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <a href={phoneHref}>{site.phone}</a>
          </li>
          {site.resume ? (
            <li>
              <a href={site.resume} target="_blank" rel="noreferrer">
                résumé (pdf) ↗
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
          className="sg-confirm"
          ref={panel}
          tabIndex={-1}
          role="status"
          aria-live="polite"
        >
          <span className="sg-confirm__mark" aria-hidden="true" />
          <h3 className="sg-confirm__title">
            {(transport === "endpoint" ? copy.done.sent : copy.done.mail).map(
              (line, i) => (
                <span key={line}>
                  {line}
                  {i === 0 ? <br /> : null}
                </span>
              ),
            )}
          </h3>
          <p className="sg-confirm__lede">{statusMessage}</p>
          <button type="button" className="sg-confirm__again" onClick={reset}>
            {copy.again}
          </button>
        </div>
      ) : (
      <form className="sg-form" onSubmit={onSubmit}>
        <ContactHoneypot />

        <label className="sg-form__field" htmlFor={ids.name}>
          <span>Name</span>
          <input id={ids.name} name="name" type="text" autoComplete="name" required />
        </label>

        <label className="sg-form__field" htmlFor={ids.email}>
          <span>Email</span>
          <input id={ids.email} name="email" type="email" autoComplete="email" required />
        </label>

        <fieldset className="sg-form__kinds">
          <legend>Subject</legend>
          <div className="sg-form__kind-row">
            {kinds.map((option) => (
              <button
                key={option}
                type="button"
                className="sg-form__kind"
                aria-pressed={option === kind}
                onClick={() => setKind(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="sg-form__field" htmlFor={ids.brief}>
          <span>Brief</span>
          <textarea id={ids.brief} name="brief" rows={3} required />
        </label>

        <button
          type="submit"
          className="sg-form__submit"
          disabled={status === "sending"}
          /* So the outcome — an error above all — is read out when focus
             returns to the button rather than only when it first appears. */
          aria-describedby={ids.status}
        >
          {status === "sending" ? copy.pending : copy.submit}
        </button>

        {/* Visible as well as announced: a form that reports only to screen
            readers leaves everyone else guessing whether it worked. */}
        <p
          id={ids.status}
          role="status"
          aria-live="polite"
          className="sg-form__status"
          data-state={status === "idle" ? undefined : status}
        >
          {statusMessage}
        </p>
      </form>
      )}

      <footer className="sg-footer">
        <span>© {site.year} {site.name}</span>
      </footer>
    </section>
  );
}
