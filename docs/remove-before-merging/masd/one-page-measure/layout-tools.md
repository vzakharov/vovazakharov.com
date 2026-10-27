# The layout tools of bite 6b

Copy each into `tmp/modularity/` under its name and run from the repository root with `pnpm exec tsx tmp/modularity/<name>`. `layout.ts` reads `nouns.ts`, the noun tree file by file, where a file named nowhere stays with the whole in `widgets/meadow`; its plain run prints every import the layout would break. `move.ts` does the move from the pre-move tree (`--dry` prints the barrels), `merge.ts` folds imports of one barrel into one, `rename.ts` renames an export everywhere through the language service, `retarget.ts` points every import of named exports at their new home, `narrow.ts` replaces `MeadowLayout` in a scene file with a local alias of the field types it mentions, `compose.ts` adds callees' layout types to a file's alias, `genericize.ts` makes a file's stand-taking functions generic in the stand's layout, `stand-full.ts` spells `<MeadowLayout>` on bare stands in the widget, tests and scripts, and `redo.sh` undoes a move pass and runs it again with merge, prettier, `eslint --fix` and `tsc`.

## nouns.ts

```ts
// The noun tree, file by file: each game file's stem -> its slice. A file
// named nowhere stays with the whole, in widgets/meadow.
const TREE: [string, string][] = [
  [
    'shared/lib',
    'geometry random motion colour crescent light tap-reach cruise glide line-course',
  ],
  [
    'shared/world',
    'acting dusk weather ground pinhole pan view view-inverse eye-crop eye-height stride walk walking anchor bed-place backdrop-depths repaint-queue shelter-seats anchored-ground crowding occupant seat-reach',
  ],
  [
    'shared/ui',
    'palette palette-backdrop palette-creatures palette-dusk ink shapes haze-tone hit-areas synth part-loudness baking icon-disc',
  ],
  [
    'entities/mushroom',
    'planted mushroom-cover door-sight clump-shade cap-cover clump-layout placement mushroom-genes mushroom-outline mushroom-pose mushroom-profile chanterelle-outline porcini-margin house draw-house paint-dome paint-trumpet mushroom-paint mushroom-tints draw-mushroom mushroom-tap mushroom-hits door-reach window-reach door-tap window-glow windows-lit icon-genes mushroom-frame mushroom-selection mushroom-light mushroom-shown ground-grid meadow-camera viewports',
  ],
  ['entities/worm', 'worm draw-worm'],
  ['entities/mouse', 'mouse-run-clock mouse-run-course draw-mouse mouse-head'],
  [
    'entities/insect',
    'insect-genes bee-genes buzz-genes fly-genes bee-outline insect-outline proboscis perch flight-frame flight-habits flight-in flight-timing insect-paths insect-steering insect-dart insect-motion insect-light buzz-rest draw-insect draw-bee draw-buzz draw-fly insect-look insect-shadow insect-voices insect-tap insect-drawn insect-frame insect-seat insect-shown insect-away insect-sink widest-spans insect-size pollen-load flier flower-lift plane-place',
  ],
  [
    'entities/flower',
    'flower-planting planted-flowers anchored-stand flower-cover flower-plots flower-layout flower-sight flower-genes flower-sounds notes draw-flower flower-tints flower-ring flower-light far-band flower-fold',
  ],
  [
    'entities/landscape',
    'paint-backdrop bake-picture lawn mottles grain brow grass paint-land sun-layout moon-view moon-face paint-moon paint-sky backdrop-tones dusk-sky dusk-stars star-images dusk-voice rain-drops rain-fall rain-sky rain-view rain-voice cloud-puffs panorama skyline twin-fade',
  ],
  ['features/plant-flower', 'tufts tuft-tap tending flower-icons flower-room'],
  [
    'features/grow-mushroom',
    'mushroom-room standing-weighed mushroom-patch sprouting spore-seats spore-sight spore-bed spore-drift spores',
  ],
  ['features/furnish-house', 'furnishing door-seats'],
  ['features/worm-peeks', 'house-worm worm-way'],
  [
    'features/mice-run',
    'run-ends mouse-run night-runs mouse-door mouse-runs runner-shown run-front',
  ],
  [
    'features/insects-fly',
    'flight bee-room perch-room perch-sight perch-hosts perch-crowding flower-seat air-spots perches insects pollen shelter shelter-cover roost firefly firefly-view firefly-tap',
  ],
  ['features/flowers-close', 'flower-closing'],
  [
    'features/play-flowers',
    'instrument instrument-input instrument-voices keyboard keyed-flowers chord-fingers flower-touch flower-hold',
  ],
  ['features/walk-meadow', 'eye-input gait-icon footsteps'],
  ['pages/mushrooms', 'mushrooms-page meadow-canvas mushrooms-metadata index'],
];

export const NOUNS = new Map<string, string>();
for (const [slice, stems] of TREE)
  for (const stem of stems.split(' ')) {
    if (NOUNS.has(stem)) throw new Error(`${stem} twice`);
    NOUNS.set(stem, slice);
  }
export const WHOLE = 'widgets/meadow';
```

## layout.ts

