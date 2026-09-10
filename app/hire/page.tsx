import type { Metadata } from "next";
import { HirePitch } from "@/components/shared/HirePitch";
import { HIRE_ROUTE } from "@/data/hire";

/**
 * The one unbranded query this page exists to answer is a person, not an
 * engine: a recruiter who already has the CV open and wants the ninety-second
 * version. It is still worth indexing — "why hire <name>" is a real search —
 * but the title stays in the site's voice rather than being written at Google.
 *
 * `title` is a plain string, so the root layout's `%s — Devang Sharma` template
 * supplies the name and this segment does not repeat it.
 */
const description =
  "A short introduction from Devang Sharma, full-stack and AI engineer in Jaipur — what I build, how I work, and why I am worth an interview.";

export const metadata: Metadata = {
  title: "Why hire me",
  description,
  alternates: { canonical: HIRE_ROUTE },
  openGraph: {
    type: "profile",
    url: HIRE_ROUTE,
    title: "Why hire me",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Why hire me",
    description,
  },
};

export default function HirePage() {
  return <HirePitch />;
}
