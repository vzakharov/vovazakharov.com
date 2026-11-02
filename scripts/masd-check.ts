#!/usr/bin/env node

/**
 * What no single-root checker can see in Multi-App Sliced Design, run from the
 * repository root:
 *
 *   pnpm check:masd
 *
 * - the graph's own checks: `src/masd.json` parses, each parent above its
 *   child, an app per directory under `src/` and a directory per app, and no
 *   app earned no better than an insignificant slice;
 * - Steiger's `insignificant-slice`, with each slice's references counted
 *   across the composition — its own app, every descendant and the routers —
 *   rather than within one app root, its messages kept word for word; a slice
 *   with one reference passes when it is a module by its own app's imports;
 * - the sub-slices' checks, `scripts/lib/sub-slices.ts`.
 *
 * Reads `src/` and `sites/*\/app/` under the working directory, so a test runs
 * it against a tree of its own. See .claude/rules/masd.md.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  directoryMismatches,
  insignificantApps,
  loadGraph,
  type MasdGraph,
  SLICED_LAYERS,
  TEST_FILE,
} from '../eslint/masd-graph.ts';
import { appFiles, subdirectories } from './lib/import-graph.ts';
import { type Edge, importsOf, meeting } from './lib/slice-graph.ts';
import { subSliceProblems } from './lib/sub-slices.ts';

const SLICED = new Set(SLICED_LAYERS);
// The sliced layers Steiger checks; a page has nothing above it to be
// referenced by.
const CHECKED_LAYERS = SLICED_LAYERS.filter((layer) => layer !== 'pages');

const ROOT = process.cwd();

/**
 * Where a file sits: `<app>/<layer>/<slice>` in a sliced layer,
 * `<app>/<layer>` in a segmented one, `router` under a site's `app/`.
 */
function locate(file: string): string | undefined {
  const parts = file.split(path.sep);
  if (parts[0] === 'sites') return parts[2] === 'app' ? 'router' : undefined;
  if (parts[0] !== 'src' || parts.length < 4) return undefined;
  const [, app, layer = '', slice] = parts;
  // An app's scripts and the tests are tooling, not consumers: a slice only
  // they reach is still one nothing shipped needs.
  if (layer === 'scripts' || TEST_FILE.test(file)) return undefined;
  return SLICED.has(layer) ? `${app}/${layer}/${slice}` : `${app}/${layer}`;
}

// Every location under `src/` opens with its app.
const appOfLocation = (location: string): string =>
  location.slice(0, location.indexOf('/'));

/** The app a shipped file under `src/` is part of. */
function appOf(file: string): string | undefined {
  const location = locate(file);
  return location === undefined || location === 'router'
    ? undefined
    : appOfLocation(location);
}

/**
 * Whether a slice holds more of its app's import edges than chance would: its
 * term of Newman's modularity, `e − a²`, is positive — `e` the share of edges
 * with both ends in it, `a` the share of edge ends on it, so `a²` is what a
 * rewiring keeping every file's degree would put inside. `edges` are the
 * slice's own app's alone, as masd.md states.
 */
function modular(slice: string, edges: readonly Edge[]): boolean {
  const prefix = path.join('src', slice) + path.sep;
  const { crossing, ends } = meeting((file) => file.startsWith(prefix), edges);
  // `inside / m > (ends / 2m)²` with `inside = (ends − crossing) / 2`,
  // multiplied through by `4m`.
  return 2 * edges.length * (ends - crossing) > ends ** 2;
}

function graphProblems(graph: MasdGraph, mounted: ReadonlySet<string>) {
  return [
    ...directoryMismatches(graph, subdirectories('src')),
    ...insignificantApps(graph, mounted).map(
      (app) =>
        `masd: ${app} has one child and nothing a router mounts; fold it into its child`,
    ),
  ];
}

function sliceProblems(
  references: ReadonlyMap<string, ReadonlySet<string>>,
  edges: ReadonlyMap<string, readonly Edge[]>,
) {
  return [...references].flatMap(([slice, sources]) => {
    const [reference, ...others] = sources;
    if (reference === undefined) {
      return [
        `src/${slice}: This slice has no references. Consider removing it.`,
      ];
    }
    if (
      others.length > 0 ||
      reference === 'router' ||
      modular(slice, edges.get(appOfLocation(slice)) ?? [])
    ) {
      return [];
    }
    const [, layer, sourceSlice] = reference.split('/');
    if (sourceSlice !== undefined) {
      return [
        `src/${slice}: This slice has only one reference in slice "${layer}/${sourceSlice}". Consider merging them.`,
      ];
    }
    return layer === 'app'
      ? []
      : [
          `src/${slice}: This slice has only one reference on layer "${layer}". Consider moving this code to "${layer}".`,
        ];
  });
}

function check(): string[] {
  let graph: MasdGraph;
  try {
    graph = loadGraph(path.join(ROOT, 'src', 'masd.json'));
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }

  const references = new Map<string, Set<string>>();
  for (const app of graph.keys()) {
    for (const layer of CHECKED_LAYERS) {
      const directory = path.join('src', app, layer);
      if (!existsSync(directory)) continue;
      for (const slice of subdirectories(directory)) {
        references.set(`${app}/${layer}/${slice}`, new Set());
      }
    }
  }

  const mounted = new Set<string>();
  const edges = new Map(
    [...graph.keys()].map((app): [string, Edge[]] => [app, []]),
  );
  const files = appFiles();
  for (const [file, imported] of importsOf(files)) {
    const source = locate(file);
    if (source === undefined) continue;
    const app = appOf(file);
    for (const target of imported) {
      if (app !== undefined && appOf(target) === app) {
        edges.get(app)?.push([file, target]);
      }
      const location = locate(target);
      if (location === undefined || location === source) continue;
      if (source === 'router') mounted.add(appOfLocation(location));
      references.get(location)?.add(source);
    }
  }

  return [
    ...graphProblems(graph, mounted),
    ...sliceProblems(references, edges),
    ...subSliceProblems([...graph.keys()], files),
  ];
}

const problems = check();
for (const problem of problems) process.stderr.write(`${problem}\n`);
if (problems.length > 0) process.exitCode = 1;
