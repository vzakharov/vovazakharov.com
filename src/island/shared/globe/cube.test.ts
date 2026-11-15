import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FACES,
  faceToSphere,
  length,
  sphereToFace,
  sub,
  unit,
  type Vec3,
} from '.';

const close = (p: Vec3, q: Vec3, tolerance: number) =>
  length(sub(p, q)) <= tolerance;

/** A deterministic stream in `[−1, 1)`. */
function* pseudoRandom(count: number) {
  let state = 0x25_45_f4_91;
  for (let i = 0; i < count; i += 1) {
    state = (Math.imul(state, 1_103_515_245) + 12_345) >>> 0;
    yield (state / 2 ** 32) * 2 - 1;
  }
}

const STEPS = 40;
const grid = Array.from({ length: STEPS + 1 }, (_, i) => (2 * i) / STEPS - 1);

describe('faceToSphere', () => {
  it('gives unit vectors with each face centre on its axis', () => {
    for (const face of FACES) {
      const centre = faceToSphere(face, 0, 0);
      assert.ok(Math.abs(length(centre) - 1) < 1e-15);
      assert.equal(centre.filter((c) => c === 0).length, 2, face);
    }
  });

  it('puts face px with u east and v north', () => {
    assert.ok(close(faceToSphere('px', 0, 0), [1, 0, 0], 0));
    const east = faceToSphere('px', 0.5, 0);
    const north = faceToSphere('px', 0, 0.5);
    assert.ok(east[2] < 0 && east[1] === 0);
    assert.ok(north[1] > 0 && north[2] === 0);
  });

  it('lands a face edge on exactly ±1 in the cube', () => {
    const corner = faceToSphere('pz', 1, -1);
    assert.equal(corner[0], -corner[1]);
    assert.equal(corner[0], corner[2]);
  });
});

describe('sphereToFace', () => {
  it('inverts faceToSphere within 1e-12 across every face, edges included', () => {
    for (const face of FACES) {
      for (const a of grid) {
        for (const b of grid) {
          const p = faceToSphere(face, a, b);
          const q = sphereToFace(p);
          assert.ok(close(faceToSphere(q.face, q.u, q.v), p, 1e-12));
          if (Math.abs(a) < 1 && Math.abs(b) < 1) {
            assert.equal(q.face, face);
            assert.ok(Math.abs(q.u - a) < 1e-12, `${face} a at (${a}, ${b})`);
            assert.ok(Math.abs(q.v - b) < 1e-12, `${face} b at (${a}, ${b})`);
          }
        }
      }
    }
  });

  it('inverts to within 1e-12 for scattered directions of any length', () => {
    const values = [...pseudoRandom(3 * 3000)];
    const at = (i: number) => values[i] ?? Number.NaN;
    for (let i = 0; i < values.length; i += 3) {
      const raw: Vec3 = [at(i), at(i + 1), at(i + 2)];
      if (length(raw) < 1e-3) continue;
      const scale = 1 + i * 1000;
      const p: Vec3 = [raw[0] * scale, raw[1] * scale, raw[2] * scale];
      const { face, u: a, v: b } = sphereToFace(p);
      assert.ok(Math.abs(a) <= 1 && Math.abs(b) <= 1);
      assert.ok(close(faceToSphere(face, a, b), unit(p), 1e-12));
    }
  });

  it('reads a face edge as exactly ±1', () => {
    const { u: a, v: b } = sphereToFace([1, 1, 0.25]);
    assert.ok(Math.abs(a) === 1 || Math.abs(b) === 1);
  });
});

describe('the equal-angle grid', () => {
  it('keeps cell edges within 1.415× of each other on every face', () => {
    const n = 512;
    const coordinate = (i: number) => (2 * i) / n - 1;
    let shortest = Infinity;
    let longest = 0;
    for (const face of FACES) {
      const rows = Array.from({ length: n + 1 }, (_, j) =>
        Array.from({ length: n + 1 }, (__, i) =>
          faceToSphere(face, coordinate(i), coordinate(j)),
        ),
      );
      for (let j = 0; j <= n; j += 1) {
        for (let i = 0; i <= n; i += 1) {
          const here = rows[j]?.[i];
          if (here === undefined) continue;
          for (const there of [rows[j]?.[i + 1], rows[j + 1]?.[i]]) {
            if (there === undefined) continue;
            const edge = length(sub(here, there));
            shortest = Math.min(shortest, edge);
            longest = Math.max(longest, edge);
          }
        }
      }
    }
    const ratio = longest / shortest;
    assert.ok(ratio <= 1.415, `measured ${ratio}`);
  });
});
