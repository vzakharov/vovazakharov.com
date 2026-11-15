import { SHRUB, shrubHeight } from '@/cube/shared/lib/shrub';
import type { Thing } from '@/cube/shared/lib/thing';

import { oneOf, type Recipe } from '../lib/tools';

const DARK = 0x16_17_1a;
const ALUMINIUM = 0xb0_b4_b8;
const CARDBOARD = 0xa8_82_4e;

/** What stands about on the floor of any building. */
export const CLUTTER = {
  'potted-plant': {
    cornered: true,
    gap: [0.02, 0.1],
    build: ({ prism, beam }, vary) => {
      const { pot, stem, lean, out, foliage, sides } = SHRUB;
      const tall = SHRUB.tall(vary(0));
      const leaf = oneOf([0x2a_6a_2a, 0x3a_7a_30, 0x1f_5a_3a], vary(1));
      return [
        prism([0, 0, out], pot.foot, pot.height, 'plastic', 0x9a_50_30, {
          top: pot.rim,
          lid: 0x2a_1a_10,
        }),
        beam(
          [0, pot.height, out],
          [lean, pot.height + tall, out],
          stem,
          'wood',
          0x4a_30_1c,
        ),
        ...foliage.slice(1).map((turn, below) => {
          const from = foliage[below] ?? turn;
          const foot = shrubHeight(from.at, tall);
          return prism(
            [below === 0 ? 0 : lean, foot, out],
            from.radius,
            shrubHeight(turn.at, tall) - foot,
            'foliage',
            leaf,
            { sides, top: turn.radius },
          );
        }),
      ].flat();
    },
  },

  'cardboard-box': {
    gap: [0.02, 0.4],
    turn: 0.5,
    build: ({ block, panel }, vary) => {
      const tape = 0xd8_c4_90;
      const boxed = (x: number, y: number, z: number, size: number) => [
        ...block([x, y, z], [size, size * 0.7, size * 0.8], 'paper', CARDBOARD),
        ...panel(
          [x - 0.03, y + size * 0.7 + 0.001, z + size * 0.8],
          [0.06, 0, 0],
          [0, 0, -size * 0.8],
          'paper',
          tape,
        ),
        ...panel(
          [x - 0.03, y + size * 0.45, z + size * 0.8 + 0.001],
          [0.06, 0, 0],
          [0, size * 0.25, 0],
          'paper',
          tape,
        ),
      ];
      return [
        boxed(0, 0, 0, 0.55),
        vary(0) < 0.5 ? boxed(0.05, 0.385, 0.03, 0.4) : [],
        vary(1) < 0.35 ? boxed(0.52, 0, 0.06, 0.38) : [],
      ].flat();
    },
  },

  bench: {
    build: ({ block }, vary) => {
      const slat = oneOf([0x8a_5a_30, 0x6a_7a_5a, 0x9a_8a_6a], vary(0));
      return [
        ...[0.02, 0.16, 0.3].map((z) =>
          block([0, 0.42, z], [1.5, 0.04, 0.12], 'wood', slat),
        ),
        block([0, 0.58, 0], [1.5, 0.1, 0.03], 'wood', slat),
        block([0, 0.74, 0], [1.5, 0.1, 0.03], 'wood', slat),
        ...[-0.62, 0.62].flatMap((x) => [
          block([x, 0, 0.03], [0.05, 0.42, 0.4], 'metal', DARK),
          block([x, 0.42, 0.03], [0.05, 0.44, 0.04], 'metal', DARK),
        ]),
      ].flat();
    },
  },

  locker: {
    build: ({ block, panel }, vary) => {
      const body = oneOf(
        [0x5a_6a_7a, 0x5a_7a_5a, 0xa8_9a_78, 0xb0_5a_2a, 0x7a_7a_78],
        vary(0),
      );
      // One door of the bank hangs open on what it was left holding: nothing.
      const open = Math.floor(vary(1) * 6);
      return [
        block([0, 0, 0], [0.92, 1.8, 0.45], 'metal', body),
        ...[-0.3, 0, 0.3].flatMap((x, door) => [
          panel(
            [x - 0.14, 0.08, 0.451],
            [0.28, 0, 0],
            [0, 1.68, 0],
            'metal',
            door === open ? 0x0a_0a_0c : 0xc8_c8_c0,
          ),
          ...(door === open
            ? [
                block(
                  [x - 0.14, 0.08, 0.45],
                  [0.015, 1.68, 0.27],
                  'metal',
                  body,
                ),
              ]
            : [
                panel(
                  [x - 0.1, 1.5, 0.452],
                  [0.2, 0, 0],
                  [0, 0.02, 0],
                  'rubber',
                  DARK,
                ),
                panel(
                  [x - 0.1, 1.44, 0.452],
                  [0.2, 0, 0],
                  [0, 0.02, 0],
                  'rubber',
                  DARK,
                ),
                block([x + 0.1, 0.9, 0.45], [0.02, 0.1, 0.03], 'metal', DARK),
              ]),
        ]),
      ].flat();
    },
  },

  'vending-machine': {
    build: ({ block, panel }, vary) => {
      const body = oneOf(
        [0xb0_1c_1c, 0x1c_3a_9a, 0x1c_7a_4a, 0xd8_d4_c8],
        vary(0),
      );
      return [
        block([0, 0, 0], [0.9, 1.83, 0.8], 'plastic', body),
        panel(
          [-0.39, 0.55, 0.801],
          [0.56, 0, 0],
          [0, 1.15, 0],
          'screen',
          0xff_ee_c8,
        ),
        ...Array.from({ length: 12 }, (_, item) =>
          panel(
            [
              -0.36 + (item % 4) * 0.135,
              0.62 + Math.floor(item / 4) * 0.36,
              0.802,
            ],
            [0.09, 0, 0],
            [0, 0.2, 0],
            'plastic',
            oneOf(
              [0xc0_30_20, 0x20_60_c0, 0xd0_a0_20, 0x30_90_40, 0x80_30_90],
              vary(1 + item),
            ),
          ),
        ),
        panel([-0.39, 0.2, 0.801], [0.56, 0, 0], [0, 0.22, 0], 'rubber', DARK),
        panel(
          [0.23, 0.9, 0.801],
          [0.14, 0, 0],
          [0, 0.3, 0],
          'metal',
          ALUMINIUM,
        ),
        panel(
          [0.24, 1.3, 0.801],
          [0.12, 0, 0],
          [0, 0.06, 0],
          'screen',
          0xff_60_30,
        ),
      ].flat();
    },
  },

  'wet-floor-sign': {
    gap: [0.25, 0.6],
    turn: Math.PI,
    build: ({ slab, panel }) => {
      const yellow = 0xf2_c2_00;
      return [0, 1].flatMap((leaf) => {
        const lean = leaf === 0 ? 1 : -1;
        const foot = 0.2 + lean * 0.16;
        const top = 0.2 + lean * 0.015;
        const rise = [0, 0.62, top - foot] as const;
        // On the leaf's outer face, from `from` to `to` of the way up it.
        const mark = (from: number, to: number, inset: number) =>
          panel(
            [
              -lean * (0.15 - inset),
              from * 0.62,
              foot + from * (top - foot) + lean * 0.004,
            ],
            [lean * (0.3 - 2 * inset), 0, 0],
            [0, (to - from) * 0.62, (to - from) * (top - foot)],
            'plastic',
            DARK,
          );
        return [
          slab(
            [-0.15, 0, lean === 1 ? foot - 0.012 : foot],
            [[0.3, 0, 0], rise, [0, 0, 0.012]],
            'plastic',
            yellow,
          ),
          mark(0.25, 0.6, 0.06),
          mark(0.7, 0.8, 0.11),
        ].flat();
      });
    },
  },

  'traffic-cone': {
    gap: [0.1, 0.6],
    turn: 0.8,
    build: ({ block, prism }) =>
      [
        block([0, 0, 0], [0.36, 0.03, 0.36], 'rubber', 0xe8_50_10),
        prism([0, 0.03, 0.18], 0.13, 0.5, 'plastic', 0xf0_5a_10, { top: 0.03 }),
        prism([0, 0.25, 0.18], 0.086, 0.1, 'plastic', 0xf0_f0_e8, {
          top: 0.066,
          lid: null,
        }),
      ].flat(),
  },

  ladder: {
    cornered: true,
    build: ({ beam, block }) => {
      const foot = 0.62;
      const head = 2.1;
      return [
        ...[-0.2, 0.2].map((x) =>
          beam([x, 0.03, foot], [x, head, 0.03], 0.05, 'metal', ALUMINIUM),
        ),
        ...Array.from({ length: 6 }, (_, rung) => {
          const up = (rung + 0.7) / 6.6;
          return block(
            [0, up * head, foot + up * (0.03 - foot) - 0.02],
            [0.36, 0.03, 0.04],
            'metal',
            ALUMINIUM,
          );
        }),
      ].flat();
    },
  },
} as const satisfies Partial<Record<Thing, Recipe>>;
