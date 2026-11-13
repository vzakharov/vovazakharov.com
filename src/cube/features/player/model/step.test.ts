import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Pose, Walls } from '@/cube/entities/world';

import { BODY_RADIUS, closedWalls } from './body';
import {
  EYE_HEIGHT,
  type Input,
  MAX_PITCH,
  RUN_SPEED,
  step,
  TILT_RATE,
  TURN_RATE,
  WALK_SPEED,
} from './step';
import { plantedWalls } from './walls';

const FRAME = 1 / 60;
const NEAR = 1e-9;

const pose = (over: Partial<Pose> = {}): Pose => ({
  n: 3,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  eyeAbove: EYE_HEIGHT,
  scale: 1,
  yaw: 0,
  elevation: 0,
  ...over,
});

const still: Input = {
  walk: 0,
  strafe: 0,
  turnKeys: 0,
  tiltKeys: 0,
  yawBy: 0,
  elevationBy: 0,
  running: false,
  use: false,
  answer: null,
  goTo: null,
};
const ahead: Input = { ...still, walk: 1 };

/** Walls of a 4 × 4 floor, open exactly where `open` lists `E x y` / `S x y`. */
const wallsOf = (...open: string[]): Walls => ({
  isOpenEast: (_n, x, y) => open.includes(`E ${x} ${y}`),
  isOpenSouth: (_n, x, y) => open.includes(`S ${x} ${y}`),
});

const allOpen: Walls = {
  isOpenEast: () => true,
  isOpenSouth: () => true,
};

function run(start: Pose, input: Input, seconds: number, walls: Walls): Pose {
  let current = start;
  for (let t = 0; t < seconds; t += FRAME) {
    current = step(current, input, FRAME, walls);
  }
  return current;
}

/** The distance from the body's centre to the nearest closed wall. */
function clearance(at: Pose, walls: Walls): number {
  let nearest = Infinity;
  for (const { a, b } of closedWalls(at, walls)) {
    const du = b.u - a.u;
    const dv = b.v - a.v;
    const t = Math.min(
      1,
      Math.max(
        0,
        ((at.u - a.u) * du + (at.v - a.v) * dv) / (du * du + dv * dv),
      ),
    );
    nearest = Math.min(
      nearest,
      Math.hypot(at.u - a.u - t * du, at.v - a.v - t * dv),
    );
  }
  return nearest;
}

describe('step against walls', () => {
  it('stops a body walking into a closed wall at its radius from it', () => {
    const end = run(pose(), ahead, 5, wallsOf());
    assert.equal(end.x, 0n);
    assert.ok(Math.abs(end.u - (1 - BODY_RADIUS)) < NEAR, `u = ${end.u}`);
    assert.equal(end.v, 0.5);
  });

  it('keeps the motion along a wall it slides on', () => {
    const yaw = 0.3;
    const start = pose({ u: 0.9, v: 0.2, yaw });
    const end = step(start, ahead, 0.5, wallsOf());
    const along = 0.2 + Math.sin(yaw) * WALK_SPEED * 0.5;
    assert.ok(Math.abs(end.u - (1 - BODY_RADIUS)) < NEAR, `u = ${end.u}`);
    assert.ok(Math.abs(end.v - along) < NEAR, `v = ${end.v}`);
  });

  it('crosses an open wall into the next room and re-bases exactly', () => {
    const dt = 0.05;
    const end = step(pose({ u: 0.99 }), ahead, dt, wallsOf('E 0 0'));
    assert.equal(end.x, 1n);
    assert.equal(end.u, 0.99 + WALK_SPEED * dt - 1);

    const back = step(
      pose({ x: 1n, u: 0.005, yaw: Math.PI }),
      ahead,
      dt,
      wallsOf('E 0 0'),
    );
    assert.equal(back.x, 0n);
    assert.ok(Math.abs(back.u - (1.005 - WALK_SPEED * dt)) < 1e-15);
  });

  it('walks round a door jamb into the room past it', () => {
    // (0, 0) opens south onto (0, 1), which opens east onto (1, 1); the wall
    // between (0, 0) and (1, 0) ends at the jamb the body passes.
    const walls = wallsOf('S 0 0', 'E 0 1');
    const end = run(pose({ y: 1n, v: 0.03 }), ahead, 3, walls);
    assert.equal(end.x, 1n);
    assert.equal(end.y, 1n);
    assert.ok(clearance(end, walls) >= BODY_RADIUS - NEAR);
  });

  it('never passes a wall end into a room with no door', () => {
    const walls = wallsOf('S 0 0');
    const end = run(pose({ y: 1n, v: 0.03 }), ahead, 3, walls);
    assert.equal(end.x, 0n);
    assert.ok(Math.abs(end.u - (1 - BODY_RADIUS)) < NEAR);
  });
});

