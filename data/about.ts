import { projects } from "./projects";

const COUNT = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];

/** Spelled out so the copy stays true when a project is added to the data. */
const shipped = COUNT[projects.length] ?? String(projects.length);

export const about = {
  headline: {
    /** Signal splits the headline across three condensed lines. */
    signal: ["Systems,", "not", "demos."],
    /** Blueprint sets the second clause in italic serif. */
    blueprint: { lead: "Curious by nature,", accent: "persistent by choice." },
  },
  bio: `Final-year Computer Science student at JECRC University, Jaipur. Over two years I have built and shipped ${shipped} production systems, from a real-time collaborative canvas to an AI agent that can complete a purchase inside a spending cap.`,
  bioLong: `Final-year Computer Science student at JECRC University, Jaipur. Over two years I have built and shipped ${shipped} production systems, from a real-time collaborative canvas to an AI agent that can complete a purchase inside a spending cap. I work best on problems where the interface, the data model and the infrastructure all have to agree.`,
  portrait: {
    src: "/portrait.jpg",
    alt: "Devang Sharma",
  },
  hero: {
    signal: {
      eyebrow: "// full-stack engineer · jaipur, india · remote · 2026",
      lines: ["Devang", "Sharma"],
      lede: "I build production web applications end to end — interfaces, APIs, data models, and AI features designed around their failure modes.",
      cta: "Get in touch",
    },
    blueprint: {
      eyebrow: "// full-stack · next.js · ai features · real-time",
      lead: "I build products",
      accent: "end to end",
      lede: "Devang Sharma, full-stack engineer. I take products from interface to API to data model to deployment, including the AI features and the constraints that keep them safe to ship.",
      cta: "Get in touch",
      secondaryCta: "view the work",
    },
  },
  contact: {
    signal: {
      lines: ["Let's", "talk."],
      lede: "Whether it's a role or a project, tell me what you have in mind. I reply within 24 hours.",
      submit: "Send message →",
      /* Shown on the button while a submission is in flight. */
      pending: "Sending…",
      /* The confirmation that replaces the form. Two headlines, because the two
         transports are not the same event: an endpoint has delivered it, a mail
         handoff has only written it. Signal splits its headings across lines. */
      done: {
        sent: ["Message", "sent."],
        mail: ["Nearly", "there."],
      },
      again: "Send another",
    },
    blueprint: {
      title: "New enquiry",
      suffix: ".spec",
      lede: "Fill in what you know. I reply within 24 hours with scope, a timeline and a time to talk.",
      submit: "Submit enquiry →",
      pending: "Submitting…",
      /* Blueprint stamps the sheet rather than announcing, and keeps its
         file-suffix voice. */
      done: {
        sent: { title: "Enquiry", suffix: ".received" },
        mail: { title: "Enquiry", suffix: ".drafted" },
      },
      again: "New enquiry",
    },
  },
};
