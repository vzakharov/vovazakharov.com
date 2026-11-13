import type { Readying } from '@/kernel/shared/typings';

import type { Laddered } from '@/cube/shared/outside';
import type { InRoomOf, Outside, Pose, Quad } from '@/cube/entities/world';

import type { OutsideLens } from './outside-lens';

/** The query that opens `/cube` for a script: no input, the hook installed. */
export const PLAY_QUERY = 'play';

/** The global the hook is installed under. */
export const PLAY_HOOK = '__cubePlay';

/**
 * The instant a script's page is stopped at, so two runs shoot the same
 * frames: noon UTC on the day the cube was planted.
 */
export const PLAY_INSTANT = Date.UTC(2026, 10, 1, 12);

/** What a script puts in the rooms until its next call. */
export type Among = {
  /** Quads drawn until the next call, each in its own room's frame. */
  moving?: readonly Quad[];
};

/**
 * What a script sets beside a pose: an eye on floor 1 given a `lens` sees
 * through it in its floor's place, which is how a frame is shot as an eye
 * still used to daylight sees the room; and the room whose pill is `taken`
 * off its shelf.
 */
export type InsideSet = Among & {
  lens?: OutsideLens;
  taken?: InRoomOf | null;
};

/**
 * What a script sets beside an outside eye, every quad of its `moving` in the
 * frame of floor 1's room, which reaches past its walls as far as the island
 * does: whether the ladder has gone, and the body that casts a shadow.
 */
export type OutsideSet = Among & Laddered;

/** The scene's half of the hook. */
export type ScenePlay = Readying & {
  /**
   * Puts the eye at `pose`, with `among` set until the next call; resolves
   * once a frame of it is on screen.
   */
  setPose: (pose: Pose, among?: InsideSet) => Promise<void>;
  /**
   * Puts the eye outside the cube at `eye`, seeing through `lens` —
   * `OUTSIDE_LENS` where none is given — until the next `setPose`, with
   * `among` set until the next call; resolves once a frame of it is on
   * screen.
   */
  setEye: (
    eye: Outside,
    lens?: OutsideLens,
    among?: OutsideSet,
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
