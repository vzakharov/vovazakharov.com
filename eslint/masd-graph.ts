/**
 * The app graph of Multi-App Sliced Design — `src/masd.json`, each app naming
 * its parents — and the questions every reader of it asks. The only loader of
 * that file: the boundaries config, the import sort, `lint:fsd`'s per-app runs
 * and `scripts/masd-check.ts` all go through it. See .claude/rules/masd.md.
 *
 * Imports relatively, because ESLint loads it under jiti, which follows no
 * path alias.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

/** FSD's sliced layers, highest first; `app` and `shared` are segmented. */
export const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];

/** FSD's layers, highest first. */
export const LAYERS = ['app', ...SLICED_LAYERS, 'shared'];

/**
 * The segments every place orders the same way, highest first: a segment
 * reaches only those below it. `shape` is MASD's own, for what `api` needs of
 * `model`.
 */
export const STANDARD_SEGMENTS = [
  'ui',
  'model',
  'api',
  'shape',
  'config',
  'lib',
];

/** Where a place declares an order of its own, beside its segments. */
export const PLACE_FILE = 'masd.json';

/**
 * A slice's or a segment's entry points. A closed list, so any other
 * `index.*.ts` is still reaching into internals.
 */
export const PUBLIC_API = [
  'index.ts',
  'index.server-only.ts',
  'index.node-safe.ts',
  'index.no-browser.ts',
];

/** The entry point only test code may take, beside the public API. */
export const TEST_API = 'index.test-only.ts';

/** What several tests of a slice share, imported by test code alone. */
export const TEST_KIT = '**/*.test-kit.ts';

/** Test code: the tests, and the kits they share. */
export const TEST_CODE = ['**/*.test.ts', TEST_KIT];

/** `TEST_CODE`'s files, for a reader matching a path rather than a glob. */
export const TEST_FILE = /\.test(-kit)?\.tsx?$/;

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

/**
 * Where a file under `src/` sits: its place — `<app>/<layer>/<slice>` in a
 * sliced layer, `<app>/<layer>` otherwise, an app's `scripts/` included — and
 * the segment of it, absent for a file at the place's root.
 */
export type Placed = {
  place: string;
  segment?: string;
};

/** Places a path relative to `src/`; `undefined` above any layer. */
export function placeOf(fromSrc: string): Placed | undefined {
  const [app, layer, unit, ...rest] = fromSrc.split(path.sep);
  if (app === undefined || layer === undefined || unit === undefined) {
    return undefined;
  }
  if (SLICED_LAYERS.includes(layer) && rest.length > 0) {
    const [segment, ...inside] = rest;
    return {
      place: path.join(app, layer, unit),
      ...(inside.length > 0 && { segment }),
    };
  }
  return {
    place: path.join(app, layer),
    ...(rest.length > 0 && { segment: unit }),
  };
}

const placeFileSchema = z.strictObject({
  segments: z.array(z.string().min(1)).min(1),
});

/**
 * A place's segment order, highest first: its `masd.json`'s, or the standard
 * one. Fails on a file that names a segment twice, reorders the standard ones,
 * names a segment the place lacks or only standard ones, and on a place with a
 * segment its order leaves out.
 */
export function segmentOrder(placeDir: string): readonly string[] {
  const present = readdirSync(placeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const file = path.join(placeDir, PLACE_FILE);
  const order = existsSync(file)
    ? placeFileSchema.parse(JSON.parse(readFileSync(file, 'utf8'))).segments
    : STANDARD_SEGMENTS;
  const fail = (problem: string): never => {
    throw new Error(`masd: ${placeDir}: ${problem}`);
  };

  if (order !== STANDARD_SEGMENTS) {
    if (new Set(order).size !== order.length) {
      fail(`${PLACE_FILE} names a segment twice`);
    }
    const standard = order.filter((segment) =>
      STANDARD_SEGMENTS.includes(segment),
    );
    if (standard.length === order.length) {
      fail(`${PLACE_FILE} names only standard segments; delete it`);
    }
    if (
      standard.some(
        (segment, i) =>
          i > 0 &&
          STANDARD_SEGMENTS.indexOf(segment) <
            STANDARD_SEGMENTS.indexOf(standard[i - 1] ?? ''),
      )
    ) {
      fail(
        `${PLACE_FILE} reorders the standard segments, ${STANDARD_SEGMENTS.join(' → ')}`,
      );
    }
    const ghost = order.find((segment) => !present.includes(segment));
    if (ghost !== undefined)
      fail(`${PLACE_FILE} names ${ghost}, which is no segment here`);
  }
  const missing = present.find((segment) => !order.includes(segment));
  if (missing !== undefined) {
    fail(
      `segment ${missing} is outside the order ${order.join(' → ')}; declare the place's order in ${PLACE_FILE}`,
    );
  }
  return order;
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
