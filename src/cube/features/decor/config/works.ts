import type { Thing } from '@/cube/shared/lib/thing';

import { oneOf, type Recipe } from '../lib/tools';

const DARK = 0x16_17_1a;
const STEEL = 0x8a_8f_92;
const PINE = 0xb0_8a_58;
const CONCRETE = 0x8c_8a_84;

/** What stands in works and laboratories. */
export const WORKS = {
  'lab-bench': {
    build: ({ block, panel, prism, beam }, vary) => {
      const liquid = [0x30_c0_60, 0x30_70_d0, 0xd0_90_20, 0xc0_30_80] as const;
      return [
        block([0, 0, 0.06], [1.7, 0.1, 0.6], 'plastic', DARK),
        block([0, 0.1, 0.03], [1.76, 0.76, 0.68], 'wood', 0xa8_b4_b8),
        block([0, 0.86, 0], [1.8, 0.04, 0.75], 'rubber', 0x0c_0c_0e),
        ...[-0.585, 0, 0.585].map((x) =>
          panel(
            [x - 0.27, 0.14, 0.711],
            [0.54, 0, 0],
            [0, 0.68, 0],
            'wood',
            0xc0_cc_d0,
          ),
        ),
        ...[-0.4, -0.22].map((x, flask) =>
          prism(
            [x, 0.9, 0.4],
            0.07,
            0.17,
            'glass',
            oneOf(liquid, vary(flask)),
            {
              sides: 6,
              top: 0.02,
            },
          ),
        ),
        // A microscope, its eyepiece leaning towards whoever is not there.
        block([-0.7, 0.9, 0.3], [0.16, 0.03, 0.22], 'metal', DARK),
        beam([-0.7, 0.93, 0.34], [-0.7, 1.2, 0.38], 0.05, 'metal', 0xd8_d8_d0),
        beam([-0.7, 1.02, 0.44], [-0.7, 1.3, 0.5], 0.04, 'metal', DARK),
      ].flat();
    },
  },

  tank: {
    build: ({ block, panel }, vary) => {
      const murk = oneOf([0x1f_4a_3a, 0x2a_4a_5a, 0x4a_4a_1f], vary(0));
      const at = -0.3 + vary(1) * 0.5;
      return [
        block([0, 0, 0], [1, 0.6, 0.5], 'metal', STEEL),
        block([0, 0.6, 0.02], [0.96, 0.62, 0.46], 'glass', murk),
        block([0, 1.22, 0], [1, 0.04, 0.5], 'metal', DARK),
        block([0, 0.58, 0], [1, 0.04, 0.5], 'metal', DARK),
        // Something pale hangs in it, and does not move.
        panel(
          [at, 0.8, 0.481],
          [0.1, 0.03, 0],
          [-0.02, 0.3, 0],
          'skin',
          0xc8_c0_a8,
        ),
        panel(
          [at + 0.03, 1.08, 0.481],
          [0.12, 0, 0],
          [0, 0.09, 0],
          'skin',
          0xc8_c0_a8,
        ),
        panel(
          [at + 0.3, 0.7, 0.481],
          [0.02, 0, 0],
          [0, 0.02, 0],
          'glass',
          0xa8_c8_c0,
        ),
        panel(
          [at + 0.32, 0.86, 0.481],
          [0.03, 0, 0],
          [0, 0.03, 0],
          'glass',
          0xa8_c8_c0,
        ),
        panel(
          [at + 0.29, 1.04, 0.481],
          [0.02, 0, 0],
          [0, 0.02, 0],
          'glass',
          0xa8_c8_c0,
        ),
      ].flat();
    },
  },

  barrel: {
    gap: [0.02, 0.3],
    cornered: true,
    build: ({ prism, block, panel }, vary) => {
      const drum = oneOf(
        [0x1f_4a_7a, 0x8a_3a_1a, 0xd0_a0_10, 0x2a_5a_3a],
        vary(0),
      );
      return [
        prism([0, 0, 0.3], 0.29, 0.88, 'metal', drum, { lid: 0x3a_3c_3e }),
        prism([0, 0.28, 0.3], 0.3, 0.03, 'metal', drum, { lid: null }),
        prism([0, 0.58, 0.3], 0.3, 0.03, 'metal', drum, { lid: null }),
        block([0.12, 0.88, 0.26], [0.06, 0.02, 0.06], 'metal', DARK),
        panel(
          [-0.09, 0.36, 0.572],
          [0.18, 0, 0],
          [0, 0.18, 0],
          'paper',
          0xf0_d0_20,
        ),
      ].flat();
    },
  },

  crate: {
    gap: [0.02, 0.3],
    turn: 0.4,
    build: ({ block, panel }) => {
      const board = 0x8a_68_3c;
      const side = 0.8;
      return [
        block([0, 0, 0], [side, side, side], 'wood', PINE),
        // Front, then the two sides, each braced corner to corner.
        panel([-0.4, 0, 0.801], [0.1, 0, 0], [0.7, 0.8, 0], 'wood', board),
        panel([-0.4, 0, 0.802], [0.8, 0, 0], [0, 0.1, 0], 'wood', board),
        panel([-0.4, 0.7, 0.802], [0.8, 0, 0], [0, 0.1, 0], 'wood', board),
        panel([0.401, 0, 0.8], [0, 0, -0.1], [0, 0.8, -0.7], 'wood', board),
        panel([0.402, 0, 0.8], [0, 0, -0.8], [0, 0.1, 0], 'wood', board),
        panel([0.402, 0.7, 0.8], [0, 0, -0.8], [0, 0.1, 0], 'wood', board),
        panel([-0.401, 0, 0], [0, 0, 0.1], [0, 0.8, 0.7], 'wood', board),
        panel([-0.402, 0, 0], [0, 0, 0.8], [0, 0.1, 0], 'wood', board),
        panel([-0.402, 0.7, 0], [0, 0, 0.8], [0, 0.1, 0], 'wood', board),
        panel([-0.4, 0.801, 0.8], [0.1, 0, 0], [0.7, 0, -0.8], 'wood', board),
        panel([-0.15, 0.3, 0.803], [0.3, 0, 0], [0, 0.05, 0], 'rubber', DARK),
      ].flat();
    },
  },

  drain: {
    gap: [0.3, 0.8],
    build: ({ panel }, vary) => {
      const [wide, deep, slots] =
        vary(0) < 0.5 ? ([0.32, 0.32, 5] as const) : ([1.2, 0.18, 12] as const);
      return [
        panel(
          [-wide / 2, 0.006, deep],
          [wide, 0, 0],
          [0, 0, -deep],
          'metal',
          0x5a_5c_5a,
        ),
        ...Array.from({ length: slots }, (_, slot) =>
          panel(
            [
              -wide / 2 + 0.03 + (slot * (wide - 0.06)) / slots,
              0.007,
              deep - 0.03,
            ],
            [((wide - 0.06) / slots) * 0.55, 0, 0],
            [0, 0, -(deep - 0.06)],
            'rubber',
            0x04_04_04,
          ),
        ),
      ].flat();
    },
  },

  'cable-reel': {
    gap: [0.02, 0.3],
    build: ({ disc, panel }) =>
      [
        disc([0, 0.5, 0], 0.5, 0.05, 'wood', PINE),
        disc([0, 0.5, 0.05], 0.31, 0.5, 'rubber', 0x0e_0e_10, { lid: null }),
        disc([0, 0.5, 0.55], 0.5, 0.05, 'wood', PINE),
        panel(
          [-0.07, 0.43, 0.601],
          [0.14, 0, 0],
          [0, 0.14, 0],
          'rubber',
          0x05_05_05,
        ),
        ...[
          [-0.25, 0],
          [0.25, 0],
          [0, -0.25],
          [0, 0.25],
        ].map(([x = 0, y = 0]) =>
          panel(
            [x - 0.02, 0.48 + y, 0.601],
            [0.04, 0, 0],
            [0, 0.04, 0],
            'metal',
            STEEL,
          ),
        ),
      ].flat(),
  },

  monolith: {
    gap: [0.3, 0.7],
    build: ({ block }) =>
      block([0, 0, 0], [1, 2.25, 0.25], 'glass', 0x04_04_05),
  },

  staircase: {
    build: ({ panel, beam }) => {
      const steps = 10;
      const rise = 0.2;
      const going = 0.24;
      const wide = 0.9;
      return [
        ...Array.from({ length: steps }, (_, step) => {
          // Step 0 is the lowest, furthest from the wall the flight runs into.
          const top = (step + 1) * rise;
          const front = (steps - step) * going;
          return [
            panel(
              [-wide / 2, top, front],
              [wide, 0, 0],
              [0, 0, -going],
              'plastic',
              CONCRETE,
            ),
            panel(
              [-wide / 2, top - rise, front],
              [wide, 0, 0],
              [0, rise, 0],
              'plastic',
              CONCRETE,
            ),
            panel(
              [wide / 2, 0, front],
              [0, 0, -going],
              [0, top, 0],
              'plastic',
              CONCRETE,
            ),
            panel(
              [-wide / 2, 0, front - going],
              [0, 0, going],
              [0, top, 0],
              'plastic',
              CONCRETE,
            ),
          ].flat();
        }),
        beam(
          [wide / 2 - 0.03, rise + 0.85, steps * going],
          [wide / 2 - 0.03, steps * rise + 0.25, 0.3],
          0.04,
          'metal',
          STEEL,
        ),
        beam(
          [wide / 2 - 0.03, rise, steps * going - 0.02],
          [wide / 2 - 0.03, rise + 0.85, steps * going - 0.02],
          0.04,
          'metal',
          STEEL,
        ),
      ].flat();
    },
  },
} as const satisfies Partial<Record<Thing, Recipe>>;
