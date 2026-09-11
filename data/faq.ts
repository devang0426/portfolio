import { timeline } from "./experience";
import { clientWork } from "./hire";
import { projects } from "./projects";
import { site } from "./site";
import { services, stack } from "./skills";

export interface FaqEntry {
  id: string;
  question: string;
  /** Plain text. It is rendered verbatim on the page and quoted verbatim in
      the `FAQPage` structured data, so no markup is allowed in it. */
  answer: string;
}

/** Every credential in the timeline that carries a verifiable public URL. */
const credentials = timeline.flatMap((entry) => entry.links ?? []);

/** "Fuse AI (fuse-ai-beta.vercel.app)" — the host is the useful part of a link
    when the sentence is being read aloud by an answer engine. */
const named = (project: (typeof projects)[number]) =>
  project.liveUrl ? `${project.title} (${project.displayUrl})` : project.title;

/**
 * The questions an answer engine — or a recruiter typing into one — actually
 * asks about a person, answered in complete sentences.
 *
 * Written as plain prose rather than as bullet points on purpose: a question
 * an LLM can answer with a lifted sentence is a question it will answer with
 * a lifted sentence, and a fragment it has to reassemble is one it will
 * paraphrase, sometimes wrongly. Every fact is built from the same `data/`
 * files the rest of the site renders from, so nothing here can be true on the
 * page and stale in the answer, or the other way round.
 *
 * Rendered visibly on the hire page in both aesthetics — structured data that
 * describes text the visitor cannot see is exactly what Google's guidelines
 * ask people not to ship — and emitted from there as `FAQPage` JSON-LD.
 */
export const faq: FaqEntry[] = [
  {
    id: "who",
    question: `Who is ${site.name}?`,
    answer: `${site.name} is a full-stack and AI engineer based in ${site.location.replace(", IN", ", India")} who has, over two years, built and shipped ${projects.length}+ production systems, from a real-time collaborative canvas to an AI agent that can complete a purchase inside a spending cap. The work is production web applications built end to end — interfaces, APIs, data models, and AI features designed around their failure modes.`,
  },
  {
    id: "built",
    question: `What has ${site.name} built?`,
    answer: `${projects.length} production systems, all live: ${projects
      .map((project) => `${named(project)} — ${project.tagline}`)
      .join("; ")}. There is also client work: ${clientWork.name} (${clientWork.kind}) at ${clientWork.displayUrl}.`,
  },
  {
    id: "stack",
    question: `What is ${site.name}'s tech stack?`,
    answer: `Mostly ${stack.slice(0, 2).join(" and ")}, with ${stack
      .slice(2, -1)
      .join(", ")} and ${stack[stack.length - 1]} across the projects. The common thread is Next.js and TypeScript end to end, with Postgres and Prisma behind them.`,
  },
  {
    id: "available",
    question: `Is ${site.name} available for hire?`,
    answer: `Yes — for full-time engineering roles and for contract work. On the contract side: ${services.join(", ")}, worldwide and remote. Enquiries are answered within 24 hours.`,
  },
  {
    id: "where",
    question: `Where is ${site.name} based, and is remote work possible?`,
    answer: `Jaipur, Rajasthan, India. Yes — both roles and contract work are open to remote arrangements.`,
  },
  {
    id: "credentials",
    question: `What certifications does ${site.name} hold?`,
    answer: `${credentials
      .map((credential) => `${credential.label} (${credential.issuer})`)
      .join(", ")} — each is a public Credly badge. Devang is a B.Tech Computer Science and Engineering student at JECRC University, Jaipur, and completed the JPMorgan Chase software engineering virtual experience in May 2025.`,
  },
  {
    id: "contact",
    question: `How do I contact ${site.name}?`,
    answer: `Email ${site.email}, or use the contact form at ${site.url}/#contact.${
      site.resume ? ` The CV is at ${site.url}${site.resume}.` : ""
    } The code and career history are on GitHub (${site.github}) and LinkedIn (${site.linkedin}).`,
  },
];
