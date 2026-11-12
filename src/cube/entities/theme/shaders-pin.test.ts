import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { floorSource, themeOf } from '.';
import { HONEYCOMB, LUMA, type Wgsl } from './kit';

/**
 * Each floor's theme source as `assemble()` wrote it before its pieces moved
 * into `.wgsl` files, hashed: the move is pinned byte for byte, and every
 * difference it was allowed is undone below by name before the hash is taken.
 */
const BEFORE = [
  '6865ab8650f0fb65',
  '4521dfaee3ffd613',
  '208e8df65862cb0e',
  '28a826cfee1ce77b',
  '41150e5faf3bbc39',
  'c79cb82068faeca5',
  'ec270d3bd671199f',
  'b4d2636b02c487a9',
  '89716d81e20e7f5a',
  'e87200ccf7bd17ac',
  '7ffc7476cacb9854',
  '5cf0dd899c5d7746',
  'ff4fc56301bee03e',
  '23233b55beae2370',
  'c2d20c497e77c688',
  '9f99fe4a803613aa',
  '4f32754fde8e7def',
  '81489e7e4c086f98',
  'bc918f4f6e894a4d',
  'd7045222663730ca',
  'c6b5bd33dea88a86',
  '45c8a004fcb9ac87',
  '5242298426861816',
  'beddd11b8ef7fdb6',
  'f47d50ab05c0ecd7',
  '7d5c73fce9b7528f',
  'f037b6db03f8fd7a',
  'b5f4b10bc892a672',
  '246787f4e9153d00',
  'a0329fb7bd338259',
  'b9472c2d7f2ba88f',
  '06040a1e6dbe443e',
  '605bc4cdb2c5999a',
  'ac17bf1d39b21d55',
  'ddc6a37fd0c5a6bd',
  '2881a4577449688c',
  'ca359383f7f536c1',
  'd908f94908bfe445',
  '9750671e98e3e84b',
  '81309e545a42521b',
  '4cdc42ea9a8d5fef',
  '6086f2a7b4754c70',
  'a064f689bf413447',
  '695a124e9f2191de',
  'a11906683b5084c8',
  'f6e2a2b6b0aa6b8e',
  '118ed099413120a8',
  '1d00212554420097',
  '0227f48f45622d32',
  '59c74e034ec235fb',
  '821b6871c8146739',
  '4429d674ed4344f6',
  '3779efd4537ba503',
  '18578027a5fc24a5',
  '50b9a31f7688caa0',
  '54168e31c5a92815',
  'aea07feb41a9140d',
  '201190bc12ac83b7',
  '494fcaa2df2c3190',
  '85a098d0d958d42b',
  'efd9301b821a3c09',
  '2fb5532dd41b9f77',
  'ce6bacb97bc61b88',
  '863441e521b3b9ea',
  '4fa27981297f2c39',
  'e59a8124cdf6d584',
];

const piece = ({ listing }: Wgsl): string => `${listing.trim()}\n\n`;

/** `source` with `now`, found exactly once, put back to `then`. */
function undo(source: string, now: string, then: string): string {
  assert.equal(source.split(now).length, 2, `not found once: ${now}`);
  return source.replace(now, () => then);
}

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
  let then = undo(source, piece(HONEYCOMB), '');
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
  for (const kit of moved) then = undo(then, piece(kit), '');
  const head = piece(LUMA) + piece(HONEYCOMB);
  return undo(then, SPECIMEN_HEAD, head + SPECIMEN_HEAD);
}

const asBefore = (n: number, source: string): string => {
  const moved = calling[n];
  if (n === 12) return bathroom(source);
  return moved === undefined ? source : laboratory(source, moved);
};

describe("every floor's shader source", () => {
  it('is what it was before the move, but for the differences named', () => {
    for (const [index, pinned] of BEFORE.entries()) {
      const n = index + 1;
      const source = asBefore(n, floorSource(themeOf(n), ''));
      const hash = createHash('sha256').update(source).digest('hex');
      assert.equal(hash.slice(0, 16), pinned, `floor ${String(n)}`);
    }
  });
});