```ts
// The game's target layout and the imports it would break.
// pnpm exec tsx tmp/modularity/layout.ts [--json]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const PAGE = 'src/mushrooms/pages/mushrooms';
const SOURCE = /\.tsx?$/;
const TEST = /\.test\.tsx?$/;

const files = readdirSync(PAGE, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && SOURCE.test(e.name))
  .map((e) => path.join(e.parentPath, e.name));
const known = new Set(files);

const stemOf = (f: string) => f.replace(TEST, '').replace(SOURCE, '');

import { NOUNS, WHOLE } from './nouns.ts';
export const slices = NOUNS;

const RANK: Record<string, number> = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  pages: 4,
};

export function sliceOf(file: string): string {
  const stem = path.basename(stemOf(file));
  return NOUNS.get(stem) ?? WHOLE;
}

function resolve(from: string, spec: string): string | undefined {
  let base: string;
  if (spec.startsWith('@/')) base = path.join('src', spec.slice(2));
  else if (spec.startsWith('.')) base = path.join(path.dirname(from), spec);
  else return undefined;
  const stem = base.replace(SOURCE, '');
  return [base, `${stem}.ts`, `${stem}.tsx`, `${stem}/index.ts`].find((c) =>
    known.has(c),
  );
}

export const legal = (from: string, to: string) => {
  if (from === to) return true;
  const [fl] = from.split('/');
  const [tl] = to.split('/');
  if (fl === 'shared' && tl === 'shared') return true;
  return RANK[tl] < RANK[fl];
};

export type Use = { from: string; to: string; names: string[]; spec: string };
export function imports(file: string): Use[] {
  const src = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  const uses: Use[] = [];
  for (const st of src.statements) {
    if (!(ts.isImportDeclaration(st) || ts.isExportDeclaration(st))) continue;
    if (!st.moduleSpecifier || !ts.isStringLiteral(st.moduleSpecifier))
      continue;
    const to = resolve(file, st.moduleSpecifier.text);
    if (!to) continue;
    const names: string[] = [];
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause;
      if (c?.name) names.push('default');
      const nb = c?.namedBindings;
      if (nb && ts.isNamedImports(nb))
        for (const e of nb.elements)
          names.push((e.propertyName ?? e.name).text);
      if (nb && ts.isNamespaceImport(nb)) names.push('*');
    } else {
      const ec = st.exportClause;
      if (ec && ts.isNamedExports(ec))
        for (const e of ec.elements)
          names.push((e.propertyName ?? e.name).text);
      else names.push('*');
    }
    uses.push({ from: file, to, names, spec: st.moduleSpecifier.text });
  }
  return uses;
}

export const allFiles = files;

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of files) {
    if (TEST.test(f)) continue;
    for (const u of imports(f)) {
      const a = sliceOf(f);
      const b = sliceOf(u.to);
      if (!legal(a, b))
        console.log(
          `${a} -> ${b}  ${path.relative(PAGE, f)} -> ${path.relative(PAGE, u.to)}  {${u.names.join(', ')}}`,
        );
    }
  }
}
```

## who.ts

```ts
// Each named file's slice, what it imports and who imports it.
import path from 'node:path';

import { allFiles, imports, PAGE, sliceOf } from './layout.ts';

const TEST = /\.test\.tsx?$/;
const prod = allFiles.filter((f) => !TEST.test(f));
const uses = prod.flatMap(imports);
for (const name of process.argv.slice(2)) {
  const f = prod.find(
    (x) => x.endsWith(`/${name}.ts`) || x.endsWith(`/${name}.tsx`),
  );
  if (!f) {
    console.log(`\n${name}: no such file`);
    continue;
  }
  const label = (u: string) =>
    `${sliceOf(u)}:${path.basename(u).replace(/\.tsx?$/, '')}`;
  const out = [
    ...new Set(uses.filter((u) => u.from === f).map((u) => label(u.to))),
  ];
  const inn = [
    ...new Set(uses.filter((u) => u.to === f).map((u) => label(u.from))),
  ];
  console.log(
    `\n${name} [${sliceOf(f)}] ${path.relative(PAGE, f)}\n  imports: ${out.join(' ')}\n  used by: ${inn.join(' ')}`,
  );
}
```

## phaser.ts

```ts
// Which game files reach Phaser at runtime, per target slice; and which tests
// would import across the layers.
import path from 'node:path';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

import { allFiles, imports, legal, PAGE, sliceOf } from './layout.ts';

const TEST = /\.test\.tsx?$/;

function runtimeTargets(file: string): string[] {
  const src = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  const out: string[] = [];
  for (const st of src.statements) {
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause;
      if (c?.isTypeOnly) continue;
      const nb = c?.namedBindings;
      if (
        c &&
        !c.name &&
        nb &&
        ts.isNamedImports(nb) &&
        nb.elements.length > 0 &&
        nb.elements.every((e) => e.isTypeOnly)
      )
        continue;
      out.push((st.moduleSpecifier as ts.StringLiteral).text);
    } else if (
      ts.isExportDeclaration(st) &&
      st.moduleSpecifier &&
      !st.isTypeOnly
    ) {
      out.push((st.moduleSpecifier as ts.StringLiteral).text);
    }
  }
  return out;
}

const memo = new Map<string, boolean>();
export function reachesPhaser(file: string, seen = new Set<string>()): boolean {
  if (memo.has(file)) return memo.get(file)!;
  if (seen.has(file)) return false;
  seen.add(file);
  const specs = runtimeTargets(file);
  let hit = specs.some((s) => s === 'phaser' || s.startsWith('phaser/'));
  if (!hit) {
    const resolved = imports(file)
      .filter((u) => specs.includes(u.spec))
      .map((u) => u.to);
    hit = resolved.some((t) => reachesPhaser(t, seen));
  }
  memo.set(file, hit);
  return hit;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bySlice = new Map<string, { phaser: number; pure: number }>();
  for (const f of allFiles.filter((x) => !TEST.test(x))) {
    const s = sliceOf(f);
    const row = bySlice.get(s) ?? { phaser: 0, pure: 0 };
    if (reachesPhaser(f)) row.phaser++;
    else row.pure++;
    bySlice.set(s, row);
  }
  console.log(bySlice);
  console.log('\ntests importing across the layers:');
  for (const f of allFiles.filter((x) => TEST.test(x))) {
    const bad = imports(f).filter((u) => !legal(sliceOf(f), sliceOf(u.to)));
    if (bad.length)
      console.log(
        `${path.relative(PAGE, f)} [${sliceOf(f)}] -> ${[...new Set(bad.map((u) => sliceOf(u.to)))].join(', ')}`,
      );
  }
}
```

## move.ts

