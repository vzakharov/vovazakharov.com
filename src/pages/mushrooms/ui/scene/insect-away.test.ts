import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CLUMP_DISTANCE, OPENING_EYE } from '../../model/ground';
import {
  entryAloft,
  offAloft,
  PAST_BROW,
  reachesScreen,
  seenFor,
} from './insect-away';
import { aloftAt, drawnAloft } from './insect-frame';
import { meadowCamera } from './meadow-camera';
import { D_SEE, onScreen, placedAt, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** How an insect stands away: its span past an edge, and the height it flies at. */
const AWAY = { span: 40, drop: 150 };

describe('reachesScreen', () => {
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

describe('seenFor', () => {
  it('is where the view draws a point it draws, else just past the side the eye turns by to face it', () => {
    const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);
    const at = { x: 300, y: 400 };
    const seen = seenFor(view, aloftAt(view, at, CLUMP_DISTANCE));
    assert.ok(Math.hypot(seen.x - at.x, seen.y - at.y) < 1e-6);
    for (const [x, side] of [
      [-0.5, 'left'],
      [0.5, 'right'],
    ] as const) {
      const behind = seenFor(view, { x, y: -5, h: 0.1 });
      assert.equal(behind.x < 0 ? 'left' : 'right', side);
      assert.equal(onScreen(view, behind), false);
    }
  });
});
