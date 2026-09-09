# Devang Sharma — portfolio

One portfolio, two complete visual identities. **Signal** is dark, cinematic and
experimental; **Blueprint** is paper, editorial and reads like an engineering
drawing set. They are not two colour themes of one page — they are two different
design languages, with their own typography, layout, navigation, graphics and
motion vocabulary, rendering the same content from the same data layer.

Switching between them is the site's signature interaction.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Plain CSS per aesthetic, driven by design tokens; Tailwind v4 for the token bridge only |
| Motion | GSAP + ScrollTrigger, Lenis for smooth scroll |
| Graphics | Canvas 2D — no WebGL, no 3D library (see [Performance](#performance)) |
| Analytics | Vercel Speed Insights, on Vercel deployments only |

Runtime dependencies: `gsap`, `lenis`, `@vercel/speed-insights`. That is the
whole list, and it is meant to stay short.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Environment variables

Both optional, both about the contact form. See `.env.example`.

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Any URL accepting a JSON `POST` — Web3Forms, Formspree, a route handler of your own. The form posts to it and reports the real result. |
| `NEXT_PUBLIC_CONTACT_ACCESS_KEY` | Sent as `access_key`. Web3Forms authenticates this way; services that do not want it ignore it. |

The posted body is `{ access_key?, subject, from_name, name, email, kind, brief }`.

With no endpoint set the form hands the message to the visitor's mail client
instead. Either way it delivers something, and the status line says which
happened — it must never claim to have sent a message it has not. A hidden
honeypot field drops obvious bots before the request is made; anything stronger
belongs at the endpoint, since a client-side check is worth nothing to a bot.

## Project structure

```
app/            route, root layout, metadata, SEO routes, brand assets
data/           the one content layer — projects, experience, skills, about, site
aesthetics/     tokens + motion vocabulary per aesthetic; css.ts serialises them
lib/            aesthetic state, canvas lifecycle, smooth scroll, scroll helpers
components/
  shared/       Portfolio host, switcher, transition, contact form state
  signal/       Signal sections + SignalNetwork + signal.css
  blueprint/    Blueprint sections + BlueprintGraph + blueprint.css
```

The governing rule is **content ≠ presentation**. `data/` holds every fact once.
Neither aesthetic keeps its own copy of a project, a date or a link; they
disagree only about how to say it. If you find yourself editing the same fact in
two files, the abstraction has slipped.

## Design tokens

Both aesthetics implement the same token interface (`aesthetics/types.ts`) with
different values — same names, different worlds:

```
aesthetics/
  types.ts              AestheticTokens + AestheticMotion contracts
  signal/tokens.ts      near-black ground, lime signal, technical greys
  signal/animations.ts  cinematic: long, decelerating, arriving from below
  blueprint/tokens.ts   warm paper, engineering ink, blue annotation, orange signal
  blueprint/animations.ts  mechanical: short, precise, small travel
  css.ts                serialises both into one <style> block
```

`css.ts` runs at build time and its output is inlined in `<head>`, so the very
first server-rendered byte already carries the correct palette. There is no
runtime token application and no flash of the wrong identity. Components read
tokens as CSS custom properties (`var(--accent)`, `var(--ease)`) and never
hardcode a colour or a curve.

Blueprint additionally carries a **paper/ink stock** toggle in its left rail. It
is a drafting-table lamp belonging to that aesthetic, not a site-wide dark mode,
which is why its state lives in `BlueprintPortfolio` rather than in shared state.

## How the aesthetic switcher works

1. `lib/aesthetic-context.tsx` holds the committed choice in a small
   `localStorage`-backed external store read through `useSyncExternalStore`, so
   the server snapshot renders first, hydration matches, and the stored value is
   adopted in the same commit rather than a second cascading render.
2. A tiny inline script in `app/layout.tsx` writes `data-aesthetic` onto `<html>`
   before first paint, so a returning visitor never sees a frame of the other
   identity.
3. On switch, the outgoing world is *held on screen* while it plays its exit,
   the choice commits immediately (so the control responds at once), and
   `AestheticTransition` sweeps bands across the viewport.
4. `Portfolio` keys the tree on the aesthetic. Swapping the key tears down every
   canvas, ScrollTrigger and listener belonging to the outgoing world rather
   than trying to reconcile two fundamentally different trees into each other.
5. The reveal is a separate animation that waits for the incoming tree's first
   paint, because the swap is a couple of hundred milliseconds of blocking work
   and a single timeline would have that commit eat the second half.
6. `lib/useThemeColor.ts` keeps `<meta name="theme-color">` on the live
   `--background`, so mobile browser chrome changes worlds too.

Under `prefers-reduced-motion` the sequence collapses to a near-instant swap and
every canvas draws a single settled frame.

## Adding a project

Edit `data/projects.ts`. Nothing else.

```ts
{
  id: "slug",            // also the anchor: #slug
  index: "05",           // Signal's chapter number
  title: "Project",
  year: "2026",
  type: "…",             // Signal renders this as the chapter kind
  tagline: "…",          // Blueprint's serif line
  description: "…",      // Signal's long copy
  summary: "…",          // Blueprint's tighter rewrite
  technologies: [...],
  stats: [{ value: "…", label: "…" }],   // exactly three read best
  nodes: [{ label: "…", x: 0.2, y: 0.2 }],  // Blueprint's schematic, 0–1 space
  image: { src, alt, width, height },     // optional — omit for a backend project
  displayUrl: "…",       // host shown in Signal's device chrome
  caption: "…",          // Signal's chapter caption
  liveUrl, githubUrl,    // omit either one; the UI renders an honest pending state
}
```

Everything downstream is derived: Signal's chapter rail renumbers, Blueprint's
figure letters extend to `fig. 01e`, the schematic wire routes itself through the
new nodes, the about copy's project count updates, and the JSON-LD gains an
entry. Omitted links render "Source — private" rather than a dead anchor — never
invent a URL to fill the slot.

## How animations are structured

- **Motion vocabulary** lives in `aesthetics/*/animations.ts` and is exposed as
  `--ease`, `--enter`, `--stagger`, `--travel`. Entrance animations are CSS.
- **Scroll-driven work** is GSAP. `SignalWork` pins the section and scrubs the
  chapter track sideways inside a `gsap.context` with a `matchMedia` guard, so
  the whole thing exists only above 900px and under `no-preference`; below that
  the chapters simply stack, which is the right composition for a thumb rather
  than a downgraded one.
- **Canvas scenes** go through `lib/useCanvasScene.ts`, which owns DPR-aware
  sizing, one rAF loop that stops when the canvas leaves the viewport or the tab
  is hidden, and deterministic teardown. A scene supplies `frame`, an optional
  `settle` for reduced motion, and an optional `destroy`.
- **Chapter positions.** Signal's work chapters live inside a pinned,
  horizontally scrubbed track, so their position in the document is meaningless.
  `lib/work-scrub.ts` translates a chapter id into the scroll position at which
  that chapter fills the frame; the smooth-scroll anchor handler and the track's
  focus management both go through it, and it returns `null` whenever the track
  is not running.

## Performance

- **Canvas 2D, not WebGL.** Both hero visuals are 2D node graphs of 21 and 160
  points. Three.js and React Three Fiber were considered and rejected: for this
  work Canvas 2D is faster to run, far smaller to ship, and easier to keep
  accessible.
- **Fonts.** Six families are self-hosted through `next/font`, but only Signal's
  three are preloaded — Signal is what a first-time visitor is served, and
  preloading all six spends the opening connection on faces the page will not
  use. Blueprint's are still fetched the moment a Blueprint element needs them.
- **Animation loops** pause off-screen and on tab hide, and every listener,
  ScrollTrigger and GSAP context is reverted on unmount.
- **Images** go through `next/image` with explicit dimensions and `sizes`.
- **Speed Insights** is rendered only on Vercel, where its beacon exists.

`lighthouserc.json` holds the budgets CI enforces: accessibility and SEO at 100,
best practices at 95, performance at 90, plus explicit LCP/FCP/CLS ceilings.
Audits that fire on every Next.js app regardless of care — `unused-javascript`,
`legacy-javascript` — are switched off so the gate keeps meaning something.

## Brand assets

`app/icon.svg` is the source mark: the DS monogram plotted from the same
coordinates `BlueprintGraph` draws in the hero. It is geometry, not type, so
there is no font to be missing and no letterform to be re-shaped, and it answers
`prefers-color-scheme` with Signal's palette or Blueprint's. `favicon.ico`,
`icon.png` and `apple-icon.png` are rasters of the same mark;
`opengraph-image.png` is the Signal hero composed for a 1.91:1 crop.

## Deployment

Deploys to Vercel with no configuration. Set `NEXT_PUBLIC_CONTACT_ENDPOINT` in
project settings if you want form posts rather than a mail handoff.

### One open blocker

`site.url` in `data/site.ts` is still the **placeholder** `devangsharma.dev`.
Set it to the real host before the first deploy — a custom domain or the
`*.vercel.app` address, either is fine, but it has to be the one that actually
serves the site.

It feeds `metadataBase`, the canonical link, every Open Graph and Twitter tag,
`robots.txt`, `sitemap.xml`, the résumé's public URL and all four JSON-LD
`@id`s. Nothing breaks loudly if it is wrong; the site simply tells search
engines it lives somewhere it does not, and a bad canonical takes a long time to
walk back.
