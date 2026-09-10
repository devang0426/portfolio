import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Big_Shoulders,
  IBM_Plex_Mono,
  JetBrains_Mono,
  Newsreader,
  Schibsted_Grotesk,
} from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { aestheticCss } from "@/aesthetics/css";
import { Jukebox } from "@/components/shared/Jukebox";
import { site } from "@/data/site";
import "./globals.css";

/* ---- SIGNAL type: condensed display, neutral body, technical mono ---- */

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-signal-display",
  display: "swap",
  // Google publishes no override metrics for this family, so pick the fallback
  // by hand rather than letting Next skip the adjustment silently.
  fallback: ["Arial Narrow", "Haettenschweiler", "sans-serif"],
  adjustFontFallback: false,
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-signal-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-signal-mono",
  display: "swap",
});

/* ---- BLUEPRINT type: editorial grotesk, serif accent, document mono ---- */

/* Blueprint's three families are deliberately not preloaded. Signal is what a
   first-time visitor is served, and preloading six families spends the opening
   connection on three faces the page will not use. They are still self-hosted
   and still requested the instant a Blueprint element needs them — the browser
   just no longer races for them ahead of the type actually on screen. */

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-blueprint-display",
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-blueprint-serif",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-blueprint-mono",
  display: "swap",
  preload: false,
});

/**
 * Two audiences read this page from search, and they arrive by different routes.
 *
 * Recruiters almost always arrive on a *branded* query — they have the name
 * already, from a CV or a profile — so the title leads with it and the graph in
 * `page.tsx` does the work of proving this page and those profiles are one
 * person. Clients arrive on *unbranded* intent ("next.js developer", "hire ai
 * developer"), which is why the title carries the two terms actually worth
 * competing on and the description carries the city.
 *
 * The old description ran to 184 characters and was cut off in results before
 * it reached anything an employer or a client wanted to know. This one fits the
 * ~155 Google will show, and spends that budget on role, location, stack and
 * availability — in that order.
 */
const title = `${site.name} — Full-stack engineer, Next.js & AI`;

const description =
  "Devang Sharma — full-stack engineer in Jaipur, India. Production web apps end to end: Next.js, TypeScript, real-time, AI. Open to roles and contract work.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s — ${site.name}`,
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  /* Google has ignored this since 2009 and a stuffed list is a mild negative
     signal to the engines that still read it, so it stays short and true. The
     structured data in `page.tsx` is what actually carries this weight. */
  keywords: [
    "Devang Sharma",
    "full-stack engineer",
    "Next.js developer",
    "AI engineer",
    "freelance web developer",
    "Jaipur",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title,
    description,
    locale: "en_US",
    /* No `images` here on purpose: `app/opengraph-image.png` supplies the card
       through the file convention, and an explicit entry would override it —
       which is how the portrait, a 2268x4032 phone photo, ended up being the
       thing every shared link tried to render into a 1.91:1 frame. */
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    /* Falls back to the Open Graph image, which is already the right shape. */
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* Let Google use the whole card and an untruncated snippet: both are
         working copy here, not something to ration. */
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  /* Signal's ground, which is what the document is served as. `useThemeColor`
     takes over on the client and keeps this in step with the live palette. */
  themeColor: "#0b0b0d",
  colorScheme: "dark light",
};

/**
 * Applies the stored aesthetic — and Blueprint's paper stock — to <html> before
 * first paint, so a returning visitor never sees a frame of the other identity.
 * These attributes are deliberately absent from the JSX below: they are written
 * by this script on the client only, which is why <html> suppresses hydration
 * warnings for them.
 *
 * The document itself is prerendered as Signal, and `useSyncExternalStore`
 * correctly hydrates against that snapshot before adopting the stored value —
 * so for a returning Blueprint visitor there is a window between first paint
 * and hydration in which Signal's markup stands on Blueprint's palette: bone
 * type on cream paper, which is to say nothing legible at all. `data-restoring`
 * holds that window closed on the incoming aesthetic's own ground, and the
 * provider lifts it the moment the right tree has committed.
 *
 * The attribute is only ever set when the two disagree, so the common case —
 * a first visit, or a returning Signal visitor — paints immediately.
 */
const restoreAesthetic = [
  'var d=document.documentElement;',
  'try{var a=localStorage.getItem("ds-aesthetic");',
  'if(a==="blueprint"){d.dataset.aesthetic="blueprint";d.dataset.restoring="";}',
  'else{d.dataset.aesthetic="signal"}',
  'var p=localStorage.getItem("ds-blueprint-stock");if(p==="ink")d.dataset.paper="ink";',
  '}catch(e){d.dataset.aesthetic="signal"}',
].join("");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={[
        bigShoulders.variable,
        archivo.variable,
        jetbrainsMono.variable,
        schibsted.variable,
        newsreader.variable,
        plexMono.variable,
      ].join(" ")}
    >
      <head>
        <style
          id="aesthetic-tokens"
          dangerouslySetInnerHTML={{ __html: aestheticCss }}
        />
        <script dangerouslySetInnerHTML={{ __html: restoreAesthetic }} />
      </head>
      <body>
        {children}
        {/* Outside `children` on purpose: mounted here it belongs to the
            document rather than to a page, so a track survives the walk from
            the portfolio to the hire page instead of being cut off by the route
            change. It renders as a single collapsed control and fetches nothing
            until someone opens it. */}
        <Jukebox />
        {/* Real Core Web Vitals from real visitors — the only measurement that
            can tell whether the pinned track and the canvas fields behave on
            the hardware recruiters actually use. Gated on Vercel because its
            beacon is served by the platform: anywhere else the script tag would
            only be a 404 in the network panel. */}
        {process.env.VERCEL ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
