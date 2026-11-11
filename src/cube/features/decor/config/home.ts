import type { Thing } from '@/cube/shared/lib/thing';

import { oneOf, type Recipe, type Tools, type Vary } from '../lib/tools';

const DARK = 0x16_17_1a;
const WALNUT = 0x4a_30_1c;
const LINEN = 0xd8_d2_c0;

const UPHOLSTERY = [
  0x6a_6a_3a, 0xa8_7a_2a, 0x5a_3a_2a, 0x2a_5a_5a, 0x7a_2a_30, 0x6a_6a_70,
] as const;

const paler = (channel: number) => Math.min(255, channel + 24);

/** `shade` a little lighter, for a cushion on what it covers. */
const lighter = (shade: number): number => {
  return (
    (paler(shade >> 16) << 16) |
    (paler((shade >> 8) & 255) << 8) |
    paler(shade & 255)
  );
};

/** A sofa `wide` across with `seats` cushions; one seat makes it an armchair. */
const seat =
  (wide: number, seats: number) =>
  ({ block }: Tools, vary: Vary) => {
    const cloth = oneOf(UPHOLSTERY, vary(0));
    const cushion = (wide - 0.4) / seats;
    return [
      block([0, 0.1, 0], [wide, 0.3, 0.9], 'fabric', cloth),
      block([0, 0.4, 0], [wide, 0.45, 0.25], 'fabric', cloth),
      block([-wide / 2 + 0.1, 0.4, 0.25], [0.2, 0.2, 0.65], 'fabric', cloth),
      block([wide / 2 - 0.1, 0.4, 0.25], [0.2, 0.2, 0.65], 'fabric', cloth),
      ...Array.from({ length: seats }, (_, at) =>
        block(
          [(at - (seats - 1) / 2) * cushion, 0.4, 0.25],
          [cushion - 0.02, 0.12, 0.62],
          'fabric',
          lighter(cloth),
        ),
      ),
      block([0, 0, 0.06], [wide - 0.1, 0.1, 0.06], 'wood', WALNUT),
      block([0, 0, 0.78], [wide - 0.1, 0.1, 0.06], 'wood', WALNUT),
    ].flat();
  };

