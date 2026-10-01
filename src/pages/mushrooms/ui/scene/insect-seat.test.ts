import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import {
  CLUMP_DISTANCE,
  type Ground,
  OPENING_EYE,
  planeOf,
  project,
} from '../../model/ground';
import { OPENING_FEET } from '../../model/placement';
import { bedPlace, type Host, onHost } from './bed-place';
import { drawnAt, type Zoomed } from './insect-away';
import { aloftAt, veerOf } from './insect-frame';
import { drawnFlier, drawnInsect, seatedZoom } from './insect-seat';
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

/** How near the opening's zoom stands to 1 anywhere on the screen. */
const SAME_SIZE = 1e-3;

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
        assert.equal(drawn.zoom, stands.zoom);
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
        // At the opening the two part only by the lens's squeeze across a
        // seat's span off the screen's middle, never by a whole px.
        if (heading === 0) assert.ok(apart(sitting, flown) < 1);
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
      const at = (along: number): Zoomed | undefined => {
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
        assert.ok(Math.abs(sat.zoom - flying.zoom) < 1e-4);
      }
    }
  });

  it('draws an insect at its depth: its own size at the opening, larger stepped toward it, sitting or flying', () => {
    for (const [, width, height] of VIEWPORTS) {
      const camera = meadowCamera(width, height);
      const [opening, stepped] = [OPENING_EYE, { x: 0, y: 1, heading: 0 }].map(
        (eye) => viewAt(camera, eye),
      );
      assert.ok(opening && stepped);
      const sizes = FEET.map((foot) => {
        const laid = project(opening, foot);
        const point = plus(laid, SEATS[0] ?? { x: 0, y: 0 });
        const along = { flown: 0.5, row: laid.y };
        const zooms = [opening, stepped].map((view) => ({
          sitting: drawnInsect(
            view,
            point,
            { flown: 1, row: laid.y },
            { to: hostOn(view, foot) },
          )?.zoom,
          flying: drawnInsect(view, point, along, {})?.zoom,
        }));
        const [before, after] = zooms;
        assert.ok(
          before && after?.sitting !== undefined && after.flying !== undefined,
        );
        // Off the screen's middle the lens draws a thing a hair smaller than
        // the layout does, by its bend against the pinhole's slant.
        assert.ok(Math.abs((before.sitting ?? 0) - 1) < SAME_SIZE);
        assert.ok(Math.abs((before.flying ?? 0) - 1) < SAME_SIZE);
        assert.ok(after.sitting > 1);
        assert.ok(Math.abs(after.flying - after.sitting) < 1e-9);
        return { row: laid.y, zoom: after.flying };
      });
      const [far, near] = sizes.toSorted((a, b) => a.row - b.row);
      assert.ok(far && near && near.zoom > far.zoom);
    }
  });
});

/** Every case's view, and the eye stood in front of each foot facing it, near enough to veer a leg by it. */
const NEAR_CASES = [
  ...CASES,
  ...VIEWPORTS.flatMap(([name, width, height]) =>
    FEET.flatMap((foot) =>
      [0.6, 0.8, 1.2].map((ahead) => {
        const plane = planeOf(foot);
        const eye = {
          ...plane,
          y: plane.y - ahead * CLUMP_DISTANCE,
          heading: 0,
        };
        return { name, foot, view: viewAt(meadowCamera(width, height), eye) };
      }),
    ),
  ),
];

describe('drawnFlier', () => {
  it('lands at the zoom the sitter is drawn at, where its host draws the seat', () => {
    let landed = 0;
    let veered = 0;
    for (const { name, view, foot } of NEAR_CASES) {
      const host = hostOn(view, foot);
      if (!host.stands.drawn || host.stands.behind) continue;
      for (const offset of SEATS) {
        const at = onHost(host, plus(host.laidFoot, offset));
        const seat = aloftAt(view, at, host.stands.distance);
        const drawn = drawnFlier(view, seat, 1, { to: seat });
        assert.ok(drawn, name);
        assert.ok(apart(drawn, at) < 1e-6, name);
        // A seat toward a rim stands off the foot's x, where the screen
        // bends a hair more or less than at the foot, by up to 1.2% on the
        // sideways phone's edge.
        const off = Math.abs(drawn.zoom / seatedZoom(host) - 1);
        assert.ok(off < (offset.x === 0 ? 1e-3 : 0.015), `${name}: ${off}`);
        const { near, width } = veerOf(view);
        if (host.stands.distance < near + width) veered++;
        landed++;
      }
    }
    assert.ok(landed > 200 && veered > 20, `${landed}, ${veered}`);
  });
});

describe('seatedZoom', () => {
  it('draws a sitter at its own size over its host’s distance: larger the nearer, larger stepped toward it', () => {
    for (const [, width, height] of VIEWPORTS) {
      const camera = meadowCamera(width, height);
      const [opening, stepped] = [OPENING_EYE, { x: 0, y: 1, heading: 0 }].map(
        (eye) => viewAt(camera, eye),
      );
      assert.ok(opening && stepped);
      const zooms = FEET.map((foot) => {
        const before = hostOn(opening, foot);
        const after = hostOn(stepped, foot);
        assert.ok(seatedZoom(after) > seatedZoom(before));
        // In scale with its cap wherever the eye stands.
        const scale = seatedZoom(before) / before.stands.zoom;
        assert.ok(
          Math.abs(seatedZoom(after) / after.stands.zoom - scale) < 1e-12,
        );
        const { ahead } = before.stands;
        return { ahead, zoom: seatedZoom(before) };
      });
      const byDistance = zooms.toSorted((a, b) => a.ahead - b.ahead);
      const [nearest, farthest] = [byDistance[0], byDistance.at(-1)];
      assert.ok(nearest && farthest && nearest.zoom > farthest.zoom);
    }
  });
});
