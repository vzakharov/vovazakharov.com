/**
 * The grass tufts as the child plants on them: where they grow, which one a
 * tap lands on, and where on the ground a flower planted there stands. The
 * bare tufts are exactly the spots a flower can be planted now — each takes a
 * flower (`takesFlower`), is bare to a finger (`bareToTap`) and stays apart
 * from every other's reach — spread over the whole world, never denser than
 * `TUFTS_PER_1000PX`. They are tended afresh whenever the
 * mushrooms or the flowers change, and on every paint, a tuft still fit
 * staying where it stands. Only a tap nothing else takes reaches the grass
 * (`MeadowScene.tapMeadow`).
 */

import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { flowerGenes } from '../../model/flower-genes';
import { sameFoot } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import type { Camera, FlowerFoot, Rooted } from '../../model/ground';
import { between, type Random } from '../../model/random';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import {
  FLOWER_DOWN,
  FLOWER_SIZE,
  FLOWER_SWAY,
  groundOf,
  headClear,
  standingOn,
} from './flower-layout';
import { standingFlowers } from './flower-plots';
import { roomIn, sightingOf, type Stand } from './flower-sight';
import {
  paintSprouts,
  paintTufts,
  type Refusal,
  seamGrass,
  type Tuft,
  tuftOn,
} from './grass';
import type { MeadowLayout } from './layout';
import { type MushroomTarget, tappedMushroom, tapTarget } from './mushroom-tap';

/**
 * How many tufts the meadow grows at the most, per 1000 CSS px of its world
 * across: the tablet's opening screen shows about seven, a handful to pick
 * from rather than a lawn of targets.
 */
const TUFTS_PER_1000PX = 6;
/** How many spots are tried for each tuft a screen could grow. */
const TUFT_TRIES = 12;
/** How many spots across and down the flowers' band are tried when no tried spot grew a tuft. */
const GRID = [60, 30] as const;

/**
 * The least size a tuft the child plants on is drawn at, in CSS px on every
 * screen: its middle blade twice that tall, a finger's target, where the
 * seam's grass keeps to its depth's share.
 */
export const TUFT_LEAST = 12;

/**
 * How far round its middle a tuft answers a tap at the least, in CSS px: a
 * small finger's pad.
 */
export const TUFT_REACH = 22;
/** How far round its middle a tuft drawn larger than that answers, in units of its size: its blades. */
const TUFT_BLADES = 1.4;
/**
 * How far round a tuft's middle a finger lands bare, nothing but the tuft
 * taking it, as a share of its reach: where a tap is aimed at it.
 */
const BARE_CORE = 0.25;
/** How many points round the core a bare tuft is read at, beside its middle. */
const CORE_RING = 8;

/** A tuft the child can plant on, and the foot on the ground a flower planted there stands on. */
export type Sprout = Rooted & { tuft: Tuft };

/** Where a tuft's blades stand thickest: halfway up the middle blade. */
function middleOf({ x, y, size }: Tuft): Point {
  return { x, y: y - size };
}

/** How far round its middle `tuft` answers a tap. */
export function tuftReach({ size }: Tuft): number {
  return Math.max(TUFT_REACH, size * TUFT_BLADES);
}

/** The sprout of `sprouts` a tap at `point` lands on: the nearest whose reach holds it. */
export function tuftAt(
  sprouts: readonly Sprout[],
  point: Point,
): Sprout | undefined {
  let nearest: Sprout | undefined;
  let least = Infinity;
  for (const sprout of sprouts) {
    const middle = middleOf(sprout.tuft);
    const away = Math.hypot(middle.x - point.x, middle.y - point.y);
    if (away <= tuftReach(sprout.tuft) && away < least) {
      nearest = sprout;
      least = away;
    }
  }
  return nearest;
}

/**
 * The foot on the ground a flower planted on `tuft` stands on, as `camera`
 * shows the tuft: at its root, in a seeded flower's size.
 */
function tuftFoot(camera: Camera, { x, y }: Tuft): FlowerFoot {
  return { ...groundOf(camera, { x, y, size: 0 }), size: FLOWER_SIZE };
}

/** A tuft the child plants on, rooted at `x`, `y`: at least `TUFT_LEAST`. */
function sproutTuft(
  layout: MeadowLayout,
  x: number,
  y: number,
  random: Random,
): Tuft {
  const tuft = tuftOn(layout, x, y, random);
  return { ...tuft, size: Math.max(TUFT_LEAST, tuft.size) };
}

