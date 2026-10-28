import type { Rule } from 'eslint';
import type * as ESTree from 'estree';
import path from 'node:path';

/**
 * Visits every relative specifier a file imports, re-exports or imports
 * dynamically, with the absolute path it resolves to.
 */
export function onRelativeImports(
  context: Rule.RuleContext,
  visit: (source: ESTree.Literal, resolved: string) => void,
): Rule.RuleListener {
  function check(source: ESTree.Node | null | undefined): void {
    if (
      source?.type !== 'Literal' ||
      typeof source.value !== 'string' ||
      !source.value.startsWith('.')
    ) {
      return;
    }
    visit(source, path.resolve(path.dirname(context.filename), source.value));
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
