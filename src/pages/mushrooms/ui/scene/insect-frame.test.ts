import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CLUMP_DISTANCE,
  type Eye,
  EYE_HEIGHT,
  OPENING_EYE,
  pinholeOf,
  SPREAD,
  spread,
} from '../../model/ground';
import { flightPoint } from '../../model/insect-paths';
import { between, mulberry32 } from '../../model/random';
import {
  type Aloft,
  aloftAt,
  aloftFramed,
  centreOf,
  drawnAloft,
  FRAME_MARGIN,
  type Framed,
  framedOf,
  mixD,
  SEAT_FADE,
  type SeatEnds,
  SKIM,
  unframed,
  type Veer,
  veered,
  veeredAlong,
  veerOf,
} from './insect-frame';
import { meadowCamera } from './meadow-camera';
import { wrapAngle } from './panorama';
import {
  buried,
  D_SEE,
  layoutOfPlane,
  middleOf,
  ofLayout,
  rowAt,
  sunkOver,
  V_NEAR,
  type View,
  viewAt,
} from './view';
import { VIEWPORTS } from './viewports';

const CAMERAS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, camera: meadowCamera(width, height) },
  { name: `${name} turned`, camera: meadowCamera(height, width) },
]);

function near(actual: number, expected: number, tolerance: number): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

/**
 * The most a run of evenly spaced samples bends, per its step squared: a
 * smooth bend holds it as the samples thicken, a kink grows it with them.
 */
function bending(values: number[]): number {
  const turns = values
    .slice(2)
    .map((value, i) =>
      Math.abs(value - 2 * (values[i + 1] ?? 0) + (values[i] ?? 0)),
    );
  return Math.max(...turns) * (values.length - 1) ** 2;
}

/** Layout points across `view`'s opening crop, each over a ground row below the brow's middle. */
function layoutPoints(view: View) {
  const pinhole = pinholeOf(view);
  const brow = pinhole.y + (pinhole.focal * EYE_HEIGHT) / D_SEE;
  const points = [];
  for (let row = 0; row <= 4; row++) {
    const footRow = brow + 1 + ((view.height - brow) * row) / 4;
    for (let across = 0; across <= 6; across++) {
      const x = middleOf(view) + view.width * (across / 6 - 0.5);
      for (const lift of [0, 30, 120]) {
        points.push({ point: { x, y: footRow - lift }, footRow });
      }
    }
  }
  return points;
}

/** Random eyes about the glade, looking every way. */
function eyes(seed: number, count: number): Eye[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: between(random, -4, 4),
    y: between(random, -4, 4),
    heading: between(random, -Math.PI, Math.PI),
  }));
}

