import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { z } from 'zod';

const manifestSchema = z.object({
  scripts: z.record(z.string(), z.string()).default({}),
});

/** `node <file>.ts` in a script's command line: Node strips the types itself. */
const NODE_ENTRY = /\bnode\s+([\w./-]+\.ts)\b/g;

/**
 * The specifiers a file loads at run time. Type stripping erases a statement
 * only when the statement itself is `import type` or `export type`; an inline
 * `import { type X }` survives as `import {}` and still loads its module.
 */
function loadedSpecifiers(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isImportDeclaration(node) &&
      node.importClause?.isTypeOnly !== true &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text);
    }
    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] !== undefined &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      found.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/**
 * Every file bare Node runs from a `package.json` script under `root`: each
 * `node <file>.ts` entry and whatever it loads by relative import. Bare Node
 * follows no `@/` alias, so these files reach across `src/` relatively — and a
 * value import by alias in one of them is a crash at run time, which is why the
 * set is derived rather than listed.
 */
function deriveBareNodeFiles(root: string): ReadonlySet<string> {
  const { scripts } = manifestSchema.parse(
    JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')),
  );
  const pending = Object.entries(scripts).flatMap(([name, command]) =>
    [...command.matchAll(NODE_ENTRY)].map(([, entry]) => {
      const file = path.resolve(root, entry!);
      if (!existsSync(file)) {
        throw new Error(
          `bare-node: script "${name}" runs ${entry}, which does not exist`,
        );
      }
      return file;
    }),
  );

  const found = new Set<string>();
  for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
    if (found.has(file) || !existsSync(file)) continue;
    found.add(file);
    for (const specifier of loadedSpecifiers(file)) {
      if (specifier.startsWith('.')) {
        pending.push(path.resolve(path.dirname(file), specifier));
      }
    }
  }
  return found;
}

const byRoot = new Map<string, ReadonlySet<string>>();

/** {@link deriveBareNodeFiles}, once per root for the whole lint run. */
export function bareNodeFiles(root: string): ReadonlySet<string> {
  let files = byRoot.get(root);
  if (files === undefined) {
    files = deriveBareNodeFiles(root);
    byRoot.set(root, files);
  }
  return files;
}
