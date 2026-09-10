import { sections, site } from "./site";

/** The route the hero buttons point at, so no string is written twice. */
export const HIRE_ROUTE = "/hire";

/**
 * Back to the work itself. Written against `sections` rather than as a literal
 * so renaming that anchor cannot quietly leave this page pointing at nothing —
 * both aesthetics give the work section this id, which is why one constant
 * serves the whole page.
 */
export const WORK_ROUTE = `/#${sections.find((s) => s.id === "work")!.id}`;

/**
 * The pitch video.
 *
 * Swap the file at this path and nothing else changes — the player and the
 * reveal both read it from here. `type` is declared so the browser can reject
 * an unplayable file up front rather than stalling on it; change it with the
 * extension if you move to WebM.
 *
 * The case below this clip stays sealed until the clip has run once, so a
 * missing file matters more here than it looks: it is handled as the gate
 * failing open, and the written case appears immediately rather than being
 * locked behind a video that does not exist.
 */
export const hireVideo = {
  src: "/hire/why-hire-me.mp4",
  type: "video/mp4",
  /** The video's accessible name — a `<video>` with no label is announced as
      nothing at all. */
  label: "A short spoken introduction from Devang Sharma",
  /**
   * Captions. EMPTY BY DESIGN, and the one thing on this page still worth
   * fixing: a spoken pitch with no captions is a spoken pitch a deaf recruiter
   * cannot read, and one that plays muted by default is a pitch *nobody* reads
   * until they find the unmute.
   *
   * Write a WebVTT file, drop it in `public/hire/`, and put the path here — the
   * track element appears on its own, in both aesthetics. The written case
   * below the clip is the standing fallback until then.
   */
  captions: "" as string,
  captionsLang: "en",
};

export interface Strength {
  id: string;
  /** Zero-padded ordinal within its group. */
  number: string;
  title: string;
  /** One sentence of evidence. Every claim here is something the work shows. */
  detail: string;
}

export interface StrengthGroup {
  id: "technical" | "human";
  /** Signal sets group headings in condensed caps; Blueprint in lowercase mono. */
  signal: string;
  blueprint: string;
  items: Strength[];
}

const number = (i: number) => String(i + 1).padStart(2, "0");

const group = (
  id: StrengthGroup["id"],
  signal: string,
  blueprint: string,
  items: Omit<Strength, "number">[],
): StrengthGroup => ({
  id,
  signal,
  blueprint,
  items: items.map((item, i) => ({ ...item, number: number(i) })),
});

/**
 * The case itself, in one place and in one voice. Both aesthetics render this
 * same list — they disagree only about typography, numbering and how the cards
 * arrive, exactly as they do for every other section.
 */
export const strengths: StrengthGroup[] = [
  group("technical", "Technical", "technical strengths", [
    {
      id: "full-stack",
      title: "Full-stack developer",
      detail:
        "Interface, API, data model and deployment are one job to me, not four handoffs. Four production systems shipped end to end on Next.js and TypeScript, with Postgres and Prisma behind them.",
    },
    {
      id: "ai",
      title: "AI developer",
      detail:
        "AI features designed around their failure modes — an agent that writes nodes and edges into a live canvas, and one that can complete a purchase only inside a hard spending cap.",
    },
    {
      id: "realtime",
      title: "Real-time & distributed systems",
      detail:
        "Multiplayer cursors and viewport sync under 50ms on Liveblocks, durable background runs streaming status back through Trigger.dev, and Kafka and Spring Boot on the JVM side.",
    },
  ]),
  group("human", "Non-technical", "how i work", [
    {
      id: "reliable",
      title: "Punctual and reliable",
      detail:
        "If I give you a date, I hold it — and if something is going to slip, you hear it early enough that it is still a choice rather than an apology.",
    },
    {
      id: "pressure",
      title: "Calm under pressure",
      detail:
        "A production incident and a demo-day deadline are the same problem: triage, fix what is actually broken, then write down why it broke so it stops being interesting.",
    },
    {
      id: "learner",
      title: "Fast learner",
      detail:
        "Most of the stack behind the newest project was unfamiliar the week I started it. Reading the source beats waiting for a tutorial to exist.",
    },
    {
      id: "detail",
      title: "Detail-oriented to a fault",
      detail:
        "The kind of perfectionist who cares that the focus ring is visible, the empty state is designed, and the error message tells the truth about what went wrong.",
    },
  ]),
];

/**
 * The one piece of work on this site that somebody else paid for and depended
 * on — which is why it sits after the strengths rather than among them. The
 * cards above are things Devang says about himself; this is the only thing on
 * the page a stranger can go and check.
 *
 * Everything in `project` is observable from the live site. Nothing about the
 * engagement — dates, duration, who did what — is asserted here, because none
 * of it is visible from outside and inventing it would put a made-up fact next
 * to a real client's name.
 */
