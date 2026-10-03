import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Planted } from '../../model/game';
import type { Point, Tall } from '../../model/geometry';
import type { Light } from '../../model/light';
import {
  type Lit,
  phaseOf,
  type Sprouted,
  type Tapped,
  UNLIT,
} from '../../model/motion';
import { type MushroomGenes, mushroomGenes } from '../../model/mushroom-genes';
import {
  type Chorded,
  CURVE_STEPS,
  curveSteps,
} from '../../model/mushroom-profile';
import type { Footed } from '../../model/placement';
import { UNPLACED } from './bed-place';
import type { Laid } from './clump-layout';
import { drawMushroom, drawMushroomShadow } from './draw-mushroom';
import type { Body, HouseView } from './house-view';
import type { Lighting } from './ink';
import type { MushroomLights } from './mushroom-light';
import type { Selected } from './mushroom-selection';
import type { Siding } from './repaint-queue';

/** `spots`: those its house left painted (`paintedSpots`) when it was last drawn. */
export type Shown = Tapped &
  Sprouted &
  Lit &
  Body &
  Pick<MushroomGenes, 'spots'> &
  Footed &
  Selected &
  // How far its tap area reaches above its foot, in world px at the opening eye.
  Tall & {
    /** Apart from `graphics`, so it stays on the ground as the mushroom moves. */
    shadow: Phaser.GameObjects.Graphics;
    /** Its windows and door, which follow it. */
    house: HouseView;
    /** When it was removed, and starts sinking; `Infinity` while it stands. */
    goneAt: number;
    /** Where the bed lays its foot out to paint it (`laidOf`), in world px. */
    laid: Point;
    /** The light it is painted in from an eye facing `heading` (`mushroomLights`). */
    lightsAt: (heading: number) => MushroomLights<Lighting>;
    /** Its shadow's light as the opening eye sees it, which `headedLight` turns by the heading. */
    sunFrom: Light;
  } & Pick<Laid, 'opening'> &
  // The chords to a curve it was last painted with.
  Chorded &
  // Its shadow's sun side when last painted.
  Pick<Siding, 'paintedSunSide'>;

/**
 * `mushroom` as shown before the bed first places it, planted at `plantedAt`,
 * in the objects the bed made for it: unshaped, unplaced and painted in
 * `lighting` alone until `place` shapes and lights it.
 */
export function unplacedShown(
  mushroom: Planted,
  plantedAt: number,
  lighting: Lighting,
  objects: Pick<Shown, 'graphics' | 'shadow' | 'house' | 'hit'>,
): Shown {
  return {
    ...objects,
    ...pick(mushroom, 'foot', 'lean'),
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
    lighting,
    lightsAt: () => ({ body: lighting, ground: lighting }),
    sunFrom: lighting,
    paintedSunSide: lighting.toward.x,
    steps: CURVE_STEPS,
    phase: phaseOf(mushroom),
    tappedAt: -Infinity,
    ...UNLIT,
    plantedAt,
    goneAt: Infinity,
  };
}

/** The chords to a curve `shown` is painted with as the view now draws it: by its size there, `size` scaled by its `zoom`. */
export function stepsHere({ size, stands }: Shown): number {
  return curveSteps(size * stands.zoom);
}

/**
 * Paints `shown`'s body, its house and its shadow at its haze, in its light
 * from an eye facing `heading` and with as many chords to a curve as its
 * size on screen asks (`stepsHere`), and keeps the light, sun side and
 * chords it painted.
 */
export function paintLit(shown: Shown, heading: number): void {
  const { graphics, shadow, genes, spots, size, haze, turn, house } = shown;
  const { body, ground } = shown.lightsAt(heading);
  const steps = stepsHere(shown);
  Object.assign(shown, {
    lighting: body,
    paintedSunSide: ground.toward.x,
    steps,
  });
  graphics.clear();
  const options = { haze, turn, steps };
  drawMushroom(graphics, { ...genes, spots }, size, body, options);
  house.repaint();
  shadow.clear();
  drawMushroomShadow(shadow, genes, size, ground, turn);
}
