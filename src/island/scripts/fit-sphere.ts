/**
 * Fits a pinned world to its coast on the sphere and writes its row
 * (`src/island/entities/terrain/world/land/model/pinned/<world>.json`): the
 * coast's signed distance clipped (call 6), analysed to `LAND_DEGREE` on A's
 * grid, quantized at the fewest bits per word that keep the wrong-land share.
 * The wrong land is measured on the doubled grid (1024 rings × 2048), the
 * series synthesised onto it zero-padded, against the true coast there.
 *
 * - #1: the drawn island, laid on the globe through the azimuthal plane
 *   (`lib/fit-drawn.ts`).
 * - #0: Earth, from Natural Earth's 1:50m layers fetched at fit time
 *   (`lib/fit-earth.ts`; public domain, naturalearthdata.com/about/terms-of-use.
 *   Made with Natural Earth).
 *
 * Usage: pnpm fit:island 0|1 [--clip 500] [--compare] [--bits 16,12,10,…] [--verify]
 *   --clip     the target's clip in km (call 6)
 *   --compare  also fits the unclipped target and prints its share
 *   --bits     the bit depths tried, the row written at the fewest that keep
 *              the unquantized share within 0.01 points
 *   --verify   writes nothing: re-fits and checks the committed row equals
 *              the fit's, field for field; exits 1 when it does not
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { format } from 'prettier';
import { z } from 'zod';

import {
  decodePinnedRow,
  encodePinnedRow,
  LAND_DEGREE,
  landmasses,
  landShare,
  type PinnedRow,
  pinnedRow,
  sphereTransform,
  synthesize,
} from '@/island/entities/terrain';

import { DRAWN_CLIP_METRES, drawnFit } from './lib/fit-drawn';
import { earthFit } from './lib/fit-earth';
import {
  type FitTarget,
  MISPLACED_METRES,
  padSeries,
  type WrongLand,
  wrongLand,
} from './lib/sphere-fit';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

/** How far over the unquantized share a bit depth may go and still keep it. */
const KEEP_TOLERANCE = 1e-4;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    clip: { type: 'string', default: String(DRAWN_CLIP_METRES / 1000) },
    compare: { type: 'boolean', default: false },
    bits: { type: 'string', default: '16,14,12,11,10,9,8,7,6' },
    verify: { type: 'boolean', default: false },
  },
});
const options = z
  .object({
    world: z.enum(['0', '1']),
    clip: z.coerce.number().positive(),
    compare: z.boolean(),
    bits: z
      .string()
      .transform((list) => list.split(',').map(Number))
      .pipe(z.array(z.number().int().min(2).max(32)).min(1)),
    verify: z.boolean(),
  })
  .parse({ ...values, world: positionals[0] });
const { world, clip: clipKm, compare, bits: depths, verify } = options;

const rowFile = path.join(
  REPO_ROOT,
  `src/island/entities/terrain/world/land/model/pinned/${world}.json`,
);

const started = performance.now();
const say = (line: string) => process.stdout.write(`${line}\n`);
const pct = (share: number) => `${(100 * share).toFixed(2)}%`;
const km2 = (area: number) => Math.round(area).toLocaleString('en');
const seconds = () => `${((performance.now() - started) / 1000).toFixed(1)} s`;

const transform = sphereTransform(LAND_DEGREE);
const fine = sphereTransform(2 * LAND_DEGREE + 1);
const target: FitTarget = world === '0' ? await earthFit(fine) : drawnFit(fine);
say(
  `#${world}: fit ${String(transform.grid.rows)} × ${String(transform.grid.columns)}, ` +
    `measure ${String(fine.grid.rows)} × ${String(fine.grid.columns)} (${seconds()})`,
);

const measure = (series: Float64Array): WrongLand =>
  wrongLand(
    fine.grid,
    synthesize(fine, padSeries(series, fine.recursion.degree)),
    target.truth,
  );

function report(label: string, wrong: WrongLand) {
  say(
    `${label}: ${pct(wrong.wrongShare)} of the land wrong ` +
      `(${pct(wrong.misplacedShare)} over ${String(MISPLACED_METRES / 1000)} km ` +
      `from the coast) — ${km2(wrong.addedKm2)} km² added over sea, ` +
      `${km2(wrong.droppedKm2)} km² dropped, of ${km2(wrong.landKm2)} km²`,
  );
}

const clip = clipKm * 1000;
const series = target.series(transform, clip);
const exact = measure(series);
report(`clipped ±${String(clipKm)} km, float64`, exact);
say('largest wrong patches:');
for (const patch of exact.patches) {
  say(
    `  ${patch.kind.padEnd(7)} ${String(Math.round(patch.km2)).padStart(7)} km² ` +
      `at ${target.place(patch)}`,
  );
}

if (compare) {
  report('unclipped, float64', measure(target.series(transform, Infinity)));
}

say('\n| Bits | Wrong land | Over 39 km | Words | Row (JSON) |');
say('| ---: | ---------: | ---------: | ----: | ---------: |');
let chosen: PinnedRow | undefined;
for (const bits of depths.toSorted((a, b) => b - a)) {
  const row = encodePinnedRow(world, series, LAND_DEGREE, bits);
  const wrong = measure(decodePinnedRow(row));
  const wordsBytes = Math.ceil((series.length * bits) / 8);
  const json = JSON.stringify(row);
  say(
    `| ${String(bits)} | ${pct(wrong.wrongShare)} | ${pct(wrong.misplacedShare)} | ` +
      `${(wordsBytes / 1024).toFixed(0)} KB | ${(json.length / 1024).toFixed(0)} KB |`,
  );
  if (wrong.wrongShare <= exact.wrongShare + KEEP_TOLERANCE) chosen = row;
}
if (!chosen) throw new Error('no bit depth tried keeps the wrong-land share');

const kept = synthesize(
  fine,
  padSeries(decodePinnedRow(chosen), fine.recursion.degree),
);
const masses = landmasses(fine.grid, kept);
const largest = masses.slice(0, 6).map((m) => pct(m));
say(
  `\nat ${String(chosen.bits)} bits: land ${pct(landShare(fine.grid, kept))} ` +
    `of the sphere, ${String(masses.length)} landmasses, ` +
    `${String(masses.filter((m) => m > 0.01).length)} over 1% of the land: ${largest.join(
      ', ',
    )}`,
);
for (const line of target.report(kept)) say(line);

const formatted = await format(JSON.stringify(chosen), { filepath: rowFile });
if (verify) {
  const committed = await pinnedRow(world);
  const same =
    committed !== undefined &&
    (await format(JSON.stringify(committed), { filepath: rowFile })) ===
      formatted;
  say(
    `\n${path.relative(REPO_ROOT, rowFile)} ${same ? 'equals' : 'DIFFERS FROM'} ` +
      `the re-fit's row`,
  );
  if (!same) process.exitCode = 1;
} else if (clip === DRAWN_CLIP_METRES) {
  await writeFile(rowFile, formatted);
  say(
    `\nwrote ${path.relative(REPO_ROOT, rowFile)} at ${String(chosen.bits)} bits ` +
      `(${(formatted.length / 1024).toFixed(0)} KB)`,
  );
} else
  say('\nthe row is written only at the default clip, which its test fits');
say(`run ${seconds()}`);
