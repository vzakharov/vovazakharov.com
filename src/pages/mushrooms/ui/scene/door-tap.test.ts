import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { type DoorTarget, tappedDoor } from './door-tap';

type Named = DoorTarget & { name: string };

/** A door whose tap area is the circle `r` round `middle`, as `doorHitArea` draws it. */
const circle = (name: string, middle: Point, r: number): Named => ({
  name,
  middle,
  holds: ({ x, y }) => Math.hypot(x - middle.x, y - middle.y) <= r,
});

/**
 * A porcini's door beside a chanterelle's on a tablet: the porcini's circle
 * 59 px round, the chanterelle's 32, their middles 60 px apart so the circles
 * overlap and the big one reaches past the small one's middle.
 */
const BIG = circle('porcini', { x: 0, y: 0 }, 59);
const SMALL = circle('chanterelle', { x: 60, y: 0 }, 32);
const DOORS = [BIG, SMALL] as const;

const taken = (finger: Point) => tappedDoor(finger, DOORS)?.name;

describe('a tap on two doors whose tap circles overlap', () => {
  it('goes to the big door where only its circle holds it, though nearer the small one’s middle', () => {
    // 36 px from the small door's middle, outside its 32 px circle; 51 px
    // from the big one's, inside its 59.
    const finger = { x: 45, y: 33 };
    assert.ok(BIG.holds(finger) && !SMALL.holds(finger));
    assert.ok(
      Math.hypot(finger.x - 60, finger.y) < Math.hypot(finger.x, finger.y),
    );
    assert.equal(taken(finger), 'porcini');
  });

  it('goes to the nearer middle where both circles hold it', () => {
    assert.equal(taken({ x: 35, y: 0 }), 'chanterelle');
    assert.equal(taken({ x: 29, y: 0 }), 'porcini');
  });

  it('goes to neither where neither circle holds it', () => {
    assert.equal(taken({ x: 0, y: 70 }), undefined);
    assert.equal(taken({ x: 100, y: 0 }), undefined);
  });

  it('goes to exactly one door holding it, anywhere either circle does', () => {
    let held = 0;
    for (let x = -70; x <= 100; x += 1) {
      for (let y = -70; y <= 70; y += 1) {
        const finger = { x, y };
        const holding = DOORS.filter((door) => door.holds(finger));
        const door = tappedDoor(finger, DOORS);
        if (holding.length === 0) {
          assert.equal(door, undefined, `(${String(x)}, ${String(y)})`);
          continue;
        }
        held++;
        assert.ok(
          door && holding.includes(door),
          `a tap at (${String(x)}, ${String(y)}) goes dead`,
        );
      }
    }
    assert.ok(held > 0);
  });
});
