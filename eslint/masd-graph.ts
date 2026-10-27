/**
 * The app graph of Multi-App Sliced Design — `src/masd.json`, each app naming
 * its parents — and the questions every reader of it asks. The only loader of
 * that file: the boundaries config, the import sort, `lint:fsd`'s per-app runs
 * and `scripts/masd-check.ts` all go through it. See .claude/rules/masd.md.
 *
 * Imports relatively and spells its extensions, because ESLint loads it under
 * jiti and `scripts/` under bare Node.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

/** FSD's sliced layers, highest first; `app` and `shared` are segmented. */
export const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];

/** FSD's layers, highest first. */
export const LAYERS = ['app', ...SLICED_LAYERS, 'shared'];

/**
 * A slice's or a segment's entry points. A closed list, so any other
 * `index.*.ts` is still reaching into internals.
 */
export const PUBLIC_API = [
  'index.ts',
  'index.server-only.ts',
  'index.node-safe.ts',
];

/** The entry point only test code may take, beside the public API. */
export const TEST_API = 'index.test-only.ts';

/** What several tests of a slice share, imported by test code alone. */
export const TEST_KIT = '**/*.test-kit.ts';

/** Test code: the tests, and the kits they share. */
export const TEST_CODE = ['**/*.test.ts', TEST_KIT];

const GRAPH_FILE = path.resolve(import.meta.dirname, '..', 'src', 'masd.json');

// Kebab-case also keeps every key non-numeric, which is what makes JS hand the
// keys back in the order they were written.
const appName = z
  .string()
  .regex(/^[a-z][\da-z-]*$/, 'an app name is kebab-case');

const graphSchema = z.record(appName, z.array(appName));

/** App → its parents, in the order the file declares the apps. */
export type MasdGraph = ReadonlyMap<string, readonly string[]>;

/**
 * Validates a parsed graph. A parent declared above its child is the whole of
 * the acyclicity check: a cycle needs some app whose parent comes after it.
 */
export function parseGraph(raw: unknown): MasdGraph {
  const graph = new Map(Object.entries(graphSchema.parse(raw)));
  const seen = new Set<string>();
  for (const [app, parents] of graph) {
    for (const parent of parents) {
      if (!graph.has(parent)) {
        throw new Error(`masd: ${app} names ${parent}, which is no app`);
      }
      if (!seen.has(parent)) {
        throw new Error(
          `masd: ${app} is declared above its parent ${parent}; a parent comes first`,
        );
      }
    }
    if (new Set(parents).size !== parents.length) {
      throw new Error(`masd: ${app} names a parent twice`);
    }
    seen.add(app);
  }
  return graph;
}

export function loadGraph(file: string = GRAPH_FILE): MasdGraph {
  return parseGraph(JSON.parse(readFileSync(file, 'utf8')));
}

/** Every app `app` inherits from, transitively; `app` itself excluded. */
export function ancestors(graph: MasdGraph, app: string): ReadonlySet<string> {
  const found = new Set<string>();
  const pending = [...(graph.get(app) ?? [])];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    if (found.has(next)) continue;
    found.add(next);
    pending.push(...(graph.get(next) ?? []));
  }
  return found;
}

/** Every app inheriting from `app`, transitively; `app` itself excluded. */
export function descendants(
  graph: MasdGraph,
  app: string,
): ReadonlySet<string> {
  return new Set(
    [...graph.keys()].filter((other) => ancestors(graph, other).has(app)),
  );
}

/**
 * Apps earned no better than an insignificant slice: exactly one child, and
 * nothing of their own mounted by a router.
 */
export function insignificantApps(
  graph: MasdGraph,
  mounted: ReadonlySet<string>,
): string[] {
  return [...graph.keys()].filter(
    (app) =>
      !mounted.has(app) &&
      [...graph.values()].filter((parents) => parents.includes(app)).length ===
        1,
  );
}

/** The apps the graph and `src/`'s directories disagree on, as messages. */
export function directoryMismatches(
  graph: MasdGraph,
  directories: readonly string[],
): string[] {
  return [
    ...[...graph.keys()]
      .filter((app) => !directories.includes(app))
      .map((app) => `masd: ${app} is in the graph but has no directory`),
    ...directories
      .filter((directory) => !graph.has(directory))
      .map((directory) => `masd: src/${directory} is not in the graph`),
  ];
}
