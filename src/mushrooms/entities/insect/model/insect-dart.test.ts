import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dartAt, DARTS, dartWay } from './insect-dart';
import { INSECT_KINDS } from './insect-genes';

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('dartWay', () => {
  it('backs away from the finger and lifts, a unit vector', () => {
    const way = dartWay({ x: 0, y: 0 }, { x: 10, y: 0 }, 0);
    assert.ok(way.x > 0);
    assert.ok(way.y < 0);
    assert.ok(near(Math.hypot(way.x, way.y), 1));
  });

  it('never darts down, even from a finger above', () => {
    for (const finger of [
      { x: 0, y: -10 },
      { x: 3, y: -10 },
      { x: -3, y: -10 },
      { x: 0, y: 10 },
    ]) {
      const way = dartWay(finger, { x: 0, y: 0 }, 1);
      assert.ok(way.y < 0, JSON.stringify(finger));
      assert.ok(near(Math.hypot(way.x, way.y), 1));
    }
  });

  it('from a finger dead on it, goes up to the side its phase picks', () => {
    const left = dartWay({ x: 0, y: 0 }, { x: 0, y: 0 }, -1);
    const right = dartWay({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
    assert.ok(left.x < 0 && left.y < 0);
    assert.ok(right.x > 0 && right.y < 0);
  });
});

describe('dartAt', () => {
  const span = { departs: 1000, arrives: 3000 };

  it('is 0 as the leg sets off and exactly 0 from its arrival on', () => {
    for (const kind of INSECT_KINDS) {
      assert.equal(dartAt(span, 900, kind), 0);
      assert.equal(dartAt(span, 1000, kind), 0);
      assert.equal(dartAt(span, 3000, kind), 0);
      assert.equal(dartAt(span, 5000, kind), 0);
    }
  });

  it('reaches its kind’s reach at the end of its rise, and never past it', () => {
    for (const kind of INSECT_KINDS) {
      const { reach, rise } = DARTS[kind];
      assert.ok(near(dartAt(span, 1000 + rise, kind), reach));
      for (let now = 1000; now <= 3000; now += 5) {
        assert.ok(dartAt(span, now, kind) <= reach + 1e-9);
      }
    }
  });

  it('moves no more than its sizes a frame allow, on the shortest legs too', () => {
    for (const kind of INSECT_KINDS) {
      // The shortest any kind flies (`FLIGHT_HABITS`' fly), and a long one.
      for (const flight of [600, 2000]) {
        const leg = { departs: 0, arrives: flight };
        let most = 0;
        for (let now = 0; now < flight; now += 1) {
          const step = Math.abs(
            dartAt(leg, now + 16, kind) - dartAt(leg, now, kind),
          );
          most = Math.max(most, step);
        }
        // A third of an insect's size in a 60 Hz frame, at the most.
        assert.ok(most < 0.34, `${kind} ${flight}: ${most}`);
      }
    }
  });
});
