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
 * - each place's segment order, which `vova/segment-order` loads only for a
 *   place it lints a file of, and no module under a layer that no linter reads;
 * - Steiger's `insignificant-slice`, with each slice's references counted
 *   across the composition — its own app, every descendant and the routers —
 *   rather than within one app root, its messages kept word for word; a slice
 *   with one reference passes when it is a module by its own app's imports.
 *
 * Reads `src/` and `sites/*\/app/` under the working directory, so a test runs
 * it against a tree of its own. See .claude/rules/masd.md.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  directoryMismatches,
  insignificantApps,
  LAYERS,
  loadGraph,
  type MasdGraph,
  segmentOrder,
  SLICED_LAYERS,
  TEST_FILE,
} from '../eslint/masd-graph.ts';

const SLICED = new Set(SLICED_LAYERS);
// The sliced layers Steiger checks; a page has nothing above it to be
// referenced by.
const CHECKED_LAYERS = SLICED_LAYERS.filter((layer) => layer !== 'pages');

const ROOT = process.cwd();
const SOURCE = /\.tsx?$/;

/** An importing file and the file it imports, both in one app. */
type Edge = readonly [string, string];

const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && SOURCE.test(entry.name))
    .map((entry) =>
      path.relative(ROOT, path.join(entry.parentPath, entry.name)),
    );

const subdirectories = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

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

function resolveImport(from: string, specifier: string): string | undefined {
  if (specifier.startsWith('@/')) return path.join('src', specifier.slice(2));
  if (specifier.startsWith('.')) {
    return path.join(path.dirname(from), specifier);
  }
  return undefined;
}

function sourceFile(base: string): string | undefined {
  const stem = base.replace(SOURCE, '');
  return [base, `${stem}.ts`, `${stem}.tsx`, path.join(stem, 'index.ts')].find(
    (candidate) => SOURCE.test(candidate) && existsSync(candidate),
  );
}

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
  let inside = 0;
  let ends = 0;
  for (const [from, to] of edges) {
    const both = [from, to].filter((file) => file.startsWith(prefix)).length;
    if (both === 2) inside++;
    ends += both;
  }
  // `inside / m > (ends / 2m)²`, multiplied through by `m`.
  return inside > ends ** 2 / (4 * edges.length);
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

// `boundaries` and `vova/segment-order` lint `.ts` and `.tsx` alone, so a
// module of any other kind under a layer would escape both.
const UNLINTED = /\.(js|jsx|mjs|cjs|mts|cts)$/;

/** Every segment order an app's places declare or default to, as problems. */
function placeProblems(graph: MasdGraph): string[] {
  return [...graph.keys()].flatMap((app) =>
    LAYERS.flatMap((layer) => {
      const directory = path.join('src', app, layer);
      if (!existsSync(directory)) return [];
      const places = SLICED.has(layer)
        ? subdirectories(directory).map((slice) => path.join(directory, slice))
        : [directory];
      const scripts = readdirSync(directory, {
        recursive: true,
        encoding: 'utf8',
      })
        .filter((file) => UNLINTED.test(file))
        .map(
          (file) =>
            `masd: ${path.join(directory, file)} is no .ts or .tsx, so no linter reads its imports`,
        );
      return [
        ...scripts,
        ...places.flatMap((place) => {
          try {
            segmentOrder(place);
            return [];
          } catch (error) {
            return [error instanceof Error ? error.message : String(error)];
          }
        }),
      ];
    }),
  );
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
  const edges = new Map<string, Edge[]>();
  const files = [
    ...walk('src'),
    ...subdirectories('sites').flatMap((site) =>
      walk(path.join('sites', site, 'app')),
    ),
  ];
  for (const file of files) {
    const source = locate(file);
    if (source === undefined) continue;
    const { importedFiles } = ts.preProcessFile(
      readFileSync(file, 'utf8'),
      true,
      true,
    );
    const app = appOf(file);
    const linked = new Set<string>();
    for (const { fileName } of importedFiles) {
      const resolved = resolveImport(file, fileName);
      if (resolved === undefined) continue;
      const imported = sourceFile(resolved);
      if (
        app !== undefined &&
        imported !== undefined &&
        imported !== file &&
        appOf(imported) === app
      ) {
        linked.add(imported);
      }
      const target = locate(resolved);
      if (target === undefined || target === source) continue;
      if (source === 'router') mounted.add(appOfLocation(target));
      references.get(target)?.add(source);
    }
    if (app !== undefined) {
      const own = edges.get(app) ?? [];
      own.push(...[...linked].map((imported): Edge => [file, imported]));
      edges.set(app, own);
    }
  }

  return [
    ...graphProblems(graph, mounted),
    ...placeProblems(graph),
    ...sliceProblems(references, edges),
  ];
}

const problems = check();
for (const problem of problems) process.stderr.write(`${problem}\n`);
if (problems.length > 0) process.exitCode = 1;