```ts
// Moves the game's files into their slices and rewrites every import.
// pnpm exec tsx tmp/modularity/move.ts [--dry]
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { allFiles, imports, legal, PAGE, sliceOf, type Use } from './layout.ts';
import { reachesPhaser } from './phaser.ts';

const DRY = process.argv.includes('--dry');
const APP = 'src/mushrooms';
const TEST = /\.test\.tsx?$/;
const SEGMENT: Record<string, string> = {
  model: 'model',
  ui: 'ui',
  api: 'api',
};

// ---- the new path of every game file
const moves = new Map<string, string>();
for (const f of allFiles) {
  const slice = sliceOf(f);
  if (slice === 'pages/mushrooms') continue;
  const rel = path.relative(PAGE, f);
  const base = path.basename(f);
  const seg = SEGMENT[rel.split('/')[0]];
  if (!seg) throw new Error(`no segment for ${rel}`);
  const to = slice.startsWith('shared/')
    ? path.join(APP, slice, base)
    : path.join(APP, slice, seg, base);
  moves.set(f, to);
}
const schema = path.join(PAGE, 'model/kept-record.schema.json');
moves.set(
  schema,
  path.join(
    path.dirname(moves.get(path.join(PAGE, 'model/kept-record.ts'))!),
    'kept-record.schema.json',
  ),
);
{
  const seen = new Map<string, string>();
  for (const [from, to] of moves) {
    if (seen.has(to))
      throw new Error(`collision: ${from} and ${seen.get(to)} -> ${to}`);
    seen.set(to, from);
  }
}
const newPath = (f: string) => moves.get(f) ?? f;

// ---- type-or-value of each export, from the checker
const program = ts.createProgram(allFiles, {
  allowJs: false,
  noEmit: true,
  jsx: ts.JsxEmit.Preserve,
  baseUrl: '.',
  paths: { '@/*': ['src/*'] },
  allowImportingTsExtensions: true,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.Latest,
});
const checker = program.getTypeChecker();
type Kind = { isType: boolean; origin?: string };
const exportKinds = new Map<string, Map<string, Kind>>(); // file -> name -> kind
function kindsOf(file: string): Map<string, Kind> {
  let m = exportKinds.get(file);
  if (m) return m;
  m = new Map();
  const sf = program.getSourceFile(file);
  const sym = sf && checker.getSymbolAtLocation(sf);
  if (sym)
    for (const e of checker.getExportsOfModule(sym)) {
      const target =
        e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
      const decl = target.declarations?.[0]?.getSourceFile().fileName;
      m.set(e.name, {
        isType: !(target.flags & ts.SymbolFlags.Value),
        origin: decl && path.relative(process.cwd(), decl),
      });
    }
  exportKinds.set(file, m);
  return m;
}

// ---- which files take part
const scriptFiles = readdirSync(path.join(APP, 'scripts'), {
  recursive: true,
  withFileTypes: true,
})
  .filter((e) => e.isFile() && /\.tsx?$/.test(e.name))
  .map((e) => path.join(e.parentPath, e.name));
const outside = ['sites/vova/app/(game)/mushrooms/page.tsx'];
const editable = [...allFiles, ...scriptFiles, ...outside];

const unit = (f: string): string => {
  if (f.startsWith(path.join(APP, 'scripts'))) return 'scripts';
  if (!f.startsWith(PAGE)) return 'outside';
  const s = sliceOf(f);
  return s.startsWith('shared/') ? 'shared' : s;
};

const spellsExt = (spec: string) => /\.tsx?$/.test(spec);
const noExt = (p: string) => p.replace(/\.tsx?$/, '');
const alias = (p: string) => `@/${path.relative('src', p)}`;
function relative(from: string, to: string, ext: boolean) {
  let r = path.relative(path.dirname(from), to);
  if (!r.startsWith('.')) r = `./${r}`;
  return ext ? r : noExt(r);
}

type Barrel = {
  names: Map<string, { file: string; isType: boolean }>;
  index: Set<string>;
  safe: Set<string>;
};
const barrels = new Map<string, Barrel>(); // slice -> barrel
const mixed = (slice: string) => {
  const files = allFiles.filter((f) => !TEST.test(f) && sliceOf(f) === slice);
  return (
    files.some((f) => reachesPhaser(f)) && files.some((f) => !reachesPhaser(f))
  );
};
const upward: string[] = [];
const clashes = new Set<string>();

function specFor(
  u: Use,
  isTypeOnlyDecl: boolean,
  elementTypes: boolean[],
): string {
  const from = u.from;
  const to = u.to;
  const nf = newPath(from);
  const nt = newPath(to);
  const uf = unit(from);
  const ext = spellsExt(u.spec);
  if (nf === from && nt === to) return u.spec;
  if (uf === 'scripts' || uf === 'outside')
    return ext ? `${alias(nt)}` : noExt(alias(nt));
  const st = sliceOf(to);
  const ut = st.startsWith('shared/') ? 'shared' : st;
  if (uf === ut) return relative(nf, nt, ext);
  if (st === 'shared/lib') return noExt(alias(nt));
  const sf = sliceOf(from);
  if (!legal(sf, st)) {
    // a test above its layer: left deep until the operator decides where it goes
    upward.push(`${nf} -> ${nt}`);
    return noExt(alias(nt));
  }
  if (u.names.includes('default') || u.names.includes('*'))
    throw new Error(`cannot barrel ${u.names} in ${from} -> ${to}`);
  const kinds = kindsOf(to);
  const b = barrels.get(st) ?? {
    names: new Map(),
    index: new Set(),
    safe: new Set(),
  };
  barrels.set(st, b);
  // an importer that reaches no Phaser enters a mixed slice by its node-safe barrel
  const viaSafe = mixed(st) && (TEST.test(from) || !reachesPhaser(from));
  u.names.forEach((n, i) => {
    const k = kinds.get(n);
    const isType = k?.isType ?? (isTypeOnlyDecl || elementTypes[i]);
    const origin =
      k?.origin && allFiles.includes(k.origin) && sliceOf(k.origin) === st
        ? k.origin
        : to;
    const file = newPath(origin);
    const prev = b.names.get(n);
    if (prev && prev.file !== file)
      clashes.add(`${st}: ${n} — ${prev.file} / ${file}`);
    b.names.set(n, { file, isType });
    if (viaSafe && !(isType || !reachesPhaser(origin)))
      throw new Error(`${from} takes Phaser's ${n}`);
    (viaSafe ? b.safe : b.index).add(n);
  });
  const root = `@/${path.relative('src', path.join(APP, st))}`;
  return viaSafe ? `${root}/index.node-safe` : root;
}

