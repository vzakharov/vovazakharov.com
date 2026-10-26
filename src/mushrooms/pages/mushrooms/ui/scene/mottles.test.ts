import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distanceBetween, type Point } from '../../model/geometry';
import { D_SEE, OPENING_EYE } from '../../model/ground';
import { CELL, cellLawn, cellOf, cellTufts, type Lawn, LiveLawn } from './lawn';
import { type Mottle, MOTTLES_PER_CELL, shownMottles } from './mottles';
import { browRow, viewAt } from './view';
import { VIEWPORTS } from './viewports';
import { opened } from './visit-play';

const lawnOn = (width: number, height: number, seed = 7): Lawn => {
  const { layout } = opened(seed, width, height, false);
  return { seed, layout };
};

type Ring = readonly Point[];
const span = (ring: Ring, axis: 'x' | 'y') =>
  Math.max(...ring.map((point) => point[axis])) -
  Math.min(...ring.map((point) => point[axis]));

/** A round mottle `ahead` of the opening eye turned to `heading`. */
const roundAhead = (heading: number, ahead: number): Mottle => ({
  middle: { x: Math.sin(heading) * ahead, y: Math.cos(heading) * ahead },
  across: 0.6,
  lengthways: 0.6,
  angle: 0,
  deep: false,
});

/** A deep mottle on the plane's middle line, `y` into the distance. */
const at = (y: number): Mottle => ({
  middle: { x: 0, y },
  across: 1,
  lengthways: 0.6,
  angle: 0,
  deep: true,
});

describe('the lawn’s mottles', () => {
  it('grows each cell’s mottles in the cell, the same every time, its tufts as they were', () => {
    const lawn = lawnOn(1180, 820);
    for (const cell of [
      { i: 0, j: 2 },
      { i: -3, j: -1 },
      { i: 40, j: -25 },
    ]) {
      const { tufts, mottles } = cellLawn(lawn, cell);
      assert.equal(mottles.length, MOTTLES_PER_CELL);
      for (const { middle } of mottles) assert.deepEqual(cellOf(middle), cell);
      assert.deepEqual(cellLawn(lawn, cell).mottles, mottles);
      assert.deepEqual(cellTufts(lawn, cell), tufts);
    }
  });

  it('finds the same mottles walking away and back', () => {
    const live = new LiveLawn(lawnOn(1180, 820));
    live.round(OPENING_EYE);
    const here = live.mottles;
    assert.ok(here.length > 0);
    live.round({ ...OPENING_EYE, x: 30 * CELL, y: -12 * CELL });
    assert.notDeepEqual(live.mottles, here);
    live.round(OPENING_EYE);
    assert.deepEqual(live.mottles, here);
  });

  for (const [name, width, height] of VIEWPORTS) {
    it(`lies flat on the ground of the ${name}, short of the brow, at every heading`, () => {
      const lawn = lawnOn(width, height);
      const live = new LiveLawn(lawn);
      live.round(OPENING_EYE);
      const { camera } = lawn.layout;
      for (const heading of [0, 1, Math.PI, -2.4]) {
        const view = viewAt(camera, { ...OPENING_EYE, heading });
        const shown = shownMottles(view, live.mottles);
        assert.ok(shown.length > 0, `heading ${String(heading)}`);
        for (const { rings, alpha } of shown) {
          assert.ok(alpha > 0);
          const [outer, inner] = rings;
          assert.ok(span(outer, 'x') > span(inner, 'x'));
          assert.ok(span(outer, 'y') > span(inner, 'y'));
          for (const { x, y } of outer) assert.ok(y > browRow(camera, x));
        }
        // Flat on the ground, a patch foreshortens as it lies farther ahead.
        const [near, far] = [8, 11].map((ahead) =>
          shownMottles(view, [roundAhead(heading, ahead)]).map(
            ({ rings: [, ring] }) => span(ring, 'y') / span(ring, 'x'),
          ),
        );
        const [[nearRatio], [farRatio]] = [near ?? [], far ?? []];
        assert.ok(nearRatio !== undefined && farRatio !== undefined);
        assert.ok(farRatio < nearRatio);
      }
    });
  }

  it('draws none past the brow, nor behind the eye', () => {
    const { layout } = lawnOn(1180, 820);
    const view = viewAt(layout.camera, OPENING_EYE);
    assert.equal(shownMottles(view, [at(9)]).length, 1);
    assert.equal(shownMottles(view, [at(D_SEE)]).length, 0);
    assert.equal(shownMottles(view, [at(-5)]).length, 0);
    const far = at(D_SEE - 1.6);
    const near = at(D_SEE - 6);
    const [fading] = shownMottles(view, [far]);
    const [whole] = shownMottles(view, [near]);
    assert.ok(fading && whole && fading.alpha < whole.alpha);
    assert.ok(distanceBetween(OPENING_EYE, far.middle) < D_SEE);
  });
});
