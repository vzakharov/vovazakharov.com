import type { Point, Polyline } from '@/cube/shared/lettering';

import {
  around,
  blob,
  curve,
  lettered,
  oval,
  path,
  polygon,
  wave,
  WHOLE_TURN,
} from './shapes';

export const RIBOSOME: Polyline[] = [
  blob(
    [0.1, 0.5],
    [0.05, 0.9],
    [0.5, 1.02],
    [0.9, 0.9],
    [0.86, 0.5],
    [0.5, 0.4],
  ),
  blob([0.14, 0.32], [0.12, 0.06], [0.5, -0.02], [0.82, 0.08], [0.8, 0.32]),
  wave([-0.8, 0.38], [1.7, 0.38], 9, 0.025),
  curve([0.5, 0.56], [0.44, 0.8], [0.6, 0.9], [0.56, 1.1], [0.7, 1.3]),
];

export const ANTIBODY: Polyline[] = [
  path([0.45, 0], [0.45, 0.45], [0.1, 0.95]),
  path([0.55, 0], [0.55, 0.45], [0.9, 0.95]),
  path([0.33, 0.5], [0.02, 0.9]),
  path([0.67, 0.5], [0.98, 0.9]),
  path([0.45, 0.4], [0.55, 0.4]),
  path([0.45, 0.33], [0.55, 0.33]),
  path([0.28, 0.69], [0.21, 0.65]),
  path([0.72, 0.69], [0.79, 0.65]),
];

/** One folded chain: a lump with its helices and the haem it holds. */
const globin = (cx: number, cy: number, turn: number): Polyline[] => [
  blob(
    around(cx, cy, 0.25, turn),
    around(cx, cy, 0.29, turn + 0.2),
    around(cx, cy, 0.24, turn + 0.42),
    around(cx, cy, 0.3, turn + 0.62),
    around(cx, cy, 0.25, turn + 0.82),
  ),
  wave(
    around(cx, cy, 0.16, turn + 0.1),
    around(cx, cy, 0.16, turn + 0.4),
    4,
    0.02,
  ),
  wave(
    around(cx, cy, 0.14, turn + 0.6),
    around(cx, cy, 0.17, turn + 0.9),
    4,
    0.02,
  ),
  polygon(cx, cy, 0.04, 4, turn),
];

export const HAEMOGLOBIN: Polyline[] = [
  ...globin(0.29, 0.71, 0.1),
  ...globin(0.71, 0.71, 0.35),
  ...globin(0.29, 0.29, 0.6),
  ...globin(0.71, 0.29, 0.85),
];

/** Half the helix's width in units of its pitch: 2 nm across, 3.4 nm a turn. */
const HALF_WIDE = 1 / 3.4;

/** Where a strand `phase` of a turn round the helix is, `x` along it. */
const strandAt = (x: number, phase: number): Point => [
  x,
  HALF_WIDE * (1 + Math.cos((x + phase) * WHOLE_TURN)),
];

/** Four turns of the double helix, lying on its side; the unit is one turn. */
export const DNA: Polyline[] = [
  ...[0, 0.4].map((phase) =>
    Array.from({ length: 129 }, (_, step) => strandAt(step / 32 - 1.5, phase)),
  ),
  ...Array.from({ length: 40 }, (_, rung): Polyline => {
    const x = (rung + 0.5) / 10 - 1.5;
    return [strandAt(x, 0), strandAt(x, 0.4)];
  }),
];

/** A ball-and-stick bond from `a` to `b`, stopping short of both balls. */
const bond = (a: Point, b: Point, ball = 0.05): Polyline => {
  const long = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [ux, uy] = [(b[0] - a[0]) / long, (b[1] - a[1]) / long];
  return [
    [a[0] + ux * ball, a[1] + uy * ball],
    [b[0] - ux * ball, b[1] - uy * ball],
  ];
};

const RING = [0, 1, 2, 3, 4, 5].map((corner) =>
  around(0.5, 0.5, 0.27, corner / 6),
);

/** A glucose ring: six atoms, one of them the oxygen, and what hangs off them. */
export const GLUCOSE: Polyline[] = [
  ...RING.flatMap((atom, corner) => {
    const next = RING[(corner + 1) % 6] ?? atom;
    const out = around(0.5, 0.5, 0.45, corner / 6 + 0.02);
    return [
      oval(...atom, 0.05),
      bond(atom, next),
      // Corner 1 is the ring's oxygen, which carries nothing.
      ...(corner === 1 ? [] : [bond(atom, out, 0.045), oval(...out, 0.04)]),
    ];
  }),
  ...lettered('O', 0.6, 0.78, 0.07),
];

export const BUCKYBALL: Polyline[] = [
  oval(0.5, 0.5, 0.5),
  polygon(0.5, 0.5, 0.17, 5, 0.25),
  ...[0, 1, 2, 3, 4].flatMap((corner) => {
    const at = 0.25 + corner / 5;
    const fork = around(0.5, 0.5, 0.31, at);
    const left = around(0.5, 0.5, 0.42, at + 0.055);
    const right = around(0.5, 0.5, 0.42, at - 0.055);
    return [
      path(around(0.5, 0.5, 0.17, at), fork),
      path(left, fork, right),
      path(left, around(0.5, 0.5, 0.42, at + 0.145)),
      path(left, around(0.5, 0.5, 0.5, at + 0.07)),
      path(right, around(0.5, 0.5, 0.5, at - 0.07)),
    ];
  }),
];

export const WATER: Polyline[] = [
  oval(0.5, 0.42, 0.3),
  oval(0.2, 0.68, 0.19),
  oval(0.8, 0.68, 0.19),
  ...lettered('O', 0.45, 0.36, 0.12),
  ...lettered('H', 0.16, 0.63, 0.1),
  ...lettered('H', 0.76, 0.63, 0.1),
];
