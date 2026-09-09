import type { AestheticTokens } from "../types";

/** BLUEPRINT — warm paper, engineering ink, blue annotation, orange signal. */
export const blueprintTokens: AestheticTokens = {
  background: "#efece4",
  foreground: "#14161a",
  surface: "#f6f4ee",
  surfaceAlt: "#e7e3d8",
  muted: "#5b5f66",
  subtle: "#5b5f66",
  border: "rgba(20,22,26,0.14)",
  borderStrong: "#3a3e45",
  accent: "oklch(0.45 0.13 250)",
  accentSecondary: "oklch(0.7 0.16 45)",
  onAccent: "#f6f4ee",
  grid: "rgba(20,22,26,0.06)",
  selection: "oklch(0.7 0.16 45)",
  focus: "oklch(0.45 0.13 250)",
};

/** Blueprint carries its own paper/ink sub-theme — a drafting-table lamp, not a site-wide dark mode. */
export const blueprintInkTokens: AestheticTokens = {
  ...blueprintTokens,
  background: "#111318",
  foreground: "#e8e6df",
  surface: "#171a20",
  surfaceAlt: "#1d2028",
  muted: "#8a8e96",
  subtle: "#8a8e96",
  border: "rgba(232,230,223,0.16)",
  borderStrong: "#c3c1ba",
  accent: "oklch(0.75 0.11 250)",
  accentSecondary: "oklch(0.75 0.16 45)",
  onAccent: "#111318",
  grid: "rgba(232,230,223,0.06)",
};

/** Secondary ink used for body copy on paper. */
export const blueprintBodyInk = { paper: "#3a3e45", ink: "#c3c1ba" };

export const blueprintFonts = {
  display: "var(--font-blueprint-display), system-ui, sans-serif",
  body: "var(--font-blueprint-display), system-ui, sans-serif",
  serif: "var(--font-blueprint-serif), Georgia, serif",
  mono: "var(--font-blueprint-mono), ui-monospace, monospace",
};
