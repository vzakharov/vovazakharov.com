import { float, mix, smoothstep } from 'three/tsl';

import { BAND_HEIGHTS, LAND_PALETTE } from '../lib/land-colour';
import {
  type Band,
  COUNTRY,
  FIELD,
  GRAIN,
  HAND,
  HILL,
  paint,
  PATCH,
  REGION,
  SLOPE,
  STEP,
} from './land-mix';

/** How far from the eye trees stand as objects, metres: past it forest is its canopy alone. */
const TREES_TO = 3000;

/**
 * The green lowland, a temperate meadow: sward in growth and gone to seed in
 * tracts of every size, rushes dark in its damp hollows, bare earth on banks
 * too steep to hold turf.
 */
export function lowlandOf({ ground: { steep }, mix: m }: Band) {
  const dryness = m.patches(-0.5, 0.6, [
    [COUNTRY, 0.4],
    [REGION, 0.5],
    [HILL, 0.5],
    [FIELD, 0.45],
    [SLOPE, 0.3],
  ]);
  const hollow = m.patches(0.25, 0.6, [
    [FIELD, 0.5],
    [SLOPE, 0.5],
    [PATCH, 0.25],
  ]);
  const sward = mix(
    mix(paint(LAND_PALETTE.meadow), paint(LAND_PALETTE.hay), dryness.mul(0.55)),
    paint(LAND_PALETTE.rush),
    hollow.mul(0.6),
  ).mul(
    m.mottled([
      [PATCH, 0.08],
      [STEP, 0.09],
      [HAND, 0.09],
      [GRAIN, 0.05],
    ]),
  );
  const bank = smoothstep(0.07, 0.16, steep.add(m.at(PATCH).value.mul(0.02)));
  return mix(
    sward,
    paint(LAND_PALETTE.earth).mul(
      m.mottled([
        [STEP, 0.1],
        [HAND, 0.12],
      ]),
    ),
    bank,
  );
}

/**
 * Forest, where the tile's cover says trees stand: `cover` with its edge
 * between two vertices broken by noise, and `colour`, its canopy from afar and
 * the ground under the trees near the eye.
 */
export function woodedOf({
  ground: { cover: forest, away },
  mix: m,
  banded,
  border,
  detailed,
}: Band) {
  const fringe = m.ragged([
    [HILL, 0.3],
    [FIELD, 0.3],
    [SLOPE, 0.2],
    [PATCH, 0.12],
  ]);
  // The noise moves the edge only where the cover is partial, so no canopy
  // shows where no tree stands.
  const cover = smoothstep(
    float(0.36).sub(fringe.lost.mul(0.4)),
    float(0.64).add(fringe.lost.mul(0.4)),
    forest.add(fringe.sum.mul(forest).mul(forest.oneMinus()).mul(4)),
  );
  const floor = mix(
    paint(LAND_PALETTE.litter),
    paint(LAND_PALETTE.moss),
    m.patches(-0.1, 0.5, [
      [SLOPE, 0.4],
      [PATCH, 0.5],
      [STEP, 0.4],
    ]),
  ).mul(
    m.mottled([
      [STEP, 0.14],
      [HAND, 0.14],
      [GRAIN, 0.08],
    ]),
  );
  const canopy = mix(
    paint(LAND_PALETTE.broadleaf),
    paint(LAND_PALETTE.conifer),
    smoothstep(250, BAND_HEIGHTS.upland[1], banded.add(border.sum)),
  ).mul(
    m.mottled([
      [HILL, 0.07],
      [FIELD, 0.12],
      [SLOPE, 0.15],
      [PATCH, 0.28],
      [STEP, 0.1],
    ]),
  );
  return {
    cover,
    colour: detailed
      ? mix(floor, canopy, smoothstep(TREES_TO * 0.5, TREES_TO, away))
      : canopy,
  };
}
