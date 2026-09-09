export interface ProjectStat {
  /** Short metric label, e.g. "features". */
  label: string;
  /** Metric value, e.g. "30+". */
  value: string;
}

/** A node in the project's architecture schematic, positioned in 0–1 space. */
export interface ProjectNode {
  label: string;
  x: number;
  y: number;
}

export interface Project {
  id: string;
  /** Zero-padded ordinal used by Signal ("01") and derived to a letter by Blueprint ("a"). */
  index: string;
  title: string;
  year: string;
  /** What kind of thing it is — Signal renders this as the chapter kind. */
  type: string;
  /** Editorial one-liner — Blueprint renders this as the serif tagline. */
  tagline: string;
  /** Long-form description. */
  description: string;
  /** Tighter rewrite used where vertical space is scarce. */
  summary: string;
  technologies: string[];
  stats: ProjectStat[];
  /** Architecture nodes for the Blueprint schematic panel. */
  nodes: ProjectNode[];
  /**
   * Product screenshot. Optional on purpose: a backend project has no interface,
   * and both aesthetics fall back to their own designed placeholder rather than
   * to a broken frame.
   */
  image?: { src: string; alt: string; width: number; height: number };
  /** Host shown in the Signal device chrome. */
  displayUrl: string;
  /** Signal chapter caption. */
  caption: string;
  liveUrl?: string;
  githubUrl?: string;
}

/**
 * Ordered oldest to newest. Signal's work rail is labelled "2025 ——— 2026" and
 * scrubs left to right, so the chapters have to run forwards in time for that
 * rail to be telling the truth.
 *
 * Every fact here comes from the CV or the project's own repository. Where a
 * repository is private the link is simply omitted rather than guessed at.
 */