// ---- rewrite every editable file's specifiers
const rewrites = new Map<string, string>();
for (const f of editable) {
  const text = readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true);
  const uses = imports(f);
  const edits: { start: number; end: number; text: string }[] = [];
  for (const st of sf.statements) {
    if (!(ts.isImportDeclaration(st) || ts.isExportDeclaration(st))) continue;
    const ms = st.moduleSpecifier;
    if (!ms || !ts.isStringLiteral(ms)) continue;
    const u = uses.find((x) => x.spec === ms.text);
    if (!u) continue;
    let typeOnly = false;
    let elementTypes: boolean[] = [];
    if (ts.isImportDeclaration(st)) {
      typeOnly = !!st.importClause?.isTypeOnly;
      const nb = st.importClause?.namedBindings;
      if (nb && ts.isNamedImports(nb))
        elementTypes = nb.elements.map((e) => e.isTypeOnly);
    } else {
      typeOnly = st.isTypeOnly;
      if (st.exportClause && ts.isNamedExports(st.exportClause))
        elementTypes = st.exportClause.elements.map((e) => e.isTypeOnly);
    }
    // names of this declaration alone
    const own: Use = { ...u, names: [] };
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause;
      if (c?.name) own.names.push('default');
      const nb = c?.namedBindings;
      if (nb && ts.isNamedImports(nb))
        for (const e of nb.elements)
          own.names.push((e.propertyName ?? e.name).text);
      if (nb && ts.isNamespaceImport(nb)) own.names.push('*');
    } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const e of st.exportClause.elements)
        own.names.push((e.propertyName ?? e.name).text);
    } else own.names.push('*');
    const spec = specFor(own, typeOnly, elementTypes);
    if (spec !== ms.text)
      edits.push({
        start: ms.getStart(sf) + 1,
        end: ms.getEnd() - 1,
        text: spec,
      });
  }
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start))
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  if (out !== text) rewrites.set(f, out);
}

// ---- barrels
function barrelText(slice: string, b: Barrel, which: Set<string>): string {
  const byFile = new Map<string, { n: string; t: boolean }[]>();
  for (const [n, { file, isType }] of b.names) {
    if (!which.has(n)) continue;
    const list = byFile.get(file) ?? [];
    list.push({ n, t: isType });
    byFile.set(file, list);
  }
  const dir = path.join(APP, slice);
  const lines = [...byFile.entries()]
    .sort(([a], [b2]) => a.localeCompare(b2))
    .map(([file, names]) => {
      const allTypes = names.every(({ t }) => t);
      const list = names
        .sort((a, b2) => a.n.localeCompare(b2.n))
        .map(({ n, t }) => (t && !allTypes ? `type ${n}` : n))
        .join(', ');
      return `export ${allTypes ? 'type ' : ''}{ ${list} } from '${relative(path.join(dir, 'index.ts'), file, false)}';`;
    });
  return `${lines.join('\n')}\n`;
}
const barrelFiles = new Map<string, string>();
for (const [slice, b] of barrels) {
  if (b.index.size)
    barrelFiles.set(
      path.join(APP, slice, 'index.ts'),
      barrelText(slice, b, b.index),
    );
  if (b.safe.size)
    barrelFiles.set(
      path.join(APP, slice, 'index.node-safe.ts'),
      barrelText(slice, b, b.safe),
    );
}

console.log(
  `${moves.size} moves, ${rewrites.size} files rewritten, barrels: ${[...barrelFiles.keys()].join(' ')}`,
);
if (clashes.size) {
  console.log([...clashes].join('\n'));
  process.exit(1);
}
console.log(`left deep (tests above their layer): ${upward.length}`);
if (DRY) {
  for (const [f, t] of barrelFiles) console.log(`\n== ${f}\n${t}`);
  process.exit(0);
}

for (const [from, to] of moves) {
  mkdirSync(path.dirname(to), { recursive: true });
  execFileSync('git', ['mv', from, to]);
}
for (const [f, t] of rewrites) writeFileSync(newPath(f), t);
for (const [f, t] of barrelFiles) {
  if (existsSync(f)) throw new Error(`barrel exists: ${f}`);
  writeFileSync(f, t);
}
```

## merge.ts

```ts
// Merges import declarations of one specifier into one.
// pnpm exec tsx tmp/modularity/merge.ts <file>...
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

