/**
 * A run's mouse on screen, for `MouseRuns`: where a run meets a shown door,
 * and the runner stood at its point and painted.
 */

import { pick } from '@/shared/lib/collections';

import { pinholeOf } from '../../model/ground';
import { onStem } from '../../model/house';
import type { Tapped } from '../../model/motion';
import {
  endOf,
  hop,
  type RunEnd,
  type RunMoment,
  type Runner,
} from '../../model/mouse-run-clock';
import { facingAlong, type RunPath } from '../../model/mouse-run-course';
import { stemHalfWidth } from '../../model/mushroom-profile';
import { type BedPlace, bedPlace, standAt } from './bed-place';
import { mix } from './colour';
import { paintRunner } from './draw-mouse';
import type { WithCircleHit, WithGraphics } from './hit-areas';
import type { Shown } from './mushroom-shown';
import { PALETTE } from './palette';
import { hazeAhead } from './repaint-queue';
import { doorFront } from './run-front';
import { tapReach } from './tap-reach';
import type { View } from './view';

/** How high a runner's body's middle stands over its feet, in its width: where its tap circle centres. */
const RUNNER_MIDDLE = 0.3;

/** What a house lends a runner near its door to paint it in: its mushroom's size, for the ink, and its light. */
export type RunnerPaint = Pick<Shown, 'size' | 'lighting'>;

/**
 * A run's end at a door, with its house's paint taken along, so the runner
 * is drawn from the run's own state once that house has sunk and gone.
 */
export type PaintedEnd = RunEnd & RunnerPaint;

/** A runner at a moment of its run: its point, its course, and the paint of the end it is nearer. */
export type ShownRunner = Runner & { path: RunPath; house: RunnerPaint };

/** The run's end at `shown`'s door as `view` stands it; `undefined` with no door. */
export function doorEnd(shown: Shown, view: View): PaintedEnd | undefined {
  if (!shown.door) return undefined;
  const size = (shown.size * shown.opening) / pinholeOf(view).focal;
  const sill = onStem(shown.door)({ x: 0, y: 0 });
  const front = doorFront(
    shown.foot,
    view.eye,
    stemHalfWidth(shown.genes, 0) * size,
    sill.x * size,
  );
  return {
    ...endOf(front, shown.door, size, shown.foot),
    ...pick(shown, 'size', 'lighting'),
  };
}

/**
 * Stands `runner`'s graphics at `at` as of `moment` and `t`, hopping from
 * its last tap, sets its tap circle, and paints it in the ink and light of
 * the house `at` is nearer; returns where it stands.
 */
export function drawRunner(
  runner: WithGraphics & WithCircleHit & Pick<Tapped, 'tappedAt'>,
  view: View,
  at: ShownRunner,
  { travelled, progress }: RunMoment,
  t: number,
): BedPlace {
  const place = bedPlace(view, at.point);
  standAt(runner.graphics, place);
  const scale = (at.across * pinholeOf(view).focal) / place.ahead;
  const haze = hazeAhead(view, place);
  const raised = at.up / at.across + hop(t - runner.tappedAt);
  runner.hit.setTo(0, -(raised + RUNNER_MIDDLE) * scale, tapReach(scale / 2));
  paintRunner(
    runner.graphics.clear(),
    ({ x, y }) => ({ x: x * scale, y: -y * scale }),
    {
      ran: travelled / at.across,
      heads: facingAlong(at.path, progress, view.eye),
      raised,
    },
    {
      ink: Math.max(1.5, at.house.size * 0.01 * place.zoom),
      tone: (colour) => mix(colour, PALETTE.air, haze),
      ...pick(at.house, 'lighting'),
    },
  );
  return place;
}
