import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CEILING_HEIGHT, ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Sides } from '@/cube/shared/lib/sides';
import { type Thing, THINGS } from '@/cube/shared/lib/thing';
import type { Quarter, Room, Setting } from '@/cube/entities/world';

import { RECIPES } from '../config/recipes';
import { toolsFor } from '../lib/tools';
import {
  boundsOf,
  clearZones,
  crowds,
  INSIDE,
  isClear,
  overlap,
  within,
} from './clear';
import { furnish, furnished, MOST_QUADS, standingBoxes } from './furnish';

const room: Room = { n: 4, x: 3n, y: 5n };

/** A room of four walls and no hole, under `grain`. */
const shut = (grain: number): Setting => ({
  room,
  closed: [true, true, true, true],
  hole: null,
  grain,
});

/** Every way a room's four sides can be open or closed. */
const WALLINGS: readonly Sides[] = Array.from({ length: 16 }, (_, bits) => [
  (bits & 1) > 0,
  (bits & 2) > 0,
  (bits & 4) > 0,
  (bits & 8) > 0,
]);

const HOLES: ReadonlyArray<Quarter | null> = [
  null,
  { qx: 0, qy: 0 },
  { qx: 1, qy: 0 },
  { qx: 0, qy: 1 },
  { qx: 1, qy: 1 },
];

/** Rooms of every walling and hole, each under a grain of its own. */
const SETTINGS: readonly Setting[] = WALLINGS.flatMap((closed, walling) =>
  HOLES.flatMap((hole, holed) =>
    [0, 1, 2].map((again) => ({
      room,
      closed,
      hole,
      grain: 1000 + walling * 97 + holed * 13 + again,
    })),
  ),
);

const one = (thing: Thing) => [{ thing, perRoom: 1 }];

/** A room far too full, so that every rule is leant on. */
const CROWD = THINGS.map((thing) => ({ thing, perRoom: 0.6 }));

describe('every thing', () => {
  for (const thing of THINGS) {
    it(`${thing} builds from a few dozen quads, on the floor, below the ceiling`, () => {
      for (const seed of [0.05, 0.3, 0.55, 0.8, 0.97]) {
        const quads = RECIPES[thing].build(
          toolsFor(room),
          (k) => (seed + k * 0.618) % 1,
        );
        assert.ok(quads.length > 0);
        assert.ok(quads.length <= MOST_QUADS.thing, String(quads.length));
        const { least, most } = boundsOf(quads);
        assert.ok([...least, ...most].every((at) => Number.isFinite(at)));
        assert.ok(least[1] > -1e-9, `under the floor: ${String(least[1])}`);
        assert.ok(
          most[1] < CEILING_HEIGHT + 1e-9,
          `through the ceiling: ${String(most[1])}`,
        );
        assert.ok(least[2] > -1e-9, `into the wall: ${String(least[2])}`);
        for (const { normal } of quads) {
          assert.ok(Math.abs(Math.hypot(...normal) - 1) < 1e-9);
        }
      }
    });

    it(`${thing} stands in a room of four walls`, () => {
      const stands = [1, 2, 3, 4, 5, 6].some(
        (grain) => furnish(shut(grain), one(thing)).length > 0,
      );
      assert.ok(stands);
    });
  }
});

describe('furnish', () => {
  it('is the same for the same setting', () => {
    for (const setting of SETTINGS.slice(0, 40)) {
      assert.deepEqual(furnish(setting, CROWD), furnish(setting, CROWD));
    }
  });

  it('differs between grains', () => {
    const [first, second] = [7, 8].map((grain) => furnish(shut(grain), CROWD));
    assert.notDeepEqual(first, second);
  });

  it('keeps every thing inside the room', () => {
    for (const setting of SETTINGS) {
      for (const thing of furnished(setting, CROWD)) {
        assert.ok(within(boundsOf(thing), INSIDE));
      }
    }
  });

  it('keeps the walkways, the hole, the shelf and the signs’ walls clear', () => {
    for (const setting of SETTINGS) {
      const zones = clearZones(setting);
      for (const quad of furnish(setting, CROWD)) {
        const bounds = boundsOf([quad]);
        assert.ok(isClear(bounds, zones));
      }
    }
  });

  it('stands no thing in another, and hangs none where one stands', () => {
    for (const setting of SETTINGS) {
      const things = furnished(setting, CROWD).map((thing) => boundsOf(thing));
      for (const [at, thing] of things.entries()) {
        for (const other of things.slice(at + 1)) {
          assert.ok(!overlap(thing, other));
          assert.ok(!crowds(thing, other), 'nothing hung where one stands');
        }
      }
    }
  });

  it('holds at most a room’s share of quads', () => {
    for (const setting of SETTINGS) {
      assert.ok(furnish(setting, CROWD).length <= MOST_QUADS.room);
    }
  });

  it('leaves a room with no closed side empty', () => {
    const open: Sides = [false, false, false, false];
    assert.deepEqual(
      furnish({ room, closed: open, hole: null, grain: 5 }, CROWD),
      [],
    );
  });

  it('holds `perRoom` of a thing on average', () => {
    const rooms = 400;
    const held = Array.from(
      { length: rooms },
      (_, grain) =>
        furnished(shut(grain), [{ thing: 'bin', perRoom: 1.3 }]).length,
    ).reduce((sum, count) => sum + count, 0);
    assert.ok(Math.abs(held / rooms - 1.3) < 0.1, String(held / rooms));
  });
});

describe('standingBoxes', () => {
  it('is the box, in metres, of every thing on the floor and of none on a wall', () => {
    for (const setting of SETTINGS) {
      const stands = furnished(setting, CROWD)
        .map((thing) => boundsOf(thing))
        .filter(({ least }) => least[1] < 1e-6);
      const boxes = standingBoxes(setting, CROWD);
      assert.equal(boxes.length, stands.length);
      for (const [at, { min, max }] of boxes.entries()) {
        const { least, most } = stands[at] ?? assert.fail();
        assert.deepEqual(
          [min, max],
          [least, most].map((corner) =>
            corner.map((side) => side * ROOM_METRES),
          ),
        );
      }
    }
  });
});
