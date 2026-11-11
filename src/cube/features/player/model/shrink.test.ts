import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DROP,
  eyeInFrame,
  HOLE_SIDE,
  type Pose,
  type Walls,
} from '@/cube/entities/world';

import { BODY_RADIUS } from './body';
import {
  FALL_AT,
  feetAt,
  HALVING,
  type Holed,
  LEVER_REACH,
  play,
  type Player,
  scaleAt,
} from './shrink';
import { EYE_HEIGHT, type Input } from './step';

const FRAME = 1 / 60;
const NEAR = 1e-9;

const allOpen: Walls = { isOpenEast: () => true, isOpenSouth: () => true };

/** Floor 3's room (1, 2), its hole in the north-west quarter. */
const room = { n: 3, x: 1n, y: 2n };
const holed: Holed = {
  quarter: { qx: 0, qy: 0 },
  lever: { mount: 'x-wall', at: { u: 0, v: 0.25 }, facing: { u: 1, v: 0 } },
};

const standing = (over: Partial<Pose> = {}): Player => ({
  pose: {
    ...room,
    u: 0.25,
    v: 0.25,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: 0.4,
    elevation: -0.3,
    ...over,
  },
  shrinking: null,
});

const still: Input = {
  walk: 0,
  strafe: 0,
  turnKeys: 0,
  tiltKeys: 0,
  yawBy: 0,
  elevationBy: 0,
  pull: false,
};
const pull: Input = { ...still, pull: true };

/** What a pull at (`u`, `v`) of the holed room sets going. */
const from = (u: number, v: number) =>
  play(standing({ u, v }), pull, FRAME, allOpen, holed).shrinking;

/** Every frame from a pull at `start` until the body lands, `input` held. */
function frames(start: Player, input: Input = still): Player[] {
  const out = [play(start, pull, FRAME, allOpen, holed)];
  while (out.at(-1)?.shrinking) {
    const last = out.at(-1);
    assert.ok(last);
    out.push(play(last, input, FRAME, allOpen, holed));
    assert.ok(out.length < 1000, 'never landed');
  }
  return out;
}

describe('the shrink', () => {
  it('drops through where the body is exactly as wide as the hole', () => {
    assert.ok(Math.abs(2 * BODY_RADIUS * scaleAt(FALL_AT) - HOLE_SIDE) < 1e-12);
    assert.equal(feetAt(FALL_AT), 0);
    assert.ok(feetAt(FALL_AT + 0.01) < 0);
    const played = frames(standing());
    const first = played.findIndex(
      ({ pose }) => pose.eyeAbove < EYE_HEIGHT * pose.scale - NEAR,
    );
    const [before, after] = [played[first - 1], played[first]];
    assert.ok(before && after);
    assert.ok(2 * BODY_RADIUS * before.pose.scale >= HOLE_SIDE);
    assert.ok(2 * BODY_RADIUS * after.pose.scale < HOLE_SIDE);
  });

  it('lands at half scale on the slab below, a whole person there', () => {
    assert.equal(scaleAt(HALVING), 0.5);
    assert.ok(Math.abs(feetAt(HALVING) + DROP) < 1e-12);
    const landed = frames(standing()).at(-1)?.pose;
    assert.ok(landed);
    assert.deepEqual([landed.n, landed.x, landed.y], [4, 2n, 4n]);
    assert.ok(Math.abs(landed.scale - 1) < NEAR);
    assert.ok(Math.abs(landed.eyeAbove - EYE_HEIGHT) < NEAR);
  });

  it('rebases with the eye where it was, looking where it looked', () => {
    // A frame that ends exactly at the halving, so nothing moves in it but
    // the units.
    const last = { sincePull: HALVING - 0.25, ...holed };
    const scale = scaleAt(HALVING);
    const before: Pose = {
      ...standing().pose,
      u: 0.255,
      v: 0.248,
      scale,
      eyeAbove: feetAt(HALVING) + EYE_HEIGHT * scale,
    };
    const { pose: after, shrinking } = play(
      { pose: { ...before, scale: scaleAt(last.sincePull) }, shrinking: last },
      still,
      0.25,
      allOpen,
      holed,
    );
    assert.equal(shrinking, null);
    const [a, b] = [eyeInFrame(room, before).eye, eyeInFrame(room, after).eye];
    for (const [i, value] of a.entries()) {
      assert.ok(
        Math.abs(value - (b[i] ?? Number.NaN)) < NEAR,
        `${a.join(',')} vs ${b.join(',')}`,
      );
    }
    assert.ok(Math.abs(after.yaw - before.yaw) < NEAR);
    assert.ok(Math.abs(after.elevation - before.elevation) < NEAR);
  });

  it('keeps walking, slower, and draws the body to the hole’s middle', () => {
    const played = frames(standing({ u: 0.215, v: 0.28 }), {
      ...still,
      walk: 1,
    });
    const middle = { u: 0.25, v: 0.25 };
    for (const [index, { pose }] of played.slice(0, -1).entries()) {
      const t = (index + 1) * FRAME;
      const radius = BODY_RADIUS * pose.scale;
      if (t > FALL_AT + NEAR) {
        // Inside the shaft, clear of its sides.
        const clear = HOLE_SIDE / 2 - radius + NEAR;
        assert.ok(Math.abs(pose.u - middle.u) <= clear);
        assert.ok(Math.abs(pose.v - middle.v) <= clear);
      }
    }
    const atDrop = played.find((_, index) => (index + 1) * FRAME >= FALL_AT);
    assert.ok(atDrop);
    assert.ok(Math.abs(atDrop.pose.u - middle.u) < 0.002);
    const second = played[1]?.pose;
    const first = played[0]?.pose;
    assert.ok(first && second);
    assert.ok(second.u - first.u > 0, 'walks while shrinking');
  });

  it('pulls from wherever the body covers some of the hole', () => {
    const edge = HOLE_SIDE / 2 + BODY_RADIUS;
    assert.notEqual(from(0.25 + edge - 0.001, 0.25 - edge + 0.001), null);
    assert.equal(from(0.25 + edge + 0.001, 0.25), null);
    assert.equal(from(0.25, 0.25 - edge - 0.001), null);
  });

  it('pulls nothing away from the hole or out of reach', () => {
    const off = play(standing({ u: 0.5 }), pull, FRAME, allOpen, holed);
    assert.equal(off.shrinking, null);
    const far: Holed = {
      ...holed,
      lever: { ...holed.lever, at: { u: 0.25 + LEVER_REACH + 0.01, v: 0.25 } },
    };
    assert.equal(play(standing(), pull, FRAME, allOpen, far).shrinking, null);
    assert.equal(play(standing(), pull, FRAME, allOpen, null).shrinking, null);
    assert.notEqual(
      play(standing(), pull, FRAME, allOpen, holed).shrinking,
      null,
    );
  });
});
