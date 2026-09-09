import { Portfolio } from "@/components/shared/Portfolio";
import { about } from "@/data/about";
import { timeline } from "@/data/experience";
import { projects } from "@/data/projects";
import { services, stack } from "@/data/skills";
import { site } from "@/data/site";

const PERSON = `${site.url}/#person`;
const WEBSITE = `${site.url}/#website`;

/** Every credential in the timeline that carries a verifiable public URL. */
const credentials = timeline.flatMap((entry) => entry.links ?? []);

/**
 * Structured data, so the two visual identities still resolve to one person.
 *
 * Written as a `@graph` rather than a lone Person: the projects are their own
 * entities that the Person authored, which is a relationship schema.org
 * actually defines. (They previously hung off the Person as `hasPart`, a
 * property Person does not have, so a crawler had no way to connect Devang to
 * any of the work.)
 *
 * The graph is deliberately aimed at the two audiences that read this page:
 *
 * - **Recruiters** mostly arrive on a branded search, having already seen the
 *   name on a CV or a profile. What matters there is entity resolution, so
 *   `sameAs` is the load-bearing line — it is what lets a search engine tie
 *   this page to the GitHub and LinkedIn profiles rather than treating all
 *   three as unrelated strangers who share a name — followed by
 *   `hasOccupation` and the verifiable `hasCredential` badges.
 * - **Clients** arrive on unbranded intent, so `makesOffer` states plainly what
 *   work is on offer, and `address`/`occupationLocation` answer the local half
 *   of queries like "next.js developer jaipur".
 *
 * Every value is derived from `data/`. Nothing here is asserted that the page
 * does not also say in words.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE,
      url: site.url,
      name: `${site.name} — ${site.role}`,
      inLanguage: "en",
      publisher: { "@id": PERSON },
    },
    {
      "@type": "ProfilePage",
      "@id": `${site.url}/#page`,
      url: site.url,
      name: `${site.name} — ${site.role}`,
      isPartOf: { "@id": WEBSITE },
      mainEntity: { "@id": PERSON },
      inLanguage: "en",
      primaryImageOfPage: `${site.url}/opengraph-image.png`,
    },
    {
      "@type": "Person",
      "@id": PERSON,
      name: site.name,
      jobTitle: site.role,
      description: about.bio,
      url: site.url,
      email: `mailto:${site.email}`,
      image: `${site.url}${about.portrait.src}`,
      sameAs: [site.github, site.linkedin],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "JECRC University",
      },
      // The full stack, rather than a hand-picked five, and taken from the same
      // list the Signal ticker scrolls — so it cannot drift from what the page
      // actually claims.
      knowsAbout: stack,
      hasOccupation: {
        "@type": "Occupation",
        name: site.role,
        occupationalCategory: "Software Developer",
        skills: stack.join(", "),
        occupationLocation: { "@type": "City", name: "Jaipur" },
      },
      // Verifiable badges only: each of these resolves to a public Credly page.
      hasCredential: credentials.map((credential) => ({
        "@type": "EducationalOccupationalCredential",
        name: credential.label,
        url: credential.href,
        credentialCategory: "certificate",
        recognizedBy: { "@type": "Organization", name: credential.issuer },
      })),
      // The freelance half of the audience. `services` is the contact form's
      // own list of enquiry types minus "Role", so this offer and the form can
      // never disagree about what is on the table.
      makesOffer: {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Full-stack web and AI development",
          serviceType: services,
          provider: { "@id": PERSON },
          areaServed: "Worldwide",
        },
      },
    },
    ...projects.map((project) => ({
      "@type": "SoftwareApplication",
      "@id": `${site.url}/#${project.id}`,
      name: project.title,
      description: project.description,
      applicationCategory: "WebApplication",
      operatingSystem: "Web browser",
      dateCreated: project.year,
      author: { "@id": PERSON },
      isPartOf: { "@id": WEBSITE },
      ...(project.image ? { image: `${site.url}${project.image.src}` } : {}),
      // Only real links are claimed; a private repository stays unlisted here
      // exactly as it does in the interface.
      ...(project.liveUrl ? { url: project.liveUrl } : {}),
      ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    })),
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Portfolio />
    </>
  );
}
