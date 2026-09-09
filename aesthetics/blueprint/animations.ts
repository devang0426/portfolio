import type { AestheticMotion } from "../types";

/** Blueprint moves mechanically: short, precise, small travel — a drafting arm, not a camera. */
export const blueprintMotion: AestheticMotion = {
  ease: "cubic-bezier(.22,.61,.36,1)",
  gsapEase: "power2.out",
  enter: 0.62,
  stagger: 0.06,
  travel: 18,
};
