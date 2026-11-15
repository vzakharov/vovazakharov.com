import type { Thing } from '@/cube/shared/lib/thing';

import { oneOf, type Recipe } from '../lib/tools';

const DARK = 0x16_17_1a;
const CHROME = 0xc0_c4_c8;
const BRIGHT = [
  0xd0_20_20, 0xe8_b0_10, 0x20_60_c8, 0x20_90_40, 0xd0_50_a0,
] as const;

/** What stands where people wait, play or shop. */
export const LEISURE = {
  'shopping-cart': {
    gap: [0.1, 0.6],
    turn: 1.2,
    build: ({ block, panel, beam }) =>
      [
        block([0, 0.5, 0.12], [0.5, 0.42, 0.8], 'metal', CHROME),
        panel(
          [-0.22, 0.921, 0.9],
          [0.44, 0, 0],
          [0, 0, -0.76],
          'rubber',
          0x0c_0c_0e,
        ),
        ...[0.62, 0.76].flatMap((y) => [
          panel([0.251, y, 0.9], [0, 0, -0.76], [0, 0.03, 0], 'rubber', DARK),
          panel([-0.251, y, 0.14], [0, 0, 0.76], [0, 0.03, 0], 'rubber', DARK),
        ]),
        block([0, 1, 0], [0.56, 0.04, 0.04], 'plastic', 0xc0_20_20),
        beam([-0.23, 0.12, 0.2], [-0.23, 1, 0.03], 0.03, 'metal', CHROME),
        beam([0.23, 0.12, 0.2], [0.23, 1, 0.03], 0.03, 'metal', CHROME),
        block([0, 0.1, 0.12], [0.44, 0.03, 0.82], 'metal', CHROME),
        block([0, 0, 0.16], [0.46, 0.1, 0.08], 'rubber', DARK),
        block([0, 0, 0.82], [0.46, 0.1, 0.08], 'rubber', DARK),
      ].flat(),
  },

  'arcade-cabinet': {
    build: ({ block, panel, beam }, vary) => {
      const body = oneOf(
        [0x14_1a_3a, 0x1a_1a_1c, 0x3a_14_3a, 0x14_3a_2a],
        vary(0),
      );
      const art = oneOf(BRIGHT, vary(1));
      return [
        block([0, 0, 0], [0.66, 0.9, 0.75], 'wood', body),
        block([0, 0.9, 0], [0.66, 0.75, 0.42], 'wood', body),
        block([0, 0.9, 0.42], [0.66, 0.07, 0.4], 'wood', 0x2a_2a_2e),
        block([0, 1.65, 0], [0.66, 0.2, 0.52], 'wood', body),
        panel(
          [-0.27, 1.02, 0.421],
          [0.54, 0, 0],
          [0, 0.48, 0],
          'screen',
          oneOf(BRIGHT, vary(2)),
        ),
        panel([-0.3, 1.68, 0.521], [0.6, 0, 0], [0, 0.14, 0], 'screen', art),
        beam([-0.15, 0.97, 0.6], [-0.15, 1.05, 0.6], 0.02, 'metal', CHROME),
        block(
          [-0.15, 1.05, 0.58],
          [0.045, 0.045, 0.045],
          'plastic',
          0xd0_20_20,
        ),
        ...[0.02, 0.1, 0.18].map((x, button) =>
          panel(
            [x, 0.971, 0.66],
            [0.045, 0, 0],
            [0, 0, -0.045],
            'plastic',
            oneOf(BRIGHT, (button + 1) / 5),
          ),
        ),
        panel(
          [-0.12, 0.3, 0.751],
          [0.24, 0, 0],
          [0, 0.3, 0],
          'metal',
          0x2a_2a_2e,
        ),
        panel(
          [-0.06, 0.44, 0.752],
          [0.04, 0, 0],
          [0, 0.06, 0],
          'screen',
          0xff_70_20,
        ),
        panel(
          [0.02, 0.44, 0.752],
          [0.04, 0, 0],
          [0, 0.06, 0],
          'screen',
          0xff_70_20,
        ),
        panel([0.331, 0.3, 0.7], [0, 0, -0.6], [0, 0.12, 0], 'plastic', art),
        panel([-0.331, 0.3, 0.1], [0, 0, 0.6], [0, 0.12, 0], 'plastic', art),
      ].flat();
    },
  },

  'chair-stack': {
    cornered: true,
    build: ({ block, beam, slab }, vary) => {
      const shell = oneOf(
        [0xd0_60_20, 0x2a_5a_9a, 0x8a_8a_84, 0x9a_2a_2a],
        vary(0),
      );
      const chairs = 4;
      const top = 0.45 + (chairs - 1) * 0.1;
      return [
        ...Array.from({ length: chairs }, (_, chair) =>
          block(
            [0, 0.45 + chair * 0.1, 0.06 + chair * 0.035],
            [0.46, 0.03, 0.44],
            'plastic',
            shell,
          ),
        ),
        // Every back at once: they nest, leaning the way the stack creeps.
        slab(
          [-0.22, 0.48, 0.03],
          [
            [0.44, 0, 0],
            [0, top - 0.45 + 0.42, 0.105 + 0.02],
            [0, -0.01, 0.03],
          ],
          'plastic',
          shell,
        ),
        ...[-0.2, 0.2].flatMap((x) => [
          beam([x, 0.02, 0.04], [x, top, 0.2], 0.025, 'metal', CHROME),
          beam([x, 0, 0.56], [x, top, 0.56], 0.025, 'metal', CHROME),
        ]),
      ].flat();
    },
  },

  slide: {
    build: ({ block, slab }, vary) => {
      const chute = oneOf(BRIGHT, vary(0));
      const frame = oneOf([0x2a_5a_9a, 0x2a_7a_3a, 0x8a_8a_84], vary(1));
      // The chute's bed, from the platform's lip down to a hand over the floor.
      const run = [0, -0.92, 1.75] as const;
      const across = [0.5, 0, 0] as const;
      return [
        block([-0.27, 0, 0.02], [0.04, 1.6, 0.6], 'metal', frame),
        block([0.27, 0, 0.02], [0.04, 1.6, 0.6], 'metal', frame),
        block([0, 1.05, 0.02], [0.5, 0.05, 0.6], 'metal', frame),
        ...[0.3, 0.6].map((y) =>
          block([-0.34, y, 0.1], [0.1, 0.03, 0.44], 'metal', frame),
        ),
        slab(
          [-0.25, 1.06, 0.62],
          [across, [0, 0.035, 0.018], run],
          'plastic',
          chute,
        ),
        slab(
          [-0.25, 1.09, 0.62],
          [[0.03, 0, 0], [0, 0.11, 0.057], run],
          'plastic',
          chute,
        ),
        slab(
          [0.22, 1.09, 0.62],
          [[0.03, 0, 0], [0, 0.11, 0.057], run],
          'plastic',
          chute,
        ),
        block([0, 0, 2.3], [0.44, 0.14, 0.05], 'metal', frame),
      ].flat();
    },
  },

  'pool-ladder': {
    build: ({ beam, block }) =>
      [
        ...[-0.24, 0.24].flatMap((x) => [
          beam([x, 0, 0.5], [x, 0.85, 0.5], 0.04, 'metal', CHROME),
          beam([x, 0.85, 0.5], [x, 1.02, 0.36], 0.04, 'metal', CHROME),
          beam([x, 1.02, 0.36], [x, 1.02, 0.02], 0.04, 'metal', CHROME),
        ]),
        ...[0.2, 0.45, 0.7].map((y) =>
          block([0, y, 0.45], [0.48, 0.03, 0.1], 'plastic', 0xe8_e8_e0),
        ),
      ].flat(),
  },

  balloon: {
    gap: [0.1, 0.6],
    build: ({ prism, block, beam }, vary) => {
      const skin = oneOf(BRIGHT, vary(0));
      const sway = (vary(1) - 0.5) * 0.2;
      return [
        prism([0, 2, 0.15], 0.05, 0.1, 'rubber', skin, {
          sides: 6,
          top: 0.14,
          lid: null,
        }),
        prism([0, 2.1, 0.15], 0.14, 0.09, 'rubber', skin, {
          sides: 6,
          lid: null,
        }),
        prism([0, 2.19, 0.15], 0.14, 0.11, 'rubber', skin, {
          sides: 6,
          top: 0.06,
        }),
        block([0, 1.97, 0.135], [0.03, 0.03, 0.03], 'rubber', skin),
        beam([0, 1.97, 0.15], [sway, 0.95, 0.15], 0.008, 'paper', 0xf0_f0_ea),
      ].flat();
    },
  },

  mannequin: {
    gap: [0.05, 0.5],
    turn: 0.7,
    build: ({ block, prism, beam }, vary) => {
      const body = oneOf(
        [0xd8_cd_bf, 0xc8_b8_a8, 0xe8_e4_dc, 0x2a_2a_2c],
        vary(0),
      );
      // One arm hangs; the other is wherever it was last posed.
      const reach = vary(1);
      const hand = [
        0.3 + reach * 0.25,
        0.82 + reach * 0.9,
        0.2 + (vary(2) - 0.3) * 0.3,
      ] as const;
      return [
        prism([0, 0, 0.2], 0.2, 0.025, 'metal', CHROME),
        block([-0.09, 0.025, 0.13], [0.13, 0.85, 0.14], 'plastic', body),
        block([0.09, 0.025, 0.13], [0.13, 0.85, 0.14], 'plastic', body),
        block([0, 0.875, 0.11], [0.36, 0.58, 0.19], 'plastic', body),
        block([0, 1.455, 0.16], [0.09, 0.08, 0.09], 'plastic', body),
        block([0, 1.535, 0.11], [0.16, 0.22, 0.19], 'plastic', body),
        beam([-0.22, 1.42, 0.2], [-0.25, 0.82, 0.22], 0.09, 'plastic', body),
        beam([0.22, 1.42, 0.2], hand, 0.09, 'plastic', body),
      ].flat();
    },
  },
} as const satisfies Partial<Record<Thing, Recipe>>;
