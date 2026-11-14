import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Vec3 } from '../lib/vec';
import { CUBE_METRES, DOORWAY, ROOM_DOORWAY } from './frame';
import { SUN, SUN_DIR } from './sun';
import { toShell } from './turn';

const close = (a: number, b: number, within = 1e-9): void => {
  assert.ok(Math.abs(a - b) <= within, `${String(a)} is not ${String(b)}`);
};

/** The float literals of `listing`, as numbers. */
const literals = (listing: string): number[] =>
  [...listing.matchAll(/-?\d+\.\d+(?:e-?\d+)?|-?\d+e-?\d+/g)].map(([text]) =>
    Number(text),
  );

describe('the room frame', () => {
  it("opens the doorway in the wall of floor 1 behind the shell's east face", () => {
    const { wall, from, to } = ROOM_DOORWAY;
    close(to - from, DOORWAY.to - DOORWAY.from);
    const along = wall === 'north' || wall === 'south';
    const across = wall === 'east' || wall === 'south' ? CUBE_METRES : 0;
    const middle = (from + to) / 2;
    const inRoom: Vec3 = along ? [middle, 0, across] : [across, 0, middle];
    const [x, , z] = toShell(inRoom, CUBE_METRES);
    close(x, CUBE_METRES);
    close(z, (DOORWAY.from + DOORWAY.to) / 2);
  });
});

describe('the sun', () => {
  it('stands 9° up, 31° north of east', () => {
    close(Math.hypot(...SUN_DIR), 1);
    close(Math.asin(SUN_DIR[1]), (9 * Math.PI) / 180);
    close(Math.atan2(SUN_DIR[2], SUN_DIR[0]), (-31 * Math.PI) / 180);
    for (const value of SUN_DIR) {
      assert.ok(literals(SUN.listing).includes(value));
    }
  });
});
