/**
 * The ground's grass as the child plants on it: where its tufts grow, which
 * one a tap lands on, and where on the ground a flower planted there stands.
 * Every tuft on the ground is a spot to plant on, grown `TUFTS_PER_1000PX`
 * over the whole world and kept on its foot whatever grows round it, and
 * drawn each frame where the view places that foot. Only a tap nothing else
 * takes reaches the grass (`MeadowScene.tapMeadow`); it lands on the nearest
 * tuft drawn bare to a finger (`bareToTap`), which opens the flower picker
 * where a flower fits (`plantableIn`) and shakes its head where none does
 * (`Planter.tapTuft`). A flower planted on a tuft takes its place.
 */

import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { flowerGenes } from '../../model/flower-genes';
import { sameFoot } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import type { Camera, FlowerFoot, Rooted } from '../../model/ground';
import { between, type Random } from '../../model/random';
import { depthOf, UNPLACED } from './bed-place';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import {
  FLOWER_SIZE,
  FLOWER_SWAY,
  groundOf,
  headClear,
  standingOn,
} from './flower-layout';
import { standingFlowers } from './flower-plots';
import { roomIn, sightingOf, type Stand } from './flower-sight';
import {
  BLADE_OVERHANG,
  paintSprouts,
  paintTufts,
  type Refusal,
  seamGrass,
  seamShown,
  type SeamTuft,
  type Tuft,
  tuftColours,
  tuftOn,
  type WithTuft,
} from './grass';
import type { MeadowLayout } from './layout';
import { type MushroomTarget, tappedMushroom, tapTarget } from './mushroom-tap';
import { behindHills, cull, ofGround, onScreen, type View } from './view';

/**
 * How many tufts the ground grows per 1000 CSS px of its world across: a
 * lawn, as dense as the meadow's grass was before its tufts took flowers.
 */
const TUFTS_PER_1000PX = 52;
/**
 * Where down the ground the tufts grow, as shares of its depth, before
 * `BACK_BUNCH` bunches them toward the back, where the ground recedes.
 */
const GROWN_DOWN = [0.1, 0.98] as const;
const BACK_BUNCH = 1.4;

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
export type Sprout = Rooted & WithTuft;

/** Where a tuft's blades stand thickest: halfway up the middle blade. */
function middleOf({ x, y, size }: Tuft): Point {
  return { x, y: y - size };
}

/** How far round its middle `tuft` answers a tap. */
export function tuftReach({ size }: Tuft): number {
  return Math.max(TUFT_REACH, size * TUFT_BLADES);
}

