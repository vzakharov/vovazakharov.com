import {
  abs,
  asin,
  float,
  If,
  max,
  min,
  mix,
  select,
  smoothstep,
  vec2,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { CELL_WAVES, MESO_WAVES, STREET_WAVES } from '../lib/clouds';
import { edgeOf, type F, noise, toldFrom, type V } from './cloud-noise';
import type { Regime } from './cloud-regimes';

/** Each cumulus scale's share of the cells' noise, coarsest first. */
const CELL_WEIGHTS = [0.5, 0.27, 0.14, 0.08, 0.05] as const;
/** The share of its layer's depth under a cloud's top in which it thins out. */
const TOP_FALL = 0.3;
/** How far from a meso cell's edge an open ring's cloud and a deck's vein reach, as `edgeOf` measures it. */
const RING_WIDE = 0.22;
const VEIN_WIDE = 0.13;
/** The share of a field its rings and its veins cover: what an eye too far to tell them sees instead. */
const RINGS_COVER = 0.45;
const VEINS_COVER = 0.3;
/** The noises that bend a meso cell's edges: each one's waves to a cell, and how far it pushes, in cells. */
const CELL_WARPS = [
  [1.7, 0.3],
  [4.3, 0.12],
] as const;
/** How far from its edge a closed cell comes to its full thickness, and what that adds to the amount. */
const CELL_HEART = 0.45;
const HEART_WEIGHT = 0.5;
/** What a ring adds to the amount and a vein takes from it. */
const EDGE_WEIGHT = 0.8;
const VEIN_WEIGHT = 0.5;
/** What the cumulus scales add to a far field's amount, per unit of their weight: the cover they would have drawn. */
const FAR_LIFT = 0.4;
/** The signal over which a place is whole cloud. */
const WHOLE = 0.4;
/** Metres over its base in which a cloud comes to its full thickness: the flat base. */
const BASE_RISE = 150;
/** How much slower than the cumulus the meso cells grow. */
const MESO_PACE = 0.04;

type Meso = Node<'vec2'>;

export type CloudCover = {
  /** The meso field over `spot`: its lumps' noise, -1 to 1, and how far the place is from its cell's edge. */
  readonly meso: (spot: V) => Meso;
  /** Cumulus scale `index` over `spot`, coarsest first, as an eye `away` metres off tells it. */
  readonly octave: (spot: V, index: number, away: F) => F;
  /**
   * What the cells make of `regime` over `spot`: over zero, cloud. `meso` is
   * the meso field there and `cells` the sum of the cumulus scales.
   */
  readonly signal: (
    spot: V,
    regime: Regime,
    meso: Meso,
    cells: F,
    away: F,
  ) => F;
};

/** A place's cover, 0 to 1, from its signal. */
export const coverOf = (signal: F): F => smoothstep(0, WHOLE, signal);

/** The most the cells can add to `regime`'s amount: under its negative, the sky is clear whatever they do. */
export const mostLift = ({ rings, veins, lumps, fine, streets }: Regime): F =>
  rings
    .mul(EDGE_WEIGHT)
    .add(veins.mul(HEART_WEIGHT))
    .add(lumps.mul(0.9))
    .add(fine.mul(0.9))
    .add(streets);

/** How much cloud a place with `signal` is part of in `regime`'s layer, 0 a wisp to 1 a deep mass. */
export const bodyOf = (signal: F, { base, ceil }: Regime): F =>
  smoothstep(0.1, 1.1, signal).mul(
    mix(0.7, 1, smoothstep(500, 5000, ceil.sub(base))),
  );

/** How high a cloud under `cover` stands in `regime`'s layer, 0 its base to 1 its ceiling. */
export const topOf = (cover: F, { flat }: Regime): F =>
  mix(cover.mul(0.65).add(0.35), 1, flat);

/** How far up `regime`'s layer `over` metres over the sea is, 0 to 1. */
export const levelOf = (over: F, { base, ceil }: Regime): F =>
  over.sub(base).div(ceil.sub(base)).clamp(0, 1);

/** The integral of a ramp from 0 at 0 to 1 at 1, flat either side, up to `x`. */
const rampTo = (x: F): F => {
  const within = x.clamp(0, 1);
  return within
    .mul(within)
    .mul(0.5)
    .add(max(x.sub(1), 0));
};

/** The mean of that ramp between `a` and `b`. */
const rampOver = (a: F, b: F): F => {
  const span = b.sub(a);
  return select(
    abs(span).lessThan(1e-3),
    a.add(b).mul(0.5).clamp(0, 1),
    rampTo(b).sub(rampTo(a)).div(span),
  );
};

/**
 * A cloud's mean thickness between `low` and `high` metres over the sea under
 * `cover`, in a layer from `regime`'s base to its ceiling: flat below, and
 * heaped as high as the cover is whole unless the regime's tops are flat. The
 * mean is exact however long the stretch, so a march's few samples draw the
 * base and the top where they are.
 */
export const thickness = (cover: F, low: F, high: F, regime: Regime): F => {
  const { base, ceil, dense } = regime;
  const top = topOf(cover, regime);
  const risen = (over: F): F => over.sub(base).div(BASE_RISE);
  const under = (over: F): F =>
    top.sub(over.sub(base).div(ceil.sub(base))).div(TOP_FALL);
  return cover
    .mul(cover)
    .mul(dense)
    .mul(
      max(
        rampOver(risen(low), risen(high))
          .add(rampOver(under(low), under(high)))
          .sub(1),
        0,
      ),
    );
};

/** The cells of the cloud field, growing on `growth`: waves of the cumulus noise. */
export function cloudCover(growth: F): CloudCover {
  const grown = vec3(0, growth, 0);

  /** `at` pushed about by two scales of noise, so the cells cut at it have no ruled edges. */
  const warped = (at: V): V => {
    let moved = at;
    for (const [waves, reach] of CELL_WARPS) {
      const about = at.mul(waves);
      const push = noise(about).toVar();
      moved = moved.add(
        vec3(push, noise(about.yzx.add(5.2)), push.negate()).mul(reach),
      );
    }
    return moved;
  };

  const meso = (spot: V): Meso => {
    const [wide, narrow] = MESO_WAVES;
    const slow = grown.mul(MESO_PACE);
    return vec2(
      noise(spot.mul(wide).add(slow)),
      edgeOf(warped(spot.zxy.mul(narrow).sub(slow))),
    );
  };

  const octave = (spot: V, index: number, away: F): F => {
    const waves = CELL_WAVES[index] ?? 1;
    // Each octave on its own axes, so the lattices never line up.
    const turnedOnce = index % 2 === 0 ? spot : spot.zxy;
    return noise(turnedOnce.mul(waves).add(grown))
      .mul(toldFrom(waves, away))
      .mul(CELL_WEIGHTS[index] ?? 0);
  };

  const signal = (
    spot: V,
    regime: Regime,
    mesoThere: Meso,
    cells: F,
    away: F,
  ): F => {
    const { amount, lumps, veins, rings, fine, streets, bend } = regime;
    const told = toldFrom(MESO_WAVES[0], away);
    const edge = mesoThere.y;
    const ring = min(edge.div(RING_WIDE), 1).oneMinus();
    const vein = min(edge.div(VEIN_WIDE), 1).oneMinus();
    const sum = amount
      .add(rings.mul(mix(RINGS_COVER, ring, told)).mul(EDGE_WEIGHT))
      .sub(veins.mul(mix(VEINS_COVER, vein, told)).mul(VEIN_WEIGHT))
      // A closed cell is thickest at its middle.
      .add(
        veins
          .mul(min(edge.div(CELL_HEART), 1))
          .mul(told)
          .mul(HEART_WEIGHT),
      )
      .add(lumps.mul(mesoThere.x).mul(told))
      .add(fine.mul(cells))
      .add(
        fine.mul(toldFrom(CELL_WAVES[0] ?? 1, away).oneMinus()).mul(FAR_LIFT),
      )
      .toVar();
    If(streets.greaterThan(0.02), () => {
      const [across = 1, along = 1] = STREET_WAVES;
      const lines = noise(
        vec3(
          spot.x.mul(along),
          asin(spot.y.clamp(-1, 1)).add(bend).mul(across),
          spot.z.mul(along),
        ).add(grown.mul(MESO_PACE)),
      );
      const ridge = abs(lines).mul(2.5).min(1).oneMinus();
      sum.addAssign(
        streets.mul(mix(float(0.35), ridge, toldFrom(across, away))),
      );
    });
    return sum;
  };

  return { meso, octave, signal };
}
