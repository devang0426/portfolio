"use client";

import { projects } from "@/data/projects";
import { BlueprintProject } from "./BlueprintProject";

/**
 * The stack's total stagger is capped rather than fixed per card: at 28px each,
 * a sixth project would push the last card past the bottom of a short viewport.
 */
const MAX_STAGGER = 112;
const STEP = 28;

export function BlueprintWork() {
  const offset = Math.min(STEP, MAX_STAGGER / Math.max(1, projects.length - 1));

  return (
    <section id="work" className="bp-work" aria-labelledby="bp-work-title">
      <div className="bp-work__head">
        <h2 id="bp-work-title" className="bp-figure-label">
          work
        </h2>
        <p className="bp-work__hint">cards stack as you scroll</p>
      </div>

      {projects.map((project, index) => (
        <BlueprintProject
          key={project.id}
          project={project}
          index={index}
          offset={offset}
        />
      ))}
    </section>
  );
}
