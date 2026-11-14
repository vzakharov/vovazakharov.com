import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_HEIGHT } from '../lib/room-shape';
import type { Vec3 } from '../lib/vec';
import { assemble, f32 } from '../shader/wgsl';
import { cubeShadow } from './cube-shadow';
import { CUBE_SHADOW } from './cube-shadow.shader';
import { CUBE_METRES, DOORWAY, ROOM_DOORWAY } from './frame';
import {
  CUBE_AT,
  CUBE_BOX,
  DOORWAY_BOX,
  toCube,
  toWorld,
  WAKE_AT,
  WORLD,
} from './place';
import { islandHeight } from './island-height';
import {
  OUTDOOR_FRAME,
  OUTDOOR_FRAME_FLOATS,
  packOutdoorFrame,
} from './outdoor-frame';
import { SKY } from './sky.shader';
import { SUN, SUN_DIR } from './sun';
import {
  QUARTER_TURNS,
  toRoom,
  toShell,
  turnedToShell,
  yawToRoom,
  yawToShell,
} from './turn';

const close = (a: number, b: number, within = 1e-9): void => {
  assert.ok(Math.abs(a - b) <= within, `${String(a)} is not ${String(b)}`);
};

/** The float literals of `listing`, as numbers. */
const literals = (listing: string): number[] =>
  [...listing.matchAll(/-?\d+\.\d+(?:e-?\d+)?|-?\d+e-?\d+/g)].map(([text]) =>
    Number(text),
  );

