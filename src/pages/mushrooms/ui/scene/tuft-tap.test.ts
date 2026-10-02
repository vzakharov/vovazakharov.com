import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { planeFootOf } from '../../model/ground';
import { FLOWER_SIZE } from './flower-layout';
import { TUFT_REACH, tuftAt, tuftReach } from './tuft-tap';
import type { Sprout } from './tufts';

const sprout = (x: number, y: number, size: number): Sprout => ({
  foot: planeFootOf({ x, z: 0, size: FLOWER_SIZE }),
  tuft: { x, y, size, phase: 0, flank: 0, middle: 0, crown: 0 },
});

describe('tuftAt', () => {
  const sprouts = [
    sprout(100, 300, 6),
    sprout(130, 300, 6),
    sprout(400, 500, 30),
  ];

  it('finds the tuft a finger lands on, the nearest of two that reach', () => {
    assert.equal(tuftAt(sprouts, { x: 104, y: 294 }), sprouts[0]);
    assert.equal(tuftAt(sprouts, { x: 124, y: 294 }), sprouts[1]);
  });

  it('answers a finger’s pad round a small tuft, and its blades round a big one', () => {
    const [small, , big] = sprouts;
    assert.ok(small && big);
    assert.equal(tuftReach(small.tuft), TUFT_REACH);
    assert.ok(tuftReach(big.tuft) > TUFT_REACH);
    assert.equal(
      tuftAt(sprouts, { x: 400, y: 470 + tuftReach(big.tuft) - 1 }),
      big,
    );
  });

  it('leaves the bare ground bare', () => {
    assert.equal(tuftAt(sprouts, { x: 250, y: 400 }), undefined);
    assert.equal(
      tuftAt(sprouts, { x: 100, y: 300 - 6 - TUFT_REACH - 1 }),
      undefined,
    );
  });
});
