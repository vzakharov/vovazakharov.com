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
    it(`repaints nothing at the opening eye, and only clears as the eye steps in, on a ${name} screen`, () => {
      for (const seed of SEEDS) {
        const { meadow, layout } = opened(seed, width, height, true);
        const { camera, mushrooms: ground } = layout;
        const opening = viewAt(camera, OPENING_EYE);
        const nearer = viewAt(camera, STEPPED_IN);
        for (const { id, foot } of meadow.mushrooms) {
          const painted = placeIn(ground, { foot })?.haze;
          if (painted === undefined) continue;
          const where = `visit ${String(seed)}: ${id}`;
          const there = hazeAhead(camera, bedPlace(opening, foot).ahead);
          assert.ok(Math.abs(there - painted) < 1e-9, where);
          const near = hazeAhead(camera, bedPlace(nearer, foot).ahead);
          assert.ok(near <= painted, where);
        }
      }
    });

    it(`pales a thing as it sinks behind the brow, more than the ground's haze rises, on a ${name} screen`, () => {
      const { camera } = opened(SEEDS[0] ?? 1, width, height, false).layout;
      const span = 1.2;
      const before = hazeAhead(camera, D_SEE) - hazeAhead(camera, D_SEE - span);
      const after = hazeAhead(camera, D_SEE + span) - hazeAhead(camera, D_SEE);
      assert.ok(after - before > 0.15, `${String(before)} → ${String(after)}`);
      const sinking = [0, 0.3, 0.6, 0.9, 1.2, 2].map((past) =>
        hazeAhead(camera, D_SEE + past),
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
        const painted = project(camera, foot).haze;
        const where = `across ${String(x)}`;
        assert.ok(painted >= MISTY, `${where}: painted ${String(painted)}`);
        const opening = bedPlace(viewAt(camera, OPENING_EYE), foot).ahead;
        assert.ok(Math.abs(hazeAhead(camera, opening) - painted) < 1e-9, where);
        const near = hazeAhead(
          camera,
          bedPlace(viewAt(camera, STEPPED_IN), foot).ahead,
        );
        assert.ok(painted - near >= HAZE_DRIFT, `${where}: to ${String(near)}`);
        const [due] = repaintsDue([{ ahead: 1, painted, haze: near }]);
        assert.ok(due, where);
      }
    });
  }
});
