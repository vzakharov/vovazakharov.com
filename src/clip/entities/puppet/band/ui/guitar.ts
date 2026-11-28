import {
  ellipse,
  ink,
  type Path,
  path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import { GUITAR, type Strings } from '../model/band';
import { INSTRUMENT_PALETTE } from './palette-instruments';

const BODY = path(
  'M -70,-20 L -20,-62 L 30,-30 L 60,-44 L 54,40 L 10,34 L -30,70 L -84,44 Z',
);
const BODY_SHINE = path('M -20,-62 L 30,-30 L 60,-44 L 54,-10 L -50,-20 Z');
const PICKUPS = path(
  'M -14,-11 L 2,-11 L 2,11 L -14,11 Z M 14,-11 L 30,-11 L 30,11 L 14,11 Z M -48,-12 L -40,-12 L -40,12 L -48,12 Z',
);
const KNOBS: readonly Point[] = [
  [-52, 38],
  [-34, 50],
];

/** The neck, its frets and its headstock, for strings ending at `nut`. */
const neckOf = (nut: number) => ({
  neck: polygon([
    [40, -9],
    [nut, -8],
    [nut, 8],
    [40, 9],
  ]),
  frets: Array.from({ length: Math.floor((nut - 70) / 24) }, (_, n) =>
    polygon(
      [
        [nut - 12 - n * 24, -8],
        [nut - 12 - n * 24, 8],
      ],
      'open',
    ),
  ).flat(),
  headstock: polygon([
    [nut, -16],
    [nut + 40, -26],
    [nut + 46, 14],
    [nut, 20],
  ]),
  pegs: [
    [nut + 14, -12],
    [nut + 30, -14],
    [nut + 16, 10],
    [nut + 32, 8],
  ] satisfies Point[],
});

const NECKS = {
  guitar: neckOf(GUITAR.guitar.nut),
  bass: neckOf(GUITAR.bass.nut),
};

// Where each string crosses the neck: six would be a smudge at this size.
const STRING_ROWS: Record<Strings, readonly number[]> = {
  guitar: [-5, 0, 5],
  bass: [-4, 4],
};

/**
 * A guitar or a bass in its own units, the body's middle at the origin and
 * the neck out to the right; place, turn and size it with `at`. `ring` in
 * `[0, 1]` sets the strings shivering.
 */
export function guitar(pen: Pen, strings: Strings, ring = 0, seed = 0): void {
  const { bridge, nut } = GUITAR[strings];
  const { neck, frets, headstock, pegs } = NECKS[strings];
  const color = INSTRUMENT_PALETTE[strings];
  ink(pen, neck, { fill: INSTRUMENT_PALETTE.wood, width: 4, seed: seed + 1 });
  ink(pen, frets, { stroke: INSTRUMENT_PALETTE.string, width: 1.5, wobble: 0 });
  ink(pen, headstock, { fill: color, width: 4, seed: seed + 2 });
  for (const peg of pegs) {
    ink(pen, ellipse(peg, 3), { fill: INSTRUMENT_PALETTE.string, width: 2 });
  }
  ink(pen, BODY, { fill: color, seed: seed + 3 });
  ink(pen, BODY_SHINE, {
    fill: INSTRUMENT_PALETTE.shine,
    stroke: null,
    alpha: 0.25,
  });
  ink(pen, PICKUPS, { fill: INSTRUMENT_PALETTE.black, width: 2, wobble: 0.5 });
  for (const knob of KNOBS) {
    ink(pen, ellipse(knob, 5), { fill: INSTRUMENT_PALETTE.string, width: 2.5 });
  }
  for (const [n, row] of STRING_ROWS[strings].entries()) {
    // Each string bows about its middle, one against the next.
    const bow = ring * 4 * Math.sin(pen.boil * 2.1 + n * 2);
    const string: Path = [
      { kind: 'M', points: [[bridge, row]] },
      {
        kind: 'Q',
        points: [
          [(bridge + nut) / 2, row + bow],
          [nut, row * 0.8],
        ],
      },
    ];
    ink(pen, string, {
      stroke: INSTRUMENT_PALETTE.string,
      width: strings === 'bass' ? 2.4 : 1.6,
      wobble: 0,
    });
  }
}
