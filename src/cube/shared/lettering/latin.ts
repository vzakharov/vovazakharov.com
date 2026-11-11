import { bounds, type Point, type Polyline, smooth } from './polyline';

/**
 * A character as pen strokes in em units: the cap height is 1, the baseline
 * y = 0, the glyph's left edge x = 0, and the next character starts `advance`
 * to the right.
 */
export type Glyph = { lines: readonly Polyline[]; advance: number };

/** How many cells of the drawing grid make the cap height. */
export const GRID = 12;

/** The gap after a glyph, in grid cells. */
const GAP = 3;

/** A word space's advance, in em. */
const SPACE = 0.5;

/**
 * Each glyph as strokes on a grid 12 cells tall, a point as two hex digits
 * `xy`. A stroke opening with `~` is the control polygon of a curve — a
 * rectangle's corners give a bowl — and one whose last point is its first is a
 * loop.
 */
const DRAWN: Readonly<Record<string, readonly string[]>> = {
  A: ['00 4c 80', '13 73'],
  B: ['00 0c', '~0c 7c 76 06', '~06 86 80 00'],
  C: ['~89 8c 0c 00 80 83'],
  D: ['00 0c', '~0c 8c 80 00'],
  E: ['80 00 0c 8c', '06 66'],
  F: ['00 0c 8c', '06 66'],
  G: ['~89 8c 0c 00 80 85', '85 45'],
  H: ['00 0c', '80 8c', '06 86'],
  I: ['20 2c', '00 40', '0c 4c'],
  J: ['~6c 60 00 03'],
  K: ['00 0c', '8c 05', '37 80'],
  L: ['0c 00 80'],
  M: ['00 0c 46 8c 80'],
  N: ['00 0c 80 8c'],
  O: ['~00 80 8c 0c 00'],
  P: ['00 0c', '~0c 8c 85 05'],
  Q: ['~00 80 8c 0c 00', '53 80'],
  R: ['00 0c', '~0c 8c 85 05', '45 80'],
  S: ['~8a 8c 0c 06 86 80 00 02'],
  T: ['4c 40', '0c 8c'],
  U: ['~0c 00 80 8c'],
  V: ['0c 40 8c'],
  W: ['0c 20 47 60 8c'],
  X: ['00 8c', '0c 80'],
  Y: ['0c 46 8c', '46 40'],
  Z: ['0c 8c 00 80'],
  '0': ['~00 60 6c 0c 00'],
  '1': ['09 3c 30', '00 60'],
  '2': ['~09 0c 6c 66 00', '00 60'],
  '3': ['~0b 0c 6c 66 26', '~26 66 60 00 01'],
  '4': ['50 5c 03 73'],
  '5': ['6c 0c 07', '~07 67 60 00 01'],
  '6': ['~6b 6c 0c 00 60 66 06'],
  '7': ['0c 6c 20'],
  '8': ['~16 56 5c 1c 16', '~00 60 66 06 00'],
  '9': ['~01 00 60 6c 0c 06 66'],
  '.': ['00 01'],
  ',': ['11 00'],
  '!': ['0c 04', '01 00'],
  '?': ['~09 0c 6c 66 36 34', '31 30'],
  ':': ['07 08', '00 01'],
  ';': ['07 08', '11 00'],
  '-': ['06 46'],
  '–': ['06 86'],
  "'": ['0c 0a'],
  '"': ['0c 0a', '2c 2a'],
  '(': ['~2c 0a 02 20'],
  ')': ['~0c 2a 22 00'],
  '/': ['00 6c'],
  '+': ['06 66', '39 33'],
  '=': ['04 64', '08 68'],
  '%': ['00 6c', '~09 29 2c 0c 09', '~40 60 63 43 40'],
  '&': ['~80 19 1c 5c 58 04 00 50 84'],
  '#': ['20 3c', '50 6c', '04 84', '08 88'],
  $: ['~6a 6c 0c 06 66 60 00 02', '3c 30'],
  '*': ['39 33', '07 65', '05 67'],
  '×': ['03 69', '09 63'],
  '~': ['~05 07 37 35 65 67'],
  // A small u on a long stem, the micro sign of a caption's units.
  µ: ['09 00', '~09 03 63 69', '69 63'],
  '→': ['06 86', '59 86 53'],
  '←': ['86 06', '39 06 33'],
  '↑': ['40 4c', '19 4c 79'],
  '↓': ['4c 40', '13 40 73'],
};

/** The box drawn for a character the font has no glyph for. */
const MISSING = ['00 60 6c 0c 00'] as const;

const cell = (digit: string): number => Number.parseInt(digit, 16) / GRID;

function stroke(drawn: string): Polyline {
  const curved = drawn.startsWith('~');
  const points = (curved ? drawn.slice(1) : drawn)
    .split(' ')
    .map((pair): Point => [cell(pair.charAt(0)), cell(pair.charAt(1))]);
  return curved ? smooth(points) : points;
}

/** A glyph of `lines`, advancing past their right edge and the gap. */
export const glyphOf = (lines: readonly Polyline[]): Glyph => ({
  lines,
  advance: bounds(lines)[2] + GAP / GRID,
});

const LATIN = new Map(
  Object.entries(DRAWN).map(([char, drawn]) => [
    char,
    glyphOf(drawn.map((each) => stroke(each))),
  ]),
);

const BOX = glyphOf(MISSING.map((each) => stroke(each)));

const BLANK: Glyph = { lines: [], advance: SPACE };

/** Every character the font draws a glyph of its own for. */
export const LATIN_CHARS: readonly string[] = [...LATIN.keys()];

/**
 * The Latin glyph of `char`: a capital for either case, a blank for white
 * space, a box for anything the font does not draw.
 */
export function latinGlyph(char: string): Glyph {
  if (char.trim() === '') return BLANK;
  return LATIN.get(char) ?? LATIN.get(char.toUpperCase()) ?? BOX;
}
