import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { type Ground, OPENING_EYE, project } from '../../model/ground';
import { OPENING_FEET } from '../../model/placement';
import { bedPlace, type Host } from './bed-place';
import { drawnAt } from './insect-away';
import { drawnInsect } from './insect-seat';
import { meadowCamera } from './meadow-camera';
import { type View, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** Headings the eye turns through, the clump still ahead. */
const HEADINGS = [0, 0.085, 0.21, 0.345, -0.3];

/** Feet a host stands on: the opening clump's, and one off to the side and back. */
const FEET: readonly Ground[] = [...OPENING_FEET, { x: 1.2, z: 0.6 }];

/** Seats off a host's foot, in world px at the opening eye: over it, and toward either rim. */
const SEATS: readonly Point[] = [
  { x: 0, y: -60 },
  { x: -30, y: -45 },
  { x: 30, y: -45 },
];

/** A host standing on `foot` as `view` draws it, as its bed stands it. */
function hostOn(view: View, foot: Ground): Host {
  const { x, y } = project(view, foot);
  return { laidFoot: { x, y }, stands: bedPlace(view, foot) };
}

function plus(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function apart(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const CASES = VIEWPORTS.flatMap(([name, width, height]) =>
  HEADINGS.flatMap((heading) =>
    FEET.map((foot) => ({
      name,
      heading,
      foot,
      view: viewAt(meadowCamera(width, height), { ...OPENING_EYE, heading }),
    })),
  ),
);

describe('drawnInsect', () => {
  it('draws a sitting insect where its host draws the seat, at every heading', () => {
    for (const { view, foot } of CASES) {
      const host = hostOn(view, foot);
      const { stands, laidFoot } = host;
      for (const seat of SEATS) {
        const drawn = drawnInsect(
          view,
          plus(laidFoot, seat),
          { flown: 1, row: laidFoot.y },
          { to: host },
        );
        // The bed draws its body flat at its foot, `zoom` times its layout.
        const sprite = {
          x: stands.x + seat.x * stands.zoom,
          y: stands.y + seat.y * stands.zoom,
        };
        assert.ok(drawn && apart(drawn, sprite) < 1e-9);
      }
    }
  });

  it('agrees with the flight through the view at the opening, and parts from it as the eye turns', () => {
    let most = 0;
    for (const { view, foot, heading } of CASES) {
      const host = hostOn(view, foot);
      const { laidFoot } = host;
      for (const seat of SEATS) {
        const point = plus(laidFoot, seat);
        const sitting = drawnInsect(
          view,
          point,
          { flown: 1, row: laidFoot.y },
          { to: host },
        );
        const flown = drawnAt(view, point, laidFoot.y);
        assert.ok(sitting && flown);
        if (heading === 0) assert.ok(apart(sitting, flown) < 1e-6);
        most = Math.max(most, apart(sitting, flown));
      }
    }
    assert.ok(most > 1, `the flight's ${most.toFixed(2)} px off the seat`);
  });

  it('sets off from where it sat and lands where it will sit, with no jump', () => {
    for (const { view, foot } of CASES) {
      const left = hostOn(view, foot);
      const to = hostOn(view, { x: foot.x - 0.5, z: foot.z + 0.2 });
      const start = plus(left.laidFoot, SEATS[1] ?? { x: 0, y: 0 });
      const end = plus(to.laidFoot, SEATS[2] ?? { x: 0, y: 0 });
      const rows = { from: left.laidFoot.y, to: to.laidFoot.y };
      const at = (along: number): Point | undefined => {
        const point = {
          x: start.x + (end.x - start.x) * along,
          y: start.y + (end.y - start.y) * along,
        };
        const row = rows.from + (rows.to - rows.from) * along;
        return drawnInsect(view, point, { flown: along, row }, { left, to });
      };
      for (const [edge, near] of [
        [0, 1e-6],
        [1, 1 - 1e-6],
      ] as const) {
        const sat = at(edge);
        const flying = at(near);
        assert.ok(sat && flying && apart(sat, flying) < 0.01);
      }
    }
  });
});
