"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** What the player is doing, as far as the interface needs to care. */
export type IntroStatus = "playing" | "blocked" | "ended" | "failed";

/** `pending` is the moment before the browser has said yes or no to autoplay. */
type Phase = "pending" | IntroStatus;

/**
 * Why the case opened. The page reacts differently to each: finishing the clip
 * is something the visitor just did and the page follows through on it, while
 * the other two are the gate failing open and should move nothing.
 */
export type RevealReason = "watched" | "unavailable" | "reduced";

/**
 * Stall recovery. Armed only once playback has actually begun, and set from the
 * clip's real remaining duration — so a clip that dies halfway through still
 * opens the case, while a clip that was never allowed to start does not. That
 * distinction is the whole gate: this is not a timer anyone can wait out.
 */
const CAP_GRACE_MS = 2_500;
const FALLBACK_CAP_MS = 20_000;

/**
 * How long the gate waits for a clip that has never started before deciding
 * there is nothing to gate on.
 *
 * This is not a way around the gate, because of what it checks when it fires:
 * a browser that has buffered the clip and merely refuses to autoplay it has
 * `readyState >= HAVE_CURRENT_DATA`, and that case stays sealed with a play
 * control on screen — the clip is one click away. A browser with nothing
 * buffered has a clip it cannot play at all, and sealing a page behind that is
 * just a broken page.
 */
const LOAD_CAP_MS = 10_000;
const HAVE_CURRENT_DATA = 2;
const NETWORK_NO_SOURCE = 3;

export interface HireIntro {
  /** True once the case below should be on screen. */
  revealed: boolean;
  /** Null until it is. */
  revealReason: RevealReason | null;
  status: IntroStatus;
  muted: boolean;
  /** 0–1, for the progress affordance each aesthetic draws its own way. */
  progress: number;
  /** Reduced-motion visitors are never made to sit through it. */
  reduced: boolean;
  toggleMute: () => void;
  /** Start, resume or restart playback by hand. */
  play: () => void;
  /** Handlers for the `<video>` element itself. */
  onEnded: () => void;
  onError: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onPlay: () => void;
}

/**
 * Mechanics of the hire page's opening clip.
 *
 * The case below stays sealed until the clip has run once. There is no skip and
 * no timer to sit out — the only ordinary way through is to watch it, which at
 * about seven seconds is a fair thing to ask.
 *
 * What there *is*, is a distinction between a visitor who would rather not
 * watch and a visitor who **cannot**. Content locked behind a video that 404s,
 * that the browser refuses to autoplay, or that stalls on a bad connection is
 * not a gate, it is a dead page — so those three fail open. A refused autoplay
 * is the one that does not open on its own: the browser will play it the moment
 * it is asked, so the page asks, rather than giving away the clip to everyone
 * who has autoplay switched off.
 */
