import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CLUMP_DISTANCE, OPENING_EYE, project } from '../../model/ground';
import { OPENING_FEET } from '../../model/placement';
import {
  drawnAt,
  entry,
  entryAloft,
  groundAlong,
  offAloft,
  offScreen,
  PAST_BROW,
  reachesScreen,
  type Seen,
  turnSide,
} from './insect-away';
import { drawnAloft } from './insect-frame';
import { meadowCamera } from './meadow-camera';
import {
  D_SEE,
  ofLayout,
  onScreen,
  placedAt,
  sunk,
  V_NEAR,
  viewAt,
} from './view';
import { VIEWPORTS } from './viewports';

/** Headings the eye turns through, the clump still ahead. */
const HEADINGS = [0, 0.21, -0.3, 0.6];

/** Seats off a host's foot, in world px at the opening eye. */
const SEATS = [-240, -60, 0, 60, 240].map((x) => ({ x, y: -50 }));

const AWAY = { span: 40, drop: 150 };

describe('entry', () => {
  it('sets an insect off on the ground just past the brow, halfway across from the middle to a first perch the screen shows', () => {
    let entered = 0;
    for (const [, width, height] of VIEWPORTS) {
      for (const heading of HEADINGS) {
        const view = viewAt(meadowCamera(width, height), {
          ...OPENING_EYE,
          heading,
        });
        const seen: Seen = { ...view, view };
        for (const foot of OPENING_FEET) {
          const laid = project(view, foot);
          for (const seat of SEATS) {
            const seated = { x: laid.x + seat.x, y: laid.y + seat.y };
            const perch = drawnAt(view, seated, laid.y);
            if (!perch || !onScreen(view, perch)) continue;
            const set = entry(seen, 'left', AWAY, laid.y, seated);
            assert.equal(set.out, undefined);
            const start = ofLayout(view, set.at, set.row);
            const halfway = (width / 2 + perch.x) / 2;
            assert.ok(Math.abs(start.x - halfway) < 1e-6, `${start.x}`);
            assert.ok(Math.abs(start.distance - D_SEE - PAST_BROW) < 1e-9);
            assert.ok(Math.abs(set.at.y - set.row) < 1e-9, 'on the ground');
            // Under the brow on its first frame, over it once it nears.
            assert.equal(drawnAt(view, set.at, set.row), undefined);
            entered++;
          }
        }
      }
    }
    assert.ok(entered > 50, String(entered));
  });

  it('flies a release with no perch in view out by the side its perch stands to', () => {
    for (const heading of [0, 0.6, -0.6]) {
      const view = viewAt(meadowCamera(1180, 820), { ...OPENING_EYE, heading });
      const seen: Seen = { ...view, view };
      const row = project(view, OPENING_FEET[0]).y;
      for (const [side, x] of [
        ['left', -4000],
        ['right', 6000],
      ] as const) {
        const set = entry(seen, 'right', AWAY, row, { x, y: row - 50 });
        assert.equal(turnSide(view, { x, y: row - 50 }, row), side);
        assert.ok(set.out, `${heading} ${side}`);
        const start = ofLayout(view, set.at, set.row);
        assert.ok(Math.abs(start.x - 590) < 1e-6);
        const out = ofLayout(view, set.out.at, set.out.row);
        const edge = side === 'left' ? -AWAY.span : 1180 + AWAY.span;
        assert.ok(Math.abs(out.x - edge) < 1e-6, `${out.x}`);
        assert.ok(out.distance < start.distance, 'nearer as it goes');
      }
    }
  });

  it('looking back, sets a release off at the nearest column whose ground has a row', () => {
    for (const [name, width, height] of VIEWPORTS) {
      const view = viewAt(meadowCamera(width, height), {
        ...OPENING_EYE,
        heading: Math.PI,
      });
      const middle = width / 2;
      // Straight behind the plane's origin the opening eye lays out no row.
      assert.equal(groundAlong(view, middle, D_SEE + PAST_BROW), undefined);
      assert.equal(groundAlong(view, middle, D_SEE / 2), undefined);
      const set = entry({ ...view, view }, 'left', AWAY, 0, undefined);
      assert.ok(set.out, name);
      const start = ofLayout(view, set.at, set.row);
      assert.ok(Math.abs(start.distance - D_SEE - PAST_BROW) < 1e-9, name);
      const off = Math.abs(start.x - middle);
      assert.ok(off > 0 && off < 120, `${name} ${String(off)}`);
      for (let x = Math.ceil(middle - off) + 1; x < middle + off - 1; x++) {
        assert.equal(groundAlong(view, x, D_SEE + PAST_BROW), undefined);
      }
      const out = ofLayout(view, set.out.at, set.out.row);
      assert.ok(Math.abs(out.x + AWAY.span) < 1e-6, `${name} ${String(out.x)}`);
    }
  });

  it('before the eye’s first fit, sets a release off just past the opening screen’s edge nearer its perch', () => {
    const camera = meadowCamera(1180, 820);
    const seen: Seen = { ...camera, view: undefined };
    const opening = (camera.world - camera.width) / 2;
    for (const [x, edge] of [
      [100, opening - AWAY.span],
      [camera.world - 100, opening + camera.width + AWAY.span],
    ] as const) {
      const set = entry(seen, 'left', AWAY, 300, { x, y: 250 });
      assert.deepEqual(set, { at: { x: edge, y: AWAY.drop }, row: 300 });
      assert.ok(set.at.x > 0 && set.at.x < camera.world);
    }
  });

  it('sinks a flier past the brow by the ground under it, so one in the air just past it still shows', () => {
    let checked = 0;
    for (const [, width, height] of VIEWPORTS) {
      for (const heading of HEADINGS) {
        const view = viewAt(meadowCamera(width, height), {
          ...OPENING_EYE,
          heading,
        });
        for (const x of [0.1, 0.5, 0.9].map((share) => share * width)) {
          const ground = groundAlong(view, x, D_SEE + 0.05);
          if (!ground) continue;
          const point = { ...ground.at, y: ground.row - 60 };
          const drawn = drawnAt(view, point, ground.row);
          assert.ok(drawn, `${String(width)} ${String(heading)} ${String(x)}`);
          const foot = ofLayout(view, ground.at, ground.row);
          const lowered = sunk(view, foot).y - foot.y;
          assert.ok(lowered > 0);
          const placed = ofLayout(view, point, ground.row);
          assert.ok(Math.abs(drawn.y - placed.y - lowered) < 1e-9);
          checked++;
        }
      }
    }
    assert.ok(checked > 50, String(checked));
  });

  it('draws a flier nearer the eye than V_NEAR while its extent reaches the screen', () => {
    let near = 0;
    for (const [name, width, height] of VIEWPORTS) {
      const view = viewAt(meadowCamera(width, height), OPENING_EYE);
      const ground = groundAlong(view, width / 2, V_NEAR / 2);
      assert.ok(ground, name);
      for (let up = 0; up < 4 * height; up += 10) {
        const point = { ...ground.at, y: ground.row - up };
        const drawn = drawnAt(view, point, ground.row);
        assert.ok(drawn, name);
        assert.ok(ofLayout(view, point, ground.row).ahead < V_NEAR);
        assert.equal(
          reachesScreen(view, drawn, 30),
          drawn.y >= -30 * drawn.zoom && drawn.y <= height + 30 * drawn.zoom,
        );
        if (onScreen(view, drawn)) near++;
      }
    }
    assert.ok(near > 20, String(near));
  });

  it('hides an insect only once a span each way round its middle has left the screen', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    for (const zoom of [0.5, 1, 3]) {
      const reach = 40 * zoom;
      for (const [x, y] of [
        [-reach, 400],
        [1180 + reach, 400],
        [590, -reach],
        [590, 820 + reach],
      ] as const) {
        assert.equal(reachesScreen(view, { x, y, zoom }, 40), true);
        const outward = {
          x: x + Math.sign(x - 590),
          y: y + Math.sign(y - 410),
        };
        assert.equal(
          reachesScreen(view, { ...outward, zoom }, 40),
          false,
          `${String(x)} ${String(y)}`,
        );
      }
    }
    assert.equal(
      reachesScreen(undefined, { x: -1e4, y: 0, zoom: 1 }, 40),
      true,
    );
  });

  it('leaves an insect going away past the edge by its span', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    const row = project(view, OPENING_FEET[0]).y;
    const gone = drawnAt(
      view,
      offScreen({ ...view, view }, 'right', AWAY, row),
      row,
    );
    assert.ok(gone && Math.abs(gone.x - (1180 + AWAY.span)) < 1e-6);
  });
});

