import { type Point, type Polyline, scriptOf } from '@/cube/shared/lettering';

import {
  around,
  dashes,
  dot,
  label,
  oval,
  path,
  scatter,
  wave,
} from './shapes';

/** An atom as it is drawn in school: shells round a nucleus, `counts` on each. */
const shells = (counts: readonly number[]): Polyline[] => [
  oval(0.5, 0.5, 0.03),
  ...counts.flatMap((count, shell) => {
    const radius = (0.5 * (shell + 1)) / counts.length - 0.03;
    return [
      oval(0.5, 0.5, radius),
      ...Array.from({ length: count }, (_, electron) =>
        oval(...around(0.5, 0.5, radius, 0.07 + electron / count), 0.022),
      ),
    ];
  }),
];

export const CARBON_ATOM: Polyline[] = shells([2, 4]);

export const HELIUM_ATOM: Polyline[] = shells([2]);

/** A cloud: where the one electron is likely to be, thickest at the middle. */
export const HYDROGEN_ATOM: Polyline[] = [
  ...scatter(0.5, 0.5, 0.5, 260, 2.6).map(([x, y]) => dot(x, y, 0.006)),
  oval(0.5, 0.5, 0.012),
];

/** Next to nothing: a few specks of the cloud, far apart. */
export const ATOM_VOID: Polyline[] = scatter(0.5, 0.5, 0.5, 14).map(([x, y]) =>
  dot(x, y, 0.006),
);

/** A shorter wave than light's: more of them to the wavelength measured off. */
export const SHORT_WAVE: Polyline[] = [
  wave([-1.25, 0.3], [2.25, 0.3], 3.5, 0.18),
  wave([-1.25, 0.3], [2.25, 0.3], 3.5, -0.18),
  path([0, 0.66], [1, 0.66]),
  path([0, 0.6], [0, 0.72]),
  path([1, 0.6], [1, 0.72]),
];

/** `count` nucleons packed into a ball, every other one marked as a proton. */
const nucleus = (count: number, protons: number): Polyline[] => {
  const size = 0.5 / Math.sqrt(count) / 1.05;
  return scatter(0.5, 0.5, 0.5 - size, count).flatMap(([x, y], at) => {
    const charged = at % Math.max(Math.round(count / protons), 1) === 0;
    return [
      oval(x, y, size),
      ...(charged
        ? [
            path([x - size / 2, y], [x + size / 2, y]),
            path([x, y - size / 2], [x, y + size / 2]),
          ]
        : []),
    ];
  });
};

export const URANIUM_NUCLEUS: Polyline[] = nucleus(60, 24);

export const CARBON_NUCLEUS: Polyline[] = nucleus(12, 6);

export const ALPHA: Polyline[] = nucleus(4, 2);

const QUARKS: readonly Point[] = [
  around(0.5, 0.5, 0.24, 0.25),
  around(0.5, 0.5, 0.24, 7 / 12),
  around(0.5, 0.5, 0.24, 11 / 12),
];

/** Three quarks and the springs of the force between them. */
export const PROTON: Polyline[] = [
  ...dashes(0.5, 0.5, 0.5, 30),
  ...QUARKS.flatMap((quark, at) => {
    const next = QUARKS[(at + 1) % 3] ?? quark;
    return [oval(...quark, 0.07), wave(quark, next, 5, 0.03).slice(14, -14)];
  }),
  ...label('U', 0.47, 0.71, 0.06),
  ...label('U', 0.265, 0.35, 0.06),
  ...label('D', 0.68, 0.35, 0.06),
];

/** The floor the proton's inside is first seen from; it thins out below. */
const SEA_TOP = 52;

/**
 * Quarks and antiquarks coming and going, tied in pairs by short springs:
 * fewer of them, and elsewhere, on every floor down.
 */
export const quarkSea = (n: number): Polyline[] =>
  scatter(0.5, 0.5, 0.46, Math.max(3, 21 - 3 * (n - SEA_TOP))).flatMap(
    ([x, y], at) => {
      const mate = around(x, y, 0.11, at * 0.137 + n * 0.21);
      return [
        oval(x, y, 0.022),
        oval(...mate, 0.022),
        wave([x, y], mate, 3, 0.014).slice(9, -9),
      ];
    },
  );

/** A point, inside the ring nobody has yet seen it smaller than. */
export const QUARK: Polyline[] = [
  dot(0.5, 0.5, 0.01),
  ...dashes(0.5, 0.5, 0.5, 24),
];

/** A question mark, coming apart as the floor's script does. */
export const question = (n: number): Polyline[] =>
  label('?', 0.25, 0, 1, scriptOf(n));
