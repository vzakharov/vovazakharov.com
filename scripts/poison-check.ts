#!/usr/bin/env node

/**
 * The barrels' runtime axes, held across a whole import chain rather than one
 * import at a time, run from the repository root:
 *
 *   pnpm check:poison
 *
 * - **client** roots — every `'use client'` file under `src/` and the routers —
 *   may reach no module that imports `server-only`, nor an
 *   `index.no-browser.ts` barrel;
 * - **script** roots — the entries under `src/*\/scripts/` and `scripts/` (a
 *   file no other script imports, or a test) — may reach no `server-only`
 *   module, which throws outside a React server bundle. An entry `package.json`
 *   runs under `--conditions=react-server` is exempt, that condition resolving
 *   `server-only` to its empty module.
 *
 * The walk is breadth-first, so each chain reported is a shortest one, and
 * chains are grouped by their last hop before the poison, the import to fix.
 * Type-only imports are erased and never followed. Ported from
 * `playgramai/playgramapp`'s `scripts/poison-check.ts`. Reads everything under
 * the working directory, so a test runs it against a tree of its own. See
 * .claude/rules/masd.md.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { z } from 'zod';

import { TEST_FILE } from '../eslint/masd-graph.ts';
import {
  appFiles,
  resolveImport,
  sourceFile,
  subdirectories,
  walk,
} from './lib/import-graph.ts';

const ROOT_KINDS = ['client', 'script'] as const;
type RootKind = (typeof ROOT_KINDS)[number];

type Parsed = { directives: string[]; serverOnly: boolean; imports: string[] };

const parsed = new Map<string, Parsed>();

/** The file's directive prologue, whether it imports `server-only`, and the files its value imports load. */
function parse(file: string): Parsed {
  const cached = parsed.get(file);
  if (cached !== undefined) return cached;
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const directives: string[] = [];
  for (const statement of source.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    ) {
      break;
    }
    directives.push(statement.expression.text);
  }
  const specifiers: string[] = [];
  for (const statement of source.statements) {
    const value = ts.isImportDeclaration(statement)
      ? statement.importClause?.isTypeOnly !== true
      : ts.isExportDeclaration(statement) && !statement.isTypeOnly;
    const specifier =
      ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)
        ? statement.moduleSpecifier
        : undefined;
    if (value && specifier !== undefined && ts.isStringLiteral(specifier)) {
      specifiers.push(specifier.text);
    }
  }
  const findDynamic = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [argument] = node.arguments;
      if (argument !== undefined && ts.isStringLiteralLike(argument)) {
        specifiers.push(argument.text);
      }
    }
    ts.forEachChild(node, findDynamic);
  };
  findDynamic(source);

  const imports = new Set<string>();
  for (const specifier of specifiers) {
    const resolved = resolveImport(file, specifier);
    const imported = resolved === undefined ? undefined : sourceFile(resolved);
    if (imported !== undefined && imported !== file) imports.add(imported);
  }
  const result = {
    directives,
    serverOnly: specifiers.includes('server-only'),
    imports: [...imports],
  };
  parsed.set(file, result);
  return result;
}

const POISONED: Record<RootKind, (file: string) => boolean> = {
  client: (file) =>
    parse(file).serverOnly || path.basename(file) === 'index.no-browser.ts',
  script: (file) => parse(file).serverOnly,
};

/** Root → … → the first poisoned file it reaches, by a shortest chain. */
function poisonChain(root: string, kind: RootKind): string[] | undefined {
  const parent = new Map<string, string>([[root, root]]);
  // Appending while iterating is what makes this breadth-first.
  const queue = [root];
  for (const current of queue) {
    if (current !== root && POISONED[kind](current)) {
      const chain = [current];
      for (let at = current; at !== root; ) {
        at = parent.get(at) ?? root;
        chain.unshift(at);
      }
      return chain;
    }
    for (const imported of parse(current).imports) {
      if (parent.has(imported)) continue;
      parent.set(imported, current);
      queue.push(imported);
    }
  }
  return undefined;
}

const packageJson = z.object({ scripts: z.record(z.string(), z.string()) });

/**
 * The entries `package.json` runs under the `react-server` condition, with
 * `scripts/site-task.sh`'s `{site}` read as any app.
 */
function reactServerEntries(): Set<string> {
  const { scripts } = packageJson.parse(
    JSON.parse(readFileSync('package.json', 'utf8')),
  );
  const apps = subdirectories('src');
  return new Set(
    Object.values(scripts).flatMap((command) =>
      [...command.matchAll(/--conditions[ =]react-server\s+(\S+\.ts)\b/g)]
        .map(([, entry = '']) => entry)
        .flatMap((entry) => apps.map((app) => entry.replaceAll('{site}', app))),
    ),
  );
}

function scriptRoots(): string[] {
  const files = [
    ...walk('scripts'),
    ...subdirectories('src').flatMap((app) =>
      subdirectories(path.join('src', app)).includes('scripts')
        ? walk(path.join('src', app, 'scripts'))
        : [],
    ),
  ];
  const imported = new Set(files.flatMap((file) => parse(file).imports));
  const exempt = reactServerEntries();
  return files.filter(
    (file) =>
      (TEST_FILE.test(file) || !imported.has(file)) && !exempt.has(file),
  );
}

function clientRoots(): string[] {
  return appFiles().filter((file) =>
    parse(file).directives.includes('use client'),
  );
}

function check(): string[] {
  // Sorted, so the chain a group reports among equals is the same every run.
  const roots: Record<RootKind, string[]> = {
    client: clientRoots().toSorted(),
    script: scriptRoots().toSorted(),
  };
  // Per kind and last hop: the shortest chain through it, and how many roots
  // reach poison through it.
  const byCulprit = new Map<string, { chain: string[]; count: number }>();
  for (const kind of ROOT_KINDS) {
    for (const root of roots[kind]) {
      const chain = poisonChain(root, kind);
      if (chain === undefined) continue;
      const key = `${kind} ${chain.at(-2) ?? root}`;
      const seen = byCulprit.get(key);
      if (seen === undefined) {
        byCulprit.set(key, { chain, count: 1 });
        continue;
      }
      seen.count++;
      if (chain.length < seen.chain.length) seen.chain = chain;
    }
  }
  return [...byCulprit].map(([key, { chain, count }]) => {
    const kind = key.slice(0, key.indexOf(' '));
    const more = count > 1 ? ` (+${count - 1} more ${kind} roots)` : '';
    return `poison: ${kind} root ${chain.join(' → ')}${more}`;
  });
}

const problems = check();
for (const problem of problems) process.stderr.write(`${problem}\n`);
if (problems.length > 0) process.exitCode = 1;
