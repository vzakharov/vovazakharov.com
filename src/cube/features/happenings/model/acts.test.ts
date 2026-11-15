import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CEILING_HEIGHT } from '@/cube/shared/lib/room-shape';
import type { Quad, Setting, Vec3 } from '@/cube/entities/world';

import { figureAt, GROWN, reachOf } from './figures';
import {
  assertInRoom,
  BEGAN,
  MIXED,
  OPEN,
  played,
  playedAt,
  settingOf,
  SHUT,
} from './happenings.test-kit';
import { fitsIn, KIND_NAMES } from './kinds';
import { NOTHING } from './staging';

const SETTINGS: readonly Setting[] = [
  settingOf(11, MIXED),
  settingOf(12, SHUT, { qx: 0, qy: 1 }),
  settingOf(13, OPEN, { qx: 1, qy: 0 }),
  settingOf(14, [false, true, false, true]),
  settingOf(15, [true, false, true, true], { qx: 1, qy: 1 }),
];
const FLOORS = [1, 24, 66] as const;
const SHARES = Array.from({ length: 41 }, (_, step) => (step / 41) * 0.9999);
const BEATS = [0, 1, 2, 3] as const;

const middle = (quads: readonly Quad[]): Vec3 => {
  const corners = quads.flatMap((quad) => quad.corners);
  const mean = (axis: 0 | 1 | 2) =>
    corners.reduce((sum, corner) => sum + corner[axis], 0) / corners.length;
  return [mean(0), mean(1), mean(2)];
};

describe('every act', () => {
  for (const kind of KIND_NAMES) {
    it(`${kind} stays in its room, whatever the room, floor and instant`, () => {
      let seen = 0;
      for (const setting of SETTINGS) {
        if (!fitsIn(kind, setting)) continue;
        for (const n of FLOORS) {
          for (const beat of BEATS) {
            for (const share of SHARES) {
              const { quads, sounds } = played(kind, setting, n, share, beat);
              assertInRoom(setting, quads, `${kind} at ${share}`);
              seen += quads.length + sounds.length;
              for (const { loudness, sinceEpoch, source } of sounds) {
                assert.ok(loudness > 0 && loudness <= 1);
                assert.ok(sinceEpoch >= BEGAN);
                assert.ok(source.every((part) => Number.isFinite(part)));
              }
            }
          }
        }
      }
      assert.ok(seen > 0, `${kind} never showed or sounded`);
    });

    it(`${kind} is the same thing at the same instant`, () => {
      const setting = SETTINGS.find((each) => fitsIn(kind, each));
      assert.ok(setting);
      assert.deepEqual(
        played(kind, setting, 24, 0.37, 2),
        played(kind, setting, 24, 0.37, 2),
      );
    });

    it(`${kind} is nothing in a room that does not fit it`, () => {
      for (const setting of SETTINGS) {
        if (fitsIn(kind, setting)) continue;
        assert.equal(played(kind, setting, 40, 0.5), NOTHING);
      }
    });
  }
});

describe('figureAt', () => {
  it('is six boxes within its reach, however it holds itself', () => {
    const made = { stuff: 'plastic' } as const;
    const quads = figureAt(
      settingOf(1).room,
      [0.5, 0, 0.5],
      0.4,
      GROWN,
      {
        arms: [
          { armSwing: 0.3, splayed: Math.PI / 2 },
          { armSwing: 2.6, splayed: 1.2 },
        ],
        headTurn: 1,
        bowed: 0.15,
      },
      { clothes: made, flesh: made },
    );
    assert.equal(quads.length, 36);
    for (const [x, y, z] of quads.flatMap(({ corners }) => corners)) {
      assert.ok(Math.hypot(x - 0.5, z - 0.5) <= reachOf(GROWN));
      assert.ok(y >= 0 && y < CEILING_HEIGHT);
    }
  });
});

describe('the acts', () => {
  const [mixed] = SETTINGS;
  assert.ok(mixed);

  it('the ball rolls from one side of the room to the other', () => {
    const open = settingOf(21, [false, true, false, true]);
    const [startX] = middle(played('ball', open, 3, 0).quads);
    const [endX] = middle(played('ball', open, 3, 0.999).quads);
    assert.ok(Math.abs(endX - startX) > 0.9);
  });

  it('the figure faces the wall it stands at', () => {
    const walled = settingOf(22, [true, false, false, false]);
    const { quads } = played('figure', walled, 3, 0.5);
    assert.equal(quads.length, 36);
    assert.ok(middle(quads)[0] > 0.85);
  });

  it('the mannequin holds a pose for a minute and then has another', () => {
    const [early, late, next] = [3, 57, 63].map(
      (seconds) => playedAt('mannequin', mixed, 9, seconds, 5).quads,
    );
    assert.deepEqual(early, late);
    assert.notDeepEqual(late, next);
  });

  it('the door opens no more than a hand’s width', () => {
    const shut = playedAt('door', mixed, 5, 1).quads;
    const ajar = playedAt('door', mixed, 5, 9).quads;
    assert.equal(shut.length, ajar.length);
    const moved = Math.max(
      ...ajar.flatMap((quad, index) =>
        quad.corners.map((corner, at) => {
          const [x, y, z] = shut[index]?.corners[at] ?? corner;
          return Math.hypot(corner[0] - x, corner[1] - y, corner[2] - z);
        }),
      ),
    );
    assert.ok(moved > 0.015 && moved < 0.03, `the latch moved ${moved}`);
  });

  it('the balloon is under the ceiling until it bursts', () => {
    const { quads } = played('balloon', mixed, 2, 0.5);
    assert.ok(middle(quads)[1] > CEILING_HEIGHT - 0.1);
    const burst = playedAt('balloon', mixed, 2, -0.5);
    assert.equal(burst.quads.length, 6);
    assert.deepEqual(
      burst.sounds.map(({ cue }) => cue),
      ['pop'],
    );
  });

  it('the chairs end up facing one point', () => {
    const before = played('chairs', mixed, 30, 0.01).quads;
    const after = played('chairs', mixed, 30, 0.5).quads;
    const later = played('chairs', mixed, 30, 0.9).quads;
    assert.equal(after.length, 5 * 36);
    assert.notDeepEqual(before, after);
    assert.deepEqual(after, later);
  });

  it('the hand has too many fingers deep down', () => {
    const fingers = (n: number) => played('hand', mixed, n, 0.4).quads.length;
    assert.equal(fingers(3), 4 * 6);
    assert.equal(fingers(40), 6 * 6);
    assert.equal(played('hand', mixed, 3, 0.999).quads.length, 0);
  });

  it('the corner is whole before it comes loose and after it snaps back', () => {
    assert.equal(played('corner', mixed, 50, 0.05), NOTHING);
    assert.equal(played('corner', mixed, 50, 0.5).quads.length, 9);
    assert.equal(played('corner', mixed, 50, 0.95), NOTHING);
  });

  it('a sound keeps the second it began at for as long as it sounds', () => {
    const rings = [0.01, 0.03, 0.05].map(
      (share) => played('phone', mixed, 4, share).sounds,
    );
    assert.deepEqual(rings[0], rings[1]);
    assert.deepEqual(rings[1], rings[2]);
    assert.equal(rings[0]?.[0]?.sinceEpoch, BEGAN);
  });

  it('what is only heard shows nothing', () => {
    assert.equal(played('knock', mixed, 4, 0.05).quads.length, 0);
    assert.equal(played('footsteps', mixed, 4, 0.5).quads.length, 0);
    assert.equal(played('knock', mixed, 4, 0.99), NOTHING);
  });
});
