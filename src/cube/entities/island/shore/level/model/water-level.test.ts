import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sheetDepth } from '@/nature/shared/shore';
import { turnsAt } from '@/nature/shared/swell';

import { islandHeight } from '../../../land';
import { waterLevel } from './water-level';

/** A point on the south-west beach, `bed` metres over the still sea. */
function onBeach(bed: number): [number, number] {
  let dry = 0;
  let wet = 200;
  for (let step = 0; step < 50; step += 1) {
    const middle = (dry + wet) / 2;
    const at = islandHeight([-middle * Math.SQRT1_2, middle * Math.SQRT1_2]);
    if (at > bed) dry = middle;
    else wet = middle;
  }
  return [-dry * Math.SQRT1_2, dry * Math.SQRT1_2];
}

describe('waterLevel', () => {
  it('returns to itself on the hour', () => {
    for (const xz of [onBeach(0.1), onBeach(-0.5), [300, -200]] as const) {
      for (const t of [0, 0.5, 2.25]) {
        const now = waterLevel(xz, t);
        assert.ok(Math.abs(now - waterLevel(xz, t + 3600)) < 1e-9);
      }
    }
  });

  it('wets the low beach with every wave and leaves it dry between', () => {
    const xz = onBeach(0.08);
    let wetNow = false;
    let floods = 0;
    let wetSeconds = 0;
    for (let t = 0; t < 600; t += 0.05) {
      const wet = waterLevel(xz, t) > islandHeight(xz);
      if (wet && !wetNow) floods += 1;
      if (wet) wetSeconds += 0.05;
      wetNow = wet;
    }
    // Ten minutes of a wave every 8.57 s; the smallest may fall short.
    assert.ok(floods >= 55 && floods <= 72, `floods ${String(floods)}`);
    assert.ok(wetSeconds > 120 && wetSeconds < 480, String(wetSeconds));
  });

  it('never reaches the high beach, and is calm out at sea', () => {
    const high = onBeach(0.7);
    for (let t = 0; t < 900; t += 0.3) {
      assert.ok(waterLevel(high, t) < islandHeight(high));
      assert.ok(Math.abs(waterLevel([400, 300], t)) < 0.5);
    }
  });

  it('throws a taller sheet up the beach that faces the swell', () => {
    let facing = 0;
    let lee = 0;
    for (let t = 0; t < 600; t += 0.1) {
      facing = Math.max(facing, sheetDepth(Math.floor(turnsAt(t)), t, 0.1, 1));
      lee = Math.max(lee, sheetDepth(Math.floor(turnsAt(t)), t, 0.1, 0.3));
    }
    assert.ok(facing > 0.01, String(facing));
    assert.equal(lee, 0);
  });
});
