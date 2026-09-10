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

/**
 * Loads the IFrame API once, on demand, and never before.
 *
 * A cold YouTube embed is several hundred kilobytes across a few dozen
 * requests. Loading it on page load — for a control most visitors never touch —
 * would show up in the Core Web Vitals this project already measures, so
 * nothing is fetched until someone actually presses play.
 */
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

/**
 * A docked music pill.
 *
 * Streams through YouTube's embedded player rather than from audio files served
 * by this site. That is not a workaround, it is the point: the embed is the
 * licensed route and the rights holders are paid for the play, where an `<audio>`
 * tag pointing at an mp3 of a commercial recording would be distribution. The
 * custom shell — cover art, the now-playing row, the controls — is ours; the
 * playback underneath it is YouTube's.
 *
 * Three rules it does not break. It never autoplays: nothing makes a sound
 * until a visitor asks, because a portfolio that starts playing music at a
 * stranger is a portfolio they close. It fetches nothing until then. And it
 * yields to any other audio on the page.
 *
 * It lives in the root layout rather than in a page, so a track survives a
 * route change instead of being cut off mid-bar.
 */
export function Jukebox() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [refused, setRefused] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  /** The track the player was built for, so we know when to swap rather than rebuild. */
  const loadedRef = useRef<string | null>(null);
  /** Rolls into the next track. Kept in a ref so the player's own handlers,
      which were closed over at construction, always call the current one. */
  const advanceRef = useRef<() => void>(() => {});

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
    setPlaying(false);
  }, []);

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

  const select = useCallback(
    async (track: Track) => {
      // Second press on the track already going is a pause.
      if (activeId === track.id && playing) {
        pause();
        return;
      }

      setActiveId(track.id);

      try {
        const YT = await loadApi();
        const host = hostRef.current;
        if (!host) return;

        if (playerRef.current && loadedRef.current) {
          if (loadedRef.current !== track.id) {
            playerRef.current.loadVideoById(track.id);
            loadedRef.current = track.id;
          } else {
            playerRef.current.playVideo();
          }
          setPlaying(true);
          return;
        }

        playerRef.current = new YT.Player(host, {
          height: "146",
          width: "260",
          videoId: track.id,
          playerVars: { playsinline: 1, rel: 0, origin: window.location.origin },
          events: {
            onReady: (event) => {
              loadedRef.current = track.id;
              // Set before the first frame of audio, so the opening note
              // arrives at the gentle level rather than being turned down
              // a moment after it has already startled someone.
              event.target.setVolume(START_VOLUME);
              event.target.playVideo();
              setPlaying(true);
            },
            onStateChange: (event) => {
              const state = window.YT?.PlayerState;
              if (!state) return;
              if (event.data === state.PLAYING) setPlaying(true);
              if (event.data === state.PAUSED) setPlaying(false);
              if (event.data === state.ENDED) {
                // Once it is going it keeps going: the end of a track rolls
                // into the next one, and only the visitor stops it. Called
                // through a ref because this handler was closed over when the
                // player was built and would otherwise be advancing from a
                // stale idea of what is playing.
                advanceRef.current();
              }
            },
            onError: (event) => {
              setPlaying(false);
              if (EMBED_REFUSED.has(event.data)) {
                // The rights holder has switched off external playback. Say so
                // on the track rather than leaving a button that does nothing.
                setRefused((current) => new Set(current).add(track.id));
              } else {
                setFailed(true);
              }
            },
          },
        });
      } catch {
        // The API never arrived — an ad blocker, an offline visitor, a network
        // that dislikes Google. Nothing here is load-bearing, so it just stops.
        setFailed(true);
      }
    },
    [activeId, playing, pause],
  );

  const active = tracks.find((track) => track.id === activeId) ?? tracks[0];

  const step = useCallback(
    (delta: number) => {
      // Stepped from what is actually loaded, not from render state, so it is
      // correct when called from the player's own end-of-track handler.
      const from = loadedRef.current ?? active.id;
      const index = tracks.findIndex((track) => track.id === from);
      const next = tracks[(index + delta + tracks.length) % tracks.length];
      if (next) void select(next);
    },
    [active.id, select],
  );

  useEffect(() => {
    advanceRef.current = () => step(1);
  }, [step]);

  /* Collapsing only folds the track list away. The music keeps going — it stops
     when the visitor stops it, and not before. */
  const toggleOpen = () => setOpen((wasOpen) => !wasOpen);

  /* Not on the hire page. That page opens with a spoken clip and the whole
     point of it is that someone listens to it — a second thing offering to make
     noise in the corner is working against the only job that page has. */
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
              className="jukebox__button"
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
