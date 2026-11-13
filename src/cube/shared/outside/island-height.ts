import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import type { Vec2 } from '../lib/vec';
import { f32, wgsl } from '../shader/wgsl';

/**
 * The island's walked-on shape: metres over still sea level at a point of the
 * world's ground plane, continuing under water as the sea bed. Everything that
 * stands on the island reads this one function, in TypeScript or in WGSL, so
 * the two bodies below say the same thing line for line and the numbers in
 * them come from the one table.
 */

/** The world the island's rolls are drawn from: the same island for everyone. */
const ISLAND_WORLD = '0';

/** How many low dunes the interior carries besides the crest's own. */
const DUNE_COUNT = 9;

const TURN = 2 * Math.PI;

const duneRoll = roll.struct({
  /** Where it sits: a fraction of the way from the crest to the shore. */
  reach: roll.uniform(0.18, 0.62),
  bearing: roll.uniform(0, TURN),
  height: roll.uniform(-0.1, 0.3),
  /** Half-widths in metres, along the wind and across it. */
  along: roll.uniform(4, 9),
  across: roll.uniform(2.5, 5),
});

const hash = pathHash(ISLAND_WORLD);

const rolled = rollWith(
  roll.struct({
    /** The phases of the outline's three harmonics. */
    lobes: roll.uniform(0, TURN),
    bays: roll.uniform(0, TURN),
    cusps: roll.uniform(0, TURN),
    dunes: roll.struct(
      Object.fromEntries(
        Array.from({ length: DUNE_COUNT }, (_, index) => [
          `${index}`,
          duneRoll,
        ]),
      ),
    ),
  }),
  (path) => hash(`island/${path}`),
);

/**
 * The shape's numbers, in metres unless a ratio. The crest is the world's
 * ground origin: the cube hangs over `(0, 0)`.
 */
export const ISLAND = {
  /** The shore's distance from the crest to the west, east, north and south. */
  west: 66,
  east: 23,
  north: 28,
  south: 22,
  /** Metres over which one side's reach gives way to the opposite one's. */
  turn: 8,
  /** The outline's harmonics: three lobes, five bays, and the beach cusps. */
  lobes: 0.05,
  bays: 0.03,
  cusps: 0.012,
  cuspCount: 27,
  /** Inland metres per unit of the outline's level, at the shore's sides. */
  reach: 24,
  /** The beach face's rise per metre inland, and how far the south-west eases it. */
  slope: 0.11,
  gentle: 0.6,
  gentleAt: [-28, 24],
  gentleOver: 22,
  /** Where the beach face levels off into the backshore, and the berm's lip on it. */
  berm: 0.9,
  lip: 0.09,
  /** The terrace the face levels off into under water. */
  terrace: 1.3,
  /** The interior's rise behind the backshore. */
  inland: 0.45,
  /** How deep the bed ends up far out, and the metres over which it gets there. */
  deep: 11,
  deepOver: 70,
  /** The crest's height under the cube, and its own dune's half-width. */
  crest: 1.6,
  crestOver: 7,
} as const;

const DUNES = Object.values(rolled.dunes).map((dune) => {
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
    ISLAND.lobes * Math.cos(3 * theta + rolled.lobes) +
    ISLAND.bays * Math.cos(5 * theta + rolled.bays) +
    ISLAND.cusps * Math.cos(ISLAND.cuspCount * theta + rolled.cusps);
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
 * arithmetic only, each line the twin of `bareHeight`'s.
 */
export const ISLAND_HEIGHT = wgsl(
  'outside/island-height',
  /* wgsl */ `
fn sq(v: f32) -> f32 {
  return v * v;
}

/// \`k\`-wide smooth \`max(a, 0)\`.
fn softPlus(a: f32, k: f32) -> f32 {
  return k * (max(a / k, 0.0) + log(1.0 + exp(-abs(a / k))));
}

fn softMin(a: f32, b: f32, k: f32) -> f32 {
  return a - softPlus(a - b, k);
}

fn softMax(a: f32, b: f32, k: f32) -> f32 {
  return a + softPlus(b - a, k);
}

/// A smooth step from 0 to 1 about \`v\` = 0, finite however large \`v\` is.
fn eased(v: f32) -> f32 {
  return 0.5 + 0.5 * tanh(clamp(v, -20.0, 20.0));
}

/// Metres over still sea level at \`xz\` of the world's ground plane, negative
/// under water.
fn islandHeight(xz: vec2f) -> f32 {
  let x = xz.x;
  let z = xz.y;
  let east = eased(x / ${f32(ISLAND.turn)});
  let south = eased(z / ${f32(ISLAND.turn)});
  let a = mix(${f32(ISLAND.west)}, ${f32(ISLAND.east)}, east);
  let b = mix(${f32(ISLAND.north)}, ${f32(ISLAND.south)}, south);
  let theta = atan2(z, x);
  let wobble = 1.0
    + ${f32(ISLAND.lobes)} * cos(3.0 * theta + ${f32(rolled.lobes)})
    + ${f32(ISLAND.bays)} * cos(5.0 * theta + ${f32(rolled.bays)})
    + ${f32(ISLAND.cusps)} * cos(${f32(ISLAND.cuspCount)} * theta + ${f32(rolled.cusps)});
  let q = (sq(x / a) + sq(z / b)) * wobble;
  let d = ${f32(ISLAND.reach)} * (1.0 - q) / (1.0 + sqrt(q + 0.05));
  let m = ${f32(ISLAND.slope)} * (1.0 - ${f32(ISLAND.gentle)}
    * exp(-(sq(x - ${f32(ISLAND.gentleAt[0])}) + sq(z - ${f32(ISLAND.gentleAt[1])})) / sq(${f32(ISLAND.gentleOver)})));
  let face = softMax(softMin(m * d, ${f32(ISLAND.berm)}, 0.12), -${f32(ISLAND.terrace)}, 0.25);
  let lip = ${f32(ISLAND.lip)} * exp(-sq((m * d - ${f32(ISLAND.berm)}) / 0.2));
  let inland = ${f32(ISLAND.inland)} * eased((d - 10.0) / 3.0);
  let off = softPlus(-d - 10.0, 6.0) / ${f32(ISLAND.deepOver)};
  let deep = -${f32(ISLAND.deep)} * off * off / (1.0 + off * off);
  var h = face + lip + inland + deep;
${DUNES.map((dune) => duneLine(dune)).join('\n')}
  h += ${f32(CREST_DUNE)} * exp(-(sq(x) + sq(z)) / sq(${f32(ISLAND.crestOver)}));
  return h;
}
`,
);
