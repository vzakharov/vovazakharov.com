import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { ramp } from '@/cube/shared/lib/ease';

import { alphabetOf } from './invented';
import { type Glyph, latinGlyph } from './latin';
import { mapped, type Point, type Polyline } from './polyline';

/**
 * The hand a floor's lettering is written in: how likely a letter is to be
 * one of the floor's invented glyphs (`strangeness`, 0 to 1) and how far every
 * stroke has come loose from its glyph (`looseness`, 0 to 1).
 */
export type Script = { storey: number; strangeness: number; looseness: number };

/** The last floor written in plain Latin. */
const LAST_LATIN = 8;
/** The first floor with no Latin letter left. */
const FIRST_INVENTED = 40;
/** The last floor whose strokes hold together. */
const LAST_WHOLE = 53;
/** The floor by which the strokes are as loose as they get. */
const LOOSEST = 66;

/**
 * Floor `n`'s script: Latin on the top floors; then each letter is, with a
 * chance rising floor by floor, a glyph of the alphabet invented for that
 * floor; and on the deepest the strokes drift apart.
 */
export const scriptOf = (n: number): Script => ({
  storey: n,
  strangeness: ramp(n, LAST_LATIN, FIRST_INVENTED),
  looseness: ramp(n, LAST_WHOLE, LOOSEST),
});

/** The script everything is legible in: floor 1's. */
export const LATIN: Script = scriptOf(1);

const Decay = roll.struct({
  floor: roll.over(
    roll.key({ n: roll.int }),
    roll.struct({
      /** Where a character falls among the floor's: low is the first to go. */
      swap: roll.over(roll.key({ code: roll.int }), roll.uniform(0, 1)),
      drift: roll.over(
        roll.key({ code: roll.int, piece: roll.int }),
        roll.struct({
          dx: roll.normal(),
          dy: roll.normal(),
          turn: roll.normal(),
        }),
      ),
    }),
  ),
});

const rolled = rollWith(Decay, (path) =>
  pathHash('0')(`cube/lettering/decay/${path}`),
);

/** How far a wholly loose stroke strays, in em, at one deviation. */
const STRAY = 0.3;
/** How far a wholly loose stroke turns, in radians, at one deviation. */
const TURN = 0.9;
/** The looseness past which a stroke also breaks into pieces. */
const BREAKING = 0.5;
/** How many segments a piece holds as the breaking starts; one by the end. */
const PIECE = 8;

/** `line` cut into runs of `count` segments, each run a stroke of its own. */
function broken(line: Polyline, count: number): Polyline[] {
  const pieces: Polyline[] = [];
  for (let at = 0; at < line.length - 1; at += count) {
    pieces.push(line.slice(at, at + count + 1));
  }
  return pieces.length === 0 ? [line] : pieces;
}

function middle(line: Polyline): Point {
  let [sumX, sumY] = [0, 0];
  for (const [x, y] of line) {
    sumX += x;
    sumY += y;
  }
  const count = Math.max(line.length, 1);
  return [sumX / count, sumY / count];
}

/** `glyph` with each stroke strayed and turned as far as `script` is loose. */
function loosened(glyph: Glyph, code: number, script: Script): Glyph {
  const { looseness, storey } = script;
  if (looseness === 0) return glyph;
  const { drift } = rolled.floor.at({ n: storey });
  const run = Math.max(
    1,
    Math.round((PIECE * (1 - looseness)) / (1 - BREAKING)),
  );
  const pieces =
    looseness > BREAKING
      ? glyph.lines.flatMap((line) => broken(line, run))
      : glyph.lines;
  const lines = pieces.flatMap((line, piece) => {
    const { dx, dy, turn } = drift.at({ code, piece });
    const [cx, cy] = middle(line);
    const angle = turn * TURN * looseness;
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    return mapped([line], ([x, y]): Point => {
      const [rx, ry] = [x - cx, y - cy];
      return [
        cx + rx * cos - ry * sin + dx * STRAY * looseness,
        cy + rx * sin + ry * cos + dy * STRAY * looseness,
      ];
    });
  });
  return { ...glyph, lines };
}

/**
 * The glyph `script` writes `char` as. A letter or digit is the floor's
 * invented glyph when its own roll on that floor falls under the script's
 * strangeness, so one character is one glyph all over a floor; punctuation and
 * arrows stay Latin. Either comes loose with the script.
 */
export function glyphIn(char: string, script: Script): Glyph {
  const capital = char.toUpperCase();
  const code = capital.codePointAt(0) ?? 0;
  const { storey, strangeness } = script;
  const invented =
    strangeness > 0 &&
    rolled.floor.at({ n: storey }).swap.at({ code }) < strangeness
      ? alphabetOf(storey).get(capital)
      : undefined;
  return loosened(invented ?? latinGlyph(char), code, script);
}