for (const file of process.argv.slice(2)) {
  const text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const groups = new Map<string, ts.ImportDeclaration[]>();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier))
      continue;
    const c = st.importClause;
    if (!c || c.name || !c.namedBindings || !ts.isNamedImports(c.namedBindings))
      continue;
    const key = st.moduleSpecifier.text;
    groups.set(key, [...(groups.get(key) ?? []), st]);
  }
  const edits: { start: number; end: number; text: string }[] = [];
  for (const [spec, decls] of groups) {
    if (decls.length < 2) continue;
    const elements = decls.flatMap((d) => {
      const nb = d.importClause!.namedBindings as ts.NamedImports;
      return nb.elements.map((e) => ({
        type: d.importClause!.isTypeOnly || e.isTypeOnly,
        text: e.propertyName
          ? `${e.propertyName.text} as ${e.name.text}`
          : e.name.text,
      }));
    });
    const allTypes = elements.every((e) => e.type);
    const seen = new Set<string>();
    const list = elements
      .map((e) => (e.type && !allTypes ? `type ${e.text}` : e.text))
      .filter((t) => !seen.has(t) && seen.add(t));
    edits.push({
      start: decls[0].getStart(sf),
      end: decls[0].getEnd(),
      text: `import ${allTypes ? 'type ' : ''}{ ${list.join(', ')} } from '${spec}';`,
    });
    for (const d of decls.slice(1)) {
      let end = d.getEnd();
      if (text[end] === '\n') end++;
      edits.push({ start: d.getStart(sf), end, text: '' });
    }
  }
  if (!edits.length) continue;
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start))
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  writeFileSync(file, out);
}
```

## rename.ts

```ts
// Renames an exported declaration everywhere, through the language service.
// pnpm exec tsx tmp/modularity/rename.ts <file> <name> <new name>
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const [file, name, next] = process.argv.slice(2);
const config = ts.getParsedCommandLineOfConfigFile(
  'tsconfig.json',
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (d) => {
      throw new Error(String(d.messageText));
    },
  },
)!;
const files = config.fileNames.filter((f) => f.includes('/src/mushrooms/'));
const host: ts.LanguageServiceHost = {
  getScriptFileNames: () => files,
  getScriptVersion: () => '0',
  getScriptSnapshot: (f) =>
    ts.sys.fileExists(f)
      ? ts.ScriptSnapshot.fromString(ts.sys.readFile(f)!)
      : undefined,
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => config.options,
  getDefaultLibFileName: ts.getDefaultLibFilePath,
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
};
const service = ts.createLanguageService(host);
const abs = path.resolve(file);
const text = readFileSync(abs, 'utf8');
const decl = new RegExp(
  `export (?:const|function|type|class|let) ${name}\\b`,
).exec(text);
if (!decl) throw new Error(`no export ${name} in ${file}`);
const at = decl.index + decl[0].length - name.length;
const locations =
  service.findRenameLocations(abs, at, false, false, {
    providePrefixAndSuffixTextForRename: true,
  }) ?? [];
const byFile = new Map<string, ts.RenameLocation[]>();
for (const l of locations)
  byFile.set(l.fileName, [...(byFile.get(l.fileName) ?? []), l]);
for (const [f, ls] of byFile) {
  let out = readFileSync(f, 'utf8');
  for (const l of ls.sort((a, b) => b.textSpan.start - a.textSpan.start))
    out =
      out.slice(0, l.textSpan.start) +
      (l.prefixText ?? '') +
      next +
      (l.suffixText ?? '') +
      out.slice(l.textSpan.start + l.textSpan.length);
  writeFileSync(f, out);
  console.log(`${path.relative(process.cwd(), f)}: ${ls.length}`);
}
```

## redo.sh

```bash
#!/bin/bash
# Undo the move pass and run it again from the committed tree.
set -euo pipefail
cd "$(dirname "$0")/../.."
git reset -q HEAD -- src/mushrooms
git checkout HEAD -- src/mushrooms "sites/vova/app/(game)/mushrooms/page.tsx"
git clean -fdq src/mushrooms/entities src/mushrooms/features src/mushrooms/shared 2>/dev/null || true
pnpm exec tsx tmp/modularity/layout.ts
pnpm exec tsx tmp/modularity/move.ts | tail -2
git add -A src/mushrooms
mapfile -t files < <(git diff --cached --name-only --diff-filter=AMR -- 'src/mushrooms/*.ts' 'src/mushrooms/*.tsx')
pnpm exec tsx tmp/modularity/merge.ts "${files[@]}"
pnpm exec prettier --write "${files[@]}" >/dev/null
NODE_OPTIONS="--max-old-space-size=6144" pnpm exec eslint --fix "${files[@]}" 2>&1 |
  grep -E '^\s+[0-9]+:' | grep -v 'boundaries/dependencies' || true
git add -A src/mushrooms
pnpm exec tsc --noEmit -p . | head -20
```

## retarget.ts

```ts
// Points every import of the named exports at the file that now declares them.
// pnpm exec tsx tmp/modularity/retarget.ts <home file> <name>...
// A name imported from any other game module moves to an import of <home>,
// spelled relative to the importer (or as the importer spelled its own).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const [home, ...names] = process.argv.slice(2);
const ROOTS = ['src/mushrooms'];
const homeAbs = path.resolve(home);
const homeStem = homeAbs.replace(/\.tsx?$/, '');

const files = ROOTS.flatMap((r) =>
  readdirSync(r, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.tsx?$/.test(e.name))
    .map((e) => path.resolve(e.parentPath, e.name)),
);

function specTo(from: string, like: string): string {
  if (like.startsWith('@/'))
    return `@/${path.relative(path.resolve('src'), homeStem)}`;
  let r = path.relative(path.dirname(from), homeStem);
  if (!r.startsWith('.')) r = `./${r}`;
  return r;
}
const stemOf = (from: string, spec: string) =>
  (spec.startsWith('@/')
    ? path.resolve('src', spec.slice(2))
    : path.resolve(path.dirname(from), spec)
  ).replace(/\.tsx?$/, '');

