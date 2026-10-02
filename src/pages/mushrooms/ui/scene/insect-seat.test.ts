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
import { aloftAt, drawnAloft, veerOf } from './insect-frame';
import { drawnFlier, drawnSitter, seatAloft, seatedZoom } from './insect-seat';
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
        const drawn = drawnFlier(view, seat, 1, { to: seat }).sinking?.drawn;
        assert.ok(drawn, name);
        assert.ok(apart(drawn, at) < 1e-6, name);
        const off = Math.abs(drawn.zoom / seatedZoom(view, host, at) - 1);
        assert.ok(off < SAME_SIZE, `${name}: ${off}`);
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
        const zoomBefore = seatedZoom(opening, before, before.stands);
        const zoomAfter = seatedZoom(stepped, after, after.stands);
        assert.ok(zoomAfter > zoomBefore);
        // In scale with its cap wherever the eye stands.
        const scale = zoomBefore / before.stands.zoom;
        assert.ok(Math.abs(zoomAfter / after.stands.zoom - scale) < 1e-12);
        // Its own size over its distance ahead at the opening.
        const { ahead } = before.stands;
        assert.ok(
          Math.abs((zoomBefore * ahead) / CLUMP_DISTANCE - 1) < SAME_SIZE,
        );
        return { ahead, zoom: zoomBefore };
      });
      const byDistance = zooms.toSorted((a, b) => a.ahead - b.ahead);
      const [nearest, farthest] = [byDistance[0], byDistance.at(-1)];
      assert.ok(nearest && farthest && nearest.zoom > farthest.zoom);
    }
  });
});

describe('drawnSitter', () => {
  it('draws a sitter off its seat at its seated zoom, hidden with a host not drawn', () => {
    let sat = 0;
    for (const { name, view, foot } of CASES) {
      const on = hostOn(view, foot);
      const laid = plus(on.laidFoot, SEATS[0] ?? { x: 0, y: 0 });
      const seat = { ...laid, on, drawn: onHost(on, laid) };
      const off = { x: 3, y: -2 };
      const drawn = drawnSitter(view, seat, off);
      if (!on.stands.drawn) {
        assert.equal(drawn, undefined, name);
        continue;
      }
      if (!drawn) continue;
      const zoom = seatedZoom(view, on, seat.drawn);
      assert.equal(drawn.zoom, zoom);
      assert.ok(
        apart(drawn, plus(seat.drawn, { x: 3 * zoom, y: -2 * zoom })) < 1e-9,
      );
      sat++;
    }
    assert.ok(sat > 50, String(sat));
  });
});

describe('seatAloft', () => {
  it('is where a flight lands on the seat its host draws, and the seat as laid out where the host is not drawn', () => {
    for (const { name, view, foot } of CASES) {
      const on = hostOn(view, foot);
      const laid = plus(on.laidFoot, SEATS[0] ?? { x: 0, y: 0 });
      const seat = { ...laid, on, drawn: onHost(on, laid) };
      const aloft = seatAloft(view, seat);
      if (!on.stands.drawn) continue;
      const drawn = drawnAloft(view, aloft);
      if (drawn) assert.ok(apart(drawn, seat.drawn) < 1e-6, name);
      assert.ok(
        Math.abs(
          Math.hypot(aloft.x - view.eye.x, aloft.y - view.eye.y) -
            on.stands.distance,
        ) < 1e-9,
        name,
      );
    }
  });
});
