import type { Look } from '@/island/shared/play';

import type { Pace } from '../lib/pace';
import type { Pose } from '../lib/place-hash';
import type { Where } from '../lib/where-line';
import type { Without } from '../lib/without';
import type { LookSwitch } from './scene-look';

export type IslandScene = LookSwitch & {
  /** Resolves once the first frame is drawn. */
  readonly ready: Promise<void>;
  /** Steps the eye `dt` seconds by the player's input (none under play) and draws; returns the metres it moved. */
  readonly frame: (dt: number) => number;
  /** Puts the eye `m` metres up; resolves once every tile it then selects is drawn. */
  readonly setHeight: (m: number) => Promise<void>;
  /** Puts the eye `m` metres over latitude `lat`, longitude `lon` (degrees, east positive), its heading kept, resolving as `setHeight` does. */
  readonly moveTo: (lat: number, lon: number, m: number) => Promise<void>;
  /** Sets the clock to `hours` past the opening's sun, as it stands, and draws. */
  readonly setTime: (hours: number) => void;
  /** Turns the eye to `heading`, resolving as `setHeight` does. */
  readonly turnTo: (heading: number) => Promise<void>;
  /** Raises the view `look` radians above its height's pitch, resolving as `setHeight` does. */
  readonly lookTo: (look: number) => Promise<void>;
  /** `'webgpu'` or `'webgl2'`, once ready. */
  readonly backend: () => string;
  /** Ms the worker took to build the current world's field; throws until it lands. */
  readonly buildMs: () => number;
  /**
   * Rebuilds the scene on world `world`: every tile held or in flight is
   * dropped and refilled from the new field, the eye left where it is.
   */
  readonly setWorld: (world: string) => void;
  /** Puts the eye in `pose` and the clock at its hour, the opening's when it names none. */
  readonly placeAt: (pose: Pose) => void;
  /** Where the eye stands now, in the world on screen; throws until ready. */
  readonly where: () => Where;
  /** The drawn frames' pace; none before the first frame, nor under play. */
  readonly pace: () => Pace | undefined;
  /** The look on screen. */
  readonly look: () => Look;
  /** The costs the full looks leave out now. */
  readonly without: () => ReadonlySet<Without>;
  /** Leaves `costs` out of the full looks from the next frame, and puts back every other. */
  readonly setWithout: (costs: ReadonlySet<Without>) => void;
};
