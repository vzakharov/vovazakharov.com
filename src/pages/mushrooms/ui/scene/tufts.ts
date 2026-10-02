/**
 * The ground's grass as the child plants on it: where its tufts grow, which
 * one a tap lands on, and where on the ground a flower planted there stands.
 * Every tuft on the ground is a spot to plant on, grown by the lawn's cells
 * round the eye (`lawn.ts`) and kept on its foot whatever grows round it,
 * and drawn each frame where the view places that foot. Only a tap nothing
 * else takes reaches the grass (`MeadowScene.tapMeadow`); it lands on the
 * nearest tuft drawn bare to a finger (`bareToTap`), which opens the flower
 * picker where a flower fits (`plantableIn`) and shakes its head where none
 * does (`Planter.tapTuft`). A flower planted on a tuft takes its place, and
 * a flower pulled up leaves a tuft where it stood (`leaveTufts`).
 */

import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { flowerGenes } from '../../model/flower-genes';
import { sameFoot } from '../../model/game';
import { distanceBetween, type Point, wrap } from '../../model/geometry';
import {
  CLUMP_DISTANCE,
  D_SEE,
  type Eye,
  type Footing,
  groundFootOf,
  OPENING_EYE,
  pinholeOf,
} from '../../model/ground';
import type { Random } from '../../model/random';
import { anchoredStand, hasGround, movedTo } from './anchored-stand';
import { depthOf, UNPLACED } from './bed-place';
import { coversShown, inSightPast } from './flower-cover';
import { FLOWER_SIZE, headClear, standingOn } from './flower-layout';
import { flowersOf, pulledFeet } from './flower-plots';
import { roomIn, type Stand } from './flower-sight';
import {
  BLADE_OVERHANG,
  downAt,
  paintSprouts,
  paintTufts,
  type Refusal,
  seamGrass,
  seamShown,
  type SeamTuft,
  type Tuft,
  tuftColours,
  tuftSizeAt,
  type WithTuft,
} from './grass';
import { LiveLawn, regrowTufts, type Sprout, sproutOn } from './lawn';
import type { MeadowLayout } from './layout';
import { PALE_SPAN } from './repaint-queue';
import { bareToTap, middleOf, tuftAt } from './tuft-tap';
import {
  behindHills,
  cull,
  ofGround,
  onScreen,
  placedAt,
  sunk,
  sunkAway,
  type View,
  viewAt,
} from './view';

export type { Sprout } from './lawn';

/** How tall a tuft stands, in units of its size: its middle blade (`grass.ts`). */
const TUFT_HEIGHT = 2;

/**
 * How many screens either side of the view a tuft is tended in: judging a
 * tuft costs tens of µs, so only those a turn or a step soon brings into
 * sight are judged, never every live one (`tendedIn`).
 */
const TENDED_SCREENS = 1;
/**
 * How far, in the clump's size, the eye steps, and in screens turns, from
 * where the tufts were last tended before they are tended again: within it,
 * every tuft in sight stands in the tended sector (`TENDED_SCREENS`).
 */
const TEND_STEP = 0.5;
const TEND_TURN = 0.5;

/** `tuft` stood at `foot` on `layout`: its place and size there, the rest of it kept. */
function stoodAt(layout: MeadowLayout, tuft: Tuft, foot: Footing): Tuft {
  const { x, y } = standingOn(layout.camera, foot);
  return { ...tuft, x, y, size: tuftSizeAt(layout, y) };
}

/**
 * Whether a tuft of `stand` stands there, a spot to plant on, as the anchor
 * of `eye` judges it (`anchoredStand`): its foot, moved with the anchor, has
 * ground and takes a flower (`roomIn`) whose head, however it grows, meets
 * no standing flower's on any screen (`headClear`), and its tuft, re-stood
 * at the moved foot, is bare to a finger (`bareToTap`). What `stand` holds
 * is read once, for every tuft asked after.
 */
export function plantableIn(
  stand: Stand,
  eye: Eye,
): (sprout: Sprout) => boolean {
  const anchor = anchorOf(eye);
  const judged = anchoredStand(stand, anchor);
  const { layout } = judged;
  const room = roomIn(judged);
  const bare = bareToTap(judged);
  const standing = flowersOf(judged).map((flower) => ({
    foot: groundFootOf(flower.foot),
    genes: flowerGenes(flower),
  }));
  return ({ foot, tuft }) => {
    const moved = movedTo(anchor, foot);
    if (moved !== foot && !hasGround(moved)) return false;
    const stood = moved === foot ? tuft : stoodAt(layout, tuft, moved);
    return (
      room(moved) && headClear(groundFootOf(moved), standing) && bare(stood)
    );
  };
}

