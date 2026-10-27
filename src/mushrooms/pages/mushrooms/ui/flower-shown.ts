import type * as Phaser from 'phaser';

import { pick } from '@/kernel/shared/lib/collections';

import { phaseOf, type Sprouted } from '@/mushrooms/shared/lib/motion';
import type {
  CircleFigure,
  Lighting,
  TappedFigure,
} from '@/mushrooms/shared/ui';
import {
  CLUMP_DISTANCE,
  type HeadReach,
  type Rooted,
  UNPLACED,
} from '@/mushrooms/shared/world';
import {
  drawFlower,
  type Flower,
  type FlowerGenes,
  flowerHead,
  type FlowerPainting,
  flowerTapReach,
  type Folding,
  folding,
  laidFlower,
  paintFlowerHead,
  paintFlowerLit,
  type Placed,
  type Ringed,
  type Shut,
  type StandingFlower,
} from '@/mushrooms/entities/flower';
import { foldedHead } from '@/mushrooms/features/insects-fly';

import type { MeadowLayout } from './layout';

/** How far ahead of the eye a thing is laid out at, where it is not where the layout stands it (`viewedOrLaid`). */
type LaidAhead = { opening?: number };

/** Its foot on the plane, and where the bed lays it out to paint it. */
type Laid = Rooted & Placed & LaidAhead;

/** Its stem and head, each drawn apart. */
type FlowerParts = {
  stem: Phaser.GameObjects.Graphics;
  head: Phaser.GameObjects.Graphics;
};

export type Shown = TappedFigure &
  Sprouted &
  Ringed &
  FlowerParts & {
    /**
     * Where insects perch on the head as last painted, folded as far shut as
     * that (`foldedHead`). Perching alone reads it: `headR` stays the open
     * head's, which the ring, the tap, the cull and the stand height read.
     */
    perch: HeadReach;
    /**
     * How far shut its head was last painted, as the paint itself reports it
     * (`paintFlowerHead`); `closing` is how far shut it is asked to be.
     */
    painted: Shut;
    /** Where the head stands on its stem as laid out, before a drinking insect sags it. */
    headY: number;
    /**
     * Its foot on the plane and where the bed lays it out to paint, in world
     * px at the opening eye: a seeded flower where the layout stands it, any
     * other `opening` ahead (`laidFlower`); `undefined` with no room on screen.
     */
    laid: Laid | undefined;
    /** How it was last painted, and how to repaint its head alone; `undefined` before its first paint. */
    painting: (FlowerPainting & { drawHead: () => void }) | undefined;
  } & Shut;

/**
 * Where the bed lays `stood` out to paint it on `layout`: where the layout
 * stands it for one of the visit's `seeded` flowers, any other at
 * `CLUMP_DISTANCE` in a frame of its own (`laidFlower`).
 */
export function laidOut(
  layout: MeadowLayout,
  stood: StandingFlower,
  seeded: boolean,
): Laid {
  const { foot, place } = stood;
  return seeded
    ? { foot, place }
    : {
        foot,
        place: laidFlower(layout.camera, foot),
        opening: CLUMP_DISTANCE,
      };
}

/**
 * `flower` as shown before the bed first lays it out, planted at `plantedAt`
 * (`-Infinity` for a seeded flower, standing from the start), in the objects
 * the bed made for it: unlaid and unpainted until `paintShown` paints it.
 */
export function unplacedShown(
  flower: Flower,
  plantedAt: number,
  objects: CircleFigure & FlowerParts,
): Shown {
  return {
    ...objects,
    headR: 0,
    headY: 0,
    laid: undefined,
    painting: undefined,
    closing: 0,
    stands: UNPLACED,
    perch: { r: 0, disc: 0 },
    painted: { closing: 0 },
    plantedAt,
    phase: phaseOf(flower),
    tappedAt: -Infinity,
  };
}

/**
 * Paints `shown` at `size` in `openingLight`, its light as the opening eye
 * sees it, turned by `heading`, as far shut as its `closing`, and keeps how it
 * painted it; its perch follows the paint, its head's size and tap reach stay
 * the open head's (`perch`).
 */
export function paintShown(
  shown: Shown,
  genes: FlowerGenes,
  size: number,
  openingLight: Lighting,
  heading: number,
): void {
  let lastLit = openingLight;
  const open = flowerHead(genes, size).r;
  shown.headR = open;
  // The perch and the closing read follow the fold the paint reports.
  const painted = (folded: Folding) => {
    shown.painted = pick(folded, 'closing');
    shown.perch = foldedHead(genes, size, folded);
  };
  shown.painting = {
    openingLight,
    drawIn: (lit) => {
      lastLit = lit;
      painted(drawFlower(shown, genes, size, lit, folding(shown.closing)));
    },
    drawHead: () => {
      painted(
        paintFlowerHead(
          shown.head.clear(),
          genes,
          size,
          lastLit,
          folding(shown.closing),
        ),
      );
    },
    paintedSunSide: openingLight.toward.x,
  };
  paintFlowerLit(shown.painting, heading);
  shown.headY = shown.head.y;
  shown.hit.setTo(0, 0, flowerTapReach(open));
}

/** Repaints `shown`'s head `closing` of the way shut, a step of `closingStep`, in the light it was last painted in. */
export function closeShown(shown: Shown, closing: number): void {
  shown.closing = closing;
  shown.painting?.drawHead();
}
