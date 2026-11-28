import { noise } from '../ink';

/** How many times a second the tape's noise changes: one draw per video frame. */
export const TAPE_FPS = 30;

/** The video frame `t` falls in. */
export const frameAt = (t: number): number => Math.floor(t * TAPE_FPS);

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Smoothstep over `[0, 1]`, clamped outside it. */
export function smooth(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

/**
 * Where a channel change stands at `progress` in `[0, 1]`: `snow` covering the
 * picture, `roll` as a fraction of its height still to scroll, `colour` it has
 * regained, `light` it has regained, `jitter` its lines' sideways shake. Four
 * frames sampled at their middles read as burst, roll, grey, lock.
 */
export function zapState(progress: number) {
  const p = clamp01(progress);
  return {
    snow: 1 - smooth(p / 0.55),
    roll: (1 - p) ** 2 * 0.9,
    colour: smooth((p - 0.35) / 0.6),
    light: smooth(p / 0.4),
    jitter: (1 - p) ** 1.5,
  };
}

// Where the line and the dot are as thin as the tube draws them.
const LINE = 0.004;
const DOT = 0.006;

/**
 * Where the tube switching off stands at `progress` in `[0, 1]`: the picture's
 * `height` and `width` as fractions of its own, how much of it still shows
 * (`picture`), the white light over what is left (`flash`), and the afterglow
 * around its centre (`glow`).
 */
export function tubeOffState(progress: number) {
  const p = clamp01(progress);
  const collapse = smooth(p / 0.4);
  const shrink = smooth((p - 0.4) / 0.2);
  const fade = 1 - smooth((p - 0.6) / 0.4);
  return {
    height: Math.max(LINE, 1 - collapse),
    width: Math.max(DOT, 1 - shrink),
    picture: 1 - collapse,
    flash: collapse * fade,
    glow: p < 0.35 ? 0 : smooth((p - 0.35) / 0.1) * fade,
  };
}

// The tracking bar gets a chance once in each of these, and crosses the
// picture bottom to top in `BAR_CROSSING` seconds when it takes it.
const BAR_CYCLE = 6;
const BAR_CROSSING = 2.6;
const BAR_SEED = 0x7a_9e;

/**
 * The tracking bar at `t`: `y` its centre in picture units (720 tall), `height`
 * and `strength` in `[0, 1]`, or `null` while the tape tracks clean. The
 * worse the `wear`, the more cycles it shows in, and the harder it tears.
 */
export function trackingBar(t: number, wear: number) {
  const cycle = Math.floor(t / BAR_CYCLE);
  const chance = (noise(BAR_SEED, cycle) + 1) / 2;
  if (chance >= 0.08 + wear * 0.85) return null;
  const start = 0.4 + ((noise(BAR_SEED + 1, cycle) + 1) / 2) * 2.4;
  const phase = (t - cycle * BAR_CYCLE - start) / BAR_CROSSING;
  if (phase < 0 || phase > 1) return null;
  const height = 30 + wear * 50;
  return {
    y: 720 + height - phase * (720 + height * 2),
    height,
    strength: 0.35 + wear * 0.65,
  };
}
