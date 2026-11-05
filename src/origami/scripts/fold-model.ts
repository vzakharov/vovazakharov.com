/**
 * Folds a design and writes what an agent needs to judge it to
 * `tmp/origami/<design>/`: renders from each view, `model.json`, the crease
 * pattern, and a per-step physics report. Exits non-zero when the report has
 * an error-level finding — after writing everything, so the renders of an
 * unfoldable model can still be looked at, but never mistaken for a pass.
 *
 * Usage: pnpm origami <design> [--paper <preset>] [--views "az,el[,zoom];…"]
 *        [--seq] [--no-render]
 *   --seq   also renders every step from the first view (step-NN.png)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';

import { DESIGN_IDS, DESIGNS } from '@/origami/shared/designs';
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

import { render, type Shot, type View } from './lib/render.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const DEFAULT_VIEWS = '-35,35;20,60;180,25;0,90';
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
  .tuple([z.number(), z.number()])
  .rest(z.number())
  .transform(
    ([az, el, zoom]): View => ({ az, el, zoom: zoom ?? DEFAULT_ZOOM }),
  );
const views = values.views
  .split(';')
  .map((spec) => ViewSpec.parse(spec.split(',').map(Number)));

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
  return `| ${step} | ${kind}${record.flat ? '' : ' (shaping)'} | ${bentCell} | ${stack} / ${mm(depth)} | ${mm(creep)} / ${mm(width)} | ${tipCell} | ${said || '—'} |`;
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
  '| Step | Fold | Layers bent | Stack / depth | Creep / flap width | Sharpest tip | Findings |',
  '| ---- | ---- | ----------- | ------------- | ------------------ | ------------ | -------- |',
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
        model: snapshot(run(design.steps, i + 1), paper),
        view: first,
        file: path.join(out, `step-${String(i + 1).padStart(2, '0')}.png`),
      }))
    : [];
if (!values['no-render']) {
  await render(design, out, [
    ...views.map((view, i) => ({
      model: final,
      view,
      file: path.join(out, `view-${i}.png`),
    })),
    ...steps,
  ]);
}

process.stdout.write(`wrote ${path.relative(REPO_ROOT, out)}/\n`);
if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
}
