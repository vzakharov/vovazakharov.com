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
import { between, mulberry32, type Random } from '../../model/random';
import { BROW, groundAt } from './backdrop-tones';
import { mix } from './colour';
import { screenAt } from './panorama';
import { seamReach } from './skyline';
import { coverRow, type View } from './view';

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
/**
 * The tallest a blade stands, in the seam's reach: never so tall that its tip
 * reaches the ground's top row, where a thing crossing `D_SEE` has its foot,
 * so nothing goes behind the blades at once.
 */
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
 * The brow's blades round the whole panorama for `camera`, clump by clump
 * from due behind, each at a fixed azimuth, so a heading always faces the
 * same clumps; the same camera grows the same blades.
 */
export function browBlades(camera: Camera): BrowBlade[] {
  const random = mulberry32(BROW_SEED);
  const { focal } = pinholeOf(camera);
  const reach = seamReach(camera);
  /** A length in the seam's reach as the azimuth it spans at the screen's middle. */
  const turn = (share: number): number => (share * reach) / focal;
  const least = LEAST_SPACING / focal;
  const blades: BrowBlade[] = [];
  const gap = (): number => {
    const [shortest, longest] = CLUMP_GAP;
    return turn(shortest + (longest - shortest) * random() ** 2);
  };
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
  const [fewest, most] = CLUMP_BLADES;
  const count = Math.round(fewest + (most - fewest) * random() ** 1.5);
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
