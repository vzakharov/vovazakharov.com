import type { Thing } from '@/cube/shared/lib/thing';

import { oneOf, type Recipe } from '../lib/tools';

const STEEL = 0x8a_8f_86;
const DARK = 0x1c_1d_20;
const PALE = 0xd8_d8_d0;

export const OFFICE = {
  desk: {
    build: ({ block, panel }, vary) => {
      const side = vary(0) < 0.5 ? 1 : -1;
      return [
        block([0, 0.7, 0], [1.4, 0.03, 0.7], 'wood', 0xb8_98_68),
        block([-0.67, 0, 0.02], [0.03, 0.7, 0.64], 'metal', STEEL),
        block([0.67, 0, 0.02], [0.03, 0.7, 0.64], 'metal', STEEL),
        block([0, 0.3, 0.02], [1.31, 0.38, 0.02], 'metal', STEEL),
        block([side * 0.44, 0.12, 0.1], [0.4, 0.58, 0.56], 'metal', 0x9a_9f_96),
        block([-side * 0.2, 0.73, 0.2], [0.07, 0.1, 0.07], 'plastic', DARK),
        block([-side * 0.2, 0.83, 0.2], [0.5, 0.33, 0.04], 'plastic', DARK),
        panel(
          [-side * 0.2 - 0.23, 0.85, 0.241],
          [0.46, 0, 0],
          [0, 0.29, 0],
          'screen',
          0x9a_b8_d8,
        ),
        block([-side * 0.2, 0.73, 0.42], [0.4, 0.02, 0.13], 'plastic', PALE),
      ].flat();
    },
  },

  'office-chair': {
    gap: [0.15, 0.7],
    turn: Math.PI,
    build: ({ block }, vary) => {
      const cloth = oneOf([0x2a_2c_34, 0x1f_3a_5a, 0x5a_1f_24], vary(0));
      return [
        block([0, 0.04, 0.27], [0.6, 0.04, 0.06], 'plastic', DARK),
        block([0, 0.04, 0], [0.06, 0.04, 0.6], 'plastic', DARK),
        block([0, 0.08, 0.27], [0.06, 0.34, 0.06], 'metal', STEEL),
        block([0, 0.42, 0.07], [0.48, 0.07, 0.46], 'fabric', cloth),
        block([0, 0.55, 0.07], [0.44, 0.5, 0.06], 'fabric', cloth),
        block([-0.26, 0.62, 0.15], [0.05, 0.03, 0.3], 'plastic', DARK),
        block([0.26, 0.62, 0.15], [0.05, 0.03, 0.3], 'plastic', DARK),
        block([-0.26, 0.49, 0.28], [0.04, 0.13, 0.04], 'plastic', DARK),
        block([0.26, 0.49, 0.28], [0.04, 0.13, 0.04], 'plastic', DARK),
      ].flat();
    },
  },

  'filing-cabinet': {
    build: ({ block, panel }, vary) => {
      const body = oneOf([0x8a_8f_86, 0x6f_7a_6a, 0xa8_a0_88], vary(0));
      return [
        block([0, 0, 0], [0.47, 1.32, 0.62], 'metal', body),
        ...[0, 1, 2, 3].flatMap((drawer) => {
          const y = 0.04 + drawer * 0.32;
          // A drawer left a hand's width open, in a room nobody is in.
          const out = drawer === Math.floor(vary(1) * 8) ? 0.12 : 0.006;
          return [
            out > 0.1
              ? block([0, y, 0.62], [0.43, 0.29, out], 'metal', body)
              : panel(
                  [-0.215, y, 0.62 + out],
                  [0.43, 0, 0],
                  [0, 0.29, 0],
                  'metal',
                  0xb0_b4_aa,
                ),
            block([0, y + 0.19, 0.62 + out], [0.13, 0.02, 0.02], 'metal', DARK),
          ];
        }),
      ].flat();
    },
  },

  'water-cooler': {
    cornered: true,
    build: ({ block, panel, prism }) =>
      [
        block([0, 0, 0], [0.32, 0.95, 0.32], 'plastic', PALE),
        prism([0, 1, 0.16], 0.135, 0.36, 'glass', 0x5a_9a_d0, { top: 0.12 }),
        prism([0, 0.95, 0.16], 0.05, 0.05, 'glass', 0x5a_9a_d0, { lid: null }),
        panel([-0.11, 0.52, 0.321], [0.22, 0, 0], [0, 0.26, 0], 'rubber', DARK),
        block([-0.05, 0.68, 0.32], [0.03, 0.05, 0.035], 'plastic', 0xc0_20_20),
        block([0.05, 0.68, 0.32], [0.03, 0.05, 0.035], 'plastic', 0x20_50_c0),
        block([0, 0.52, 0.32], [0.22, 0.02, 0.07], 'plastic', 0x9a_9a_94),
      ].flat(),
  },

  copier: {
    build: ({ block, panel }) =>
      [
        block([0, 0, 0], [0.6, 0.6, 0.6], 'plastic', 0x9a_9a_94),
        block([0, 0.6, 0], [0.66, 0.3, 0.62], 'plastic', PALE),
        block([0, 0.9, 0.04], [0.6, 0.07, 0.44], 'plastic', 0xb4_b4_ac),
        block([0.1, 0.9, 0.5], [0.42, 0.03, 0.12], 'plastic', DARK),
        panel(
          [0.02, 0.931, 0.6],
          [0.14, 0, 0],
          [0, 0, -0.08],
          'screen',
          0x7a_d0_a0,
        ),
        block([-0.45, 0.68, 0.14], [0.24, 0.02, 0.36], 'plastic', 0xb4_b4_ac),
        panel(
          [-0.55, 0.701, 0.46],
          [0.2, 0, 0],
          [0, 0, -0.29],
          'paper',
          0xf0_f0_ea,
        ),
        panel([-0.28, 0.2, 0.601], [0.56, 0, 0], [0, 0.015, 0], 'rubber', DARK),
        panel([-0.28, 0.4, 0.601], [0.56, 0, 0], [0, 0.015, 0], 'rubber', DARK),
      ].flat(),
  },

  whiteboard: {
    build: ({ block, panel }, vary) => {
      const ink = oneOf([0x1a_2a_7a, 0x7a_1a_1a, 0x1a_5a_2a], vary(0));
      return [
        block([0, 1, 0], [1.2, 0.9, 0.02], 'metal', 0xb8_b8_b0),
        panel(
          [-0.57, 1.03, 0.021],
          [1.14, 0, 0],
          [0, 0.84, 0],
          'plastic',
          0xf2_f2_ee,
        ),
        block([0, 0.98, 0], [0.8, 0.02, 0.06], 'metal', 0xb8_b8_b0),
        block([-0.2, 1, 0.02], [0.12, 0.02, 0.02], 'plastic', 0xc0_20_20),
        block([0.05, 1, 0.02], [0.12, 0.02, 0.02], 'plastic', 0x20_40_a0),
        // What was being explained when everyone left.
        ...[0, 1, 2, 3].map((line) =>
          panel(
            [-0.48 + vary(2 + line) * 0.2, 1.72 - line * 0.14, 0.022],
            [0.3 + vary(6 + line) * 0.5, 0, 0],
            [0, 0.012, 0],
            'plastic',
            ink,
          ),
        ),
        panel(
          [0.1, 1.15, 0.022],
          [0.3, 0.22, 0],
          [0, 0.012, 0],
          'plastic',
          ink,
        ),
      ].flat();
    },
  },

  'cubicle-screen': {
    build: ({ block, panel }, vary) => {
      const cloth = oneOf([0x6b_7a_8a, 0x7a_7a_6a, 0x8a_6a_5a], vary(0));
      return [
        block([0, 0.08, 0], [0.05, 1.4, 1.4], 'fabric', cloth),
        block([0, 1.48, 0], [0.06, 0.03, 1.42], 'metal', STEEL),
        block([0, 0, 1.4], [0.06, 1.51, 0.04], 'metal', STEEL),
        block([0, 0, 0.2], [0.34, 0.03, 0.06], 'metal', STEEL),
        block([0, 0, 1.1], [0.34, 0.03, 0.06], 'metal', STEEL),
        panel(
          [0.026, 1, 0.75],
          [0, 0, -0.21],
          [0, 0.3, 0],
          'paper',
          0xf0_ee_e0,
        ),
        panel(
          [0.026, 0.95, 1.05],
          [0, 0, -0.2],
          [0, 0.2, 0],
          'paper',
          0xf0_e0_70,
        ),
        panel(
          [-0.026, 1.05, 0.5],
          [0, 0, 0.3],
          [0, 0.21, 0],
          'paper',
          0xe8_e8_e0,
        ),
      ].flat();
    },
  },

  bin: {
    gap: [0.02, 0.2],
    cornered: true,
    build: ({ block, prism }, vary) =>
      [
        prism([0, 0, 0.17], 0.13, 0.32, 'plastic', 0x3a_3c_40, {
          top: 0.16,
          lid: 0x0a_0a_0a,
        }),
        ...(vary(0) < 0.6
          ? block([0.03, 0.3, 0.12], [0.12, 0.06, 0.1], 'paper', 0xe8_e6_dc)
          : []),
      ].flat(),
  },

  'server-rack': {
    build: ({ block, panel }, vary) =>
      [
        block([0, 0, 0], [0.6, 2, 1], 'metal', 0x16_17_1a),
        panel(
          [-0.26, 0.06, 1.001],
          [0.52, 0, 0],
          [0, 1.88, 0],
          'glass',
          0x0c_10_14,
        ),
        ...Array.from({ length: 9 }, (_, row) =>
          panel(
            [-0.22, 0.2 + row * 0.19, 1.002],
            [0.1 + vary(row) * 0.34, 0, 0],
            [0, 0.014, 0],
            'screen',
            vary(20 + row) < 0.25 ? 0xff_90_20 : 0x30_ff_70,
          ),
        ),
        block([0, 0.9, 1], [0.03, 0.2, 0.03], 'metal', STEEL),
      ].flat(),
  },
} as const satisfies Partial<Record<Thing, Recipe>>;
