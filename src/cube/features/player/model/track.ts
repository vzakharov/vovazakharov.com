import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';

/**
 * How a channel arrives at a key from the one before: `smooth` leaves and
 * arrives at rest, `linear` keeps its pace, `in` leaves at rest and arrives
 * at pace, `out` leaves at pace and arrives at rest. An `in` into a key and an
 * `out` out of it carry a motion through the key without a stop.
 */
export type Ease = 'smooth' | 'linear' | 'in' | 'out';

/** A channel's value at a moment, and how it is arrived at; `smooth` unsaid. */
export type Key = readonly [at: number, value: number, ease?: Ease];

/**
 * One number over a scene's time: its keys in order of `at`, held at the
 * first before it and at the last after it.
 */
export type Channel = readonly Key[];

const EASED: Record<Ease, (share: number) => number> = {
  smooth,
  linear: (share) => share,
  in: (share) => share * share,
  out: (share) => share * (2 - share),
};

/** `channel`'s value `t` seconds into its scene. */
export function valueAt(channel: Channel, t: number): number {
  const [first] = channel;
  if (first === undefined) throw new RangeError('A channel needs a key');
  let [from, value] = first;
  for (const [at, to, ease] of channel) {
    if (t < at) {
      return lerp(value, to, EASED[ease ?? 'smooth'](ramp(t, from, at)));
    }
    [from, value] = [at, to];
  }
  return value;
}

/** The names of what a scene scripts, each a channel of its own. */
type ShotChannel =
  | 'x'
  | 'y'
  | 'z'
  | 'yaw'
  | 'elevation'
  | 'roll'
  | 'lids'
  | 'exposure';

/**
 * What a scene's camera is at one moment: the eye's place, the way it looks
 * and how far it is rolled about that way, in the units of whoever wrote the
 * track; `lids` from 0, shut, to 1, open; `exposure` as a share of the lens's
 * own.
 */
export type Shot = Record<ShotChannel, number>;

/** Something a scene sets off `at` seconds into it. */
export type Marked<C> = readonly [at: number, cue: C];

/**
 * A scene: every channel of its camera over `span` seconds, and the cues it
 * sets off on the way, in order of their moments.
 */
export type Track<C> = Record<ShotChannel, Channel> & {
  span: number;
  cues: readonly Marked<C>[];
};

/** `track`'s camera `t` seconds in: a function of `t` alone. */
export const shotAt = <C>(track: Track<C>, t: number): Shot => ({
  x: valueAt(track.x, t),
  y: valueAt(track.y, t),
  z: valueAt(track.z, t),
  yaw: valueAt(track.yaw, t),
  elevation: valueAt(track.elevation, t),
  roll: valueAt(track.roll, t),
  lids: valueAt(track.lids, t),
  exposure: valueAt(track.exposure, t),
});

/**
 * The cues `track` sets off in the frame that takes it from `from` to `to`
 * seconds: each cue falls in exactly one frame of any run of frames, and the
 * frame that ends the track takes whatever is left.
 */
export const cuesBetween = <C>(
  { cues, span }: Track<C>,
  from: number,
  to: number,
): C[] =>
  cues
    .filter(([at]) => at >= from && (at < to || to >= span))
    .map(([, cue]) => cue);
