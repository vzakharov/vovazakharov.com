import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { bedPlace } from './bed-place';
import { placeIn } from './clump-layout';
import {
  HAZE_DRIFT,
  hazeAhead,
  type Hazing,
  REPAINTS_PER_FRAME,
  repaintsDue,
} from './repaint-queue';
import { viewAt } from './view';
import { VIEWPORTS } from './viewports';
import { opened } from './visit-play';

const SEEDS = [1, 42, 99];

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
    it(`repaints nothing at the opening eye, and clears the back row as the eye steps in, on a ${name} screen`, () => {
      for (const seed of SEEDS) {
        const { meadow, layout } = opened(seed, width, height, true);
        const { camera, mushrooms: ground } = layout;
        const opening = viewAt(camera, OPENING_EYE);
        const nearer = viewAt(camera, { ...OPENING_EYE, y: 3 });
        let cleared = 0;
        for (const { id, foot } of meadow.mushrooms) {
          const painted = placeIn(ground, { foot })?.haze;
          if (painted === undefined) continue;
          const where = `visit ${String(seed)}: ${id}`;
          const there = hazeAhead(camera, bedPlace(opening, foot).ahead);
          assert.ok(Math.abs(there - painted) < 1e-9, where);
          const near = hazeAhead(camera, bedPlace(nearer, foot).ahead);
          assert.ok(near <= painted, where);
          if (painted - near >= HAZE_DRIFT) cleared++;
        }
        assert.ok(cleared > 0, `visit ${String(seed)}: nothing cleared`);
      }
    });
  }
});
