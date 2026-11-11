import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roomFlags, type RoomState } from './flags';

const NONE = [false, false, false, false] as const;
const ALL = [true, true, true, true] as const;
const only = (side: number) =>
  [side === 0, side === 1, side === 2, side === 3] as const;

const SIDES = [0, 1, 2, 3];

const DARK_AND_OPEN: RoomState = {
  closed: NONE,
  lampsOn: false,
  litBeside: NONE,
  litAcross: NONE,
  waysAcross: [NONE, NONE],
  wallsBeside: [NONE, NONE],
};

/** The flags of a room that differs from a dark, open one by `over`. */
const flagsOf = (over: Partial<RoomState>): number =>
  roomFlags({ ...DARK_AND_OPEN, ...over });

describe('roomFlags', () => {
  it('gives each closed side its own bit, east first', () => {
    assert.deepEqual(
      SIDES.map((side) => flagsOf({ closed: only(side) })),
      [1, 2, 4, 8],
    );
  });

  it('keeps the lamp clear of the walls', () => {
    assert.equal(flagsOf({ lampsOn: true }), 16);
  });

  it('gives every answer about the rooms around a bit of its own', () => {
    const fields: Array<(sides: RoomState['closed']) => Partial<RoomState>> = [
      (litBeside) => ({ litBeside }),
      (litAcross) => ({ litAcross }),
      (way) => ({ waysAcross: [way, NONE] }),
      (way) => ({ waysAcross: [NONE, way] }),
      (wall) => ({ wallsBeside: [wall, NONE] }),
      (wall) => ({ wallsBeside: [NONE, wall] }),
    ];
    assert.deepEqual(
      fields.flatMap((field) =>
        SIDES.map((side) => flagsOf(field(only(side)))),
      ),
      Array.from({ length: 24 }, (_, bit) => 2 ** (bit + 5)),
    );
  });

  it('packs a room with everything set into 29 bits, unsigned', () => {
    assert.equal(
      roomFlags({
        closed: ALL,
        lampsOn: true,
        litBeside: ALL,
        litAcross: ALL,
        waysAcross: [ALL, ALL],
        wallsBeside: [ALL, ALL],
      }),
      2 ** 29 - 1,
    );
  });
});
