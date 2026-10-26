import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  doorStations,
  mushroomGenes,
} from '@/mushrooms/entities/mushroom/index.node-safe';

import { endOf } from './run-ends';

describe('endOf', () => {
  it('reads a door’s width and its sill’s height off its place, in the clump’s size', () => {
    const genes = mushroomGenes({ seed: 3, species: 'fly-agaric' });
    const [lowest] = doorStations(genes);
    assert.ok(lowest);
    const end = endOf({ x: 0, y: 9 }, lowest, 0.5);
    assert.equal(end.across, lowest.width * 0.5);
    assert.ok(end.sillHeight > 0);
    assert.ok(end.sillHeight < lowest.y * 0.5);
    assert.equal(end.foot, undefined);
    const foot = { x: 0, y: 9.1 };
    assert.deepEqual(endOf({ x: 0, y: 9 }, lowest, 0.5, foot), {
      ...end,
      foot,
    });
  });
});
