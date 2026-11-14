import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CEILING_HEIGHT, ROOM_METRES } from '../lib/room-shape';
import { beamPatches, crossesBeam } from './beam';
import { type Box, DOORWAY } from './frame';
import { SUN_DIR } from './sun';

describe('beamPatches', () => {
  const patches = beamPatches(SUN_DIR);

  it("gathers the whole of the doorway's beam", () => {
    const flux = patches.reduce((sum, patch) => sum + patch.flux, 0);
    const beam = (DOORWAY.to - DOORWAY.from) * DOORWAY.height * SUN_DIR[0];
    assert.ok(Math.abs(flux - beam) < 1e-9);
  });

  it('lands every patch on a face of the room, looking into it', () => {
    const size = [ROOM_METRES, ROOM_METRES * CEILING_HEIGHT, ROOM_METRES];
    for (const { middle: at, facing } of patches) {
      for (const [axis, value] of at.entries()) {
        assert.ok(value >= -1e-9 && value <= (size[axis] ?? 0) + 1e-9);
      }
      const on = facing.findIndex((part) => part !== 0);
      const wall = (facing[on] ?? 0) > 0 ? 0 : (size[on] ?? 0);
      assert.ok(Math.abs((at[on] ?? 0) - wall) < 1e-9);
    }
  });

  it('lays the evening sun along the floor and stands it on the west wall', () => {
    const faces = new Set(patches.map(({ facing }) => facing.join(',')));
    assert.deepEqual([...faces].toSorted(), ['0,1,0', '1,0,0']);
    const west = patches.filter(({ facing }) => facing[0] === 1);
    assert.ok(west.every(({ middle }) => middle[1] < 1.2 && middle[2] > 2.5));
  });

  it('sends a level sun straight to the west wall', () => {
    const level = beamPatches([1, 0, 0]);
    assert.ok(level.every(({ facing }) => facing.join(',') === '1,0,0'));
  });
});

/** A low thing standing on the floor about a point of it. */
const standing = (east: number, south: number): Box => ({
  min: [east - 0.2, 0, south - 0.2],
  max: [east + 0.2, 0.5, south + 0.2],
});

describe('crossesBeam', () => {
  const landed = beamPatches(SUN_DIR).find(({ facing }) => facing[1] === 1);
  const [x = 0, , z = 0] = landed?.middle ?? [];

  it('finds a thing standing where the beam lands on the floor', () => {
    assert.ok(crossesBeam(standing(x, z), SUN_DIR));
  });

  it('passes one standing well to the side of it, and one against the far wall of the doorway', () => {
    assert.ok(!crossesBeam(standing(x, z - 1.5), SUN_DIR));
    assert.ok(
      !crossesBeam(standing(ROOM_METRES - 0.3, ROOM_METRES - 0.3), SUN_DIR),
    );
  });
});
