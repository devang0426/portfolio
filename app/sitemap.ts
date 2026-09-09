import type { MetadataRoute } from "next";
import { about } from "@/data/about";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

/**
 * One page, one entry. The section anchors are deliberately absent: they are
 * fragments of this document, not separate URLs, and listing them would ask
 * crawlers to index the same page four times.
 *
 * The images are worth declaring even though there is only the one URL. A
 * single-page portfolio has almost no surface for unbranded search to land on,
 * and image results are one of the few extra doorways available — the project
 * screenshots carry real alt text naming what each product does, so they can
 * answer a query the page's own headings, which are written as voice rather
 * than as keywords, never will.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [
        `${site.url}/opengraph-image.png`,
        `${site.url}${about.portrait.src}`,
        ...projects.flatMap((project) =>
          project.image ? [`${site.url}${project.image.src}`] : [],
        ),
      ],
    },
    // The CV is its own indexable URL. "<name> resume" is a query recruiters
    // genuinely run, and a PDF that only exists behind a click on the contact
    // list can never answer it.
    ...(site.resume
      ? [
          {
            url: `${site.url}${site.resume}`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.8,
          },
        ]
      : []),
  ];
}
