"use client";

import Image from "next/image";
import type { Project } from "@/data/projects";

/** One chapter of the horizontal work film. */
export function SignalProject({ project }: { project: Project }) {
  return (
    <article
      id={project.id}
      className="sg-project"
      aria-labelledby={`sg-${project.id}-title`}
    >
      <span className="sg-project__ghost" aria-hidden="true">
        {project.index}
      </span>

      <div className="sg-project__body">
        <p className="sg-project__meta">
          <span className="sg-project__kind">
            {project.index} — {project.type}
          </span>
          <span className="sg-project__year">{project.year}</span>
        </p>

        <h3 id={`sg-${project.id}-title`} className="sg-project__title">
          {project.title}
        </h3>

        <p className="sg-project__desc">{project.description}</p>

        <dl className="sg-project__stats">
          {project.stats.map((stat) => (
            <div key={stat.label}>
              <dd className="sg-project__stat-value">{stat.value}</dd>
              <dt className="sg-project__stat-label">{stat.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="sg-project__stack">
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        <p className="sg-project__links">
          {project.liveUrl ? (
            <a
              className="sg-project__link sg-project__link--primary"
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open live ↗
            </a>
          ) : (
            <span className="sg-project__link sg-project__link--pending">
              Live — soon
            </span>
          )}
          {project.githubUrl ? (
            <a
              className="sg-project__link"
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              Source ↗
            </a>
          ) : (
            <span className="sg-project__link sg-project__link--pending">
              Source — private
            </span>
          )}
        </p>
      </div>

      <div className="sg-project__visual">
        {/* Width is derived from the height budget and the capture's ratio, so a
            tall screenshot narrows the window instead of growing bars beside it. */}
        <div
          className="sg-project__device"
          style={
            project.image
              ? {
                  width: `min(100%, calc(var(--sg-shot-h) * ${project.image.width} / ${project.image.height}))`,
                }
              : undefined
          }
        >
          <div className="sg-project__chrome">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span className="sg-project__url">{project.displayUrl}</span>
          </div>
          <div
            className="sg-project__screen"
            style={
              project.image
                ? { aspectRatio: `${project.image.width} / ${project.image.height}` }
                : undefined
            }
          >
            {project.image ? (
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                sizes="(max-width: 900px) 92vw, 45vw"
                className="sg-project__shot"
              />
            ) : (
              <p className="sg-project__no-shot">
                No interface —
                <br />
                {project.title}
              </p>
            )}
          </div>
        </div>
        <p className="sg-project__caption">{project.caption}</p>
      </div>
    </article>
  );
}
