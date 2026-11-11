import { pathHash, roll, type Rolled, rollWith } from '@/dice/shared/roll';

import { type Glyph, glyphOf, GRID, LATIN_CHARS } from './latin';
import { bounds, mapped, type Point, type Polyline, smooth } from './polyline';

const Part = roll.struct({
  /** Which kind of stroke, read against the floor's weights. */
  sort: roll.uniform(0, 1),
  /** Which of the glyph's three columns it hangs on. */
  column: roll.pick(3),
  low: roll.pick(4),
  high: roll.pick(3),
  /** Which way it leans off its column: left or right. */
  lean: roll.pick(2),
  reach: roll.pick(3),
});

const Alphabets = roll.struct({
  floor: roll.over(
    roll.key({ n: roll.int }),
    roll.struct({
      /** How far the cap line stands off the baseline's upright, in em. */
      slant: roll.uniform(-0.22, 0.22),
      /** Below a half the floor's hand is angular, a rune's; above, round. */
      round: roll.uniform(0, 1),
      weights: roll.struct({
        stem: roll.uniform(0.3, 1),
        bowl: roll.uniform(0.2, 1),
        hook: roll.uniform(0.1, 1),
        bar: roll.uniform(0.2, 1),
        dot: roll.uniform(0, 0.6),
      }),
      glyph: roll.over(
        roll.key({ code: roll.int, attempt: roll.int }),
        roll.struct({
          /** Strokes past the spine, less one. */
          extra: roll.pick(3),
          wide: roll.pick(3),
          spine: Part,
          second: Part,
          third: Part,
          fourth: Part,
        }),
      ),
    }),
  ),
});

type RolledPart = Rolled<typeof Part>;
type Hand = ReturnType<Rolled<typeof Alphabets>['floor']['at']>;

/** One world for every cube: a floor's script is the same wherever it is read. */
const rolled = rollWith(Alphabets, (path) =>
  pathHash('0')(`cube/lettering/${path}`),
);

const SORTS = ['stem', 'bowl', 'hook', 'bar', 'dot'] as const;
type Sort = (typeof SORTS)[number];

/** The stroke kind `at` (0 to 1) lands on among the floor's weights. */
function sortOf(at: number, weights: Hand['weights']): Sort {
  const total = SORTS.reduce((sum, sort) => sum + weights[sort], 0);
  let left = at * total;
  for (const sort of SORTS) {
    left -= weights[sort];
    if (left < 0) return sort;
  }
  return 'stem';
}

const LOWS = [0, 0, 3, 6] as const;
const HIGHS = [12, 9, 6] as const;

/** Where a part of the grammar stands in its glyph, in grid cells. */
type Stance = {
  stemCell: number;
  footCell: number;
  headCell: number;
  /** The column its lean reaches out to. */
  leanCell: number;
  wide: number;
  round: boolean;
  part: RolledPart;
};

const DRAW: Record<Sort, (stance: Stance) => Polyline> = {
  stem: ({ stemCell, footCell, headCell }) => [
    [stemCell, footCell],
    [stemCell, headCell],
  ],
  // A round hand draws the bowl as a curve, an angular one as a wedge.
  bowl: ({ stemCell, footCell, headCell, leanCell, round }) =>
    round
      ? smooth([
          [stemCell, headCell],
          [leanCell, headCell],
          [leanCell, footCell],
          [stemCell, footCell],
        ])
      : [
          [stemCell, headCell],
          [leanCell, (headCell + footCell) / 2],
          [stemCell, footCell],
        ],
  hook({ stemCell, footCell, headCell, leanCell, round, part }) {
    const y = part.reach === 0 ? footCell : headCell;
    const corner: Polyline = [
      [stemCell, y],
      [leanCell, y],
      [leanCell, y + (y === footCell ? 3 : -3)],
    ];
    return round ? smooth(corner) : corner;
  },
  bar: ({ footCell, headCell, wide, part }) =>
    part.lean === 0
      ? [
          [0, footCell + (part.reach * (headCell - footCell)) / 2],
          [wide, footCell + (part.reach * (headCell - footCell)) / 2],
        ]
      : [
          [0, footCell],
          [wide, headCell],
        ],
  dot: ({ leanCell, part }) => [
    [leanCell, 1.5 + part.low * 3],
    [leanCell, 2.5 + part.low * 3],
  ],
};

