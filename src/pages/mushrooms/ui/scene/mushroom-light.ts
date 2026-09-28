/**
 * Where the light falls on a mushroom and on a flower: each one lit from the
 * sun as seen from where it stands, its cap's shade, rim light and shine on
 * the side that gives it, as strong as the light is sideways. In the cap's
 * frame (units of size, y up) unless said otherwise.
 */

import { mouthEdges } from '../../model/chanterelle-outline';
import { type FlowerGenes, flowerHead } from '../../model/flower-genes';
import {
  type Circle,
  placedAt,
  type Point,
  sample,
  type Scaled,
} from '../../model/geometry';
import { type Light, turnedLight } from '../../model/light';
import type {
  ChanterelleGenes,
  MushroomGenes,
} from '../../model/mushroom-genes';
import { domeArc, footWidth, toCanvas } from '../../model/mushroom-outline';
import { capFrame, type Splayed } from '../../model/mushroom-pose';
import { capSurface, CURVE_STEPS } from '../../model/mushroom-profile';
import { awayAngle, litSide, shadowFall } from './ink';
import { PALETTE } from './palette';

/** How sideways a light, as its across share, gives a full side shade: about 37° off straight above. */
const FULL_SIDE = 0.6;

/** `light` as a thing at `at` on screen has it: pointing from there at the sun. */
function lightAt<Lit extends Light>(light: Lit, at: Point, sun: Point): Lit {
  const [dx, dy] = [sun.x - at.x, sun.y - at.y];
  const length = Math.hypot(dx, dy) || 1;
  return { ...light, toward: { x: dx / length, y: dy / length } };
}

/**
 * How much of a full side shade `toward` gives: none with the light straight
 * above, all of it from `FULL_SIDE` across and past it.
 */
export function sideways({ x }: Point): number {
  return Math.min(1, Math.abs(x) / FULL_SIDE);
}

/**
 * The light a mushroom standing at `foot`, `size` its unit, is painted in:
 * its body's from its cap's middle toward the sun, in the frame its turn
 * paints it in (`turnedLight`), and its shadow's, on the ground at its foot.
 */
export function mushroomLights<Lit extends Light>(
  light: Lit,
  { genes, turn }: Splayed,
  foot: Point & Scaled,
  sun: Point,
): Record<'body' | 'ground', Lit> {
  const middle = capFrame(genes)({ x: 0, y: genes.capHeight / 2 });
  const at = placedAt(foot, turn, toCanvas(foot.size)(middle));
  return {
    body: turnedLight(lightAt(light, at, sun), turn),
    ground: lightAt(light, foot, sun),
  };
}

/** The light a flower standing at `foot`, `size` tall, is painted in: from its head toward the sun. */
export function flowerLight<Lit extends Light>(
  light: Lit,
  genes: FlowerGenes,
  foot: Point & Scaled,
  sun: Point,
): Lit {
  const head = flowerHead(genes, foot.size);
  return lightAt(light, { x: foot.x + head.x, y: foot.y + head.y }, sun);
}

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

/**
 * One layer of the light on a cap, in the cap's frame. A dip's shade and
 * light lie inside a chanterelle's mouth, where a concave wall turns the
 * other way from a dome's: the wall on the sun's side faces from it.
 */
export type CapLight =
  | {
      kind: 'shade' | 'rim' | 'dip-shade' | 'dip-light';
      arc: Point[];
      strength: number;
    }
  | { kind: 'shine'; centre: Point; radii: readonly [number, number] }
  | { kind: 'spot'; spot: Circle };

/**
 * The cap's light in the order it is painted, first to last. The shade, the
 * rim light and the shine are light on the cap's own skin, so every spot goes
 * on after them and stays its own white wherever they reach. The shade and
 * the rim light are `strength` of their full alpha (`sideways`).
 */
export function capLight(genes: MushroomGenes, toward: Point): CapLight[] {
  if (genes.species === 'chanterelle') return lipLight(genes, toward);
  const strength = sideways(toward);
  return [
    { kind: 'shade', arc: capShadeArc(genes, toward), strength },
    { kind: 'rim', arc: capRimArc(genes, toward), strength },
    {
      kind: 'shine',
      centre: capShine(genes, toward),
      radii: [genes.capWidth * 0.1, genes.capHeight * 0.11],
    },
    ...genes.spots.map((spot) => ({ kind: 'spot' as const, spot })),
  ];
}

/** The top of a chanterelle's lip from `from` to `to` of its half-width across, sampled evenly. */
function lipArc(
  genes: ChanterelleGenes,
  [from, to]: readonly [number, number],
): Point[] {
  const half = genes.capWidth / 2;
  return sample(from * half, to * half, CURVE_STEPS, (x) => ({
    x,
    y: capSurface(genes, x),
  }));
}

