import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import type { Rgb } from '@/cube/shared/lib/colour';

import { floorSource, themeOf } from '.';
import { CARPET } from './edge/index.test-only';
import {
  FINISH,
  type FloorTheme,
  GRADE,
  HONEYCOMB,
  LUMA,
  MATH,
  SCENE,
  vec3f,
  type Wgsl,
} from './kit';
import { SMALL_WORLD } from './laboratory/index.test-only';

/**
 * Each floor's theme source as `assemble()` wrote it before its pieces moved
 * into `.wgsl` files, hashed as `tokens()` reads it: the move is pinned token
 * for token, and every difference it was allowed is undone below by name
 * before the hash is taken.
 */
const BEFORE = [
  '1f6b1b4ecaf3c26a',
  'e24fc8c0da052034',
  '14c72b793b2b2adb',
  '79fb266e2d84ce02',
  'cc8dacf3d9b3cda2',
  'fdec9433469bdd7b',
  'c23a6554a74a8163',
  '1c7ca8582997db72',
  '0e83e66390de4ff3',
  '19c41b091e265a95',
  'e2ce2c0e001de4e9',
  'ff0ecfda805cc5df',
  '11a8ca5346d27f1c',
  'c0724ae9db9437fa',
  'eaa27fe78a77dbdd',
  '4324385bfb8e77e5',
  'da863b437563f1d3',
  '5baf0d22696788cf',
  'e2f41a73649bf372',
  '31be903a2a504368',
  '12f9ccf3ccdbb8ec',
  '6c1d06425f6495c8',
  '756b324bd43d14db',
  'bac0fbafb1bbbe10',
  'b4b3523cf9f3a42c',
  'c8c741c838fba4c8',
  '27d8b98448c46742',
  '671e64e53cbb0ac0',
  'b78463e0996befa0',
  '33f7971632ac8ee4',
  '6f491cec5042cd6a',
  '43edd222e23f0377',
  'a0f7b63959b34c94',
  '2b531965f34a97e8',
  '4918e988c57964c9',
  '89ff9a2de6580057',
  'a01844a4f5ce581d',
  '0f383ebd7336d0aa',
  '1dba00dae85cf96c',
  '0af30728ebb57b95',
  '257fa86192873421',
  '33dddfe9fd5c2912',
  '5843c30fbfd84a14',
  '4a7989cc9b0e0c70',
  'aeb33db466fe40fc',
  '493eefb24a23dbee',
  '8fe7f7b6ca018c31',
  '6c577e93fe0ecfd4',
  'b2a7582d152142d7',
  '60cebc8c97bdfed4',
  'ce095c9361b98644',
  '20b364ec6f48f183',
  '51b7086ec5c9ecff',
  '1f642fd6574793fe',
  'bbbd4e2ca498cde1',
  '9334609f64a490e7',
  '101c0ae913de4d6d',
  '16207b2bcbfe2f41',
  '644a487dbc034356',
  '41f0f3f5bbf5e59e',
  '521fdc54fc94d3e3',
  'ec1dc94d05aa0188',
  '7732f9d68aeecd90',
  'ed5c641c32516d9c',
  'e17b0bf156fc33ff',
  '5bd509bfc71a7929',
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
  // The scene a lens reads, which the stage declared before the kit did.
  [piece(SCENE), ''],
  // The shell turn's functions, which gained their docs in a .wgsl file.
  ['/// A way in the room frame as the shell frame has it.', ''],
  ['/// A way in the shell frame as the room frame has it.', ''],
  [
    "/// A point of the room frame, in metres from the north-west corner of floor\n/// 1's room, in the shell frame, from the cube's north-west corner.",
    '',
  ],
  ['/// A point of the shell frame in the room frame.', ''],
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
const SMALL_WORLD_HEAD = '/// The word of the honeycomb cell';
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
  return undo(then, SMALL_WORLD_HEAD, head + SMALL_WORLD_HEAD);
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
  50: [SMALL_WORLD, 'const WALL: u32 = 0u;'],
  65: [GRADE, 'const CLEAR = AIR;'],
};

function uncalled(source: string, n: number): string {
  const left = UNCALLED[n];
  if (left === undefined) return source;
  const [dropped, before] = left;
  return undo(source, before, piece(dropped) + before);
}

/**
 * The home's carpets, a piece of their own since the floor outgrew a file:
 * they stood in the floor's own text, around its lime.
 */
function home(source: string): string {
  const carpet = tokens(piece(CARPET));
  const [head = '', tail = ''] = carpet.split(/(?=\/\/Whatacarpet)/);
  const lime = 'const LIME = vec3f(0.5, 0.46, 0.38);';
  return undo(undo(source, carpet, ''), lime, head + tokens(lime) + tail);
}

const asBefore = (n: number, theme: FloorTheme): string => {
  const moved = calling[n];
  const named = undoAll(tokens(floorSource(theme)), NAMED);
  const source = aired(uncalled(named, n), theme.air);
  if (n === 12) return bathroom(source);
  if (n === 9) return home(source);
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
