import { CYCLE } from '../../dsp';
import { type Loop, turning } from './loop';

/** Seconds the cube's hum takes to fall an octave: thirty octaves an hour. */
const FALLS_IN = 120;

/** Seconds the hum under the cube takes to rise one. */
const RISES_IN = 60;

/** The lowest pitch a voice of the hum reaches, in hertz, and the octaves over it. */
const DEEPEST = 22;
const OCTAVES = 6;

/** How much quieter a voice is for each octave it stands up the stack. */
const TILT = 0.55;
const TILTS = Array.from(
  { length: OCTAVES },
  (_, voice) => 2 ** (-TILT * voice),
);

/**
 * A stack of voices an octave apart, all sliding one octave over a loop and
 * each fading in at one end of the stack and out at the other, so the loop's
 * end is its beginning with every voice having taken its neighbour's place:
 * a pitch that goes one way for ever and arrives nowhere.
 */
type Stack = {
  /** The stack's pitch against `DEEPEST`. */
  ratio: number;
  /** Hertz between each voice and its twin: how fast the two beat. */
  beat: number;
  level: number;
};

/**
 * One sample of `stack`, `x` of the way through a loop of `seconds`, sliding
 * down, or up where `rising`. The octaves a voice stands over the deepest
 * pitch run from `OCTAVES` to 0; it is loudest low in the stack and silent at
 * both ends.
 */
function slid(
  { ratio, beat, level }: Stack,
  x: number,
  seconds: number,
  rising: boolean,
): number {
  const way = rising ? x : 1 - x;
  // The phase whose rate of change is the pitch: an exponential's integral.
  const wound =
    ((rising ? 1 : -1) * CYCLE * seconds * DEEPEST * ratio * 2 ** way) /
    Math.LN2;
  const tilt = 2 ** (-TILT * way);
  const twin = CYCLE * beat * x * seconds;
  let sum = 0;
  for (let voice = 0; voice < OCTAVES; voice += 1) {
    const loud =
      Math.sin((Math.PI * (voice + way)) / OCTAVES) ** 2 *
      tilt *
      (TILTS[voice] ?? 0);
    const phase = wound * 2 ** voice;
    sum += loud * (Math.sin(phase) + Math.sin(phase + twin));
  }
  return level * sum;
}

/**
 * The cube's hum: two stacks falling for ever, the second set against the
 * first by the golden ratio so that no partial of one sits on a partial of the
 * other and the two never make a chord; every voice beats slowly against its
 * twin. Nothing in it is above a few hundred hertz and nothing in it starts or
 * stops, so it can be stood beside for an hour.
 */
export function hum(rate: number): Loop {
  const stacks: readonly Stack[] = [
    { ratio: 1, beat: 0.25, level: 0.33 },
    { ratio: (1 + Math.sqrt(5)) / 2, beat: 0.35, level: 0.18 },
  ];
  return turning(FALLS_IN, rate, (i, length) => {
    const x = i / length;
    let sum = 0;
    for (const stack of stacks) sum += slid(stack, x, FALLS_IN, false);
    return sum;
  });
}

/** What stands still under the cube: two pitches, half a hertz apart. */
const WEIGHT = [36, 36.5] as const;

/**
 * The hum from underneath: the same stack rising instead, so that with the
 * hum itself the pitch falls and climbs at once, over a weight that throbs
 * every two seconds and is felt more than heard.
 */
export function under(rate: number): Loop {
  const stack: Stack = { ratio: 1.5, beat: 0.2, level: 0.13 };
  return turning(RISES_IN, rate, (i, length) => {
    const x = i / length;
    const t = x * RISES_IN;
    let pressed = 0;
    for (const hz of WEIGHT) pressed += 0.2 * Math.sin(CYCLE * hz * t);
    return slid(stack, x, RISES_IN, true) + pressed;
  });
}
