import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cross3 as cross, dot3 as dot, type Vec3 } from '@/cube/shared/lib/vec';

import { loft, type Ring } from './loft';
import { minus } from './quad';

const room = { n: 1, x: 0n, y: 0n };

/** A ring of `radius` round the y axis at height `y`. */
const ringAt = (y: number, radius: number): Ring => ({
  centre: [0, y, 0],
  wide: [radius, 0, 0],
  thick: [0, 0, radius],
});

const TUBE = [ringAt(0, 1), ringAt(1, 1), ringAt(2, 0.5)];

describe('loft', () => {
  it('joins each two rings with as many quads as it has sides', () => {
    const quads = loft(TUBE, room, { surface: 'metal', sides: 8 });
    assert.equal(quads.length, 2 * 8);
    for (const quad of quads) {
      assert.equal(quad.surface, 'metal');
      assert.equal(quad.room, room);
      assert.equal(quad.paint, undefined);
    }
  });

  it('faces out of its rings, each corner by the surface’s own normal', () => {
    for (const { corners, normals, normal } of loft(TUBE, room, {
      surface: 'metal',
      sides: 8,
    })) {
      assert.ok(normals);
      const [a, b, c, d] = corners;
      assert.ok(dot(cross(minus(c, a), minus(d, b)), normal) > 0, 'wound out');
      for (const [index, corner] of corners.entries()) {
        const out: Vec3 = [corner[0], 0, corner[2]];
        const own = normals[index];
        assert.ok(own);
        assert.ok(dot(own, out) > 0, 'away from the axis');
        assert.ok(Math.abs(Math.hypot(...own) - 1) < 1e-9, 'unit');
      }
    }
  });

  it('gives the corners two quads share one normal', () => {
    const [first, second] = loft([ringAt(0, 1), ringAt(1, 1)], room, {
      surface: 'metal',
      sides: 8,
    });
    assert.ok(first?.normals && second?.normals);
    const shared = first.corners.indexOf(second.corners[0]);
    assert.ok(shared !== -1);
    assert.deepEqual(first.normals[shared], second.normals[0]);
  });

  it('covers only its arc, and carries its paint', () => {
    const quads = loft([ringAt(0, 1), ringAt(1, 1)], room, {
      surface: 'skin',
      paint: 0xff_00_00,
      sides: 3,
      arc: [0, 0.25],
    });
    assert.equal(quads.length, 3);
    for (const { corners, paint } of quads) {
      assert.equal(paint, 0xff_00_00);
      for (const [x, , z] of corners) {
        assert.ok(x > -1e-9 && z > -1e-9, 'within the first quarter-turn');
      }
    }
  });

  it('closes a ring drawn shut with the tube’s own way for a normal', () => {
    const quads = loft([ringAt(0, 1), ringAt(1, 0)], room, {
      surface: 'metal',
      sides: 4,
    });
    for (const { normals } of quads) {
      assert.ok(normals);
      assert.ok(normals.some((normal) => normal[1] === 1));
    }
  });
});
