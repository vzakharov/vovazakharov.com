import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clampLeft } from '../../model/pan';
import { layerSpan, PARALLAX } from './parallax';

const WIDE = { width: 1180, world: 2163, unit: 170 };
const NARROW = { width: 1600, world: 1200, unit: 120 };

describe('layerSpan', () => {
  it('is the world with the ground and the screen standing still', () => {
    assert.deepEqual(layerSpan(WIDE, PARALLAX.ground), {
      left: 0,
      across: WIDE.world,
    });
    assert.deepEqual(layerSpan(WIDE, PARALLAX.fixed), {
      left: 0,
      across: WIDE.width,
    });
  });

  it('covers the screen at every crop, for every layer', () => {
    for (const view of [WIDE, NARROW]) {
      for (const factor of Object.values(PARALLAX)) {
        const { left, across } = layerSpan(view, factor);
        for (const wanted of [-Infinity, 0, 300, 983, Infinity]) {
          const scroll = clampLeft(view, wanted);
          // The layer's px the screen's left and right edges show.
          const from = factor * scroll;
          const to = from + view.width;
          assert.ok(from >= left - 1e-9 && to <= left + across + 1e-9);
        }
      }
    }
  });
});
