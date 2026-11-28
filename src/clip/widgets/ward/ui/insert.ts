import {
  add,
  at,
  clamp,
  ellipse,
  ink,
  INK_PALETTE,
  lerp,
  limb,
  type Pen,
  type Point,
  STAGE,
  times,
} from '@/clip/shared/ink';
import { nailAt } from '@/clip/shared/lettering';
import { reality } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';

import { WARD_PALETTE } from './palette-ward';
import { cell, GOUGED_WORDS, night, wallWriting, WRITING } from './room';

const ZOOM = 2.2;
/** How far back the camera's eye trails the nail, in progress. */
const TRAIL = [0, 0.01, 0.02, 0.03, 0.04] as const;

/** Where the camera looks: the nail's recent path averaged, so it glides between strokes. */
function focusAt(progress: number): Point {
  const tips = TRAIL.map(
    (lag) =>
      nailAt(GOUGED_WORDS, {
        ...WRITING,
        progress: clamp(progress - lag, 0.001, 1),
      }).nailTip,
  );
  let sum: Point = [0, 0];
  for (const tip of tips) sum = add(sum, tip);
  return times(sum, 1 / tips.length);
}

/** The finger gouging at `tip`, coming in from below right, pressed or lifted. */
function finger(pen: Pen, tip: Point, pressing: boolean): void {
  const lifted: Point = pressing ? tip : add(tip, [6, -10]);
  const knuckle = add(lifted, [70, 90]);
  const wrist = add(lifted, [150, 230]);
  limb(pen, [wrist, knuckle, lifted], INK_PALETTE.skin, 34, 81);
  ink(pen, ellipse(add(lifted, [4, 6]), 11, 8), {
    fill: WARD_PALETTE.nail,
    stroke: WARD_PALETTE.nailRim,
    width: 2,
    seed: 82,
  });
}

/**
 * The ward wall close, «КАК, СУКА, ХОРОШО» scratched `from` of the way and
 * on to `to` through the shot, the camera riding the nail.
 */
export const wardInsert =
  (from: number, to: number = from): Drawing =>
  (pen: Pen, { p }: Local) => {
    const progress = clamp(lerp(from, to, p), 0, 1);
    const [fx, fy] = focusAt(progress);
    const nail = nailAt(GOUGED_WORDS, { ...WRITING, progress });
    reality(pen, (inner) => {
      at(
        inner,
        { x: STAGE.width / 2, y: STAGE.height / 2, scale: ZOOM },
        () => {
          at(inner, { x: -fx, y: -fy }, () => {
            cell(inner);
            wallWriting(inner, {
              words: progress,
              marks: 0.25 + 0.6 * progress,
            });
            night(inner, 0.3);
            finger(inner, nail.nailTip, nail.pressing);
          });
        },
      );
    });
  };
