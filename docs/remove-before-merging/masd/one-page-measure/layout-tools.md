# The layout tools of bite 6b

Copy each into `tmp/modularity/` under its name and run from the repository root with `pnpm exec tsx tmp/modularity/<name>`. `layout.ts` reads `mushrooms-tree.md` beside this file.

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

// stem (relative to PAGE, no extension) -> slice, e.g. 'mushrooms/entities/insect'
export const slices = new Map<string, string>();
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
      if (/^[├└]── /.test(line)) layer = heading[1];
      else slice = `${layer}/${heading[1]}`;
      continue;
    }
    if (!slice || !line.includes('│     ')) continue;
    for (const token of line.replace(/│/g, ' ').trim().split(/\s+/)) {
      const rel = token.startsWith('m:')
        ? `model/${token.slice(2)}`
        : token.startsWith('s:')
          ? `ui/scene/${token.slice(2)}`
          : token;
      slices.set(rel, slice);
    }
  }
}
// Decided while untying: one-reference model files join their consumer, what
// two entities share drops to shared/world, and the map stays in the page.
for (const [stem, slice] of [
  ['model/flier-rest', 'features/meadow'],
  ['model/furnishing', 'features/meadow'],
  ['model/flower-genes', 'shared/world'],
  ['model/shelter-seats', 'shared/world'],
  ['model/firefly', 'shared/world'],
] as const)
  slices.set(stem, slice);

const RANK: Record<string, number> = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  pages: 4,
};

export function sliceOf(file: string): string {
  const rel = stemOf(path.relative(PAGE, file));
  const s = slices.get(rel);
  if (s) return s;
  if (rel.startsWith('api/')) return 'features/meadow';
  return 'pages/mushrooms';
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
