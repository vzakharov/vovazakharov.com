/**
 * What `/island?play` hands a script on `window[PLAY_HOOK]`, and only when the
 * URL carries `PLAY_QUERY`: the page's real clock frozen and a seeded one
 * stepped by hand, so every run draws the same frames. The page implements it;
 * `scripts/play-island.ts` drives it.
 */
export type IslandPlayHook = {
  /** Resolves once the scene has drawn its first frame. */
  ready: () => Promise<void>;
  /** Puts the eye `m` metres above the ground; resolves once every tile the view then selects is uploaded. */
  setHeight: (m: number) => Promise<void>;
  /** Puts the eye `m` metres over latitude `lat`, longitude `lon` (degrees, east positive), its heading kept; resolves as `setHeight` does. */
  moveTo: (lat: number, lon: number, m: number) => Promise<void>;
  /** Turns the eye so screen-up faces `heading`, radians clockwise from north; resolves as `setHeight` does. */
  turnTo: (heading: number) => Promise<void>;
  /** Sets the time of day to `hours` past the opening's sun (24 a day) and draws; the clock stays stopped. */
  setTime: (hours: number) => void;
  /** Advances the seeded clock by `ms` and draws one frame. */
  step: (ms: number) => void;
  /** The JS time of each frame `step` drew, in ms, oldest first. */
  frameMs: () => number[];
  /** The renderer's backend, `'webgpu'` or `'webgl2'`, once `ready` resolves. */
  backend: () => string;
  /** Ms the tile worker took to build the world's field, once `ready` resolves. */
  buildMs: () => number;
};

/** The `window` property the hook sits on. */
export const PLAY_HOOK = '__island';

/** The query parameter whose presence makes the page expose the hook. */
export const PLAY_QUERY = 'play';
