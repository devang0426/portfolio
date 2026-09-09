import type { AestheticMotion } from "../types";

/** Signal moves cinematically: long, decelerating, arriving from below. */
export const signalMotion: AestheticMotion = {
  ease: "cubic-bezier(.16,1,.3,1)",
  gsapEase: "expo.out",
  enter: 1.1,
  stagger: 0.12,
  travel: 40,
};