/** What a home is furnished with. */
export const HOME = {
  sofa: { build: seat(1.9, 2) },

  armchair: { build: seat(0.95, 1), cornered: true },

  'floor-lamp': {
    cornered: true,
    gap: [0.03, 0.12],
    build: ({ prism, beam }, vary) =>
      [
        prism([0, 0, 0.23], 0.16, 0.03, 'metal', DARK),
        beam([0, 0.03, 0.23], [0, 1.4, 0.23], 0.025, 'metal', 0xb0_9a_60),
        prism([0, 1.36, 0.23], 0.21, 0.3, 'paper', 0xf0_dc_b0, {
          top: 0.13,
          lid: oneOf([0xf0_dc_b0, 0xff_f4_d0], vary(0)),
        }),
      ].flat(),
  },

  tv: {
    build: ({ block, panel, beam }) =>
      [
        block([0, 0, 0], [1.1, 0.45, 0.42], 'wood', WALNUT),
        block([0, 0.45, 0.02], [0.72, 0.56, 0.38], 'plastic', 0x2a_26_22),
        panel(
          [-0.32, 0.51, 0.401],
          [0.48, 0, 0],
          [0, 0.42, 0],
          'screen',
          0xc8_d4_e0,
        ),
        panel([0.2, 0.51, 0.401], [0.12, 0, 0], [0, 0.42, 0], 'rubber', DARK),
        block([0.26, 0.82, 0.4], [0.05, 0.05, 0.02], 'metal', 0xb0_b0_a8),
        block([0.26, 0.72, 0.4], [0.05, 0.05, 0.02], 'metal', 0xb0_b0_a8),
        beam([0, 1.01, 0.2], [-0.3, 1.45, 0.16], 0.012, 'metal', 0xb0_b0_a8),
        beam([0, 1.01, 0.2], [0.3, 1.45, 0.16], 0.012, 'metal', 0xb0_b0_a8),
      ].flat(),
  },

  bed: {
    build: ({ block }, vary) => {
      const blanket = oneOf(
        [0x7a_2a_30, 0x2a_3a_6a, 0x5a_6a_3a, 0xa8_8a_3a, 0x8a_8a_90],
        vary(0),
      );
      return [
        block([0, 0, 0], [1, 0.88, 0.06], 'wood', WALNUT),
        block([0, 0, 0.1], [0.84, 0.15, 1.85], 'wood', DARK),
        block([0, 0.15, 0.06], [0.96, 0.2, 1.96], 'wood', WALNUT),
        block([0, 0.35, 0.08], [0.9, 0.17, 1.9], 'fabric', LINEN),
        block([0, 0.52, 0.12], [0.6, 0.1, 0.36], 'fabric', 0xee_ea_e0),
        block([0, 0.5, 0.62], [0.94, 0.045, 1.38], 'fabric', blanket),
      ].flat();
    },
  },

  mattress: {
    gap: [0.02, 0.3],
    build: ({ slab, panel }, vary) => {
      const ticking = 0x7a_8a_a0;
      if (vary(0) < 0.45) {
        // Stood on its edge against the wall.
        const lean = [0, 1.86, -0.38] as const;
        return [
          slab(
            [-0.45, 0, 0.4],
            [[0.9, 0, 0], lean, [0, 0.04, 0.19]],
            'fabric',
            LINEN,
          ),
          ...[0.15, 0.4, 0.65, 0.9].map((up) =>
            panel(
              [-0.45, up * 1.86 + 0.041, 0.4 + up * -0.38 + 0.191],
              [0.9, 0, 0],
              [0, 0.05, -0.0102],
              'fabric',
              ticking,
            ),
          ),
        ].flat();
      }
      return [
        slab(
          [-0.45, 0, 0],
          [
            [0.9, 0, 0],
            [0, 0.19, 0],
            [0, 0, 1.9],
          ],
          'fabric',
          LINEN,
        ),
        ...[0.2, 0.6, 1, 1.4, 1.8].map((z) =>
          panel(
            [-0.45, 0.191, z],
            [0.9, 0, 0],
            [0, 0, -0.05],
            'fabric',
            ticking,
          ),
        ),
      ].flat();
    },
  },

  wardrobe: {
    build: ({ block, panel, slab }, vary) => {
      const wood = oneOf([0x4a_30_1c, 0x6a_4a_2a, 0x2a_22_1c], vary(0));
      const ajar = vary(1) < 0.4;
      const swing = 0.45;
      return [
        block([0, 0, 0], [1.2, 2, 0.6], 'wood', wood),
        block([0, 2, 0], [1.26, 0.05, 0.63], 'wood', wood),
        panel(
          [0.01, 0.08, 0.601],
          [0.57, 0, 0],
          [0, 1.86, 0],
          'wood',
          lighter(wood),
        ),
        block([0.07, 1, 0.6], [0.02, 0.14, 0.03], 'metal', 0xb0_9a_60),
        // The other door, shut or stood a little open on the dark inside.
        ...(ajar
          ? [
              panel(
                [-0.58, 0.08, 0.601],
                [0.57, 0, 0],
                [0, 1.86, 0],
                'rubber',
                0x05_05_06,
              ),
              slab(
                [-0.58, 0.08, 0.6],
                [
                  [0.57 * Math.cos(swing), 0, 0.57 * Math.sin(swing)],
                  [0, 1.86, 0],
                  [-0.02 * Math.sin(swing), 0, 0.02 * Math.cos(swing)],
                ],
                'wood',
                lighter(wood),
              ),
            ]
          : [
              panel(
                [-0.58, 0.08, 0.601],
                [0.57, 0, 0],
                [0, 1.86, 0],
                'wood',
                lighter(wood),
              ),
              block([-0.07, 1, 0.6], [0.02, 0.14, 0.03], 'metal', 0xb0_9a_60),
            ]),
      ].flat();
    },
  },

  bookshelf: {
    build: ({ block, panel }, vary) => {
      const spines = [
        0x7a_2a_2a, 0x2a_4a_6a, 0x3a_5a_3a, 0xa8_8a_4a, 0x4a_3a_5a, 0xc8_c0_a8,
      ] as const;
      return [
        block([0, 0, 0], [0.9, 1.9, 0.3], 'wood', 0x5a_3c_22),
        ...Array.from({ length: 5 }, (_, shelf) => {
          const y = 0.1 + shelf * 0.36;
          return [
            panel(
              [-0.41, y, 0.301],
              [0.82, 0, 0],
              [0, 0.32, 0],
              'rubber',
              0x08_07_06,
            ),
            ...[0, 1, 2].map((run) => {
              const from = -0.4 + run * 0.27 + vary(shelf * 6 + run) * 0.04;
              return panel(
                [from, y, 0.302],
                [0.12 + vary(shelf * 6 + run + 3) * 0.1, 0, 0],
                [0, 0.2 + vary(40 + shelf * 3 + run) * 0.09, 0],
                'paper',
                oneOf(spines, vary(60 + shelf * 3 + run)),
              );
            }),
          ].flat();
        }),
      ].flat();
    },
  },

  rug: {
    gap: [0.2, 0.6],
    turn: 0.3,
    build: ({ panel }, vary) => {
      const field = oneOf(
        [0x7a_1f_24, 0x1f_3a_5a, 0x5a_5a_3a, 0x8a_6a_3a],
        vary(0),
      );
      const layer = (inset: number, lift: number, paint: number) =>
        panel(
          [-0.8 + inset, lift, 1.1 - inset],
          [1.6 - 2 * inset, 0, 0],
          [0, 0, -(1.1 - 2 * inset)],
          'fabric',
          paint,
        );
      return [
        layer(0, 0.008, 0xd8_c8_a0),
        layer(0.07, 0.009, field),
        layer(0.2, 0.01, 0xd8_c8_a0),
        layer(0.24, 0.011, field),
        layer(0.42, 0.012, lighter(field)),
      ].flat();
    },
  },
} as const satisfies Partial<Record<Thing, Recipe>>;
