/**
 * Which of the lawn's tufts stand, each a spot to plant on: those a view
 * tends (`tendedIn`) that take a flower as the anchor of the eye judges it
 * (`plantableIn`), judged at once (`tendTufts`) or a slice a frame while the
 * eye walks (`Tending`), so a re-tend never lands on one frame whole.
 */

import { anchorOf } from '../../model/anchor';
import { azimuthOf } from '../../model/flight-frame';
import { flowerGenes } from '../../model/flower-genes';
import { distanceBetween, wrap } from '../../model/geometry';
import {
  D_SEE,
  type Eye,
  type Footing,
  groundFootOf,
  pinholeOf,
} from '../../model/ground';
import { anchoredStand, hasGround, movedTo } from './anchored-stand';
import { headClear, standingOn } from './flower-layout';
import { flowersOf } from './flower-plots';
import { roomIn, type Stand } from './flower-sight';
import { type Tuft, tuftSizeAt } from './grass';
import type { Sprout } from './lawn';
import type { MeadowLayout } from './layout';
import { PALE_SPAN } from './repaint-queue';
import { bareToTap } from './tuft-tap';
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
 * Whether `view`'s eye has stepped `TEND_STEP` or turned `TEND_TURN` of a
 * screen from `from`, so a tuft in sight may stand outside what was tended.
 */
export function strayed(view: View, from: Eye): boolean {
  const { eye, width } = view;
  const turn = Math.abs(wrap(eye.heading - from.heading)) * pinholeOf(view).arc;
  return distanceBetween(eye, from) > TEND_STEP || turn > TEND_TURN * width;
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