export function useHireIntro(
  videoRef: React.RefObject<HTMLVideoElement | null>,
): HireIntro {
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("pending");
  /* Sticky, and deliberately separate from the phase: replaying a finished clip
     moves the phase back to `playing`, and a case that sealed itself again at
     that point would be actively hostile. */
  const [reason, setReason] = useState<Exclude<RevealReason, "reduced"> | null>(
    null,
  );
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const cap = useRef<number | null>(null);

  const clearCap = useCallback(() => {
    if (cap.current !== null) window.clearTimeout(cap.current);
    cap.current = null;
  }, []);

  const reveal = useCallback(
    (why: Exclude<RevealReason, "reduced">) => {
      clearCap();
      setReason((current) => current ?? why);
    },
    [clearCap],
  );

  /**
   * Restarts the stall watchdog from the clip's own remaining runtime. Called
   * only from `onPlay`, which is what keeps it from becoming a way around the
   * gate: no playback, no watchdog, no reveal.
   */
  const armCap = useCallback(() => {
    clearCap();
    const video = videoRef.current;
    const known =
      video && Number.isFinite(video.duration) && video.duration > 0
        ? (video.duration - video.currentTime) * 1000 + CAP_GRACE_MS
        : FALLBACK_CAP_MS;
    cap.current = window.setTimeout(() => reveal("unavailable"), known);
  }, [clearCap, reveal, videoRef]);

  /* Autoplay, muted, because that is what browsers permit without a gesture.
     A refusal leaves the case sealed and puts a play control on screen — the
     clip is still one click away, which is not true of a 404. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) {
      video.pause();
      return;
    }

    let cancelled = false;
    video.muted = true;
    const attempt = video.play();
    /* Older browsers return nothing from play(); there is nothing to catch.
       The rejection *name* is the thing worth reading, and it is the most
       reliable signal available: an `error` event on the media can fire before
       React has hydrated and attached a handler — which is exactly how a
       missing file sealed the page in silence — but this rejection is caught
       here, in the effect that asked for playback, whenever it arrives. */
    attempt?.catch?.((error: unknown) => {
      if (cancelled) return;
      const name = error instanceof Error ? error.name : "";
      if (name === "NotAllowedError") {
        // The clip is fine, the browser just wants to be asked by a human.
        // Stays sealed; the play control is the way through.
        setPhase("blocked");
        return;
      }
      // NotSupportedError and the rest: there is no clip here to gate on.
      setPhase("failed");
      reveal("unavailable");
    });

    return () => {
      cancelled = true;
    };
  }, [reduced, reveal, videoRef]);

  useEffect(() => clearCap, [clearCap]);

  /**
   * Watches for a clip that is never going to play, because none of the events
   * you would expect to tell you that actually do.
   *
   * A `<video>` whose `<source>` 404s is genuinely silent: the source's `error`
   * fires before React has hydrated and attached anything, the video element
   * fires no `error` of its own, `video.error` stays null — and `play()`
   * returns a promise that never settles, so there is no rejection to catch
   * either. The only honest signal is `networkState`, which goes to
   * `NETWORK_NO_SOURCE` and stays there, so that is what this reads.
   *
   * Polling rather than listening is the point: the state is terminal and may
   * already have been reached before this effect ever ran.
   */
  useEffect(() => {
    if (reduced) return;
    const started = Date.now();

    const id = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      // Playing for real. Nothing left to watch for.
      if (!video.paused && video.readyState >= HAVE_CURRENT_DATA) {
        window.clearInterval(id);
        return;
      }

      // The browser has exhausted every source and has nothing to show.
      if (video.networkState === NETWORK_NO_SOURCE) {
        window.clearInterval(id);
        setPhase("failed");
        reveal("unavailable");
        return;
      }

      if (Date.now() - started >= LOAD_CAP_MS) {
        window.clearInterval(id);
        // Buffered but idle means autoplay was refused, not that the clip is
        // missing — that one stays sealed and keeps offering the play control.
        if (video.readyState < HAVE_CURRENT_DATA) {
          setPhase("failed");
          reveal("unavailable");
        }
      }
    }, 400);

    return () => window.clearInterval(id);
  }, [reduced, reveal, videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
  }, [videoRef]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // A replay after the clip has run needs rewinding; a resume after a blocked
    // autoplay does not, and rewinding that would be its own small rudeness.
    if (video.ended) video.currentTime = 0;
    void video.play().catch(() => setPhase("blocked"));
  }, [videoRef]);

  const onPlay = useCallback(() => {
    setPhase("playing");
    armCap();
  }, [armCap]);

  const onEnded = useCallback(() => {
    setPhase("ended");
    setProgress(1);
    reveal("watched");
  }, [reveal]);

  /**
   * Wire to BOTH the `<video>` and its `<source>`.
   *
   * A `<video>` that names its file through a `<source>` child never fires
   * `error` itself when that file 404s — the failure fires on the source, and
   * `error` does not bubble. Listening only on the video is how a missing clip
   * ended up sealing the page silently and indefinitely.
   */
  const onError = useCallback(() => {
    // Nothing to gate on. Sealing the case behind a file that does not exist
    // would only ever punish the visitor for something on this end.
    setPhase("failed");
    reveal("unavailable");
  }, [reveal]);

  const onLoadedMetadata = useCallback(() => {
    /* Deliberately does no arming. Metadata loads whether or not the clip is
       ever allowed to play, and a watchdog started here would hand the case to
       anyone who simply waited with autoplay switched off. */
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    setProgress(Math.min(1, video.currentTime / video.duration));
  }, [videoRef]);

  return {
    revealed: reason !== null || reduced,
    revealReason: reason ?? (reduced ? "reduced" : null),
    status: phase === "pending" ? (reduced ? "blocked" : "playing") : phase,
    muted,
    progress,
    reduced,
    toggleMute,
    play,
    onEnded,
    onError,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
  };
}
