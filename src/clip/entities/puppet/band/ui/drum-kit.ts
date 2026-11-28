import {
  at,
  ellipse,
  ink,
  INK_PALETTE,
  limb,
  type Path,
  path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import { KIT } from '../model/band';
import type { Drumming } from '../model/playing';
import { INSTRUMENT_PALETTE } from './palette-instruments';

/**
 * The kit in `KIT`'s units, the floor under its middle at the origin. Every
 * drum is off the ward: enamel pots turned over for the snare and the tom, the
 * biggest one on its side for the kick, kidney dishes for a hi-hat, and a
 * bedpan for a crash, hung off a drip stand.
 */

/**
 * An enamel pot turned bottom up on three legs: its skin at the origin, `rx`
 * across, the pot `depth` deep, the floor `height` below the skin.
 */
const pot = (rx: number, depth: number, height: number) => ({
  side: path(
    `M ${-rx},0 L ${-rx * 0.94},${depth} Q 0,${depth + rx * 0.34} ${rx * 0.94},${depth} L ${rx},0 Z`,
  ),
  skin: ellipse([0, 0], rx, rx * 0.3),
  rim: path(
    `M ${-rx * 0.95},${depth - 6} Q 0,${depth + rx * 0.3 - 6} ${rx * 0.95},${depth - 6}`,
  ),
  handles: path(
    `M ${-rx * 0.95},${depth - 22} C ${-rx - 24},${depth - 26} ${-rx - 24},${depth - 4} ${-rx * 0.94},${depth - 8} M ${rx * 0.95},${depth - 22} C ${rx + 24},${depth - 26} ${rx + 24},${depth - 4} ${rx * 0.94},${depth - 8}`,
  ),
  dots: [
    [-rx * 0.55, depth * 0.45],
    [-rx * 0.1, depth * 0.62],
    [rx * 0.4, depth * 0.48],
    [rx * 0.7, depth * 0.3],
    [-rx * 0.8, depth * 0.2],
  ] satisfies Point[],
  legs: path(
    `M ${-rx * 0.5},${depth} L ${-rx * 0.8},${height} M ${rx * 0.5},${depth} L ${rx * 0.8},${height} M 0,${depth + 10} L 0,${height}`,
  ),
});

const SNARE = pot(58, 62, -KIT.snare[1]);
const TOM = pot(66, 84, -KIT.tom[1]);

const KICK_RIM = ellipse([16, 0], KIT.kickRadius);
const KICK_FACE = ellipse([0, 0], KIT.kickRadius);
const KICK_RING = ellipse([0, 0], KIT.kickRadius * 0.84);
const KICK_CROSS = path(
  'M -12,-38 L 12,-38 L 12,-12 L 38,-12 L 38,12 L 12,12 L 12,38 L -12,38 L -12,12 L -38,12 L -38,-12 L -12,-12 Z',
);
const KICK_CHIPS = path(
  'M -60,30 L -50,24 L -46,36 L -56,40 Z M 44,-56 L 54,-52 L 50,-42 Z M 30,58 L 42,54 L 40,64 Z',
);

const DISH = path(
  'M -54,0 C -54,-17 -22,-20 0,-11 C 22,-20 54,-17 54,0 C 54,15 -54,15 -54,0 Z',
);
const BEDPAN = path(
  'M -64,0 C -64,-23 -20,-29 20,-25 C 44,-23 60,-15 86,-11 L 100,-5 L 100,7 L 86,11 C 60,17 44,23 20,25 C -20,29 -64,23 -64,0 Z',
);
const BEDPAN_HOLE = ellipse([-10, 0], 38, 13);
const DRIP_BAG = path('M -13,0 L 13,0 L 15,34 C 15,46 -15,46 -15,34 Z');
const DRIP_FLUID = path('M -14,18 L 14,18 L 15,34 C 15,46 -15,46 -15,34 Z');
const DRIP_TUBE = path('M 0,44 C 0,80 -22,90 -16,130');

const enamel = { fill: INSTRUMENT_PALETTE.enamel };

function drawPot(
  pen: Pen,
  shapes: ReturnType<typeof pot>,
  centre: Point,
  hit: number,
  seed: number,
): void {
  at(pen, { x: centre[0], y: centre[1] }, () => {
    ink(pen, shapes.legs, { width: 7, seed });
  });
  at(pen, { x: centre[0], y: centre[1] + 7 * hit }, () => {
    ink(pen, shapes.handles, { width: 11, seed: seed + 1 });
    ink(pen, shapes.handles, {
      stroke: INSTRUMENT_PALETTE.enamelRim,
      width: 5,
      seed: seed + 1,
    });
    ink(pen, shapes.side, { ...enamel, seed: seed + 2 });
    ink(pen, shapes.rim, {
      stroke: INSTRUMENT_PALETTE.enamelRim,
      width: 5,
      seed: seed + 3,
    });
    for (const [n, dot] of shapes.dots.entries()) {
      ink(pen, ellipse(dot, 7), {
        fill:
          n % 2 === 0 ? INSTRUMENT_PALETTE.cross : INSTRUMENT_PALETTE.enamelRim,
        width: 2.5,
        seed: seed + 4 + n,
      });
    }
    ink(pen, shapes.skin, {
      fill: INSTRUMENT_PALETTE.enamelShade,
      seed: seed + 9,
    });
  });
}

/** A thing on a pole stood on the floor at `x`: the pole, its feet. */
function pole(pen: Pen, x: number, top: number, seed: number): void {
  ink(
    pen,
    polygon(
      [
        [x - 34, 0],
        [x, -16],
        [x + 34, 0],
      ],
      'open',
    ),
    { width: 8, seed },
  );
  limb(
    pen,
    [
      [x, -16],
      [x, top],
    ],
    INK_PALETTE.metal,
    5,
    seed + 1,
  );
}

type Hits = Drumming['hits'];

/** What stands behind and beside the drummer: the dishes, the pots, the drip stand. */
export function kitBehind(pen: Pen, hits: Hits, seed = 0): void {
  const [hatX, hatY] = KIT.hat;
  pole(pen, hatX, hatY, seed + 10);
  // The dishes clap shut on each stroke and drift apart after it.
  for (const [n, gap] of [10 * (1 - hits.hat) + 6, 0].entries()) {
    at(pen, { x: hatX, y: hatY - gap, rot: n === 0 ? -3 : 2 }, () => {
      ink(pen, DISH, { fill: INK_PALETTE.metalLight, seed: seed + 12 + n });
    });
  }

  const [crashX, crashY] = KIT.crash;
  const poleX = crashX + 30;
  pole(pen, poleX, crashY - 60, seed + 20);
  const hook: Path = polygon(
    [
      [poleX - 40, crashY - 44],
      [poleX - 40, crashY - 60],
      [poleX + 44, crashY - 60],
      [poleX + 44, crashY - 44],
    ],
    'open',
  );
  ink(pen, hook, { width: 6, seed: seed + 22 });
  at(pen, { x: poleX + 44, y: crashY - 44, rot: 4 * hits.crash }, () => {
    ink(pen, DRIP_TUBE, { width: 3, seed: seed + 23 });
    ink(pen, DRIP_BAG, { fill: INSTRUMENT_PALETTE.shine, width: 3.5 });
    ink(pen, DRIP_FLUID, {
      fill: INSTRUMENT_PALETTE.drip,
      stroke: null,
      alpha: 0.9,
    });
    ink(pen, DRIP_BAG, { width: 3.5, seed: seed + 24 });
  });
  const shake = 16 * hits.crash * Math.sin(pen.boil * 2.6);
  at(pen, { x: crashX, y: crashY, rot: -10 + shake }, () => {
    ink(pen, BEDPAN, { ...enamel, seed: seed + 25 });
    ink(pen, BEDPAN, {
      stroke: INSTRUMENT_PALETTE.enamelRim,
      width: 2,
      wobble: 0,
      alpha: 0.9,
    });
    ink(pen, BEDPAN_HOLE, {
      fill: INSTRUMENT_PALETTE.enamelShade,
      width: 3.5,
      seed: seed + 26,
    });
  });

  drawPot(pen, TOM, KIT.tom, 0, seed + 30);
  drawPot(pen, SNARE, KIT.snare, hits.snare, seed + 40);
}

/** What stands in front of the drummer: the kick, a pot on its side with a red cross. */
export function kitFront(pen: Pen, hits: Hits, seed = 0): void {
  const [x, y] = KIT.kick;
  at(pen, { x, y, scale: 1 + 0.05 * hits.kick }, () => {
    ink(pen, KICK_RIM, {
      fill: INSTRUMENT_PALETTE.enamelRim,
      seed: seed + 50,
    });
    ink(pen, KICK_FACE, { ...enamel, seed: seed + 51 });
    ink(pen, KICK_RING, {
      stroke: INSTRUMENT_PALETTE.enamelShade,
      width: 6,
      seed: seed + 52,
    });
    ink(pen, KICK_CROSS, {
      fill: INSTRUMENT_PALETTE.cross,
      width: 4,
      seed: seed + 53,
    });
    ink(pen, KICK_CHIPS, {
      fill: INSTRUMENT_PALETTE.chip,
      width: 2,
      seed: seed + 54,
    });
  });
}
