import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  type DoorWall,
  isSameWall,
  leafLine,
  type Pose,
} from '@/cube/entities/world';

import { ahead, FRAME, NEAR, use } from '../../play.test-kit';
import { play } from '../../play/index.test-only';
import { closedWalls } from './body';
import {
  doorsFaced,
  LEAF_SWING,
  leafAngle,
  OPEN_ANGLE,
  type OpenDoor,
  swung,
  type Ways,
} from './door';
import { type Player, standingAt } from './player';
import { EYE_HEIGHT, STILL } from './step';

/** The east wall of floor 3's room (1, 2), a door. */
const DOOR: DoorWall = { n: 3, x: 1n, y: 2n, isEast: true };

/** Every wall closed, that one a door. */
const doored: Ways = {
  isOpenEast: () => false,
  isOpenSouth: () => false,
  isDoor: (wall) => isSameWall(wall, DOOR),
};

/** A body in the door's west room, level with the doorway, looking east at it. */
const facing = (over: Partial<Pose> = {}): Pose => ({
  n: 3,
  x: 1n,
  y: 2n,
  u: 0.8,
  v: DOORWAY_CUT.middle,
  eyeAbove: EYE_HEIGHT,
  scale: 1,
  yaw: 0,
  elevation: 0,
  ...over,
});

const opened: OpenDoor = { ...DOOR, toward: 1, openFor: 0, shutAt: null };

function played(player: Player, input: typeof STILL, seconds: number): Player {
  let now = player;
  for (let t = 0; t < seconds; t += FRAME) {
    now = play(now, input, FRAME, doored, null);
  }
  return now;
}

describe('leafAngle', () => {
  it('swings open over LEAF_SWING, and back once it shuts', () => {
    assert.equal(leafAngle(opened), 0);
    const half = leafAngle({ ...opened, openFor: LEAF_SWING / 2 });
    assert.ok(half > 0 && half < OPEN_ANGLE);
    assert.equal(leafAngle({ ...opened, openFor: LEAF_SWING }), OPEN_ANGLE);
    const shutting = { ...opened, openFor: 5, shutAt: 4 };
    assert.equal(leafAngle({ ...shutting, openFor: 4 }), OPEN_ANGLE);
    assert.ok(
      Math.abs(leafAngle({ ...shutting, openFor: 4 + LEAF_SWING })) < NEAR,
    );
  });
});

describe('doorsFaced', () => {
  const isDoor = doored.isDoor ?? (() => false);

  it('yields the door the body reaches and faces, away from it', () => {
    const [door, ...rest] = doorsFaced(facing(), isDoor);
    assert.ok(door !== undefined && isSameWall(door, DOOR));
    assert.equal(door.toward, 1);
    assert.deepEqual(rest, []);
  });

  it('swings into the west room when opened from the east', () => {
    const east = facing({ x: 2n, u: 0.2, yaw: Math.PI });
    const [door] = doorsFaced(east, isDoor);
    assert.ok(door !== undefined && isSameWall(door, DOOR));
    assert.equal(door.toward, -1);
  });

  it('yields every door in reach, the nearer not hiding the other', () => {
    const south: DoorWall = { ...DOOR, isEast: false };
    const both = (wall: DoorWall) =>
      isSameWall(wall, DOOR) || isSameWall(wall, south);
    const corner = facing({ u: 0.7, v: 0.8, yaw: Math.PI / 4 });
    const walls = doorsFaced(corner, both).map(({ isEast }) => isEast);
    assert.equal(walls.length, 2);
    assert.ok(walls.includes(true) && walls.includes(false));
  });

  it('yields nothing turned away, out of reach, or at a plain wall', () => {
    assert.deepEqual(doorsFaced(facing({ yaw: Math.PI }), isDoor), []);
    assert.deepEqual(doorsFaced(facing({ u: 0.3 }), isDoor), []);
    assert.deepEqual(
      doorsFaced(facing(), () => false),
      [],
    );
  });
});

describe('swung', () => {
  it('stays open within reach, shuts out of it, and is gone once shut', () => {
    const near = swung(opened, facing(), 3);
    assert.equal(near?.shutAt, null);
    const away = swung(opened, facing({ u: 0.2 }), 3);
    assert.ok(away !== null);
    assert.equal(away.shutAt, 3);
    assert.notEqual(swung(away, facing({ u: 0.2 }), LEAF_SWING / 2), null);
    assert.equal(swung(away, facing({ u: 0.2 }), LEAF_SWING + FRAME), null);
  });

  it('is gone as soon as the body is on another floor', () => {
    assert.equal(swung(opened, facing({ n: 4 }), FRAME), null);
  });
});

describe('closedWalls with a door ajar', () => {
  it('keeps the wall either side of the doorway, and the leaf', () => {
    const ajar = { ...DOOR, toward: 1 as const, angle: OPEN_ANGLE };
    const onDoor = closedWalls(facing(), { ...doored, ajar }).filter(
      ({ a, b }) => a.u === 1 && b.u === 1 && a.v >= 0 && b.v <= 1,
    );
    assert.deepEqual(
      onDoor.map(({ a, b }) => [a.v, b.v]),
      [
        [0, DOORWAY_CUT.from],
        [DOORWAY_CUT.to, 1],
      ],
    );
    const leaf = closedWalls(facing(), { ...doored, ajar })[0];
    assert.ok(leaf !== undefined);
    assert.ok(Math.abs(leaf.b.u - (1 + leafLine(ajar).edge[1])) < NEAR);
  });
});

describe('play with a door', () => {
  it('walks into a shut door, and through it once the hand opens it', () => {
    const start = standingAt(facing());
    assert.equal(played(start, ahead, 1).pose.x, 1n);
    const pressed = play(start, use, FRAME, doored, null);
    assert.ok(pressed.door !== null);
    const through = played(played(pressed, STILL, LEAF_SWING), ahead, 1);
    assert.equal(through.pose.x, 2n);
  });

  it('shuts the door behind the body once it is out of reach', () => {
    const pressed = play(standingAt(facing()), use, FRAME, doored, null);
    const through = played(played(pressed, STILL, LEAF_SWING), ahead, 1);
    assert.notEqual(through.door?.shutAt ?? null, null);
    const later = played(through, STILL, LEAF_SWING);
    assert.equal(later.door, null);
    assert.equal(played(later, { ...ahead, walk: -1 }, 2).pose.x, 2n);
  });
});
