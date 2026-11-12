import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  closedSides,
  leverOf,
  maze,
  mazeWalls,
  type Quarter,
  type Room,
} from '@/cube/entities/world';

import { clearZones, leverSpot, overlap } from './clear';

const SEED = '8675309';
const rolled = maze(SEED);
const walls = mazeWalls(rolled);

const QUARTERS: readonly Quarter[] = [
  { qx: 0, qy: 0 },
  { qx: 1, qy: 0 },
  { qx: 0, qy: 1 },
  { qx: 1, qy: 1 },
];

const ROOMS: readonly Room[] = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n].flatMap((x) =>
  [0n, 3n, 7n].map((y) => ({ n: 4, x, y })),
);

const HOLED: Room = { n: 4, x: 0n, y: 0n };

describe('leverSpot', () => {
  it('is where the world mounts the lever', () => {
    for (const room of ROOMS) {
      for (const hole of QUARTERS) {
        const closed = closedSides(walls, room);
        const { at, mount } = leverOf(rolled, room, hole);
        const spot = leverSpot({ room, closed, hole, grain: 0 });
        assert.ok(spot);
        const [u, v] = spot;
        // A post stands a little in from the corner its lever is filed under.
        const near = mount === 'post' ? 0.04 : 1e-9;
        assert.ok(Math.abs(u - at.u) < near && Math.abs(v - at.v) < near);
      }
    }
  });

  it('is nowhere in a room with no hole', () => {
    const closed = [true, true, true, true] as const;
    assert.equal(
      leverSpot({ room: HOLED, closed, hole: null, grain: 0 }),
      null,
    );
  });
});

const point = (x: number, y: number, z: number) => ({
  least: [x, y, z] as const,
  most: [x, y, z] as const,
});

describe('clearZones', () => {
  const zones = clearZones({
    room: HOLED,
    closed: [true, false, true, true],
    hole: { qx: 1, qy: 0 },
    grain: 0,
  });
  const taken = (x: number, y: number, z: number) =>
    zones.some((zone) => overlap(point(x, y, z), zone));

  it('keeps a walkway along the open side only', () => {
    assert.ok(taken(0.5, 0.01, 0.9));
    assert.ok(!taken(0.5, 0.01, 0.7));
    assert.ok(!taken(0.5, 0.01, 0.1));
  });

  it('keeps the middle third of a closed wall at a sign’s height', () => {
    assert.ok(taken(0.03, 0.3, 0.5));
    assert.ok(!taken(0.03, 0.1, 0.5));
    assert.ok(!taken(0.03, 0.3, 0.2));
    assert.ok(taken(0.5, 0.3, 0.03));
  });

  it('keeps round the hole and round the lever on the wall beside it', () => {
    assert.ok(taken(0.75, 0.01, 0.25));
    assert.ok(taken(0.6, 0.01, 0.12));
    assert.ok(taken(0.95, 0.01, 0.38));
    assert.ok(!taken(0.3, 0.01, 0.6));
  });
});
