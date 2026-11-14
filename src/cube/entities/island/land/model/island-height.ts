import type { Vec2 } from '@/cube/shared/lib/vec';
import { f32, wgsl } from '@/cube/shared/shader';

import { ISLAND_EASE } from './island-ease.shader.generated';
import {
  ISLAND,
  ISLAND_HEIGHT_NUMBERS,
  ISLAND_ROLLED,
} from './island-height-numbers';

/**
 * The island's walked-on shape: metres over still sea level at a point of the
 * world's ground plane, continuing under water as the sea bed. Everything that
 * stands on the island reads this one function, in TypeScript or in WGSL, so
 * the two bodies below say the same thing line for line and the numbers in
 * them come from the one table.
 */

const DUNES = Object.values(ISLAND_ROLLED.dunes).map((dune) => {
  const { reach, bearing, height, along, across } = dune;
  const cos = Math.cos(bearing);
  const sin = Math.sin(bearing);
  return {
    x: reach * cos * (cos < 0 ? ISLAND.west : ISLAND.east),
    z: reach * sin * (sin < 0 ? ISLAND.north : ISLAND.south),
    height,
    along,
    across,
  };
});

const sq = (value: number): number => value * value;

/** `k`-wide smooth `max(a, 0)`. */
const softPlus = (a: number, k: number): number =>
  k * (Math.max(a / k, 0) + Math.log(1 + Math.exp(-Math.abs(a / k))));

const softMin = (a: number, b: number, k: number): number =>
  a - softPlus(a - b, k);

const softMax = (a: number, b: number, k: number): number =>
  a + softPlus(b - a, k);

const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * A smooth step from 0 to 1 about `v` = 0. The argument is clamped because a
 * GPU's `tanh` of a large number is infinity over infinity, and the bed is
 * asked for as far out as the horizon.
 */
const eased = (v: number): number =>
  0.5 + 0.5 * Math.tanh(Math.min(Math.max(v, -20), 20));

/** Everything but the crest's own dune, which is sized from what this leaves. */
function bareHeight(x: number, z: number): number {
  const east = eased(x / ISLAND.turn);
  const south = eased(z / ISLAND.turn);
  const a = mix(ISLAND.west, ISLAND.east, east);
  const b = mix(ISLAND.north, ISLAND.south, south);
  const theta = Math.atan2(z, x);
  const wobble =
    1 +
    ISLAND.lobes * Math.cos(3 * theta + ISLAND_ROLLED.lobes) +
    ISLAND.bays * Math.cos(5 * theta + ISLAND_ROLLED.bays) +
    ISLAND.cusps * Math.cos(ISLAND.cuspCount * theta + ISLAND_ROLLED.cusps);
  const q = (sq(x / a) + sq(z / b)) * wobble;
  const d = (ISLAND.reach * (1 - q)) / (1 + Math.sqrt(q + 0.05));
  const [gentleX, gentleZ] = ISLAND.gentleAt;
  const m =
    ISLAND.slope *
    (1 -
      ISLAND.gentle *
        Math.exp(-(sq(x - gentleX) + sq(z - gentleZ)) / sq(ISLAND.gentleOver)));
  const face = softMax(
    softMin(m * d, ISLAND.berm, 0.12),
    -ISLAND.terrace,
    0.25,
  );
  const lip = ISLAND.lip * Math.exp(-sq((m * d - ISLAND.berm) / 0.2));
  const inland = ISLAND.inland * eased((d - 10) / 3);
  const off = softPlus(-d - 10, 6) / ISLAND.deepOver;
  const deep = (-ISLAND.deep * off * off) / (1 + off * off);
  let h = face + lip + inland + deep;
  for (const dune of DUNES) {
    h +=
      dune.height *
      Math.exp(
        -(sq((x - dune.x) / dune.along) + sq((z - dune.z) / dune.across)),
      );
  }
  return h;
}

/** What the crest's own dune adds at its top, so the crest is `ISLAND.crest`. */
const CREST_DUNE = ISLAND.crest - bareHeight(0, 0);

/**
 * Metres over still sea level at `xz` of the world's ground plane, negative
 * under water. Smooth everywhere: ripples and grain are the sand's shader's,
 * on top of this.
 */
export const islandHeight = ([x, z]: Vec2): number =>
  bareHeight(x, z) +
  CREST_DUNE * Math.exp(-(sq(x) + sq(z)) / sq(ISLAND.crestOver));

const duneLine = ({
  x,
  z,
  height,
  along,
  across,
}: (typeof DUNES)[number]): string =>
  `  h += ${f32(height)} * exp(-(sq((x - ${f32(x)}) / ${f32(along)}) + sq((z - ${f32(z)}) / ${f32(across)})));`;

/**
 * `islandHeight(xz: vec2f) -> f32`, the twin of the function above: scalar
 * arithmetic only, each line the twin of `bareHeight`'s, its dunes written out
 * from the rolled table.
 */
export const ISLAND_HEIGHT = wgsl(
  'outside/island-height',
  /* wgsl */ `
/// Metres over still sea level at \`xz\` of the world's ground plane, negative
/// under water.
fn islandHeight(xz: vec2f) -> f32 {
  let x = xz.x;
  let z = xz.y;
  let east = eased(x / ISLAND_TURN);
  let south = eased(z / ISLAND_TURN);
  let a = mix(ISLAND_WEST, ISLAND_EAST, east);
  let b = mix(ISLAND_NORTH, ISLAND_SOUTH, south);
  let theta = atan2(z, x);
  let wobble = 1.0
    + ISLAND_LOBES * cos(3.0 * theta + ISLAND_LOBES_START)
    + ISLAND_BAYS * cos(5.0 * theta + ISLAND_BAYS_START)
    + ISLAND_CUSPS * cos(ISLAND_CUSP_COUNT * theta + ISLAND_CUSPS_START);
  let q = (sq(x / a) + sq(z / b)) * wobble;
  let d = ISLAND_REACH * (1.0 - q) / (1.0 + sqrt(q + 0.05));
  let m = ISLAND_SLOPE * (1.0 - ISLAND_GENTLE
    * exp(-(sq(x - ISLAND_GENTLE_X) + sq(z - ISLAND_GENTLE_Z)) / sq(ISLAND_GENTLE_OVER)));
  let face = softMax(softMin(m * d, ISLAND_BERM, 0.12), -ISLAND_TERRACE, 0.25);
  let lip = ISLAND_LIP * exp(-sq((m * d - ISLAND_BERM) / 0.2));
  let inland = ISLAND_INLAND * eased((d - 10.0) / 3.0);
  let off = softPlus(-d - 10.0, 6.0) / ISLAND_DEEP_OVER;
  let deep = -ISLAND_DEEP * off * off / (1.0 + off * off);
  var h = face + lip + inland + deep;
${DUNES.map((dune) => duneLine(dune)).join('\n')}
  h += ${f32(CREST_DUNE)} * exp(-(sq(x) + sq(z)) / sq(ISLAND_CREST_OVER));
  return h;
}
`,
  ISLAND_EASE,
  ISLAND_HEIGHT_NUMBERS,
);