describe('insect-frame', () => {
  for (const { name, camera } of CAMERAS) {
    const opening = viewAt(camera, OPENING_EYE);

    it(`is the opening layout at the opening eye on a ${name} screen`, () => {
      for (const { point, footRow } of layoutPoints(opening)) {
        const { opening: q, perPx } = rowAt(opening, footRow);
        const plane = spread({
          x: (point.x - middleOf(opening)) * perPx,
          y: q,
        });
        const aloft = { ...plane, h: (footRow - point.y) * perPx };
        const framed = framedOf(opening, 0, aloft);
        near(framed.x, point.x, 1e-6);
        near(framed.y, point.y, 1e-6);
        near(framed.forward, q, 1e-9);
        const drawn = drawnAloft(opening, unframed(opening, 0, framed));
        const today = sunkOver(
          opening,
          ofLayout(opening, point, footRow),
          ofLayout(opening, { ...point, y: footRow }, footRow),
        );
        if (buried(opening, today)) {
          assert.equal(drawn, undefined);
          continue;
        }
        assert.ok(drawn);
        near(drawn.x, today.x, 1e-6);
        near(drawn.y, today.y, 1e-6);
      }
    });

    it(`frames the ground where layoutOfPlane lays it on a ${name} screen`, () => {
      for (const { point, footRow } of layoutPoints(opening)) {
        if (point.y !== footRow) continue;
        const { opening: q, perPx } = rowAt(opening, footRow);
        const plane = spread({
          x: (point.x - middleOf(opening)) * perPx,
          y: q,
        });
        const laid = layoutOfPlane(opening, plane);
        assert.ok(laid);
        const framed = framedOf(opening, 0, { ...plane, h: 0 });
        near(framed.x, laid.x, 1e-6);
        near(framed.y, laid.y, 1e-6);
      }
    });

    it(`mixes depth as today's rows mix on a ${name} screen`, () => {
      const pinhole = pinholeOf(camera);
      const rowOf = (q: number) => pinhole.y + (pinhole.focal * EYE_HEIGHT) / q;
      const ends: Array<[number, number]> = [
        [0.7, 4],
        [5, 1.1],
        [2, 2],
      ];
      for (const [from, to] of ends) {
        for (let step = 0; step <= 10; step++) {
          const flown = step / 10;
          near(
            rowOf(mixD(from, to, flown)),
            rowOf(from) + (rowOf(to) - rowOf(from)) * flown,
            1e-6,
          );
        }
      }
    });

    it(`round-trips framed and aloft on a ${name} screen`, () => {
      const random = mulberry32(7);
      for (const eye of eyes(3, 20)) {
        const view = viewAt(camera, eye);
        const centre = between(random, -Math.PI, Math.PI);
        for (let sample = 0; sample < 20; sample++) {
          const azimuth = centre + between(random, -FRAME_MARGIN, FRAME_MARGIN);
          const distance = between(random, 0.2, 8);
          const aloft: Aloft = {
            x: eye.x + distance * Math.sin(azimuth),
            y: eye.y + distance * Math.cos(azimuth),
            h: between(random, 0, 2),
          };
          const framed = framedOf(view, centre, aloft);
          const back = unframed(view, centre, framed);
          near(back.x, aloft.x, 1e-9);
          near(back.y, aloft.y, 1e-9);
          near(back.h, aloft.h, 1e-9);
          if (aloft.h >= SKIM) {
            assert.deepEqual(aloftFramed(view, centre, framed), back);
          }
          const again = framedOf(view, centre, unframed(view, centre, framed));
          near(again.x, framed.x, 1e-9);
          near(again.y, framed.y, 1e-9);
          near(again.forward, framed.forward, 1e-9);
        }
      }
    });
  }

  it('leaves framed points where they are as the eye turns', () => {
    const camera = meadowCamera(1180, 820);
    const random = mulberry32(11);
    for (const eye of eyes(5, 20)) {
      const centre = between(random, -Math.PI, Math.PI);
      const aloft: Aloft = {
        x: eye.x + 2 * Math.sin(centre + 0.3),
        y: eye.y + 2 * Math.cos(centre + 0.3),
        h: 0.4,
      };
      const before = framedOf(viewAt(camera, eye), centre, aloft);
      const turned = { ...eye, heading: eye.heading + between(random, -3, 3) };
      assert.deepEqual(framedOf(viewAt(camera, turned), centre, aloft), before);
    }
  });

  it('centres on the heading wherever both ends already fit', () => {
    const from = { x: -1, y: 2 };
    const to = { x: 1.5, y: 3 };
    assert.equal(centreOf(OPENING_EYE, from, to), 0);
    near(centreOf({ x: 0, y: 0, heading: 0.4 }, from, to), 0.4, 1e-12);
    near(
      centreOf({ x: 0, y: 0, heading: 0.4 - 2 * Math.PI }, from, to),
      0.4,
      1e-12,
    );
  });

  it('keeps both ends within the margin for chords up to π', () => {
    const random = mulberry32(13);
    for (const eye of eyes(17, 400)) {
      const start = between(random, -Math.PI, Math.PI);
      const end = start + between(random, -Math.PI, Math.PI);
      const from = { x: eye.x + Math.sin(start), y: eye.y + Math.cos(start) };
      const to = { x: eye.x + 3 * Math.sin(end), y: eye.y + 3 * Math.cos(end) };
      const centre = centreOf(eye, from, to);
      for (const azimuth of [start, end]) {
        assert.ok(
          Math.abs(wrapAngle(azimuth - centre)) <= FRAME_MARGIN + 1e-12,
        );
      }
      assert.ok(FRAME_MARGIN < (SPREAD * Math.PI) / 2);
    }
  });

  it('hides an aloft point at the eye', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    assert.equal(drawnAloft(view, { x: 0, y: 0, h: 0.3 }), undefined);
  });
});

