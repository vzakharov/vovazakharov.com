/**
 * Where a finger meets the grass: how far round its middle a tuft answers a
 * tap, which tuft a tap lands on, and whether a tuft is drawn bare to a
 * finger, nothing else on the screen taking a tap aimed at it.
 */

import { type Circle, distanceBetween, type Point } from '../../model/geometry';
import { placeIn } from './clump-layout';
import { standingAt } from './door-sight';
import { FLOWER_SWAY } from './flower-layout';
import { flowersOf } from './flower-plots';
import { sightingOf, type Stand } from './flower-sight';
import type { Tuft, WithTuft } from './grass';
import { type MushroomTarget, tappedMushroom, tapTarget } from './mushroom-tap';

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

/** Where a tuft's blades stand thickest: halfway up the middle blade. */
export function middleOf({ x, y, size }: Tuft): Point {
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
    const away = distanceBetween(middle, point);
    if (away <= tuftReach(sprout.tuft) && away < least) {
      nearest = sprout;
      least = away;
    }
  }
  return nearest;
}

/**
 * Whether a finger aimed at a tuft rooted in `stand` lands on the grass, from
 * the opening eye: no flower's petals at their widest sway (past it a flower
 * yields, `tuftUnder`) nor mushroom's drawn parts (`tappedMushroom`) hold its
 * middle or `BARE_CORE`. A tuft a turn slides under a control is the
 * control's, the controls being the screen's. `stand` is read once.
 */
export function bareToTap(stand: Stand): (tuft: Tuft) => boolean {
  const { layout, mushrooms } = stand;
  const heads: Circle[] = flowersOf(stand).map((flower) => {
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
      (head) => distanceBetween(head, middle) > head.r + core,
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
