# Progress Tracker — Dual-Aesthetic Portfolio (Devang Sharma)

One portfolio, two complete visual identities — **SIGNAL** (dark, cinematic, experimental)
and **BLUEPRINT** (paper, editorial, engineering-document) — driven by one shared content layer.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Source of truth

The two design specs — `Signal Mockup Standalone.html` and `Blueprint Mockup Standalone.html`
— **were removed from the repo** once extraction was complete. They were 2.8MB of bundled
HTML carrying base64 assets, and everything load-bearing in them now lives in code:

| Was in the mockups | Now lives in |
| --- | --- |
| Tokens, palettes, type scales | `aesthetics/signal/*`, `aesthetics/blueprint/*` |
| Markup and layout | `components/signal/*`, `components/blueprint/*` |
| Canvas + graph logic | `SignalNetwork.tsx`, `BlueprintGraph.tsx`, `lib/useCanvasScene.ts` |
| Portfolio data | `data/*` |
| Portrait asset | `public/portrait.jpg` |

The design facts extracted from them are recorded below, so this file remains the record of
what the two aesthetics *are* without needing the bundles back. Both mockups embedded the
same portfolio data, which is why the data layer is genuinely shared — they only ever
disagreed on *presentation*.

### Extracted design facts

**Signal** — bg `#0b0b0d`, fg `#f2f2ef`, accent `oklch(0.85 0.22 130)` (lime), surface `#0d0d10`,
border `#232327`, muted `#6f6f69`. Fonts: Big Shoulders (display 900, condensed) / Archivo (body) /
JetBrains Mono (technical). Motion: `cubic-bezier(.16,1,.3,1)`, rise-from-below, 500vh pinned
horizontal work track, 160-node pointer-reactive particle field.

**Blueprint** — paper `#efece4`, paper2 `#f6f4ee`, ink `#14161a`, blue `oklch(0.45 0.13 250)`,
orange `oklch(0.7 0.16 45)`, 40px grid underlay. Fonts: Schibsted Grotesk (display) /
Newsreader italic (serif accent) / IBM Plex Mono (technical). Motion: short precise rises,
sticky stacked schematic cards, draggable force graph that morphs `DS` monogram ↔ architecture.
Has its own secondary paper/ink theme toggle (kept — it belongs to Blueprint, not to the app).

---

## Phase 1 — Audit `[x]`

- [x] Inspect `package.json` — Next 16.3.4, React 19.2.8, Tailwind v4, TS. App Router at repo root (no `src/`).
- [x] Read Next 16 breaking-change notes (`node_modules/next/dist/docs`) — async request APIs, `data-scroll-behavior`, Turbopack default.
- [x] De-bundle both mockups (template + `text/x-dc` logic + styles) instead of copying runtime code.
- [x] Extract portrait asset to `public/portrait.jpg`.
- [x] Confirm Google fonts resolvable via `next/font/google` (note: `Big Shoulders Display` → renamed `Big Shoulders`).

## Phase 2 — Design extraction `[x]`

- [x] Map Shared vs Signal-only vs Blueprint-only (see table below).
- [x] Decide dependencies: **gsap + lenis only**. No Three.js/R3F — both mockup visuals are 2D
      node graphs where Canvas 2D is faster and lighter; a WebGL scene would be unnecessary weight.

| Shared | Signal-only | Blueprint-only |
| --- | --- | --- |
| Project / experience / process / skills / about data | Giant condensed hero wordmark | Editorial two-column hero + serif accent |
| Aesthetic state + switcher + transition | 160-node particle network | Draggable force graph, monogram ↔ architecture |
| Smooth scroll, reduced-motion, canvas lifecycle hooks | Pinned 500vh horizontal work track | Sticky stacked schematic cards + packet run |
| SEO metadata, fonts, portrait | Bottom chapter rail + tech ticker | Left figure rail + top document bar |
| | Lime contact section | Process timeline, spec-sheet contact, paper/ink toggle |

## Phase 3 — Architecture `[x]`

