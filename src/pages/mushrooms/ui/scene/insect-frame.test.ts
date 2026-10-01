import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Eye,
  EYE_HEIGHT,
  OPENING_EYE,
  pinholeOf,
  SPREAD,
  spread,
} from '../../model/ground';
import { between, mulberry32 } from '../../model/random';
import {
  type Aloft,
  aloftFramed,
  centreOf,
  drawnAloft,
  FRAME_MARGIN,
  framedOf,
  mixD,
  VEER,
  type Veer,
  veered,
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
        const drawn = drawnAloft(opening, aloftFramed(opening, 0, framed));
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
          const back = aloftFramed(view, centre, framedOf(view, centre, aloft));
          near(back.x, aloft.x, 1e-9);
          near(back.y, aloft.y, 1e-9);
          near(back.h, aloft.h, 1e-9);
          const framed = framedOf(view, centre, aloft);
          const again = framedOf(
            view,
            centre,
            aloftFramed(view, centre, framed),
          );
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

  for (const veer of [VEER, { near: 1, width: 0.2 }]) {
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
    const moved = veered(eye, { ...eye, h: 0 });
    near(Math.atan2(moved.x - eye.x, moved.y - eye.y), eye.heading, 1e-12);
    near(Math.hypot(moved.x - eye.x, moved.y - eye.y), VEER.near, 1e-12);
  });
});
