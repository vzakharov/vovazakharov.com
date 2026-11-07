/**
 * Folds a `*.steps.json` file the way a hand does (`relaxSequence`) and writes
 * to `tmp/origami/<name>/`: `views.png`, every view of the let-go model on one
 * labelled sheet, and `report.md`, each phase with its iterations and whether
 * it settled, then the model's worst strain and crossings.
 *
 * Usage: pnpm origami:steps <file.steps.json> [--paper <preset>]
 *        [--views "name=az,el[,zoom];…"]
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';

import {
  DEFAULT_PAPER,
  PAPER_IDS,
  PAPERS,
  relaxSequence,
  StepsSchema,
  type Vec,
  type Vec3,
} from '@/origami/shared/fold';

import { render } from './lib/render.ts';
import { DEFAULT_VIEWS, parseViews } from './lib/views.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const COLORS = { front: 0x8a_9a_5b, back: 0xe8_dc_c0 };

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    paper: { type: 'string', default: DEFAULT_PAPER },
    views: { type: 'string', default: DEFAULT_VIEWS },
  },
});

const file = z.string().endsWith('.steps.json').parse(positionals[0]);
const paperId = z.enum(PAPER_IDS).parse(values.paper);
const views = parseViews(values.views);
const steps = StepsSchema.parse(JSON.parse(await readFile(file, 'utf8')));

const name = path.basename(file, '.steps.json');
const out = path.resolve(REPO_ROOT, 'tmp/origami', name);

const { mesh, positions, phases, strain, crossings } = relaxSequence(
  steps,
  PAPERS[paperId],
);

// Lifted so the lowest point rests on the ground the renderer draws.
const floor = Math.min(...positions.map((point) => point[2]));
const at = (v: number): Vec3 => {
  const [x, y, height] = positions[v] ?? [0, 0, 0];
  return [x, y, height - floor];
};
const model = {
  pieces: mesh.triangles.map((triangle, id) => ({
    id,
    paper: triangle.map((v): Vec => mesh.paper[v] ?? [0, 0]),
    world: triangle.map((v) => at(v)),
    front: (mesh.faces[id]?.facing ?? 1) > 0,
    layer: 0,
  })),
  creases: [],
};

await render({ colors: COLORS, display: (point) => point }, out, [
  {
    frames: views.map((view) => ({ model, view })),
    file: path.join(out, 'views.png'),
  },
]);

const report = [
  `# ${name} on ${paperId}`,
  '',
  `Worst strain ${(strain * 100).toFixed(2)}%, ${crossings} crossings.`,
  '',
  '| Phase | Iterations | Settled |',
  '| ----- | ---------- | ------- |',
  ...phases.map(
    ({ stage, iterations, settled }) =>
      `| ${stage} | ${iterations} | ${settled ? 'yes' : 'no'} |`,
  ),
  '',
].join('\n');
await writeFile(path.join(out, 'report.md'), report);

process.stdout.write(`wrote ${path.relative(REPO_ROOT, out)}/\n`);
