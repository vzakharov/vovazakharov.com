import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PAPERS, physics, run, snapshot } from '@/origami/shared/fold';

import { tardigrade } from './tardigrade.ts';

const kami = PAPERS['kami-15'];

/** Every corner of the folded model, in display coordinates. */
const points = (design: ReturnType<typeof tardigrade>) =>
  snapshot(run(design.steps), kami).pieces.flatMap((piece) =>
    piece.world.map((point) => design.display(point)),
  );

const span = (values: readonly number[]) =>
  Math.max(...values) - Math.min(...values);

describe('tardigrade on kami', () => {
  it('folds with no error', () => {
    const errors = physics(tardigrade().steps, kami).flatMap((r) =>
      r.findings.filter((f) => f.level === 'error'),
    );
    assert.deepEqual(errors, []);
  });

  it('stands as a body, not a sheet: as tall as a third of its width', () => {
    const all = points(tardigrade());
    const width = span(all.map(([, y]) => y));
    const height = span(all.map((point) => point[2]));
    assert.ok(height > width / 3, `${height} tall, ${width} wide`);
  });

  it('stands on its legs: they reach below the belly', () => {
    const lowest = (design: ReturnType<typeof tardigrade>) =>
      Math.min(...points(design).map((point) => point[2]));
    assert.ok(lowest(tardigrade()) < lowest(tardigrade({ legAngle: 1 })));
  });
});
