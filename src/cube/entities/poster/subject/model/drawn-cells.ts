import type { Polyline } from '@/cube/shared/lettering';

import {
  arc,
  around,
  blob,
  curve,
  oval,
  path,
  polygon,
  rays,
  scatter,
  speck,
  TURN,
  wave,
} from './shapes';

/** A closed outline round a centre whose radius swells `lumps` times a turn. */
const lumpy = (
  cx: number,
  cy: number,
  radius: number,
  lumps: number,
  swell: number,
): Polyline =>
  Array.from({ length: 73 }, (_, step) => {
    const at = step / 72;
    const out = radius * (1 + swell * Math.sin(at * lumps * TURN));
    return around(cx, cy, out, at);
  });

export const PARAMECIUM: Polyline[] = [
  blob([0, 0.2], [0.2, 0.4], [0.7, 0.38], [1, 0.22], [0.8, 0.02], [0.25, 0]),
  ...arc(0.5, 0.2, 0.47, 0.18, 0, 1).map((root, tick) =>
    path(root, arc(0.5, 0.2, 0.53, 0.24, 0, 1)[tick] ?? root),
  ),
  oval(0.55, 0.2, 0.12, 0.07),
  oval(0.66, 0.26, 0.03),
  curve([0.42, 0.34], [0.36, 0.2], [0.44, 0.12]),
  ...rays(0.2, 0.2, 0.02, 0.06, 6),
  ...rays(0.84, 0.18, 0.02, 0.06, 6),
];

export const EGG_CELL: Polyline[] = [
  oval(0.5, 0.5, 0.38),
  oval(0.5, 0.5, 0.43),
  ...rays(0.5, 0.5, 0.45, 0.5, 44),
  oval(0.56, 0.55, 0.1),
  speck(0.58, 0.56),
];

export const POLLEN: Polyline[] = [
  oval(0.5, 0.5, 0.38),
  ...rays(0.5, 0.5, 0.38, 0.5, 26),
  oval(0.5, 0.66, 0.06, 0.04),
  oval(0.36, 0.42, 0.04, 0.06),
  oval(0.64, 0.42, 0.04, 0.06),
];

/** A dendrite from `root` to `tip`, forking once on the way. */
const dendrite = (at: number, long: number): Polyline[] => [
  path(around(0.5, 0.5, 0.46, at), around(0.5, 0.5, long, at + 0.01)),
  path(
    around(0.5, 0.5, long * 0.6, at + 0.006),
    around(0.5, 0.5, long * 0.95, at + 0.06),
  ),
  path(
    around(0.5, 0.5, long * 0.75, at + 0.008),
    around(0.5, 0.5, long * 1.05, at - 0.04),
  ),
];

export const NEURON: Polyline[] = [
  lumpy(0.5, 0.5, 0.46, 5, 0.1),
  oval(0.5, 0.52, 0.17),
  speck(0.52, 0.54),
  ...[0.14, 0.3, 0.47, 0.62, 0.8].flatMap((at, branch) =>
    dendrite(at, 1.1 + 0.25 * (branch % 3)),
  ),
  path([0.96, 0.5], [2.4, 0.46], [3.6, 0.56]),
];

export const WHITE_CELL: Polyline[] = [
  lumpy(0.5, 0.5, 0.46, 7, 0.06),
  oval(0.36, 0.56, 0.13, 0.11),
  oval(0.56, 0.62, 0.12, 0.1),
  oval(0.64, 0.42, 0.11, 0.12),
  path([0.46, 0.6], [0.48, 0.62]),
  path([0.62, 0.53], [0.63, 0.55]),
  ...scatter(0.5, 0.5, 0.4, 16).map(([x, y]) => speck(x, y, 0.008)),
];

export const RED_CELL: Polyline[] = [
  oval(0.5, 0.5, 0.5),
  oval(0.5, 0.5, 0.22),
  arc(0.5, 0.5, 0.36, 0.36, 0.55, 0.8),
  arc(0.5, 0.5, 0.29, 0.29, 0.58, 0.77),
];

