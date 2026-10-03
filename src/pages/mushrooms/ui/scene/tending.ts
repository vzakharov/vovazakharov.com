/**
 * Which of the lawn's tufts stand, each a spot to plant on: those a view
 * tends (`tendedIn`) that take a flower as the anchor of the eye judges it
 * (`plantableIn`), judged at once (`tendTufts`) only when the screen is laid
 * out afresh, and otherwise a slice a frame (`Tending`), so a re-tend never
 * lands on one frame whole. What a change to the stand covers goes at once,
 * judged round its newcomers alone (`lostOn`).
 */

import { anchorOf } from '../../model/anchor';
import { flowersCrowdAt } from '../../model/crowding';
import { azimuthOf } from '../../model/flight-frame';
import { FLOWER_RANGES, flowerGenes } from '../../model/flower-genes';
import { sameFoot } from '../../model/game';
import { boxesMeet, distanceBetween, wrap } from '../../model/geometry';
import {
  D_SEE,
  type Eye,
  type Footing,
  groundFootOf,
  OPENING_EYE,
} from '../../model/ground';
import { pinholeOf } from '../../model/pinhole';
import { anchoredStand, hasGround, movedTo } from './anchored-stand';
import { headClear, standingOn } from './flower-layout';
import { flowersOf, groundFor, mushroomFeet } from './flower-plots';
import {
  type Cover,
  coversOn,
  roomIn,
  type Stand,
  WIDEST_SPAN,
} from './flower-sight';
import { type Tuft, tuftSizeAt } from './grass';
import type { Sprout } from './lawn';
import type { MeadowLayout } from './layout';
import { PALE_SPAN } from './repaint-queue';
import { bareAmong, bareToTap } from './tuft-tap';
import { cull, type View } from './view';

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

/**
 * How many tufts a re-tend judges in a frame (`Tending`): at tens of µs a
 * tuft, a few ms, and a sector's few hundred done in under ten frames, well
 * before the eye strays `TEND_STEP` again at a walk.
 */
export const TEND_SLICE = 60;

/** `tuft` stood at `foot` on `layout`: its place and size there, the rest of it kept. */
function stoodAt(layout: MeadowLayout, tuft: Tuft, foot: Footing): Tuft {
  const { x, y } = standingOn(layout.camera, foot);
  return { ...tuft, x, y, size: tuftSizeAt(layout, y) };
}

/**
 * Whether a tuft of `stand` is a spot to plant on, as the anchor of `eye`
 * judges it (`anchoredStand`): its moved foot has ground and room (`roomIn`)
 * for a flower whose head never meets a standing one's (`headClear`), and its
 * re-stood tuft is bare to a finger (`bareToTap`). `stand` is read once.
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
 * Whether a mushroom of `covers` stands nearer than a flower at `foot` on
 * `layout` and its drawn box meets the box every head such a flower could
 * grow (`FLOWER_RANGES`) stands in: where it might hide that flower's
 * insect (`flowerInSight`).
 */
function mayCover(
  layout: MeadowLayout,
  covers: readonly Cover[],
  foot: Footing,
): boolean {
  const { x, y, size } = standingOn(layout.camera, foot);
  const [leftmost, rightmost] = FLOWER_RANGES.stemBend;
  const r = FLOWER_RANGES.petalLength[1] * size;
  const heads = {
    left: x + leftmost * size - r,
    right: x + rightmost * size + r,
    top: y - size - r,
    bottom: y - size + r,
  };
  return covers.some(
    ({ depth, drawn }) =>
      depth > y && drawn.some(({ box }) => boxesMeet(heads, box)),
  );
}

/**
 * Whether a tuft that took a flower on `was` takes none on `now`, both as
 * the anchor of `eye` judges them (`plantableIn`), for a change to the stand
 * that cannot wait for a re-tend. Every rule but the flowers' count round a
 * foot asks each flower and mushroom alone, and losing one only frees room,
 * so only what `now` stands that `was` did not — its newcomers — can cover a
 * tuft: the count is asked of every flower, the rest of the newcomers alone,
 * and the full rules only where a newcomer's drawn box meets the tuft's
 * flower (`mayCover`). Exactly `!plantableIn(now, eye)` on such a tuft.
 */
