import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

// Two modules exporting one name collide in the file importing both, and the
// compiler only makes one of the two take an `as`. The other keeps the bare name,
// which then reads as the only one there is — `messages` beside `blogMessages`
// says nothing of whose catalogue it is. So once a name arrives from two modules,
// every import of it is renamed for its source. A default or namespace import is
// named by its importer anyway, so only named imports are read.

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require an `as` on every import of a name that the file imports from more than one module',
    },
    schema: [],
    messages: {
      unaliased:
        '`{{name}}` is imported from {{sources}}: give each import of it an `as` naming whose it is.',
    },
  },

  create(context) {
    return {
      Program(program) {
        // Each imported name's specifiers, by the module they import it from.
        const byName = new Map<string, Map<string, ESTree.ImportSpecifier[]>>();
        for (const statement of program.body) {
          if (statement.type !== 'ImportDeclaration') continue;
          const source = String(statement.source.value);
          for (const specifier of statement.specifiers) {
            if (
              specifier.type !== 'ImportSpecifier' ||
              specifier.imported.type !== 'Identifier'
            ) {
              continue;
            }
            const { name } = specifier.imported;
            const bySource =
              byName.get(name) ?? new Map<string, ESTree.ImportSpecifier[]>();
            byName.set(name, bySource);
            bySource.set(source, [...(bySource.get(source) ?? []), specifier]);
          }
        }
        for (const [name, bySource] of byName) {
          if (bySource.size < 2) continue;
          const sources = `\`${[...bySource.keys()].join('`, `')}\``;
          for (const specifier of [...bySource.values()].flat()) {
            if (specifier.local.name !== name) continue;
            context.report({
              node: specifier,
              messageId: 'unaliased',
              data: { name, sources },
            });
          }
        }
      },
    };
  },
};

export default rule;
