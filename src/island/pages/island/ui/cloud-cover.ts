import {
  abs,
  asin,
  float,
  If,
  min,
  mix,
  smoothstep,
  vec2,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { CELL_WAVES, MESO_WAVES, STREET_WAVES } from '../lib/clouds';
import { type F, noise, toldFrom, type V } from './cloud-noise';
import type { Regime } from './cloud-regimes';

/** Each cumulus scale's share of the cells' noise, coarsest first. */
const CELL_WEIGHTS = [0.55, 0.3, 0.15] as const;
/** How far either side of a meso cell's edge an open ring's cloud and a deck's vein reach, in the noise's own units. */
const RING_WIDE = 0.25;
const VEIN_WIDE = 0.1;
/** The share of a field its rings and its veins cover: what an eye too far to tell them sees instead. */
const RINGS_COVER = 0.45;
const VEINS_COVER = 0.3;
/** How far from its edge a closed cell comes to its full thickness, and what that adds to the amount. */
const CELL_HEART = 0.35;
const HEART_WEIGHT = 0.5;
/** What a ring adds to the amount and a vein takes from it. */
const EDGE_WEIGHT = 0.8;
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
  /** The two noises the meso cells are cut from over `spot`, each -1 to 1. */
  readonly meso: (spot: V) => Meso;
  /** Cumulus scale `index` over `spot`, coarsest first, as an eye `away` metres off tells it. */
  readonly octave: (spot: V, index: number, away: F) => F;
  /**
   * What the cells make of `regime` over `spot`: over zero, cloud. `meso` is
   * the meso noises there and `cells` the sum of the cumulus scales.
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
export const mostLift = ({ rings, lumps, fine, streets }: Regime): F =>
  rings.mul(EDGE_WEIGHT).add(lumps.mul(0.8)).add(fine.mul(0.75)).add(streets);

/** How much cloud a place with `signal` is part of in `regime`'s layer, 0 a wisp to 1 a deep mass. */
export const bodyOf = (signal: F, { base, ceil }: Regime): F =>
  smoothstep(0.05, 0.9, signal).mul(
    mix(0.7, 1, smoothstep(500, 5000, ceil.sub(base))),
  );

/** How high a cloud under `cover` stands in `regime`'s layer, 0 its base to 1 its ceiling. */
export const topOf = (cover: F, { flat }: Regime): F =>
  mix(cover.mul(0.65).add(0.35), 1, flat);

/** How far up `regime`'s layer `over` metres over the sea is, 0 to 1. */
export const levelOf = (over: F, { base, ceil }: Regime): F =>
  over.sub(base).div(ceil.sub(base)).clamp(0, 1);

/**
 * A cloud's thickness `over` metres over the sea under `cover`, in a layer
 * from `regime`'s base to its ceiling: flat below, and heaped as high as the
 * cover is whole unless the regime's tops are flat.
 */
export const thickness = (cover: F, over: F, regime: Regime): F => {
  const top = topOf(cover, regime);
  return cover
    .mul(cover)
    .mul(regime.dense)
    .mul(smoothstep(0, BASE_RISE, over.sub(regime.base)))
    .mul(smoothstep(top.sub(0.3), top, levelOf(over, regime)).oneMinus());
};

/** The cells of the cloud field, growing on `growth`: waves of the cumulus noise. */
export function cloudCover(growth: F): CloudCover {
  const grown = vec3(0, growth, 0);

  const meso = (spot: V): Meso => {
    const [wide, narrow] = MESO_WAVES;
    const slow = grown.mul(MESO_PACE);
    return vec2(
      noise(spot.mul(wide).add(slow)),
      noise(spot.zxy.mul(narrow).sub(slow)),
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
    // Where either noise crosses zero is a cell's edge: two families of contours cut the field into cells.
    const edge = min(abs(mesoThere.x), abs(mesoThere.y));
    const ring = min(edge.div(RING_WIDE), 1).oneMinus();
    const vein = min(edge.div(VEIN_WIDE), 1).oneMinus();
    const sum = amount
      .add(rings.mul(mix(RINGS_COVER, ring, told)).mul(EDGE_WEIGHT))
      .sub(veins.mul(mix(VEINS_COVER, vein, told)).mul(EDGE_WEIGHT))
      // A closed cell is thickest at its middle.
      .add(veins.mul(min(edge.div(CELL_HEART), 1)).mul(told).mul(HEART_WEIGHT))
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