- [x] `data/` — `projects.ts`, `experience.ts`, `skills.ts`, `about.ts`, `site.ts`
- [x] `aesthetics/signal|blueprint/{tokens,animations}.ts` + `aesthetics/css.ts` (tokens → SSR'd CSS, single source of truth)
- [x] `lib/` — aesthetic context, `useLenis`, `useCanvas`, `useReducedMotion`, `useGsap`
- [x] `components/{shared,signal,blueprint}/`

## Phase 4 — Signal `[x]`

- [x] `SignalPortfolio` shell + chapter observer
- [x] `SignalHero` — `DEVANG` / outlined `SHARMA`, staged reveal
- [x] `SignalNetwork` — 160-node canvas, pointer repulsion, DPR-aware, visibility-paused
- [x] `SignalNavigation` — fixed difference-blend top bar
- [x] `SignalChapterRail` — bottom rail, scroll progress, tech ticker
- [x] `SignalWork` — 500vh pinned horizontal track (GSAP ScrollTrigger)
- [x] `SignalProject` — ghost numeral, stats, stack, tilted device card
- [x] `SignalAbout` — portrait, credentials grid
- [x] `SignalContact` — lime section, project-kind form, footer

## Phase 5 — Blueprint `[x]`

- [x] `BlueprintPortfolio` shell + paper/ink sub-theme
- [x] `BlueprintRail` + `BlueprintNavigation` (figure dots, document bar, status)
- [x] `BlueprintHero` — "I build products *end to end*."
- [x] `BlueprintGraph` — draggable force graph, click to re-route monogram ↔ architecture
- [x] `BlueprintWork` / `BlueprintProject` — sticky stacked schematic cards, run-packet animation
- [x] `BlueprintProcess` — five-step engineering timeline
- [x] `BlueprintAbout` — portrait + vertical timeline
- [x] `BlueprintContact` — `.spec` sheet form + footer

## Phase 6 — Switcher `[x]`

- [x] `AestheticProvider` (context + localStorage, Signal default, pre-paint restore)
- [x] `AestheticSwitcher` — real `<button>`, `role="radiogroup"`, keyboard operable
- [x] `AestheticTransition` — directional GSAP curtain (~950ms), content react → dissolve → emerge
- [x] Reduced-motion path (instant, ~160ms crossfade)

## Phase 7 — Responsive `[x]`

- [x] Signal mobile: stacked hero, vertical work chapters (no pin), compact rail
- [x] Blueprint mobile: rail → bottom bar, single-column cards, unstacked stickies
- [x] Node counts + DPR capped on small screens
- [x] Switcher repositioned for thumbs

## Phase 8 — Polish `[x]`

- [x] Typography scale, spacing rhythm, focus rings on both aesthetics
- [x] Animation cleanup on unmount (rAF, ScrollTrigger, Lenis, observers, listeners)
- [x] Canvases pause when off-screen / tab hidden
- [x] `prefers-reduced-motion` honoured everywhere
- [x] Accessibility pass — semantics, labels, skip link, contrast

## Phase 9 — Verification `[x]`

- [x] `npm run lint` clean
- [x] `npm run build` succeeds
- [x] No runtime console errors

---

## Verification record

Measured against a production build (`next start`), Chrome headless, no dev overlay:

| Check | Result |
| --- | --- |
| `npm run lint` | clean |
| `npx tsc --noEmit` | clean |
| `npm run build` | succeeds, 2 static routes |
| Console (both aesthetics, desktop + mobile, scrolled, switched) | no errors or warnings |
| Switch sequence | exit 0–420ms · covered swap ~420–750ms · reveal ~750–1180ms · settles ~1.2s |
| Swap commit cost | 152 + 128ms → Blueprint, ~52ms → Signal, all behind a closed veil |
| Reduced motion | canvases draw one settled frame; ScrollTriggers and packets skipped |
| Keyboard | skip link is the first tab stop; arrow keys drive the switcher radiogroup |
| Anchor jumps | every section heading lands 101–135px down, clear of the fixed chrome |

### Defects found and fixed during verification

1. **Hydration mismatch** — `data-aesthetic` was both a JSX attribute and written by the
   pre-paint script. Now script-only, with `suppressHydrationWarning` on `<html>`.
2. **Node budget never applied** — the mobile count lived in a closure the scene effect
   never re-ran. `useCanvasScene` gained `resetKey`.
3. **Reduced motion painted an unsettled frame** — one frame of a spring system leaves nodes
   scattered. Scenes now expose `settle()` for their rest state.
4. **Transition retract was swallowed** by the ~280ms swap commit. The sequence is now two
   timelines: close on switch, open after the incoming tree has painted (double rAF).
5. **Mesh over type on mobile** — Signal's hero gained a scrim that reaches 96% on one-column
   layouts, 58% on two.
6. **Blueprint footnote collided** with the fixed switcher; it now sits above it.
7. **Schematics had no wires** — nodes floated unconnected. Added an SVG route with a
   `pathLength`-normalised dash that carries the packet along the actual path.
8. **Footer credited Three.js**, which the build does not use. Corrected.

---

## Phase 10 — CV and repository reconciliation `[x]`

The mockups' project copy turned out to be partly invented. Reconciled against the CV and
each repository; **the CV wins on every fact about the person, the repository wins on stack.**

### Corrections made

| Project | The mockups claimed | Actually |
| --- | --- | --- |
| Subscription API | Spring Boot · Java · PostgreSQL · Docker · GCP, "40+ endpoints", "99.9% uptime", "OpenAPI" | Node.js · Express · MongoDB · JWT · Arcjet · Upstash QStash |
| PaperGen AI | Prisma · PostgreSQL · Stripe, "auth and billing" | jsPDF · Zod · React Hook Form · Tailwind v4; no billing exists |
| Fuse AI | — | accurate; added Clerk |
| Bio | "four production products" | derives from `projects.length` and stays true |
| Footer | "Built with Next.js · Three.js · GSAP" | Three.js is not used |

### Added

- **Job Console** (`devang0426/job_sp`, live at job-sp.vercel.app) — facts taken from the
  repository README: 7 job sources, 5 scoring dimensions, 9-stage pipeline.
- **Kinetic** — menswear storefront with a guarded AI concierge, from the README supplied
  by the author. Stats chosen to be the engineering signature rather than vanity metrics:
  15-minute price lock, 48-hour idempotency key, atomic Lua cap reserve. The schematic
  routes the actual guarded path: chat intent → catalog → priced proposal → approval click
  → Redis cap → Razorpay + audit.
- Real contact details, live URLs and public repository links throughout.
- Credly certificate links, rendered as real links in both About timelines.
- Work ordered **oldest → newest**, because Signal's rail is labelled "2025 ——— 2026" and
  scrubs left to right. It was previously running backwards against its own axis.
- **Midas removed** from the featured work at the author's request — a Forage virtual
  experience sat oddly beside five shipped products. Its **CV timeline entry was kept**:
  the programme is genuine 2025 history even when it is not a portfolio chapter. Say the
  word and that row goes too. Removing it re-anchored the bio, whose range clause named
  Midas's Kafka pipeline as one end; it now spans the billing API to Kinetic's capped agent.
  Spring Boot and Kafka stay on the marquee — both are CV-listed skills.
- `MAX_STAGGER` caps the Blueprint sticky stack: at a fixed 28px per card a sixth project
  would push the last card off a short viewport. (Back to five projects the cap is dormant
  again at 28px; it re-engages at six.)
- The Signal rail was re-flexed for a growing chapter list. At ten entries the tech ticker
  was being squeezed to a 64px sliver at 1280px; the ticker now holds a fixed
  `clamp(200px, 22vw, 380px)`, the chapter list absorbs the shortfall and scrolls behind a
  right-edge fade, and the ticker hides below 1100px. Count-independent, so a seventh
  project needs no further tuning.

---

## Phase 11 — Professional copy pass `[x]`

Rewrote the voice inherited from the mockups. The mockup register was a freelance sales
pitch; the register now is a working engineer describing work. Specific and evidence-led,
not corporate filler — professional means *measured*, not vague.

| Was | Now |
| --- | --- |
| "Builder, not a bystander." | "Systems, not demos." |
| "Let's ship." · "Send it →" | "Let's talk." · "Send message →" |
| "I ship full-stack products at startup speed" | "I build production web applications end to end — interfaces, APIs, data models, and AI features designed around their failure modes" |
| "Five steps, no surprises." | "Five stages, clearly scoped." |
| "Bugs fixed free for a month. Then retainer or goodbye." | "Defects fixed at no cost for thirty days, with ongoing support available after that." |
| "Build in public" | "Visible progress" |
| "Open for contracts" | "Available for work" |
| "Taking contract work for Q4 2026" | "Available for engineering roles and contract work from Q4 2026" |
| Nav "Talk" | Nav "Contact" |

### Captions that described the website instead of the work

Four Signal captions were commentary on the page's own animation — the clearest
unprofessional note in the whole build, because they drew attention to the portfolio rather
than the engineering.

- *"Device card tilts with scroll; the background graph re-routes…"* → the real problem the
  project solves: conflict resolution and latency budgets.
- *"Same card system, different accent tilt. Consistency is the point."* → schema
  enforcement ahead of the PDF pipeline.
- *"For backend work the 'screenshot' is the route map."* → the auth boundary, idempotent
  write paths and reminder scheduler.
- *"hover: colour returns"* → `Jaipur · 2026`.

Kept the technical readouts that state facts (`fig. 07 — the human`, `160 nodes ·
pointer-reactive`, `drag nodes · click to re-route`) — those are Signal's and Blueprint's
personality, and they describe the artefact rather than showing off the transition.

### Copy moved into the data layer

Process headings, contact submit and confirmation labels were hardcoded in components.
They carry voice, so they now live in `data/about.ts` with the rest of the copy; components
hold no prose.

---

## Phase 12 — Process section removed `[x]`

Removed at the author's request. It was a client-engagement funnel (scope call → spec →
build → harden → support window) sitting in a portfolio whose CV is a final-year student's;
with the copy already moved toward roles-and-projects, it no longer earned its place.

