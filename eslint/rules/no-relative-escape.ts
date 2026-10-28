import type { Rule } from 'eslint';
import path from 'node:path';

import { placeOf } from '../masd-graph';
import { onRelativeImports } from './relative-imports';

// A relative import under `src/` stays inside the importer's place — its slice,
// its segmented layer (`app` and `shared` overlay as one unit), or its app's
// `scripts/` — and anything past it is reached by its `@/` path, so an import
// says which app and layer it enters.

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow a relative import under src/ that leaves its slice, segmented layer or app scripts',
    },
    schema: [],
    messages: {
      escapes:
        'This relative import leaves `src/{{home}}`: import it as `{{alias}}`.',
    },
  },

  create(context) {
    const src = path.join(context.cwd, 'src');
    const fromSrc = path.relative(src, context.filename);
    const home = fromSrc.startsWith('..') ? undefined : placeOf(fromSrc)?.place;
    if (home === undefined) return {};

    return onRelativeImports(context, (source, resolved) => {
      const target = path.relative(src, resolved);
      if (target === home || target.startsWith(home + path.sep)) return;

      const alias = `@/${target.split(path.sep).join('/')}`
        .replace(/\.tsx?$/, '')
        .replace(/\/index$/, '');
      context.report({
        node: source,
        messageId: 'escapes',
        data: { home, alias },
      });
    });
  },
};

export default rule;
