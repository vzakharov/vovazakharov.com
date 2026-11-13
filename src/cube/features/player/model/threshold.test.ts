import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { DOORWAY_BOX, ROOM_DOORWAY, yawToRoom } from '@/cube/shared/outside';
import { isOutside, type Pose, type Walls } from '@/cube/entities/world';

import { type Abroad, abroad, steppingOut } from './abroad';
import { BODY_RADIUS, walk } from './body';
import { INTRO_STAGE } from './intro-stage';
import { arrivedOn } from './play';
import { EYE_OVER_SAND, roamingAt } from './roam';
import { shotOf } from './scenes';
import { EYE_HEIGHT, STILL } from './step';
import {
  isPastSill,
  onSill,
  poseWithin,
  shotWithin,
  standingWithin,
  whereOf,
} from './threshold';

const { land, ladder, arrival, cube } = INTRO_STAGE;
const DT = 1 / 30;

/** A floor with every wall shut. */
const CLOSED: Walls = { isOpenEast: () => false, isOpenSouth: () => false };

/**
 * The doorway as a body in floor 1's room walks at it: whether its wall is
 * across `u`, the way through it, and the middle of its opening along the
 * wall, in room sides.
 */
const { wall, from, to } = ROOM_DOORWAY;
const ACROSS_U = wall === 'east' || wall === 'west';
const OUTWARD = wall === 'east' || wall === 'south' ? 1 : -1;
const OPENING = (from + to) / 2 / ROOM_METRES;

/** A spot `across` room sides in from the doorway's wall, `along` it. */
const facingDoor = (across: number, along: number) => {
  const off = OUTWARD > 0 ? 1 - across : across;
  return ACROSS_U ? { u: off, v: along } : { u: along, v: off };
};

/** How far `pose` is from the doorway's wall, and where along it. */
const offDoor = ({ u, v }: Pose) => {
  const [off, along] = ACROSS_U ? [u, v] : [v, u];
  return { across: OUTWARD > 0 ? 1 - off : off, along };
};

/** `state` played with no keys until its scene ends. */
function played(state: Abroad): Abroad {
  let now = state;
  for (let t = 0; now.scene !== null && t < 60; t += DT) {
    now = abroad(now, STILL, DT, t, INTRO_STAGE, true);
  }
  return now;
}

