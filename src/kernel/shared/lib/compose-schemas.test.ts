import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { composeSchemas } from './compose-schemas.ts';

const Point = z.object({ x: z.number(), y: z.number() });
const RunEnds = z.object({ from: z.string(), to: z.string() });
const RUN = { x: 1, y: 2, from: 'a', to: 'b' };

describe('composeSchemas', () => {
  it('parses every member of every schema', () => {
    const Run = composeSchemas(Point, RunEnds);
    const run: { x: number; y: number; from: string; to: string } =
      Run.parse(RUN);
    assert.deepEqual(run, RUN);
    assert.equal(Run.safeParse({ x: 1, y: 2, from: 'a' }).success, false);
  });

  it('lets a later key override an earlier one', () => {
    const Labelled = composeSchemas(Point, z.object({ x: z.string() }));
    const labelled: { x: string; y: number } = Labelled.parse({
      x: 'left',
      y: 2,
    });
    assert.deepEqual(labelled, { x: 'left', y: 2 });
    assert.equal(Labelled.safeParse({ x: 1, y: 2 }).success, false);
  });

  it('keeps the first schema’s config', () => {
    assert.equal(
      composeSchemas(Point.strict(), RunEnds).safeParse({ ...RUN, extra: true })
        .success,
      false,
    );
  });

  it('takes own members by .extend', () => {
    const Run = composeSchemas(Point, RunEnds).extend({ shown: z.boolean() });
    assert.equal(Run.safeParse({ ...RUN, shown: true }).success, true);
  });
});
