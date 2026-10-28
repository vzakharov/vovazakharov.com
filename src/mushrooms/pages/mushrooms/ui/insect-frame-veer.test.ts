import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { alongAzimuth, type Point } from '@/mushrooms/shared/lib/geometry';
import { mulberry32 } from '@/mushrooms/shared/lib/random';
import {
  CLUMP_DISTANCE,
  type Eye,
  pinholeOf,
  V_NEAR,
} from '@/mushrooms/shared/space';
import type { Aloft } from '@/mushrooms/entities/insect/index.node-safe';
import {
  SEAT_FADE,
  type SeatEnds,
  type Veer,
  veered,
  veeredAlong,
  veerOf,
} from '@/mushrooms/entities/insect/index.test-only';
import { meadowCamera } from '@/mushrooms/entities/mushroom/index.node-safe';
import { CAMERAS } from '@/mushrooms/entities/mushroom/index.test-only';

import { near, nearPoint } from './insect-frame.test-kit';

/** `flown` of the way along the straight leg from `from` to `to`, at `from`'s height. */
function straight(from: Aloft, to: Aloft, flown: number): Aloft {
  return {
    ...from,
    x: from.x + (to.x - from.x) * flown,
    y: from.y + (to.y - from.y) * flown,
  };
}

const TABLET_VEER = veerOf(meadowCamera(1180, 820));

describe('veerOf', () => {
  it('bends V_NEAR to the tablet edge, about 0.625 of the clump distance', () => {
    near(TABLET_VEER.near, 0.625 * CLUMP_DISTANCE, 0.005 * CLUMP_DISTANCE);
    near(TABLET_VEER.width, 0.1 * CLUMP_DISTANCE, 1e-12);
  });

  for (const { name, camera } of CAMERAS) {
    it(`is V_NEAR bent at the screen's edge on a ${name} screen`, () => {
      const pinhole = pinholeOf(camera);
      const veer = veerOf(camera);
      near(veer.near, V_NEAR * Math.hypot(1, pinhole.x / pinhole.focal), 1e-12);
      assert.ok(veer.near > V_NEAR && veer.near < 2 * V_NEAR);
      assert.ok(veer.width < veer.near);
    });
  }
});

describe('veered', () => {
  const eye: Eye = { x: 0.7, y: -1.2, heading: 0.5 };
  const toward = 2.1;

  /** A point `distance` from `eye` along `toward`. */
  function outAt(distance: number): Aloft {
    return { ...alongAzimuth(eye, toward, distance), h: 0.3 };
  }

  /** How far `point` lies from `eye`, and at which plane azimuth. */
  function fromEye(point: Point) {
    const [x, y] = [point.x - eye.x, point.y - eye.y];
    return { distance: Math.hypot(x, y), azimuth: Math.atan2(x, y) };
  }

  /** How far from `eye` `veered` leaves the point `distance` out. */
  function veeredAt(distance: number, veer: Veer): number {
    return fromEye(veered(eye, outAt(distance), veer)).distance;
  }

  for (const veer of [TABLET_VEER, { near: 1, width: 0.2 }]) {
    const label = `near ${veer.near.toFixed(3)}, width ${veer.width}`;
    const step = 1e-6;

    it(`joins continuously and with a matching slope at both ends (${label})`, () => {
      const joins = [
        { join: veer.near - veer.width, slope: 0 },
        { join: veer.near + veer.width, slope: 1 },
      ];
      for (const { join, slope } of joins) {
        const at = veeredAt(join, veer);
        near(veeredAt(join - step, veer), at, 1e-5);
        near(veeredAt(join + step, veer), at, 1e-5);
        near((at - veeredAt(join - step, veer)) / step, slope, 1e-4);
        near((veeredAt(join + step, veer) - at) / step, slope, 1e-4);
      }
    });

    it(`leaves a point past the band where it is (${label})`, () => {
      for (const distance of [
        veer.near + veer.width + 1e-9,
        2 * (veer.near + veer.width),
        40,
      ]) {
        const point = outAt(distance);
        assert.equal(veered(eye, point, veer), point);
      }
    });

    it(`never leaves a point nearer than near, nor turns it (${label})`, () => {
      for (let sample = 1; sample <= 200; sample++) {
        const point = outAt(((veer.near + veer.width) * sample) / 200);
        const moved = veered(eye, point, veer);
        const { distance, azimuth } = fromEye(moved);
        assert.ok(distance >= veer.near - 1e-12);
        near(azimuth, toward, 1e-9);
        assert.equal(moved.h, point.h);
      }
    });
  }

  it('pushes a point at the eye out along its heading', () => {
    const moved = veered(eye, { ...eye, h: 0 }, TABLET_VEER);
    const { distance, azimuth } = fromEye(moved);
    near(azimuth, eye.heading, 1e-12);
    near(distance, TABLET_VEER.near, 1e-12);
  });
});