let touched = 0;
for (const f of files) {
  if (f === homeAbs) continue;
  const text = readFileSync(f, 'utf8');
  if (!names.some((n) => text.includes(n))) continue;
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true);
  const edits: { start: number; end: number; text: string }[] = [];
  const moved: string[] = [];
  let spelled = '';
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier))
      continue;
    const spec = st.moduleSpecifier.text;
    if (!spec.startsWith('.') && !spec.startsWith('@/mushrooms')) continue;
    if (stemOf(f, spec) === homeStem) continue;
    // FROM=<file> repoints only imports of that file, where a name is declared twice.
    if (
      process.env.FROM &&
      stemOf(f, spec) !== path.resolve(process.env.FROM).replace(/\.tsx?$/, '')
    )
      continue;
    const c = st.importClause;
    const nb = c?.namedBindings;
    if (!c || !nb || !ts.isNamedImports(nb)) continue;
    const keep: string[] = [];
    let hit = false;
    for (const e of nb.elements) {
      const name = (e.propertyName ?? e.name).text;
      const txt = e.getText(sf).replace(/^type\s+/, '');
      const typed = c.isTypeOnly || e.isTypeOnly;
      if (names.includes(name)) {
        hit = true;
        moved.push(typed ? `type ${txt}` : txt);
      } else keep.push(e.isTypeOnly ? `type ${txt}` : txt);
    }
    if (!hit) continue;
    spelled ||= spec;
    let end = st.getEnd();
    if (text[end] === '\n') end++;
    edits.push({
      start: st.getStart(sf),
      end,
      text:
        keep.length || c.name
          ? `import ${c.isTypeOnly ? 'type ' : ''}${c.name ? `${c.name.text}, ` : ''}{ ${keep.join(', ')} } from '${spec}';\n`
          : '',
    });
  }
  if (!moved.length) continue;
  const allTypes = moved.every((m) => m.startsWith('type '));
  const list = allTypes ? moved.map((m) => m.slice(5)) : moved;
  const first = edits.reduce((a, b) => (a.start < b.start ? a : b));
  first.text += `import ${allTypes ? 'type ' : ''}{ ${list.join(', ')} } from '${specTo(f, spelled)}';\n`;
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start))
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  writeFileSync(f, out);
  touched++;
  console.log(`${path.relative(process.cwd(), f)}: ${moved.join(', ')}`);
}
console.log(`${touched} files`);
```

## narrow.ts

```ts
// Replaces MeadowLayout in each named scene file with a local alias of the
// narrow field types the file mentions.
// pnpm exec tsx tmp/modularity/narrow.ts <stem>...
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SCENE = 'src/mushrooms/pages/mushrooms/ui/scene';
// field -> [type, module relative to the scene]
const FIELDS: Record<string, [string, string]> = {
  width: ['WithWidth', '@/kernel/shared/typings'],
  height: ['WithHeight', '@/kernel/shared/typings'],
  groundTop: ['Grounded', '../../model/ground'],
  camera: ['WithCamera', '../../model/ground'],
  sun: ['Sunned', './sun-layout'],
  horizon: ['Horizoned', './sun-layout'],
  nearHills: ['NearHilled', './sun-layout'],
  clouds: ['Clouded', './panorama'],
  wash: ['SunWashed', './sun-layout'],
  insectSize: ['InsectScaled', './insect-size'],
  insectSizes: ['InsectSized', './insect-size'],
  mushrooms: ['ClumpGround', './clump-layout'],
  flowers: ['Bedded', './flower-layout'],
};
const pascal = (s: string) =>
  s.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

for (const stem of process.argv.slice(2)) {
  const file = path.join(SCENE, `${stem}.ts`);
  let text = readFileSync(file, 'utf8');
  const used = Object.entries(FIELDS).filter(([f]) =>
    new RegExp(`\\b${f}\\b`).test(text),
  );
  let types = used.map(([, [t]]) => t);
  if (types.includes('InsectScaled'))
    types = types.filter((t) => t !== 'InsectSized');
  const alias = `${pascal(stem)}Layout`;
  // drop MeadowLayout from its import
  text = text.replace(
    /import (type )?\{([^}]*)\} from '\.\/layout';\n/,
    (_, ty: string | undefined, list: string) => {
      const rest = list
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && !/\bMeadowLayout\b/.test(s));
      return rest.length
        ? `import ${ty ?? ''}{ ${rest.join(', ')} } from './layout';\n`
        : '';
    },
  );
  text = text.replace(/\bMeadowLayout\b/g, alias);
  const byModule = new Map<string, string[]>();
  for (const [, [t, m]] of used)
    if (types.includes(t)) byModule.set(m, [...(byModule.get(m) ?? []), t]);
  const imports = [...byModule]
    .map(([m, ts]) => `import type { ${ts.join(', ')} } from '${m}';\n`)
    .join('');
  // after the last top-level import
  const lines = text.split('\n');
  let last = -1;
  let inImport = false;
  lines.forEach((l, i) => {
    if (/^import /.test(l)) inImport = true;
    if (inImport && /from '.*';$|^import '.*';$/.test(l)) {
      last = i;
      inImport = false;
    }
  });
  const decl = `\n/** What of the meadow's layout this reads. */\ntype ${alias} = ${types.join(' & ') || 'object'};\n`;
  lines.splice(last + 1, 0, imports.trimEnd(), decl);
  writeFileSync(file, lines.join('\n'));
  console.log(`${stem}: ${types.join(' & ')}`);
}
```

## compose.ts

```ts
// Adds layout types to a scene file's own layout alias, importing each from the
// scene file that exports it.
// pnpm exec tsx tmp/modularity/compose.ts <stem> <Type>...
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SCENE = 'src/mushrooms/pages/mushrooms/ui/scene';
const MODEL = 'src/mushrooms/pages/mushrooms/model';
const KNOWN: Record<string, string> = {
  GroundBand: '../../model/ground',
  GroundedScreen: '../../model/ground',
  Grounded: '../../model/ground',
  WithCamera: '../../model/ground',
  WithWidth: '@/kernel/shared/typings',
  WithHeight: '@/kernel/shared/typings',
  Sized: '@/kernel/shared/typings',
};
const [stem, ...types] = process.argv.slice(2);
const file = path.join(SCENE, `${stem}.ts`);
const alias = `${stem.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}Layout`;
let text = readFileSync(file, 'utf8');

function home(type: string): string {
  if (KNOWN[type]) return KNOWN[type];
  for (const dir of [SCENE, MODEL])
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.ts') || f.endsWith('.test.ts')) continue;
      const t = readFileSync(path.join(dir, f), 'utf8');
      if (new RegExp(`export type ${type}\\b`).test(t)) {
        const rel = path
          .relative(SCENE, path.join(dir, f))
          .replace(/\.ts$/, '');
        return rel.startsWith('.') ? rel : `./${rel}`;
      }
    }
  throw new Error(`no home for ${type}`);
}

