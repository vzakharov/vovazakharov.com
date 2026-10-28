/**
 * A flower's head folding shut, from 0 (open) to 1 (a bud, its petals
 * standing folded up over the head's middle): how its centre and petals
 * stand at each share of the way.
 */

import { type Point, wrap } from '@/mushrooms/shared/lib/geometry';

/**
 * A closed flower's bud, in shares of its ring's open petal length: how far
 * below the head's middle its foot sits and how far above it its tip rises
 * (together about two-thirds of the open head's height), how far either side
 * of the middle its outermost petals stand at the foot, how far, in radians,
 * they lean in so their tips meet, and how much wider than open a petal
 * stands, so the bud reads as one closed shape.
 */
export const BUD = {
  foot: 0.4,
  tip: 0.95,
  spread: 0.28,
  lean: 0.3,
  width: 1.35,
};

/** How fast, against the closing, the head's centre goes under the rising petals. */
const DISC_GONE = 1.6;

/** How far shut a flower was last painted, from 0 (open) to 1 (a bud). */
export type Shut = { closing: number };

/**
 * A head `closing` of the way shut: the closing itself, and as shares of the
 * open head's how much of its centre shows and how wide its petals stand.
 */
export type Folding = Shut & Record<'disc' | 'width', number>;

export function folding(closing: number): Folding {
  const shut = Math.min(1, Math.max(0, closing));
  return {
    closing: shut,
    disc: Math.max(0, 1 - shut * DISC_GONE),
    width: 1 + (BUD.width - 1) * shut,
  };
}

/** An open flower's head. */
export const OPEN: Folding = folding(0);

/**
 * One petal as drawn, the leading arguments of the petal outlines (`petal`):
 * where its foot is from the head's middle, the way it points, and its span
 * out from the foot.
 */
export type PetalPose = readonly [
  foot: Point,
  angle: number,
  span: readonly [number, number],
];

/**
 * The petal that open points along `angle` from `from` to `to` out of the
 * head's middle, `closing` of the way swung up into the bud: its foot slides
 * to the bud's foot, on the side it stood open, and it turns the short way
 * round to stand upright, leaning in toward the bud's tip.
 */
export function petalPose(
  angle: number,
  [from, to]: readonly [number, number],
  closing: number,
): PetalPose {
  const side = Math.cos(angle);
  const open = {
    foot: { x: side * from, y: Math.sin(angle) * from },
    length: to - from,
  };
  const shut = {
    foot: { x: side * BUD.spread * to, y: BUD.foot * to },
    angle: -Math.PI / 2 - side * BUD.lean,
    length: ((BUD.foot + BUD.tip) * to) / Math.cos(BUD.lean * side),
  };
  const along = (one: number, other: number) => one + (other - one) * closing;
  return [
    {
      x: along(open.foot.x, shut.foot.x),
      y: along(open.foot.y, shut.foot.y),
    },
    angle + wrap(shut.angle - angle) * closing,
    [0, along(open.length, shut.length)],
  ];
}
