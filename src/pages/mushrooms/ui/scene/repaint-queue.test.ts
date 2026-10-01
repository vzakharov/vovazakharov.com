import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FRAME_DEPTH, OPENING_EYE, project } from '../../model/ground';
import { bedPlace } from './bed-place';
import { placeIn } from './clump-layout';
import {
  HAZE_DRIFT,
  hazeAhead,
  type Hazing,
  REPAINTS_PER_FRAME,
  repaintsDue,
} from './repaint-queue';
import { D_SEE, viewAt } from './view';
import { VIEWPORTS } from './viewports';
import { opened } from './visit-play';

const SEEDS = [1, 42, 99];

/** The eye three steps in from the opening, in the clump's size. */
const STEPPED_IN = { ...OPENING_EYE, y: 3 };

/** The haze a back-row mushroom reads as misty at: the spec's «up to 0.39». */
const MISTY = 0.3;

/** A thing `ahead` of the eye, its haze `drifted` from its paint. */
const hazing = (ahead: number, drifted: number): Hazing => ({
  ahead,
  painted: 0.2,
  haze: 0.2 + drifted,
});

describe('the repaint queue', () => {
  it(`repaints at most ${String(REPAINTS_PER_FRAME)} a frame, the nearest first`, () => {
    const things = [9, 4, 12, 6].map((ahead) => hazing(ahead, -0.1));
    assert.deepEqual(
      repaintsDue(things).map(({ ahead }) => ahead),
      [4, 6],
    );
  });

  it(`leaves a thing whose haze drifted less than ${String(HAZE_DRIFT)} as painted`, () => {
    const things = [hazing(3, 0.039), hazing(5, -0.03), hazing(8, HAZE_DRIFT)];
    assert.deepEqual(
      repaintsDue(things).map(({ ahead }) => ahead),
      [8],
    );
  });

  for (const [name, width, height] of VIEWPORTS) {
    // The bed paints a thing at the haze where the view stands it, so what
    // it painted at the opening is the opening's haze.
    it(`only clears a thing as the eye steps in from the opening, on a ${name} screen`, () => {
      for (const seed of SEEDS) {
        const { meadow, layout } = opened(seed, width, height, true);
        const { camera, mushrooms: ground } = layout;
        const opening = viewAt(camera, OPENING_EYE);
        const nearer = viewAt(camera, STEPPED_IN);
        for (const { id, foot } of meadow.mushrooms) {
          if (placeIn(ground, { foot }) === undefined) continue;
          const where = `visit ${String(seed)}: ${id}`;
          // Past the brow a thing pales further, by the side of the screen
          // or off it, and is repainted once.
          if (bedPlace(opening, foot).behind) continue;
          const painted = hazeAhead(camera, bedPlace(opening, foot));
          const near = hazeAhead(camera, bedPlace(nearer, foot));
          assert.ok(near <= painted, where);
        }
      }
    });

    it(`pales a thing as it sinks behind the brow, more than the ground's haze rises, on a ${name} screen`, () => {
      const { camera } = opened(SEEDS[0] ?? 1, width, height, false).layout;
      const span = 1.2;
      // Straight ahead, where the distance is the depth along the heading.
      const at = (ahead: number) =>
        hazeAhead(camera, { ahead, distance: ahead });
      const before = at(D_SEE) - at(D_SEE - span);
      const after = at(D_SEE + span) - at(D_SEE);
      assert.ok(after - before > 0.15, `${String(before)} → ${String(after)}`);
      const sinking = [0, 0.3, 0.6, 0.9, 1.2, 2].map((past) =>
        at(D_SEE + past),
      );
      assert.deepEqual(
        sinking,
        sinking.toSorted((one, other) => one - other),
      );
    });

    // On the frame's back row, not on a grown forest's: which screens grow a
    // mushroom that far back is the forest's rule, not the haze's.
    it(`clears a misty mushroom on the back row as the eye steps in, on a ${name} screen`, () => {
      const { camera } = opened(SEEDS[0] ?? 1, width, height, false).layout;
      for (const x of [-1, 0, 1]) {
        const foot = { x, z: FRAME_DEPTH.far };
        const opening = bedPlace(viewAt(camera, OPENING_EYE), foot);
        const painted = hazeAhead(camera, opening);
        const where = `across ${String(x)}`;
        assert.ok(painted >= MISTY, `${where}: painted ${String(painted)}`);
        // Near the middle the lens draws the row where the layout lays it.
        const laid = project(camera, foot).haze;
        assert.ok(
          Math.abs(painted - laid) < 1e-3,
          `${where}: laid ${String(laid)}`,
        );
        const near = hazeAhead(
          camera,
          bedPlace(viewAt(camera, STEPPED_IN), foot),
        );
        assert.ok(painted - near >= HAZE_DRIFT, `${where}: to ${String(near)}`);
        const [due] = repaintsDue([{ ahead: 1, painted, haze: near }]);
        assert.ok(due, where);
      }
    });
  }
});
