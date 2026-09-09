/** Marquee / ticker stack, ordered for rhythm rather than alphabetically. */
export const stack = [
  "Next.js",
  "TypeScript",
  "React Flow",
  "Liveblocks",
  "Gemini 2.5 Flash",
  "Trigger.dev",
  "Prisma",
  "Neon Postgres",
  "Clerk",
  "Spring Boot",
  "Kafka",
  "MongoDB",
  "Upstash Redis",
  "Razorpay",
  "Playwright",
  "Docker",
];

/**
 * The work on offer, as opposed to a role Devang might be hired into. The
 * freelance service offer in the structured data is built from this, so the
 * site can never advertise a service the contact form does not actually list.
 */
export const services = ["Web app", "AI feature", "MVP", "Landing site"];

/**
 * Enquiry types offered by the contact form in both aesthetics. "Role" leads
 * because the CV is a final-year student CV — it is the one option that is not
 * a service, which is why the two lists are defined this way round rather than
 * filtering a name back out of a flat array.
 */
export const projectKinds = ["Role", ...services];