export const clientWork = {
  name: "Bharat Aarambh Legacy",
  url: "https://www.bharataarambhlegacy.com/",
  /** Shown as the link text; the scheme and the `www.` are noise on a page. */
  displayUrl: "bharataarambhlegacy.com",
  kind: "Premium real-estate consultancy · Jaipur",
  summary:
    "A marketing site for a Jaipur real-estate consultancy: property showcase, service lines and an enquiry flow. Built on Next.js, with the image pipeline and the typography tuned for a business that sells on how things look.",
  /**
   * FILL THESE IN — they are the facts only you have.
   *
   * An empty string renders nothing at all rather than a gap or a guess, so the
   * section is honest today and better the moment you complete it.
   */
  year: "",
  /** e.g. ["Design", "Build", "Deployment"] — what you were actually responsible for. */
  scope: [] as string[],

  testimonial: {
    /**
     * A DRAFT, written to be edited — not a quote anyone has given yet.
     *
     * Send it to your client, let them change whatever they like, and publish
     * what comes back. A testimonial is a claim about what another person
     * thinks, and the only thing that makes it true is that person having read
     * the sentence and said yes. It is also the difference between a recruiter
     * ringing them and hearing "yes, we said that" and hearing "we said what?".
     *
     * Their own wording will read better than this anyway. Ghostwritten praise
     * has a sound, and everyone who has ever read a testimonial knows it.
     */
    quote:
      "Devang built our website end to end and handled the whole process professionally. He understood what we wanted quickly, kept us updated throughout, and delivered on time. We are very happy with the result.",
    /** Who said it. Both are required before it can render. */
    author: "",
    role: "",
    /**
     * The gate. Flip to `true` once the client has read the exact words above
     * and agreed to them — then, and only then, does the quote appear on the
     * page. Until it does, the project still shows: the work is real whether or
     * not anyone has got round to writing a sentence about it.
     */
    approvedByClient: false,
  },
};

/** Everything the testimonial needs before it is safe to put on a page. */
export const testimonialReady =
  clientWork.testimonial.approvedByClient &&
  clientWork.testimonial.quote.trim() !== "" &&
  clientWork.testimonial.author.trim() !== "";

/**
 * Page copy in each aesthetic's dialect — the same argument, spoken twice, the
 * way `about.ts` already handles the hero and the contact section.
 */
export const hire = {
  /** The entry button, in both heroes. */
  cta: {
    signal: "Why should you hire me?",
    blueprint: "why should you hire me?",
  },
  /** What the player announces while the clip runs. */
  intro: {
    signal: {
      eyebrow: "// thirty seconds of context, in about seven",
      unmute: "Unmute",
      mute: "Mute",
      play: "Play",
      replay: "Replay",
      blocked: "Your browser held the video back. Press play when you're ready.",
      failed: "The video could not load — the case is written out below.",
    },
    blueprint: {
      eyebrow: "// brief.mp4 — thirty seconds of context, in about seven",
      unmute: "unmute",
      mute: "mute",
      play: "play",
      replay: "replay",
      blocked: "your browser held the clip back. press play when you're ready.",
      failed: "clip unavailable — the written case is below.",
    },
  },
  /** The client-work section, in both voices. */
  client: {
    signal: {
      label: "Client work",
      /** Split across lines the way Signal sets every display heading. */
      lines: ["Someone", "paid", "for this."],
      lede: "Everything above this line is me describing myself. This part isn't — it shipped, it is still up, and the people who commissioned it are reachable.",
      visit: "Visit the site",
      scopeLabel: "Scope",
    },
    blueprint: {
      label: "client work",
      title: "Someone paid",
      accent: "for this",
      lede: "Everything above this line is a self-assessment. This part is not — it shipped, it is still up, and the people who commissioned it are reachable.",
      visit: "visit the site",
      scopeLabel: "scope",
    },
  },
  signal: {
    label: "",
    /** Split across lines the way Signal sets every display heading. */
    lines: ["Why", "hire", "me?"],
    lede: "4+ production systems, and a habit of finishing the parts nobody enjoys. Here is the short version.",
    back: "Back to the portfolio",
    closer: {
      lines: ["Still", "reading?"],
      lede: `That is usually a good sign. Tell me what you're building — I reply within 24 hours.`,
      cta: "Get in touch",
      /* The other thing to do at the end of a pitch: go and check it. */
      work: "View my work",
    },
  },
  blueprint: {
    label: "why me",
    title: "Why you should",
    accent: "hire me",
    lede: "Two years, four production systems, and a habit of finishing the parts nobody enjoys. The short version, set out below.",
    back: "back to the portfolio",
    closer: {
      title: "Still reading",
      suffix: ".good sign",
      lede: `Tell me what you're building. I reply within 24 hours with scope, a timeline and a time to talk.`,
      cta: "Get in touch",
      /* The other thing to do at the end of a pitch: go and check it. */
      work: "view my work",
    },
  },
  /** Shared between both closers, so the address can never disagree with the site. */
  email: site.email,
};
