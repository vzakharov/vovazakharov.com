import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cross, dot, minus, type Quad, type Vec3 } from '@/cube/entities/world';

import { handsOf } from './hands';
import { FIRST_LOOK } from './look';
import { beside, holed, room, shrunk } from './play.test-kit';
import type { Player } from './player';

const eyeOf = ({ pose }: Player): Vec3 => [pose.u, pose.eyeAbove, pose.v];

const aheadOf = ({ pose: { yaw, elevation } }: Player): Vec3 => [
  Math.cos(elevation) * Math.cos(yaw),
  Math.sin(elevation),
  Math.cos(elevation) * Math.sin(yaw),
];

/** A nail is the one painted part of a hand. */
const isNail = ({ paint }: Quad): boolean => paint !== undefined;

const isShrinking = ({ act }: Player): boolean => act?.act === 'shrinking';

/** The frames of floor 1's look in which the hands are up. */
const seen = (): Player[] =>
  shrunk().filter(
    (player) => isShrinking(player) && handsOf(player).length > 0,
  );

/** How far the nails face the way the eye looks. */
const away = (player: Player): number => {
  const nails = handsOf(player).filter((quad) => isNail(quad));
  let sum = 0;
  for (const { normal } of nails) sum += dot(normal, aheadOf(player));
  return sum / nails.length;
};

describe('handsOf', () => {
  it('is empty at rest, small, and through a look with no hands in it', () => {
    assert.deepEqual(handsOf(beside()), []);
    assert.deepEqual(handsOf(shrunk().at(-1) ?? beside()), []);
    const around = { ...FIRST_LOOK, hands: 0 };
    assert.ok(
      shrunk(around)
        .filter((player) => isShrinking(player))
        .every((player) => handsOf(player).length === 0),
    );
    assert.ok(holed.shrinkLook.hands > 0);
  });

  it('shows two hands of skin out of fabric sleeves while the look is on them', () => {
    const up = seen();
    assert.ok(up.length > 60, 'for more than a second');
    for (const player of up) {
      const quads = handsOf(player);
      const sleeves = quads.filter((q) => q.surface === 'fabric');
      const skin = quads.filter((q) => q.surface === 'skin');
      assert.equal(sleeves.length + skin.length, quads.length);
      assert.ok(sleeves.length > 0 && sleeves.length % 2 === 0);
      assert.ok(skin.length > sleeves.length);
      // Five nails a hand, each three quads across and two along.
      assert.equal(quads.filter((quad) => isNail(quad)).length, 2 * 5 * 6);
      for (const quad of quads) {
        assert.deepEqual(quad.room, room);
        assert.ok(quad.normals, 'lit as a curve');
      }
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

  it('winds every quad the way its normal faces', () => {
    for (const player of [seen()[20], seen().at(-20)]) {
      assert.ok(player);
      for (const { corners, normal } of handsOf(player)) {
        const [a, b, c, d] = corners;
        const turn = cross(minus(c, a), minus(d, b));
        assert.ok(dot(turn, normal) >= 0);
      }
    }
  });

  it('turns the hands over: the nails away from the eye first, to it by the end', () => {
    const up = seen();
    const [early, late] = [up[10], up.at(-10)];
    assert.ok(early && late);
    assert.ok(away(early) > 0.5, 'the palms show');
    // The fingers point away from the eye, so their nails never face it square.
    assert.ok(away(late) < away(early) - 0.4, 'the backs show');
  });

  it('is the same for the same player', () => {
    const player = seen()[30];
    assert.ok(player);
    assert.deepEqual(handsOf(player), handsOf(structuredClone(player)));
  });
});