/**
 * The tufts the flowers pulled up in `stand` leave: `left`, then one from
 * `random` at each pulled flower's foot no tuft of `left`, nor of the lawn
 * where the foot stands (`grownAt`), holds, so a seeded flower's spot, or a
 * bee's, can be planted on again. Each stays on its foot from then on.
 */
export function leaveTufts(
  stand: Stand,
  grownAt: (foot: Point) => readonly Sprout[],
  left: readonly Sprout[],
  random: Random,
): readonly Sprout[] {
  const tufts = [...left];
  const added: Sprout[] = [];
  for (const { x, y } of pulledFeet(stand)) {
    const foot = { x, y, size: FLOWER_SIZE };
    const near = [...tufts, ...grownAt(foot)];
    if (near.some((sprout) => sameFoot(sprout.foot, foot))) continue;
    const sprout = sproutOn(stand.layout, foot, random);
    tufts.push(sprout);
    added.push(sprout);
  }
  return added.length === 0 ? left : [...left, ...added];
}

/**
 * Whether a tuft is one `view` tends: within the reach a tuft is drawn at
 * (`D_SEE` and `PALE_SPAN`), past the near ones the view never draws, each
 * with `TEND_STEP` to spare, and
 * at an azimuth off the heading no farther than the screen's side and
 * `TENDED_SCREENS` screens more.
 */
export function tendedIn(view: View): (sprout: Sprout) => boolean {
  const { eye, width } = view;
  const { arc } = pinholeOf(view);
  const most = ((0.5 + TENDED_SCREENS) * width) / arc;
  return ({ foot }) => {
    const distance = distanceBetween(eye, foot);
    const far = distance - TEND_STEP > D_SEE + PALE_SPAN;
    if (far || cull({ ahead: distance + TEND_STEP })) {
      return false;
    }
    const azimuth = Math.atan2(foot.x - eye.x, foot.y - eye.y);
    return Math.abs(wrap(azimuth - eye.heading)) <= most;
  };
}

/**
 * The tufts of `grown` that stand on `stand` as the anchor of `eye` judges
 * it, each a spot to plant on (`plantableIn`): a tuft where no flower fits
 * hides until what kept it away goes.
 */
export function tendTufts(
  stand: Stand,
  grown: readonly Sprout[],
  eye: Eye,
): Sprout[] {
  return grown.filter(plantableIn(stand, eye));
}

/** A tuft of the ground as a frame draws it: the tuft laid out, and where and how big the view draws it. */
type ShownSprout = WithTuft & { sprout: Sprout };

/** The ground's tufts a frame draws: those this side of the ground's top row, and those past it, sinking. */
export type ShownGrass = { near: ShownSprout[]; behind: ShownSprout[] };

/**
 * Where `view` draws each of `sprouts`: its foot placed through the view,
 * hidden near the eye and sunk past the brow as a bed's things are
 * (`bed-place.ts`), and sized and toned by the screen row it stands on as
 * the ground's bands are (`tuftSizeAt`), wherever on the plane it stands.
 */
export function shownSprouts(
  view: View,
  sprouts: readonly Sprout[],
): ShownGrass {
  const shown: ShownGrass = { near: [], behind: [] };
  for (const sprout of sprouts) {
    const placed = placedAt(view, sprout.foot, 0, CLUMP_DISTANCE);
    if (cull(placed)) continue;
    const size = tuftSizeAt(view, placed.y);
    const drawn = sunk(view, placed);
    if (sunkAway(view, drawn, TUFT_HEIGHT * size)) continue;
    if (!onScreen(view, drawn, -BLADE_OVERHANG * size)) continue;
    const tuft = {
      ...sprout.tuft,
      ...tuftColours(downAt(view, drawn.y)),
      ...pick(drawn, 'x', 'y'),
      size,
    };
    (behindHills(placed) ? shown.behind : shown.near).push({ tuft, sprout });
  }
  return shown;
}

/**
 * Whether `view`'s eye has stepped `TEND_STEP` or turned `TEND_TURN` of a
 * screen from `from`, so a tuft in sight may stand outside what was tended.
 */
