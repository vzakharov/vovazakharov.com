import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { edgePoint, fitTo, toWorld, union, zoomAt } from './camera.ts';

describe('zoomAt', () => {
  it('keeps the world point under the anchor in place', () => {
    const camera = { x: 10, y: -20, scale: 0.5 };
    const anchor = { x: 300, y: 200 };
    const before = toWorld(camera, anchor);
    const after = toWorld(zoomAt(camera, anchor, 1.7), anchor);
    assert.ok(Math.abs(before.x - after.x) < 1e-9);
    assert.ok(Math.abs(before.y - after.y) < 1e-9);
  });
});

describe('fitTo', () => {
  it('centres the bounds in the viewport', () => {
    const camera = fitTo(
      { x: 100, y: 100, w: 2000, h: 1000 },
      { x: 0, y: 0, w: 1096, h: 1000 },
    );
    assert.equal(camera.scale, 0.5);
    const centre = toWorld(camera, { x: 548, y: 500 });
    assert.deepEqual(centre, { x: 1100, y: 600 });
  });
});

describe('union', () => {
  it('spans every rectangle, and nothing for none', () => {
    assert.deepEqual(
      union([
        { x: 0, y: 0, w: 10, h: 10 },
        { x: -5, y: 5, w: 10, h: 20 },
      ]),
      { x: -5, y: 0, w: 15, h: 25 },
    );
    assert.equal(union([]), undefined);
  });
});

describe('edgePoint', () => {
  it('leaves a rectangle on the side facing the target', () => {
    const rect = { x: 0, y: 0, w: 100, h: 50 };
    assert.deepEqual(edgePoint(rect, { x: 500, y: 25 }), { x: 100, y: 25 });
    assert.deepEqual(edgePoint(rect, { x: 50, y: -300 }), { x: 50, y: 0 });
  });
});
