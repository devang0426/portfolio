"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HIRE_ROUTE } from "@/data/hire";
import { START_VOLUME, music, tracks, type Track } from "@/data/music";

/* ---------- the sliver of the YouTube IFrame API this needs ---------- */

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  loadVideoById(id: string): void;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTNamespace {
  Player: new (
    host: HTMLElement,
    options: {
      height: string;
      width: string;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";

/** YouTube's own still for a video — the cover art, at no cost to us. */
const coverFor = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Loads the IFrame API once, on demand, and never at page load. */
let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    // The API calls exactly one global hook, so chain rather than overwrite:
    // clobbering it would break any other embed that got there first.
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube API loaded without a Player"));
    };
    const script = document.createElement("script");
    script.src = API_SRC;
    script.async = true;
    script.onerror = () => reject(new Error("YouTube API failed to load"));
    document.head.appendChild(script);
  });
  return apiPromise;
}

/** Rights holders can switch off off-site playback per video. */
const EMBED_REFUSED = new Set([101, 150]);

/** Anything that means a visitor is here and using the page. */
const WARMING_EVENTS = ["pointerdown", "touchstart", "keydown", "scroll"] as const;

/**
 * A docked music pill.
 *
 * Streams through YouTube's embedded player rather than from audio files served
 * by this site. That is not a workaround, it is the point: the embed is the
 * licensed route and the rights holders are paid for the play, where an audio
 * tag pointing at an mp3 of a commercial recording would be distribution. The
 * shell — cover art, the now-playing row, the controls — is ours; the playback
 * underneath it is YouTube's.
 *
 * It never autoplays, it yields to any other audio on the page, and it lives in
 * the root layout so a track survives a route change rather than being cut off
 * mid-bar.
 */
