"use client";

import { useCallback, useId, useState } from "react";
import { projectKinds } from "@/data/skills";
import { site } from "@/data/site";

/**
 * Where a submission goes.
 *
 * `NEXT_PUBLIC_CONTACT_ENDPOINT` is any service that accepts a JSON POST —
 * Web3Forms, Formspree, a route handler of your own. `NEXT_PUBLIC_CONTACT_ACCESS_KEY`
 * is sent as `access_key`, which is how Web3Forms (the one option needing no
 * account) authenticates a form; services that do not want it ignore it.
 *
 * With no endpoint configured the form hands the message to the visitor's mail
 * client instead — honest, backend-free, and it still delivers. What it must
 * never do is claim to have sent something it has not.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
const ACCESS_KEY = process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY;

/**
 * A field no human ever sees, and therefore no human ever fills. Bots that
 * complete every input in a form give themselves away here and are dropped
 * before the request is made. It is not a wall, but it is free, and it costs a
 * real visitor nothing.
 */
export const HONEYPOT = "company_website";

export type ContactStatus = "idle" | "sending" | "sent" | "error";

export type ContactTransport = "endpoint" | "mail";

export interface ContactFormRenderProps {
  ids: { name: string; email: string; brief: string; status: string };
  kinds: string[];
  kind: string;
  setKind: (kind: string) => void;
  status: ContactStatus;
  /**
   * How the message actually travelled. The confirmation has to know: a
   * message handed to the visitor's mail client has *not* been sent, and
   * saying so would be the same lie in nicer packaging.
   */
  transport: ContactTransport;
  /** Visible, truthful account of the current state. Empty while idle. */
  statusMessage: string;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  /** Return to a blank form after a confirmation. */
  reset: () => void;
}

const transport: ContactTransport = ENDPOINT ? "endpoint" : "mail";

/** Mechanics, not voice — the same in both aesthetics, which style it themselves. */
const STATUS_COPY: Record<Exclude<ContactStatus, "idle">, string> = {
  sending: "Sending…",
  sent:
    transport === "endpoint"
      ? "Message sent. I will be in touch within 24 hours."
      : `Your email app is opening with the message ready to send. If nothing happened, write to ${site.email} directly.`,
  error: `That did not send. Email ${site.email} directly and it will reach me.`,
};

interface Fields {
  name: string;
  email: string;
  kind: string;
  brief: string;
}

const mailtoFor = (fields: Fields) => {
  const body = [fields.brief, "", "—", `${fields.name} · ${fields.email}`].join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(
    `${fields.kind} — ${fields.name}`,
  )}&body=${encodeURIComponent(body)}`;
};

/**
 * The one shape sent to whichever service is configured. The duplication is
 * deliberate and cheap: Web3Forms reads `subject`, FormSubmit and Formspree
 * read `_subject`, and sending both keeps the endpoint swappable without a
 * code change. `_captcha` matters — FormSubmit otherwise answers an AJAX post
 * with a captcha page no fetch can complete.
 */
const payloadFor = (fields: Fields) => {
  const subject = `Portfolio — ${fields.kind} — ${fields.name}`;
  return {
    ...(ACCESS_KEY ? { access_key: ACCESS_KEY } : {}),
    subject,
    _subject: subject,
    from_name: fields.name,
    _captcha: "false",
    _template: "table",
    ...fields,
  };
};

/**
 * Did the service accept it? Returns null when the body says nothing either
 * way, leaving the HTTP status to decide.
 *
 * The string case is load-bearing, not defensive noise: FormSubmit answers a
 * *rejected* submission with HTTP 200 and `{"success":"false"}` — the string,
 * not the boolean. Checking only for a boolean would read that as success and
 * tell the visitor their message was sent when it was thrown away, which is
 * the exact failure this whole form was rewritten to stop doing.
 */
const succeeded = (body: unknown): boolean | null => {
  if (typeof body !== "object" || body === null) return null;
  const value = (body as { success?: unknown }).success;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return null;
};

/** Hidden off-screen rather than `display: none`, which bots learned to skip. */
export function ContactHoneypot() {
  return (
    <div className="contact-honeypot" aria-hidden="true">
      <label>
        Leave this field empty
        <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/**
 * Form state and delivery only — every pixel of the presentation belongs to the
 * aesthetic that renders it.
 */
export function useContactForm(): ContactFormRenderProps {
  const base = useId();
  const [kind, setKind] = useState(projectKinds[0]);
  const [status, setStatus] = useState<ContactStatus>("idle");

  const onSubmit = useCallback(
    (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);

      // Silently accepted, never delivered: a bot gets the same screen a person
      // does, and learns nothing about why it failed.
      if (String(data.get(HONEYPOT) ?? "")) {
        setStatus("sent");
        return;
      }

      const fields: Fields = {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        // The subject buttons are not form controls, so the choice is carried
        // explicitly rather than being silently dropped on the way out.
        kind,
        brief: String(data.get("brief") ?? ""),
      };

      if (!ENDPOINT) {
        window.location.href = mailtoFor(fields);
        setStatus("sent");
        return;
      }

      setStatus("sending");
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payloadFor(fields)),
      })
        .then(async (response) => {
          // Some services answer 200 with a failure body, so the body decides
          // when there is one and the status decides when there is not.
          let ok = response.ok;
          try {
            // FormSubmit sends JSON under a `text/html` content type, so the
            // body is parsed regardless of what the header claims.
            const verdict = succeeded(await response.json());
            if (verdict !== null) ok = verdict;
          } catch {
            /* not JSON — the status stands */
          }
          if (!ok) throw new Error(String(response.status));
          setStatus("sent");
          form.reset();
        })
        .catch(() => setStatus("error"));
    },
    [kind],
  );

  return {
    ids: {
      name: `${base}-name`,
      email: `${base}-email`,
      brief: `${base}-brief`,
      status: `${base}-status`,
    },
    kinds: projectKinds,
    kind,
    setKind,
    status,
    transport,
    statusMessage: status === "idle" ? "" : STATUS_COPY[status],
    onSubmit,
    reset: () => setStatus("idle"),
  };
}