describe('veeredAlong', () => {
  const eye: Eye = { x: -0.4, y: 2.3, heading: -0.8 };
  const veer = TABLET_VEER;
  const { near: r, width: w } = veer;

  /** The point `across`, `ahead` near-radii off `eye`. */
  function off(across: number, ahead: number): Aloft {
    return { x: eye.x + across * r, y: eye.y + ahead * r, h: 0.2 };
  }

  /** `flown` of the way along the straight leg from `from` to `to`, veered. */
  function along(from: Aloft, to: Aloft, flown: number, ends: SeatEnds) {
    return veeredAlong(eye, straight(from, to, flown), veer, flown, ends);
  }

  const air = off(-1.5, 0.2);
  const seats = [off(0.3, 0.2), off(0, 0.05), off(0, 1 + (0.5 * w) / r)];

  it('lands exactly on a seat the veer would move, and leaves it exactly', () => {
    for (const seat of seats) {
      assert.notDeepEqual(veered(eye, seat, veer), seat);
      assert.deepEqual(veeredAlong(eye, seat, veer, 1, { to: seat }), seat);
      assert.deepEqual(veeredAlong(eye, seat, veer, 0, { from: seat }), seat);
      const landing = along(air, seat, 1 - 1e-4, { to: seat });
      const leaving = along(seat, air, 1e-4, { from: seat });
      for (const end of [landing, leaving]) {
        assert.ok(Math.hypot(end.x - seat.x, end.y - seat.y) < 1e-3 * r);
      }
    }
  });

  it('is veered itself on legs whose ends are outside near + width', () => {
    const outside = off(0.4, 1.1 + w / r);
    const random = mulberry32(5);
    for (let sample = 0; sample < 200; sample++) {
      const flown = random();
      const plain = veered(eye, straight(air, outside, flown), veer);
      assert.deepEqual(along(air, outside, flown, {}), plain);
      assert.deepEqual(
        along(air, outside, flown, { from: air, to: outside }),
        plain,
      );
    }
  });

  it(`is C¹ in flown where the fade sets in, ${SEAT_FADE} off a seat`, () => {
    const seat = seats[0] ?? air;
    const step = 1e-6;
    const legs = [
      { from: air, to: seat, at: 1 - SEAT_FADE, ends: { to: seat } },
      { from: seat, to: air, at: SEAT_FADE, ends: { from: seat } },
    ];
    for (const { from, to, at, ends } of legs) {
      const middle = along(from, to, at, ends);
      assert.notDeepEqual(veered(eye, middle, veer), middle);
      const before = along(from, to, at - step, ends);
      const after = along(from, to, at + step, ends);
      for (const axis of ['x', 'y'] as const) {
        near(before[axis], middle[axis], 1e-4);
        near(after[axis], middle[axis], 1e-4);
        near(
          (middle[axis] - before[axis]) / step,
          (after[axis] - middle[axis]) / step,
          1e-3,
        );
      }
    }
  });

  it('fades continuously as the eye walks a seat out of the band', () => {
    const edge = r + w;
    const flown = 0.9;
    const legOf = (distance: number) => {
      const seat = off(0, distance / r);
      return along(air, seat, flown, { to: seat });
    };
    const inside = legOf(edge - 1e-7);
    const outside = legOf(edge + 1e-7);
    nearPoint(inside, outside, 1e-5);
  });
});
