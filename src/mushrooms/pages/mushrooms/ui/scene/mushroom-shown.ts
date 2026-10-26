import type * as Phaser from 'phaser';

import { pick } from '@/kernel/shared/lib/collections';

import type { Point, Tall } from '@/mushrooms/shared/lib/geometry';
import type { Light } from '@/mushrooms/shared/lib/light';
import {
  type Lit,
  phaseOf,
  type Sprouted,
  type Tapped,
  UNLIT,
} from '@/mushrooms/shared/lib/motion';
import type { Lighting, PaintedSide } from '@/mushrooms/shared/ui';
import type { Footed } from '@/mushrooms/shared/world';
import {
  type Chorded,
  CURVE_STEPS,
  curveSteps,
  drawMushroom,
  drawMushroomShadow,
  mushroomGenes,
  type MushroomLights,
  type Spotted,
} from '@/mushrooms/entities/mushroom';
import type { Planted, Sprouting } from '@/mushrooms/features/meadow';

import { UNPLACED } from './bed-place';
import type { LaidAhead } from './clump-layout';
import type { WithGraphics } from './hit-areas';
import type { Body, HouseView } from './house-view';
import type { AreaHit, Selected } from './mushroom-selection';

/** What a shown mushroom keeps of its mushroom as planted. */
const SHOWN_OF = ['foot', 'lean', 'sprout'] as const satisfies ReadonlyArray<
  keyof ShownOf
>;
type ShownOf = Footed & Sprouting;

type HouseShadowed = {
  /** Apart from `graphics`, so it stays on the ground as the mushroom moves. */
  shadow: Phaser.GameObjects.Graphics;
  /** Its windows and door, which follow it. */
  house: HouseView;
};

/** `spots`: those its house left painted (`paintedSpots`) when it was last drawn. */
export type Shown = Tapped &
  Sprouted &
  Lit &
  Body &
  Spotted &
  ShownOf &
  Selected &
  HouseShadowed &
  // How far its tap area reaches above its foot, in world px at the opening eye.
  Tall & {
    /** When it was removed, and starts sinking; `Infinity` while it stands. */
    goneAt: number;
    /** Where the bed lays its foot out to paint it (`laidOf`), in world px. */
    laid: Point;
    /** The light it is painted in from an eye facing `heading` (`mushroomLights`). */
    lightsAt: (heading: number) => MushroomLights<Lighting>;
    /** Its shadow's light as the opening eye sees it, which `headedLight` turns by the heading. */
    sunFrom: Light;
  } & LaidAhead &
  // The chords to a curve it was last painted with.
  Chorded &
  // Its shadow's sun side when last painted.
  PaintedSide;

/**
 * `mushroom` as shown before the bed first places it, planted at `plantedAt`
 * in seconds — a sprout at the moment it came up, whenever it is shown — in the
 * objects the bed made for it: unshaped, unplaced and painted in `lighting`
 * alone until `place` shapes and lights it.
 */
export function unplacedShown(
  mushroom: Planted,
  plantedAt: number,
  lighting: Lighting,
  objects: WithGraphics & HouseShadowed & AreaHit,
): Shown {
  const { sprout } = mushroom;
  return {
    ...objects,
    ...pick(mushroom, ...SHOWN_OF),
    laid: { x: 0, y: 0 },
    opening: 0,
    tall: 0,
    stands: UNPLACED,
    genes: mushroomGenes(mushroom),
    turn: 0,
    door: undefined,
    spots: [],
    size: 0,
    haze: 0,
    dusk: 0,
    lighting,
    lightsAt: () => ({ body: lighting, ground: lighting }),
    sunFrom: lighting,
    paintedSunSide: lighting.toward.x,
    steps: CURVE_STEPS,
    phase: phaseOf(mushroom),
    tappedAt: -Infinity,
    ...UNLIT,
    // The sprout's clock is the insects' ms, the bed's its seconds.
    plantedAt: sprout ? sprout.at / 1000 : plantedAt,
    goneAt: Infinity,
  };
}

/** The chords to a curve `shown` asks for at the size the view now draws it. */
export function stepsHere({ size, stands }: Shown): number {
  return curveSteps(size * stands.zoom);
}

/**
 * Paints `shown`'s body, its house and its shadow at its haze and dusk, in
 * its light from an eye facing `heading` and with as many chords to a curve
 * as its size on screen asks (`stepsHere`), and keeps the light, sun side
 * and chords it painted.
 */
export function paintLit(shown: Shown, heading: number): void {
  const { graphics, shadow, genes, spots, size, haze, dusk, turn, house } =
    shown;
  const { body, ground } = shown.lightsAt(heading);
  const steps = stepsHere(shown);
  Object.assign(shown, {
    lighting: body,
    paintedSunSide: ground.toward.x,
    steps,
  });
  graphics.clear();
  const options = { haze, dusk, turn, steps };
  drawMushroom(graphics, { ...genes, spots }, size, body, options);
  house.repaint();
  shadow.clear();
  drawMushroomShadow(shadow, genes, size, ground, turn);
}
