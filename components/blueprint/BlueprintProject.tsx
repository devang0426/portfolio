"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { projectLetter } from "@/data/projects";
import { blueprintNumber } from "@/data/site";

interface Props {
  project: Project;
  index: number;
  /** Vertical stagger between stacked cards, in px. */
  offset: number;
}

/**
 * A schematic card. Cards stick at staggered offsets so the stack reads as a
 * set of drawings laid on top of each other rather than a scrolling list.
 * "Run" sends a request packet along the node chain — the diagram executing.
 */
export function BlueprintProject({ project, index, offset }: Props) {
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const run = () => {
    setRunning(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setRunning(false);
    }, 2400);
  };

  const letter = projectLetter(index);
  // The route the request takes, in the schematic's own 0–100 coordinate space.
  const route = project.nodes
    .map((node) => `${node.x * 100},${node.y * 100}`)
    .join(" ");

  return (
    <article
      id={project.id}
      className="bp-card"
      style={{ top: `calc(var(--bp-stick) + ${index * offset}px)` }}
      aria-labelledby={`bp-${project.id}-title`}
    >
      <div className="bp-card__body">
        <p className="bp-card__meta">
          <span>
            fig. {blueprintNumber("work")}
            {letter}
          </span>
          <span>{project.year}</span>
        </p>

        <h3 id={`bp-${project.id}-title`} className="bp-card__title">
          {project.title}
        </h3>
        <p className="bp-card__tagline bp-serif">{project.tagline}</p>
        <p className="bp-card__desc">{project.summary}</p>

        <p className="bp-card__stack">
          stack: {project.technologies.map((t) => t.toLowerCase()).join(" · ")}
        </p>

        <div className="bp-card__actions">
          <button
            type="button"
            className="bp-card__run"
            onClick={run}
            aria-describedby={`bp-${project.id}-status`}
          >
            ▶ run
          </button>
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              live ↗
            </a>
          ) : (
            <span className="bp-card__pending">live — soon</span>
          )}
          {project.githubUrl ? (
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              code ↗
            </a>
          ) : (
            <span className="bp-card__pending">code — private</span>
          )}
        </div>
      </div>

      {project.image ? (
        <figure className="bp-card__plate">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            sizes="(max-width: 860px) 100vw, 46vw"
            className="bp-card__plate-image"
          />
          <figcaption className="bp-card__plate-caption">
            fig. {blueprintNumber("work")}
            {letter} — interface
          </figcaption>
        </figure>
      ) : null}

      <div className="bp-card__schematic">
        {/* preserveAspectRatio="none" lets the route track the node percentages
            exactly; non-scaling-stroke keeps the line weight honest, and
            pathLength normalises the dash pattern that carries the packet. */}
        <svg
          className="bp-card__route"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            className="bp-card__wire"
            points={route}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            className="bp-card__packet"
            data-running={running || undefined}
            points={route}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <ul className="bp-card__nodes">
          {project.nodes.map((node) => (
            <li
              key={node.label}
              className="bp-card__node"
              style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
            >
              {node.label}
            </li>
          ))}
        </ul>

        <p
          id={`bp-${project.id}-status`}
          className="bp-card__status"
          role="status"
          aria-live="polite"
        >
          {running ? "● request travelling…" : "○ idle · press run"}
        </p>
      </div>
    </article>
  );
}
