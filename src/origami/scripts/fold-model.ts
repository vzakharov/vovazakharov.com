/**
 * Folds a design and writes what an agent needs to judge it to
 * `tmp/origami/<design>/`: `views.png`, every view on one labelled sheet,
 * `model.json`, the crease pattern, and a per-step physics report. Exits
 * non-zero when the report has an error-level finding — after writing
 * everything, so the renders of an unfoldable model can still be looked at,
 * but never mistaken for a pass.
 *
 * Usage: pnpm origami <design> [--paper <preset>]
 *        [--views "name=az,el[,zoom];…"] [--seq] [--no-render]
 *   --seq   also renders every step from the first view (step-NN.png)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';

import {
  creasePatternSvg,
  DEFAULT_PAPER,
  PAPER_IDS,
  PAPERS,
  physics,
  run,
  snapshot,
  type StepReport,
} from '@/origami/shared/fold';
import { DESIGN_IDS, DESIGNS } from '@/origami/entities/design';

import { render, type Shot } from './lib/render.ts';
import type { View } from './lib/render-page.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const DEFAULT_VIEWS = 'three-quarter=-35,30;side=0,8;head-on=90,12;top=0,90';
const DEFAULT_ZOOM = 1.05;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    paper: { type: 'string', default: DEFAULT_PAPER },
    views: { type: 'string', default: DEFAULT_VIEWS },
    seq: { type: 'boolean', default: false },
    'no-render': { type: 'boolean', default: false },
  },
});

const designId = z.enum(DESIGN_IDS).parse(positionals[0]);
const paperId = z.enum(PAPER_IDS).parse(values.paper);
const paper = PAPERS[paperId];
const design = DESIGNS[designId]();

const ViewSpec = z
  .tuple([
    z.string().min(1),
    z.tuple([z.number(), z.number()]).rest(z.number()),
  ])
  .transform(
    ([name, [az, el, zoom]]): View => ({
      name,
      az,
      el,
      zoom: zoom ?? DEFAULT_ZOOM,
    }),
  );
const views = values.views.split(';').map((spec) => {
  const [name = '', angles = ''] = spec.split('=');
  return ViewSpec.parse([name, angles.split(',').map(Number)]);
});

const out = path.resolve(REPO_ROOT, 'tmp/origami', designId);
await mkdir(out, { recursive: true });

const reports = physics(design.steps, paper);
const final = snapshot(run(design.steps), paper);

const mm = (value: number) => `${value.toFixed(2)} mm`;

function row(report: StepReport): string {
  const {
    step,
    record,
    bent,
    halves,
    stack,
    depth,
    stackAtCrease,
    creep,
    width,
    tip,
    findings,
  } = report;
  const kind = halves ? 'reverse' : record.direction;
  const bentCell = halves ? `${bent} (${halves.join(' + ')})` : String(bent);
  const tipCell = tip
    ? `${tip.degrees.toFixed(1)}°, ×${tip.amplification.toFixed(1)}`
    : '—';
  const said = findings
    .map(({ level, message }) => `**${level}**: ${message}`)
    .join('<br>');
  return `| ${step} | ${kind}${record.flat ? '' : ' (shaping)'} | ${bentCell} | ${stack} / ${mm(depth)} / ${stackAtCrease} | ${mm(creep)} / ${mm(width)} | ${tipCell} | ${said || '—'} |`;
}

const errors = reports.flatMap((report) =>
  report.findings
    .filter(({ level }) => level === 'error')
    .map(({ message }) => `step ${report.step}: ${message}`),
);

const reportMarkdown = [
  `# ${designId} on ${paperId}`,
  '',
  `${paper.side} mm square, ${paper.thickness} mm thick. ${final.pieces.length} pieces, ` +
    `${Math.max(0, ...final.pieces.map(({ layer }) => layer)) + 1} layers at the deepest.`,
  '',
  'The thresholds are starting calibrations from folding practice, not measurements; they are expected to move once real models are folded by hand.',
  '',
  '| Step | Fold | Layers bent | Stack / depth / at crease | Creep / flap width | Sharpest tip | Findings |',
  '| ---- | ---- | ----------- | ------------------------- | ------------------ | ------------ | -------- |',
  ...reports.map((step) => row(step)),
  '',
].join('\n');

await writeFile(path.join(out, 'report.md'), reportMarkdown);
await writeFile(path.join(out, 'model.json'), JSON.stringify(final));
await writeFile(
  path.join(out, 'crease-pattern.svg'),
  creasePatternSvg(final.creases),
);

const [first] = views;
const steps: Shot[] =
  values.seq && first
    ? design.steps.map((_, i) => ({
        frames: [
          { model: snapshot(run(design.steps, i + 1), paper), view: first },
        ],
        file: path.join(out, `step-${String(i + 1).padStart(2, '0')}.png`),
      }))
    : [];
if (!values['no-render']) {
  await render(design, out, [
    {
      frames: views.map((view) => ({ model: final, view })),
      file: path.join(out, 'views.png'),
    },
    ...steps,
  ]);
}

process.stdout.write(`wrote ${path.relative(REPO_ROOT, out)}/\n`);
if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
}
