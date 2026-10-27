import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

import { bareNodeFiles } from '../bare-node';

// The other half of `no-relative-escape`'s exemption: a file bare Node runs
// follows no `@/` alias, so a statement it loads by one throws at run time.
// Type stripping erases only a whole `import type` / `export type` statement,
// so those are the ones left alone.

/** `importKind` / `exportKind`, which typescript-eslint adds to the ESTree node. */
const isTypeOnly = (node: ESTree.Node): boolean =>
  ('importKind' in node && node.importKind === 'type') ||
  ('exportKind' in node && node.exportKind === 'type');

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow a `@/` import that a file bare Node runs loads at run time',
    },
    schema: [],
    messages: {
      alias:
        'Bare Node runs this file and follows no `@/` alias, so `{{specifier}}` fails at run time. Run its `package.json` entry under `tsx` instead of `node`.',
    },
  },

  create(context) {
    if (!bareNodeFiles(context.cwd).has(context.filename)) return {};

    function check(
      node: ESTree.Node,
      source: ESTree.Node | null | undefined,
    ): void {
      if (
        isTypeOnly(node) ||
        source?.type !== 'Literal' ||
        typeof source.value !== 'string' ||
        !source.value.startsWith('@/')
      ) {
        return;
      }
      context.report({
        node: source,
        messageId: 'alias',
        data: { specifier: source.value },
      });
    }

    return {
      ImportDeclaration(node) {
        check(node, node.source);
      },
      ExportNamedDeclaration(node) {
        check(node, node.source);
      },
      ExportAllDeclaration(node) {
        check(node, node.source);
      },
      ImportExpression(node) {
        check(node, node.source);
      },
    };
  },
};

export default rule;
