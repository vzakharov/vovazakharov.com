import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Aloft } from '../../model/flight-frame';
import type { Point } from '../../model/geometry';
import {
  CLUMP_DISTANCE,
  gathered,
  groundOfPlane,
  OPENING_EYE,
  planeOf,
  project,
  unanchored,
} from '../../model/ground';
import { aloftAt } from '../../model/pinhole';
import { OPENING_FEET } from '../../model/placement';
import { bedPlace, type Host, onHost } from './bed-place';
import { laidOf } from './clump-layout';
import { drawnAloft, veerOf } from './insect-frame';
import { drawnFlier, drawnSitter, seatAloft, seatedZoom } from './insect-seat';
import { meadowCamera } from './meadow-camera';
import { aloftOfLayout } from './plane-place';
import { type View, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** Headings the eye turns through, the clump still ahead. */
const HEADINGS = [0, 0.085, 0.21, 0.345, -0.3];

/** Feet a host stands on: the opening clump's, and one off to the side and back. */
const FEET: readonly Point[] = [...OPENING_FEET, planeOf({ x: 1.2, z: 0.6 })];

/** Seats off a host's foot, in world px at the opening eye: over it, and toward either rim. */
const SEATS: readonly Point[] = [
  { x: 0, y: -60 },
  { x: -30, y: -45 },
  { x: 30, y: -45 },
];

/** A host standing on `foot` as `view` draws it, as its bed stands it. */
function hostOn(view: View, foot: Point): Host {
  const { x, y } = project(view, groundOfPlane(foot));
  return {
    laidFoot: { x, y },
    foot,
    opening: gathered(foot).y,
    stands: bedPlace(view, foot),
  };
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
        const eye = {
          ...foot,
          y: foot.y - ahead * CLUMP_DISTANCE,
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
  it('is where a flight lands on the seat its host draws', () => {
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

/** Eyes walked and turned away from the opening. */
const WALKED = [
  OPENING_EYE,
  { x: 3, y: 8, heading: 0.7 },
  { x: -10, y: -4, heading: -2.4 },
  { x: 20, y: 15, heading: 3 },
];

/** A mushroom on `foot` as its bed lays it out (`laidOf`) and `view` stands it, leaning right. */
function laidHost(view: View, foot: Point): Host {
  const { x, y, opening } = laidOf(view, { foot, lean: 1 });
  return {
    laidFoot: { x, y },
    foot,
    opening,
    stands: bedPlace(view, foot, undefined, opening),
  };
}

/** `seat` on `host`, as its bed hands it over, `drawn` or not. */
function seatOn(host: Host, seat: Point, drawn: boolean) {
  return {
    ...seat,
    on: { ...host, stands: { ...host.stands, drawn } },
    drawn: onHost(host, seat),
  };
}

function apart3(a: Aloft, b: Aloft): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.h - b.h);
}

/** How far off the drawn path an undrawn host's seat may be, of the seat's own reach off its foot. */
const NEAR_DRAWN = 0.06;

describe('seatAloft, its host not drawn', () => {
  it('is where the drawn path puts the seat, off the host’s plane foot, wherever the eye has walked', () => {
    let checked = 0;
    let movedOff = 0;
    for (const [name, width, height] of VIEWPORTS) {
      const camera = meadowCamera(width, height);
      for (const eye of WALKED) {
        const view = viewAt(camera, eye);
        const feet = [0.5, 1, 1.6].flatMap((ahead) =>
          [-1.5, -0.5, 0, 0.5, 1.5].map((side) =>
            unanchored(eye, { x: side * ahead, y: ahead * CLUMP_DISTANCE }),
          ),
        );
        for (const foot of [...OPENING_FEET, ...feet]) {
          const host = laidHost(view, foot);
          if (!host.stands.drawn || host.stands.behind) continue;
          for (const offset of SEATS) {
            const laid = plus(host.laidFoot, offset);
            const drawn = seatAloft(view, seatOn(host, laid, true));
            const fallback = seatAloft(view, seatOn(host, laid, false));
            const reach = Math.hypot(
              drawn.x - foot.x,
              drawn.y - foot.y,
              drawn.h,
            );
            const off = apart3(drawn, fallback);
            assert.ok(off < NEAR_DRAWN * reach, `${name}: ${off} of ${reach}`);
            const asLaid = aloftOfLayout(view, laid, host.laidFoot.y);
            if (apart3(drawn, asLaid) > reach) movedOff++;
            checked++;
          }
        }
      }
    }
    // The layout's reading, laid out at the opening eye, misses most of them.
    assert.ok(
      checked > 300 && movedOff > checked / 2,
      `${checked}, ${movedOff}`,
    );
  });

  it('lands a grown mushroom’s seat where it was drawn a step before the eye walked too near to draw it', () => {
    for (const [name, width, height] of VIEWPORTS) {
      const camera = meadowCamera(width, height);
      for (const start of WALKED) {
        const foot = unanchored(start, { x: 0.4, y: 2 * CLUMP_DISTANCE });
        const toward = { x: foot.x - start.x, y: foot.y - start.y };
        const steps = 400;
        let last: Aloft | undefined;
        let landed: Aloft | undefined;
        for (let step = 0; step < steps && !landed; step++) {
          const along = step / steps;
          const eye = {
            ...start,
            x: start.x + toward.x * along,
            y: start.y + toward.y * along,
          };
          const view = viewAt(camera, eye);
          const host = laidHost(view, foot);
          const at = plus(host.laidFoot, SEATS[1] ?? { x: 0, y: 0 });
          const seat = seatAloft(view, seatOn(host, at, host.stands.drawn));
          if (host.stands.drawn) last = seat;
          else if (last) landed = seat;
        }
        assert.ok(last && landed, name);
        const reach = Math.hypot(last.x - foot.x, last.y - foot.y, last.h);
        const off = apart3(last, landed);
        assert.ok(off < NEAR_DRAWN * reach, `${name}: ${off} of ${reach}`);
      }
    }
  });
});
