import type { Metadata } from "next";
import { HirePitch } from "@/components/shared/HirePitch";
import { faq } from "@/data/faq";
import { HIRE_ROUTE } from "@/data/hire";
import { site } from "@/data/site";

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

/**
 * The FAQ section of this page, as structured data. `mainEntity` is the list
 * of questions the page visibly answers — the same `faq` array both aesthetics
 * render, so the markup and the schema cannot disagree. `about` ties the page
 * to the Person the home page's graph declares, by the same `@id`, so an
 * engine reading either page resolves them to one entity.
 *
 * Google shows FAQ rich results to almost nobody any more; that is not what
 * this is for. It is the most direct way to hand an answer engine a question
 * and its answer as a pair, which is what "AEO" comes down to.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${site.url}${HIRE_ROUTE}#faq`,
  url: `${site.url}${HIRE_ROUTE}`,
  inLanguage: "en",
  isPartOf: { "@id": `${site.url}/#website` },
  about: { "@id": `${site.url}/#person` },
  mainEntity: faq.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: { "@type": "Answer", text: entry.answer },
  })),
};

export default function HirePage() {
  return (
    <>
      <script
        type="application/ld+json"
        /* `<` escaped so a stray angle bracket in an answer can never close
           the script tag early. */
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HirePitch />
    </>
  );
}
