/**
 * What the linker holds every import to: it names items its module declares,
 * each one used; each name a file uses from a module it can see is imported;
 * it is placed as `placement.ts` allows; and a unit entered from outside
 * exports the module on its barrel.
 */

import fs from 'node:fs';
import path from 'node:path';

import type { MasdGraph } from '../../../eslint/masd-graph.ts';
import type {
  Named as Exported,
  WithFile,
} from '../../../src/kernel/shared/typings/index.ts';
import type { Declaring, Import, Module } from './module.ts';
import { type Entered, placeImport } from './placement.ts';

/**
 * A piece a generated module imports, and from where: `file` is its
 * repository path, extension included; `module` the TypeScript module a
 * generated import names, extension dropped; `name` what that module exports
 * the piece under.
 */
export type Named = WithFile & Exported & { module: string };

/** A module a `.wgsl` file imports: another `.wgsl`, or a piece in TS. */
export type Target = Named & Declaring;

type Targeted = { target: Target };

type WithModule = { module: Module };

export type Link = Targeted & Entered & { import: Import };

export type Linked = WithFile & WithModule & { links: Link[] };

export const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const BARREL_EXPORT = /export\s*{([^}]*)}\s*from\s*'([^']+)'/g;

/**
 * The name `barrel` re-exports `name` of `module` under, or undefined: from
 * the module itself, or from the barrel of a sub-slice holding it.
 */
function exportedAs(
  barrel: string,
  module: string,
  name: string,
): string | undefined {
  const source = fs.readFileSync(path.join(barrel, 'index.ts'), 'utf8');
  for (const [, list = '', specifier = ''] of source.matchAll(BARREL_EXPORT)) {
    const from = path.join(barrel, specifier);
    const inner =
      module.startsWith(`${from}/`) &&
      fs.existsSync(path.join(from, 'index.ts'));
    if (from !== module && !inner) continue;
    for (const item of list.split(',')) {
      const [own = '', as = own] = item
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/);
      if (own !== name) continue;
      if (from === module || exportedAs(from, module, own) !== undefined) {
        return as;
      }
    }
  }
  return undefined;
}

/**
 * The name `barrel`'s `index.ts` re-exports `name` of `module` under: a
 * module entered from outside its unit has to be on the unit's public API,
 * which may carry it on from a sub-slice's own.
 */
export function throughBarrel(
  barrel: string,
  module: string,
  name: string,
): string {
  const as = exportedAs(barrel, module, name);
  if (as !== undefined) return as;
  throw new Error(`${barrel}/index.ts does not export ${name} from ${module}`);
}

type Resolved = WithModule & Targeted & { found: Import };

/** One import's link, and its problems. */
export function checkImport(
  graph: MasdGraph,
  file: string,
  { module, found, target }: Resolved,
): { link: Link; errors: string[] } {
  const where = `${file}:${String(found.line)}`;
  const { errors, entry } = placeImport(graph, file, target.file, found.supers);
  const problems = errors.map((error) => `${where}: ${error}`);
  try {
    if (entry.barrel !== undefined) {
      throughBarrel(entry.barrel, target.module, target.name);
    }
  } catch (error) {
    problems.push(`${where}: ${messageOf(error)}`);
  }
  for (const item of found.items) {
    if (!target.declares.has(item)) {
      problems.push(`${where}: ${target.file} declares no ${item}`);
    } else if (!module.uses.has(item)) {
      problems.push(`${where}: ${item} is imported and never used`);
    }
  }
  return { link: { import: found, target, entry }, errors: problems };
}

/**
 * Names a module uses that a module someone imports declares, without
 * importing them. A name no imported module declares — a WGSL builtin, or a
 * function the floor or the stage supplies — is left to the GPU compile.
 */
export function unimported(
  linked: readonly Linked[],
  targets: readonly Target[],
): string[] {
  return linked.flatMap(({ file, module, links }) => {
    const imported = new Set(links.flatMap((link) => link.import.items));
    return [...module.uses.keys()].flatMap((name) => {
      if (imported.has(name)) return [];
      const owner = targets.find((target) => target.declares.has(name));
      return owner === undefined || owner.file === file
        ? []
        : [`${file}: uses ${name} from ${owner.file} unimported`];
    });
  });
}
