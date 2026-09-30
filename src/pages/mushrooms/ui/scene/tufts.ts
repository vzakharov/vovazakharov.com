/**
 * The grass tufts as the child plants on them: where they grow, which one a
 * tap lands on, and where on the ground a flower planted there stands. A
 * tuft grows only where a flower could stand, so the grass is the sign of
 * where planting works: each takes a flower until the meadow is full or
 * something has come to stand on it. Only a tap nothing else takes reaches
 * the grass (`MeadowScene.tapMeadow`), so a tuft answers where no mushroom,
 * flower, insect or button is drawn.
 */

import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import type { Camera, FlowerFoot } from '../../model/ground';
import { isBeeSown } from '../../model/pollen';
import { between, type Random } from '../../model/random';
import {
  FLOWER_DOWN,
  FLOWER_SIZE,
  groundOf,
  headsApart,
  standingOn,
} from './flower-layout';
import { standingFlowers } from './flower-plots';
import { roomIn, type Stand } from './flower-sight';
import {
  paintTufts,
  type Refusal,
  seamGrass,
  type Tuft,
  tuftOn,
} from './grass';

/** How many tufts a screen grows at the most, per 1000 CSS px across. */
const TUFTS_PER_1000PX = 52;
/** How many spots are tried for each tuft a screen could grow. */
const TUFT_TRIES = 8;

/**
 * How far round its middle a tuft answers a tap at the least, in CSS px: a
 * small finger's pad round a tuft drawn smaller than one, and no more, so
 * the bare ground between the tufts stays bare.
 */
export const TUFT_REACH = 22;
/** How far round its middle a tuft drawn larger than that answers, in units of its size: its blades. */
const TUFT_BLADES = 1.4;

/** Where a tuft's blades stand thickest: halfway up the middle blade. */
function middleOf({ x, y, size }: Tuft): Point {
  return { x, y: y - size };
}

/** How far round its middle `tuft` answers a tap. */
export function tuftReach({ size }: Tuft): number {
  return Math.max(TUFT_REACH, size * TUFT_BLADES);
}

/** The tuft of `tufts` a tap at `point` lands on: the nearest whose reach holds it. */
export function tuftAt(tufts: readonly Tuft[], point: Point): Tuft | undefined {
  let nearest: Tuft | undefined;
  let least = Infinity;
  for (const tuft of tufts) {
    const middle = middleOf(tuft);
    const away = Math.hypot(middle.x - point.x, middle.y - point.y);
    if (away <= tuftReach(tuft) && away < least) {
      nearest = tuft;
      least = away;
    }
  }
  return nearest;
}

/**
 * The foot on the ground a flower planted on `tuft` stands on, as `camera`
 * shows the tuft: at its root, in a seeded flower's size.
 */
export function tuftFoot(camera: Camera, { x, y }: Tuft): FlowerFoot {
  return { ...groundOf(camera, { x, y, size: 0 }), size: FLOWER_SIZE };
}

/**
 * The tufts of `stand`, drawn from `random`, so the same source regrows
 * them: one at the root of each flower the child planted, and the rest
 * where a flower could stand and be in sight on this screen (`roomIn`),
 * bunched toward the back, where the ground recedes — each far enough from
 * every other that a flower on one leaves room for a flower on each.
 */
export function growTufts(stand: Stand, random: Random): Tuft[] {
  const { layout, flowers, planted, mushrooms } = stand;
  const { camera, width } = layout;
  const own = new Set(
    planted.flatMap((sown) => (isBeeSown(sown) ? [] : [sown.id])),
  );
  const tufts = standingFlowers(layout, flowers, planted, mushrooms)
    .filter(({ id }) => own.has(id))
    .map(({ foot }) => {
      const { x, y } = standingOn(camera, foot);
      return tuftOn(layout, x, y, random);
    });
  const room = roomIn(stand);
  const taken: FlowerFoot[] = [];
  const most = Math.round((width / 1000) * TUFTS_PER_1000PX);
  const [near, far] = FLOWER_DOWN;
  for (
    let tries = most * TUFT_TRIES;
    tries > 0 && taken.length < most;
    tries--
  ) {
    const x = between(random, 0, width);
    const down = near + (far - near) * random() ** 1.4;
    const tuft = tuftOn(
      layout,
      x,
      camera.groundTop + camera.ground * down,
      random,
    );
    const foot = tuftFoot(camera, tuft);
    if (room(foot) && headsApart(foot, taken)) {
      taken.push(foot);
      tufts.push(tuft);
    }
  }
  return tufts;
}

/**
 * The meadow's grass on screen: the seam's grass and the tufts the child
 * plants on, as the stand grows them, bending in the breeze, the tuft that
 * last refused a flower shaking its head.
 */
export class Grass {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private tufts: readonly Tuft[] = [];
  /** The seam's grass and the tufts, as drawn. */
  private drawn: readonly Tuft[] = [];
  private refused: Refusal | undefined;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /** Grows the grass for `stand` from `random`: the same source regrows the same grass. */
  paint(stand: Stand, random: Random): void {
    const seam = seamGrass(stand.layout, random);
    this.tufts = growTufts(stand, random);
    this.drawn = [...seam, ...this.tufts];
  }

  update(t: number): void {
    paintTufts(this.graphics, this.drawn, t, this.refused);
  }

  /** The tuft a tap at `point` lands on (`tuftAt`). */
  at(point: Point): Tuft | undefined {
    return tuftAt(this.tufts, point);
  }

  /** Shakes `tuft`'s head from `now`, in seconds, as it refuses a flower. */
  refuse(tuft: Tuft, now: number): void {
    this.refused = { tuft, shakenAt: now };
  }
}
