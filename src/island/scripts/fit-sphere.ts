/**
 * Fits #1 to the drawn island on the sphere and writes its pinned row
 * (`src/island/entities/terrain/world/model/pinned/1.json`): the rings laid on
 * the globe through the azimuthal plane, their signed distance clipped (call
 * 6), analysed to `LAND_DEGREE` on A's grid, quantized at the fewest bits per
 * word that keep the wrong-land share. The wrong land is measured on the
 * doubled grid (1024 rings × 2048), the series synthesised onto it zero-padded,
 * against the rings' own signed distance there.
 *
 * Usage: pnpm fit:island [--clip 500] [--compare] [--bits 16,12,10,…]
 *   --clip     the target's clip in km (call 6)
 *   --compare  also fits the unclipped target and prints its share
 *   --bits     the bit depths tried, the row written at the fewest that keep
 *              the unquantized share within 0.01 points
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { format } from 'prettier';
import { z } from 'zod';

import { latLonToUnit } from '@/island/shared/globe';
import {
  decodePinnedRow,
  encodePinnedRow,
  LAND_DEGREE,
  sphereTransform,
  synthesize,
} from '@/island/entities/terrain';

import { worldToPlane } from './lib/azimuthal';
import { drawnLakes } from './lib/coast';
import { DRAWN_CLIP_METRES, drawnField, drawnSeries } from './lib/fit-drawn';
import {
  coastTarget,
  lakeWater,
  padSeries,
  type WrongLand,
  wrongLand,
} from './lib/sphere-fit';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const ROW_FILE = path.join(
  REPO_ROOT,
  'src/island/entities/terrain/world/model/pinned/1.json',
);
/** How far over the unquantized share a bit depth may go and still keep it. */
const KEEP_TOLERANCE = 1e-4;

const { values } = parseArgs({
  options: {
    clip: { type: 'string', default: String(DRAWN_CLIP_METRES / 1000) },
    compare: { type: 'boolean', default: false },
    bits: { type: 'string', default: '16,14,12,11,10,9,8,7,6' },
  },
});
const options = z
  .object({
    clip: z.coerce.number().positive(),
    compare: z.boolean(),
    bits: z
      .string()
      .transform((list) => list.split(',').map(Number))
      .pipe(z.array(z.number().int().min(2).max(32)).min(1)),
  })
  .parse(values);

const started = performance.now();
const say = (line: string) => process.stdout.write(`${line}\n`);
const pct = (share: number) => `${(100 * share).toFixed(2)}%`;
const degrees = (radians: number) => (radians * 180) / Math.PI;
const seconds = () => `${((performance.now() - started) / 1000).toFixed(1)} s`;

const transform = sphereTransform(LAND_DEGREE);
const fine = sphereTransform(2 * LAND_DEGREE + 1);
const field = drawnField();
const truth = coastTarget(fine.grid, field, Infinity);
say(
  `grids: fit ${String(transform.grid.rows)} × ${String(transform.grid.columns)}, ` +
    `measure ${String(fine.grid.rows)} × ${String(fine.grid.columns)} (${seconds()})`,
);

const measure = (series: Float64Array): WrongLand =>
  wrongLand(
    fine.grid,
    synthesize(fine, padSeries(series, fine.recursion.degree)),
    truth,
  );

function report(label: string, wrong: WrongLand) {
  say(
    `${label}: ${pct(wrong.wrongShare)} of the drawn land wrong — ` +
      `${Math.round(wrong.addedKm2).toLocaleString('en')} km² added over sea, ` +
      `${Math.round(wrong.droppedKm2).toLocaleString('en')} km² dropped, of ` +
      `${Math.round(wrong.landKm2).toLocaleString('en')} km²`,
  );
}

const clip = options.clip * 1000;
const series = drawnSeries(transform, field, clip);
const exact = measure(series);
report(`clipped ±${String(options.clip)} km, float64`, exact);
say('largest wrong patches (plane km from the island centre):');
for (const patch of exact.patches) {
  const { x, y } = worldToPlane(latLonToUnit(patch));
  say(
    `  ${patch.kind.padEnd(7)} ${String(Math.round(patch.km2)).padStart(7)} km² ` +
      `at ${degrees(patch.lat).toFixed(1)}°, ${degrees(patch.lon).toFixed(1)}° ` +
      `(${(x / 1000).toFixed(0)}, ${(y / 1000).toFixed(0)}) km`,
  );
}

if (options.compare) {
  report(
    'unclipped, float64',
    measure(drawnSeries(transform, field, Infinity)),
  );
}

say('\n| Bits | Wrong land | Words | Row (JSON) |');
say('| ---: | ---------: | ----: | ---------: |');
let chosen: ReturnType<typeof encodePinnedRow> | undefined;
for (const bits of [...options.bits].sort((a, b) => b - a)) {
  const row = encodePinnedRow('1', series, LAND_DEGREE, bits);
  const wrong = measure(decodePinnedRow(row));
  const wordsBytes = Math.ceil((series.length * bits) / 8);
  const json = JSON.stringify(row);
  say(
    `| ${String(bits)} | ${pct(wrong.wrongShare)} | ${(wordsBytes / 1024).toFixed(0)} KB | ` +
      `${(json.length / 1024).toFixed(0)} KB |`,
  );
  if (wrong.wrongShare <= exact.wrongShare + KEEP_TOLERANCE) chosen = row;
}
if (!chosen) throw new Error('no bit depth tried keeps the wrong-land share');

const kept = synthesize(
  fine,
  padSeries(decodePinnedRow(chosen), fine.recursion.degree),
);
say(`\nthe drawn lakes at ${String(chosen.bits)} bits:`);
for (const lake of drawnLakes) {
  const { nodes, water } = lakeWater(fine.grid, kept, lake);
  say(
    `  ${String(nodes).padStart(4)} nodes at (${lake.x.toFixed(0)}, ` +
      `${lake.y.toFixed(0)}) km: ${pct(nodes === 0 ? 0 : water / nodes)} water`,
  );
}

if (clip === DRAWN_CLIP_METRES) {
  await writeFile(
    ROW_FILE,
    await format(JSON.stringify(chosen), { filepath: ROW_FILE }),
  );
  say(
    `\nwrote ${path.relative(REPO_ROOT, ROW_FILE)} at ${String(chosen.bits)} bits`,
  );
} else
  say('\nthe row is written only at the default clip, which its test fits');
say(`run ${seconds()}`);
