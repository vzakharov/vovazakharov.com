import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CEILING_HEIGHT, ROOM_METRES } from '../lib/room-shape';
import { beamPatches } from './beam';
import { DOORWAY } from './frame';
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
