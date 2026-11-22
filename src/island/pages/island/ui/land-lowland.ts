import { float, mix, smoothstep } from 'three/tsl';

import { LAND_PALETTE, SHORE_TOP } from '../lib/land-colour';
import { TREELINE } from '../model/forest-cover';
import {
  type Band,
  COUNTRY,
  DISTRICT,
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

/** How far from the eye a forest reads as the ground under its trees, and from where as their crowns alone, metres. */
const FLOOR_TO = 120;
const CANOPY_FROM = 600;

/** How much of its leaves' colour a canopy shows from over it, the rest lost in its own shade. */
const CANOPY_SHADE = 0.75;

/** How much light reaches the ground under closed crowns. */
const FLOOR_SHADE = 0.45;

/**
 * How far from the eye the tile's own cover is read, and from where forest is
 * what a place expects alone, metres: a tile's cover changes with its level,
 * so from afar it would draw the tiles.
 */
const COVER_TO = 20_000;
const EXPECTED_FROM = 150_000;

/** The height the forest starts thinning at toward the treeline, metres. */
const THINNING_FROM = 450;

/** The heights between which a forest's conifers go from few to all, metres. */
const CONIFERS = [250, 520] as const;

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
 * Forest: `cover`, the share of the ground under crowns — the tile's own near
 * the eye, its edge between two vertices broken by noise, and from afar what
 * the height and the country's own regions expect — and `colour`, the shaded
 * ground under the trees near the eye and their canopy past it.
 */
export function woodedOf({
  ground: { cover: placed, away, level },
  mix: m,
  detailed,
}: Band) {
  const expected = m
    .patches(-0.3, 0.05, [
      [COUNTRY, 0.3],
      [REGION, 0.5],
      [DISTRICT, 0.4],
    ])
    .mul(smoothstep(SHORE_TOP, SHORE_TOP + 25, level))
    .mul(smoothstep(THINNING_FROM, TREELINE, level).oneMinus());
  const forest = mix(
    placed,
    expected,
    smoothstep(COVER_TO, EXPECTED_FROM, away),
  );
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
    m
      .mottled([
        [PATCH, 0.2],
        [STEP, 0.14],
        [HAND, 0.14],
        [GRAIN, 0.08],
      ])
      .mul(FLOOR_SHADE),
  );
  const canopy = mix(
    paint(LAND_PALETTE.broadleaf),
    paint(LAND_PALETTE.conifer),
    smoothstep(...CONIFERS, level)
      .mul(0.85)
      .add(0.15),
  ).mul(
    m
      .mottled([
        [REGION, 0.08],
        [DISTRICT, 0.1],
        [HILL, 0.12],
        [FIELD, 0.14],
        [SLOPE, 0.15],
        [PATCH, 0.25],
        [STEP, 0.1],
      ])
      .mul(CANOPY_SHADE),
  );
  return {
    cover,
    colour: detailed
      ? mix(floor, canopy, smoothstep(FLOOR_TO, CANOPY_FROM, away))
      : canopy,
  };
}