Deleted rather than hidden — no dead code left behind:

- `SignalProcess.tsx`, `BlueprintProcess.tsx`
- `process` / `ProcessStep` from `data/experience.ts`, `about.process` copy block
- the `process` entry in `sections` and from `SectionId`
- **26 now-dead CSS rules** (9 Signal, 17 Blueprint, ~3.4KB) including their responsive
  overrides, swept with a brace-matching pass rather than by eye
- `process` from both portfolios' observer lists and section trees

Everything downstream renumbered itself: Signal `06 About / 07 Contact`, Blueprint
`fig. 02 about / fig. 03 enquiry`, rail reads `sheet nn / 03`. The About ghost numeral and
its figure caption follow the same derivation, so they moved from 07 to 06 unprompted.

The five process steps are recoverable from git history if the section is ever wanted back.

---

## Phase 13 — Project screenshots `[x]`

Four screenshots supplied by the author, moved from the repo root into
`public/projects/` named to match their project ids. Added as an **optional**
`image` field, because the Subscription API genuinely has no interface — and its
caption already said so.

| Project | Source | Ratio |
| --- | --- | --- |
| Fuse AI | `fuse.jpg` | 727×606 (1.20) |
| PaperGen AI | `papergen.jpg` | 1360×606 (2.24) |
| Job Console | `jobs.jpg` | 1358×610 (2.23) |
| Kinetic | `kinetic.jpg` | 1366×612 (2.23) |
| Subscription API | — | backend; keeps its placeholder |

