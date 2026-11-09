/**
 * Renders worlds' land and sea, and measures them: the frame that judges the
 * land series against the probe's. Writes one equirectangular PNG, the worlds
 * stacked top to bottom with a rule between them — north up, `φ = 0` at the
 * left edge, a row per Gauss–Legendre ring, whose spacing in latitude is even
 * to within a fraction of a row — and prints a row per world: its land share,
 * how many landmasses hold over 1% of its land, and the largest's share.
 *
 * Usage: pnpm frame:island <world…> [--knee 6] [--slope 2]
 *        [--degree 511] [--out tmp/island/worlds.png]
 *   The envelope is `(knee² + l²)^(−slope/2)`; a pinned world draws its stored
 *   series instead, which no envelope shapes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';

import {
  kneeEnvelope,
  LAND_DEGREE,
  landmasses,
  landSeries,
  landShare,
  pinnedSeries,
  rollWorld,
  sphereTransform,
  synthesize,
} from '@/island/entities/terrain';

import { encodeIndexedPng } from './lib/indexed-png';
import { padSeries } from './lib/sphere-fit';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    knee: { type: 'string', default: '6' },
    slope: { type: 'string', default: '2' },
    degree: { type: 'string', default: String(LAND_DEGREE) },
    out: { type: 'string', default: 'tmp/island/worlds.png' },
  },
});

const options = z
  .object({
    knee: z.coerce.number().positive(),
    slope: z.coerce.number().positive(),
    degree: z.coerce.number().int().min(1),
    out: z.string().min(1),
  })
  .parse(values);
const worlds = z.array(z.string()).min(1).parse(positionals);

/** A landmass counts once it holds more than this share of the land. */
const LANDMASS_FLOOR = 0.01;
const RULE_ROWS = 4;
const SEA = 0;
const LAND = 1;
const RULE = 2;
const PALETTE = [
  [38, 70, 110],
  [196, 178, 128],
  [255, 255, 255],
] as const;

const envelope = kneeEnvelope(options.knee, options.slope);
const transform = sphereTransform(options.degree);
const { rows, columns } = transform.grid;
const height = worlds.length * rows + (worlds.length - 1) * RULE_ROWS;
const pixels = new Uint8Array(columns * height).fill(RULE);

const say = (line: string) => process.stdout.write(`${line}\n`);
const percent = (share: number) => `${(share * 100).toFixed(1)}%`;
say(`knee ${options.knee}, slope ${options.slope}, degree ${options.degree}`);
say('| World | Land | Landmasses > 1% | Largest |');
say('| ----: | ---: | --------------: | ------: |');
const pinnedSeriesByWorld = await Promise.all(
  worlds.map(async (world) => pinnedSeries(world)),
);
for (const [n, world] of worlds.entries()) {
  const pinned = pinnedSeriesByWorld[n];
  const series = pinned
    ? padSeries(pinned, options.degree)
    : landSeries(
        rollWorld(world, options.degree).land,
        options.degree,
        envelope,
      );
  const field = synthesize(transform, series);
  const masses = landmasses(transform.grid, field);
  const counted = masses.filter((share) => share > LANDMASS_FLOOR).length;
  say(
    `| ${world} | ${percent(landShare(transform.grid, field))} | ${counted} | ${percent(masses[0] ?? 0)} |`,
  );
  const top = n * (rows + RULE_ROWS) * columns;
  for (const [cell, value] of field.entries()) {
    pixels[top + cell] = value > 0 ? LAND : SEA;
  }
}

const out = path.resolve(REPO_ROOT, options.out);
await mkdir(path.dirname(out), { recursive: true });
await writeFile(
  out,
  encodeIndexedPng({ width: columns, height, pixels, palette: PALETTE }),
);
say(`Wrote ${path.relative(REPO_ROOT, out)}`);
