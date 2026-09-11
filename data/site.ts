import { projects } from "./projects";

export const site = {
  name: "Devang Sharma",
  initials: "DS",
  role: "Full-stack engineer",
  /**
   * The deployed origin, `www` included — the apex is not the canonical host.
   * This is the highest-consequence line in the project.
   *
   * It feeds `metadataBase`, the canonical link, every Open Graph and Twitter
   * tag, `robots.txt`, `sitemap.xml`, the résumé's public URL and all four
   * JSON-LD `@id`s. A wrong value here does not fail loudly — it quietly points
   * search engines at a host that does not exist, and a bad canonical is slow
   * to undo.
   */
  url: "https://www.devangsharma.me",
  location: "Jaipur, IN",
  coordinates: "26.9124° N, 75.7873° E",
  email: "devang2626@gmail.com",
  github: "https://github.com/devang0426",
  linkedin: "https://www.linkedin.com/in/devang-sharma26/",
  /**
   * Public CV, linked from the contact list in both aesthetics. The filename is
   * deliberately lowercase and hyphenated: it is a real indexable URL, and
   * "Devang'sResume.pdf" would have shipped as `Devang%27sResume.pdf`.
   * Setting this back to "" renders no link at all, which stays better than a
   * résumé link that 404s in front of a recruiter.
   */
  resume: "/devang-sharma-resume.pdf" as string,
  /** Rendered in the contact list of both aesthetics. Spaced for reading; use
      `phoneHref` for the dialable form. */
  phone: "+91 82902 61719",
  year: "2026",
} as const;

/** Dialable form of `site.phone` — the display spacing is not valid in `tel:`. */
export const phoneHref = `tel:${site.phone.replace(/\s/g, "")}`;

export type SectionId = "hero" | "work" | "about" | "contact";

interface Section {
  id: SectionId;
  /** Short link label, in each aesthetic's dialect. */
  signal: string;
  blueprint: string;
  /** Blueprint's navigation wording, where it differs from the figure title. */
  blueprintNav?: string;
}

/**
 * The one running order. Both aesthetics walk this list; they disagree only on
 * what to call each stop and how to number it.
 */
export const sections: Section[] = [
  { id: "hero", signal: "Hero", blueprint: "monogram" },
  { id: "work", signal: "Work", blueprint: "work" },
  { id: "about", signal: "About", blueprint: "about" },
  { id: "contact", signal: "Contact", blueprint: "enquiry", blueprintNav: "contact" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export interface NavEntry {
  id: string;
  href: string;
  /** Zero-padded ordinal, e.g. "03". */
  number: string;
  label: string;
}

/**
 * Signal counts every chapter, so each project gets its own number and the
 * sections after Work are pushed along behind them. Deriving it means adding a
 * project renumbers the rail, the ghost numerals and the section labels at once.
 */
export const signalChapters: NavEntry[] = sections.flatMap((section, index) => {
  if (section.id === "work") {
    return projects.map((project) => ({
      id: project.id,
      href: `#${project.id}`,
      number: project.index,
      label: project.title,
    }));
  }
  const offset = index === 0 ? 0 : projects.length - 1;
  return [
    {
      id: section.id,
      href: `#${section.id}`,
      number: pad(index + offset),
      label: section.signal,
    },
  ];
});

/** Blueprint numbers by figure: one per section, projects live inside fig. 01. */
export const blueprintFigures: NavEntry[] = sections.map((section, index) => ({
  id: section.id,
  href: `#${section.id}`,
  number: pad(index),
  label: section.blueprint,
}));

/** The ordinal a section carries in each aesthetic, for its own heading. */
export const signalNumber = (id: SectionId) =>
  signalChapters.find((entry) => entry.id === id)?.number ?? "00";

export const blueprintNumber = (id: SectionId) =>
  blueprintFigures.find((entry) => entry.id === id)?.number ?? "00";

/** Everything except the hero — the set both top navigations link to. */
export const navSections = sections.filter((section) => section.id !== "hero");