describe('step controls', () => {
  it('clamps elevation to ±89°', () => {
    assert.equal(
      step(pose(), { ...still, elevationBy: 10 }, FRAME, allOpen).elevation,
      MAX_PITCH,
    );
    assert.equal(
      step(pose(), { ...still, elevationBy: -10 }, FRAME, allOpen).elevation,
      -MAX_PITCH,
    );
  });

  it('turns and tilts at their rates over the frame', () => {
    const start = pose({ yaw: 1, elevation: 0.1 });
    for (const dt of [FRAME, 0.1]) {
      const turned = step(
        start,
        { ...still, turnKeys: 1, tiltKeys: -1 },
        dt,
        allOpen,
      );
      assert.ok(Math.abs(turned.yaw - (1 + TURN_RATE * dt)) < NEAR);
      assert.ok(Math.abs(turned.elevation - (0.1 - TILT_RATE * dt)) < NEAR);
    }
    const back = step(start, { ...still, turnKeys: -1 }, 0.1, allOpen);
    assert.ok(Math.abs(back.yaw - (1 - TURN_RATE * 0.1)) < NEAR);
  });

  it('clamps a held tilt to ±89°', () => {
    assert.equal(
      step(pose(), { ...still, tiltKeys: 1 }, 10, allOpen).elevation,
      MAX_PITCH,
    );
    assert.equal(
      step(pose(), { ...still, tiltKeys: -1 }, 10, allOpen).elevation,
      -MAX_PITCH,
    );
  });

  it('walks a diagonal at walking speed', () => {
    const dt = 0.1;
    const end = step(pose(), { ...still, walk: 1, strafe: 1 }, dt, allOpen);
    const moved = Math.hypot(end.u - 0.5, end.v - 0.5);
    assert.ok(Math.abs(moved - WALK_SPEED * dt) < NEAR);
    assert.ok(end.v > 0.5, 'right of east is south');
  });

  it('walks unless it runs', () => {
    const dt = 0.1;
    const walked = step(pose(), ahead, dt, allOpen);
    assert.ok(Math.abs(walked.u - 0.5 - WALK_SPEED * dt) < NEAR);
    const end = step(pose(), { ...ahead, running: true }, dt, allOpen);
    assert.ok(Math.abs(end.u - 0.5 - RUN_SPEED * dt) < NEAR);
  });
});

/** mulberry32: a seeded stream, so the walk is the same walk every run. */
function stream(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

describe('a long random walk on floor 3', () => {
  it('never overlaps a closed wall, crosses one, or leaves the floor', () => {
    const next = stream(3);
    const rooms = 4n;
    let current = pose();
    let input = still;
    const visited = new Set<string>();
    for (let frame = 0; frame < 20_000; frame += 1) {
      if (frame % 20 === 0) {
        input = {
          ...still,
          walk: Math.round(next() * 2 - 0.3),
          strafe: Math.round(next() * 2 - 1),
          yawBy: (next() - 0.5) * 0.6,
        };
      }
      const after = step(current, input, FRAME, plantedWalls);
      assert.equal(after.n, 3);
      assert.ok(
        after.x >= 0n && after.x < rooms && after.y >= 0n && after.y < rooms,
      );
      assert.ok(after.u >= 0 && after.u < 1 && after.v >= 0 && after.v < 1);
      assert.ok(
        clearance(after, plantedWalls) >= BODY_RADIUS - NEAR,
        `overlap at frame ${frame}`,
      );
      const dx = after.x - current.x;
      const dy = after.y - current.y;
      if (dx !== 0n) {
        const west = dx > 0n ? current.x : after.x;
        assert.ok(
          plantedWalls.isOpenEast(3, west, current.y) ||
            plantedWalls.isOpenEast(3, west, after.y),
        );
      }
      if (dy !== 0n) {
        const north = dy > 0n ? current.y : after.y;
        assert.ok(
          plantedWalls.isOpenSouth(3, current.x, north) ||
            plantedWalls.isOpenSouth(3, after.x, north),
        );
      }
      current = after;
      visited.add(`${after.x} ${after.y}`);
    }
    assert.ok(visited.size >= 4, `the walk saw ${visited.size} rooms`);
  });
});
