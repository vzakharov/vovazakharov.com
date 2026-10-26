# Modularity over two graphs — the measurement

A slice's term is `e_ii − a_i²` over undirected file-import edges, tests and app scripts out. **own**: the files of the slice's own app. **desc**: its app, every descendant app and the routers. `×chance` is `e_ii / a_i²`; a slice passes when its term is above 0, i.e. above ×1.0. `(junk)` is the control: ten random scene files. `shared/*` is segmented and never checked; it is listed for scale.

## What it found

- **On every real slice the rule checks, the two graphs agree** — and only one checked slice has a single consumer, `shell/features/switch-theme`, whose consumer is `shell/app`, which is spared already. Today the rescue has nothing to rescue outside the game.
- **On the game's dry-run tree they agree too, but for the control**: the random ten sit at ×1.0 in both, and the bar `term > 0` falls between them — own rejects it by 0.0000064, desc admits it by 0.000023, because desc adds vova's 80 edges, all outside the game, and a bigger graph lowers `a_i²` for everyone (the resolution limit).
- **A slice that is its whole app scores exactly 0 under own** (`mushrooms/pages/mushrooms` today), and a sliver above 0 under desc. Pages are not checked, so it matters only if an app ever holds one non-page slice and nothing else.
- **desc measures a low app against the whole repo**: `shell/features/switch-theme` is ×11 under own and ×259 under desc. A verdict under desc moves when an unrelated app is added as a descendant.
- **Code cost is the same**: both build the file edges from the imports `check:masd` already reads and keep the edges whose ends both lie in a set of apps; desc's set is `{app} ∪ descendants(app) ∪ router`, with `descendants` already in `masd-graph.ts`. One line apart.

## Output

