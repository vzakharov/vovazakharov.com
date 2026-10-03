import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from './geometry';
import { MUSHROOM_SPECIES, mushroomGenes } from './mushroom-genes';
import { headOutlines, stemOutline } from './mushroom-outline';
import { CURVE_STEPS, curveSteps, detailed } from './mushroom-profile';

/** Drawn sizes from a far, tiny mushroom to a near one, in px to its unit. */
const DRAWN = Array.from({ length: 60 }, (_, index) => 4 + index * 4);

/** How far `point` stands from the closed polygon `outline`'s edge. */
function offEdge(point: Point, outline: readonly Point[]): number {
  return Math.min(
    ...outline.map((from, index) => {
      const to = outline[(index + 1) % outline.length] ?? from;
      const [dx, dy] = [to.x - from.x, to.y - from.y];
      const length = dx * dx + dy * dy || 1;
      const t = Math.min(
        1,
        Math.max(
          0,
          ((point.x - from.x) * dx + (point.y - from.y) * dy) / length,
        ),
      );
      return Math.hypot(point.x - from.x - t * dx, point.y - from.y - t * dy);
    }),
  );
}

/** Each outline a mushroom is painted with, as a curve gets `steps` chords. */
function outlines(seed: number, steps: number): Point[][] {
  return MUSHROOM_SPECIES.flatMap((species) => {
    const genes = mushroomGenes({ seed, species });
    return [...headOutlines(genes, steps), stemOutline(genes, 0.1, steps)];
  });
}

describe('curveSteps', () => {
  it('gives a near mushroom every chord, a far one fewer, never under a floor', () => {
    const steps = DRAWN.map((drawn) => curveSteps(drawn));
    assert.equal(curveSteps(1000), CURVE_STEPS);
    assert.ok((steps[0] ?? 0) < CURVE_STEPS / 2);
    assert.ok(Math.min(...steps) >= 6);
    for (const [index, each] of steps.entries()) {
      assert.ok(Number.isInteger(each));
      assert.ok(each >= (steps[index - 1] ?? 0), 'grows with the size');
    }
  });

  it('paints every outline within a pixel of its tap area at any size, so a tap lands on it and a change of chords shows no step', () => {
    for (const seed of [3, 7922, 15_841]) {
      const full = outlines(seed, CURVE_STEPS);
      for (const drawn of DRAWN) {
        const painted = outlines(seed, curveSteps(drawn));
        for (const [index, outline] of full.entries()) {
          const coarse = painted[index] ?? [];
          const worst = Math.max(
            ...outline.map((point) => offEdge(point, coarse)),
          );
          assert.ok(
            worst * drawn < 1,
            `seed ${seed}, ${drawn} px: ${(worst * drawn).toFixed(2)} px off`,
          );
        }
      }
    }
  });
});

describe('detailed', () => {
  it('keeps a near count, scales a far one with the chords, and floors it', () => {
    assert.equal(detailed(12, CURVE_STEPS, 2), 12);
    assert.equal(detailed(12, CURVE_STEPS / 2, 2), 6);
    assert.equal(detailed(12, 1, 2), 2);
  });
});
