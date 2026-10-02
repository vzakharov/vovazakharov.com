/**
 * The meadow's brow: the ground rounding over its horizon along the `D_SEE`
 * circle round the eye (`browRow`), highest at the screen's middle and lower
 * toward its edges, under which a thing farther away sinks (`sunk`). The
 * ground is drawn on over everything that sinks from the brow down, a
 * lighter crest runs along it and a fringe of blades stands on it, so a far
 * thing goes down behind the brow foot first, as a ship goes under a small
 * planet's horizon, rather than burying itself in a flat field. Beyond the
 * brow, up to the hills, lies the far ground, under what sinks.
 */

import type * as Phaser from 'phaser';

import {
  type Leaning,
  type Point,
  sample,
  type Tall,
} from '../../model/geometry';
import { type Camera, pinholeOf } from '../../model/ground';
import {
  between,
  mulberry32,
  type Random,
  skewedBetween,
} from '../../model/random';
import { BROW, groundRowAt } from './backdrop-tones';
import { mix } from './colour';
import { type Azimuthed, screenAt } from './panorama';
import { hillBands, seamReach } from './skyline';
import { browLowest, browRow, type View } from './view';
import { deepestBob } from './walking';

/** The brow's own stream, so growing its blades draws nothing from the backdrop's. */
const BROW_SEED = 0xb7_0a;
/**
 * The fringe grows in clumps with bare brow between them, as a meadow's far
 * edge does, all measured in the seam's reach at the screen's middle: how many
 * blades a clump holds (most clumps small, a few broad), how far apart its
 * blades stand, and the bare stretch from one clump to the next (most short,
 * a few long).
 */
const CLUMP_BLADES = [3, 18] as const;
const CLUMP_SPACING = [0.07, 0.16] as const;
const CLUMP_GAP = [0.1, 1.7] as const;
/** The fewest CSS px between blades in a clump, so a short screen's brow does not turn to felt. */
const LEAST_SPACING = 1.4;
/**
 * How tall a clump's crown stands, in the seam's reach, and how much each
 * blade's height strays from the clump's shape either way; the clump's edge
 * blades stand at `CLUMP_EDGE` of its crown, so a clump rounds over.
 */
const CLUMP_TALL = [0.28, 0.6] as const;
const BLADE_STRAY = 0.3;
const CLUMP_EDGE = 0.45;
/** The share of clumps that hold a tuft, two blades standing well over the rest, and its height. */
const TUFT_SHARE = 0.2;
const TUFT_TALL = [0.82, 0.95] as const;
/** The tallest a blade stands, in the seam's reach. */
const TALLEST = 0.95;
/**
 * How far a blade's tip leans, in the seam's reach: a clump's own lean, each
 * blade's stray from it, and how far the clump's edge blades splay outward;
 * `BLADE_LEAN` bounds the sum.
 */
const CLUMP_LEAN = 0.12;
const LEAN_STRAY = 0.1;
const CLUMP_SPLAY = 0.16;
const BLADE_LEAN = 0.3;
/** Half a blade's width at its root, in the seam's reach, and the least in CSS px. */
const BLADE_HALF = 0.09;
const LEAST_HALF = 0.6;
/** How far below the brow a blade is rooted, in the seam's reach, so its root sits in the crest. */
const ROOT_DOWN = 0.1;
/** The share of blades lit at the tip, the rest dark. */
const LIT_SHARE = 0.35;
/** How far down from the brow the crest's light fades into the ground, in the seam's reach, and in how many rows. */
const CREST_DEPTH = 0.45;
const CREST_ROWS = 4;
/** The brow's points to a screen's width, and how far past either edge it runs, in CSS px. */
const BROW_STEPS = 48;
const BROW_MARGIN = 4;
/** How many rows the ground over what sinks is toned in, from the brow down to the ground's picture. */
const COVER_ROWS = 4;

/**
 * Where the ground's picture starts down the screen: below the brow
 * everywhere on it and below the seam's lowest point, so the picture covers
 * nothing that should show over the brow, and the brow's own ground covers
 * what sinks above it.
 */
export function browFloor(camera: Camera): number {
  return Math.max(camera.groundTop + seamReach(camera), browLowest(camera));
}

/** How far past the ground picture's top the near range's foot reaches below the deepest bob, in CSS px. */
const FOOT_OVERLAP = 2;

/**
 * How far down the near range's foot reaches: past the ground picture's top
 * (`browFloor`) bobbed at its deepest (`GROUND_BOB`), so no sliver of sky
 * shows under the ground or the brow mid-step.
 */
export function nearFoot(camera: Camera): number {
  return browFloor(camera) + deepestBob(camera.height) + FOOT_OVERLAP;
}

type WhetherLit = { lit: boolean };

/** One blade of the brow, its height and lean in shares of the seam's reach. */
export type BrowBlade = Azimuthed & Tall & Leaning & WhetherLit;

/**
 * The brow's blades round the whole panorama for `camera`, clump by clump
 * from due behind, each at a fixed azimuth, so a heading always faces the
 * same clumps; the same camera grows the same blades.
 */
