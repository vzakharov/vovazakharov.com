import { decodeUniform, encodeUniform } from './decode';
import { DOME_PARAMS, type DomeParam } from './layout';

/**
 * The dome: an elliptic cone `1 − |(u/a, v/b)|`, its apex `centre` off the
 * square's middle and its axes `a`, `b` turned by `turn`, all in units of the
 * square's side and radians.
 */
export type Dome = Record<DomeParam, number>;

/** Each parameter's range, decoded uniform from its word. */
export const DOME_RANGES: Readonly<
  Record<DomeParam, readonly [number, number]>
> = {
  centreX: [-0.04, 0.04],
  centreY: [-0.04, 0.04],
  radiusA: [0.16, 0.26],
  radiusB: [0.16, 0.26],
  turn: [0, Math.PI],
};

/** The dome words 0–4 of `words` stand for. */
export function domeOf(words: ArrayLike<number>): Dome {
  const read = (param: DomeParam) => {
    const [lo, hi] = DOME_RANGES[param];
    const word = words[DOME_PARAMS.indexOf(param)] ?? Number.NaN;
    return decodeUniform(word, lo, hi);
  };
  return {
    centreX: read('centreX'),
    centreY: read('centreY'),
    radiusA: read('radiusA'),
    radiusB: read('radiusB'),
    turn: read('turn'),
  };
}

/** The five words `domeOf` reads nearest `dome`, in layout order. */
export const domeWords = (dome: Dome): number[] =>
  DOME_PARAMS.map((param) => {
    const [lo, hi] = DOME_RANGES[param];
    return encodeUniform(dome[param], lo, hi);
  });

/** The dome's height at `(px, py)`, square units, the square's middle at ½. */
export function domeAt(dome: Dome, px: number, py: number): number {
  const dx = px - 0.5 - dome.centreX;
  const dy = py - 0.5 - dome.centreY;
  const cos = Math.cos(dome.turn);
  const sin = Math.sin(dome.turn);
  const u = dx * cos + dy * sin;
  const v = -dx * sin + dy * cos;
  return 1 - Math.hypot(u / dome.radiusA, v / dome.radiusB);
}
