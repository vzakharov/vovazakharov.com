/**
 * The contract between the clip's page and `pnpm film:clip`: opened with
 * `?film`, the page draws no controls and plays no sound, and installs this
 * hook on `window` for the script to draw each frame at its exact time.
 */
export const FILM_QUERY = 'film';

export const FILM_HOOK = '__horowoClip';

export type ClipFilmHook = {
  /** Resolves once the stage is sized and its fonts are loaded. */
  ready: () => Promise<boolean>;
  /** Draws the clip at `t` seconds, synchronously. */
  draw: (t: number) => boolean;
};

/** `?t=` on the page: a still at that time, with no sound. */
export const STILL_QUERY = 't';
