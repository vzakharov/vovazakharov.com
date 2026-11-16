import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CubeCell } from '@/island/shared/globe';

import { orderId } from './tile-protocol';

const key: CubeCell = { face: 'pz', level: 5, x: 3, y: 7 };
const flat = {
  edges: { right: 5, left: 5, up: 5, down: 5 },
  corners: { sw: 5, se: 5, nw: 5, ne: 5 },
};

describe('orderId', () => {
  it('names each stitched variant of a tile apart', () => {
    const ids = new Set([
      orderId({ key, levels: flat }),
      orderId({ key, levels: { ...flat, edges: { ...flat.edges, up: 4 } } }),
      orderId({ key, levels: { ...flat, edges: { ...flat.edges, down: 4 } } }),
      orderId({
        key,
        levels: { ...flat, corners: { ...flat.corners, ne: 3 } },
      }),
      orderId({ key: { ...key, x: 4 }, levels: flat }),
    ]);
    assert.equal(ids.size, 5);
  });

  it('is the same for the same tile and levels', () => {
    assert.equal(
      orderId({ key, levels: flat }),
      orderId({ key: { ...key }, levels: structuredClone(flat) }),
    );
  });
});