export function lostOn(
  was: Stand,
  now: Stand,
  eye: Eye,
): (sprout: Sprout) => boolean {
  const anchor = anchorOf(eye);
  const before = anchoredStand(was, anchor);
  const after = anchoredStand(now, anchor);
  const { layout, mushrooms } = after;
  const stood = flowersOf(before);
  const flowers = flowersOf(after);
  const sown = flowers.filter(
    ({ id, foot }) =>
      !stood.some((flower) => flower.id === id && sameFoot(flower.foot, foot)),
  );
  const kept = new Set(before.mushrooms);
  const grown = mushrooms.filter((mushroom) => !kept.has(mushroom));
  if (sown.length === 0 && grown.length === 0) return () => false;
  const feet = mushroomFeet(layout, grown);
  const heads = sown.map((flower) => ({
    foot: groundFootOf(flower.foot),
    genes: flowerGenes(flower),
  }));
  const bare = bareAmong(layout, sown, grown);
  const covers = coversOn(layout, grown);
  let judge: ((sprout: Sprout) => boolean) | undefined;
  return (sprout) => {
    const moved = movedTo(anchor, sprout.foot);
    if (moved !== sprout.foot && !hasGround(moved)) return true;
    const stoodTuft =
      moved === sprout.foot ? sprout.tuft : stoodAt(layout, sprout.tuft, moved);
    const lost =
      (sown.length > 0 && flowersCrowdAt(flowers, moved)) ||
      !groundFor(moved, sown, feet) ||
      !headClear(groundFootOf(moved), heads) ||
      !bare(stoodTuft);
    if (lost) return true;
    if (!mayCover(layout, covers, moved)) return false;
    judge ??= plantableIn(now, eye);
    return !judge(sprout);
  };
}

/**
 * Whether a tuft is one `view` tends: within the reach a tuft is drawn at
 * (`D_SEE` and `PALE_SPAN`), past the near ones the view never draws, each
 * with `TEND_STEP` to spare, and at an azimuth off the heading no farther
 * than the screen's side and `TENDED_SCREENS` screens more.
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
    return Math.abs(wrap(azimuthOf(eye, foot) - eye.heading)) <= most;
  };
}

/**
 * How far, in px across the screen, `view` turns from the heading the tufts
 * were tended at before its side comes within `slack` of the side of the
 * world the rules judge a tuft in (`flowerInSight`): the layout lays a
 * point out `focal · tan(azimuth / SPREAD)` px off the anchor's heading, the
 * screen `arc · azimuth`, so the world's side stands `focal · atan` of its
 * half-width over `focal` across the screen. Past it a tuft in sight was
 * judged off the world, and stands only once tended again.
 */
function turnInWorld(view: View, slack: number): number {
  const { width, world } = view;
  const { focal } = pinholeOf(view);
  return focal * Math.atan((world / 2 - slack) / focal) - width / 2;
}

/**
 * Whether `view`'s eye has stepped `TEND_STEP` from `from`, or turned
 * `TEND_TURN` of a screen or as far as the world tended in reaches
 * (`turnInWorld`, with `slack` to spare), so a tuft in sight may stand
 * outside what was tended.
 */
export function strayed(view: View, from: Eye, slack: number): boolean {
  const { eye, width } = view;
  const turn = Math.abs(wrap(eye.heading - from.heading)) * pinholeOf(view).arc;
  const most = Math.min(TEND_TURN * width, turnInWorld(view, slack));
  return distanceBetween(eye, from) > TEND_STEP || turn > Math.max(0, most);
}

/**
 * How near, in px, a tuft's foot on `layout` stands to the world's side at
 * the most while its flower's sighting reaches it (`flowerInSight`): the
 * widest insect's span and a near flower's head and sway, with room over.
 */
