import type { Seeded } from '@/kernel/shared/typings';

import { among, type Dice, diceOf, type Some } from './chance';

/**
 * What the sound starts as: a throat's pulses; breath alone; a buzzer's
 * pulses; or no source at all, three pure tones riding the resonances.
 */
export const SOURCES = ['throat', 'whisper', 'buzz', 'whistle'] as const;

export type Source = (typeof SOURCES)[number];

/**
 * Who is heard: the visitor, who makes sounds and says no words; the
 * building, over its speakers; someone unseen, somewhere in it.
 */
export const SPEAKERS = ['visitor', 'building', 'somewhere'] as const;

export type Speaker = (typeof SPEAKERS)[number];

/** How a voice sounds, whoever's it is and wherever it comes out. */
type Timbre = {
  source: Source;
  /** The pitch it speaks around, in hertz. */
  hertz: number;
  /** The throat's size as a scale on every resonance: 1 is a grown man's. */
  tract: number;
  /** How fast it speaks: 1 is unhurried, less is slower. */
  tempo: number;
  /** How much air leaks through the voice, 0 to 1. */
  airy: number;
  /** How far the pitch follows the line's tune, 0 to 1: 0 is a monotone. */
  lilt: number;
  /** How unsteady the pitch and loudness are, 0 to 1: 1 is a living throat. */
  unsteady: number;
};

export type Voice = Timbre &
  Seeded & {
    /** Whether it comes out of a loudspeaker: a narrow band, an echo after it. */
    piped: boolean;
  };

/** The deepest floor on which the voices are human. */
export const HUMAN_TO = 49;

/** The floor by which the visitor is as tired as they get. */
const TIRED_BY = 40;

const INHUMAN: Some<Source> = ['buzz', 'whistle', 'whisper', 'whistle'];

const span = (lo: number, hi: number, draw: number) => lo + (hi - lo) * draw;

/** A voice that was never a throat, rolled for its floor. */
const inhuman = (dice: Dice): Timbre => ({
  source: among(INHUMAN, dice('source')),
  hertz: span(45, 420, dice('pitch') ** 2),
  tract: span(0.6, 1.7, dice('tract')),
  tempo: span(0.6, 1.2, dice('pace')),
  airy: span(0, 0.6, dice('breath')),
  lilt: span(0, 0.4, dice('lilt')),
  unsteady: 0,
});

/** The same breathy throat all the way down, lower and slower as it tires. */
const visitor = (n: number): Timbre => {
  const tired = Math.min(1, (n - 1) / (TIRED_BY - 1));
  return {
    source: 'throat',
    hertz: span(124, 108, tired),
    tract: 1,
    tempo: span(1, 0.82, tired),
    airy: span(0.55, 0.8, tired),
    lilt: 1,
    unsteady: 1,
  };
};

/** An announcer read by a machine: steady, a little too even. */
const building = (dice: Dice): Timbre => {
  const high = dice('pitch');
  return {
    source: 'throat',
    hertz: span(105, 190, high),
    tract: span(0.97, 1.14, high),
    tempo: span(0.86, 0.98, dice('pace')),
    airy: 0.1,
    lilt: span(0.45, 0.8, dice('lilt')),
    unsteady: 0.3,
  };
};

/** Below this floor nobody elsewhere in the building whispers. */
const WHISPERS_FROM = 24;

const someone = (n: number, dice: Dice): Timbre => {
  const high = dice('pitch');
  return {
    source: n >= WHISPERS_FROM && dice('whisper') < 0.25 ? 'whisper' : 'throat',
    hertz: span(88, 255, high),
    tract: span(0.92, 1.22, high),
    tempo: span(0.78, 1.05, dice('pace')),
    airy: span(0.1, 0.5, dice('breath')),
    lilt: span(0.5, 1, dice('lilt')),
    unsteady: 1,
  };
};

/** Seeds apart from any floor's number, so the voices of a floor differ. */
const APART = 1000;

/**
 * Who is heard on floor `n`: the visitor, one throat all the way down and
 * wearier with every floor; the building's announcer, a different one per
 * floor, out of a loudspeaker; or a different someone somewhere on each.
 * Past `HUMAN_TO` none of them is a throat any more.
 */
export function voiceOf(who: Speaker, n: number): Voice {
  const seed = n + APART * SPEAKERS.indexOf(who);
  const dice = diceOf(seed);
  const voices = {
    visitor: () => visitor(n),
    building: () => building(dice),
    somewhere: () => someone(n, dice),
  };
  return {
    ...(n > HUMAN_TO ? inhuman(dice) : voices[who]()),
    piped: who === 'building',
    seed,
  };
}
