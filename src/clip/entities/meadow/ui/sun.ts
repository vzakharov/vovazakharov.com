import {
  at,
  ellipse,
  type Figure,
  ink,
  type Path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import { MEADOW_PALETTE } from './palette-meadow';

/** How the sun is drawn: where, where it looks, and how wide it smiles. */
export type Sun = Figure & {
  /** Where its eyes look, each axis -1 to 1; straight out by default. */
  gaze?: Point;
  /** 0 a polite line, 1 a grin past its cheeks; 0.6 by default. */
  smile?: number;
  /** How far it bobs, in its own units; 0 holds it still. 8 by default. */
  bob?: number;
};

// The sun is drawn in its own units: the disc 100 across, centred on its place.
const RAYS = 14;
const DISC = ellipse([0, 0], 50);
const FACE = ellipse([0, 4], 40);
const EYE = ellipse([0, 0], 8, 10);
const PUPIL = ellipse([0, 0], 4.5);
const CHEEK = ellipse([0, 0], 8, 5);
const EYE_X = 15;
const EYE_Y = -6;

/** A star of `RAYS` cardboard points, cut with scissors, round the disc. */
const RAY_RING: Path = polygon(
  Array.from({ length: RAYS * 2 }, (_, n): Point => {
    const angle = (n / (RAYS * 2)) * Math.PI * 2;
    const reach = n % 2 === 0 ? 78 : 50;
    return [Math.cos(angle) * reach, Math.sin(angle) * reach];
  }),
  'closed',
);

function smileFor(smile: number): Path {
  const half = 12 + 12 * smile;
  const top = 16 - 2 * smile;
  const dip = 4 + 16 * smile;
  return [
    { kind: 'M', points: [[-half, top]] },
    {
      kind: 'Q',
      points: [
        [0, top + dip * 2],
        [half, top],
      ],
    },
    ...(smile > 0.5
      ? ([
          {
            kind: 'Q',
            points: [
              [0, top + dip * 0.6],
              [-half, top],
            ],
          },
          { kind: 'Z', points: [] },
        ] as const)
      : []),
  ];
}

/**
 * A cardboard sun with a face, the kind on a stick in a kids' show: its rays
 * turn slowly, it bobs, and its eyes follow `gaze`. Its place is its centre;
 * at scale 1 it is 156 across, rays and all.
 */
export function cardboardSun(pen: Pen, sun: Sun = {}): void {
  const {
    gaze = [0, 0],
    smile = 0.6,
    bob = 8,
    seed = 0,
    x = 0,
    y = 0,
    scale = 1,
    rot = 0,
    flip = false,
  } = sun;
  const { playhead } = pen;
  const lift = Math.sin(playhead * Math.PI * 1.2) * bob;
  const [gx, gy] = gaze;
  at(pen, { x, y: y + lift * scale, scale, rot, flip }, () => {
    at(pen, { rot: playhead * 6 }, () => {
      ink(pen, RAY_RING, { fill: MEADOW_PALETTE.sunRays, width: 4, seed });
    });
    ink(pen, DISC, { fill: MEADOW_PALETTE.sun, width: 4, seed });
    ink(pen, FACE, { fill: MEADOW_PALETTE.sunFace, stroke: null, seed });
    for (const side of [-1, 1]) {
      at(pen, { x: side * EYE_X, y: EYE_Y }, () => {
        ink(pen, EYE, { fill: MEADOW_PALETTE.eyeWhite, width: 2.5, seed });
        at(pen, { x: gx * 3.5, y: gy * 4.5 }, () => {
          ink(pen, PUPIL, { fill: MEADOW_PALETTE.pupil, stroke: null, seed });
        });
      });
      at(pen, { x: side * 26, y: 12 }, () => {
        ink(pen, CHEEK, {
          fill: MEADOW_PALETTE.cheek,
          stroke: null,
          alpha: 0.7,
          seed,
        });
      });
    }
    // Past halfway the smile opens, showing its inside.
    const open = smile > 0.5 ? { fill: MEADOW_PALETTE.cheek } : {};
    ink(pen, smileFor(smile), { ...open, width: 3, seed });
  });
}
