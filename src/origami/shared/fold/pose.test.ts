import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { run, type Step } from './fold.ts';
import { mesh } from './mesh.ts';
import { DEFAULT_PAPER, PAPERS } from './paper.ts';
import { poseOf } from './pose.ts';
import { square } from './state.ts';

const paper = PAPERS[DEFAULT_PAPER];
const book = (direction: Step['direction']): Step => ({
  line: { p: [0.5, 0], q: [0.5, 1] },
  moving: [0.75, 0.5],
  direction,
});
const onSpine = (x: number) => Math.abs(x - 0.5) < 1e-9;

describe('poseOf', () => {
  for (const [direction, sign] of [
    ['valley', 1],
    ['mountain', -1],
  ] as const) {
    it(`reads a ${direction} book fold as ±π on its spine and flat elsewhere`, () => {
      const state = run([book(direction)]);
      const m = mesh(state, paper, 0.25);
      const pose = poseOf(m, state);
      for (const [h, hinge] of m.hinges.entries()) {
        const spine =
          onSpine(m.paper[hinge.a]?.[0] ?? 0) &&
          onSpine(m.paper[hinge.b]?.[0] ?? 0);
        assert.equal(pose.angles[h], spine ? sign * Math.PI : 0);
        // The mesh's own start is the same angle read from the same state.
        assert.equal(pose.angles[h], hinge.start);
      }
      const { faces, sheets } = m;
      assert.deepEqual(pose.stack, { faces, sheets });
    });
  }

  it('reads the flat sheet before the fold as one unfolded piece', () => {
    const state = run([book('valley')]);
    const m = mesh(state, paper, 0.25);
    const pose = poseOf(m, square());
    assert.ok(pose.angles.every((angle) => angle === 0));
    assert.ok(pose.around.every((pieces) => pieces.length === 1));
  });
});
