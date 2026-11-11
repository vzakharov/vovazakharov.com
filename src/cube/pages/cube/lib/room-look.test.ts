import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roomFlags, themeOf } from '@/cube/entities/theme';
import {
  maze,
  mazeWalls,
  opens,
  type Room,
  STEPS,
  traits,
} from '@/cube/entities/world';

import { cellOf, roomLooks } from './room-look';

const SEED = '8675309';
const walls = mazeWalls(maze(SEED));
const rolled = traits(SEED);

describe('cellOf', () => {
  it('keeps the low six bits of the column, and of the row a byte up', () => {
    assert.equal(cellOf({ n: 9, x: 5n, y: 3n }), 5 | (3 << 8));
    assert.equal(cellOf({ n: 60, x: (1n << 40n) + 65n, y: 64n }), 1);
  });
});

describe('roomLooks', () => {
  const eye: Room = { n: 4, x: 2n, y: 5n };
  const lookOf = roomLooks(eye, walls, rolled);

  it('stands a room where the eye’s frame has it', () => {
    assert.deepEqual(lookOf(eye).origin, [0, 0, 0]);
    assert.equal(lookOf(eye).side, 1);
    const east = lookOf({ n: 4, x: 3n, y: 5n });
    assert.deepEqual(east.origin, [1, 0, 0]);
    const below = lookOf({ n: 5, x: 5n, y: 10n });
    assert.deepEqual(below.origin, [0.5, -0.25, 0]);
    assert.equal(below.side, 0.5);
  });

  it('gives a room its own word, the same on every asking', () => {
    assert.equal(lookOf(eye).seed, rolled.room.at(eye).grain);
    assert.equal(lookOf(eye), lookOf({ ...eye }));
    assert.notEqual(lookOf(eye).seed, lookOf({ n: 4, x: 3n, y: 5n }).seed);
  });

  it('flags the walls the maze closes', () => {
    const closed = STEPS.reduce(
      (bits, step, side) => bits | (opens(walls, eye, step) ? 0 : 1 << side),
      0,
    );
    assert.equal(lookOf(eye).flags & 0b1111, closed);
  });

  it('lights the one room of a floor none of whose lamps fail', () => {
    assert.equal(themeOf(1).dark, 0);
    const whole = roomLooks({ n: 1, x: 0n, y: 0n }, walls, rolled);
    assert.equal(
      whole({ n: 1, x: 0n, y: 0n }).flags,
      roomFlags({ closed: [true, true, true, true], lit: true, litBeside: 0 }),
    );
  });
});
