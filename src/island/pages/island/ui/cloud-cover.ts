import {
  abs,
  asin,
  float,
  Fn,
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
import {
  edgeOf,
  type F,
  noise,
  puffs,
  toldFrom,
  turnedTo,
  type V,
} from './cloud-noise';
import type { Regime } from './cloud-regimes';

/** Each cumulus scale's share of the cells' noise, coarsest first. */
const CELL_WEIGHTS = [0.3, 0.3, 0.24, 0.1, 0.06] as const;
/** The signal at which a cloud stands as high as its layer, and how much of a flat regime's tops is one level. */
const TALL = 1;
const FLATTEST = 0.8;
/** The share of its layer's depth under a cloud's top in which it thins out. */
const TOP_FALL = 0.3;
/** How far from a meso cell's edge an open ring's cloud and a deck's vein reach, as `edgeOf` measures it. */
const RING_WIDE = 0.32;
const VEIN_WIDE = 0.13;
/** The share of a field its rings and its veins cover: what an eye too far to tell them sees instead. */
const RINGS_COVER = 0.45;
const VEINS_COVER = 0.3;
/** The noise that bends a meso cell's edges: its waves to a cell, and how far it pushes, in cells. */
const WARP_WAVES = 2.3;
const WARP_REACH = 0.28;
/** The weight under which a regime's lumps, and its rings and veins together, are not read. */
const UNREAD = 0.02;
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
  /** The meso field over `spot`, as far as `regime` reads it: its lumps' noise, -1 to 1, and how far the place is from its cell's edge. */
  readonly meso: (spot: V, regime: Regime) => Meso;
  /** Cumulus scale `index` over `spot`, coarsest first, as an eye `away` metres off tells it. */
  readonly octave: (spot: V, index: number, away: F) => F;
  /**
   * The cumulus scales over `spot` that an eye `away` metres off tells and a
   * march hiding what `hidden` metres would does not: read once for a ray,
   * where it enters the layer, they lie on the cloud like a sheet.
   */
  readonly sheet: (spot: V, away: F, hidden: F) => F;
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

/**
 * How high a cloud with `signal` stands in `regime`'s layer, 0 its base to 1
 * its ceiling: a flat regime's tops still keep a little of the heap, the
 * relief the sun picks out on a deck.
 */
export const topOf = (signal: F, { flat }: Regime): F =>
  mix(
    signal.div(TALL).clamp(0, 1).sqrt().mul(0.7).add(0.3),
    1,
    flat.mul(FLATTEST),
  );

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

/** One end of a stretch of a ray: the signal there, and its height over the sea, metres. */
type End = { readonly signal: F; readonly over: F };

/**
 * A cloud's mean thickness along a stretch of a ray from `near` to `far`, in
 * a layer from `regime`'s base to its ceiling: flat below, and heaped as high
 * as its signal. The top runs straight between the two ends and the mean is
 * exact under that, so a march's few samples draw the base and the top where
 * they are, with no bands and no grain to hide them.
 */
export const thickness = (near: End, far: End, regime: Regime): F => {
  const { base, ceil, dense } = regime;
  const risen = ({ over }: End): F => over.sub(base).div(BASE_RISE);
  const under = ({ signal, over }: End): F =>
    topOf(signal, regime)
      .sub(over.sub(base).div(ceil.sub(base)))
      .div(TOP_FALL);
  const covered = coverOf(near.signal).add(coverOf(far.signal)).mul(0.5);
  return covered
    .mul(covered)
    .mul(dense)
    .mul(
      max(
        rampOver(risen(near), risen(far))
          .add(rampOver(under(near), under(far)))
          .sub(1),
        0,
      ),
    );
};

/** The cells of the cloud field, growing on `growth`: waves of the cumulus noise. */
export function cloudCover(growth: F): CloudCover {
  const grown = vec3(0, growth, 0);

  /** `at` pushed about by noise, so the cells cut at it have no ruled edges. */
  const warped = (at: V): V => {
    const about = at.mul(WARP_WAVES);
    const push = noise(about).toVar();
    return at.add(
      vec3(push, noise(about.yzx.add(5.2)), push.negate()).mul(WARP_REACH),
    );
  };

  const meso = (spot: V, { lumps, veins, rings }: Regime): Meso =>
    Fn(() => {
      const [wide, narrow] = MESO_WAVES;
      const slow = grown.mul(MESO_PACE);
      const lump = float(0).toVar();
      const edge = float(CELL_HEART).toVar();
      If(lumps.greaterThan(UNREAD), () => {
        lump.assign(noise(spot.mul(wide).add(slow)));
      });
      If(veins.add(rings).greaterThan(UNREAD), () => {
        edge.assign(edgeOf(warped(spot.zxy.mul(narrow).sub(slow))));
      });
      return vec2(lump, edge);
    })();

  /** Cumulus scale `index` over `spot`, at its full weight. */
  const wave = (spot: V, index: number): F => {
    // Each scale on its own axes, so no lattice lines up with another's.
    const about = turnedTo(spot, index)
      .mul(CELL_WAVES[index] ?? 1)
      .add(grown);
    // The coarsest scale is the clouds themselves: separate heaps.
    return (index === 0 ? puffs(about) : noise(about)).mul(
      CELL_WEIGHTS[index] ?? 0,
    );
  };

  const octave = (spot: V, index: number, away: F): F =>
    wave(spot, index).mul(toldFrom(CELL_WAVES[index] ?? 1, away));

  const sheet = (spot: V, away: F, hidden: F): F =>
    Fn(() => {
      const at = spot.toVar();
      const sum = float(0).toVar();
      for (const [index, waves] of CELL_WAVES.entries()) {
        const left = toldFrom(waves, away)
          .sub(toldFrom(waves, max(away, hidden)))
          .toVar();
        If(left.greaterThan(0.01), () => {
          sum.addAssign(wave(at, index).mul(left));
        });
      }
      return sum;
    })();

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

  return { meso, octave, sheet, signal };
}
