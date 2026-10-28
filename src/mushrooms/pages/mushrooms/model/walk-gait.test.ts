import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import { GLIDE_OVER, GLIDE_TAU } from '@/mushrooms/shared/lib/glide';
import {
  eyeAt,
  holdTurn,
  holdWalk,
  lensAt,
  openingWalk,
  refit,
  type Walk,
  withGait,
} from '@/mushrooms/shared/space';
import {
  distanceOfRow,
  RISE_EASE,
  SLOP,
  STRIDE_CRUISE,
  STRIDE_FLING_FASTEST,
} from '@/mushrooms/shared/space/index.test-only';

import {
  apart,
  axisOf,
  CAMERAS,
  Clock,
  flying,
  FRAME,
  shifted,
  TABLET,
} from './walk.test-kit';

describe('the walk across a resize', () => {
  it('keeps the heading and the eye’s place', () => {
    const clock = new Clock(holdTurn(holdWalk(openingWalk(TABLET), 1), -1, 10));
    clock.run(1.3);
    const before = eyeAt(clock.walk, clock.time);
    for (const { name, camera } of CAMERAS) {
      const after = eyeAt(refit(clock.walk, camera, clock.time), clock.time);
      assert.ok(Math.abs(after.heading - before.heading) < 1e-9, name);
      assert.deepEqual(pick(after, 'x', 'y'), pick(before, 'x', 'y'));
    }
  });
});

describe('a ground drag’s gait', () => {
  it('holds the height it was pressed at, so a gait flip mid-drag moves a flight’s eye by the finger alone and flings nothing', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(flying(camera));
      const pressed = clock.time;
      const down = { x: camera.width / 2, y: camera.height * 0.7 };
      const lens = lensAt(clock.walk, pressed);
      clock.press(down);
      clock.run(FRAME);
      const locked = shifted(down, 0, SLOP + 1);
      clock.move(locked);
      assert.equal(axisOf(clock.walk), 'step', name);
      clock.run(pressed + 0.1 - clock.time);
      clock.walk = withGait(clock.walk, 'steps', clock.time);
      // The finger rests while the eye settles to the walking height.
      clock.run(RISE_EASE);
      const before = clock.walk.stride.at;
      clock.run(FRAME);
      clock.move(shifted(locked, 0, 1));
      const row =
        distanceOfRow(lens, locked.y) - distanceOfRow(lens, locked.y + 1);
      const moved = apart(clock.walk.stride.at, before);
      assert.ok(moved <= row + 1e-9, `${name}: moved ${moved} > ${row}`);
      clock.lift();
      assert.equal(clock.walk.stride.glide, undefined, `${name}: flung`);
    }
  });

  it('walks a quarter-second swipe by the horizon a few steps, where a flight crosses the meadow', () => {
    // At the cruise under the finger, then the fling's most.
    const most = STRIDE_CRUISE * 0.25 + STRIDE_FLING_FASTEST * GLIDE_TAU;
    for (const { name, camera } of CAMERAS) {
      const top = camera.groundTop + 4;
      for (const [axis, down, to] of [
        ['step', { x: camera.width / 2, y: top }, { y: camera.height - 5 }],
        [
          'strafe',
          { x: camera.width * 0.1, y: top },
          { x: camera.width * 0.9 },
        ],
      ] as const) {
        const went = (walk: Walk): number => {
          const clock = new Clock(walk);
          const start = clock.walk.stride.at;
          clock.press(down);
          clock.drag(down, { ...down, ...to }, 0.25);
          clock.lift();
          clock.run(GLIDE_OVER + 0.5);
          return apart(clock.walk.stride.at, start);
        };
        const flown = went(flying(camera));
        const walked = went(openingWalk(camera));
        assert.ok(flown > 2 * most, `${name} ${axis}: flew ${flown}`);
        assert.ok(walked <= most + 1e-9, `${name} ${axis}: walked ${walked}`);
      }
    }
  });
});
