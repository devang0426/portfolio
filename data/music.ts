export interface Track {
  /** YouTube video id — the tail of the watch URL. */
  id: string;
  title: string;
  artist: string;
}

/**
 * The jukebox playlist.
 *
 * Played through YouTube's own embedded player rather than as files served from
 * this site. That is the whole reason this is legitimate: the embed is the
 * licensed route, and the rights holders are paid for the play. Do not swap it
 * for an `<audio>` tag pointing at an mp3 of a commercial track — that is
 * distribution, and it is the kind of thing a recruiter's legal team notices.
 *
 * Both ids below were checked as embeddable. Not every track is: rights holders
 * can disable off-site playback per video, and when they do the player reports
 * error 101 or 150 and the jukebox drops the track rather than sitting on a
 * dead entry. Worth re-checking anything you add here.
 */
export const tracks: Track[] = [
   { id: "ikFFVfObwss", title: "Highway to Hell", artist: "AC/DC" },
  { id: "9vWNauaZAgg", title: "Back In Black", artist: "AC/DC" },
];

/**
 * Where the volume starts, 0–100.
 *
 * Deliberately not 100. The first press should not be a jolt — someone tries
 * the button out of curiosity, not because they want a wall of sound, and a
 * player that opens at full blast gets closed rather than turned down. They can
 * raise it from the player itself.
 *
 * This is the honest version of "autoplay quietly on arrival", which browsers
 * refuse anyway: Chrome, Safari and Firefox all block autoplay with sound
 * without a user gesture, so the only autoplay that would actually run is a
 * muted one, and muted music is no music.
 */
export const START_VOLUME = 35;

export const music = {
  /** The collapsed control. */
  label: "Music",
  open: "Open the music player",
  close: "Close the music player",
  play: "Play",
  pause: "Pause",
  next: "Next track",
  /** Shown when a track's rights holder has switched off external playback. */
  unavailable: "Not available outside YouTube",
};