describe('the threshold', () => {
  it('reads a pose in the room as a camera and back', () => {
    const pose = { ...arrivedOn(1), u: 0.8, v: 0.2, yaw: 0.4, elevation: -0.1 };
    const shot = shotWithin(pose);
    assert.ok(shot.x > cube.min[0] && shot.x < cube.max[0]);
    assert.ok(Math.abs(shot.y - (cube.min[1] + 2.5 + 1.6)) < 1e-9);
    const back = poseWithin(shot);
    assert.ok(Math.abs(back.u - 0.8) < 1e-12 && Math.abs(back.v - 0.2) < 1e-12);
    assert.ok(Math.abs(back.yaw - 0.4) < 1e-12);
    assert.equal(back.elevation, -0.1);
    assert.equal(back.eyeAbove, EYE_HEIGHT);
    assert.equal(back.scale, 1);
  });

  it('arrives inside the room, past the doorway', () => {
    const [x, y, z] = arrival;
    const pose = poseWithin({
      ...shotOf({ eye: [x, y, z], yaw: -Math.PI, elevation: 0, roll: 0 }),
    });
    const { across, along } = offDoor(pose);
    assert.ok(across > 0.1 && across < 0.3);
    assert.ok(along > from / ROOM_METRES && along < to / ROOM_METRES);
    // It faces the way it climbed: into the room, the doorway behind it.
    assert.ok(Math.abs(Math.cos(pose.yaw - yawToRoom(Math.PI)) - 1) < 1e-9);
    assert.equal(pose.n, 1);
  });

  it('walks out through the doorway and nowhere else along the wall', () => {
    const [du, dv] = ACROSS_U ? [0.01 * OUTWARD, 0] : [0, 0.01 * OUTWARD];
    /** `pose` after walking at the doorway's wall for a room's side, a step at a time. */
    const walkedOut = (pose: Pose): Pose => {
      let now = pose;
      for (let step = 0; step < 100 && !isPastSill(now); step += 1) {
        now = walk(now, du, dv, CLOSED);
      }
      return now;
    };
    const aside = OPENING < 0.5 ? OPENING + 0.3 : OPENING - 0.3;
    for (const scale of [1, 0.5]) {
      const by = { ...arrivedOn(1), scale, ...facingDoor(0.2, OPENING) };
      const through = walkedOut(by);
      assert.ok(isPastSill(through), `at scale ${scale}`);
      const back = onSill(through);
      assert.ok(back.x === 0n && back.y === 0n);
      assert.ok(offDoor(back).across < 0.01);
      assert.equal(offDoor(back).along, offDoor(through).along);
      const beside = walkedOut({ ...by, ...facingDoor(0.2, aside) });
      assert.ok(!isPastSill(beside));
      assert.ok(Math.abs(offDoor(beside).across - BODY_RADIUS * scale) < 1e-9);
    }
    const upstairs = walkedOut({
      ...arrivedOn(2),
      ...facingDoor(0.2, OPENING),
    });
    assert.ok(!isPastSill(upstairs));
    assert.ok(upstairs.x === 0n && upstairs.y === 0n);
  });

  it('adapts a camera within the cube as a pose, and one outside as out of doors', () => {
    const [x, y, z] = arrival;
    const inside = shotOf({ eye: [x, y, z], yaw: 0, elevation: 0, roll: 0 });
    assert.ok(!isOutside(whereOf(inside, INTRO_STAGE)));
    assert.ok(
      isOutside(whereOf({ ...inside, x: cube.max[0] + 0.1 }, INTRO_STAGE)),
    );
  });

  it('stands a body in the room where the sun meets it', () => {
    // On the sill, in the middle of the doorway: at the cube's east face.
    const { foot, headAbove } = standingWithin({
      ...arrivedOn(1),
      ...facingDoor(0, OPENING),
    });
    const [x, y, z] = foot;
    assert.ok(Math.abs(x - cube.max[0]) < 1e-9);
    assert.ok(Math.abs(y - DOORWAY_BOX.min[1]) < 1e-9);
    assert.ok(z > DOORWAY_BOX.min[2] && z < DOORWAY_BOX.max[2]);
    assert.ok(headAbove > 1.6 && headAbove < 1.8);
  });

  it('climbs the real ladder into the room and steps back out onto the sand', () => {
    const [footX, , footZ] = ladder.foot;
    const roamer = roamingAt(
      land,
      [footX + 0.9, footZ + 0.3],
      { yaw: Math.PI, elevation: 0 },
      0,
    );
    const free: Abroad = {
      roamer,
      scene: null,
      asleep: false,
      ladderGone: false,
      shot: shotOf(roamer),
      cues: [],
      entered: false,
    };
    const up = played(
      abroad(free, { ...STILL, use: true }, DT, 0, INTRO_STAGE, true),
    );
    assert.ok(up.entered);
    // Turned round to look out of the doorway, and on its sill.
    const pose = onSill({ ...poseWithin(up.shot), yaw: yawToRoom(0) });
    const down = played(steppingOut(shotWithin(pose), 1, INTRO_STAGE, 0));
    const [x, y, z] = down.roamer.eye;
    assert.ok(x > cube.max[0] + 0.3 && x < cube.max[0] + 1);
    assert.ok(Math.abs(y - land.height(x, z) - EYE_OVER_SAND) < 1e-6);
    // The drop is the sill's height over the sand.
    assert.ok(Math.abs(ladder.top[1] - land.height(x, z) - 3.6) < 0.15);
  });
});
