import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import type { Rgb } from '@/cube/shared/lib/colour';

import { floorSource, themeOf } from '.';
import {
  FINISH,
  type FloorTheme,
  GRADE,
  HONEYCOMB,
  LUMA,
  MATH,
  vec3f,
  type Wgsl,
} from './kit';
import { SPECIMEN } from './laboratory/index.test-only';

/**
 * Each floor's theme source as `assemble()` wrote it before its pieces moved
 * into `.wgsl` files, hashed as `tokens()` reads it: the move is pinned token
 * for token, and every difference it was allowed is undone below by name
 * before the hash is taken.
 */
const BEFORE = [
  '11734e33ae22ae91',
  '0f9fb9af67413ce8',
  '012f51e1483ea820',
  'e59120d75f3291c3',
  '7430ccca27886128',
  '189caf38c5b446fe',
  'da3972c33ab3ab7f',
  'ec574229855fc012',
  'a6ed1a9aa5cdeafa',
  'fae96d1686ccc20e',
  '21f39e9b748fbd53',
  '896d92645d777f58',
  '4948ba173bf2e188',
  '052dbd6d68ab93c1',
  'eea2a0964be98e8b',
  'd2a199b81d5acb35',
  'c0ecd6813d4fa24b',
  '32e0db67e15444a1',
  'cb6f91d074688f55',
  '3124ead42cc9d2bc',
  '3f1379c8a6e22c2d',
  'b9c4bce2cc576b58',
  '093d9cc1eb3f9d15',
  'a71eda0149a50967',
  '65d94f1ec72956f2',
  '7539ebe62645698f',
  '480f3bb8dc68a36e',
  '5ae0ebcd56cfa9f7',
  '9cef64e54db419c0',
  '933cb53ebce7aa0a',
  '1a2964f68f49c241',
  '6e393c3ca46b99be',
  'e5d486f49ba3e4b3',
  'c80b4c701dc421d2',
  '5a0bf239eba5c437',
  '2ec4bd4c77af550c',
  'f657825636a2bf45',
  '081f334e42a99b7a',
  '1be917a6cae38121',
  '68d1638600d3025a',
  '8b144e5481c212bb',
  '44a1fac55d329b1c',
  '441b6ff01a267cf5',
  '233a4da9f5d28c82',
  '8636b929e82eb532',
  'bf14a24ea7102263',
  '2fddee1d1bbdc50d',
  '20f348f7cbf3521b',
  '77d55ba74d410499',
  '05e845bbbbd2f431',
  'b717320e4b9238d4',
  '774580ebeb856b6e',
  'e32bc018a92e54d2',
  'b968fa778751c0be',
  'a2fd982ccbd94eab',
  'b8b9f19fed0a2621',
  'b9ee687943aca8e8',
  'cc0802ce06941178',
  'ec322cc4a55cf7c1',
  '034a1987232ccd99',
  '87cac382427f8fe1',
  '28c24d9cc031a58e',
  'e7247790010a1a36',
  '0dafcd6b5333c733',
  'f8f9ad22c528eb10',
  'bb301383b35429be',
];

const piece = ({ listing }: Wgsl): string => `${listing.trim()}\n\n`;

/**
 * `text` without its layout, which Prettier owns: no whitespace, no trailing
 * comma, and no `;` after a struct's closing brace.
 */
const tokens = (text: string): string =>
  text
    .replaceAll(/\s+/g, '')
    .replaceAll(/,(?=[)}])/g, '')
    .replaceAll('};', '}');

/** `source`, as `tokens()` reads it, with `now`, found exactly once, put back to `then`. */
function undo(source: string, now: string, then: string): string {
  const was = tokens(now);
  assert.equal(source.split(was).length, 2, `not found once: ${now}`);
  return source.replace(was, () => tokens(then));
}

/** `source` with each of `pairs`' first, where it occurs, put back to its second. */
function undoAll(
  source: string,
  pairs: ReadonlyArray<readonly [string, string]>,
): string {
  let then = source;
  for (const [now, before] of pairs) {
    if (then.includes(tokens(now))) then = undo(then, now, before);
  }
  return then;
}