```text
## Consumers of checked real slices
basilisk/entities/case: basilisk/app, basilisk/pages/basilisk-home, router
blog/entities/document: bible/pages/bible-home, blog/pages/documents, maya/pages/home, music/widgets/story
music/entities/cover: music/pages/radio, music/pages/song, music/widgets/catalogue-header
music/entities/hook: music/pages/album, music/pages/artist, music/pages/radio, music/pages/song
music/entities/song: music/pages/song, music/widgets/song-list
music/features/player: music/app, music/pages/album, music/pages/music, music/pages/radio, music/pages/song, music/widgets/song-list
music/widgets/catalogue-grid: music/pages/artist, music/pages/music
music/widgets/catalogue-header: music/pages/album, music/pages/artist
music/widgets/music-nav: music/pages/album, music/pages/artist, music/pages/music, music/pages/radio, music/pages/song
music/widgets/song-list: music/pages/album, music/pages/artist, music/pages/music
music/widgets/story: music/pages/album, music/pages/artist, music/pages/song
shell/features/switch-theme: shell/app
shell/widgets/site-footer: basilisk/pages/basilisk-home, bible/pages/bible-home, blog/pages/documents, lsa/pages/lsa-home, maya/pages/home, maya/pages/whisper, music/pages/album, music/pages/artist, music/pages/music, music/pages/radio, music/pages/song, vova/pages/home, vova/pages/writing

## Real slices
slice | files | inside | ends | own m | own ×chance | own term>0 | desc m | desc ×chance | desc term>0
basilisk/entities/case | 11 | 13 | 36 | 32 | 1.3 | true | 37 | 1.4 | true
basilisk/pages/basilisk-home | 4 | 3 | 10 | 32 | 3.8 | true | 37 | 3.7 | true
bible/pages/bible-home | 3 | 2 | 4 | 3 | 1.5 | true | 5 | 1.6 | true
blog/entities/document | 7 | 7 | 24 | 99 | 4.8 | true | 698 | 26.8 | true
blog/pages/documents | 8 | 7 | 26 | 99 | 4.1 | true | 698 | 19.1 | true
lsa/pages/lsa-home | 2 | 1 | 2 | 2 | 2.0 | true | 4 | 1.8 | true
maya/pages/home | 4 | 3 | 6 | 21 | 7.0 | true | 24 | 5.9 | true
maya/pages/whisper | 11 | 16 | 33 | 21 | 1.2 | true | 24 | 1.3 | true
mushrooms/pages/mushrooms | 241 | 1584 | 3168 | 1584 | 1.0 | false | 1664 | 1.0 | true  ← DIFFERS
music/entities/cover | 3 | 3 | 9 | 367 | 54.4 | true | 453 | 67.1 | true
music/entities/hook | 3 | 3 | 12 | 367 | 30.6 | true | 453 | 37.8 | true
music/entities/song | 2 | 1 | 4 | 367 | 91.8 | true | 453 | 113.2 | true
music/features/player | 21 | 45 | 110 | 367 | 5.5 | true | 453 | 6.7 | true
music/pages/album | 3 | 3 | 20 | 367 | 11.0 | true | 453 | 13.6 | true
music/pages/artist | 3 | 3 | 19 | 367 | 12.2 | true | 453 | 15.1 | true
music/pages/blind-test | 7 | 9 | 20 | 367 | 33.0 | true | 453 | 37.0 | true
music/pages/music | 6 | 8 | 32 | 367 | 11.5 | true | 453 | 14.2 | true
music/pages/radio | 4 | 3 | 19 | 367 | 12.2 | true | 453 | 15.1 | true
music/pages/song | 7 | 7 | 42 | 367 | 5.8 | true | 453 | 7.2 | true
music/widgets/catalogue-grid | 3 | 2 | 8 | 367 | 45.9 | true | 453 | 56.6 | true
music/widgets/catalogue-header | 2 | 1 | 8 | 367 | 22.9 | true | 453 | 28.3 | true
music/widgets/music-nav | 4 | 3 | 13 | 367 | 26.1 | true | 453 | 32.2 | true
music/widgets/song-list | 2 | 1 | 11 | 367 | 12.1 | true | 453 | 15.0 | true
music/widgets/story | 3 | 2 | 9 | 367 | 36.2 | true | 453 | 44.7 | true
shell/features/switch-theme | 3 | 2 | 5 | 35 | 11.2 | true | 808 | 258.6 | true
shell/widgets/site-footer | 2 | 1 | 4 | 35 | 8.8 | true | 808 | 10.0 | true
vova/pages/cv | 20 | 48 | 102 | 74 | 1.4 | true | 79 | 1.4 | true
vova/pages/home | 8 | 9 | 19 | 74 | 7.4 | true | 79 | 7.1 | true
vova/pages/not-found | 3 | 2 | 7 | 74 | 12.1 | true | 79 | 12.9 | true
vova/pages/writing | 4 | 3 | 6 | 74 | 24.7 | true | 79 | 19.3 | true

## Game, dry-run tree
slice | files | inside | ends | own m | own ×chance | own term>0 | desc m | desc ×chance | desc term>0
mushrooms/entities/firefly | 1 | 0 | 5 | 1584 | 0.0 | false | 1664 | 0.0 | false
mushrooms/entities/flower | 6 | 6 | 70 | 1584 | 7.8 | true | 1664 | 8.2 | true
mushrooms/entities/insect | 28 | 80 | 324 | 1584 | 4.8 | true | 1664 | 5.1 | true
mushrooms/entities/mushroom | 26 | 78 | 331 | 1584 | 4.5 | true | 1664 | 4.7 | true
mushrooms/features/meadow | 8 | 15 | 111 | 1584 | 7.7 | true | 1664 | 8.1 | true
mushrooms/pages/(junk) | 10 | 1 | 80 | 1584 | 1.0 | false | 1664 | 1.0 | true  ← DIFFERS
mushrooms/pages/mushrooms | 112 | 395 | 1447 | 1584 | 1.2 | true | 1664 | 1.3 | true
mushrooms/shared/lib | 20 | 13 | 347 | 1584 | 0.7 | false | 1664 | 0.7 | false
mushrooms/shared/ui | 8 | 8 | 132 | 1584 | 2.9 | true | 1664 | 3.1 | true
mushrooms/shared/world | 16 | 27 | 259 | 1584 | 2.6 | true | 1664 | 2.7 | true
mushrooms/widgets/map | 6 | 8 | 62 | 1584 | 13.2 | true | 1664 | 13.9 | true
```

