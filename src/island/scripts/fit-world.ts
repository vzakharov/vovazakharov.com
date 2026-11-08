/**
 * Fits world 1 to the drawn island and writes the mask that makes it ours
 * (`src/island/entities/terrain/world/model/mask.json`): the rings' signed
 * distance on the world grid, unclipped, one field unit per `r · side` (B10),
 * less our dome, every harmonic of what is left encoded as world 1's words.
 * The dome, and with its radius the unit, is searched for the least wrong land
 * area with every word inside the decoder's reach. Then it decodes world 1 through
 * `buildWorldField` and measures it against the rings: wrong area and where,
 * the lakes, bite 1's strait, and a frame.
 *
 * `pnpm fit:island` — also dumps world 1's grid to `tmp/fit/` for
 * `bite-2/overlay.py`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { coast } from '@/island/entities/coast';
import {
  buildCoastField,
  buildWorldField,
  type Dome,
  DOME_RANGES,
  makeMask,
  SEED_WORD,
  serializeMask,
  TAPER,
} from '@/island/entities/terrain';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

import { encodePng, type NodeKind, paintFrame } from './lib/fit-frame';
import { landOf, resample, WORLD_GRID } from './lib/fit-grid';
import {
  lakesOf,
  largestPatches,
  type Patch,
  wrongArea,
} from './lib/fit-measure';
import { coordinateSearch } from './lib/fit-search';
import { FACTOR_LIMIT, type FittedWords, fitWords } from './lib/fit-spectrum';
import { straitFate } from './lib/fit-strait';
import {
  assertInside,
  domeFromBounds,
  domeGrid,
  reachOf,
  ringBounds,
  targetOf,
  unitMetres,
} from './lib/fit-target';

const MASK_FILE = path.join(
  REPO_ROOT,
  'src/island/entities/terrain/world/model/mask.json',
);
const FRAME = path.join(
  REPO_ROOT,
  'docs/plans/world-game-zoltan-syama/bite-2/notes/b2-s3-fit.png',
);
const DUMP = path.join(REPO_ROOT, 'tmp/fit');

/** Our noise seed, today's `SEED`. */
const OUR_SEED = 1;
/** The waves' untapered window. */
const WINDOW = TAPER.inner;

const started = performance.now();
const say = (line: string) => process.stdout.write(`${line}\n`);
const pct = (share: number) => `${(100 * share).toFixed(2)}%`;
const km2 = (nodes: number) =>
  Math.round(nodes * (WORLD_GRID.cellMetres / 1000) ** 2);

// B1 and B9: the rings sit inside the waves' untapered window.
const bounds = ringBounds(coast);
assertInside(bounds, WINDOW);
const reach = reachOf(bounds);
say(
  `rings reach ${reach.x.toFixed(3)} (x), ${reach.y.toFixed(3)} (y) of the ` +
    `side from the square's middle; the window holds to ${String(WINDOW)}`,
);

const coastField = buildCoastField(coast);
const distance = resample(coastField, WORLD_GRID);
const truth = landOf(distance);

type Trial = { share: number; fit: FittedWords; land: Uint8Array };

/** World 1 as `dome` makes it, decoded the way the game does. */
function trial(dome: Dome): Trial {
  const target = targetOf(distance, dome);
  const domeValues = domeGrid(dome);
  const waves = target.map((t, n) => t - (domeValues[n] ?? 0));
  const fit = fitWords(waves, dome, OUR_SEED);
  const land = landOf(buildWorldField('1', makeMask(fit.words)).distance);
  return { share: wrongArea(land, truth).share, fit, land };
}

/** Wrong share, a clipped word costing a whole island's worth. */
const score = ({ share, fit }: Trial) =>
  share + (fit.clipped.length > 0 ? 1 : 0);
const scoreLine = (s: number) =>
  `wrong ${pct(s % 1)}${s >= 1 ? ', words clipped' : ''}`;

const boundsDome = domeFromBounds(bounds);
const boundsScore = score(trial(boundsDome));
const DOME_KEYS: readonly (keyof Dome)[] = [
  'centreX',
  'centreY',
  'radiusA',
  'radiusB',
  'turn',
];
const searched = coordinateSearch({
  keys: DOME_KEYS,
  start: boundsDome,
  steps: {
    centreX: 0.02,
    centreY: 0.02,
    radiusA: 0.02,
    radiusB: 0.02,
    turn: Math.PI / 8,
  },
  ranges: DOME_RANGES,
  score: (dome) => score(trial(dome)),
  rounds: 4,
});
const fittedDome = searched.best;
const unitKm = (d: Dome) => (unitMetres(d) / 1000).toFixed(0);
say(
  `\ndome from the bounds: ${JSON.stringify(boundsDome)}, unit ` +
    `${unitKm(boundsDome)} km, ${scoreLine(boundsScore)}`,
);
say(
  `fitted dome (${String(searched.evaluations)} trials): ` +
    `${JSON.stringify(fittedDome)}, unit ${unitKm(fittedDome)} km, ` +
    `${scoreLine(searched.score)}`,
);
const fitted = searched.score < boundsScore;
const dome = fitted ? fittedDome : boundsDome;
say(
  `keeping the ${fitted ? 'fitted' : 'bounds'} dome, ` +
    `${pct(Math.abs(boundsScore - searched.score) % 1)} of the land apart`,
);