const m = new RegExp(`(export )?type ${alias}(<[^=]*>)? =([^;]*);`).exec(text);
if (!m) throw new Error(`no ${alias} in ${file}`);
const body = m[3].trim();
const have = new Set(body.split('&').map((s) => s.trim()));
const add = types.filter((t) => !have.has(t));
text =
  text.slice(0, m.index) +
  `export type ${alias}${m[2] ?? ''} = ${[body, ...add].join(' & ')};` +
  text.slice(m.index + m[0].length);
const imports = add
  .filter((t) => !new RegExp(`import[^;]*\\b${t}\\b[^;]*;`).test(text))
  .map((t) => `import type { ${t} } from '${home(t)}';\n`)
  .join('');
const at = text.indexOf('\n/** What of the meadow');
text = text.slice(0, at + 1) + imports + text.slice(at + 1);
writeFileSync(file, text);
console.log(`${alias} += ${add.join(' & ')}`);
```

## genericize.ts

```ts
// Makes each function of a scene file that takes a bare Stand (or one of its
// parts) generic in the stand's layout, bounded by the file's own layout alias.
// pnpm exec tsx tmp/modularity/genericize.ts <stem> [<alias>]
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SCENE = 'src/mushrooms/pages/mushrooms/ui/scene';
const CARRIERS = new Set(['Stand', 'WithLayout', 'SeededLayout', 'PlotGround']);
const [stem, given] = process.argv.slice(2);
const file = stem.includes('/') ? stem : path.join(SCENE, `${stem}.ts`);
const alias =
  given ??
  `${path
    .basename(file, '.ts')
    .replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}Layout`;
const text = readFileSync(file, 'utf8');
const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
const edits: { start: number; end: number; text: string }[] = [];

function bareCarriers(node: ts.Node, out: ts.TypeReferenceNode[]) {
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    CARRIERS.has(node.typeName.text) &&
    !node.typeArguments
  ) {
    // Stand['mushrooms'] reads a member the layout does not change
    if (!ts.isIndexedAccessTypeNode(node.parent)) out.push(node);
  }
  ts.forEachChild(node, (c) => bareCarriers(c, out));
}

type Fn =
  | ts.FunctionDeclaration
  | ts.MethodDeclaration
  | ts.ArrowFunction
  | ts.FunctionExpression;
function visit(node: ts.Node) {
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node)
  ) {
    const fn = node as Fn;
    const refs: ts.TypeReferenceNode[] = [];
    for (const p of fn.parameters) if (p.type) bareCarriers(p.type, refs);
    if (refs.length && !fn.typeParameters?.some((t) => t.name.text === 'L')) {
      if (fn.type) bareCarriers(fn.type, refs);
      for (const r of refs)
        edits.push({ start: r.getEnd(), end: r.getEnd(), text: '<L>' });
      const param = `L extends ${alias}`;
      if (fn.typeParameters?.length) {
        const last = fn.typeParameters[fn.typeParameters.length - 1];
        edits.push({
          start: last.getEnd(),
          end: last.getEnd(),
          text: `, ${param}`,
        });
      } else if (ts.isArrowFunction(fn) && !fn.getText(sf).startsWith('(')) {
        const p = fn.parameters[0];
        edits.push({
          start: p.getStart(sf),
          end: p.getStart(sf),
          text: `<${param}>(`,
        });
        edits.push({ start: p.getEnd(), end: p.getEnd(), text: ')' });
      } else {
        const open = fn
          .getChildren(sf)
          .find((c) => c.kind === ts.SyntaxKind.OpenParenToken)!;
        edits.push({
          start: open.getStart(sf),
          end: open.getStart(sf),
          text: `<${param}>`,
        });
      }
    }
  }
  ts.forEachChild(node, visit);
}
visit(sf);
let out = text;
for (const e of edits.sort((a, b) => b.start - a.start))
  out = out.slice(0, e.start) + e.text + out.slice(e.end);
writeFileSync(file, out);
console.log(`${path.basename(file)}: ${edits.length} edits, bound ${alias}`);
```

## stand-full.ts

```ts
// Spells the whole meadow's layout on every bare stand carrier in the given
// files: the widget's and the tests' stands carry all of it.
// pnpm exec tsx tmp/modularity/stand-full.ts <file>...
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const CARRIERS = new Set(['Stand', 'WithLayout', 'SeededLayout', 'PlotGround']);
const LAYOUT = path.resolve('src/mushrooms/pages/mushrooms/ui/scene/layout');

for (const file of process.argv.slice(2)) {
  let text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const ends: number[] = [];
  const walk = (node: ts.Node) => {
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      CARRIERS.has(node.typeName.text) &&
      !node.typeArguments &&
      !ts.isIndexedAccessTypeNode(node.parent)
    )
      ends.push(node.getEnd());
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (!ends.length) continue;
  for (const e of ends.sort((a, b) => b - a))
    text = text.slice(0, e) + '<MeadowLayout>' + text.slice(e);
  if (!/\bMeadowLayout\b[^<]/.test(text.replace(/<MeadowLayout>/g, ''))) {
    const scripts = file.includes('/scripts/');
    let spec = scripts
      ? '@/mushrooms/pages/mushrooms/ui/scene/layout'
      : path.relative(path.dirname(path.resolve(file)), LAYOUT);
    if (!scripts && !spec.startsWith('.')) spec = `./${spec}`;
    const line = `import type { MeadowLayout } from '${spec}';\n`;
    const firstImport = text.search(/^import /m);
    text = text.slice(0, firstImport) + line + text.slice(firstImport);
  }
  writeFileSync(file, text);
  console.log(`${file}: ${ends.length}`);
}
```

## scc.ts

The import cycles among the game's production files, each with the slices its files are laid in: a cycle is one slice or an untying.

```ts
// Strongly connected components of the game's production import graph (files),
// each printed with the slices its files are laid in.
import path from 'node:path';

import { allFiles, imports, sliceOf } from './layout.ts';

const prod = allFiles.filter((f) => !/\.test\.tsx?$/.test(f));
const edges = new Map<string, Set<string>>(prod.map((f) => [f, new Set()]));
for (const u of prod.flatMap(imports))
  if (edges.has(u.to)) edges.get(u.from)!.add(u.to);
