import { readFileSync } from 'node:fs';
import path from 'node:path';

import { PAPERS } from './paper.ts';
import { relaxSequence, type SequenceRelaxation } from './sequence.ts';
import { StepsSchema } from './steps-file.ts';

/** A ring of two side flaps folded in from a band: `tuck` slides the second
 * into the first's pocket, `plain` lays it on top. */
export function foldRing(name: 'tuck' | 'plain'): SequenceRelaxation {
  const file = path.join(import.meta.dirname, `ring-${name}.steps.json`);
  const steps = StepsSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
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
