import type { AestheticTokens } from "../types";

/** SIGNAL — near-black ground, lime signal, technical greys. */
export const signalTokens: AestheticTokens = {
  background: "#0b0b0d",
  foreground: "#f2f2ef",
  surface: "#0d0d10",
  surfaceAlt: "#151518",
  muted: "#9a9a94",
  subtle: "#6f6f69",
  border: "#232327",
  borderStrong: "#2a2a2e",
  accent: "oklch(0.85 0.22 130)",
  accentSecondary: "#c9c9c3",
  onAccent: "#0b0b0d",
  grid: "rgba(242,242,239,0.06)",
  selection: "oklch(0.85 0.22 130)",
  focus: "oklch(0.85 0.22 130)",
};

/** Ink used on top of the lime contact plane. */
export const signalOnAccentInk = "#2b3a12";

export const signalFonts = {
  display: "var(--font-signal-display), 'Arial Narrow', sans-serif",
  body: "var(--font-signal-body), system-ui, sans-serif",
  mono: "var(--font-signal-mono), ui-monospace, monospace",
};
