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
 *   rather than within one app root, its messages kept word for word.
 *
 * Reads `src/` and `apps/*\/app/` under the working directory, so a test runs
 * it against a tree of its own. Bare Node runs this file, relying on its type
 * stripping. See .claude/rules/masd.md.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  directoryMismatches,
  insignificantApps,
  loadGraph,
  type MasdGraph,
  SLICED_LAYERS,
} from '../eslint/masd-graph.ts';

const SLICED = new Set(SLICED_LAYERS);
// The sliced layers Steiger checks; a page has nothing above it to be
// referenced by.
const CHECKED_LAYERS = SLICED_LAYERS.filter((layer) => layer !== 'pages');

const ROOT = process.cwd();
const SOURCE = /\.tsx?$/;

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
  if (parts[0] === 'apps') return parts[2] === 'app' ? 'router' : undefined;
  if (parts[0] !== 'src' || parts.length < 4) return undefined;
  const [, app, layer = '', slice] = parts;
  return SLICED.has(layer)
    ? `${app}/${layer}/${slice}`
    : `${app}/${layer}`;
}

function resolveImport(from: string, specifier: string): string | undefined {
  if (specifier.startsWith('@/')) return path.join('src', specifier.slice(2));
  if (specifier.startsWith('.')) {
    return path.join(path.dirname(from), specifier);
  }
  return undefined;
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

function sliceProblems(references: ReadonlyMap<string, ReadonlySet<string>>) {
  return [...references].flatMap(([slice, sources]) => {
    const [reference, ...others] = sources;
    if (reference === undefined) {
      return [
        `src/${slice}: This slice has no references. Consider removing it.`,
      ];
    }
    if (others.length > 0 || reference === 'router') return [];
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
  const files = [
    ...walk('src'),
    ...subdirectories('apps').flatMap((site) =>
      walk(path.join('apps', site, 'app')),
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
    for (const { fileName } of importedFiles) {
      const resolved = resolveImport(file, fileName);
      const target = resolved === undefined ? undefined : locate(resolved);
      if (target === undefined || target === source) continue;
      // Every location under `src/` opens with its app.
      if (source === 'router')
        mounted.add(target.slice(0, target.indexOf('/')));
      references.get(target)?.add(source);
    }
  }

  return [...graphProblems(graph, mounted), ...sliceProblems(references)];
}

const problems = check();
for (const problem of problems) process.stderr.write(`${problem}\n`);
if (problems.length > 0) process.exitCode = 1;