## The script

Copy it to `tmp/modularity/spike.ts` and run `pnpm exec tsx tmp/modularity/spike.ts` from the repository root; a `.ts` under `docs/` would be type-checked and linted.

```ts
// Spike: a slice's modularity term e_ii − a_i² over two graphs —
// (own) the files of the slice's own app, (desc) its app plus every descendant
// and the routers. Run from the repo root: pnpm exec tsx tmp/modularity/spike.ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  descendants,
  loadGraph,
  SLICED_LAYERS,
} from '../../eslint/masd-graph.ts';

const graph = loadGraph('src/masd.json');
const SOURCE = /\.tsx?$/;
const TEST = /\.test\.tsx?$/;

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && SOURCE.test(e.name) && !TEST.test(e.name))
    .map((e) => path.join(e.parentPath, e.name));

const files = [
  ...walk('src').filter((f) => f.split('/')[2] !== 'scripts'),
  ...readdirSync('sites', { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(`sites/${e.name}/app`))
    .flatMap((e) => walk(`sites/${e.name}/app`)),
];
const known = new Set(files);

function resolve(from: string, spec: string): string | undefined {
  let base: string;
  if (spec.startsWith('@/')) base = path.join('src', spec.slice(2));
  else if (spec.startsWith('.')) base = path.join(path.dirname(from), spec);
  else return undefined;
  const stem = base.replace(SOURCE, '');
  return [
    base,
    `${stem}.ts`,
    `${stem}.tsx`,
    `${stem}/index.ts`,
    `${stem}/index.tsx`,
  ].find((c) => known.has(c));
}

// Undirected file edges, one per import (a duplicate import counts once).
const edges: [string, string][] = [];
for (const file of files) {
  const seen = new Set<string>();
  for (const { fileName } of ts.preProcessFile(
    readFileSync(file, 'utf8'),
    true,
    true,
  ).importedFiles) {
    const target = resolve(file, fileName);
    if (target === undefined || target === file || seen.has(target)) continue;
    seen.add(target);
    edges.push([file, target]);
  }
}

const appOf = (file: string) =>
  file.startsWith('sites/') ? 'router' : file.split('/')[1];

// Real slices: src/<app>/<sliced layer>/<slice>.
const SLICED = new Set(SLICED_LAYERS);
function realSlice(file: string): string | undefined {
  const [root, app, layer, slice] = file.split('/');
  if (root !== 'src' || !SLICED.has(layer) || slice === undefined)
    return undefined;
  return `${app}/${layer}/${slice}`;
}

// Dry-run slices of the game, read off the tree file.
const PAGE = 'src/mushrooms/pages/mushrooms';
const dry = new Map<string, string>();
{
  const tree = readFileSync(
    'docs/remove-before-merging/masd/one-page-measure/mushrooms-tree.md',
    'utf8',
  ).split('## Edges')[0];
  let layer = '';
  let slice = '';
  for (const line of tree.split('\n')) {
    const heading = line.match(/^[│ ]*[├└]── (\w+)\/(?:\s|$)/);
    if (heading) {
      if (line.startsWith('├── ') || line.startsWith('└── '))
        layer = heading[1];
      else slice = `mushrooms/${layer}/${heading[1]}`;
      continue;
    }
    if (!slice || !line.includes('│     ')) continue;
    for (const token of line.replace(/[│]/g, ' ').trim().split(/\s+/)) {
      const rel = token.startsWith('m:')
        ? `model/${token.slice(2)}`
        : token.startsWith('s:')
          ? `ui/scene/${token.slice(2)}`
          : token;
      const file = [`${PAGE}/${rel}.ts`, `${PAGE}/${rel}.tsx`].find((c) =>
        known.has(c),
      );
      if (file === undefined) {
        if (existsSync(`${PAGE}/${rel}.module.scss`)) continue;
        throw new Error(`tree names ${token}, no such file`);
      }
      dry.set(file, slice);
    }
  }
}
const scene = (names: string) =>
  names
    .split(' ')
    .map(
      (n) =>
        [
          `${PAGE}/ui/scene/${n}.ts`,
          `${PAGE}/ui/scene/${n}.tsx`,
          `${PAGE}/model/${n}.ts`,
        ].find((c) => known.has(c))!,
    );
const MAP = scene(
  'map-child map-compass map-ground map-view draw-map-ground map-frame',
);
const JUNK = scene(
  'grain tending rain-drops picker insect-sink spore-sight far-band window-glow gait-spot bake-picture',
);
const dryMembership = (file: string) =>
  MAP.includes(file)
    ? 'mushrooms/widgets/map'
    : JUNK.includes(file)
      ? 'mushrooms/pages/(junk)'
      : (dry.get(file) ?? realSlice(file));

type Row = {
  slice: string;
  files: number;
  inside: number;
  ends: number;
  m: number;
};

function measure(
  membership: (f: string) => string | undefined,
  scope: 'own' | 'desc',
) {
  const rows: Row[] = [];
  const slices = new Map<string, string[]>();
  for (const f of files) {
    const s = membership(f);
    if (s) slices.set(s, [...(slices.get(s) ?? []), f]);
  }
  for (const [slice, members] of slices) {
    const app = slice.split('/')[0];
    const apps = new Set([app]);
    if (scope === 'desc') {
      for (const d of descendants(graph, app)) apps.add(d);
      apps.add('router');
    }
    const inGraph = (f: string) => apps.has(appOf(f));
    const set = new Set(members);
    let m = 0;
    let inside = 0;
    let ends = 0;
    for (const [a, b] of edges) {
      if (!inGraph(a) || !inGraph(b)) continue;
      m++;
      const ia = set.has(a);
      const ib = set.has(b);
      if (ia && ib) inside++;
      ends += Number(ia) + Number(ib);
    }
    rows.push({ slice, files: members.length, inside, ends, m });
  }
  return rows;
}

const term = ({ inside, ends, m }: Row) => inside / m - (ends / (2 * m)) ** 2;
const ratio = ({ inside, ends, m }: Row) =>
  inside === 0 ? 0 : inside / m / (ends / (2 * m)) ** 2;

function report(
  title: string,
  membership: (f: string) => string | undefined,
  only?: RegExp,
) {
  const own = measure(membership, 'own');
  const desc = new Map(measure(membership, 'desc').map((r) => [r.slice, r]));
  console.log(`\n## ${title}`);
  console.log(
    'slice | files | inside | ends | own m | own ×chance | own term>0 | desc m | desc ×chance | desc term>0',
  );
  for (const r of own.sort((x, y) => x.slice.localeCompare(y.slice))) {
    if (only && !only.test(r.slice)) continue;
    const d = desc.get(r.slice)!;
    const flip = term(r) > 0 !== term(d) > 0 ? '  ← DIFFERS' : '';
    console.log(
      `${r.slice} | ${r.files} | ${r.inside} | ${r.ends} | ${r.m} | ${ratio(r).toFixed(1)} | ${term(r) > 0} | ${d.m} | ${ratio(d).toFixed(1)} | ${term(d) > 0}${flip}`,
    );
  }
}

// Consumers as check:masd counts them: distinct other locations importing in.
const loc = (f: string) =>
  f.startsWith('sites/')
    ? 'router'
    : (realSlice(f) ?? f.split('/').slice(1, 3).join('/'));
const consumers = new Map<string, Set<string>>();
for (const [a, b] of edges) {
  const [from, to] = [loc(a), loc(b)];
  if (from === to || realSlice(b) === undefined) continue;
  consumers.set(to, (consumers.get(to) ?? new Set()).add(from));
}
console.log('\n## Consumers of checked real slices');
for (const [slice, from] of [...consumers].sort()) {
  if (!slice.includes('/pages/'))
    console.log(`${slice}: ${[...from].join(', ')}`);
}

report('Real slices', realSlice);
report('Game, dry-run tree', dryMembership, /^mushrooms\//);
```
