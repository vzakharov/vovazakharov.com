/**
 * The TypeScript module written beside a `.wgsl` file: its body as one
 * `wgsl(...)` piece, needing each module it imports, each entered the way a
 * TypeScript import would be — directly within its unit, by the barrel from
 * outside it — and formatted as Prettier would, so `pnpm format:check` and
 * the import sort pass it as written.
 */

import path from 'node:path';
import * as prettier from 'prettier';

import { type MasdGraph, SLICED_LAYERS } from '../../../eslint/masd-graph.ts';
import { type Linked, type Named, throughBarrel } from './checks.ts';
import { exportName, generatedOf } from './link.ts';
import { placeImport } from './placement.ts';

/** What every generated module builds its piece with. */
const FACTORY: Named = {
  file: 'src/cube/shared/shader/wgsl.ts',
  module: 'src/cube/shared/shader/wgsl',
  name: 'wgsl',
};

/**
 * The unit a relative import may not leave: a slice, or a segmented layer
 * (`app`, `shared`) whole.
 */
const homeOf = (file: string): string => {
  const [, layer = ''] = path.relative('src', file).split(path.sep);
  const depth = SLICED_LAYERS.includes(layer) ? 4 : 3;
  return file.split(path.sep).slice(0, depth).join(path.sep);
};

/** `to` as `from` imports it: relatively within its home, by `@/` past it. */
const specifierOf = (from: string, to: string): string => {
  if (homeOf(from) !== homeOf(to)) return `@/${path.relative('src', to)}`;
  const relative = path.relative(path.dirname(from), to);
  return relative.startsWith('.') ? relative : `./${relative}`;
};

const ups = (specifier: string): number =>
  specifier.split('/').filter((part) => part === '..').length;

const aliased = (specifier: string): boolean => specifier.startsWith('@/');

const collator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});

/** Punctuation swapped as simple-import-sort swaps it, `.` and `/` first. */
const SWAPPED: Readonly<Record<string, string>> = {
  '.': '_',
  '/': '-',
  _: '.',
  '-': '/',
};

/** `specifier` as simple-import-sort keys it: `./a.b` before `./a-b`. */
const sortKey = (specifier: string): string =>
  specifier.replaceAll(/[./_-]/g, (char) => SWAPPED[char] ?? char);

/** `../../` before `../` before `./`, as simple-import-sort orders them. */
function importOrder(a: string, b: string): number {
  const [x, y] = [sortKey(a), sortKey(b)];
  return (
    ups(b) - ups(a) || collator.compare(x, y) || (x < y ? -1 : Number(x > y))
  );
}

const escaped = (body: string): string =>
  body.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');

function importsOf(graph: MasdGraph, file: string) {
  const imports = new Map<string, Set<string>>();
  const named = (target: Named): string => {
    const { entry } = placeImport(graph, file, target.file, undefined);
    const [specifier, name] =
      entry.barrel === undefined
        ? [specifierOf(file, target.module), target.name]
        : [
            specifierOf(file, entry.barrel),
            throughBarrel(entry.barrel, target.module, target.name),
          ];
    imports.set(specifier, (imports.get(specifier) ?? new Set()).add(name));
    return name;
  };
  const line = ([specifier, names]: [string, Set<string>]): string => {
    const list = [...names].toSorted((a, b) => a.localeCompare(b));
    return `import { ${list.join(', ')} } from '${specifier}';`;
  };
  // Aliased imports are one group, the relative ones the next: every alias
  // here is into the cube's own app, which the sort keeps as one group.
  const head = (): string =>
    [
      [...imports].filter(([specifier]) => aliased(specifier)),
      [...imports].filter(([specifier]) => !aliased(specifier)),
    ]
      .filter((group) => group.length > 0)
      .map((group) =>
        group
          .toSorted(([a], [b]) => importOrder(a, b))
          .map((entry) => line(entry))
          .join('\n'),
      )
      .join('\n\n');
  return { named, head };
}

export async function render(
  graph: MasdGraph,
  { file, module, links }: Linked,
): Promise<string> {
  const { named, head } = importsOf(graph, file);
  const factory = named(FACTORY);
  const needs = [...new Set(links.map(({ target }) => named(target)))];
  const id = path.relative('src', file).replace(/\.wgsl$/, '');
  const source = `// Generated from ${path.basename(file)} by \`pnpm shaders:codegen\`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

${head()}

export const ${exportName(file)} = ${factory}(
  '${id}',
  /* wgsl */ \`
${escaped(module.shipped)}
\`,
  ${needs.join(',\n  ')}
);
`;
  return prettier.format(source, {
    ...(await prettier.resolveConfig(import.meta.filename)),
    filepath: generatedOf(file),
  });
}
