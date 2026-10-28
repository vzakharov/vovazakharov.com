import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

// Two modules exporting one name collide in the file importing both, and the
// compiler only makes one of the two take an `as`. The other keeps the bare name,
// which then reads as the only one there is — `messages` beside `blogMessages`
// says nothing of whose catalogue it is. So once a name arrives from two modules,
// every import of it is renamed for its source. A default or namespace import is
// named by its importer anyway, so only named imports are read.

type NamedImport = { source: string; specifier: ESTree.ImportSpecifier };

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
        const byName = new Map<string, NamedImport[]>();
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
            byName.set(name, [
              ...(byName.get(name) ?? []),
              { source, specifier },
            ]);
          }
        }
        for (const [name, imports] of byName) {
          const sources = new Set(imports.map(({ source }) => source));
          if (sources.size < 2) continue;
          for (const { specifier } of imports) {
            if (specifier.local.name !== name) continue;
            context.report({
              node: specifier,
              messageId: 'unaliased',
              data: { name, sources: `\`${[...sources].join('`, `')}\`` },
            });
          }
        }
      },
    };
  },
};

export default rule;