function strayed(view: View, from: Eye): boolean {
  const { eye, width } = view;
  const turn = Math.abs(wrap(eye.heading - from.heading)) * pinholeOf(view).arc;
  return distanceBetween(eye, from) > TEND_STEP || turn > TEND_TURN * width;
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
  /** The ground's tufts past its top row, sinking under the ground as the beds' things there do (`depthOf`). */
  private readonly behind: Phaser.GameObjects.Graphics;
  /** The stream every tuft a pulled flower leaves is drawn from, and the lawn's seed, so a replay grows the same. */
  private readonly growing: Random;
  /** The seed every cell of the lawn is grown off (`cellTufts`). */
  private readonly seed: number;
  private layout: MeadowLayout | undefined;
  /** The lawn's tufts round the eye, laid out on `layout`. */
  private lawn: LiveLawn | undefined;
  private seam: readonly SeamTuft[] = [];
  /** Every tuft a pulled flower left, standing or not (`leaveTufts`). */
  private left: readonly Sprout[] = [];
  /** The tufts that stand, each taking a flower. */
  private tufts: readonly Sprout[] = [];
  /** The standing tufts as the last frame drew them, which a tap is judged on. */
  private shown: ShownGrass = { near: [], behind: [] };
  private view: View | undefined;
  /** The stand the tufts were last tended to, whose mushrooms hide the tufts behind them. */
  private stand: Stand | undefined;
  /** The eye the tufts were last tended from (`tendedIn`). */
  private tendedFrom: Eye | undefined;
  private refused: Refusal | undefined;

  constructor(scene: Phaser.Scene, growing: Random) {
    this.graphics = scene.add.graphics();
    this.behind = scene.add
      .graphics()
      .setDepth(depthOf({ ...UNPLACED, behind: true }));
    this.growing = growing;
    this.seed = Math.floor(growing() * 2 ** 32);
    grassOf.set(scene, this);
  }

  /**
   * Draws the grass through `view` from the next frame on, and tends the
   * tufts again once its eye has stepped or turned past what the last tending
   * covered (`TEND_STEP`, `TEND_TURN`), the lawn's cells following the eye.
   */
  follow(view: View): void {
    this.view = view;
    const { stand, tendedFrom } = this;
    if (stand && tendedFrom && strayed(view, tendedFrom)) this.tend(stand);
  }

  /**
   * Grows the seam's grass for `stand` from `random`, the same source
   * regrowing the same, lays the lawn out on its layout, each tuft kept on
   * its foot, and tends it.
   */
  paint(stand: Stand, random: Random): void {
    const { layout } = stand;
    const { seed, left, growing } = this;
    this.seam = seamGrass(layout, random);
    if (this.layout !== layout) {
      this.lawn = new LiveLawn({ seed, layout });
      this.left = regrowTufts(layout, left, growing);
      this.layout = layout;
    }
    this.tend(stand);
  }

  /**
   * Tends the tufts to `stand` as it now stands: those of the lawn round the
   * eye and those its pulled flowers left, as many as the view tends
   * (`tendedIn`), that take a flower (`tendTufts`).
   */
  tend(stand: Stand): void {
    const { lawn, growing, view } = this;
    this.stand = stand;
    if (!lawn) return;
    const eye = view?.eye ?? OPENING_EYE;
    const left = leaveTufts(stand, (foot) => lawn.of(foot), this.left, growing);
    this.left = left;
    const tended = tendedIn(viewAt(stand.layout.camera, eye));
    const near = [...lawn.round(eye), ...left].filter((sprout) =>
      tended(sprout),
    );
    this.tufts = tendTufts(stand, near, eye);
    this.tendedFrom = eye;
  }

  /** The eye the standing tufts were tended from, which a tap on one is judged at (`Planter.tapTuft`). */
  tendedAt(): Eye {
    return this.tendedFrom ?? OPENING_EYE;
  }

  /** Whether a tuft stands on `foot`: where the flower picker can stay open. */
  holds(foot: Footing): boolean {
    return this.tufts.some((sprout) => sameFoot(sprout.foot, foot));
  }

  /** The grass as it bends at `t` through the view last followed, the tuft on `open`, the flower picker's, marked. */
  update(t: number, open: Footing | undefined): void {
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

  /**
   * The standing tufts the last frame drew this side of the ground's top
   * row with no nearer mushroom drawn over their middle (`inSightPast`):
   * those the child sees.
   */
  inView(): Sprout[] {
    const { view, stand, shown } = this;
    if (!view || !stand) return [];
    const covers = coversShown(view, stand.layout, stand.mushrooms);
    return shown.near.flatMap(({ tuft, sprout }) =>
      inSightPast(covers, middleOf(tuft), ofGround(view, sprout.foot).distance)
        ? [sprout]
        : [],
    );
  }

  /** Shakes `tuft`'s head from `now`, in seconds, as it refuses a flower. */
  refuse(tuft: Tuft, now: number): void {
    this.refused = { tuft, shakenAt: now };
  }
}