**Signal** fills the device chrome that had always been a captioned placeholder. Nothing is
cropped: the frame takes each capture's own aspect ratio, and the window's *width* is
derived from a height budget (`--sg-shot-h: 52vh`) times that ratio —
`min(100%, calc(var(--sg-shot-h) * w / h))`. A tall screenshot therefore narrows the window
instead of growing bars beside it. `object-fit: contain` is the backstop, so even if a
constraint ever overrides the ratio the image letterboxes rather than crops. Measured at
1920×1080, 1440×900, 1440×680, 1100×800 and 390×844: every frame matches its image to
within rounding. Slightly desaturated so the chapter's own colour still leads, resolving to
full colour on hover.

**Blueprint** keeps the schematic as its primary artefact — that is the whole point of the
aesthetic — and pairs it with a captioned photographic plate (`fig. 01d — interface`), which
is how a real drawing set carries one. The plate fills space that was previously dead at the
bottom of the text column. Plates are sized with `max-width: 100%; max-height: 200px` and
auto width/height, so each scales whole to a common height, keeps its own width, and the
rule hugs the image exactly — 240×200, 447×200, 443×200, no distortion. The card became a
two-row grid so the schematic spans both rows; verified in both states — 520px without a
plate, 571px with one.

Where an interface does not exist the frame reads "No interface — Subscription API" rather
than showing a broken or borrowed image.

---

## Phase 14 — Subscription API removed `[x]`

Removed at the author's request, leaving four projects — every one of which now has a real
screenshot, so the "no interface" fallback and the route-map artefact both became dead code
and were deleted with it:

- the `api` project entry, renumbered `01`–`04`
- the `api?` field on `Project` and the route-map rendering in both aesthetics
- the `.sg-project__no-shot` fallback path is now unreachable but kept: it is the guard for
  any future project added without a screenshot

