/**
 * A run's mouse on screen, for `MouseRuns`: where a run meets a shown door,
 * and the runner stood at its point and painted.
 */

import { pick } from '@/kernel/shared/lib/collections';

import type { Scaled } from '@/mushrooms/shared/lib/geometry';
import type { TapTimed } from '@/mushrooms/shared/lib/motion';
import { tapReach } from '@/mushrooms/shared/lib/tap-reach';
import {
  type Dusked,
  hazeTone,
  type Lighted,
  type WithCircleHit,
  type WithGraphics,
} from '@/mushrooms/shared/ui';
import {
  type BedPlace,
  bedPlace,
  hazeAhead,
  pinholeOf,
  standAt,
  type View,
} from '@/mushrooms/shared/world';
import {
  facingAlong,
  hop,
  paintRunner,
  type RunEnd,
  type RunMoment,
  type Runner,
  type RunPath,
} from '@/mushrooms/entities/mouse';
import {
  onStem,
  type Shown,
  stemHalfWidth,
} from '@/mushrooms/entities/mushroom';

import { endOf } from '../model/run-ends';
import { doorFront } from './run-front';

/** How high a runner's body's middle stands over its feet, in its width: where its tap circle centres. */
const RUNNER_MIDDLE = 0.3;

/** What a house lends a runner near its door to paint it in: its mushroom's size, for the ink, and its light. */
type RunnerPaint = Scaled & Lighted;

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
 * the house `at` is nearer, hazed toward the air at `dusk` (`hazeTone`);
 * returns where it stands.
 */
export function drawRunner(
  runner: WithGraphics & WithCircleHit & TapTimed,
  view: View,
  at: ShownRunner,
  { travelled, progress }: RunMoment,
  { t, dusk }: Dusked & { t: number },
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
      tone: hazeTone(haze, dusk),
      ...pick(at.house, 'lighting'),
    },
  );
  return place;
}
