/**
 * Fits world 1 to the drawn island and writes the mask that makes it ours
 * (`src/island/entities/terrain/world/model/mask.json`): the rings' signed
 * distance on the world grid, clipped and scaled into the field's units, less
 * our dome, every harmonic of what is left encoded as world 1's words. The
 * clip, the scale and the dome are searched for the least wrong land area
 * with every word inside the decoder's reach. Then it decodes world 1 through
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
import { coordinateSearch, type Point } from './lib/fit-search';
import { FACTOR_LIMIT, type FittedWords, fitWords } from './lib/fit-spectrum';
import { straitFate } from './lib/fit-strait';
import {
  assertInside,
  domeFromBounds,
  domeGrid,
  reachOf,
  ringBounds,
  type TargetShape,
  targetOf,
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
/** The waves' untapered window, `world-field.ts`'s `TAPER.inner`. */
const WINDOW = 0.4;
/** The clips the curve measures, km; `Infinity` is the bare distance. */
const CLIPS_KM = [320, 640, 1000, 1500, 2000, 2500, 3000, 4000, Infinity];
/** The scale is searched as the km of distance one field unit stands for. */
const UNIT_KM: readonly [number, number] = [1500, 5000];

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

/** World 1 as `dome` and `shape` make it, decoded the way the game does. */
function trial(dome: Dome, shape: TargetShape): Trial {
  const target = targetOf(distance, shape);
  const domeValues = domeGrid(dome);
  const waves = target.map((t, n) => t - (domeValues[n] ?? 0));
  const fit = fitWords(waves, dome, OUR_SEED);
  const land = landOf(buildWorldField('1', makeMask(fit.words)).distance);
  return { share: wrongArea(land, truth).share, fit, land };
}

/** Wrong share, a clipped word costing a whole island's worth. */
const score = ({ share, fit }: Trial) =>
  share + (fit.clipped.length > 0 ? 1 : 0);

const shapeOf = (clipKm: number, unitKm: number): TargetShape => ({
  clipMetres: clipKm * 1000,
  scale: 1 / (unitKm * 1000),
});

/** The best unit for `clipKm` under `dome`, and its trial. */
function bestUnit(dome: Dome, clipKm: number, startKm: number) {
  const found = coordinateSearch({
    keys: ['unitKm'],
    start: { unitKm: startKm },
    steps: { unitKm: 400 },
    ranges: { unitKm: UNIT_KM },
    score: ({ unitKm }) => score(trial(dome, shapeOf(clipKm, unitKm))),
    rounds: 5,
  });
  return { unitKm: found.best.unitKm, score: found.score };
}

function curve(dome: Dome, label: string) {
  say(`\nwrong share against clip, ${label} (best unit per clip):`);
  const rows = CLIPS_KM.map((clipKm) => {
    const { unitKm, score: s } = bestUnit(dome, clipKm, 2700);
    const clipped = s >= 1;
    say(
      `  clip ${String(clipKm).padStart(8)} km: unit ${unitKm.toFixed(0)} km, ` +
        `wrong ${pct(s % 1)}${clipped ? ', words clipped' : ''}`,
    );
    return { clipKm, unitKm, score: s };
  });
  return rows.reduce((a, b) => (b.score < a.score ? b : a));
}

const boundsDome = domeFromBounds(bounds);
const boundsBest = curve(boundsDome, 'dome from the bounds');

type DomeKey = keyof Dome | 'unitKm';
const DOME_KEYS: readonly DomeKey[] = [
  'centreX',
  'centreY',
  'radiusA',
  'radiusB',
  'turn',
  'unitKm',
];
const toDome = (p: Point<DomeKey>): Dome => ({
  centreX: p.centreX,
  centreY: p.centreY,
  radiusA: p.radiusA,
  radiusB: p.radiusB,
  turn: p.turn,
});
const searched = coordinateSearch({
  keys: DOME_KEYS,
  start: { ...boundsDome, unitKm: boundsBest.unitKm },
  steps: {
    centreX: 0.02,
    centreY: 0.02,
    radiusA: 0.02,
    radiusB: 0.02,
    turn: Math.PI / 8,
    unitKm: 200,
  },
  ranges: { ...DOME_RANGES, unitKm: UNIT_KM },
  score: (p) => score(trial(toDome(p), shapeOf(boundsBest.clipKm, p.unitKm))),
  rounds: 4,
});
const fittedDome = toDome(searched.best);
say(
  `\ndome from the bounds: ${JSON.stringify(boundsDome)}, ` +
    `wrong ${pct(boundsBest.score % 1)}`,
);
say(
  `fitted dome (${String(searched.evaluations)} trials at clip ` +
    `${String(boundsBest.clipKm)} km): ${JSON.stringify(fittedDome)}, ` +
    `unit ${searched.best.unitKm.toFixed(0)} km, wrong ${pct(searched.score % 1)}`,
);
const fitted = searched.score < boundsBest.score;
const dome = fitted ? fittedDome : boundsDome;
say(
  `keeping the ${fitted ? 'fitted' : 'bounds'} dome, ` +
    `${pct(Math.abs(boundsBest.score - searched.score) % 1)} of the land apart`,
);
const chosen = fitted ? curve(dome, 'fitted dome') : boundsBest;

// Write the mask, then verify by decoding world 1 through the game's path.
const final = trial(dome, shapeOf(chosen.clipKm, chosen.unitKm));
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
  `\nclip ${String(chosen.clipKm)} km, unit ${chosen.unitKm.toFixed(0)} km; ` +
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