export function sightSlack({ insectSize, camera }: MeadowLayout): number {
  return 2 * WIDEST_SPAN * insectSize + camera.unit;
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

/**
 * `tendTufts` spread over frames: each `step` does one frame's share — the
 * rules read off `stand` on the first, then `TEND_SLICE` tufts of `grown` a
 * step — and hands back the standing tufts, exactly `tendTufts`', on the
 * step that judges the last.
 */
export class Tending {
  /** The eye the tufts are judged from, which they stand as tended from once done. */
  readonly eye: Eye;
  private readonly stand: Stand;
  private readonly grown: readonly Sprout[];
  private judge: ((sprout: Sprout) => boolean) | undefined;
  private judged = 0;
  private readonly standing: Sprout[] = [];

  constructor(stand: Stand, grown: readonly Sprout[], eye: Eye) {
    this.stand = stand;
    this.grown = grown;
    this.eye = eye;
  }

  /** One frame's share of the judging: the standing tufts once every one is judged, else `undefined`. */
  step(): Sprout[] | undefined {
    const { grown, standing, judge, judged, stand, eye } = this;
    if (!judge) {
      this.judge = plantableIn(stand, eye);
      return undefined;
    }
    const end = Math.min(judged + TEND_SLICE, grown.length);
    for (const sprout of grown.slice(judged, end)) {
      if (judge(sprout)) standing.push(sprout);
    }
    this.judged = end;
    return end === grown.length ? standing : undefined;
  }
}

/**
 * The tufts that stand and how they came to: judged whole when the screen is
 * laid out (`whole`), then a slice a frame (`Tending`) once the eye strays
 * (`strayed`) or the stand changes (`change`), the tufts last tended
 * standing meanwhile, less those a change covers, which go at once
 * (`lostOn`). Every tuft standing takes a flower on the stand as it now
 * stands, judged at `tendedAt`.
 */
export class Tended {
  /** The tufts to judge for a stand from an eye (`tendedIn`). */
  private readonly gather: (stand: Stand, eye: Eye) => Sprout[];
  /** The stand the standing tufts are judged on. */
  private stood: Stand | undefined;
  private tufts: readonly Sprout[] = [];
  /** The eye the standing tufts were tended from. */
  private tendedFrom: Eye | undefined;
  /** The re-tend under way, a slice a frame. */
  private tending: Tending | undefined;
  /**
   * Whether the next `follow` passes: the one in a change's own frame, which
   * the scene runs after the change (`MeadowScene.update`), so reading the
   * rules lands on a frame of its own.
   */
  private changed = false;

  constructor(gather: (stand: Stand, eye: Eye) => Sprout[]) {
    this.gather = gather;
  }

  /** The tufts that stand, each taking a flower. */
  standing(): readonly Sprout[] {
    return this.tufts;
  }

  /** The stand the standing tufts are judged on, once tended. */
  stand(): Stand | undefined {
    return this.stood;
  }

  /** The eye the standing tufts were tended from, which every check of the planter judges at (`Scened.tendedAt`). */
  tendedAt(): Eye {
    return this.tendedFrom ?? OPENING_EYE;
  }

  /** Tends the tufts to `stand` from `eye` at once, in place of any re-tend under way: for a screen laid out afresh, whose tufts nothing yet shows. */
  whole(stand: Stand, eye: Eye): void {
    this.stood = stand;
    this.tending = undefined;
    this.changed = false;
    this.tufts = tendTufts(stand, this.gather(stand, eye), eye);
    this.tendedFrom = eye;
  }

  /**
   * Re-tends the tufts to `stand`, as it now stands, from `eye`, a slice a
   * frame in place of any re-tend under way; the standing tufts `stand`
   * covers go now (`lostOn`). On a stand laid out afresh, tends it whole.
   */
  change(stand: Stand, eye: Eye): void {
    const { stood, tufts } = this;
    if (stood?.layout !== stand.layout) {
      this.whole(stand, eye);
      return;
    }
    const lost = lostOn(stood, stand, this.tendedAt());
    this.tufts = tufts.filter((sprout) => !lost(sprout));
    this.stood = stand;
    this.retend(stand, eye);
    this.changed = true;
  }

  /** Judges the re-tend under way a slice further, or starts one once `view`'s eye strays past the last tending (`strayed`), unless a `change` came since the last `follow`. */
  follow(view: View): void {
    const { stood, tendedFrom, tending, changed } = this;
    this.changed = false;
    if (changed) return;
    if (tending) {
      this.tendOn();
    } else if (
      stood &&
      tendedFrom &&
      strayed(view, tendedFrom, sightSlack(stood.layout))
    ) {
      this.retend(stood, view.eye);
    }
  }

  /** Starts a re-tend of `stand` from `eye`, its tufts gathered now and judged from the next `follow` on (`tendOn`). */
  private retend(stand: Stand, eye: Eye): void {
    this.tending = new Tending(stand, this.gather(stand, eye), eye);
  }

  /** Judges the re-tend under way a slice further, and stands its tufts once it has judged them all. */
  private tendOn(): void {
    const { tending } = this;
    const standing = tending?.step();
    if (!tending || !standing) return;
    this.tufts = standing;
    this.tendedFrom = tending.eye;
    this.tending = undefined;
  }
}
