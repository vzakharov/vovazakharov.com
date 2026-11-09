/**
 * Renders worlds' land and sea, and measures them: the frame that judges the
 * land series against the probe's. Writes one equirectangular PNG, the worlds
 * stacked top to bottom with a rule between them — north up, `φ = 0` at the
 * left edge, a row per Gauss–Legendre ring, whose spacing in latitude is even
 * to within a fraction of a row — and prints a row per world: its land share,
 * how many landmasses hold over 1% of its land, and the largest's share.
 *
 * Usage: pnpm frame:island <world…> [--knee 6] [--slope 2]
 *        [--degree 511] [--out tmp/island/worlds.png] [--views [--size 480]]
 *   The envelope is `(knee² + l²)^(−slope/2)`; a pinned world draws its stored
 *   series instead, which no envelope shapes.
 *   --views  draws each world as two orthographic globes side by side instead,
 *            seen from far over the equator at 0° and at 180°, `--size`
 *            pixels across each — the two sides of the world at orbit.
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

import { globeSamples, OFF_DISK } from './lib/globe-view';
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
    views: { type: 'boolean', default: false },
    size: { type: 'string', default: '480' },
  },
});

const options = z
  .object({
    knee: z.coerce.number().positive(),
    slope: z.coerce.number().positive(),
    degree: z.coerce.number().int().min(1),
    out: z.string().min(1),
    views: z.boolean(),
    size: z.coerce.number().int().min(16),
  })
  .parse(values);
const worlds = z.array(z.string()).min(1).parse(positionals);

/** A landmass counts once it holds more than this share of the land. */
const LANDMASS_FLOOR = 0.01;
const RULE_ROWS = 4;
const SEA = 0;
const LAND = 1;
const RULE = 2;
const SPACE = 3;
const PALETTE = [
  [38, 70, 110],
  [196, 178, 128],
  [255, 255, 255],
  [16, 18, 24],
] as const;
/** The views' centres, east longitude in radians, both over the equator. */
const SIDES = [0, Math.PI];

const envelope = kneeEnvelope(options.knee, options.slope);
const transform = sphereTransform(options.degree);
const { grid } = transform;
const { rows, columns } = grid;
const sides = options.views
  ? SIDES.map((lon) => globeSamples(grid, { lat: 0, lon }, options.size))
  : [];
/** One world's band of the PNG: the equirectangular map, or the globes. */
const band = options.views
  ? {
      width: sides.length * options.size + (sides.length - 1) * RULE_ROWS,
      rows: options.size,
    }
  : { width: columns, rows };
const width = band.width;
const height = worlds.length * band.rows + (worlds.length - 1) * RULE_ROWS;
const pixels = new Uint8Array(width * height).fill(RULE);
const tone = (value: number) => (value > 0 ? LAND : SEA);

function drawBand(n: number, field: Float64Array) {
  const top = n * (band.rows + RULE_ROWS) * width;
  if (!options.views) {
    for (const [cell, value] of field.entries()) pixels[top + cell] = tone(value);
    return;
  }
  for (const [side, cells] of sides.entries()) {
    const left = side * (options.size + RULE_ROWS);
    for (const [pixel, cell] of cells.entries()) {
      const row = Math.floor(pixel / options.size);
      const col = pixel % options.size;
      pixels[top + row * width + left + col] =
        cell === OFF_DISK ? SPACE : tone(field[cell] ?? 0);
    }
  }
}

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
  const masses = landmasses(grid, field);
  const counted = masses.filter((share) => share > LANDMASS_FLOOR).length;
  say(
    `| ${world} | ${percent(landShare(grid, field))} | ${counted} | ${percent(masses[0] ?? 0)} |`,
  );
  drawBand(n, field);
}

const out = path.resolve(REPO_ROOT, options.out);
await mkdir(path.dirname(out), { recursive: true });
await writeFile(
  out,
  encodeIndexedPng({ width, height, pixels, palette: PALETTE }),
);
say(`Wrote ${path.relative(REPO_ROOT, out)}`);
