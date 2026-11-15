import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';

import type { Facing } from './door';
import { mazeDoored } from './doorway';
import { eastKind, southKind } from './doorways';
import { maze } from './maze';
import { planted } from './planted';
import {
  beyondOf,
  carried,
  farSideOf,
  isBeyond,
  isPortal,
  pastDoorway,
  roomBeyond,
  wayThrough,
} from './portal';
import type { Pose, Standing } from './pose';

const MINUTE = 60_000;
const { middle } = DOORWAY_CUT;

/** An east wall gone through eastward, and a south wall gone through southward. */
const EAST: Facing = { n: 6, x: 2n, y: 0n, isEast: true, toward: 1 };
const SOUTH: Facing = { n: 9, x: 0n, y: 0n, isEast: false, toward: 1 };

const standing = (at: Standing): Pose => ({ ...at, eyeAbove: 0.3, scale: 1 });

const close = (actual: number, expected: number): void => {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${String(actual)} is not ${String(expected)}`,
  );
};

const farAt = (ms: number) => farSideOf(EAST, ms);

describe('the stub portal', () => {
  const rolled = maze(planted.seed);

  it('stands in plain walls of the planted maze, which open as doors', () => {
    const ends = [farAt(0), farAt(MINUTE), EAST];
    for (const end of ends) {
      assert.ok(end !== null);
      const { n, x, y, isEast } = end;
      assert.equal((isEast ? eastKind : southKind)(rolled, n, x, y), 'wall');
      assert.ok(isPortal(end));
      assert.ok(mazeDoored(rolled).isDoor(end));
    }
  });

  it('leads elsewhere each minute, and the same way within one', () => {
    assert.deepEqual(farAt(0), farAt(MINUTE - 1));
    assert.notDeepEqual(farAt(0), farAt(MINUTE));
    assert.deepEqual(farAt(0), farAt(2 * MINUTE));
  });

  it('leads back from where it led', () => {
    const there = farAt(MINUTE);
    assert.ok(there !== null);
    const back = farSideOf({ ...there, toward: -1 }, 5 * MINUTE);
    assert.deepEqual(back, { ...EAST, toward: -1 });
  });

  it('is no portal in any other wall', () => {
    assert.equal(farSideOf({ ...EAST, x: 3n }, 0), null);
  });
});

describe('a body carried through a portal', () => {
  /** Just through `EAST`, a little south of the doorway's middle, looking east. */
  const through = standing({
    n: 6,
    x: 3n,
    y: 0n,
    u: 0.02,
    v: middle + 0.05,
    yaw: 0,
    elevation: 0.1,
  });

  it('stands as far through a wall running the same way', () => {
    const far: Facing = { n: 9, x: 1n, y: 0n, isEast: true, toward: 1 };
    const there = carried(through, EAST, far);
    assert.deepEqual(pick(there, 'n', 'x', 'y'), { n: 9, x: 2n, y: 0n });
    close(there.u, 0.02);
    close(there.v, middle + 0.05);
    close(there.yaw, 0);
    assert.equal(there.eyeAbove, through.eyeAbove);
  });

  it('turns with a wall running across', () => {
    const there = carried(through, EAST, SOUTH);
    assert.deepEqual(pick(there, 'n', 'x', 'y'), { n: 9, x: 0n, y: 1n });
    // South of the middle going east is west of it going south.
    close(there.u, middle - 0.05);
    close(there.v, 0.02);
    close(there.yaw, Math.PI / 2);
  });

  it('comes back to where it left on the way back', () => {
    const there = carried(through, EAST, SOUTH);
    const back = { ...SOUTH, toward: -1 } as const;
    const home = { ...EAST, toward: -1 } as const;
    // Stepped back across the far wall's line, into the room it came out of.
    const returning = { ...there, y: 0n, v: there.v + 1 - 0.04 };
    const here = carried(returning, back, home);
    assert.deepEqual(pick(here, 'n', 'x', 'y'), { n: 6, x: 2n, y: 0n });
    close(here.u, 1 - 0.02);
    close(here.v, through.v);
    close(here.yaw, through.yaw);
  });
});

describe('what lies through a portal', () => {
  it('is laid doorway on doorway, turned as the way through is', () => {
    const { from, to, turn } = beyondOf({ n: 6, x: 1n, y: 0n }, EAST, SOUTH);
    assert.deepEqual(from, { u: middle, v: 0 });
    assert.deepEqual(to, { u: 2, v: middle });
    close(turn, -Math.PI / 2);
  });

  it('is looked into from whichever side the eye is on', () => {
    const { toward: _, ...wall } = EAST;
    assert.equal(wayThrough(wall, { n: 6, x: 1n, y: 4n }).toward, 1);
    assert.equal(wayThrough(wall, { n: 6, x: 3n, y: 0n }).toward, -1);
  });

  it('holds only the rooms past the far wall', () => {
    assert.ok(isBeyond(SOUTH, roomBeyond(SOUTH)));
    assert.ok(isBeyond(SOUTH, { n: 9, x: 5n, y: 3n }));
    assert.ok(!isBeyond(SOUTH, { n: 9, x: 0n, y: 0n }));
  });

  it('measures how far past the far wall a point is', () => {
    close(pastDoorway(SOUTH, 0.9, 0.25), 0.25);
    close(pastDoorway({ ...SOUTH, toward: -1 }, 0.9, 0.75), 0.25);
  });
});
