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

/** One value for each channel, as `of` gives it. */
const perChannel = <T>(
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
  perChannel((name) => valueAt(track[name], t));

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

/**
 * A moment a scene is written at: the channels it pins there, each arrived
 * at by `ease`. A channel a moment leaves out moves straight through it.
 */
export type Beat = Partial<Shot> & { at: number; ease?: Ease };

/**
 * The track through `beats` in order, lasting to the last of them: the
 * first pins every channel, and each channel runs through the beats that
 * name it.
 */
export function trackOf<C>(
  beats: readonly Beat[],
  cues: readonly Marked<C>[] = [],
): Track<C> {
  const channels = perChannel((name): Channel => {
    if (beats[0]?.[name] === undefined) {
      throw new RangeError(`A track's first beat pins its ${name}`);
    }
    return beats.flatMap((beat): Key[] => {
      const value = beat[name];
      if (value === undefined) return [];
      return [beat.ease ? [beat.at, value, beat.ease] : [beat.at, value]];
    });
  });
  return { ...channels, span: Math.max(...beats.map(({ at }) => at)), cues };
}

const BACKWARDS: Record<Ease, Ease> = {
  smooth: 'smooth',
  linear: 'linear',
  in: 'out',
  out: 'in',
};

/** `channel` of a scene `span` long, played from its end to its start. */
const backwards = (channel: Channel, span: number): Channel =>
  channel
    .map(([at, value], index): Key => {
      // The stretch arrived at here, backwards, is the one left from here.
      const ease = channel[index + 1]?.[2];
      return ease ? [span - at, value, BACKWARDS[ease]] : [span - at, value];
    })
    .toReversed();

/** `channel` starting `by` seconds later. */
const delayed = (channel: Channel, by: number): Channel =>
  channel.map(([at, ...rest]): Key => [at + by, ...rest]);

/**
 * `track` played backwards, each cue `swapped` for the one its undoing sets
 * off.
 */
export const reversed = <C>(
  track: Track<C>,
  swapped: (cue: C) => C = (cue) => cue,
): Track<C> => {
  const { span, cues } = track;
  return {
    ...perChannel((name) => backwards(track[name], span)),
    span,
    cues: cues
      .map(([at, cue]): Marked<C> => [span - at, swapped(cue)])
      .toReversed(),
  };
};

/**
 * `first` and then `second`, which opens where `first` ends: a channel the
 * two disagree on there jumps.
 */
export const joined = <C>(first: Track<C>, second: Track<C>): Track<C> => {
  const by = first.span;
  return {
    ...perChannel((name): Channel => [
      ...first[name],
      ...delayed(second[name], by),
    ]),
    span: by + second.span,
    cues: [
      ...first.cues,
      ...second.cues.map(([at, cue]): Marked<C> => [at + by, cue]),
    ],
  };
};
