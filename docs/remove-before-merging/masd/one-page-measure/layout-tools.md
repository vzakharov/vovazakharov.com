# The layout tools of bite 6b

Copy each into `tmp/modularity/` under its name and run from the repository root with `pnpm exec tsx tmp/modularity/<name>`. `layout.ts` reads `nouns.ts`, the noun tree file by file, where a file named nowhere stays with the whole in `widgets/meadow`; its plain run prints every import the layout would break. `move.ts` does the move from the pre-move tree (`--dry` prints the barrels), `merge.ts` folds imports of one barrel into one, `rename.ts` renames an export everywhere through the language service, and `redo.sh` undoes a move pass and runs it again with merge, prettier, `eslint --fix` and `tsc`.

## nouns.ts

```ts
// The noun tree, file by file: each game file's stem -> its slice. A file
// named nowhere stays with the whole, in widgets/meadow.
const TREE: Record<string, string> = {
  'shared/lib':
    'geometry random motion colour crescent light tap-reach cruise glide line-course',
  'shared/world':
    'ground ground-grid pinhole pan view view-inverse eye-crop eye-height stride walk walking anchor meadow-camera viewports plane-place',
  'shared/ui':
    'palette palette-backdrop palette-creatures palette-dusk ink shapes haze-tone hit-areas synth part-loudness baking bake-picture',
  'entities/mushroom':
    'mushroom-genes mushroom-outline mushroom-pose mushroom-profile chanterelle-outline porcini-margin house draw-house paint-dome paint-trumpet mushroom-paint mushroom-tints draw-mushroom mushroom-tap door-reach window-reach door-tap window-glow windows-lit icon-genes mushroom-frame mushroom-selection mushroom-light',
  'entities/worm': 'worm draw-worm',
  'entities/mouse': 'mouse-run-clock mouse-run-course draw-mouse mouse-head',
  'entities/insect':
    'insect-genes bee-genes buzz-genes fly-genes bee-outline insect-outline proboscis flight flight-frame flight-habits flight-in flight-timing insect-paths insect-steering insect-dart insect-motion insect-light buzz-rest draw-insect draw-bee draw-buzz draw-fly insect-look insect-shadow insect-voices insect-tap insect-drawn insect-frame insect-seat insect-shown insect-away insect-sink widest-spans',
  'entities/flower':
    'flower-genes flower-sounds notes draw-flower flower-tints flower-ring',
  'entities/firefly': 'firefly firefly-view firefly-tap',
  'entities/sky':
    'dusk weather sun-layout moon-view moon-face paint-moon paint-sky paint-backdrop backdrop-tones backdrop-depths dusk-sky dusk-stars star-images dusk-view dusk-voice rain-drops rain-fall rain-sky rain-view rain-voice cloud-puffs panorama skyline twin-fade',
  'entities/lawn': 'lawn tufts mottles grain brow far-band grass paint-land',
  'features/plant-flower': 'tuft-tap tending flower-icons',
  'features/sow-spores':
    'sprouting spore-seats spore-sight spore-bed spore-drift spores',
  'features/grow-mushroom': 'mushroom-room placement crowding standing-weighed',
  'features/furnish-house': 'furnishing door-sight door-seats',
  'features/worm-peeks': 'house-worm worm-way',
  'features/mice-run':
    'mouse-run night-runs mouse-door mouse-runs runner-shown run-front',
  'features/insects-perch':
    'perch-room perch-sight perch-hosts perch-crowding flower-seat air-spots perches insects',
  'features/bee-pollinates': 'pollen flower-sight',
  'features/insects-shelter': 'shelter shelter-seats shelter-cover roost',
  'features/flowers-close': 'flower-closing',
  'features/play-flowers':
    'instrument instrument-input instrument-voices keyboard keyed-flowers chord-fingers flower-touch flower-hold',
  'features/walk-meadow': 'eye-input gait-icon gait-spot footsteps',
  'features/keep-meadow':
    'keeping kept-record flier-rest meadow-number fake-store keeper meadow-store open-kept meadow-keeping',
  'pages/mushrooms': 'mushrooms-page meadow-canvas mushrooms-metadata index',
};

export const NOUNS = new Map<string, string>();
for (const [slice, stems] of Object.entries(TREE))
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
