import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Vec3 } from '@/cube/entities/world';

import { grippingHand } from './grip';
import { CM } from './hand';

const ROOM = { n: 1, x: 0n, y: 0n };
/** A rung running north to south, the climber facing west, an elbow below and behind. */
const AT: Vec3 = [0.5, 0.2, 0.5];
const WEST: Vec3 = [-1, 0, 0];
const ELBOW: Vec3 = [0.55, 0.13, 0.5];
/** A 3 cm rung's radius, in room sides. */
const RADIUS = 1.5 * CM;

/** How far `point` is from the rung's axis, which runs along z through `AT`. */
const fromRung = ([x, y]: Vec3): number => Math.hypot(x - AT[0], y - AT[1]);

describe('grippingHand', () => {
  const right = grippingHand(AT, WEST, ELBOW, 'right', 1, ROOM);
  const skin = right.filter(({ surface }) => surface === 'skin');

  it('closes the hand round the rung without going into it', () => {
    const corners = skin.flatMap(({ corners: four }) => four);
    const nearest = Math.min(...corners.map((corner) => fromRung(corner)));
    assert.ok(nearest > RADIUS * 0.8, 'no skin inside the rung');
    assert.ok(nearest < RADIUS * 1.5, 'and some of it on the rung');
  });

  it('has skin on every side of the rung', () => {
    const sides = new Set(
      skin.flatMap(({ corners }) =>
        corners
          .filter((corner) => fromRung(corner) < 3 * RADIUS)
          .map(([x, y]) =>
            Math.floor(
              (Math.atan2(y - AT[1], x - AT[0]) + Math.PI) / (Math.PI / 2),
            ),
          ),
      ),
    );
    assert.equal(sides.size, 4);
  });

  it('makes the left hand the right one’s mirror image', () => {
    const left = grippingHand(AT, WEST, ELBOW, 'left', 1, ROOM);
    assert.equal(left.length, right.length);
    const mirrored = (quads: typeof right): number[] =>
      quads
        .flatMap(({ corners }) =>
          corners.map(([x, y, z]) => x + y + (z - AT[2])),
        )
        .toSorted((a, b) => a - b);
    const flipped = right
      .flatMap(({ corners }) => corners.map(([x, y, z]) => x + y - (z - AT[2])))
      .toSorted((a, b) => a - b);
    for (const [index, sum] of mirrored(left).entries()) {
      assert.ok(Math.abs(sum - (flipped[index] ?? Number.NaN)) < 1e-9);
    }
  });

  it('draws the sleeve back to the elbow', () => {
    const cloth = right.filter(({ surface }) => surface === 'fabric');
    const lowest = Math.min(
      ...cloth.flatMap(({ corners }) => corners.map(([, y]) => y)),
    );
    assert.ok(Math.abs(lowest - ELBOW[1]) < 0.02);
  });
});
