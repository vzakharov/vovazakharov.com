/**
 * Every `.wgsl` module under `src/`, its imports resolved and checked by
 * `checks.ts`. A module may import a piece still written in TypeScript — a
 * `.ts` file exporting one `wgsl(...)` piece — so the two kinds live side by
 * side while the move is under way.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { MasdGraph } from '../../../eslint/masd-graph.ts';
import {
  checkImport,
  type Linked,
  messageOf,
  type Target,
  unimported,
} from './checks.ts';
import { declaredIn, type Import, type Module, parseModule } from './module.ts';

const isPiece = (value: unknown): value is { listing: string } =>
  typeof value === 'object' &&
  value !== null &&
  'listing' in value &&
  typeof value.listing === 'string' &&
  'needs' in value;

/**
 * A module's export: `lib/hash` → `HASH`; a floor's, in its `config`
 * segment, `config/bathroom` → `BATHROOM_SHADER`, the bare name being its
 * theme's.
 */
export function exportName(file: string): string {
  const stem = path.basename(file, path.extname(file));
  const name = stem.replaceAll('-', '_').toUpperCase();
  const floor = path.basename(path.dirname(file)) === 'config';
  return floor ? `${name}_SHADER` : name;
}

/** The generated TypeScript module beside a `.wgsl` file. */
export const generatedOf = (file: string): string =>
  file.replace(/\.wgsl$/, '.shader.ts');

async function tsPiece(file: string): Promise<Target> {
  const loaded: unknown = await import(pathToFileURL(path.resolve(file)).href);
  const pieces = Object.entries(loaded ?? {}).filter(
    (entry): entry is [string, { listing: string }] => isPiece(entry[1]),
  );
  const [piece] = pieces;
  if (pieces.length !== 1 || piece === undefined) {
    throw new Error(`${file} exports ${String(pieces.length)} pieces, not one`);
  }
  const [name, { listing }] = piece;
  return {
    file,
    module: file.replace(/\.ts$/, ''),
    name,
    declares: declaredIn(listing),
  };
}

async function targetOf(
  file: string,
  own: Module | undefined,
): Promise<Target> {
  if (own === undefined) return tsPiece(file);
  const { declares } = own;
  return {
    file,
    module: generatedOf(file).replace(/\.ts$/, ''),
    name: exportName(file),
    declares,
  };
}

/**
 * The file an import names: `package` is `src/`, each `super` a step up, and
 * `_` in a name the `-` of a kebab-case file, which no WGSL name can hold.
 */
function resolveFile(from: string, found: Import): string {
  const up = Array.from({ length: (found.supers ?? 1) - 1 }, () => '..');
  const base = found.supers === undefined ? 'src' : path.dirname(from);
  const names = found.path.map((name) => name.replaceAll('_', '-'));
  const stem = path.join(base, ...up, ...names);
  const file = ['.wgsl', '.ts']
    .map((extension) => stem + extension)
    .find((candidate) => fs.existsSync(candidate));
  if (file === undefined) {
    throw new Error(
      `${from}:${String(found.line)}: no module ${found.path.join('::')}`,
    );
  }
  return file;
}

/** Each file's links, and every problem found across them. */
export async function linkAll(
  graph: MasdGraph,
  files: readonly string[],
): Promise<{ linked: Linked[]; errors: string[] }> {
  const errors: string[] = [];
  const modules = new Map(
    files.map((file) => [file, parseModule(fs.readFileSync(file, 'utf8'))]),
  );
  const resolved = new Map<Import, string>();
  for (const [file, { imports }] of modules) {
    for (const found of imports) {
      try {
        resolved.set(found, resolveFile(file, found));
      } catch (error) {
        errors.push(messageOf(error));
      }
    }
  }
  const targets = new Map(
    await Promise.all(
      [...new Set(resolved.values())].map(
        async (file) =>
          [file, await targetOf(file, modules.get(file))] as const,
      ),
    ),
  );

  const linked = [...modules].map(([file, module]): Linked => {
    const links = module.imports.flatMap((found) => {
      const target = targets.get(resolved.get(found) ?? '');
      if (target === undefined) return [];
      const checked = checkImport(graph, file, { module, found, target });
      errors.push(...checked.errors);
      return [checked.link];
    });
    return { file, module, links };
  });

  errors.push(...unimported(linked, [...targets.values()]));
  return { linked, errors };
}
