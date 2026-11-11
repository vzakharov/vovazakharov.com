import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { maze } from './maze';
import { face } from './quad';
import type { Room } from './room';
import { opens, STEPS } from './rooms';
import { closedSides, inPlace, settingOf } from './setting';
import { traits } from './traits';
import { mazeWalls } from './walls';

const SEED = '8675309';
const walls = mazeWalls(maze(SEED));
const rolled = traits(SEED);
const room: Room = { n: 5, x: 3n, y: 9n };

describe('closedSides', () => {
  it('answers for each side in step order', () => {
    assert.deepEqual(
      closedSides(walls, room),
      STEPS.map((step) => !opens(walls, room, step)),
    );
  });

  it('closes every side of the one room of floor 1', () => {
    assert.deepEqual(closedSides(walls, { n: 1, x: 0n, y: 0n }), [
      true,
      true,
      true,
      true,
    ]);
  });
});

describe('settingOf', () => {
  it('gives the room its walls, its hole and its own word', () => {
    const hole = { qx: 1, qy: 0 } as const;
    assert.deepEqual(settingOf(walls, rolled, room, hole), {
      room,
      closed: closedSides(walls, room),
      hole,
      grain: rolled.room.at(room).grain,
    });
  });
});

describe('inPlace', () => {
  it('stands a quad of the room’s frame at the room’s place and size', () => {
    const quad = face([0, 0, 0], [1, 0, 0], [0, 0.5, 0], room, 'wood');
    const [stood] = inPlace([quad], { origin: [2, -0.25, 1], roomSide: 0.5 });
    assert.deepEqual(stood?.corners, [
      [2, -0.25, 1],
      [2.5, -0.25, 1],
      [2.5, 0, 1],
      [2, 0, 1],
    ]);
    assert.deepEqual(stood?.normal, quad.normal);
    assert.equal(stood?.surface, 'wood');
  });
});