/** One stroke of the grammar, in grid cells, in a glyph `wide` cells across. */
function partLine(
  part: RolledPart,
  sort: Sort,
  wide: number,
  round: boolean,
): Polyline {
  const stemCell = (part.column * wide) / 2;
  const footCell = LOWS[part.low] ?? 0;
  const top = HIGHS[part.high] ?? GRID;
  const headCell = top - footCell >= 3 ? top : GRID;
  // A stroke on the left column leans right and one on the right leans left,
  // so the glyph keeps to its width; the middle column leans as rolled.
  const way = stemCell === 0 ? 1 : stemCell === wide ? -1 : part.lean * 2 - 1;
  const reach = (wide / 2) * (stemCell === wide / 2 ? 1 : 1 + part.reach / 2);
  const leanCell = Math.min(Math.max(stemCell + way * reach, 0), wide);
  return DRAW[sort]({
    stemCell,
    footCell,
    headCell,
    leanCell,
    wide,
    round,
    part,
  });
}

/** The glyph the floor's hand rolls for `code` on its `attempt`-th try. */
function attemptAt(hand: Hand, code: number, attempt: number): Glyph {
  const draw = hand.glyph.at({ code, attempt });
  const wide = 4 + draw.wide * 2;
  const round = hand.round > 0.5;
  // The spine is a stem or a bowl, so every glyph stands on something.
  const spine = draw.spine.sort < 0.6 ? 'stem' : 'bowl';
  const rest = [draw.second, draw.third, draw.fourth].slice(0, draw.extra + 1);
  const cells = [
    partLine(draw.spine, spine, wide, round),
    ...rest.map((part) =>
      partLine(part, sortOf(part.sort, hand.weights), wide, round),
    ),
  ];
  const upright = mapped(cells, ([x, y]): Point => [x / GRID, y / GRID]);
  const slanted = mapped(upright, ([x, y]): Point => [x + hand.slant * y, y]);
  const [left] = bounds(slanted);
  return glyphOf(mapped(slanted, ([x, y]): Point => [x - left, y]));
}

const signature = (glyph: Glyph): string =>
  glyph.lines
    .map((line) => line.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`))
    .join('|');

/** How often a glyph is drawn again for looking like one already in use. */
const ATTEMPTS = 6;

/** The characters a floor invents glyphs for: the letters and the digits. */
export const LETTERS: readonly string[] = LATIN_CHARS.filter((char) =>
  /^[\dA-Z]$/.test(char),
);

const alphabets = new Map<number, ReadonlyMap<string, Glyph>>();

/**
 * Floor `n`'s invented alphabet, a glyph per character of `LETTERS`: strokes
 * of a grammar rolled for the floor — stems, bowls, hooks, bars, dots, in a
 * hand that is round or angular and leans its own way. It is drawn whole and
 * in one order, so a character is the same glyph wherever and whenever it is
 * read on the floor, and one that comes out like an earlier character's is
 * drawn again, up to `ATTEMPTS` times.
 */
export function alphabetOf(n: number): ReadonlyMap<string, Glyph> {
  const known = alphabets.get(n);
  if (known !== undefined) return known;
  const hand = rolled.floor.at({ n });
  const taken = new Set<string>();
  const glyphs = new Map<string, Glyph>();
  for (const char of LETTERS) {
    const code = char.codePointAt(0) ?? 0;
    let glyph = attemptAt(hand, code, 0);
    for (
      let attempt = 1;
      attempt < ATTEMPTS && taken.has(signature(glyph));
      attempt += 1
    ) {
      glyph = attemptAt(hand, code, attempt);
    }
    taken.add(signature(glyph));
    glyphs.set(char, glyph);
  }
  alphabets.set(n, glyphs);
  return glyphs;
}
