import { about } from "@/data/about";
import { timeline } from "@/data/experience";
import { faq } from "@/data/faq";
import { HIRE_ROUTE, clientWork } from "@/data/hire";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { services, stack } from "@/data/skills";

/** Prerendered at build: it is a function of `data/`, nothing else. */
export const dynamic = "force-static";

/** Every credential in the timeline that carries a verifiable public URL. */
const credentials = timeline.flatMap((entry) => entry.links ?? []);

/**
 * `/llms.txt` — the site, as plain text, for a language model.
 *
 * The convention (llmstxt.org) is a Markdown file at the site root: an H1
 * naming the site, a one-line blockquote summary, then H2 sections of links
 * with a short description each. An answer engine that fetches it gets the
 * whole case in one small, unstyled read instead of having to reconstruct it
 * from two aesthetics' worth of HTML.
 *
 * Everything here is built from `data/`, so it says exactly what the pages
 * say. That is the point: a summary that could drift from the site would be
 * one an engine could quote wrongly, and this one cannot.
 */
function render(): string {
  const lines: string[] = [];
  const push = (...parts: string[]) => lines.push(...parts);

  push(
    `# ${site.name}`,
    "",
    `> ${site.name} — ${site.role.toLowerCase()} in ${site.location.replace(", IN", ", India")}. ${about.hero.signal.lede} Available for engineering roles and contract work.`,
    "",
    about.bioLong,
    "",
    "## Contact",
    "",
    `- Email: ${site.email}`,
    `- Website: ${site.url}`,
    `- Contact form: ${site.url}/#contact (replies within 24 hours)`,
    `- GitHub: ${site.github}`,
    `- LinkedIn: ${site.linkedin}`,
  );
  if (site.resume) push(`- CV (PDF): ${site.url}${site.resume}`);
  push(`- Location: ${site.location.replace(", IN", ", India")} — remote-friendly`);

  push("", "## Projects", "");
  for (const project of projects) {
    push(
      `- ${project.title} (${project.year}, ${project.type}): ${project.description}`,
    );
    push(`  - Stack: ${project.technologies.join(", ")}`);
    if (project.liveUrl) push(`  - Live: ${project.liveUrl}`);
    if (project.githubUrl) push(`  - Source: ${project.githubUrl}`);
  }

  push(
    "",
    "## Client work",
    "",
    `- ${clientWork.name} (${clientWork.kind}): ${clientWork.summary}`,
    `  - Live: ${clientWork.url}`,
  );

  push(
    "",
    "## Stack",
    "",
    stack.join(", "),
    "",
    "## Services",
    "",
    `Contract work, worldwide and remote: ${services.join(", ")}. Also open to full-time engineering roles.`,
    "",
    "## Credentials",
    "",
  );
  for (const credential of credentials) {
    push(`- ${credential.label} (${credential.issuer}): ${credential.href}`);
  }

  push("", "## Timeline", "");
  for (const entry of timeline) {
    const text = entry.text ?? entry.links?.map((l) => l.label).join(" · ");
    if (text) push(`- ${entry.year}: ${text}`);
  }

  push("", "## Frequently asked", "");
  for (const entry of faq) {
    push(`### ${entry.question}`, "", entry.answer, "");
  }

  push(
    "## Pages",
    "",
    `- [Portfolio](${site.url}): the work, the stack, the timeline and the contact form.`,
    `- [Why hire me](${site.url}${HIRE_ROUTE}): a short video introduction, the written case, client work and the questions above.`,
    "",
  );

  return lines.join("\n");
}

export function GET() {
  return new Response(render(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // A day: the file only changes with a deploy, and a deploy busts it.
      "cache-control": "public, max-age=86400",
    },
  });
}
