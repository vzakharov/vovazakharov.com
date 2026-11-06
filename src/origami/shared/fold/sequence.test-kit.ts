import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import type { Step } from './fold.ts';
import { PAPERS } from './paper.ts';
import { relaxSequence, type SequenceRelaxation } from './sequence.ts';
import { FOLD_DIRECTIONS } from './state.ts';

const point = z.tuple([z.number(), z.number()]);

/** The step fields the ring fixtures use; strict, so a fixture growing a
 * field this does not know fails here rather than being dropped. */
const StepSchema: z.ZodType<Step> = z
  .object({
    line: z.object({ p: point, q: point }).strict(),
    moving: point,
    direction: z.enum([...FOLD_DIRECTIONS, 'tuck']).optional(),
    into: z.object({ at: point, below: z.number() }).strict().optional(),
    hold: z.number().optional(),
  })
  .strict();

/** A ring of two side flaps folded in from a band: `tuck` slides the second
 * into the first's pocket, `plain` lays it on top. */
export function foldRing(name: 'tuck' | 'plain'): SequenceRelaxation {
  const file = path.join(import.meta.dirname, `ring-${name}.steps.json`);
  const steps = z
    .array(StepSchema)
    .parse(JSON.parse(readFileSync(file, 'utf8')));
  return relaxSequence(steps, PAPERS['kami-15']);
}

/** How far apart the band's two ends end up: the ring's opening. */
export function ringGap({ mesh, positions }: SequenceRelaxation): number {
  const nearest = (u: number, v: number): number => {
    let best = 0;
    for (const [i, [pu, pv]] of mesh.paper.entries()) {
      const [bu, bv] = mesh.paper[best] ?? [0, 0];
      if (Math.hypot(pu - u, pv - v) < Math.hypot(bu - u, bv - v)) best = i;
    }
    return best;
  };
  const [a, b] = [
    positions[nearest(0.99, 0.25)],
    positions[nearest(0.01, 0.25)],
  ];
  if (!a || !b) throw new Error('ringGap: no vertex near the band ends');
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
