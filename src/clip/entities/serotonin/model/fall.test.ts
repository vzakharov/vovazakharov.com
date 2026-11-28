import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fallingFlecks, fleckAt, fleckPool } from './fall';

const FALL = { width: 1280, height: 720, seed: 2, period: 10 };

describe('fleckAt', () => {
  const flecks = fallingFlecks({ ...FALL, density: 1 });

  it('repeats exactly after one period', () => {
    for (const t of [0, 1.7, 4.25, 9.9]) {
      for (const fleck of flecks) {
        const now = fleckAt(fleck, t, FALL);
        const later = fleckAt(fleck, t + FALL.period, FALL);
        assert.ok(Math.abs(now.x - later.x) < 1e-6);
        assert.ok(Math.abs(now.y - later.y) < 1e-6);
        const turn = (later.angle - now.angle) / (Math.PI * 2);
        assert.ok(Math.abs(turn - Math.round(turn)) < 1e-6);
      }
    }
  });

  it('enters and leaves out of sight', () => {
    for (const fleck of flecks) {
      for (let t = 0; t < FALL.period; t += 0.05) {
        const { y, fleckSize } = fleckAt(fleck, t, FALL);
        assert.ok(
          y >= -fleckSize * 2 - 1e-9 && y <= FALL.height + fleckSize * 2,
        );
      }
    }
  });

  it('keeps far flecks smaller and slower than near ones', () => {
    const [first] = flecks;
    assert.ok(first);
    const motion = (depth: 0 | 2) => {
      const fleck = { ...first, layer: depth, bulk: 1, headStart: 0 };
      const { fleckSize, y } = fleckAt(fleck, 0, FALL);
      return { fleckSize, speed: fleckAt(fleck, 0.1, FALL).y - y };
    };
    const [far, near] = [motion(0), motion(2)];
    assert.ok(far.fleckSize < near.fleckSize);
    assert.ok(far.speed < near.speed);
  });
});

describe('fallingFlecks', () => {
  it('thickens by adding flecks, never moving one', () => {
    const thin = fallingFlecks({ ...FALL, density: 0.2 });
    const thick = fallingFlecks({ ...FALL, density: 0.8 });
    assert.ok(thin.length < thick.length);
    for (const fleck of thin) assert.ok(thick.includes(fleck));
  });

  it('puts far flecks first', () => {
    const depths = fallingFlecks(FALL).map(({ layer }) => layer);
    assert.deepEqual(
      depths,
      depths.toSorted((a, b) => a - b),
    );
  });

  it('is fixed by its seed', () => {
    assert.equal(fleckPool(2), fleckPool(2));
    assert.notDeepEqual(fleckPool(2), fleckPool(3));
  });
});
