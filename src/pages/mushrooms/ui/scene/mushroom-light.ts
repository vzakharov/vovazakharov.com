/**
 * Where the light falls on a mushroom's cap: its shade, its rim light and
 * its shine, each on the side the light gives it. In the cap's frame (units
 * of size, y up) unless said otherwise.
 */

import { type Circle, type Point, sample } from '../../model/geometry';
import type { Light } from '../../model/light';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { CURVE_STEPS, domeArc, footWidth } from '../../model/mushroom-outline';
import { awayAngle, litSide, shadowFall } from './ink';
import { PALETTE } from './palette';

/** The dome's arc from `from` past its crown to the rim, on `side`. */
function sideArc(
  genes: MushroomGenes,
  side: -1 | 1,
  from: number,
  to = Math.PI / 2,
): Point[] {
  return domeArc(genes, genes.capWidth / 2, [from, to]).map(({ x, y }) => ({
    x: x * side,
    y,
  }));
}

/** The dome's arc on the side turned from the light: where the shade lies. */
export function capShadeArc(genes: MushroomGenes, toward: Point): Point[] {
  return sideArc(genes, litSide(toward) === 1 ? -1 : 1, 0.3);
}

/** The dome's arc on the light's side, from near its crown to the rim: where the rim light lies. */
export function capRimArc(genes: MushroomGenes, toward: Point): Point[] {
  return sideArc(genes, litSide(toward), 0.12, Math.PI / 2 - 0.08);
}

/** The shine's middle on the cap, over toward the light. */
export function capShine(
  { capWidth, capHeight }: MushroomGenes,
  toward: Point,
): Point {
  return { x: toward.x * 0.2 * capWidth, y: capHeight * 0.72 };
}

/** One layer of the light on a cap, in the cap's frame. */
export type CapLight =
  | { kind: 'shade' | 'rim'; arc: Point[] }
  | { kind: 'shine'; centre: Point; radii: readonly [number, number] }
  | { kind: 'spot'; spot: Circle };

/**
 * The cap's light in the order it is painted, first to last. The shade, the
 * rim light and the shine are light on the cap's own skin, so every spot goes
 * on after them and stays its own white wherever they reach.
 */
export function capLight(genes: MushroomGenes, toward: Point): CapLight[] {
  return [
    { kind: 'shade', arc: capShadeArc(genes, toward) },
    { kind: 'rim', arc: capRimArc(genes, toward) },
    {
      kind: 'shine',
      centre: capShine(genes, toward),
      radii: [genes.capWidth * 0.1, genes.capHeight * 0.11],
    },
    ...genes.spots.map((spot) => ({ kind: 'spot' as const, spot })),
  ];
}

/**
 * The half of a circle round `centre` turned from the light, in the canvas's
 * frame (y down, as `toward` is): a spot's shade, an eye's.
 */
export function shadedHalf(centre: Point, r: number, toward: Point): Point[] {
  const away = awayAngle(toward);
  return sample(
    away - Math.PI / 2,
    away + Math.PI / 2,
    CURVE_STEPS,
    (angle) => ({
      x: centre.x + r * Math.cos(angle),
      y: centre.y + r * Math.sin(angle),
    }),
  );
}

/**
 * One of the stem's layers of light: its colour, its alpha, how deep into the
 * stem it reaches from its edge, in the stem's widths, and which edge.
 */
export type StemLayer = readonly [
  colour: number,
  alpha: number,
  depth: number,
  side: 'sun' | 'shade',
];

/** `count` layers of `colour` on `side`, each at `alpha`, from `deepest` in to `shallowest`. */
function layers(
  colour: number,
  side: StemLayer[3],
  count: number,
  alpha: number,
  [deepest, shallowest]: readonly [number, number],
): StemLayer[] {
  return Array.from({ length: count }, (_, index) => [
    colour,
    alpha,
    deepest + ((shallowest - deepest) * index) / (count - 1),
    side,
  ]);
}

/**
 * The stem's light, as the cap's: a cool shade on the side turned from the
 * sun and a warm light on the side toward it, each stacked in thin layers
 * from the deepest in, so it deepens toward the edge with no band of its
 * own; and a pale line just inside the lit edge. It stays light enough that
 * the stem still reads as pale.
 */
export const STEM_LIGHT: readonly StemLayer[] = [
  ...layers(PALETTE.shadeCool, 'shade', 12, 0.024, [0.6, 0.08]),
  ...layers(PALETTE.stemLit, 'sun', 8, 0.08, [0.34, 0.06]),
  [PALETTE.rimLight, 0.6, 0.04, 'sun'],
];

/** A cast shadow's soft outer shade, its core and its contact at the foot: each one's size, as a share of the shadow's, and alpha. */
const SHADOW_LAYERS = [
  { across: 1.3, tall: 1.3, alpha: 0.12, falls: true },
  { across: 0.8, tall: 0.8, alpha: 0.2, falls: true },
  { across: 0.25, tall: 0.6, alpha: 0.3, falls: false },
] as const;

/** One ellipse of a cast shadow, round `x` along the ground from the foot: its full width and height, and alpha. */
export type ShadowLayer = {
  x: number;
  across: number;
  tall: number;
  alpha: number;
};

/**
 * The shadow a thing standing at the origin casts on the ground, `across` by
 * `tall`: fallen away from the sun, soft at its edge, and darkest at the
 * foot, where its contact is centred under it — at least `contact` across by
 * tall, for a foot wider than the contact's own share.
 */
export function castShadow(
  [across, tall]: readonly [number, number],
  { toward }: Light,
  contact: readonly [number, number] = [0, 0],
): ShadowLayer[] {
  const fall = shadowFall(toward, across);
  return SHADOW_LAYERS.map(({ falls, alpha, ...share }) =>
    falls
      ? {
          x: fall,
          across: across * share.across,
          tall: tall * share.tall,
          alpha,
        }
      : {
          x: 0,
          across: Math.max(contact[0], across * share.across),
          tall: Math.max(contact[1], tall * share.tall),
          alpha,
        },
  );
}

/** A mushroom's shadow's contact under its foot, across and tall, in the foot's width as it stands. */
const CONTACT = [1.3, 0.32] as const;

/**
 * A mushroom's shadow, in pixels round its foot: fallen away from the sun,
 * its contact centred under the whole foot as it stands turned `turn`.
 */
export function mushroomShadow(
  genes: MushroomGenes,
  size: number,
  light: Light,
  turn = 0,
): ShadowLayer[] {
  const foot = footWidth(genes, turn) * size;
  return castShadow([genes.capWidth * size * 0.8, size * 0.07], light, [
    foot * CONTACT[0],
    foot * CONTACT[1],
  ]);
}