/** The tuft of `sprouts` a tap at `point` lands on: the nearest whose reach holds it. */
export function tuftAt<Tufted extends WithTuft>(
  sprouts: readonly Tufted[],
  point: Point,
): Tufted | undefined {
  let nearest: Tufted | undefined;
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

/** A tuft grown on `layout` from `random`, anywhere across the world. */
function grownTuft(layout: MeadowLayout, random: Random): Sprout {
  const { camera } = layout;
  const { world, groundTop, ground } = camera;
  const x = between(random, 0, world);
  const down = between(random, ...GROWN_DOWN) ** BACK_BUNCH;
  const tuft = tuftOn(layout, x, groundTop + ground * down, random);
  return { tuft, foot: tuftFoot(camera, tuft) };
}

/**
 * Whether a finger aimed at a tuft rooted in `stand` lands on the grass, as
 * the scene hit-tests it seen from the opening eye: no flower's petals as far
 * as its sway takes them — past them a flower yields to a bare tuft
 * (`tuftUnder`) — and no mushroom's drawn parts (`tappedMushroom`) hold the tuft's middle, nor any point of the
 * core round it (`BARE_CORE`). The controls stand on the screen, not the
 * world, so none is tested: a tuft a turn slides under one is the control's
 * to tap there, and the grass's again a turn on. What `stand` holds is read
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
 * Whether a tuft of `stand` stands there, a spot to plant on: it takes a
 * flower (`roomIn`) whose head, however it grows, meets no standing flower's
 * on any screen (`headClear`), and it is bare to a finger (`bareToTap`).
 * What `stand` holds is read once, for every tuft asked after.
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

/** How many tufts the ground of a meadow seen through `camera` grows (`TUFTS_PER_1000PX`). */
export function mostTufts({ world }: Camera): number {
  return Math.round((world / 1000) * TUFTS_PER_1000PX);
}

/**
 * The ground's tufts on `layout`: the first of `kept` as `mostTufts` allows,
 * each on its own foot where `layout` shows it, then new ones from `random`
 * up to that many. Whatever grows on the ground, the grass is the same; which
 * of it stands is `tendTufts`'s.
 */
export function growTufts(
  layout: MeadowLayout,
  kept: readonly Sprout[],
  random: Random,
): Sprout[] {
  const most = mostTufts(layout.camera);
  const tufts = kept.slice(0, most).map(({ foot }) => {
    const { x, y } = standingOn(layout.camera, foot);
    return { foot, tuft: tuftOn(layout, x, y, random) };
  });
  while (tufts.length < most) tufts.push(grownTuft(layout, random));
  return tufts;
}

/**
 * The tufts of `grown` that stand on `stand`, each a spot to plant on
 * (`plantableIn`): a tuft where no flower fits is not there, and comes back
 * once what kept it away goes.
 */
export function tendTufts(stand: Stand, grown: readonly Sprout[]): Sprout[] {
  return grown.filter(plantableIn(stand));
}

/** A tuft of the ground as a frame draws it: the tuft laid out, and where and how big the view draws it. */
export type ShownSprout = WithTuft & { sprout: Sprout };

/** The ground's tufts a frame draws: those over the ground's top row, and those behind the near hills. */
export type ShownGrass = { near: ShownSprout[]; behind: ShownSprout[] };

/**
 * Where `view` draws each of `sprouts`: at its foot, its size scaled by its
 * zoom and its colours toned by the screen row it stands on, as the ground's
 * bands are. A tuft too near the eye (`cull`), or off the screen, is not
 * drawn; one past the ground's top row is drawn behind the near hills.
 */
export function shownSprouts(
  view: View,
  sprouts: readonly Sprout[],
): ShownGrass {
  const shown: ShownGrass = { near: [], behind: [] };
  const depth = view.height - view.groundTop;
  for (const sprout of sprouts) {
    const placed = ofGround(view, sprout.foot);
    if (cull(placed)) continue;
    const size = sprout.tuft.size * placed.zoom;
    if (!onScreen(view, placed, -BLADE_OVERHANG * size)) continue;
    const down = Math.max(0, placed.y - view.groundTop) / depth;
    const tuft = {
      ...sprout.tuft,
      ...tuftColours(down),
      ...pick(placed, 'x', 'y'),
      size,
    };
    (behindHills(placed) ? shown.behind : shown.near).push({ tuft, sprout });
  }
  return shown;
}

/** Each scene's grass, for the flowers' hit tests to yield to (`tuftUnder`). */
const grassOf = new WeakMap<Phaser.Scene, Grass>();

/** Whether a finger at `point` on `scene`'s screen is within a bare tuft's reach (`tuftAt`). */
export function tuftUnder(scene: Phaser.Scene, point: Point): boolean {
  return grassOf.get(scene)?.at(point) !== undefined;
}

/**
 * The meadow's grass on screen, through each frame's view: the seam's grass
 * round the panorama and the ground's tufts, as many as `tendTufts` lets
 * stand, bending in the breeze, the tuft the flower picker is open on marked,
 * and the tuft that last refused a flower shaking its head. A tuft takes a
 * tap where it was last drawn.
 */
export class Grass {
  private readonly graphics: Phaser.GameObjects.Graphics;
  /** The ground's tufts past its top row, under the near hills as the beds' things there are (`depthOf`). */
  private readonly behind: Phaser.GameObjects.Graphics;
  /** The stream every tuft of the ground is drawn from, so a replay grows the same. */
  private readonly growing: Random;
  private layout: MeadowLayout | undefined;
  private seam: readonly SeamTuft[] = [];
  /** Every tuft the ground grows, standing or not (`growTufts`). */
  private grown: readonly Sprout[] = [];
  /** The tufts that stand, each taking a flower. */
  private tufts: readonly Sprout[] = [];
  /** The standing tufts as the last frame drew them, which a tap is judged on. */
  private shown: ShownGrass = { near: [], behind: [] };
  private view: View | undefined;
  private refused: Refusal | undefined;

  constructor(scene: Phaser.Scene, growing: Random) {
    this.graphics = scene.add.graphics();
    this.behind = scene.add
      .graphics()
      .setDepth(depthOf({ ...UNPLACED, behind: true }));
    this.growing = growing;
    grassOf.set(scene, this);
  }

  /** Draws the grass through `view` from the next frame on. */
  follow(view: View): void {
    this.view = view;
  }

  /**
   * Grows the seam's grass for `stand` from `random`, the same source
   * regrowing the same, and tends the ground's tufts on its layout, each kept
   * on its foot.
   */
  paint(stand: Stand, random: Random): void {
    this.seam = seamGrass(stand.layout, random);
    if (this.layout !== stand.layout) {
      this.grown = growTufts(stand.layout, this.grown, this.growing);
      this.layout = stand.layout;
    }
    this.tend(stand);
  }

  /** Tends the tufts to `stand` as it now stands (`tendTufts`). */
  tend(stand: Stand): void {
    this.tufts = tendTufts(stand, this.grown);
  }

  /** Whether a tuft stands on `foot`: where the flower picker can stay open. */
  holds(foot: FlowerFoot): boolean {
    return this.tufts.some((sprout) => sameFoot(sprout.foot, foot));
  }

  /** The grass as it bends at `t` through the view last followed, the tuft on `open`, the flower picker's, marked. */
  update(t: number, open: FlowerFoot | undefined): void {
    const { graphics, behind, view, refused, tufts, seam } = this;
    behind.clear();
    if (!view) {
      graphics.clear();
      return;
    }
    const shown = shownSprouts(view, tufts);
    this.shown = shown;
    const drawn = [...shown.near, ...shown.behind];
    const drawnOf = (holds: (sprout: Sprout) => boolean) =>
      drawn.find(({ sprout }) => holds(sprout))?.tuft;
    const marked = open && drawnOf(({ foot }) => sameFoot(foot, open));
    const shaken = refused && drawnOf(({ tuft }) => tuft === refused.tuft);
    const sprouting = {
      marked,
      refused: refused && shaken && { ...refused, tuft: shaken },
    };
    paintTufts(graphics, seamShown(view, seam), t);
    for (const [into, these] of [
      [graphics, shown.near],
      [behind, shown.behind],
    ] as const) {
      paintSprouts(
        into,
        these.map(({ tuft }) => tuft),
        t,
        sprouting,
      );
    }
  }

  /** The standing tuft a tap at `point`, on the screen, lands on, where the last frame drew it (`tuftAt`). */
  at(point: Point): Sprout | undefined {
    return tuftAt(this.shown.near, point)?.sprout;
  }

  /** Shakes `tuft`'s head from `now`, in seconds, as it refuses a flower. */
  refuse(tuft: Tuft, now: number): void {
    this.refused = { tuft, shakenAt: now };
  }
}