/**
 * Whether a finger aimed at a tuft rooted in `stand` lands on the grass, as
 * the scene hit-tests it wherever the crop stands: no flower's petals as far
 * as its sway takes them — past them a flower yields to a bare tuft
 * (`tuftUnder`) — and no mushroom's tap area or
 * finger pad (`tappedMushroom`) holds the tuft's middle, nor any point of the
 * core round it (`BARE_CORE`). The controls stand on the screen, not the
 * world, so none is tested: a tuft a pan slides under one is the control's to
 * tap there, and the grass's again one pan on. What `stand` holds is read
 * once, for every tuft asked after.
 */
export function bareToTap(stand: Stand): (tuft: Tuft) => boolean {
  const { layout, flowers, planted, mushrooms } = stand;
  const heads: Circle[] = standingFlowers(
    layout,
    flowers,
    planted,
    mushrooms,
  ).map((flower) => {
    const { head } = sightingOf(flower, layout);
    const swayed = flower.place.size * Math.sin(FLOWER_SWAY);
    return { ...head, r: head.r + swayed };
  });
  const targets: MushroomTarget[] = mushrooms.flatMap((mushroom) => {
    const place = placeIn(layout.mushrooms, mushroom);
    if (!place) return [];
    const { genes, turn } = standingAt(place, mushroom);
    return [tapTarget(genes, place.size, place, turn)];
  });
  return (tuft) => {
    const middle = middleOf(tuft);
    const core = BARE_CORE * tuftReach(tuft);
    const clear = heads.every(
      ({ x, y, r }) => Math.hypot(x - middle.x, y - middle.y) > r + core,
    );
    if (!clear) return false;
    const ring = Array.from({ length: CORE_RING }, (_, step) => {
      const angle = (step * Math.PI * 2) / CORE_RING;
      return {
        x: middle.x + core * Math.cos(angle),
        y: middle.y + core * Math.sin(angle),
      };
    });
    return [middle, ...ring].every(
      (point) => tappedMushroom(point, targets) === undefined,
    );
  };
}

/**
 * Whether the child can plant on a tuft of `stand`, whatever else grows
 * there: it takes a flower (`roomIn`) whose head, however it grows,
 * meets no standing flower's on any screen (`headClear`), and it is bare
 * to a finger (`bareToTap`). What `stand` holds is read once, for every
 * tuft asked after.
 */
export function plantableIn(stand: Stand): (sprout: Sprout) => boolean {
  const room = roomIn(stand);
  const bare = bareToTap(stand);
  const standing = standingFlowers(
    stand.layout,
    stand.flowers,
    stand.planted,
    stand.mushrooms,
  ).map((flower) => ({ ...pick(flower, 'foot'), genes: flowerGenes(flower) }));
  return ({ foot, tuft }) =>
    room(foot) && headClear(foot, standing) && bare(tuft);
}

/** How many bare tufts a meadow seen through `camera` grows at the most (`TUFTS_PER_1000PX`). */
export function mostTufts({ world }: Camera): number {
  return Math.round((world / 1000) * TUFTS_PER_1000PX);
}

/** Whether the reach of `tuft` stays off the reach of every tuft of `others`. */
function reachApart(tuft: Tuft, others: readonly Sprout[]): boolean {
  const middle = middleOf(tuft);
  return others.every(({ tuft: other }) => {
    const at = middleOf(other);
    return (
      Math.hypot(at.x - middle.x, at.y - middle.y) >=
      tuftReach(tuft) + tuftReach(other)
    );
  });
}

/**
 * The bare tufts of `stand`: every tuft of `kept` still fit to plant on,
 * where it stands, as many as `TUFTS_PER_1000PX` allows over the world, the
 * first kept first; then new ones from `random` up to that many. A tuft is
 * fit where the child can plant on it (`plantableIn`) and its reach stays off
 * every other's. New tufts are tried at spots in the flowers' band across the
 * world, bunched toward the back, where the ground recedes, and where none of
 * those grows one, across the whole band.
 */
