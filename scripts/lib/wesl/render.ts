/**
 * The TypeScript module written beside a `.wgsl` file: its body as one
 * `wgsl(...)` piece, needing each module it imports, each entered the way a
 * TypeScript import would be — directly within its unit, by the barrel from
 * outside it — and formatted as Prettier would, so `pnpm format:check` and
 * the import sort pass it as written.
 */

import path from 'node:path';
import * as prettier from 'prettier';

import type { MasdGraph } from '../../../eslint/masd-graph.ts';
import { type Linked, type Named, throughBarrel } from './checks.ts';
import { exportName, generatedOf } from './link.ts';
import { placeImport } from './placement.ts';

/** What every generated module builds its piece with. */
const FACTORY: Named = {
  file: 'src/cube/entities/theme/kit/lib/wgsl.ts',
  module: 'src/cube/entities/theme/kit/lib/wgsl',
  name: 'wgsl',
};

const specifierOf = (from: string, to: string): string => {
  const relative = path.relative(path.dirname(from), to);
  return relative.startsWith('.') ? relative : `./${relative}`;
};

const ups = (specifier: string): number =>
  specifier.split('/').filter((part) => part === '..').length;

/** `../../` before `../` before `./`, as simple-import-sort orders them. */
const importOrder = (a: string, b: string): number =>
  ups(b) - ups(a) || a.localeCompare(b);

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
  const head = (): string =>
    [...imports]
      .toSorted(([a], [b]) => importOrder(a, b))
      .map(([specifier, names]) => {
        const list = [...names].toSorted((a, b) => a.localeCompare(b));
        return `import { ${list.join(', ')} } from '${specifier}';`;
      })
      .join('\n');
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
