import { clearSky } from '@/cube/shared/cube-boundary';
import type { Rgb } from '@/cube/shared/lib/colour';
import { dot3, type Vec3 } from '@/cube/shared/lib/vec';

import { fitRays, liftOf, solve, turnOf } from './sky-fit';

/**
 * The clear sky at a glance: the logarithm of its whole radiance as a
 * quadratic in the ray's height times a quadratic in the turn from the sun,
 * and one term for the brightening round the sun. It is what a rough mirror
 * or a matte face gathers, which has no use for the detail `fitSky` keeps.
 */
export type SkyGlance = readonly Rgb[];

/** How sharply the glance's brightening round the sun falls off with the angle from it. */
export const GLANCE_SUNWARD = 8;

/**
 * The glance's basis along a ray at a height and a turn, `between` the cosine
 * from it to the sun, in the order `SkyGlance` holds it.
 */
const basisAt = (lift: number, turn: number, between: number): number[] => [
  1,
  lift,
  lift * lift,
  turn,
  turn * lift,
  turn * lift * lift,
  turn * turn,
  turn * turn * lift,
  turn * turn * lift * lift,
  Math.max(between, 0) ** GLANCE_SUNWARD,
];

/** The sky under a sun toward `sun`, per unit of its irradiance, at a glance. */
export function fitGlance(sun: Vec3): SkyGlance {
  const samples = fitRays(sun).map(({ dir, toSun, axes }) => ({
    basis: basisAt(...axes, dot3(dir, toSun)),
    log: clearSky(dir, toSun).map((value) => Math.log(value)),
  }));
  const size = basisAt(0, 0, 0).length;
  const fitted = (channel: 0 | 1 | 2): number[] =>
    solve(
      Array.from({ length: size }, (_, a) =>
        Array.from({ length: size }, (__, b) =>
          samples.reduce(
            (sum, { basis }) => sum + (basis[a] ?? 0) * (basis[b] ?? 0),
            0,
          ),
        ),
      ),
      Array.from({ length: size }, (_, a) =>
        samples.reduce(
          (sum, { basis, log }) => sum + (basis[a] ?? 0) * (log[channel] ?? 0),
          0,
        ),
      ),
    );
  const [r, g, b] = [fitted(0), fitted(1), fitted(2)];
  return r.map((red, n) => [red, g[n] ?? 0, b[n] ?? 0]);
}

/** What `glance` gives along `dir`, a ray at or over the horizon. */
export function glanceAt(glance: SkyGlance, dir: Vec3, sun: Vec3): Rgb {
  const basis = basisAt(liftOf(dir[1]), turnOf(dir, sun), dot3(dir, sun));
  const log = [0, 0, 0];
  for (const [n, colour] of glance.entries()) {
    for (const c of [0, 1, 2] as const) {
      log[c] = (log[c] ?? 0) + colour[c] * (basis[n] ?? 0);
    }
  }
  return [Math.exp(log[0] ?? 0), Math.exp(log[1] ?? 0), Math.exp(log[2] ?? 0)];
}
