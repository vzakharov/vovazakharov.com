/**
 * The ground's grass as the child plants on it. Every tuft is a spot to plant
 * on, grown by the lawn's cells round the eye (`lawn.ts`) and kept on its foot
 * whatever grows round it. Only a tap nothing else takes reaches the grass
 * (`MeadowScene.tapMeadow`), landing on the nearest tuft drawn bare
 * (`bareToTap`); a flower planted takes its tuft's place, and one pulled up
 * leaves a tuft (`leaveTufts`).
 */

import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { sameFoot } from '../../model/game';
import type { Point } from '../../model/geometry';
import {
  CLUMP_DISTANCE,
  type Eye,
  type Footing,
  OPENING_EYE,
} from '../../model/ground';
import type { Random } from '../../model/random';
import { depthOf, UNPLACED } from './bed-place';
import { coversShown, inSightPast } from './flower-cover';
import { FLOWER_SIZE } from './flower-layout';
import { pulledFeet } from './flower-plots';
import type { Stand } from './flower-sight';
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
import { MOTTLE_DEPTH, paintMottles, shownMottles } from './mottles';
import { Tended, tendedIn } from './tending';
import { middleOf, tuftAt } from './tuft-tap';
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
export { plantableIn, tendedIn, tendTufts } from './tending';

/** How tall a tuft stands, in units of its size: its middle blade (`grass.ts`). */
const TUFT_HEIGHT = 2;

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

/** A tuft of the ground as a frame draws it: the tuft laid out, and where and how big the view draws it. */
type ShownSprout = WithTuft & { sprout: Sprout };

/** The ground's tufts a frame draws: those this side of the ground's top row, and those past it, sinking. */
export type ShownGrass = { near: ShownSprout[]; behind: ShownSprout[] };

/**
 * Where `view` draws each of `sprouts`: hidden near the eye and sunk past the
 * brow as a bed's things are (`bed-place.ts`), sized and toned by its screen
 * row as the ground's bands are (`tuftSizeAt`), wherever on the plane it stands.
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
  /** The lawn's mottles, flat on the ground under everything standing on it. */
  private readonly mottled: Phaser.GameObjects.Graphics;
  /** The view the mottles were last drawn through, which they stand still under. */
  private mottledFor: View | undefined;
  /** The stream every tuft a pulled flower leaves is drawn from, and the lawn's seed, so a replay grows the same. */
  private readonly growing: Random;
  /** The seed every cell of the lawn is grown off (`cellLawn`). */
  private readonly seed: number;
  private layout: MeadowLayout | undefined;
  /** The lawn's tufts round the eye, laid out on `layout`. */
  private lawn: LiveLawn | undefined;
  private seam: readonly SeamTuft[] = [];
  /** Every tuft a pulled flower left, standing or not (`leaveTufts`). */
  private left: readonly Sprout[] = [];
  /** The tufts that stand and the stand and eye they were tended to. */
  private readonly tended = new Tended(this.grownRound.bind(this));
  /** The standing tufts as the last frame drew them, which a tap is judged on. */
  private shown: ShownGrass = { near: [], behind: [] };
  private view: View | undefined;
  private refused: Refusal | undefined;

  constructor(scene: Phaser.Scene, growing: Random) {
    this.graphics = scene.add.graphics();
    this.behind = scene.add
      .graphics()
      .setDepth(depthOf({ ...UNPLACED, behind: true }));
    this.mottled = scene.add.graphics().setDepth(MOTTLE_DEPTH);
    this.growing = growing;
    this.seed = Math.floor(growing() * 2 ** 32);
    grassOf.set(scene, this);
  }

  /**
   * Draws the grass through `view` from the next frame on, and judges the
   * re-tend under way a slice further, or starts one once its eye strays
   * (`Tended.follow`).
   */
  follow(view: View): void {
    this.view = view;
    this.tended.follow(view);
  }

  /**
   * Grows the seam's grass for `stand` from `random`, the same source
   * regrowing the same, lays the lawn out on its layout, each tuft kept on
   * its foot, and tends it.
   */
  paint(stand: Stand, random: Random): void {
    const { layout } = stand;
    const { seed, left, growing, view, tended } = this;
    this.seam = seamGrass(layout, random);
    if (this.layout !== layout) {
      this.lawn = new LiveLawn({ seed, layout });
      this.left = regrowTufts(layout, left, growing);
      this.layout = layout;
    }
    tended.whole(stand, view?.eye ?? OPENING_EYE);
  }

  /**
   * Re-tends the tufts to `stand` as it now stands, a slice a frame from the
   * view's eye, in place of any re-tend under way; the standing tufts it
   * covers go at once (`Tended.change`), so none shown shakes its head.
   */
  tend(stand: Stand): void {
    this.tended.change(stand, this.view?.eye ?? OPENING_EYE);
  }

  /**
   * The tufts to judge for `stand` from `eye`: those of the lawn round it and
   * those its pulled flowers left (`leaveTufts`), as many as the view from
   * `eye` tends (`tendedIn`).
   */
  private grownRound(stand: Stand, eye: Eye): Sprout[] {
    const { lawn, growing } = this;
    if (!lawn) return [];
    const left = leaveTufts(stand, (foot) => lawn.of(foot), this.left, growing);
    this.left = left;
    const tended = tendedIn(viewAt(stand.layout.camera, eye));
    return [...lawn.round(eye), ...left].filter((sprout) => tended(sprout));
  }

  /** The eye the standing tufts were tended from, which a tap on one is judged at (`Planter.tapTuft`). */
  tendedAt(): Eye {
    return this.tended.tendedAt();
  }

  /** Whether a tuft stands on `foot`: where the flower picker can stay open. */
  holds(foot: Footing): boolean {
    return this.tended.standing().some((sprout) => sameFoot(sprout.foot, foot));
  }

  /** The grass as it bends at `t` through the view last followed, the tuft on `open`, the flower picker's, marked. */
  update(t: number, open: Footing | undefined): void {
    const { graphics, behind, view, refused, seam, lawn, tended } = this;
    const { mottled, mottledFor } = this;
    behind.clear();
    if (!view) {
      graphics.clear();
      return;
    }
    if (lawn && view !== mottledFor) {
      paintMottles(mottled, shownMottles(view, lawn.mottles));
      this.mottledFor = view;
    }
    const shown = shownSprouts(view, tended.standing());
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
    const { view, shown, tended } = this;
    const stand = tended.stand();
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
