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
 *   with one reference passes when its public API is narrow.
 *
 * Reads `src/` and `sites/*\/app/` under the working directory, so a test runs
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
  PUBLIC_API,
  SLICED_LAYERS,
} from '../eslint/masd-graph.ts';

const SLICED = new Set(SLICED_LAYERS);
// The sliced layers Steiger checks; a page has nothing above it to be
// referenced by.
const CHECKED_LAYERS = SLICED_LAYERS.filter((layer) => layer !== 'pages');

// The most of a slice's exported names its barrels may hand on for it to be a
// module whoever its one consumer is: it hides the rest. The repo's slices
// built as modules — the player, the CV page — sit at a fifth or under, and a
// grab bag re-exporting everything at all of it.
const NARROW_API = 1 / 3;

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
  if (parts[0] === 'sites') return parts[2] === 'app' ? 'router' : undefined;
  if (parts[0] !== 'src' || parts.length < 4) return undefined;
  const [, app, layer = '', slice] = parts;
  // An app's scripts are tooling, not consumers: a slice only they reach is
  // still one nothing shipped needs.
  if (layer === 'scripts') return undefined;
  return SLICED.has(layer) ? `${app}/${layer}/${slice}` : `${app}/${layer}`;
}

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

const isExported = (statement: ts.Statement): boolean =>
  ts.canHaveModifiers(statement) &&
  (ts.getModifiers(statement) ?? []).some(
    ({ kind }) => kind === ts.SyntaxKind.ExportKeyword,
  );

/**
 * The names a file exports — through an `export *` of a relative module too,
 * when `following`, which is how a barrel hands on a whole file.
 */
function exportedNames(file: string, following: boolean): Set<string> {
  const names = new Set<string>();
  const { statements } = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  for (const statement of statements) {
    if (ts.isExportDeclaration(statement)) {
      const { exportClause, moduleSpecifier } = statement;
      if (exportClause !== undefined && ts.isNamedExports(exportClause)) {
        for (const { name } of exportClause.elements) names.add(name.text);
      } else if (
        following &&
        moduleSpecifier !== undefined &&
        ts.isStringLiteral(moduleSpecifier)
      ) {
        const resolved = resolveImport(file, moduleSpecifier.text);
        const target =
          resolved === undefined ? undefined : sourceFile(resolved);
        if (target !== undefined) {
          for (const name of exportedNames(target, true)) names.add(name);
        }
      }
    } else if (ts.isExportAssignment(statement)) {
      names.add('default');
    } else if (isExported(statement)) {
      if (ts.isVariableStatement(statement)) {
        for (const { name } of statement.declarationList.declarations) {
          if (ts.isIdentifier(name)) names.add(name.text);
        }
      } else if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement) ||
          ts.isEnumDeclaration(statement)) &&
        statement.name !== undefined
      ) {
        names.add(statement.name.text);
      }
    }
  }
  return names;
}

/** Whether a slice's barrels hand on at most `NARROW_API` of what its files export. */
function narrowApi(slice: string): boolean {
  const directory = path.join('src', slice);
  const barrels = new Set(PUBLIC_API.map((name) => path.join(directory, name)));
  const handedOn = new Set(
    [...barrels]
      .filter((barrel) => existsSync(barrel))
      .flatMap((barrel) => [...exportedNames(barrel, true)]),
  );
  const defined = walk(directory)
    .filter((file) => !barrels.has(file))
    .flatMap((file) =>
      [...exportedNames(file, false)].map((name) => `${file}#${name}`),
    );
  return defined.length > 0 && handedOn.size <= defined.length * NARROW_API;
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
    if (others.length > 0 || reference === 'router' || narrowApi(slice)) {
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