/** Eyes the way in is taken from: the opening, and beyond the forest, each facing the clump and looking back. */
const ENTRY_EYES = [0, 0.3, Math.PI, Math.PI - 0.035, Math.PI + 0.035].flatMap(
  (heading) => [
    { ...OPENING_EYE, heading },
    { x: 0, y: 18, heading },
  ],
);

describe('entryAloft', () => {
  it('sets off on the ground just past the brow, halfway to a seat the screen shows, with no way out', () => {
    for (const [, width, height] of VIEWPORTS) {
      for (const eye of ENTRY_EYES) {
        const view = viewAt(meadowCamera(width, height), eye);
        for (const share of [0.1, 0.5, 0.9]) {
          const seated = { x: width * share, y: height * 0.6 };
          const { from, out } = entryAloft(view, 'left', AWAY, seated);
          assert.equal(out, undefined);
          assert.equal(from.h, 0);
          const distance = Math.hypot(from.x - eye.x, from.y - eye.y);
          assert.ok(Math.abs(distance - D_SEE - PAST_BROW) < 1e-9);
          const foot = placedAt(view, from, 0, CLUMP_DISTANCE);
          assert.ok(Math.abs(foot.x - (width / 2 + seated.x) / 2) < 1e-6);
          // Under the brow on its first frame, over it once it nears.
          assert.equal(drawnAloft(view, from), undefined);
        }
      }
    }
  });

  it('flies out past the edge its seat is drawn beyond, drawn there looking back', () => {
    for (const [, width, height] of VIEWPORTS) {
      for (const eye of ENTRY_EYES) {
        const view = viewAt(meadowCamera(width, height), eye);
        const cases = [
          { seated: { x: -80, y: height * 0.6 }, past: 'left' },
          { seated: { x: width + 80, y: height * 0.6 }, past: 'right' },
          { seated: { x: width * 0.7, y: height + 50 }, past: 'right' },
          { seated: undefined, past: 'left' },
        ] as const;
        for (const { seated, past } of cases) {
          const { from, out } = entryAloft(view, 'left', AWAY, seated);
          const foot = placedAt(view, from, 0, CLUMP_DISTANCE);
          assert.ok(Math.abs(foot.x - width / 2) < 1e-6);
          assert.ok(out, 'a way out');
          const drawn = drawnAloft(view, out);
          assert.ok(drawn, 'drawn');
          const edge = past === 'left' ? -AWAY.span : width + AWAY.span;
          assert.ok(Math.abs(drawn.x - edge) < 1e-6, `${drawn.x}`);
          assert.ok(Math.abs(drawn.y - AWAY.drop) < 1e-6, `${drawn.y}`);
          assert.ok(!onScreen(view, drawn));
        }
      }
    }
  });
});

describe('offAloft', () => {
  it('stands past either edge at the drop, the distance asked from the eye', () => {
    const view = viewAt(meadowCamera(1180, 820), { x: 0, y: 18, heading: 3 });
    for (const side of ['left', 'right'] as const) {
      const off = offAloft(view, side, AWAY, 4);
      assert.ok(Math.abs(Math.hypot(off.x, off.y - 18) - 4) < 1e-9);
      const drawn = drawnAloft(view, off);
      assert.ok(drawn);
      assert.ok(side === 'left' ? drawn.x < 0 : drawn.x > 1180);
    }
  });
});
