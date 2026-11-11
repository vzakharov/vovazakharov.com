import type { Polyline } from '@/cube/shared/lettering';

import { arc, around, blob, curve, oval, path, rays, speck } from './shapes';

// Each drawing is strokes in units of the thing's own stated size, x rightward
// and y upward from the thing's lower left: a thing 9 cm long spans 0 to 1.

/** A figure standing, as a door sign draws one. */
const standing = (head: number, hip: number): Polyline[] => {
  const neck = 1 - 2 * head - 0.02;
  return [
    oval(0.2, 1 - head, head * 0.8, head),
    curve([0.05, hip + 0.04], [0.07, neck], [0.33, neck], [0.35, hip + 0.04]),
    path([0.12, neck - 0.08], [0.13, hip]),
    path([0.28, neck - 0.08], [0.27, hip]),
    path(
      [0.13, hip],
      [0.14, 0.01],
      [0.19, 0.01],
      [0.2, hip - 0.05],
      [0.21, 0.01],
      [0.26, 0.01],
      [0.27, hip],
    ),
  ];
};

export const PERSON: Polyline[] = standing(0.07, 0.47);

export const CHILD: Polyline[] = standing(0.12, 0.36);

export const CAT: Polyline[] = [
  oval(0.45, 0.33, 0.27, 0.12),
  oval(0.8, 0.42, 0.1, 0.09),
  path([0.73, 0.48], [0.75, 0.58], [0.8, 0.51]),
  path([0.82, 0.51], [0.87, 0.58], [0.88, 0.47]),
  curve([0.19, 0.36], [0.05, 0.4], [0.02, 0.58], [0.1, 0.6]),
  path([0.27, 0.24], [0.26, 0.02], [0.31, 0.02]),
  path([0.36, 0.22], [0.36, 0.02], [0.41, 0.02]),
  path([0.58, 0.22], [0.58, 0.02], [0.63, 0.02]),
  path([0.67, 0.25], [0.68, 0.02], [0.73, 0.02]),
  speck(0.83, 0.44),
  path([0.88, 0.4], [0.98, 0.43]),
  path([0.88, 0.39], [0.98, 0.37]),
];

export const HEDGEHOG: Polyline[] = [
  curve([0.04, 0.06], [0.02, 0.5], [0.7, 0.62], [0.8, 0.22]),
  path([0.8, 0.22], [0.99, 0.12], [0.82, 0.06]),
  path([0.06, 0.06], [0.84, 0.06]),
  ...rays(0.42, 0.1, 0.24, 0.36, 15, 0.04).slice(0, 7),
  ...rays(0.42, 0.1, 0.33, 0.46, 19, 0.03).slice(0, 9),
  speck(0.86, 0.17),
  path([0.25, 0.06], [0.25, 0.01], [0.3, 0.01]),
  path([0.65, 0.06], [0.65, 0.01], [0.7, 0.01]),
];

export const MOUSE: Polyline[] = [
  blob(
    [0.1, 0.2],
    [0.3, 0.5],
    [0.7, 0.47],
    [1, 0.18],
    [0.7, 0.04],
    [0.2, 0.04],
  ),
  oval(0.72, 0.43, 0.09, 0.1),
  speck(0.86, 0.25),
  curve([0.12, 0.16], [-0.2, 0.08], [-0.4, 0.3], [-0.7, 0.2]),
  path([0.95, 0.17], [1.08, 0.24]),
  path([0.95, 0.15], [1.09, 0.13]),
  path([0.35, 0.07], [0.33, 0.01], [0.4, 0.01]),
  path([0.75, 0.08], [0.76, 0.01], [0.83, 0.01]),
];

/** A spiral of `turns` winding in from `outer` to `inner` round a centre. */
const spiral = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  turns: number,
): Polyline =>
  Array.from({ length: Math.ceil(turns * 24) + 1 }, (_, step) => {
    const along = step / (turns * 24);
    const radius = outer + (inner - outer) * along;
    const angle = (0.6 - along * turns) * 2 * Math.PI;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });

export const SNAIL: Polyline[] = [
  spiral(0.42, 0.34, 0.27, 0.02, 2.6),
  curve([0.08, 0.06], [0.6, 0.02], [0.86, 0.04], [0.95, 0.3]),
  curve([0.95, 0.3], [0.9, 0.36], [0.72, 0.2], [0.68, 0.22]),
  path([0.03, 0.02], [0.9, 0.02]),
  path([0.92, 0.32], [0.99, 0.5]),
  path([0.87, 0.31], [0.88, 0.5]),
];

export const PAPERCLIP: Polyline[] = [
  curve(
    [0.7, 0.07],
    [0.12, 0.07],
    [0.12, 0.21],
    [1, 0.21],
    [1, 0],
    [0, 0],
    [0, 0.28],
    [0.8, 0.28],
  ),
];