export function tendTufts(
  stand: Stand,
  kept: readonly Sprout[],
  random: Random,
): Sprout[] {
  const { layout } = stand;
  const { camera } = layout;
  const { world, groundTop, ground } = camera;
  const most = mostTufts(camera);
  const plantable = plantableIn(stand);
  const sprouts: Sprout[] = [];
  const fits = (sprout: Sprout) =>
    plantable(sprout) && reachApart(sprout.tuft, sprouts);
  for (const sprout of kept) {
    if (sprouts.length < most && fits(sprout)) sprouts.push(sprout);
  }
  const [near, far] = FLOWER_DOWN;
  const tryAt = (x: number, down: number) => {
    const tuft = sproutTuft(layout, x, groundTop + ground * down, random);
    const sprout = { tuft, foot: tuftFoot(camera, tuft) };
    if (fits(sprout)) sprouts.push(sprout);
  };
  for (
    let tries = most * TUFT_TRIES;
    tries > 0 && sprouts.length < most;
    tries--
  ) {
    tryAt(between(random, 0, world), near + (far - near) * random() ** 1.4);
  }
  if (most === 0 || sprouts.length > 0) return sprouts;
  const [across, down] = GRID;
  const spots = Array.from({ length: across * down }, (_, index) => ({
    x: (((index % across) + 0.5) / across) * world,
    down: near + ((far - near) * (Math.floor(index / across) + 0.5)) / down,
  }));
  spots.some(({ x, down: at }) => {
    tryAt(x, at);
    return sprouts.length > 0;
  });
  return sprouts;
}

/** The bare tufts `stand` grows from `random` on a meadow with none yet (`tendTufts`). */
export function growTufts(stand: Stand, random: Random): Sprout[] {
  return tendTufts(stand, [], random);
}

/** `sprouts` as `layout` shows their feet: each on the same foot, where it now stands. */
function relaid(
  sprouts: readonly Sprout[],
  layout: MeadowLayout,
  random: Random,
): Sprout[] {
  return sprouts.map(({ foot }) => {
    const { x, y } = standingOn(layout.camera, foot);
    return { foot, tuft: sproutTuft(layout, x, y, random) };
  });
}

/** Each scene's grass, for the flowers' hit tests to yield to (`tuftUnder`). */
const grassOf = new WeakMap<Phaser.Scene, Grass>();

/** Whether a finger at `point` on `scene`'s screen is within a bare tuft's reach (`tuftAt`). */
export function tuftUnder(scene: Phaser.Scene, point: Point): boolean {
  return grassOf.get(scene)?.at(point) !== undefined;
}

/**
 * The meadow's grass on screen: the seam's grass and the tufts the child
 * plants on, as `tendTufts` keeps them, bending in the breeze, the tuft the
 * flower picker is open on marked, and the tuft that last refused a flower
 * shaking its head. A flower planted on a tuft stands there alone.
 */
export class Grass {
  private readonly graphics: Phaser.GameObjects.Graphics;
  /** The stream every tuft the child plants on is drawn from, so a replay grows the same. */
  private readonly growing: Random;
  private layout: MeadowLayout | undefined;
  private seam: readonly Tuft[] = [];
  /** The bare tufts, each taking a flower. */
  private tufts: readonly Sprout[] = [];
  private refused: Refusal | undefined;

  constructor(scene: Phaser.Scene, growing: Random) {
    this.graphics = scene.add.graphics();
    this.growing = growing;
    grassOf.set(scene, this);
  }

  /**
   * Grows the seam's grass for `stand` from `random`, the same source
   * regrowing the same, and tends the tufts on its layout, each kept on its
   * foot.
   */
  paint(stand: Stand, random: Random): void {
    this.seam = seamGrass(stand.layout, random);
    if (this.layout !== stand.layout) {
      this.tufts = relaid(this.tufts, stand.layout, this.growing);
      this.layout = stand.layout;
    }
    this.tend(stand);
  }

  /** Tends the tufts to `stand` as it now stands (`tendTufts`). */
  tend(stand: Stand): void {
    this.tufts = tendTufts(stand, this.tufts, this.growing);
  }

  /** Whether a bare tuft stands on `foot`: where the flower picker can stay open. */
  holds(foot: FlowerFoot): boolean {
    return this.tufts.some((sprout) => sameFoot(sprout.foot, foot));
  }

  /** The grass as it bends at `t`, the tuft on `open`, the flower picker's, marked. */
  update(t: number, open: FlowerFoot | undefined): void {
    const { graphics, seam, tufts, refused } = this;
    const marked = open && tufts.find(({ foot }) => sameFoot(foot, open))?.tuft;
    paintTufts(graphics, seam, t);
    paintSprouts(
      graphics,
      tufts.map(({ tuft }) => tuft),
      t,
      {
        refused,
        marked,
      },
    );
  }

  /** The bare tuft a tap at `point` lands on (`tuftAt`). */
  at(point: Point): Sprout | undefined {
    return tuftAt(this.tufts, point);
  }

  /** Shakes `tuft`'s head from `now`, in seconds, as it refuses a flower. */
  refuse(tuft: Tuft, now: number): void {
    this.refused = { tuft, shakenAt: now };
  }
}
