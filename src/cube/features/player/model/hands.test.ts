import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Quad, Vec3 } from '@/cube/entities/world';

import { handsOf } from './hands';
import { FIRST_LOOK } from './look';
import type { Player } from './play';
import { beside, holed, room, shrunk } from './play.test-kit';

const minus = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
const dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const eyeOf = ({ pose }: Player): Vec3 => [pose.u, pose.eyeAbove, pose.v];

const aheadOf = ({ pose: { yaw, elevation } }: Player): Vec3 => [
  Math.cos(elevation) * Math.cos(yaw),
  Math.sin(elevation),
  Math.cos(elevation) * Math.sin(yaw),
];

const middle = (quads: readonly Quad[]): Vec3 => {
  const corners = quads.flatMap((quad) => quad.corners);
  const mean = (axis: 0 | 1 | 2): number => {
    let sum = 0;
    for (const corner of corners) sum += corner[axis];
    return sum / corners.length;
  };
  return [mean(0), mean(1), mean(2)];
};

/** The frames of floor 1's look in which the hands are up. */
const seen = (): Player[] =>
  shrunk().filter((player) => handsOf(player).length > 0);

describe('handsOf', () => {
  it('is empty at rest, small, and through a look with no hands in it', () => {
    assert.deepEqual(handsOf(beside()), []);
    assert.deepEqual(handsOf(shrunk().at(-1) ?? beside()), []);
    const around = { ...FIRST_LOOK, hands: 0 };
    assert.ok(shrunk(around).every((player) => handsOf(player).length === 0));
    assert.ok(holed.shrinkLook.hands > 0);
  });

  it('shows two hands of skin out of fabric sleeves while the look is on them', () => {
    const up = seen();
    assert.ok(up.length > 60, 'for more than a second');
    for (const player of up) {
      const quads = handsOf(player);
      // Seven boxes a hand: a sleeve, a palm, four fingers, a thumb.
      assert.equal(quads.length, 2 * 7 * 6);
      assert.equal(quads.filter((q) => q.surface === 'fabric').length, 12);
      assert.equal(quads.filter((q) => q.surface === 'skin').length, 72);
      for (const quad of quads) assert.deepEqual(quad.room, room);
    }
  });

  it('holds them before the eyes, at the body’s own size', () => {
    for (const player of seen()) {
      const eye = eyeOf(player);
      const ahead = aheadOf(player);
      const { scale } = player.pose;
      for (const { corners } of handsOf(player)) {
        for (const corner of corners) {
          const from = minus(corner, eye);
          assert.ok(Number.isFinite(Math.hypot(...from)));
          assert.ok(Math.hypot(...from) < 0.25 * scale, 'within arm’s reach');
          assert.ok(dot(from, ahead) > 0.01 * scale, 'past the near plane');
        }
      }
    }
  });

  it('faces every quad out of its box', () => {
    for (const player of [seen()[20], seen().at(-20)]) {
      assert.ok(player);
      const quads = handsOf(player);
      for (let at = 0; at < quads.length; at += 6) {
        const part = quads.slice(at, at + 6);
        const centre = middle(part);
        for (const quad of part) {
          const out = minus(middle([quad]), centre);
          assert.ok(dot(out, quad.normal) > 0);
        }
      }
    }
  });

  it('turns the palms over: up to the eye first, away by the end', () => {
    const up = seen();
    /** How squarely the first hand's palm, its second box, faces the eye. */
    const facing = (player: Player): number => {
      const palm = handsOf(player).slice(6, 12);
      // The palm's two broad faces are its largest; take the one facing the thumb-up side.
      const broad = palm[1];
      assert.ok(broad);
      return dot(broad.normal, aheadOf(player));
    };
    const [early, late] = [up[10], up.at(-10)];
    assert.ok(early && late);
    assert.ok(facing(early) * facing(late) < 0, 'the other side shows');
  });

  it('is the same for the same player', () => {
    const player = seen()[30];
    assert.ok(player);
    assert.deepEqual(handsOf(player), handsOf(structuredClone(player)));
  });
});