export const BEE: Polyline[] = [
  oval(0.3, 0.3, 0.26, 0.16),
  path([0.2, 0.16], [0.2, 0.44]),
  path([0.32, 0.14], [0.32, 0.46]),
  path([0.44, 0.17], [0.44, 0.43]),
  oval(0.66, 0.32, 0.13),
  oval(0.87, 0.3, 0.09, 0.1),
  blob([0.62, 0.44], [0.5, 0.74], [0.2, 0.74], [0.3, 0.55]),
  blob([0.68, 0.45], [0.74, 0.68], [0.52, 0.8], [0.56, 0.6]),
  path([0.92, 0.38], [0.97, 0.52], [1, 0.5]),
  path([0.6, 0.21], [0.55, 0.08], [0.5, 0.02]),
  path([0.68, 0.19], [0.68, 0.08], [0.72, 0.02]),
  path([0.76, 0.22], [0.82, 0.1], [0.88, 0.04]),
  path([0.04, 0.3], [0, 0.29]),
];

/** A jointed leg from `hip` through `knee` to `foot`. */
const leg = (
  hip: readonly [number, number],
  knee: readonly [number, number],
  foot: readonly [number, number],
): Polyline => path(hip, knee, foot);

export const ANT: Polyline[] = [
  oval(0.2, 0.27, 0.18, 0.12),
  oval(0.5, 0.26, 0.13, 0.07),
  oval(0.78, 0.29, 0.1, 0.09),
  leg([0.42, 0.21], [0.3, 0.14], [0.22, 0]),
  leg([0.5, 0.19], [0.5, 0.1], [0.46, 0]),
  leg([0.58, 0.21], [0.68, 0.12], [0.74, 0]),
  leg([0.42, 0.31], [0.3, 0.44], [0.2, 0.42]),
  leg([0.58, 0.31], [0.66, 0.46], [0.74, 0.44]),
  path([0.85, 0.35], [0.93, 0.47], [1, 0.42]),
  path([0.82, 0.37], [0.86, 0.5], [0.93, 0.5]),
];

export const FRUIT_FLY: Polyline[] = [
  oval(0.3, 0.25, 0.22, 0.12),
  path([0.22, 0.14], [0.22, 0.36]),
  path([0.34, 0.13], [0.34, 0.37]),
  oval(0.6, 0.3, 0.13, 0.12),
  oval(0.82, 0.3, 0.09, 0.1),
  oval(0.85, 0.33, 0.05, 0.06),
  blob([0.62, 0.4], [0.3, 0.64], [0, 0.52], [0.3, 0.4]),
  leg([0.54, 0.2], [0.46, 0.1], [0.4, 0]),
  leg([0.62, 0.18], [0.64, 0.08], [0.6, 0]),
  leg([0.68, 0.2], [0.78, 0.1], [0.84, 0]),
  path([0.9, 0.36], [0.96, 0.42]),
];

export const FLEA: Polyline[] = [
  blob(
    [0.15, 0.32],
    [0.3, 0.66],
    [0.7, 0.7],
    [0.92, 0.46],
    [0.8, 0.24],
    [0.4, 0.2],
  ),
  path([0.36, 0.26], [0.34, 0.62]),
  path([0.5, 0.24], [0.5, 0.66]),
  path([0.64, 0.25], [0.66, 0.64]),
  leg([0.42, 0.24], [0.16, 0.14], [0.5, 0.03]),
  path([0.5, 0.03], [0.62, 0]),
  leg([0.6, 0.24], [0.56, 0.12], [0.7, 0.04]),
  leg([0.74, 0.25], [0.78, 0.14], [0.9, 0.08]),
  speck(0.82, 0.44),
  path([0.9, 0.4], [1, 0.36]),
];

export const TARDIGRADE: Polyline[] = [
  blob(
    [0.04, 0.32],
    [0.1, 0.52],
    [0.5, 0.56],
    [0.86, 0.52],
    [0.98, 0.36],
    [0.9, 0.2],
    [0.5, 0.16],
    [0.1, 0.18],
  ),
  arc(0.28, 0.36, 0.04, 0.17, -0.25, 0.25),
  arc(0.5, 0.36, 0.04, 0.19, -0.25, 0.25),
  arc(0.72, 0.36, 0.04, 0.17, -0.25, 0.25),
  ...[0.14, 0.36, 0.58, 0.8].flatMap((x) => [
    curve([x, 0.2], [x - 0.02, 0.03], [x + 0.1, 0.03], [x + 0.1, 0.19]),
    path([x + 0.02, 0.05], [x, 0]),
    path([x + 0.06, 0.05], [x + 0.08, 0]),
  ]),
  oval(0.975, 0.35, 0.025, 0.04),
  speck(0.9, 0.42),
];

export const MITE: Polyline[] = [
  oval(0.5, 0.4, 0.34, 0.28),
  arc(0.5, 0.52, 0.3, 0.1, 0.55, 0.95),
  ...[0.05, 0.15, 0.35, 0.45, 0.55, 0.65, 0.85, 0.95].map((at) =>
    leg(
      around(0.5, 0.4, 0.29, at),
      around(0.5, 0.4, 0.42, at + 0.02),
      around(0.5, 0.4, 0.5, at - 0.02),
    ),
  ),
  path([0.82, 0.44], [0.92, 0.5]),
  path([0.82, 0.36], [0.92, 0.32]),
  ...rays(0.5, 0.4, 0.3, 0.36, 9, 0.02).slice(0, 4),
];
