export type Aesthetic = "signal" | "blueprint";

/** Semantic design tokens shared by both aesthetics — same names, different values. */
export interface AestheticTokens {
  background: string;
  foreground: string;
  surface: string;
  surfaceAlt: string;
  muted: string;
  subtle: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSecondary: string;
  onAccent: string;
  grid: string;
  selection: string;
  focus: string;
}

/** Motion vocabulary. Each aesthetic moves in its own dialect. */
export interface AestheticMotion {
  /** Primary easing curve as a CSS timing function. */
  ease: string;
  /** GSAP easing name for the same curve. */
  gsapEase: string;
  /** Base entrance duration in seconds. */
  enter: number;
  /** Stagger between sibling reveals in seconds. */
  stagger: number;
  /** Distance, in px, elements travel on entrance. */
  travel: number;
}
