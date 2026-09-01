import type { Linter } from 'eslint';

import { withSeverity } from './rule-severity';

// simple-import-sort — deterministic, auto-fixable, Prettier-compatible import and
// export ordering.
export const importSortRules = {
  ...withSeverity('error', ['simple-import-sort/exports']),

  // Import ordering, bottom-up by dependency direction: side-effects → external →
  // the repo's own directories from leaf data up to the App Router → relative.
  'simple-import-sort/imports': [
    'error',
    {
      groups: [
        // Side-effect imports (CSS, polyfills)
        [String.raw`^\u0000`],
        // External packages
        ['^'],
        // Repo directories (bottom-up)
        ['^@/messages/'],
        ['^@/lib/'],
        ['^@/i18n/'],
        ['^@/hooks/'],
        ['^@/components/'],
        ['^@/app/'],
        // Relative imports
        [String.raw`^\.`],
      ],
    },
  ],
} satisfies Linter.RulesRecord;