/** Numbers that took names, each name's declaration going with it. */
const NAMED: ReadonlyArray<readonly [string, string]> = [
  [
    "/// The shared clock's ticks in a second, in an hour, and in a stuttering\n/// room's four-second spell.\nconst TICK_RATE = 12u;\nconst HOUR_TICKS = TICK_RATE * 3600u;\nconst SPELL_TICKS = TICK_RATE * 4u;\n\n",
    '',
  ],
  [
    's.time * f32(TICK_RATE)) + s.hour * HOUR_TICKS',
    's.time * 12.0) + s.hour * 43200u',
  ],
  ['tick / SPELL_TICKS', 'tick / 48u'],
  [
    "/// How far apart a unit-wide honeycomb's rows lie: √3/2.\nconst HEX_ROW = 0.8660254;\n\n",
    '',
  ],
  ['vec2f(1.0, 2.0 * HEX_ROW)', 'vec2f(1.0, 1.7320508)'],
  ['vec2f(0.5, HEX_ROW)', 'vec2f(0.5, 0.8660254)'],
  ['hex.w / HEX_ROW', 'hex.w / 0.8660254'],
  [piece(MATH), ''],
  ['l.pixel.y * PI', 'l.pixel.y * 3.14159'],
];

/** A kit piece's text as it stood before its numbers took names. */
const pieceThen = (kit: Wgsl): string => undoAll(tokens(piece(kit)), NAMED);

/** The bathroom's own lattice, which the kit's honeycomb replaced. */
const HEXAGON = `/// The hexagon of a unit-wide honeycomb a point is in: xy from its middle,
/// zw its column and row.
fn hexagon(p: vec2f) -> vec4f {
  let pitch = vec2f(1.0, 1.7320508);
  let a = repeated(p, pitch);
  let shifted = p - pitch * 0.5;
  let b = repeated(shifted, pitch);
  let own = select(b, a, dot(a, a) < dot(b, b));
  let middle = p - own;
  return vec4f(own, round(middle.x * 2.0), round(middle.y / 0.8660254));
}

`;

function bathroom(source: string): string {
  let then = undo(source, pieceThen(HONEYCOMB), '');
  then = undo(then, 'fn mosaic(', `${HEXAGON}fn mosaic(`);
  then = undo(then, 'honeycomb(s.uv / 0.05)', 'hexagon(s.uv / 0.05)');
  then = undo(then, 'i32(round(hex.z * 2.0))', 'i32(hex.z)');
  return undo(then, 'i32(round(hex.w / 0.8660254))', 'i32(hex.w)');
}

/**
 * The laboratory's floors had `luma` and `honeycomb` at the head of the
 * band's shared piece, before its first function; each now comes from the
 * kit, placed after what its floor needs first, where the floor calls it.
 */
const SPECIMEN_HEAD = '/// The word of the honeycomb cell';
const calling: Readonly<Record<number, readonly Wgsl[]>> = {
  41: [HONEYCOMB],
  42: [],
  43: [],
  46: [HONEYCOMB, LUMA],
  47: [LUMA],
  49: [LUMA],
  50: [LUMA],
  51: [HONEYCOMB],
};

function laboratory(source: string, moved: readonly Wgsl[]) {
  let then = source;
  for (const kit of moved) then = undo(then, pieceThen(kit), '');
  const head = pieceThen(LUMA) + pieceThen(HONEYCOMB);
  return undo(then, SPECIMEN_HEAD, head + SPECIMEN_HEAD);
}

/**
 * `source` with the theme's air written out where its shader names `AIR`, as
 * each floor spelled it before the assembly declared it once.
 */
function aired(source: string, air: Rgb): string {
  const then = undo(source, `const AIR = ${vec3f(air)};\n\n`, '');
  return then.replaceAll(/(?<!\w)AIR(?!\w)/g, () => tokens(vec3f(air)));
}

/**
 * Pieces a floor listed and never called, which no import can name, and the
 * text each stood before.
 */
const UNCALLED: Readonly<Record<number, readonly [Wgsl, string]>> = {
  29: [FINISH, "/// The face's paint, or `fallback` where it carries none."],
  40: [FINISH, "/// The face's paint, or `fallback` where it carries none."],
  50: [SPECIMEN, 'const WALL: u32 = 0u;'],
  65: [GRADE, 'const CLEAR = AIR;'],
};

function uncalled(source: string, n: number): string {
  const left = UNCALLED[n];
  if (left === undefined) return source;
  const [dropped, before] = left;
  return undo(source, before, piece(dropped) + before);
}

const asBefore = (n: number, theme: FloorTheme): string => {
  const moved = calling[n];
  const named = undoAll(tokens(floorSource(theme, '')), NAMED);
  const source = aired(uncalled(named, n), theme.air);
  if (n === 12) return bathroom(source);
  return moved === undefined ? source : laboratory(source, moved);
};

describe("every floor's shader source", () => {
  it('is what it was before the move, but for the differences named', () => {
    for (const [index, pinned] of BEFORE.entries()) {
      const n = index + 1;
      const source = asBefore(n, themeOf(n));
      const hash = createHash('sha256').update(source).digest('hex');
      assert.equal(hash.slice(0, 16), pinned, `floor ${String(n)}`);
    }
  });
});