export function Jukebox() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [refused, setRefused] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  /** Set only once the player is genuinely ready, so its presence means usable. */
  const playerRef = useRef<YTPlayer | null>(null);
  /** In-flight construction, so two taps cannot build two players. */
  const buildRef = useRef<Promise<YTPlayer> | null>(null);
  /** The track currently loaded into the player. */
  const loadedRef = useRef<string | null>(null);
  /** Rolls into the next track. A ref because the player's own handlers were
      closed over at construction and would otherwise advance from stale state. */
  const advanceRef = useRef<() => void>(() => {});

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
    setPlaying(false);
  }, []);

  /**
   * Builds the player, cued but not playing, and resolves when it can be used.
   *
   * Kept separate from pressing play for one reason, and it is a phone reason:
   * mobile browsers hand a tap a short-lived *user activation*, and crossing an
   * `await` throws it away. A `playVideo()` called after awaiting the API and
   * the player's own readiness is therefore refused — which is exactly why the
   * first tap used to do nothing and the second one worked, the second tap
   * finding a player already built and reaching it synchronously.
   *
   * So construction happens ahead of time, and pressing play stays synchronous.
   */
  const ensurePlayer = useCallback((): Promise<YTPlayer> => {
    if (playerRef.current) return Promise.resolve(playerRef.current);
    if (buildRef.current) return buildRef.current;

    buildRef.current = (async () => {
      const YT = await loadApi();
      const host = hostRef.current;
      if (!host) throw new Error("jukebox host missing");

      return new Promise<YTPlayer>((resolve, reject) => {
        const first = tracks[0];
        const player = new YT.Player(host, {
          height: "146",
          width: "260",
          videoId: first.id,
          // No `autoplay`: this is a warm-up, not a performance. It cues the
          // first track and waits to be asked.
          playerVars: { playsinline: 1, rel: 0, origin: window.location.origin },
          events: {
            onReady: (event) => {
              loadedRef.current = first.id;
              // Set before any audio, so the first note arrives gently rather
              // than being turned down after it has already startled someone.
              event.target.setVolume(START_VOLUME);
              playerRef.current = event.target;
              resolve(event.target);
            },
            onStateChange: (event) => {
              const state = window.YT?.PlayerState;
              if (!state) return;
              if (event.data === state.PLAYING) setPlaying(true);
              if (event.data === state.PAUSED) setPlaying(false);
              if (event.data === state.ENDED) advanceRef.current();
            },
            onError: (event) => {
              setPlaying(false);
              if (EMBED_REFUSED.has(event.data)) {
                // The rights holder has switched off external playback. Say so
                // on the track rather than leaving a button that does nothing.
                setRefused((current) => {
                  const next = new Set(current);
                  next.add(loadedRef.current ?? first.id);
                  return next;
                });
              } else {
                setFailed(true);
              }
            },
          },
        });
        // Nothing else can reach it until `onReady`, but a player that never
        // becomes ready should not leave the promise hanging forever.
        window.setTimeout(() => {
          if (!playerRef.current) reject(new Error("player never became ready"));
        }, 15_000);
        void player;
      });
    })();

    buildRef.current.catch(() => {
      buildRef.current = null;
      setFailed(true);
    });

    return buildRef.current;
  }, []);

  /* Warm the player on the first sign of a real visitor — a tap, a key, a
     scroll. Not at page load, which would spend a few hundred kilobytes on
     everyone who never touches the thing; and not at the moment of pressing
     play, which is too late on a phone. By the time a thumb reaches the pill,
     the player is built and play is one synchronous call away. */
  useEffect(() => {
    let done = false;
    const warm = () => {
      if (done) return;
      done = true;
      stop();
      void ensurePlayer().catch(() => {});
    };
    const stop = () => {
      for (const type of WARMING_EVENTS) window.removeEventListener(type, warm);
    };
    for (const type of WARMING_EVENTS) {
      window.addEventListener(type, warm, { passive: true });
    }
    return stop;
  }, [ensurePlayer]);

  /* Anything else that starts making noise wins. `play` does not bubble, so
     this listens in the capture phase, which catches every media element on the
     page with no wiring between the two. */
  useEffect(() => {
    const onOtherMedia = (event: Event) => {
      if (event.target !== hostRef.current) pause();
    };
    document.addEventListener("play", onOtherMedia, true);
    return () => document.removeEventListener("play", onOtherMedia, true);
  }, [pause]);

  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  /** Starts or swaps a track on an already-built player. Must stay synchronous. */
  const start = useCallback((player: YTPlayer, track: Track) => {
    if (loadedRef.current !== track.id) {
      // `loadVideoById` both loads and plays.
      player.loadVideoById(track.id);
      loadedRef.current = track.id;
    } else {
      player.playVideo();
    }
    setPlaying(true);
  }, []);

  const select = useCallback(
    (track: Track) => {
      // Second press on the track already going is a pause.
      if (loadedRef.current === track.id && playing) {
        pause();
        return;
      }

      setActiveId(track.id);

      const player = playerRef.current;
      if (player) {
        // The warm path, and the one a phone needs: no await between the tap
        // and the call, so the user activation is still live.
        start(player, track);
        return;
      }

      // Cold path — the visitor got to the pill before warming finished. This
      // may be refused on mobile, which is precisely why warming exists.
      void ensurePlayer()
        .then((ready) => start(ready, track))
        .catch(() => setFailed(true));
    },
    [playing, pause, start, ensurePlayer],
  );

  const active = tracks.find((track) => track.id === activeId) ?? tracks[0];

  const step = useCallback(
    (delta: number) => {
      // Stepped from what is loaded, not from render state, so it is correct
      // when called from the player's own end-of-track handler.
      const from = loadedRef.current ?? active.id;
      const index = tracks.findIndex((track) => track.id === from);
      const next = tracks[(index + delta + tracks.length) % tracks.length];
      if (next) select(next);
    },
    [active.id, select],
  );

  useEffect(() => {
    advanceRef.current = () => step(1);
  }, [step]);

  /* Collapsing only folds the track list away. The music keeps going — it stops
     when the visitor stops it, and not before. */
  const toggleOpen = () => setOpen((wasOpen) => !wasOpen);

  /* Not on the hire page. That page opens with a spoken clip and its only job
     is that someone listens to it; a second thing offering to make noise in the
     corner is working against it. */
  if (pathname?.startsWith(HIRE_ROUTE)) return null;

  const activeRefused = refused.has(active.id);

  return (
    <div className="jukebox" data-open={open || undefined}>
      <div className="jukebox__pill">
        <button
          type="button"
          className="jukebox__cover"
          onClick={() => select(active)}
          disabled={activeRefused}
          aria-label={`${playing ? music.pause : music.play}: ${active.title} by ${active.artist}`}
        >
          {/* Decorative: the track name sits right beside it and the button
              carries its own label, so alt text here would only be noise. */}
          <Image
            className="jukebox__art"
            src={coverFor(active.id)}
            alt=""
            width={44}
            height={44}
            sizes="44px"
          />
          <span className="jukebox__cover-glyph" aria-hidden="true">
            {playing ? "▮▮" : "▶"}
          </span>
        </button>

        <span className="jukebox__meta">
          <span className="jukebox__title">{active.title}</span>
          <span className="jukebox__artist">
            {activeRefused ? music.unavailable : active.artist}
          </span>
        </span>

        <span className="jukebox__controls">
          {tracks.length > 1 ? (
            <button
              type="button"
              className="jukebox__button jukebox__next"
              onClick={() => step(1)}
              aria-label={music.next}
            >
              <span aria-hidden="true">⏭</span>
            </button>
          ) : null}
          <button
            type="button"
            className="jukebox__button jukebox__chevron"
            onClick={toggleOpen}
            aria-expanded={open}
            aria-controls="jukebox-panel"
          >
            <span aria-hidden="true">{open ? "▾" : "▴"}</span>
            <span className="visually-hidden">
              {open ? music.close : music.open}
            </span>
          </button>
        </span>
      </div>

      <div className="jukebox__panel" id="jukebox-panel" hidden={!open}>
        <ul className="jukebox__tracks">
          {tracks.map((track) => {
            const isRefused = refused.has(track.id);
            const isActive = track.id === active.id;
            return (
              <li key={track.id}>
                <button
                  type="button"
                  className="jukebox__track"
                  onClick={() => select(track)}
                  disabled={isRefused}
                  data-active={isActive || undefined}
                >
                  <span className="jukebox__track-glyph" aria-hidden="true">
                    {isActive && playing ? "▮▮" : "▶"}
                  </span>
                  <span className="jukebox__track-text">
                    <span className="jukebox__track-title">{track.title}</span>
                    <span className="jukebox__track-artist">
                      {isRefused ? music.unavailable : track.artist}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {failed ? (
          <p className="jukebox__note" role="status">
            Playback is not available right now.
          </p>
        ) : null}
      </div>

      {/* The engine.

          Deliberately outside the panel: the panel is `hidden` when collapsed,
          which is `display: none`, and a media element in a `display: none`
          subtree stops. Keeping the host here is what lets the music carry on
          while the track list is folded away — and across a route change, since
          the whole component lives in the root layout.

          Clipped rather than hidden, for the same reason: it has to remain a
          rendered, laid-out element to keep playing. */}
      <div className="jukebox__engine" aria-hidden="true">
        <div ref={hostRef} />
      </div>
    </div>
  );
}
