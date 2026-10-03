import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fromMap, type MapFrame } from '../../model/map-frame';
import { mapGround } from './map-ground';

const box = { left: 20, right: 1160, top: 20, bottom: 800, corner: 9 };
const frame: MapFrame = {
  middle: { x: 590, y: 410 },
  centre: { x: 1.5, y: 6 },
  sunward: 0.8,
  scale: 40,
};
const SEED = 0x51_ab_77;

/** Each tuft's plane point, rounded so two framings' float noise compare equal. */
const planeOf = (framed: MapFrame, seed: number) =>
  new Set(
    mapGround(framed, box, seed).tufts.map((tuft) => {
      const { x, y } = fromMap(framed, tuft);
      return `${x.toFixed(6)},${y.toFixed(6)}`;
    }),
  );

describe('map ground', () => {
  it('grows the same ground from the same seed, and another from another', () => {
    assert.deepEqual(mapGround(frame, box, SEED), mapGround(frame, box, SEED));
    assert.notDeepEqual(
      mapGround(frame, box, SEED).tufts,
      mapGround(frame, box, SEED + 1).tufts,
    );
  });

  it('roots every tuft inside the box, a few hundred on a tablet sheet', () => {
    const { tufts, mottles } = mapGround(frame, box, SEED);
    for (const { x, y } of tufts) {
      assert.ok(x > box.left && x < box.right && y > box.top && y < box.bottom);
    }
    assert.ok(tufts.length > 200 && tufts.length < 900, String(tufts.length));
    assert.ok(mottles.length < 400, String(mottles.length));
  });

  it('keeps a tuft on its plane point however the map is framed at its zoom', () => {
    const moved = { ...frame, centre: { x: 4, y: 3.5 }, scale: 36 };
    const here = planeOf(frame, SEED);
    const there = planeOf(moved, SEED);
    const shared = [...here].filter((point) => there.has(point));
    assert.ok(shared.length > here.size / 2, String(shared.length));
  });
});
