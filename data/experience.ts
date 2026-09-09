export interface TimelineLink {
  label: string;
  href: string;
  /** Awarding body. Feeds `recognizedBy` in the credential structured data. */
  issuer: string;
}

export interface TimelineEntry {
  year: string;
  /** Plain text entry. Mutually exclusive with `links`. */
  text?: string;
  /** Verifiable credentials, rendered as links in place of `text`. */
  links?: TimelineLink[];
  /** Filled marker — a completed milestone. */
  filled?: boolean;
  /** Highlighted marker — the current state. */
  current?: boolean;
}

export const timeline: TimelineEntry[] = [
  {
    year: "2023–27",
    text: "B.Tech Computer Science & Engineering, JECRC University, Jaipur",
    filled: true,
  },
  {
    year: "May 2025",
    text: "JPMorgan Chase software engineering virtual experience (Midas)",
  },
  {
    year: "2025",
    links: [
      {
        label: "Meta Full-Stack Engineer",
        href: "https://www.credly.com/badges/76cbe5f7-cb4f-4e1e-984e-6585ce82133f/public_url",
        issuer: "Meta",
      },
      {
        label: "Google Cloud Foundations",
        href: "https://www.credly.com/badges/bd279996-84c7-4c0a-9a1d-7889e6b6fe88/public_url",
        issuer: "Google Cloud",
      },
      {
        label: "Google Cloud Engineer",
        href: "https://www.credly.com/badges/6a8842af-6ffc-42f5-92d3-286ea1560a12/public_url",
        issuer: "Google Cloud",
      },
    ],
  },
  { year: "Sep 2025", text: "Subscription Management API" },
  { year: "2026", text: "Fuse AI · PaperGen AI · Job Console · Kinetic shipped" },
  {
    year: "Now",
    text: "Available for engineering roles and contract work",
    current: true,
  },
];
