import type { Linter } from 'eslint';

import { loadGraph } from '../masd-graph';
import { withSeverity } from './rule-severity';

// FSD's layers, lowest first.
const LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];

// One group per app in graph order — `masd.json` declares every parent above
// its child, so a file's own app comes last. An inner array sorts by which of
// its patterns matched, with no blank line between them: the layers in order.
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
