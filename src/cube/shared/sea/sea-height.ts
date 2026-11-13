import { smoothstep } from '../lib/ease';
import type { Vec2 } from '../lib/vec';
import { islandHeight, waterLevel } from '../outside';
import { HOUR_SECONDS, RADIANS_A_TURN } from '../outside/swell';
import { amplitudesOf, bin, CASCADES, CHOP, TILE } from './cascade';
import { SWELL_DIES_OVER, TRAIN_ENDS } from './sea-shore-numbers';
import { SEAS } from './sea-state';

/**
 * The sea's height where a body floats, in TypeScript: the slow surface and
 * the tallest of the very waves the first two cascades hold, summed one by
 * one where the shader reads them from its maps. The finer cascades stand
 * under a centimetre and are left out.
 */

/** The cascades whose waves are tall enough to lift a body. */
const CARRYING = [0, 1] as const;
/** The share of each cascade's variance its summed waves keep. */
const KEPT = 0.98;

/** One wave of a cascade, as the sum reads it. */
type Wave = {
  kx: number;
  kz: number;
  /** The two parts of its complex height, metres. */
  re: number;
  im: number;
  /** Whole turns an hour. */
  turns: number;
};

/** The tallest waves of cascade `index`, enough to hold `KEPT` of its variance. */
function tallest(index: number): Wave[] {
  const side = CASCADES[index]?.tileSide ?? 1;
  const { waves, turns } = amplitudesOf(SEAS, index);
  const step = RADIANS_A_TURN / side;
  const all: Array<Wave & { power: number }> = [];
  for (let j = 0; j < TILE; j += 1) {
    for (let i = 0; i < TILE; i += 1) {
      const at = j * TILE + i;
      const re = waves[at * 4] ?? 0;
      const im = waves[at * 4 + 1] ?? 0;
      const power = re * re + im * im;
      if (power > 0) {
        all.push({
          kx: bin(i) * step,
          kz: bin(j) * step,
          re,
          im,
          turns: turns[at] ?? 0,
          power,
        });
      }
    }
  }
  all.sort((a, b) => b.power - a.power);
  const whole = all.reduce((sum, { power }) => sum + power, 0);
  let held = 0;
  const count = all.findIndex(({ power }) => {
    held += power;
    return held >= KEPT * whole;
  });
  return all.slice(0, count + 1);
}

let carried: Array<{ waves: Wave[]; offset: number }> | undefined;

/** Each carrying cascade's waves, and the half texel its map is read off by. */
const cascades = (): Array<{ waves: Wave[]; offset: number }> =>
  (carried ??= CARRYING.map((index) => ({
    waves: tallest(index),
    offset: (CASCADES[index]?.tileSide ?? 0) / (2 * TILE),
  })));

/** How much of each carrying cascade the place `xz` lets through. */
function calm(xz: Vec2): readonly [number, number] {
  const off = smoothstep(TRAIN_ENDS[0], TRAIN_ENDS[1], Math.hypot(...xz));
  if (off >= 1) return [1, 1];
  return [off, smoothstep(...SWELL_DIES_OVER, -islandHeight(xz))];
}

/** The slow surface under the wind's waves: `waterLevel`, eased out offshore. */
function level(xz: Vec2, seconds: number): number {
  const off = smoothstep(TRAIN_ENDS[0], TRAIN_ENDS[1], Math.hypot(...xz));
  return off >= 1 ? 0 : (1 - off) * waterLevel(xz, seconds);
}

/**
 * Where the wind's waves carry the still surface's point `still` at
 * `seconds`: metres east, up and south of it.
 */
function shiftAt(still: Vec2, seconds: number): [number, number, number] {
  const share = calm(still);
  const shift: [number, number, number] = [0, 0, 0];
  for (const [index, { waves, offset }] of cascades().entries()) {
    const quiet = share[index] ?? 0;
    if (quiet === 0) continue;
    const x = still[0] - offset;
    const z = still[1] - offset;
    for (const { kx, kz, re, im, turns } of waves) {
      const phase =
        kx * x +
        kz * z -
        RADIANS_A_TURN * (((turns * seconds) / HOUR_SECONDS) % 1);
      const cos = Math.cos(phase);
      const sin = Math.sin(phase);
      const sideways =
        (2 * quiet * CHOP * (re * sin + im * cos)) / Math.hypot(kx, kz);
      shift[0] += sideways * kx;
      shift[1] += 2 * quiet * (re * cos - im * sin);
      shift[2] += sideways * kz;
    }
  }
  return shift;
}

/**
 * The sea's surface over `xz` in the world frame, `seconds` into the hour:
 * metres over the still sea, the swell, its surf and the wind's waves
 * together, to within the centimetre the finest waves stand.
 */
export function seaHeightAt(xz: Vec2, seconds: number): number {
  // The waves carry a point sideways as well as up: find the still point
  // that is carried over `xz`.
  let still: Vec2 = xz;
  let shift = shiftAt(still, seconds);
  for (let round = 0; round < 2; round += 1) {
    still = [xz[0] - shift[0], xz[1] - shift[2]];
    shift = shiftAt(still, seconds);
  }
  return level(still, seconds) + shift[1];
}
