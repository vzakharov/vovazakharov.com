import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type DoorWall,
  isSameWall,
  type Pose,
  type Shelf,
  type WallMounted,
} from '@/cube/entities/world';

import { EYE_HEIGHT, standingAt, type Ways } from '../../body/index.test-only';
import { FRAME, use } from '../../play.test-kit';
import { aimOf, type Pressable } from './aim';
import { play } from './play';

/** The east wall of floor 3's room (1, 2), a door. */
const DOOR: DoorWall = { n: 3, x: 1n, y: 2n, isEast: true };
const isDoor = (wall: DoorWall) => isSameWall(wall, DOOR);

/** The room's sign, on the same east wall, north of the doorway. */
const SIGN: WallMounted = { at: { u: 1, v: 0.5 }, facing: { u: -1, v: 0 } };

/** The room's shelf, on the same wall, just north of the doorway. */
const SHELF: Shelf = {
  mount: 'x-wall',
  at: { u: 1, v: 0.7 },
  facing: { u: -1, v: 0 },
};

const at = (u: number, v: number, yaw: number): Pose => ({
  n: 3,
  x: 1n,
  y: 2n,
  u,
  v,
  eyeAbove: EYE_HEIGHT,
  scale: 1,
  yaw,
  elevation: 0,
});

const all: Pressable = { shelf: null, sign: SIGN, isDoor };

describe('aimOf', () => {
  it('answers the door or the sign, whichever the gaze is nearer', () => {
    assert.equal(aimOf(at(0.7, 0.75, 0), all)?.at, 'door');
    assert.equal(aimOf(at(0.7, 0.75, -0.35), all)?.at, 'sign');
  });

  it('answers the pill or the door, whichever the gaze is nearer', () => {
    const shelved = { ...all, sign: null, shelf: SHELF };
    assert.equal(aimOf(at(0.82, 0.75, -0.1), shelved)?.at, 'pill');
    assert.equal(aimOf(at(0.82, 0.75, 0.4), shelved)?.at, 'door');
  });

  it('gives the opened door its wall, swinging away from the body', () => {
    const aim = aimOf(at(0.7, 0.75, 0), all);
    assert.ok(aim?.at === 'door');
    assert.ok(isSameWall(aim.door, DOOR));
    assert.equal(aim.door.toward, 1);
  });

  it('opens the door looked at, not the nearer one beside it', () => {
    const south: DoorWall = { ...DOOR, isEast: false };
    const cornered: Pressable = {
      shelf: null,
      sign: null,
      isDoor: (wall) => isDoor(wall) || isSameWall(wall, south),
    };
    const ten = (10 * Math.PI) / 180;
    const east = aimOf(at(0.7, 0.8, ten), cornered);
    assert.ok(east?.at === 'door' && isSameWall(east.door, DOOR));
    const looking = aimOf(at(0.7, 0.8, Math.PI / 2 - ten), cornered);
    assert.ok(looking?.at === 'door' && isSameWall(looking.door, south));
  });

  it('answers nothing out of reach, or with nothing there', () => {
    assert.equal(aimOf(at(0.2, 0.75, 0), all), null);
    assert.equal(aimOf(at(0.7, 0.75, 0), { shelf: null, sign: null }), null);
  });
});

describe('play, pressed by a sign and a door', () => {
  const doored: Ways = {
    isOpenEast: () => false,
    isOpenSouth: () => false,
    isDoor,
  };

  it('opens the door only when it is the one faced', () => {
    const toDoor = play(
      standingAt(at(0.7, 0.75, 0)),
      use,
      FRAME,
      doored,
      null,
      SIGN,
    );
    assert.ok(toDoor.door !== null);
    const toSign = play(
      standingAt(at(0.7, 0.75, -0.35)),
      use,
      FRAME,
      doored,
      null,
      SIGN,
    );
    assert.equal(toSign.door, null);
  });
});
