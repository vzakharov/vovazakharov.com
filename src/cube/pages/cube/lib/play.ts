import type { Readying } from '@/kernel/shared/typings';

import type { Pose, Quad, Taken } from '@/cube/entities/world';

/** The query that opens `/cube` for a script: no input, the hook installed. */
export const PLAY_QUERY = 'play';

/** The global the hook is installed under. */
export const PLAY_HOOK = '__cubePlay';

/**
 * The instant a script's page is stopped at, so two runs shoot the same
 * frames: noon UTC on the day the cube was planted.
 */
export const PLAY_INSTANT = Date.UTC(2026, 10, 1, 12);

/** The scene's half of the hook. */
export type ScenePlay = Readying & {
  /**
   * Puts the eye at `pose`, with `moving` in the rooms until the next call,
   * each quad in its own room's frame, and the pill `taken` off its shelf;
   * resolves once a frame of it is on screen.
   */
  setPose: (
    pose: Pose,
    moving?: readonly Quad[],
    taken?: Taken | null,
  ) => Promise<void>;
  /** The adapter's vendor and architecture, as WebGPU reports them. */
  adapter: () => string;
};

/** What `/cube?play` lets a script do, each call awaited to its end. */
export type CubePlayHook = ScenePlay & {
  /**
   * Presses E, as the keyboard would: a sign in reach opens its offer.
   * Resolves once a frame has read the press.
   */
  press: () => Promise<void>;
  /**
   * Shows the pill's line `prompt` in the page's hint, or none; resolves once
   * the page has drawn it.
   */
  setPill: (prompt: 'take' | 'ask' | null) => Promise<void>;
  /**
   * Stops the clock at `ms` since the epoch, so every frame from the next is
   * of that instant. A script's page opens stopped at `PLAY_INSTANT`.
   */
  setClock: (ms: number) => void;
};