export function browBlades(camera: Camera): BrowBlade[] {
  const random = mulberry32(BROW_SEED);
  const { arc } = pinholeOf(camera);
  const reach = seamReach(camera);
  /** A length in the seam's reach as the azimuth it spans at the screen's middle. */
  const turn = (share: number): number => (share * reach) / arc;
  const least = LEAST_SPACING / arc;
  const blades: BrowBlade[] = [];
  const gap = (): number => turn(skewedBetween(random, ...CLUMP_GAP, 2));
  let azimuth = -Math.PI + gap();
  while (azimuth < Math.PI) {
    const clump = clumpAt(random);
    const spacing = Math.max(least, turn(between(random, ...CLUMP_SPACING)));
    for (const blade of clump) {
      if (azimuth >= Math.PI) break;
      blades.push({ azimuth, ...blade });
      azimuth += spacing * between(random, 0.6, 1.4);
    }
    azimuth += gap();
  }
  return blades;
}

/**
 * One clump's blades left to right, without their azimuths: a rounded crown,
 * tallest about the middle, every blade straying from it, the edges splayed
 * outward, and now and then a tuft over the rest.
 */
function clumpAt(random: Random): Array<Omit<BrowBlade, 'azimuth'>> {
  const count = Math.round(skewedBetween(random, ...CLUMP_BLADES, 1.5));
  const crown = between(random, ...CLUMP_TALL);
  const lean = between(random, -CLUMP_LEAN, CLUMP_LEAN);
  // The first of the tuft's two blades, or none.
  const tuft = random() < TUFT_SHARE ? Math.floor(random() * (count - 1)) : -2;
  return Array.from({ length: count }, (_, index) => {
    // Where the blade stands across its clump, from −1 at the left edge to 1 at the right.
    const across = count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
    const shape = 1 - (1 - CLUMP_EDGE) * across ** 2;
    const tall =
      index === tuft || index === tuft + 1
        ? between(random, ...TUFT_TALL)
        : crown * shape * between(random, 1 - BLADE_STRAY, 1 + BLADE_STRAY);
    const tilt =
      lean + across * CLUMP_SPLAY + between(random, -LEAN_STRAY, LEAN_STRAY);
    return {
      tall: Math.min(TALLEST, tall),
      lean: Math.max(-BLADE_LEAN, Math.min(BLADE_LEAN, tilt)),
      lit: random() < LIT_SHARE,
    };
  });
}

/** A blade as a view draws it, in CSS px: its root's middle, its half width there, and its tip. */
export type ShownBlade = Pick<Point, 'x'> &
  WhetherLit & {
    root: number;
    half: number;
    tip: Point;
  };

/** The blades of `blades` that `view`'s screen shows, each where it stands across it at the heading. */
export function browShown(
  view: View,
  blades: readonly BrowBlade[],
): ShownBlade[] {
  const reach = seamReach(view);
  const half = Math.max(LEAST_HALF, reach * BLADE_HALF);
  return blades.flatMap(({ azimuth, tall, lean, lit }) => {
    const x = screenAt(view, azimuth);
    const overhang = reach * (BLADE_LEAN + BLADE_HALF);
    if (x < -overhang || x > view.width + overhang) {
      return [];
    }
    const root = browRow(view, x) + reach * ROOT_DOWN;
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

/** `points`' outline, filled, from plain points (`fillShape` needs Phaser's vectors, and so Phaser loaded). */
function fillPolygon(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
): void {
  const [first, ...rest] = points;
  if (!first) return;
  graphics.beginPath();
  graphics.moveTo(first.x, first.y);
  for (const { x, y } of rest) graphics.lineTo(x, y);
  graphics.closePath();
  graphics.fillPath();
}

/** The brow across `view`'s screen, a little past either edge. */
function browLine(view: View): Point[] {
  return sample(-BROW_MARGIN, view.width + BROW_MARGIN, BROW_STEPS, (x) => ({
    x,
    y: browRow(view, x),
  }));
}

/**
 * The brow as `view` shows it, into `graphics`, cleared first: the ground
 * from the brow down to where the ground's picture starts (`browFloor`), in
 * the picture's own tones, over whatever sinks; the crest's light along the
 * brow, fading down into the ground over a few rows; then the blades along
 * it at the view's heading, so a turn slides them as it does the hills.
 */
export function drawBrow(
  graphics: Phaser.GameObjects.Graphics,
  blades: readonly BrowBlade[],
  view: View,
): void {
  graphics.clear();
  const reach = seamReach(view);
  const line = browLine(view);
  const floor = browFloor(view);
  const top = Math.min(...line.map(({ y }) => y));
  const tall = (floor - top) / COVER_ROWS;
  for (const [row, { outline }] of hillBands(
    line,
    floor,
    COVER_ROWS,
  ).entries()) {
    graphics.fillStyle(groundRowAt(view, top + (row + 0.5) * tall));
    fillPolygon(graphics, outline);
  }
  const step = (reach * CREST_DEPTH) / CREST_ROWS;
  const shifted = (by: number) => line.map(({ x, y }) => ({ x, y: y + by }));
  for (let row = 0; row < CREST_ROWS; row++) {
    const under = groundRowAt(view, view.groundTop + row * step);
    graphics.fillStyle(mix(BROW.crest, under, row / CREST_ROWS));
    fillPolygon(graphics, [
      ...shifted(row * step),
      ...shifted((row + 1) * step + 0.5).toReversed(),
    ]);
  }
  for (const { x, root, half, tip, lit } of browShown(view, blades)) {
    graphics.fillStyle(lit ? BROW.bladeLit : BROW.blade);
    graphics.fillTriangle(x - half, root, x + half, root, tip.x, tip.y);
  }
}