export const YEAST: Polyline[] = [
  oval(0.42, 0.42, 0.42, 0.38),
  oval(0.86, 0.72, 0.14, 0.13),
  oval(0.34, 0.48, 0.12),
  oval(0.56, 0.32, 0.15, 0.13),
  arc(0.16, 0.2, 0.05, 0.05, 0, 0.5),
  arc(0.5, 0.74, 0.05, 0.05, 0.5, 1),
];

export const BACTERIUM: Polyline[] = [
  blob([0, 0.18], [0, 0.36], [1, 0.36], [1, 0], [0, 0]),
  wave([0.02, 0.2], [-1.3, 0.45], 3.5, 0.06),
  wave([0.02, 0.16], [-1.4, 0.1], 3.5, 0.06),
  wave([0.04, 0.1], [-1.2, -0.25], 3, 0.06),
  wave([0.25, 0.18], [0.75, 0.18], 3.5, 0.07),
  ...[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].flatMap((x) => [
    path([x, 0.36], [x + 0.02, 0.43]),
    path([x - 0.03, 0], [x - 0.05, -0.07]),
  ]),
];

/** One wavelength, measured off between two ticks, with waves either side. */
export const LIGHT_WAVE: Polyline[] = [
  wave([-1.25, 0.3], [2.25, 0.3], 3.5, 0.26),
  path([-1.25, 0.3], [2.25, 0.3]),
  path([0, 0.72], [1, 0.72]),
  path([0, 0.66], [0, 0.78]),
  path([1, 0.66], [1, 0.78]),
];

export const MIMIVIRUS: Polyline[] = [
  polygon(0.5, 0.5, 0.34, 6, 1 / 12),
  polygon(0.5, 0.5, 0.26, 6, 1 / 12),
  ...rays(0.5, 0.5, 0.36, 0.5, 54),
  ...rays(0.5, 0.5, 0.02, 0.1, 5, 0.05),
];

export const PHAGE: Polyline[] = [
  path(
    [0.3, 1],
    [0.42, 0.9],
    [0.42, 0.7],
    [0.3, 0.6],
    [0.18, 0.7],
    [0.18, 0.9],
    [0.3, 1],
  ),
  path([0.24, 0.58], [0.36, 0.58]),
  path([0.26, 0.58], [0.26, 0.2], [0.34, 0.2], [0.34, 0.58]),
  ...[0.26, 0.32, 0.38, 0.44, 0.5].map((y) => path([0.26, y], [0.34, y])),
  path([0.2, 0.2], [0.4, 0.2], [0.38, 0.16], [0.22, 0.16], [0.2, 0.2]),
  path([0.3, 0.16], [0.3, 0.1]),
  path([0.22, 0.18], [0.06, 0.36], [0, 0]),
  path([0.38, 0.18], [0.54, 0.36], [0.6, 0]),
  path([0.24, 0.17], [0.14, 0.3], [0.12, 0]),
  path([0.36, 0.17], [0.46, 0.3], [0.48, 0]),
];

export const FLU_VIRUS: Polyline[] = [
  oval(0.5, 0.5, 0.38),
  ...rays(0.5, 0.5, 0.38, 0.47, 28),
  ...Array.from({ length: 28 }, (_, spike) => {
    const at = spike / 28;
    return spike % 3 === 0
      ? path(
          around(0.5, 0.5, 0.47, at - 0.008),
          around(0.5, 0.5, 0.47, at + 0.008),
        )
      : oval(...around(0.5, 0.5, 0.485, at), 0.015);
  }),
  ...scatter(0.5, 0.5, 0.26, 8).map(([x, y], strand) =>
    wave([x - 0.06, y], [x + 0.06, y + (strand % 2) * 0.04], 1.5, 0.02),
  ),
];

export const POLIOVIRUS: Polyline[] = [
  polygon(0.5, 0.5, 0.5, 6, 1 / 12),
  polygon(0.5, 0.5, 0.26, 3, 0.25),
  ...[0.25, 7 / 12, 11 / 12].flatMap((at) => [
    path(around(0.5, 0.5, 0.26, at), around(0.5, 0.5, 0.5, at)),
    path(around(0.5, 0.5, 0.26, at), around(0.5, 0.5, 0.5, at + 1 / 6)),
    path(around(0.5, 0.5, 0.26, at), around(0.5, 0.5, 0.5, at - 1 / 6)),
  ]),
];