describe('the world frame', () => {
  it('hangs the cube 1.1 m over the sand beneath its middle', () => {
    const [x, , z] = toWorld([0.5, 0, 0.5]);
    close(CUBE_BOX.min[1] - islandHeight([x, z]), 1.1);
    close(CUBE_BOX.max[1] - CUBE_BOX.min[1], CUBE_METRES);
  });

  it('takes a point to the world and back', () => {
    const c: Vec3 = [0.2, -ROOM_HEIGHT, 0.9];
    for (const [axis, value] of toCube(toWorld(c)).entries()) {
      close(value, c[axis] ?? Number.NaN);
    }
  });

  it("turns the interior in its shell about the cube's middle, the shell staying the world's", () => {
    const middle = toWorld([0.5, 0, 0.5]);
    close(middle[0], CUBE_AT[0] + CUBE_METRES / 2);
    close(middle[2], CUBE_AT[2] + CUBE_METRES / 2);
    // A corner of the room is a corner of the shell, and up is up.
    const corner = toWorld([0, 1, 0]);
    close(Math.abs(corner[0] - middle[0]), CUBE_METRES / 2);
    close(Math.abs(corner[2] - middle[2]), CUBE_METRES / 2);
    close(corner[1], CUBE_AT[1] + CUBE_METRES);
    for (const turn of QUARTER_TURNS) {
      const there = toRoom(toShell([0.2, 0.3, 0.9], 1, turn), 1, turn);
      for (const [axis, value] of [0.2, 0.3, 0.9].entries()) {
        close(there[axis] ?? Number.NaN, value);
      }
      close(yawToRoom(yawToShell(0.4, turn), turn), 0.4);
    }
    // One quarter counter-clockwise from above: the room's east is north.
    assert.deepEqual(turnedToShell([1, 0, 0], 1), [0, 0, -1]);
    assert.deepEqual(toShell([1, 0, 1], 1, 1), [1, 0, 0]);
    close(Math.cos(yawToShell(0, 1)), 0);
    close(Math.sin(yawToShell(0, 1)), -1);
  });

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

  it('opens the doorway in the east face, by the north-east corner', () => {
    close(DOORWAY_BOX.min[0], CUBE_BOX.max[0]);
    close(DOORWAY_BOX.min[1], CUBE_AT[1]);
    close(DOORWAY_BOX.min[2] - CUBE_AT[2], 0.274);
    close(DOORWAY_BOX.max[2] - CUBE_AT[2], 1.244);
    close(DOORWAY_BOX.max[1] - DOORWAY_BOX.min[1], 2.1);
  });

  it('wakes the player on dry sand south-west, above any swash', () => {
    const [x, y, z] = WAKE_AT;
    close(islandHeight([x, z]), y, 1e-6);
    assert.ok(y >= 0.32 && y < 0.4, String(y));
    assert.ok(x < 0 && z > 0);
    close(x, -z);
    const away = Math.hypot(x, z);
    assert.ok(away > 22 && away < 25, String(away));
  });

  it('gives the shader the numbers the script reads', () => {
    for (const value of [...CUBE_AT, ...CUBE_BOX.min, ...DOORWAY_BOX.max]) {
      assert.ok(literals(WORLD.listing).includes(Number(f32(value))));
    }
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

describe('cubeShadow', () => {
  const middle = toWorld([0.5, 0, 0.5]);
  const down = (metres: number): Vec3 => [
    middle[0] - SUN_DIR[0] * metres,
    middle[1] - SUN_DIR[1] * metres,
    middle[2] - SUN_DIR[2] * metres,
  ];

  it('is dark down-sun of the cube and lit beside it and up-sun', () => {
    assert.equal(cubeShadow(down(10)), 0);
    assert.equal(cubeShadow(down(-10)), 1);
    const [x, y, z] = down(10);
    assert.equal(cubeShadow([x, y, z + 6]), 1);
  });

  /** How far the edge runs across the shadow, `metres` down-sun. */
  const edge = (metres: number): number => {
    const [x, y, z] = down(metres);
    let wide = 0;
    for (let across = 0; across < 6; across += 0.002) {
      const lit = cubeShadow([x, y, z + across]);
      if (lit > 0.01 && lit < 0.99) wide += 0.002;
    }
    return wide;
  };

  it('softens its edge with distance', () => {
    assert.ok(edge(30) > 2 * edge(5), `${String(edge(30))} ${String(edge(5))}`);
  });

  it('is assembled with the frame and the sun it reads', () => {
    const source = assemble([CUBE_SHADOW]);
    assert.ok(
      source.indexOf('const CUBE_MIN') < source.indexOf('fn cubeShadow'),
    );
    assert.ok(
      source.indexOf('const SUN_DIR') < source.indexOf('fn cubeShadow'),
    );
  });
});

describe('the sky', () => {
  it('binds nothing but the frame', () => {
    const source = assemble([SKY]);
    assert.ok(source.includes('@group(0) @binding(0)'));
    assert.equal(source.match(/@binding\(/g)?.length, 1);
  });
});

describe('packOutdoorFrame', () => {
  it('lays the block out as the struct declares it', () => {
    const data = packOutdoorFrame({
      viewProjection: new Float32Array(16).fill(1),
      inverse: new Float32Array(16).fill(2),
      eye: [3, 4, 5],
      sun: [6, 7, 8],
      seconds: 9,
      hour: 10,
      width: 11,
      height: 12,
    });
    assert.equal(data.length, OUTDOOR_FRAME_FLOATS);
    assert.deepEqual(
      [...data.subarray(32)],
      [3, 4, 5, 1, 6, 7, 8, 0, 9, 10, 11, 12, 1, 0, 0, 0],
    );
    assert.deepEqual([data[0], data[15], data[16], data[31]], [1, 1, 2, 2]);
    const gone = packOutdoorFrame({
      viewProjection: new Float32Array(16),
      inverse: new Float32Array(16),
      eye: [0, 0, 0],
      sun: [0, 0, 1],
      ladderGone: true,
      seconds: 0,
      hour: 0,
      width: 1,
      height: 1,
    });
    assert.deepEqual(
      [...gone.subarray(OUTDOOR_FRAME_FLOATS - 4)],
      [0, 0, 0, 0],
    );
    const members = [...OUTDOOR_FRAME.listing.matchAll(/^ {2}(\w+): /gm)].map(
      ([, name]) => name,
    );
    assert.deepEqual(members, [
      'viewProjection',
      'inverse',
      'eye',
      'sun',
      'clock',
      'state',
    ]);
  });
});
