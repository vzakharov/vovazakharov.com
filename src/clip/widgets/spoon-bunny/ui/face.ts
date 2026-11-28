import {
  at,
  ellipse,
  ink,
  limb,
  noise,
  type Path,
  path,
  type Pen,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import { ear, PAPER_EDGE, SPOON_HEAD_D } from './back';
import { SPOON_PALETTE } from './palette-spoon';

const HEAD = path(SPOON_HEAD_D);
const EYE_X = 36;
const EYE_Y = -5;
const BUTTON = ellipse([0, 0], 17);
const BUTTON_HOLES: readonly Point[] = [
  [-5, -5],
  [5, -5],
  [-5, 5],
  [5, 5],
];

/** The mouth torn open past its stitches: a ragged hole from cheek to cheek. */
const TORN: readonly Point[] = [
  [-62, 40],
  [-44, 30],
  [-30, 38],
  [-14, 28],
  [0, 36],
  [14, 27],
  [30, 37],
  [46, 29],
  [64, 42],
  [58, 64],
  [50, 88],
  [30, 104],
  [10, 100],
  [-8, 108],
  [-30, 100],
  [-50, 86],
  [-58, 62],
];
const MOUTH = polygon(TORN);
/** Where the nerve leaves the mouth, between the lower teeth. */
export const NERVE_ROOT: Point = [12, 94];
/** How far below its root the eye hangs. */
const NERVE_LENGTH = 104;
const EYEBALL = 31;

/** A blot round `centre`: its edge pushed in and out at random, as blood dries. */
function blot(
  centre: Point,
  rx: number,
  ry: number,
  ragged: number,
  seed: number,
): Path {
  const points: Point[] = [];
  const count = 22;
  for (let k = 0; k < count; k += 1) {
    const angle = (k / count) * Math.PI * 2;
    const push = 1 + ragged * noise(seed, k) * (k % 2 === 0 ? 1 : 0.4);
    points.push([
      centre[0] + Math.cos(angle) * rx * push,
      centre[1] + Math.sin(angle) * ry * push,
    ]);
  }
  return polygon(points);
}

// The blood round the mouth: a dark stain, a wet one over it, and flecks
// thrown across the face.
const SMEAR = blot([2, 70], 80, 50, 0.32, 701);
const WET = blot([0, 72], 68, 40, 0.22, 702);
const FLECKS: readonly Point[] = Array.from({ length: 16 }, (_, k) => [
  noise(703, k) * 82,
  64 + noise(704, k) * 40 + Math.abs(noise(705, k)) * 20,
]);
// Runs of blood off the chin, each `[x, length]`.
const RUNS: readonly Point[] = [
  [-40, 34],
  [-14, 62],
  [22, 26],
  [44, 48],
];

/** A row of teeth along `from`→`to`, each `size` long, pointing `down` or up. */
function teethRow(
  pen: Pen,
  from: Point,
  to: Point,
  count: number,
  size: number,
  down: boolean,
  seed: number,
): void {
  const sign = down ? 1 : -1;
  for (let k = 0; k < count; k += 1) {
    const a = k / count;
    const b = (k + 1) / count;
    const x0 = from[0] + (to[0] - from[0]) * a;
    const x1 = from[0] + (to[0] - from[0]) * b;
    const y0 = from[1] + (to[1] - from[1]) * a;
    const y1 = from[1] + (to[1] - from[1]) * b;
    const length = size * (0.7 + 0.5 * Math.abs(noise(seed, k)));
    const tip: Point = [
      (x0 + x1) / 2 + noise(seed, k + 50) * 3,
      (y0 + y1) / 2 + sign * length,
    ];
    ink(pen, polygon([[x0, y0], [x1, y1], tip]), {
      fill: SPOON_PALETTE.tooth,
      width: 2.5,
      seed: seed + k,
    });
    // Blood down every other one, from the gum.
    if (k % 2 === 0) {
      const stain: Point = [(x0 + x1) / 2, (y0 + y1) / 2 + sign * length * 0.6];
      ink(pen, polygon([[x0 + 1, y0], [x1 - 1, y1], stain]), {
        fill: SPOON_PALETTE.blood,
        stroke: null,
        alpha: 0.75,
        seed: seed + k + 100,
      });
    }
  }
}

/** The two front teeth, a rabbit's, long and red to the gum. */
function incisors(pen: Pen, seed: number): void {
  for (const side of [-1, 1]) {
    const x = side * 10;
    const shape = polygon([
      [x - 10, 30],
      [x + 10, 30],
      [x + 9, 72],
      [x - 9, 70],
    ]);
    ink(pen, shape, { fill: SPOON_PALETTE.tooth, width: 3, seed: seed + side });
    ink(
      pen,
      polygon([
        [x - 9, 31],
        [x + 9, 31],
        [x + 8, 50 + side * 6],
        [x + 2, 58],
        [x - 8, 46],
      ]),
      {
        fill: SPOON_PALETTE.blood,
        stroke: null,
        alpha: 0.85,
        seed: seed + side + 5,
      },
    );
  }
}

/** The broken stitches, threads hanging off both corners of the torn mouth. */
function threads(pen: Pen, seed: number): void {
  const ends: ReadonlyArray<[Point, Point]> = [
    [
      [-62, 40],
      [-70, 62],
    ],
    [
      [-56, 50],
      [-60, 74],
    ],
    [
      [64, 42],
      [74, 66],
    ],
    [
      [58, 54],
      [62, 80],
    ],
  ];
  for (const [n, [from, to]] of ends.entries()) {
    ink(pen, polygon([from, to], 'open'), {
      stroke: SPOON_PALETTE.thread,
      width: 2.5,
      seed: seed + n,
    });
  }
}

function buttonEye(pen: Pen, place: Point, rot: number, seed: number): void {
  at(pen, { x: place[0], y: place[1], rot }, () => {
    ink(pen, BUTTON, { fill: SPOON_PALETTE.button, width: 4, seed });
    const { ctx } = pen;
    ctx.fillStyle = SPOON_PALETTE.thread;
    for (const [hx, hy] of BUTTON_HOLES) {
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** The eye at the nerve's end, looking back up at whoever came so close. */
function eyeball(pen: Pen, centre: Point, swing: number, seed: number): void {
  const [x, y] = centre;
  // Torn flesh where the nerve meets it, on its upper side.
  ink(pen, ellipse([x - swing * 18, y - 24], 14, 9), {
    fill: SPOON_PALETTE.bloodDark,
    width: 3,
    seed: seed + 1,
  });
  ink(pen, ellipse(centre, EYEBALL), {
    fill: SPOON_PALETTE.eyeWhite,
    width: 4,
    seed,
  });
  ink(pen, ellipse([x + 9, y + 10], EYEBALL - 10, EYEBALL - 14), {
    fill: SPOON_PALETTE.eyeShade,
    stroke: null,
    alpha: 0.6,
    seed: seed + 2,
  });
  for (let k = 0; k < 6; k += 1) {
    const angle = (k / 6) * Math.PI * 2 + noise(seed, k);
    const from: Point = [x + Math.cos(angle) * 29, y + Math.sin(angle) * 29];
    const bend: Point = [
      x + Math.cos(angle + 0.3) * 20,
      y + Math.sin(angle + 0.3) * 20,
    ];
    const to: Point = [x + Math.cos(angle) * 15, y + Math.sin(angle) * 15];
    ink(pen, polygon([from, bend, to], 'open'), {
      stroke: SPOON_PALETTE.vein,
      width: 1.8,
      seed: seed + 10 + k,
    });
  }
  // The iris rolls against the swing, so the eye keeps finding the camera.
  const iris: Point = [x - swing * 10 - 2, y - 7];
  ink(pen, ellipse(iris, 14), {
    fill: SPOON_PALETTE.iris,
    stroke: SPOON_PALETTE.irisRim,
    width: 3,
    seed: seed + 3,
  });
  ink(pen, ellipse(iris, 6.5), {
    fill: SPOON_PALETTE.button,
    stroke: null,
    seed: seed + 4,
  });
  ink(pen, ellipse([iris[0] - 4, iris[1] - 5], 3), {
    fill: SPOON_PALETTE.eyeWhite,
    stroke: null,
    seed: seed + 5,
  });
}

/**
 * Where the hanging eye is when it swings `swing` radians off straight
 * down, and the nerve's sag between it and the mouth.
 */
function hanging(swing: number): { eye: Point; sag: Point } {
  const [rx, ry] = NERVE_ROOT;
  const eye: Point = [
    rx + Math.sin(swing) * NERVE_LENGTH,
    ry + Math.cos(swing) * NERVE_LENGTH,
  ];
  const sag: Point = [
    rx + Math.sin(swing * 0.6) * NERVE_LENGTH * 0.5 - swing * 10,
    ry + NERVE_LENGTH * 0.5,
  ];
  return { eye, sag };
}

/** Blood running off the chin, `drip` 0 to 1 through a drop forming and falling. */
function runs(pen: Pen, drip: number, seed: number): void {
  for (const [n, [x, length]] of RUNS.entries()) {
    // Thin down the chin, swelling to a bead at its end.
    const run: Path = [
      { kind: 'M', points: [[x - 4, 96]] },
      { kind: 'L', points: [[x - 1.5, 100 + length]] },
      { kind: 'L', points: [[x + 1.5, 100 + length]] },
      { kind: 'L', points: [[x + 4, 96]] },
      { kind: 'Z', points: [] },
    ];
    ink(pen, run, { fill: SPOON_PALETTE.blood, stroke: null, seed: seed + n });
    ink(pen, ellipse([x, 102 + length], 4.5, 5.5), {
      fill: SPOON_PALETTE.blood,
      stroke: null,
      seed: seed + n + 20,
    });
    const fall = (drip + n * 0.37) % 1;
    const y = 108 + length + fall * fall * 160;
    ink(pen, ellipse([x, y], 3.5, 5 + fall * 3), {
      fill: SPOON_PALETTE.blood,
      stroke: null,
      seed: seed + n + 10,
    });
  }
}

/** What the head's front shows: the swing of the hanging eye and how far a drop has run. */
export type Reveal = { swing: number; drip: number };

/**
 * The face it turns round with: the stitched grin torn open on bloody teeth
 * and, hanging from the mouth by its nerve, a human eye. Drawn about the
 * head's centre in the bunny's units.
 */
export function headFront(
  pen: Pen,
  { swing, drip }: Reveal,
  seed: number,
): void {
  const paper = { fill: SPOON_PALETTE.paperFront, width: PAPER_EDGE, seed };
  for (const side of [-1, 1]) {
    const bend = side * 30;
    ink(pen, ear(side, bend), paper);
    ink(
      pen,
      path(
        `M ${side * 34},-79 C ${side * 26},-159 ${side * 34},-239 ${side * 44 + bend * 0.8},-281`,
      ),
      { stroke: SPOON_PALETTE.pink, width: 9, seed },
    );
  }
  ink(pen, HEAD, paper);
  ink(pen, SMEAR, {
    fill: SPOON_PALETTE.bloodDark,
    stroke: null,
    alpha: 0.9,
    seed: seed + 1,
  });
  ink(pen, WET, { fill: SPOON_PALETTE.blood, stroke: null, seed: seed + 2 });
  for (const [n, fleck] of FLECKS.entries()) {
    ink(pen, ellipse(fleck, 2 + Math.abs(noise(seed, n)) * 4), {
      fill: SPOON_PALETTE.blood,
      stroke: null,
      seed: seed + 200 + n,
    });
  }
  runs(pen, drip, seed + 3);
  buttonEye(pen, [-EYE_X, EYE_Y], 0, seed + 20);
  // The other button hangs loose on its thread, turned.
  ink(
    pen,
    polygon(
      [
        [EYE_X, EYE_Y],
        [EYE_X + 6, EYE_Y + 16],
      ],
      'open',
    ),
    {
      stroke: SPOON_PALETTE.thread,
      width: 2.5,
      seed: seed + 21,
    },
  );
  buttonEye(pen, [EYE_X + 6, EYE_Y + 20], 28, seed + 22);
  ink(
    pen,
    polygon([
      [-8, 15],
      [8, 15],
      [0, 25],
    ]),
    {
      fill: SPOON_PALETTE.pink,
      width: 3,
      seed: seed + 23,
    },
  );
  ink(pen, MOUTH, { fill: SPOON_PALETTE.mouth, width: 5, seed: seed + 30 });
  ink(pen, path('M -50,40 C -20,30 20,30 52,38'), {
    stroke: SPOON_PALETTE.gum,
    width: 7,
    seed: seed + 31,
  });
  teethRow(pen, [-56, 42], [-20, 32], 3, 14, true, seed + 40);
  teethRow(pen, [20, 31], [58, 44], 3, 14, true, seed + 50);
  teethRow(pen, [-50, 88], [48, 90], 7, 18, false, seed + 60);
  incisors(pen, seed + 70);
  threads(pen, seed + 80);
  const { eye, sag } = hanging(swing);
  limb(pen, [NERVE_ROOT, sag, eye], SPOON_PALETTE.nerve, 8, seed + 90);
  eyeball(pen, eye, swing, seed + 100);
}
