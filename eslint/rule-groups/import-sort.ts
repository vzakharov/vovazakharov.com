import type { Linter } from 'eslint';

import { loadGraph } from '../masd-graph';
import { withSeverity } from './rule-severity';

// FSD's layers in the order an import may point, lowest first.
const LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];

// One group per app, in graph order, so a file's imports read as its
// composition: the most basic ancestor first, its own app last — `masd.json`
// declares every parent above its child. Within a group the layers keep their
// order without a blank line between them: simple-import-sort orders an inner
// array by which of its patterns matched.
const appGroups = [...loadGraph().keys()].map((app) =>
  LAYERS.map((layer) => `^@/${app}/${layer}/`),
);

// simple-import-sort — deterministic, auto-fixable, Prettier-compatible import and
// export ordering.
export const importSortRules = {
  ...withSeverity('error', ['simple-import-sort/exports']),

  // Import ordering: side-effects → external → one group per app (see
  // .claude/rules/masd.md) → relative.
  'simple-import-sort/imports': [
    'error',
    {
      groups: [
        // Side-effect imports (CSS, polyfills)
        [String.raw`^\u0000`],
        // External packages; `@/` is the alias, not a scope
        [String.raw`^(?!@/)`],
        ...appGroups,
        // Relative imports
        [String.raw`^\.`],
      ],
    },
  ],
} satisfies Linter.RulesRecord;
