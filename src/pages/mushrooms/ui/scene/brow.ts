/**
 * The meadow's brow: the ground rounding over its horizon along the cover row
 * (`groundTop + seamReach`), under which a thing past `D_SEE` sinks (`sunk`).
 * A lighter crest runs along that row and a fringe of blades stands on it,
 * drawn in front of whatever sinks, so a far thing goes down behind the brow
 * foot first, as a ship goes under a small planet's horizon, rather than
 * burying itself in a flat field.
 */

import type * as Phaser from 'phaser';

import { type Camera, pinholeOf } from '../../model/ground';
import { between, mulberry32 } from '../../model/random';
import { BROW, groundAt } from './backdrop-tones';
import { mix } from './colour';
import { screenAt } from './panorama';
import { seamReach } from './skyline';
import { coverRow, type View } from './view';

/** The brow's own stream, so growing its blades draws nothing from the backdrop's. */
const BROW_SEED = 0xb7_0a;
/** How far apart the blades stand on average, in the seam's reach, at the screen's middle. */
const BLADE_GAP = 0.3;
/** The fewest CSS px between blades, so a short screen's brow does not turn to felt. */
const LEAST_GAP = 2.5;
/**
 * How tall a blade stands, in the seam's reach: never so tall that its tip
 * reaches the ground's top row, where a thing crossing `D_SEE` has its foot,
 * so nothing goes behind the blades at once.
 */
const BLADE_TALL = [0.3, 0.7] as const;
/** How far a blade's tip leans either way, in the seam's reach. */
const BLADE_LEAN = 0.18;
/** Half a blade's width at its root, in the seam's reach, and the least in CSS px. */
const BLADE_HALF = 0.07;
const LEAST_HALF = 0.6;
/** How far below the cover row a blade is rooted, in the seam's reach, so its root sits in the crest. */
const ROOT_DOWN = 0.1;
/** The share of blades lit at the tip, the rest dark. */
const LIT_SHARE = 0.35;
/** How far down from the cover row the crest's light fades into the ground, in the seam's reach, and in how many rows. */
const CREST_DEPTH = 0.45;
const CREST_ROWS = 4;

/** One blade of the brow: the azimuth it stands at, its height and lean as shares of the seam's reach, and whether its tip is lit. */
export type BrowBlade = {
  azimuth: number;
  tall: number;
  lean: number;
  lit: boolean;
};

/**
 * The brow's blades round the whole panorama for `camera`, one to each even
 * share of the circle, anywhere in it, so every heading shows them at one
 * density; the same camera grows the same blades.
 */
export function browBlades(camera: Camera): BrowBlade[] {
  const random = mulberry32(BROW_SEED);
  const { focal } = pinholeOf(camera);
  const gap = Math.max(LEAST_GAP, seamReach(camera) * BLADE_GAP);
  const count = Math.round((Math.PI * 2 * focal) / gap);
  const share = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, index) => ({
    azimuth: -Math.PI + share * (index + random()),
    tall: between(random, ...BLADE_TALL),
    lean: between(random, -BLADE_LEAN, BLADE_LEAN),
    lit: random() < LIT_SHARE,
  }));
}

/** A blade as a view draws it, in CSS px: its root's middle, its half width there, and its tip. */
export type ShownBlade = {
  x: number;
  root: number;
  half: number;
  tip: { x: number; y: number };
  lit: boolean;
};

/** The blades of `blades` that `view`'s screen shows, each where it stands across it at the heading. */
export function browShown(
  view: View,
  blades: readonly BrowBlade[],
): ShownBlade[] {
  const reach = seamReach(view);
  const root = coverRow(view) + reach * ROOT_DOWN;
  const half = Math.max(LEAST_HALF, reach * BLADE_HALF);
  return blades.flatMap(({ azimuth, tall, lean, lit }) => {
    const x = screenAt(view, azimuth);
    const overhang = reach * (BLADE_LEAN + BLADE_HALF);
    if (x === undefined || x < -overhang || x > view.width + overhang) {
      return [];
    }
    return [
      {
        x,
        root,
        half,
        tip: { x: x + lean * reach, y: root - tall * reach },
        lit,
      },
    ];
  });
}

/**
 * The brow as `view` shows it, into `graphics`, cleared first: the crest's
 * light fading down into the ground over a few rows from the cover row, then
 * the blades along it at the view's heading, so a turn slides them as it does
 * the hills.
 */
export function drawBrow(
  graphics: Phaser.GameObjects.Graphics,
  blades: readonly BrowBlade[],
  view: View,
): void {
  graphics.clear();
  const reach = seamReach(view);
  const top = coverRow(view);
  const step = (reach * CREST_DEPTH) / CREST_ROWS;
  const { width, height, groundTop } = view;
  for (let row = 0; row < CREST_ROWS; row++) {
    const y = top + row * step;
    const under = groundAt((y - groundTop) / (height - groundTop));
    graphics.fillStyle(mix(BROW.crest, under, row / CREST_ROWS));
    graphics.fillRect(0, y, width, step + 0.5);
  }
  for (const { x, root, half, tip, lit } of browShown(view, blades)) {
    graphics.fillStyle(lit ? BROW.bladeLit : BROW.blade);
    graphics.fillTriangle(x - half, root, x + half, root, tip.x, tip.y);
  }
}