// Write the mask, then verify by decoding world 1 through the game's path.
const final = trial(dome);
const ours = final.fit.words;
if (final.fit.clipped.length > 0) {
  say(`CLIPPED words: ${JSON.stringify(final.fit.clipped)}`);
}
const mask = makeMask(ours);
await writeFile(MASK_FILE, serializeMask(mask));
const world = buildWorldField('1', mask);
const land = landOf(world.distance);
const wrong = wrongArea(land, truth);
say(
  `\nunclipped distance, unit ${unitKm(dome)} km; ` +
    `max |factor| ${final.fit.maxFactor.toFixed(3)} ` +
    `(|k| ≤ 1.5: ${final.fit.maxLowFactor.toFixed(3)}), the decoder's reach ` +
    `${FACTOR_LIMIT.toFixed(3)}; ${String(final.fit.clipped.length)} clipped; ` +
    `seed word ${String(ours[SEED_WORD])}`,
);
say(
  `world 1: ${pct(wrong.share)} of the drawn land wrong — ` +
    `${String(km2(wrong.added))} km² added over sea, ` +
    `${String(km2(wrong.dropped))} km² dropped, of ${String(km2(wrong.truthLand))} km²`,
);

/** Drawing pixel of plane km, the main body's box centre at (616, 430.5). */
const pixelOf = (x: number, y: number) =>
  `px (${(616 + x / coast.kmPerPixel).toFixed(0)}, ` +
  `${(430.5 - y / coast.kmPerPixel).toFixed(0)})`;
const describe = (p: Patch) =>
  `  ${p.kind.padEnd(7)} ${String(Math.round(p.km2)).padStart(7)} km² at ` +
  `(${p.x.toFixed(0)}, ${p.y.toFixed(0)}) km, ${pixelOf(p.x, p.y)}`;
say('largest wrong patches:');
for (const patch of largestPatches(land, truth, WORLD_GRID, 12)) {
  say(describe(patch));
}

// Lakes: closed sea inside land, drawn and decoded.
const drawnLakes = lakesOf(distance, WORLD_GRID);
const worldLakes = lakesOf(world.distance, WORLD_GRID);
say(
  `lakes: ${String(drawnLakes.pieces.length)} drawn on the grid, ` +
    `${String(worldLakes.pieces.length)} in world 1`,
);
for (const [id, lake] of drawnLakes.pieces.entries()) {
  const kept = new Set<number>();
  let water = 0;
  for (const [n, label] of drawnLakes.label.entries()) {
    if (label !== id) continue;
    const w = worldLakes.label[n] ?? -1;
    if (w >= 0) kept.add(w);
    if ((world.distance[n] ?? 0) < 0) water += 1;
  }
  const keptNodes = [...kept].reduce(
    (sum, w) => sum + (worldLakes.pieces[w]?.nodes ?? 0),
    0,
  );
  const x = (WORLD_GRID.originX + lake.i * WORLD_GRID.cellMetres) / 1000;
  const y = (WORLD_GRID.originY + lake.j * WORLD_GRID.cellMetres) / 1000;
  say(
    `  drawn ${String(km2(lake.nodes))} km² at (${x.toFixed(0)}, ` +
      `${y.toFixed(0)}) km, ${pixelOf(x, y)}: ${String(km2(water))} km² of it ` +
      `water in world 1; world lakes over it ${String(kept.size)}, ` +
      `${String(km2(keptNodes))} km²`,
  );
}

// Call 6: the strait, on a 2 km resample of each field.
for (const [name, field] of [
  ['rings', coastField],
  ['world 1', world],
] as const) {
  const fate = straitFate(field, bounds, 2000, 200_000);
  say(
    `strait, ${name}: inlet head ${fate.headOpen ? 'open' : 'closed'}, ` +
      `channel end ${fate.endOpen ? 'open' : 'closed'}; open sea reaches ` +
      `south to y ${fate.southmostKm?.toFixed(0) ?? '—'} km`,
  );
}

// The frame: world 1 over the rings, wrong area red, lakes deep blue.
const drawnLake = (n: number) => (drawnLakes.label[n] ?? -1) >= 0;
const kindAt = (n: number): NodeKind => {
  const l = land[n] === 1;
  const t = truth[n] === 1;
  if (l && !t) return 'added';
  if (!l && t) return 'dropped';
  if (!l && ((worldLakes.label[n] ?? -1) >= 0 || drawnLake(n))) return 'lake';
  return l ? 'land' : 'sea';
};
const node = (x: number, y: number) => [
  Math.floor((x - WORLD_GRID.originX) / WORLD_GRID.cellMetres),
  Math.floor((y - WORLD_GRID.originY) / WORLD_GRID.cellMetres),
];
const pad = 150_000;
const [i0 = 0, j0 = 0] = node(bounds.minX - pad, bounds.minY - pad);
const [i1 = 0, j1 = 0] = node(bounds.maxX + pad, bounds.maxY + pad);
await writeFile(
  FRAME,
  encodePng(
    paintFrame({
      grid: WORLD_GRID,
      window: [i0, i1, j0, j1],
      pixels: 2,
      kindAt,
      coast,
    }),
  ),
);
await mkdir(DUMP, { recursive: true });
await writeFile(
  path.join(DUMP, 'world1-distance.f32'),
  new Uint8Array(world.distance.buffer),
);
say(
  `\nframe ${path.relative(REPO_ROOT, FRAME)}; run ` +
    `${((performance.now() - started) / 1000).toFixed(1)} s`,
);