Re-anchored the bio again. Its range clause named the API as one end — the same failure the
Midas removal caused — and now reads "from a real-time collaborative canvas to an AI agent
that can complete a purchase inside a spending cap". The `Sep 2025 — Subscription Management
API` row stays in the CV timeline: shipped work, just not a featured chapter.

### File reverts observed

Twice during this session, edits to `data/projects.ts` and the two aesthetic stylesheets were
reverted on disk after being written and built successfully — most likely a stale editor
buffer saving over them. The consequence both times was a **verification passing against a
build made before the revert**, so a change was reported working while the file no longer
contained it. The route-map CSS in particular was silently lost and rendered unstyled for a
while. Post-edit persistence is now re-checked on disk before anything is verified in a
browser.

---

## Phase 15 — Empty band after the last chapter `[x]`

Reported as empty space when scrolling past Kinetic. Measured rather than guessed: each
Signal chapter's content filled only **53%** of its 100vh frame, leaving a **181px void**
below it. Invisible while the horizontal track is scrubbing — a new chapter is always
arriving — but glaring on the last one, whose only remaining motion is sliding away over the
work section's 100vh exit, with that void filling the screen.

The exit itself is not the fault and was left alone: a pinned 100vh section must scroll out
over one viewport, and the original mockup's `500vh` + `position: sticky` approach behaves
identically. The fault was the chapter composition.

- `.sg-project` now stretches its columns instead of centring a half-height block
- `.sg-project__body` becomes a flex column so the text column spans the frame
- `.sg-project__links` is anchored to the foot with `margin-top: auto` and a hairline rule,
  turning the actions into a deliberate footer band

Void below the content: **181px → 80px** (the chapter's own bottom padding), on all four
chapters, at 900px and 700px viewport heights. Desktop only; the stacked mobile layout is
untouched — verified `display: block`, no auto margin, no rule.

### A measurement that lied

The first attempt appeared to work — the body box measured full height — but the links had
not moved. `.sg-project__links` declares its own `margin` shorthand *later* in the
stylesheet, and a media query adds no specificity, so source order kept overriding
`margin-top: auto`. Measuring the container's box confirmed the fix; measuring the actual
ink position exposed it. The rule now lives at the end of the file, with a comment saying why.

---

## Remaining / known placeholders

Content that is still not verifiable, marked rather than invented:

- **`devangsharma.dev` is a placeholder, not a confirmed domain.** This is the one open
  blocker before a real deploy. `site.url`/`site.domain` feed `metadataBase`, the canonical
  link, every Open Graph and Twitter tag, `robots.txt`, `sitemap.xml`, the résumé's public
  URL, all four JSON-LD `@id`s, and Blueprint's document header. A wrong value fails
  silently, which is what makes it worth tracking.
- **Kinetic, Fuse AI and PaperGen AI have no public repository**, so their "code" links are
  omitted and render an honest "Source — private" state. All three live URLs are real. Job
  Console is the only project with a public repo.
- **Phone number** is in `site.ts` but deliberately not rendered: a phone number on a
  public page is a spam magnet. Add it to the contact lists if you want it shown.
- **The contact form has no server of its own.** With `NEXT_PUBLIC_CONTACT_ENDPOINT` set it
  posts JSON to that service; without one it hands the message to the visitor's mail client.
  Both deliver, and the status line says which happened — but if you wire an endpoint, add
  spam protection *there*, because there is none client-side by design.

### Closed since this list was written

- ~~Kinetic has no live URL~~ — shipped, `liveUrl` and `displayUrl` are set.
- ~~Project screenshots are designed placeholders~~ — all four are real captures in
  `public/projects/`, each with alt text naming what the product does.
- ~~`public/og.png` not shipped; metadata falls back to the portrait~~ — `app/opengraph-image.png`
  is a purpose-built 1200×630 card. The portrait was a 2268×4032 phone photo being squeezed
  into a 1.91:1 frame.
- ~~The contact form is optimistic UI only~~ — it now actually delivers, and no longer
  claims to have sent anything it has not.
- ~~No résumé~~ — `public/devang-sharma-resume.pdf`, linked from both aesthetics and listed
  in the sitemap.

---

## Where things live

```
data/            one canonical content layer — projects, experience, skills, about, site
aesthetics/      signal|blueprint tokens + motion vocabularies; css.ts serialises them for SSR
lib/             aesthetic context, persisted store, canvas lifecycle, smooth scroll, gsap
components/
  shared/        Portfolio host, AestheticSwitcher, AestheticTransition, contact form state
  signal/        SignalPortfolio + sections + SignalNetwork + signal.css
  blueprint/     BlueprintPortfolio + sections + BlueprintGraph + blueprint.css
```

**Dependencies added: `gsap` and `lenis`. Nothing else.** Three.js and R3F were considered
and rejected: both mockup visuals are 2D node graphs of 21 and 160 points, where Canvas 2D
is faster to run, far smaller to ship, and easier to keep accessible than a WebGL scene.

**Adding a project** means editing `data/projects.ts` alone. The Signal rail renumbers
(`05 Process` → `06 Process`), the Blueprint figure letters extend (`fig. 01e`), the
schematic wire routes itself through the new nodes, and both work sections pick it up.
