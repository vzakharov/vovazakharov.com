import { among, type Dice, diceOf, type Some } from './chance';

/**
 * What the sound starts as: a throat's pulses; breath alone; a buzzer's
 * pulses; or no source at all, three pure tones riding the resonances.
 */
export const SOURCES = ['throat', 'whisper', 'buzz', 'whistle'] as const;

export type Source = (typeof SOURCES)[number];

export type Voice = {
  source: Source;
  /** The pitch it speaks around, in hertz. */
  pitch: number;
  /** The throat's size as a scale on every resonance: 1 is a grown man's. */
  tract: number;
  /** How fast it speaks: 1 is unhurried, less is slower. */
  pace: number;
  /** How much air leaks through the voice, 0 to 1. */
  breath: number;
  /** How far the pitch follows the line's tune, 0 to 1: 0 is a monotone. */
  lilt: number;
  /** How unsteady the pitch and loudness are, 0 to 1: 1 is a living throat. */
  waver: number;
  /** The word its noise grows from. */
  seed: number;
};

/** The deepest floor on which the voices are human. */
export const HUMAN_TO = 49;

/** The floor by which the visitor is as tired as they get. */
const TIRED_BY = 40;

const INHUMAN: Some<Source> = ['buzz', 'whistle', 'whisper', 'whistle'];

const span = (lo: number, hi: number, draw: number) => lo + (hi - lo) * draw;

/** A voice that was never a throat, rolled for its floor. */
const inhuman = (dice: Dice, seed: number): Voice => ({
  source: among(INHUMAN, dice('source')),
  pitch: span(45, 420, dice('pitch') ** 2),
  tract: span(0.6, 1.7, dice('tract')),
  pace: span(0.6, 1.2, dice('pace')),
  breath: span(0, 0.6, dice('breath')),
  lilt: span(0, 0.4, dice('lilt')),
  waver: 0,
  seed,
});

const visitor = (n: number): Voice => {
  const tired = Math.min(1, (n - 1) / (TIRED_BY - 1));
  return {
    source: 'throat',
    pitch: span(118, 104, tired),
    tract: 1,
    pace: span(1, 0.84, tired),
    breath: span(0.15, 0.45, tired),
    lilt: span(1, 0.55, tired),
    waver: 1,
    seed: n,
  };
};

/** Below this floor nobody elsewhere in the building whispers. */
const WHISPERS_FROM = 24;

const someone = (n: number, dice: Dice, seed: number): Voice => {
  const high = dice('pitch');
  return {
    source: n >= WHISPERS_FROM && dice('whisper') < 0.25 ? 'whisper' : 'throat',
    pitch: span(88, 255, high),
    tract: span(0.92, 1.22, high),
    pace: span(0.78, 1.05, dice('pace')),
    breath: span(0.1, 0.5, dice('breath')),
    lilt: span(0.5, 1, dice('lilt')),
    waver: 1,
    seed,
  };
};

/** Seeds apart from any floor's number, so the two voices of a floor differ. */
const ELSEWHERE = 1000;

/**
 * Who speaks on floor `n`: the visitor, the same throat all the way down and
 * wearier with every floor, or whoever is somewhere else in the building, a
 * different someone per floor. Past `HUMAN_TO` neither is a throat any more.
 */
export function voiceOf(who: 'visitor' | 'somewhere', n: number): Voice {
  const seed = who === 'visitor' ? n : n + ELSEWHERE;
  const dice = diceOf(seed);
  if (n > HUMAN_TO) return inhuman(dice, seed);
  return who === 'visitor' ? visitor(n) : someone(n, dice, seed);
}