describe('aloftFramed', () => {
  // A butterfly's leg across the screen between two caps 0.3 up, bowed down
  // the screen, mixed as the scene mixes it: its forward along the chord.
  const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
  const depth = 0.6 * CLUMP_DISTANCE;
  const start = framedOf(view, 0, { x: -3.5, y: depth, h: 0.3 });
  const end = framedOf(view, 0, { x: 3.5, y: depth, h: 0.3 });
  const path = {
    start,
    end,
    bow: 1,
    departs: 0,
    arrives: 1000,
    launch: 1,
    speed: 1,
    drink: 0,
  };
  const motion = { phase: 0, kind: 'butterfly', flutter: 0 } as const;
  const leg = (samples: number): Framed[] =>
    Array.from({ length: samples + 1 }, (_, step) => {
      const point = flightPoint(path, (step * path.arrives) / samples, motion);
      const gone = Math.hypot(point.x - start.x, point.y - start.y);
      const left = Math.hypot(point.x - end.x, point.y - end.y);
      const flown = gone / (gone + left);
      return { ...point, forward: mixD(start.forward, end.forward, flown) };
    });

  it('reads that leg as dipping underground unframed', () => {
    const lowest = Math.min(...leg(400).map((at) => unframed(view, 0, at).h));
    assert.ok(lowest < -0.4, String(lowest));
  });

  it('keeps that leg over the ground, on the screen point it was framed at', () => {
    for (const at of leg(400)) {
      const aloft = aloftFramed(view, 0, at);
      assert.ok(aloft.h > 0, `${aloft.h} at ${at.x}, ${at.y}`);
      const back = framedOf(view, 0, aloft);
      near(back.x, at.x, 1e-9);
      near(back.y, at.y, 1e-9);
    }
  });

  it('bends that leg’s height and distance with no kink', () => {
    const reads = [
      (aloft: Aloft) => aloft.h,
      (aloft: Aloft) => Math.hypot(aloft.x, aloft.y),
    ];
    for (const read of reads) {
      const bent = (samples: number) =>
        bending(leg(samples).map((at) => read(aloftFramed(view, 0, at))));
      const [coarse, fine] = [bent(400), bent(1600)];
      assert.ok(fine < 1.5 * coarse, `${fine} against ${coarse}`);
    }
  });
});

describe('aloftAt', () => {
  it('is drawn back where it was taken, on every screen and heading, short of the brow', () => {
    let checked = 0;
    for (const { name, camera } of CAMERAS) {
      for (let turn = 0; turn < 8; turn++) {
        for (const stand of [OPENING_EYE, { x: 2.5, y: -3 }]) {
          const view = viewAt(camera, {
            ...stand,
            heading: -Math.PI + (turn * Math.PI) / 4,
          });
          for (const share of [0, 0.3, 0.5, 0.8, 1]) {
            for (const down of [0, 0.4, 0.75, 1]) {
              const at = { x: view.width * share, y: view.height * down };
              for (const distance of [0.2, 1, 0.5 * D_SEE, 0.99 * D_SEE]) {
                const drawn = drawnAloft(view, aloftAt(view, at, distance));
                assert.ok(drawn, `${name}: ${at.x}, ${at.y} at ${distance}`);
                near(drawn.x, at.x, 1e-9);
                near(drawn.y, at.y, 1e-9);
                checked++;
              }
            }
          }
        }
      }
    }
    assert.ok(checked > 5000, String(checked));
  });
});

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
    return {
      x: eye.x + distance * Math.sin(toward),
      y: eye.y + distance * Math.cos(toward),
      h: 0.3,
    };
  }

  /** How far from `eye` `veered` leaves the point `distance` out. */
  function veeredAt(distance: number, veer: Veer): number {
    const moved = veered(eye, outAt(distance), veer);
    return Math.hypot(moved.x - eye.x, moved.y - eye.y);
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
        const distance = Math.hypot(moved.x - eye.x, moved.y - eye.y);
        assert.ok(distance >= veer.near - 1e-12);
        near(Math.atan2(moved.x - eye.x, moved.y - eye.y), toward, 1e-9);
        assert.equal(moved.h, point.h);
      }
    });
  }

  it('pushes a point at the eye out along its heading', () => {
    const moved = veered(eye, { ...eye, h: 0 }, TABLET_VEER);
    near(Math.atan2(moved.x - eye.x, moved.y - eye.y), eye.heading, 1e-12);
    near(Math.hypot(moved.x - eye.x, moved.y - eye.y), TABLET_VEER.near, 1e-12);
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
    const raw = {
      ...from,
      x: from.x + (to.x - from.x) * flown,
      y: from.y + (to.y - from.y) * flown,
    };
    return veeredAlong(eye, raw, veer, flown, ends);
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
      const raw = {
        x: air.x + (outside.x - air.x) * flown,
        y: air.y + (outside.y - air.y) * flown,
        h: 0.2,
      };
      const plain = veered(eye, raw, veer);
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
    near(inside.x, outside.x, 1e-5);
    near(inside.y, outside.y, 1e-5);
  });
});
