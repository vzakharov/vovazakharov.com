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
import type {
  Dusked,
  Lighted,
  Lighting,
  WithGraphics,
} from '@/mushrooms/shared/ui';
import {
  type LaidAhead,
  type PaintedSide,
  UNPLACED,
} from '@/mushrooms/shared/world';

import type { DoorPlace, Housed } from '../model/house';
import { mushroomGenes, type Spotted } from '../model/mushroom-genes';
import {
  type Chorded,
  CURVE_STEPS,
  curveSteps,
} from '../model/mushroom-profile';
import type { Footed } from '../model/placement';
import type { Planted, Sprouting } from '../model/planted';
import { drawMushroom, drawMushroomShadow } from './draw-mushroom';
import type { MushroomLights } from './mushroom-light';
import type { HazedGraphics } from './mushroom-paint';
import type { AreaHit, Puffing, Selected } from './mushroom-selection';

/** What a shown mushroom keeps of its mushroom as planted. */
const SHOWN_OF = ['foot', 'lean', 'sprout'] as const satisfies ReadonlyArray<
  keyof ShownOf
>;
type ShownOf = Footed & Sprouting;

/**
 * The mushroom a house stands in, as the bed last stood and moved it, and
 * where on its stem the bed seated its door: `undefined` until a door needs
 * one.
 */
export type Body = HazedGraphics &
  Dusked &
  Lighted &
  Puffing & {
    door: DoorPlace | undefined;
  };

/**
 * A shown mushroom's shadow and its house, `House` being whatever the bed
 * shows its windows and door with.
 */
type HouseShadowed<House> = Housed<House> & {
  /** Apart from `graphics`, so it stays on the ground as the mushroom moves. */
  shadow: Phaser.GameObjects.Graphics;
};

/** A house that repaints when its mushroom is. */
export type Repainting = { repaint: () => void };

/** `spots`: those its house left painted (`paintedSpots`) when it was last drawn. */
export type Shown<House = unknown> = Tapped &
  Sprouted &
  Lit &
  Body &
  Spotted &
  ShownOf &
  Selected &
  HouseShadowed<House> &
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
export function unplacedShown<House>(
  mushroom: Planted,
  plantedAt: number,
  lighting: Lighting,
  objects: WithGraphics & HouseShadowed<House> & AreaHit,
): Shown<House> {
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
export function paintLit(shown: Shown<Repainting>, heading: number): void {
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