let index = 0;
const idx = new Map<string, number>();
const low = new Map<string, number>();
const on = new Set<string>();
const stack: string[] = [];
const comps: string[][] = [];
function visit(v: string) {
  idx.set(v, index);
  low.set(v, index);
  index++;
  stack.push(v);
  on.add(v);
  for (const w of edges.get(v)!) {
    if (!idx.has(w)) {
      visit(w);
      low.set(v, Math.min(low.get(v)!, low.get(w)!));
    } else if (on.has(w)) low.set(v, Math.min(low.get(v)!, idx.get(w)!));
  }
  if (low.get(v) === idx.get(v)) {
    const c: string[] = [];
    let w: string;
    do {
      w = stack.pop()!;
      on.delete(w);
      c.push(w);
    } while (w !== v);
    comps.push(c);
  }
}
for (const v of prod) if (!idx.has(v)) visit(v);
for (const c of comps
  .filter((c) => c.length > 1)
  .sort((a, b) => b.length - a.length)) {
  const bySlice = new Map<string, string[]>();
  for (const f of c) {
    const s = sliceOf(f);
    bySlice.set(s, [
      ...(bySlice.get(s) ?? []),
      path.basename(f).replace(/\.tsx?$/, ''),
    ]);
  }
  console.log(`\n${c.length} files:`);
  for (const [s, fs] of bySlice) console.log(`  ${s}: ${fs.join(' ')}`);
}
```

## lift.ts

The floor: every file whose imports break the layout lifted into the widget, to a fixpoint, and what each slice keeps.

```ts
// The floor: lift every file whose imports break the layout into the whole
// (widgets/meadow), to a fixpoint, and print what each slice keeps.
import path from 'node:path';

import { allFiles, imports, legal, sliceOf } from './layout.ts';
import { WHOLE } from './nouns.ts';

const prod = allFiles.filter((f) => !/\.test\.tsx?$/.test(f));
const uses = prod.flatMap(imports);
const at = new Map(prod.map((f) => [f, sliceOf(f)]));
const lifted: string[] = [];
for (let changed = true; changed; ) {
  changed = false;
  for (const u of uses) {
    const a = at.get(u.from)!;
    const b = at.get(u.to);
    if (b === undefined || legal(a, b) || a === WHOLE || a.startsWith('pages'))
      continue;
    at.set(u.from, WHOLE);
    lifted.push(
      `${path.basename(u.from)} (${a}, for ${path.basename(u.to)} in ${b})`,
    );
    changed = true;
  }
}
const kept = new Map<string, number>();
for (const s of at.values()) kept.set(s, (kept.get(s) ?? 0) + 1);
const before = new Map<string, number>();
for (const f of prod) before.set(sliceOf(f), (before.get(sliceOf(f)) ?? 0) + 1);
for (const [s, n] of [...before].sort())
  console.log(`${s}: ${n} -> ${kept.get(s) ?? 0}`);
console.log(`\nlifted ${lifted.length}:`);
for (const l of lifted) console.log(`  ${l}`);
```

## reach.ts

Each entity-laid file's transitive reach into the other entities, grouped: a file reaching two nouns is no one noun's. Noisy while a hub reaches everything.

```ts
// Each entity-laid file's transitive reach into the entity slices: a file
// reaching two nouns cannot be either noun's. Prints the files whose reach
// leaves their own slice, grouped by what they reach.
import path from 'node:path';

import { allFiles, imports, sliceOf } from './layout.ts';

const prod = allFiles.filter((f) => !/\.test\.tsx?$/.test(f));
const out = new Map<string, string[]>(prod.map((f) => [f, []]));
for (const u of prod.flatMap(imports))
  if (out.has(u.to)) out.get(u.from)!.push(u.to);
const memo = new Map<string, Set<string>>();
function reach(f: string, seen = new Set<string>()): Set<string> {
  const known = memo.get(f);
  if (known) return known;
  if (seen.has(f)) return new Set();
  seen.add(f);
  const r = new Set<string>();
  const s = sliceOf(f);
  if (s.startsWith('entities/')) r.add(s);
  for (const t of out.get(f)!) for (const x of reach(t, seen)) r.add(x);
  memo.set(f, r);
  return r;
}
const groups = new Map<string, string[]>();
for (const f of prod) {
  const s = sliceOf(f);
  if (!s.startsWith('entities/')) continue;
  const r = [...reach(f)].filter((x) => x !== s).sort();
  if (r.length === 0) continue;
  const key = `${s} reaches ${r.join(' ')}`;
  groups.set(key, [
    ...(groups.get(key) ?? []),
    path.basename(f).replace(/\.tsx?$/, ''),
  ]);
}
for (const [k, fs] of [...groups].sort())
  console.log(`${k}:\n  ${fs.join(' ')}`);
```

## tidy.sh

```bash
#!/usr/bin/env bash
# Tidies the game files changed since HEAD (or those named): merges duplicate
# imports, formats, fixes what eslint fixes, and prints what is left but the
# boundaries rules the layout tools track.
cd "$(git rev-parse --show-toplevel)" || exit 1
files=("$@")
if [ ${#files[@]} -eq 0 ]; then
  mapfile -t files < <( { git diff --name-only HEAD; git ls-files -o --exclude-standard; } | grep -E '^src/.*\.tsx?$' | sort -u)
fi
existing=()
for f in "${files[@]}"; do [ -f "$f" ] && existing+=("$f"); done
[ ${#existing[@]} -eq 0 ] && exit 0
pnpm exec tsx tmp/modularity/merge.ts "${existing[@]}" >/dev/null
pnpm exec prettier --write "${existing[@]}" >/dev/null
pnpm exec eslint --fix "${existing[@]}" 2>&1 | grep -E '^\S|error|warning' | grep -v 'boundaries/' | grep -B1 -E 'error|warning' | grep -v '^--$'
exit 0
```
