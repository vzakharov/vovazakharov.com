import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE, project } from '../../model/ground';
import { OPENING_FEET } from '../../model/placement';
import { drawnAt, entry, offScreen, type Seen } from './insect-away';
import { meadowCamera } from './meadow-camera';
import { ofLayout, onScreen, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** Headings the eye turns through, the clump still ahead. */
const HEADINGS = [0, 0.21, -0.3, 0.6];

/** Seats off a host's foot, in world px at the opening eye. */
const SEATS = [-240, -60, 0, 60, 240].map((x) => ({ x, y: -50 }));

const AWAY = { span: 40, drop: 150 };

describe('entry', () => {
  it('sets an insect off on the screen edge nearer a first perch the screen shows, at the height it flies in at', () => {
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
            // Placed rather than drawn: over a row past the brow at the
            // screen's edge, the start sinks under it like any flight there.
            const start = ofLayout(
              view,
              entry(seen, 'left', AWAY, laid.y, seated),
              laid.y,
            );
            const edge = perch.x < width / 2 ? 0 : width;
            assert.ok(Math.abs(start.x - edge) < 1e-6, `${start.x} ${edge}`);
            assert.ok(Math.abs(start.y - AWAY.drop) < 1e-6);
            entered++;
          }
        }
      }
    }
    assert.ok(entered > 50, String(entered));
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
