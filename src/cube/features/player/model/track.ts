import { lerp, ramp, smooth } from '@/cube/shared/lib/ease';

/**
 * How a channel arrives at a key from the one before: `smooth` leaves and
 * arrives at rest, `linear` keeps its pace, `in` leaves at rest and arrives
 * at pace, `out` leaves at pace and arrives at rest. An `in` into a key and an
 * `out` out of it carry a motion through the key without a stop.
 */
type Ease = 'smooth' | 'linear' | 'in' | 'out';

/** A channel's value at a moment, and how it is arrived at; `smooth` unsaid. */
type Key = readonly [at: number, value: number, ease?: Ease];

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
 * A scene: every channel of its camera over `runs` seconds, and the cues it
 * sets off on the way, in order of their moments.
 */
export type Track<C> = Record<ShotChannel, Channel> & {
  runs: number;
  cues: ReadonlyArray<Marked<C>>;
};

/** One value for each channel, as `of` gives it. */
const channelWise = <T>(
  of: (name: ShotChannel) => T,
): Record<ShotChannel, T> => ({
  x: of('x'),
  y: of('y'),
  z: of('z'),
  yaw: of('yaw'),
  elevation: of('elevation'),
  roll: of('roll'),
  lids: of('lids'),
  exposure: of('exposure'),
});

/** `track`'s camera `t` seconds in: a function of `t` alone. */
export const shotAt = <C>(track: Track<C>, t: number): Shot =>
  channelWise((name) => valueAt(track[name], t));

/**
 * The cues `track` sets off in the frame that takes it from `from` to `to`
 * seconds: each cue falls in exactly one frame of any run of frames, and the
 * frame that ends the track takes whatever is left.
 */
export const cuesBetween = <C>(
  { cues, runs }: Track<C>,
  from: number,
  to: number,
): C[] =>
  cues
    .filter(([at]) => at >= from && (at < to || to >= runs))
    .map(([, cue]) => cue);

/**
 * A moment a scene is written at: the channels it pins there, each arrived
 * at by `ease`. A channel a moment leaves out moves straight through it.
 */
export type Beat = Partial<Shot> & { mark: number; ease?: Ease };

/**
 * The track through `beats` in order, lasting to the last of them: the
 * first pins every channel, and each channel runs through the beats that
 * name it.
 */
export function trackOf<C>(
  beats: readonly Beat[],
  cues: ReadonlyArray<Marked<C>> = [],
): Track<C> {
  const channels = channelWise((name): Channel => {
    if (beats[0]?.[name] === undefined) {
      throw new RangeError(`A track's first beat pins its ${name}`);
    }
    return beats.flatMap((beat): Key[] => {
      const value = beat[name];
      if (value === undefined) return [];
      return [beat.ease ? [beat.mark, value, beat.ease] : [beat.mark, value]];
    });
  });
  return {
    ...channels,
    runs: Math.max(...beats.map(({ mark }) => mark)),
    cues,
  };
}

/** `channel` starting `by` seconds later. */
const delayed = (channel: Channel, by: number): Channel =>
  channel.map(([at, ...rest]): Key => [at + by, ...rest]);

/**
 * `first` and then `second`, which opens where `first` ends: a channel the
 * two disagree on there jumps.
 */
export const joined = <C>(first: Track<C>, second: Track<C>): Track<C> => {
  const by = first.runs;
  return {
    ...channelWise(
      (name): Channel => [...first[name], ...delayed(second[name], by)],
    ),
    runs: by + second.runs,
    cues: [
      ...first.cues,
      ...second.cues.map(([at, cue]): Marked<C> => [at + by, cue]),
    ],
  };
};
