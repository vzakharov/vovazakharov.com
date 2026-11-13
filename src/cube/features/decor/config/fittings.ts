import type { Thing } from '@/cube/shared/lib/thing';

import { oneOf, type Recipe } from '../lib/tools';

const DARK = 0x16_17_1a;
const WHITE = 0xe6_e4_da;
const CHROME = 0xb8_bc_c0;

/** What is fixed to a wall of any building. */
export const FITTINGS = {
  'wall-clock': {
    build: ({ disc, beam, panel }, vary) => {
      // The time it stopped at, in hours round the dial: both hands tell it.
      const hours = vary(0) * 12;
      const hand = (turn: number, reach: number, thick: number) =>
        beam(
          [0, 2, 0.05],
          [
            Math.sin(turn * 2 * Math.PI) * reach,
            2 + Math.cos(turn * 2 * Math.PI) * reach,
            0.05,
          ],
          thick,
          'plastic',
          DARK,
        );
      return [
        disc([0, 2, 0], 0.17, 0.04, 'plastic', DARK, { lid: 0xf0_ef_e8 }),
        ...[0, 1, 2, 3].map((quarter) => {
          const [x, y] = (
            [
              [0, 0.13],
              [0.13, 0],
              [0, -0.13],
              [-0.13, 0],
            ] as const
          )[quarter] ?? [0, 0];
          return panel(
            [x - 0.01, 2 + y - 0.01, 0.041],
            [0.02, 0, 0],
            [0, 0.02, 0],
            'plastic',
            DARK,
          );
        }),
        hand(hours / 12, 0.08, 0.016),
        hand(hours % 1, 0.12, 0.01),
      ].flat();
    },
  },

  'notice-board': {
    build: ({ block, panel }, vary) =>
      [
        block([0, 1.1, 0], [1, 0.7, 0.025], 'wood', 0x8a_6a_48),
        panel(
          [-0.47, 1.13, 0.026],
          [0.94, 0, 0],
          [0, 0.64, 0],
          'paper',
          0xa8_78_48,
        ),
        ...Array.from({ length: 7 }, (_, note) => {
          const wide = 0.1 + vary(note) * 0.12;
          const tall = 0.1 + vary(10 + note) * 0.16;
          const lean = (vary(20 + note) - 0.5) * 0.05;
          return panel(
            [
              -0.44 + (note % 4) * 0.22 + vary(30 + note) * 0.04,
              1.16 + (note < 4 ? 0.3 : 0) + vary(40 + note) * 0.04,
              0.028,
            ],
            [wide, lean, 0],
            [-lean, tall, 0],
            'paper',
            oneOf(
              [0xf0_ee_e4, 0xf0_ee_e4, 0xf2_e0_70, 0xf0_b0_b8, 0xb0_d8_f0],
              vary(50 + note),
            ),
          );
        }),
      ].flat(),
  },

  'exit-sign': {
    build: ({ block, panel }) => {
      const glow = 0xd0_ff_e0;
      const bar = (x: number, y: number, wide: number, tall: number) =>
        panel([x, 2.14 + y, 0.051], [wide, 0, 0], [0, tall, 0], 'screen', glow);
      const stroke = (x: number, lean: number) =>
        panel([x, 2.14, 0.051], [0.02, 0, 0], [lean, 0.1, 0], 'screen', glow);
      return [
        block([0, 2.1, 0], [0.46, 0.18, 0.05], 'plastic', 0x0e_6a_30),
        // E, X, I, T.
        bar(-0.19, 0, 0.02, 0.1),
        bar(-0.17, 0, 0.05, 0.02),
        bar(-0.17, 0.04, 0.04, 0.02),
        bar(-0.17, 0.08, 0.05, 0.02),
        stroke(-0.09, 0.06),
        stroke(-0.03, -0.06),
        bar(0.03, 0, 0.02, 0.1),
        bar(0.11, 0, 0.02, 0.1),
        bar(0.08, 0.08, 0.08, 0.02),
      ].flat();
    },
  },

  vent: {
    build: ({ block, panel }) =>
      [
        block([0, 0.18, 0], [0.5, 0.32, 0.015], 'metal', 0xc4_c4_bc),
        ...Array.from({ length: 6 }, (_, slot) =>
          panel(
            [-0.22, 0.215 + slot * 0.045, 0.016],
            [0.44, 0, 0],
            [0, 0.025, 0],
            'rubber',
            0x0a_0a_0a,
          ),
        ),
      ].flat(),
  },

  door: {
    build: ({ block, panel }, vary) => {
      const leaf = oneOf(
        [0x6a_7a_6a, 0x7a_5a_3a, 0xc8_c0_a8, 0x4a_5a_7a, 0x7a_2a_2a],
        vary(0),
      );
      const hand = vary(1) < 0.5 ? 1 : -1;
      return [
        block([-0.45, 0, 0], [0.07, 2.07, 0.05], 'wood', WHITE),
        block([0.45, 0, 0], [0.07, 2.07, 0.05], 'wood', WHITE),
        block([0, 2.03, 0], [0.97, 0.07, 0.05], 'wood', WHITE),
        block([0, 0, 0], [0.83, 2.03, 0.035], 'wood', leaf),
        block([hand * 0.3, 1, 0.035], [0.13, 0.025, 0.05], 'metal', CHROME),
        panel(
          [hand * 0.3 - 0.03, 0.93, 0.036],
          [0.06, 0, 0],
          [0, 0.18, 0],
          'metal',
          CHROME,
        ),
        panel(
          [-0.41, 0, 0.036],
          [0.82, 0, 0],
          [0, 0.2, 0],
          'metal',
          0x8a_8a_84,
        ),
        panel(
          [-0.1, 1.55, 0.036],
          [0.2, 0, 0],
          [0, 0.07, 0],
          'paper',
          0xe8_e6_dc,
        ),
      ].flat();
    },
  },

  radiator: {
    build: ({ block }) =>
      [
        ...Array.from({ length: 8 }, (_, fin) =>
          block(
            [-0.42 + fin * 0.12, 0.15, 0.03],
            [0.09, 0.6, 0.09],
            'metal',
            WHITE,
          ),
        ),
        block([0.55, 0.17, 0.05], [0.14, 0.05, 0.05], 'metal', CHROME),
      ].flat(),
  },

  socket: {
    build: ({ block, panel }) =>
      [
        block([0, 0.28, 0], [0.16, 0.09, 0.012], 'plastic', WHITE),
        ...[-0.055, -0.025, 0.025, 0.055].map((x) =>
          panel(
            [x - 0.006, 0.31, 0.013],
            [0.012, 0, 0],
            [0, 0.03, 0],
            'rubber',
            0x0a_0a_0a,
          ),
        ),
      ].flat(),
  },

  'fire-extinguisher': {
    build: ({ block, prism, panel, beam }) =>
      [
        block([0, 0.55, 0], [0.12, 0.04, 0.03], 'metal', DARK),
        prism([0, 0.3, 0.1], 0.08, 0.45, 'metal', 0xc0_14_10),
        block([0, 0.75, 0.07], [0.05, 0.05, 0.06], 'metal', 0xc0_14_10),
        block([0, 0.8, 0.05], [0.07, 0.05, 0.12], 'plastic', DARK),
        beam([0.04, 0.8, 0.1], [0.11, 0.45, 0.1], 0.025, 'rubber', DARK),
        panel(
          [-0.03, 0.45, 0.176],
          [0.06, 0, 0],
          [0, 0.16, 0],
          'paper',
          0xf0_ee_e4,
        ),
      ].flat(),
  },

  payphone: {
    build: ({ block, panel, beam }) =>
      [
        block([-0.27, 0.9, 0], [0.02, 0.95, 0.3], 'plastic', 0x9a_a8_b0),
        block([0.27, 0.9, 0], [0.02, 0.95, 0.3], 'plastic', 0x9a_a8_b0),
        block([0, 1.85, 0], [0.56, 0.1, 0.32], 'plastic', 0x1f_4a_9a),
        block([0, 1.05, 0], [0.3, 0.5, 0.15], 'metal', 0x2a_2c_30),
        block([-0.09, 1.2, 0.15], [0.06, 0.26, 0.05], 'plastic', 0x0c_0c_0c),
        // The handset's cord, which is all that says someone was here.
        beam([-0.09, 1.2, 0.17], [0.02, 0.92, 0.12], 0.015, 'metal', CHROME),
        panel([0, 1.2, 0.151], [0.1, 0, 0], [0, 0.13, 0], 'metal', CHROME),
        panel([0, 1.4, 0.151], [0.1, 0, 0], [0, 0.04, 0], 'screen', 0x60_d0_80),
        panel([0.02, 1.08, 0.151], [0.06, 0, 0], [0, 0.05, 0], 'rubber', DARK),
      ].flat(),
  },

  pipe: {
    cornered: true,
    build: ({ block, prism, disc }, vary) => {
      const paint = oneOf([0x7a_7c_78, 0x8a_3a_1a, 0x3a_6a_4a], vary(0));
      return [
        prism([-0.07, 0, 0.1], 0.055, 2.3, 'metal', paint, {
          sides: 6,
          lid: null,
        }),
        prism([0.08, 0, 0.07], 0.03, 2.3, 'metal', 0xb0_a8_90, {
          sides: 6,
          lid: null,
        }),
        block([0, 0.5, 0], [0.26, 0.04, 0.05], 'metal', DARK),
        block([0, 1.8, 0], [0.26, 0.04, 0.05], 'metal', DARK),
        prism([-0.07, 1.36, 0.1], 0.07, 0.05, 'metal', paint, { sides: 6 }),
        disc([-0.07, 1.1, 0.16], 0.09, 0.02, 'metal', 0xc0_20_18),
        block([-0.07, 1.085, 0.1], [0.03, 0.03, 0.07], 'metal', DARK),
      ].flat();
    },
  },

  mirror: {
    build: ({ block, panel }) =>
      [
        block([0, 0.95, 0], [0.6, 0.92, 0.02], 'wood', 0x3a_2a_1c),
        panel(
          [-0.27, 0.98, 0.021],
          [0.54, 0, 0],
          [0, 0.86, 0],
          'glass',
          0x9a_ac_b4,
        ),
        block([0, 0.88, 0], [0.5, 0.02, 0.1], 'wood', 0x3a_2a_1c),
      ].flat(),
  },

  window: {
    build: ({ block, panel }, vary) => {
      const outside = oneOf([0x0c_14_24, 0x4a_3a_50, 0xa8_b4_b8], vary(0));
      return [
        panel([-0.5, 0.9, 0.01], [1, 0, 0], [0, 1.1, 0], 'glass', outside),
        block([0, 0.86, 0], [1.14, 0.04, 0.11], 'wood', WHITE),
        block([0, 2, 0], [1.1, 0.05, 0.05], 'wood', WHITE),
        block([-0.525, 0.9, 0], [0.05, 1.1, 0.05], 'wood', WHITE),
        block([0.525, 0.9, 0], [0.05, 1.1, 0.05], 'wood', WHITE),
        block([0, 0.9, 0], [0.04, 1.1, 0.035], 'wood', WHITE),
        block([0, 1.5, 0], [1, 0.04, 0.035], 'wood', WHITE),
      ].flat();
    },
  },

  curtain: {
    build: ({ block, panel }, vary) => {
      const cloth = oneOf(
        [0xb0_8a_2a, 0x6a_1f_2a, 0x5a_6a_4a, 0xc8_c0_b0],
        vary(0),
      );
      const folds = 12;
      const at = (fold: number): readonly [number, number] => [
        -0.6 + (fold * 1.2) / folds,
        fold % 2 === 0 ? 0.03 : 0.09,
      ];
      return [
        block([0, 2.17, 0.02], [1.3, 0.03, 0.03], 'metal', CHROME),
        ...Array.from({ length: folds }, (_, fold) => {
          const [x, z] = at(fold);
          const [toX, toZ] = at(fold + 1);
          return panel(
            [x, 0.08, z],
            [toX - x, 0, toZ - z],
            [0, 2.09, 0],
            'fabric',
            cloth,
          );
        }),
      ].flat();
    },
  },
} as const satisfies Partial<Record<Thing, Recipe>>;
