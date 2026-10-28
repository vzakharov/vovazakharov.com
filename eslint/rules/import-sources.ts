import type { Rule } from 'eslint';
import type * as ESTree from 'estree';
import path from 'node:path';

/**
 * Visits every specifier a file imports, re-exports or imports dynamically,
 * with the absolute path it resolves to — a relative one against the file, an
 * `@/` one against `src/` — or `undefined` for a package.
 */
export function onImports(
  context: Rule.RuleContext,
  visit: (
    source: ESTree.Literal,
    specifier: string,
    resolved: string | undefined,
  ) => void,
): Rule.RuleListener {
  const src = path.join(context.cwd, 'src');

  function check(source: ESTree.Node | null | undefined): void {
    if (source?.type !== 'Literal' || typeof source.value !== 'string') return;
    const specifier = source.value;
    const resolved = specifier.startsWith('.')
      ? path.resolve(path.dirname(context.filename), specifier)
      : specifier.startsWith('@/')
        ? path.join(src, specifier.slice(2))
        : undefined;
    visit(source, specifier, resolved);
  }

  return {
    ImportDeclaration(node) {
      check(node.source);
    },
    ExportNamedDeclaration(node) {
      check(node.source);
    },
    ExportAllDeclaration(node) {
      check(node.source);
    },
    ImportExpression(node) {
      check(node.source);
    },
  };
}
