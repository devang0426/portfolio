import type { AestheticTokens } from "./types";
import { signalTokens, signalOnAccentInk, signalFonts } from "./signal/tokens";
import { signalMotion } from "./signal/animations";
import {
  blueprintTokens,
  blueprintInkTokens,
  blueprintBodyInk,
  blueprintFonts,
} from "./blueprint/tokens";
import { blueprintMotion } from "./blueprint/animations";
import type { AestheticMotion } from "./types";

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const vars = (tokens: AestheticTokens) =>
  Object.entries(tokens)
    .map(([k, v]) => `--${kebab(k)}:${v};`)
    .join("");

const motionVars = (m: AestheticMotion) =>
  `--ease:${m.ease};--enter:${m.enter}s;--stagger:${m.stagger}s;--travel:${m.travel}px;`;

/**
 * Tokens are authored once in `aesthetics/*` and serialised here so the very first
 * server-rendered byte already carries the correct palette — no runtime application,
 * no flash, and no second copy of the values in a stylesheet.
 */
export const aestheticCss = `
:root{color-scheme:dark;${vars(signalTokens)}${motionVars(signalMotion)}
--font-display:${signalFonts.display};--font-body:${signalFonts.body};--font-mono:${signalFonts.mono};
--on-accent-ink:${signalOnAccentInk};}
[data-aesthetic="blueprint"]{color-scheme:light;${vars(blueprintTokens)}${motionVars(blueprintMotion)}
--font-display:${blueprintFonts.display};--font-body:${blueprintFonts.body};--font-serif:${blueprintFonts.serif};--font-mono:${blueprintFonts.mono};
--body-ink:${blueprintBodyInk.paper};--on-accent-ink:${blueprintTokens.onAccent};}
[data-aesthetic="blueprint"][data-paper="ink"]{color-scheme:dark;${vars(blueprintInkTokens)}
--body-ink:${blueprintBodyInk.ink};--on-accent-ink:${blueprintInkTokens.onAccent};}
`.replace(/\n/g, "");
