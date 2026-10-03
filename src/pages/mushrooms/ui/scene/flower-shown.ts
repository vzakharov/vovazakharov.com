import type * as Phaser from 'phaser';

import {
  type Flower,
  type FlowerGenes,
  flowerHead,
} from '../../model/flower-genes';
import { CLUMP_DISTANCE } from '../../model/ground';
import { phaseOf, type Sprouted } from '../../model/motion';
import { UNPLACED } from './bed-place';
import {
  drawFlower,
  type FlowerPainting,
  foldedHead,
  paintFlowerHead,
  paintFlowerLit,
} from './draw-flower';
import { folding, type Shut } from './flower-closing';
import { laidFlower } from './flower-layout';
import type { StandingFlower } from './flower-plots';
import type { Ringed } from './flower-ring';
import type { Centred } from './flower-seat';
import { flowerTapReach } from './flower-sight';
import type { TappedFigure } from './hit-areas';
import type { Lighting } from './ink';
import type { MeadowLayout } from './layout';

/** How far ahead of the eye a thing is laid out at, where it is not where the layout stands it (`viewedOrLaid`). */
type LaidAhead = { opening?: number };

/** Its foot on the plane, and where the bed lays it out to paint it. */
type Laid = Pick<StandingFlower, 'foot' | 'place'> & LaidAhead;

export type Shown = TappedFigure &
  Sprouted &
  Centred &
  Ringed & {
    stem: Phaser.GameObjects.Graphics;
    head: Phaser.GameObjects.Graphics;
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
  objects: Pick<Shown, 'container' | 'stem' | 'head' | 'hit'>,
): Shown {
  return {
    ...objects,
    headR: 0,
    headY: 0,
    laid: undefined,
    painting: undefined,
    closing: 0,
    stands: UNPLACED,
    disc: 0,
    plantedAt,
    phase: phaseOf(flower),
    tappedAt: -Infinity,
  };
}

/**
 * Paints `shown` at `size` in `openingLight`, its light as the opening eye
 * sees it, turned by `heading`, as far shut as its `closing`, and keeps how it
 * painted it; its head and centre follow the paint, and its tap reach the
 * open head's, so a closed flower takes the taps an open one does.
 */
export function paintShown(
  shown: Shown,
  genes: FlowerGenes,
  size: number,
  openingLight: Lighting,
  heading: number,
): void {
  let lastLit = openingLight;
  const fold = () => {
    const folded = folding(shown.closing);
    ({ r: shown.headR, disc: shown.disc } = foldedHead(genes, size, folded));
    return folded;
  };
  shown.painting = {
    openingLight,
    drawIn: (lit) => {
      lastLit = lit;
      drawFlower(shown, genes, size, lit, fold());
    },
    drawHead: () => {
      paintFlowerHead(shown.head.clear(), genes, size, lastLit, fold());
    },
    paintedSunSide: openingLight.toward.x,
  };
  paintFlowerLit(shown.painting, heading);
  shown.headY = shown.head.y;
  shown.hit.setTo(0, 0, flowerTapReach(flowerHead(genes, size).r));
}

/** Repaints `shown`'s head `closing` of the way shut, a step of `closingStep`, in the light it was last painted in. */
export function closeShown(shown: Shown, closing: number): void {
  shown.closing = closing;
  shown.painting?.drawHead();
}