/** How much of a dip's shade stays with the sun straight above, the hollow shading itself. */
const DIP_LEAST = 0.5;

/** The part of a mouth's `edge` from `from` to `to` of its half-width across, in order along it. */
function mouthArc(
  edge: readonly Point[],
  [from, to]: readonly [number, number],
): Point[] {
  const inner = Math.max(...edge.map(({ x }) => Math.abs(x)));
  const [low, high] = [Math.min(from, to), Math.max(from, to)];
  return edge.filter(({ x }) => x / inner >= low && x / inner <= high);
}

/**
 * A chanterelle's lip in the light: its outer shoulders shaded and lit as a
 * dome's rims are, and inside its mouth the other way round — the far wall
 * shaded on the sun's side and lit on the other, the shine on it, and the
 * near rim's shadow along the mouth's near edge.
 */
function lipLight(genes: ChanterelleGenes, toward: Point): CapLight[] {
  const strength = sideways(toward);
  const sun = litSide(toward);
  const arc = (from: number, to: number) =>
    lipArc(genes, [from * sun, to * sun]);
  const { far, near } = mouthEdges(genes);
  const wall = (from: number, to: number) =>
    mouthArc(far, [from * sun, to * sun]);
  const { x, y } = wall(-0.3, -0.5)[0] ?? { x: 0, y: capSurface(genes, 0) };
  return [
    { kind: 'shade', arc: arc(-0.52, -0.98), strength },
    { kind: 'rim', arc: arc(0.56, 0.97), strength },
    {
      kind: 'dip-shade',
      arc: wall(-0.05, 1),
      strength: DIP_LEAST + (1 - DIP_LEAST) * strength,
    },
    { kind: 'dip-light', arc: wall(-0.1, -0.95), strength },
    { kind: 'dip-shade', arc: near, strength: 1 },
    {
      kind: 'shine',
      centre: { x, y: y - genes.lip * 0.22 },
      radii: [genes.capWidth * 0.07, genes.lip * 0.13],
    },
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
 * The stem's light, as the cap's, its warm side in `lit`: a cool shade on
 * the side turned from the sun and a warm light on the side toward it, each
 * stacked in thin layers from the deepest in, so it deepens toward the edge
 * with no band of its own; and a pale line just inside the lit edge. It
 * stays light enough that the stem still reads as pale.
 */
export function stemLight(lit: number): StemLayer[] {
  return [
    ...layers(PALETTE.shadeCool, 'shade', 12, 0.024, [0.6, 0.08]),
    ...layers(lit, 'sun', 8, 0.08, [0.34, 0.06]),
    [PALETTE.rimLight, 0.6, 0.04, 'sun'],
  ];
}

/** A pale stem's light, its warm side in `stemLit`. */
export const STEM_LIGHT: readonly StemLayer[] = stemLight(PALETTE.stemLit);

/** A cast shadow's soft outer shade, its core and its contact at the foot: each one's size, as a share of the shadow's, and alpha. */
const SHADOW_LAYERS = [
  { across: 1.3, tall: 1.3, alpha: 0.12, falls: true },
  { across: 0.8, tall: 0.8, alpha: 0.2, falls: true },
  { across: 0.25, tall: 0.6, alpha: 0.3, falls: false },
] as const;

/** One ellipse of a cast shadow, round `x` along the ground from the foot: its full width and height, and alpha. */
export type ShadowLayer = Pick<Point, 'x'> & {
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
 * The extra darkness where a broad foot presses the ground, round the whole
 * foot, so a stout mushroom sits heavy: across and tall per unit of foot
 * width, and alpha, under a foot at least `wide` of its cap across, stood
 * upright — which a porcini's barrel reaches, and a slimmer species' foot all
 * but never.
 */
const HEAVY_FOOT = { wide: 0.37, across: 1.25, tall: 0.3, alpha: 0.4 } as const;

/** Whether `genes`' foot is broad enough against its cap to press the ground heavily. */
function heavyFoot(genes: MushroomGenes): boolean {
  return footWidth(genes) / genes.capWidth >= HEAVY_FOOT.wide;
}

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
  const cast = castShadow([genes.capWidth * size * 0.8, size * 0.07], light, [
    foot * CONTACT[0],
    foot * CONTACT[1],
  ]);
  const { across, tall, alpha } = HEAVY_FOOT;
  return heavyFoot(genes)
    ? [...cast, { x: 0, across: foot * across, tall: foot * tall, alpha }]
    : cast;
}
