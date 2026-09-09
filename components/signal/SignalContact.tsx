"use client";

import { about } from "@/data/about";
import { signalNumber, site } from "@/data/site";
import { ContactHoneypot, useContactForm } from "@/components/shared/ContactForm";

export function SignalContact() {
  const { ids, kinds, kind, setKind, status, statusMessage, onSubmit } =
    useContactForm();
  const copy = about.contact.signal;

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

      <footer className="sg-footer">
        <span>© {site.year} {site.name}</span>
      </footer>
    </section>
  );
}
