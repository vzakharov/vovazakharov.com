import type { Loud, RoomCue } from '@/cube/shared/lib/acoustics';
import type { Floored, Quad, Setting, Vec3 } from '@/cube/entities/world';

/** A thing that began at a second since the epoch. */
type Begun = { sinceEpoch: number };

/**
 * A sound a room is making at an instant: where in the room's frame it comes
 * from, how loud from 0 to 1, and the second since the epoch it began at —
 * the same on every frame it sounds, so a listener plays it once and knows
 * how far into it the room already is.
 */
export type RoomSound = Begun &
  Loud & {
    cue: RoomCue;
    source: Vec3;
  };

/** What a room shows and sounds like at one instant, in its own frame. */
export type Happening = {
  quads: readonly Quad[];
  sounds: readonly RoomSound[];
};

const NO_QUADS: readonly Quad[] = Object.freeze([]);
const NO_SOUNDS: readonly RoomSound[] = Object.freeze([]);

/** The one value every room where nothing goes on answers with. */
export const NOTHING: Happening = Object.freeze({
  quads: NO_QUADS,
  sounds: NO_SOUNDS,
});

/** The names an act draws its chances by. */
export const DRAWS = [
  'kind',
  'start',
  'lasts',
  'side',
  'way',
  'spot',
  'u',
  'v',
  'yaw',
  'paint',
  'hold',
  'raise',
  'spread',
  'head',
  'lean',
] as const;
type Draw = (typeof DRAWS)[number];

/**
 * An act's run: the second since the epoch it began at, how many seconds it
 * lasts, and its own chances, each uniform on `[0, 1)` and the same at every
 * instant of the run, `turn` telling apart the draws of its parts.
 */
export type Run = Begun & {
  lastsFor: number;
  chance: (draw: Draw, turn?: number) => number;
};

/**
 * One act as it stands at an instant: its run, the room it plays in, on floor
 * `n`, and how many seconds into the run the instant is.
 */
export type Staging = Run &
  Floored & {
    setting: Setting;
    age: number;
  };

/** An act: what it shows and sounds like at the instant staged. */
export type Act = (staging: Staging) => Happening;

/** `quads` and `sounds` as an answer: `NOTHING` itself where both are empty. */
export const shown = (
  quads: readonly Quad[],
  sounds: readonly RoomSound[] = NO_SOUNDS,
): Happening =>
  quads.length === 0 && sounds.length === 0 ? NOTHING : { quads, sounds };

export const heard = (sounds: readonly RoomSound[]): Happening =>
  shown(NO_QUADS, sounds);

/**
 * `cue` if it sounds at the instant staged: it starts `after` seconds into
 * the act and is `long` seconds of sound.
 */
export function sounding(
  { sinceEpoch, age }: Staging,
  cue: RoomCue,
  source: Vec3,
  loudness: number,
  [after, long]: readonly [number, number],
): RoomSound[] {
  return age >= after && age < after + long
    ? [{ cue, source, loudness, sinceEpoch: sinceEpoch + after }]
    : [];
}