export const projects: Project[] = [
  {
    id: "fuse",
    index: "01",
    title: "Fuse AI",
    year: "2026",
    type: "Collaborative system design",
    tagline: "draw your architecture by describing it",
    description:
      "A real-time canvas where teams sketch architectures together and an AI agent drafts the diagram from a sentence. 30+ canvas features, multiplayer cursors and viewport sync under 50ms, with durable background runs streaming their status back to the client.",
    summary:
      "Collaborative system-design canvas. An LLM agent writes nodes and edges into a shared Liveblocks room; viewport sync stays under 50ms across 30+ canvas features.",
    technologies: [
      "Next.js",
      "React Flow",
      "Liveblocks",
      "Gemini 2.5 Flash",
      "Trigger.dev",
      "Neon",
      "Clerk",
    ],
    stats: [
      { value: "30+", label: "features" },
      { value: "<50ms", label: "sync" },
      { value: "2026", label: "shipped" },
    ],
    nodes: [
      { label: "client canvas", x: 0.22, y: 0.2 },
      { label: "liveblocks room", x: 0.72, y: 0.2 },
      { label: "gemini agent", x: 0.24, y: 0.58 },
      { label: "trigger.dev", x: 0.72, y: 0.58 },
      { label: "neon", x: 0.5, y: 0.86 },
    ],
    image: {
      src: "/projects/fuse.jpg",
      alt: "The Fuse AI landing page: an AI agent mapping a described architecture onto a shared canvas.",
      width: 727,
      height: 606,
    },
    displayUrl: "fuse-ai-beta.vercel.app",
    caption:
      "The hard problems in real-time collaboration are conflict resolution and latency budgets, not the canvas itself.",
    liveUrl: "https://fuse-ai-beta.vercel.app",
  },
  {
    id: "papergen",
    index: "02",
    title: "PaperGen AI",
    year: "2026",
    type: "AI exam generator",
    tagline: "a syllabus in, a printable paper out",
    description:
      "Teachers set a subject, topics, difficulty and marks; PaperGen returns a complete paper with sections, a marking rubric and an auto-appended answer key. Gemini 2.5 Flash runs under a strict JSON schema, so the output arrives structured rather than parsed back out of markdown.",
    summary:
      "A configurable form in, a printable paper out: Gemini 2.5 Flash under a strict JSON schema, Zod-validated, exported to A4-accurate PDF with page-break awareness.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind v4",
      "Gemini 2.5 Flash",
      "jsPDF",
      "Zod",
      "React Hook Form",
    ],
    stats: [
      { value: "3", label: "question types" },
      { value: "A4", label: "pdf export" },
      { value: "10/min", label: "rate limit" },
    ],
    nodes: [
      { label: "config form", x: 0.24, y: 0.2 },
      { label: "zod schema", x: 0.72, y: 0.2 },
      { label: "gemini (json)", x: 0.72, y: 0.5 },
      { label: "rubric + key", x: 0.26, y: 0.5 },
      { label: "jspdf a4", x: 0.5, y: 0.72 },
      { label: "print mode", x: 0.5, y: 0.9 },
    ],
    image: {
      src: "/projects/papergen.jpg",
      alt: "The PaperGen AI landing page, showing a generated Class XII chemistry paper beside the prompt.",
      width: 1360,
      height: 606,
    },
    displayUrl: "papergen-xi.vercel.app",
    caption:
      "Structured output is the whole exercise: the schema is enforced before anything reaches the PDF pipeline.",
    liveUrl: "https://papergen-xi.vercel.app",
  },
  {
    id: "jobs",
    index: "03",
    title: "Job Console",
    year: "2026",
    type: "AI job-matching console",
    tagline: "transparent scoring, no auto-apply",
    description:
      "Scans live postings from ATS boards and job APIs, scores each against your CV across five structured dimensions with transparent rules, then turns the result into a match report, truthful CV tailoring and a Kanban pipeline. Nothing is auto-submitted and no experience is invented.",
    summary:
      "Aggregates postings from seven sources, scores each against your CV across five transparent dimensions, then tailors bullets and tracks applications on a nine-stage board.",
    technologies: [
      "Next.js 16",
      "TypeScript",
      "Prisma",
      "Neon Postgres",
      "Clerk",
      "Gemini 2.5 Flash",
      "Trigger.dev",
      "Playwright",
    ],
    stats: [
      { value: "7", label: "job sources" },
      { value: "5", label: "scoring dimensions" },
      { value: "9", label: "pipeline stages" },
    ],
    nodes: [
      { label: "ats + rss adapters", x: 0.24, y: 0.18 },
      { label: "dedupe", x: 0.72, y: 0.18 },
      { label: "match scorer", x: 0.72, y: 0.48 },
      { label: "cv tailor", x: 0.26, y: 0.48 },
      { label: "kanban", x: 0.5, y: 0.72 },
      { label: "neon postgres", x: 0.5, y: 0.9 },
    ],
    image: {
      src: "/projects/jobs.jpg",
      alt: "The Job Console landing page, showing a live scored feed with per-role match percentages and verified CV skills.",
      width: 1358,
      height: 610,
    },
    displayUrl: "job-sp.vercel.app",
    caption:
      "Scoring rules stay visible: nothing is auto-submitted and nothing is invented.",
    liveUrl: "https://job-sp.vercel.app",
    githubUrl: "https://github.com/devang0426/job_sp",
  },
  {
    id: "kinetic",
    index: "04",
    title: "Kinetic",
    year: "2026",
    type: "Guarded agentic commerce",
    tagline: "the agent proposes, you approve, it pays",
    description:
      "A menswear storefront with an AI concierge that can complete a purchase — inside a spending cap you set, only after your approval click. The agent proposes and never buys: proposals are price-locked server-side, caps are enforced by an atomic Redis reserve, and every step lands in an append-only audit log.",
    summary:
      "A storefront whose AI concierge can actually pay — inside a cap you set, only on your approval, with proposal, approval, payment and refund all written to an append-only audit log.",
    technologies: [
      "Next.js 16",
      "TypeScript",
      "Clerk",
      "MongoDB",
      "Upstash Redis",
      "Razorpay",
      "Zod",
      "Gemini",
    ],
    stats: [
      { value: "15min", label: "price lock" },
      { value: "48h", label: "idempotency" },
      { value: "Lua", label: "atomic cap" },
    ],
    nodes: [
      { label: "chat intent", x: 0.24, y: 0.16 },
      { label: "catalog (mongo)", x: 0.72, y: 0.16 },
      { label: "priced proposal", x: 0.72, y: 0.44 },
      { label: "approval click", x: 0.26, y: 0.44 },
      { label: "redis cap · lua", x: 0.26, y: 0.72 },
      { label: "razorpay + audit", x: 0.66, y: 0.88 },
    ],
    image: {
      src: "/projects/kinetic.jpg",
      alt: "The Kinetic storefront home page, with the AI concierge in the primary navigation.",
      width: 1366,
      height: 612,
    },
    displayUrl: "devang0426-kinetic.vercel.app",
    caption:
      "The interesting surface is the refusal path: no cap set, revoked session, or a second click on the same approval.",
    liveUrl: "https://devang0426-kinetic.vercel.app/",
  },
];

/** Blueprint labels projects as fig. 01a, 01b … */
export const projectLetter = (i: number) => String.fromCharCode(97 + i);
