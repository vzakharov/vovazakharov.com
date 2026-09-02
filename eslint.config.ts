// ESLint configuration philosophy: every rule is listed explicitly — either enabled
// as 'error' or disabled with a comment explaining why. Nothing is silently inherited.
// Rules from eslint-config-next spreads are re-stated for transparency and to upgrade
// any 'warn' entries to 'error'. Severity is 'error' or 'off', never 'warn'; the policy
// and how to grandfather a rule live in .claude/rules/eslint.md.
//
// The rule set is split by plugin family into eslint/rule-groups/*.ts. Each group lists
// the rules that share a severity as a name array (squeezed through the strictly-typed
// `fromEntries` helper via `withSeverity`), and keeps rules with options / a per-rule
// rationale declared explicitly. This file orchestrates the groups: preset spreads,
// plugin registration, the merged rule set, and the scoped overrides.
//
// Rule sources:
//   - eslint-config-next/core-web-vitals  — @next/next, react, react-hooks, jsx-a11y, import
//   - eslint-config-next/typescript       — @typescript-eslint (recommended preset)
//   - @eslint-react/eslint-plugin         — TypeScript-native React rules (replaces eslint-plugin-react for most rules)
//   - eslint-plugin-react-compiler        — React Compiler compatibility (Next.js 16)
//   - eslint-plugin-unicorn               — code quality, filename enforcement
//   - Core ESLint rules                   — security, correctness, code quality
//
// Type-aware linting is enabled via parserOptions.projectService. This allows the
// full @typescript-eslint rule set including rules that require type information
// (no-floating-promises, no-unsafe-*, strict-boolean-expressions, etc.).
//
// Formatting is Prettier's alone: eslint-config-prettier disables the rules that
// would fight it, and `pnpm format:check` is the check that enforces it.
//
// This config is TypeScript; ESLint loads it via jiti (a direct devDependency).

import eslintReact from '@eslint-react/eslint-plugin';
import { type Config, defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import boundariesPlugin from 'eslint-plugin-boundaries';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';

import { coreRules } from './eslint/rule-groups/core';
import { importSortRules } from './eslint/rule-groups/import-sort';
import { jsxA11yRules } from './eslint/rule-groups/jsx-a11y';
import { nextRules } from './eslint/rule-groups/next';
import { reactRules } from './eslint/rule-groups/react';
import { typescriptRules } from './eslint/rule-groups/typescript';
import { unicornRules } from './eslint/rule-groups/unicorn';
import { vovaRules } from './eslint/rule-groups/vova';
import noDefaultTrue from './eslint/rules/no-default-true';
import noHardcodedStrings from './eslint/rules/no-hardcoded-strings';
import noInlineObjectParamType from './eslint/rules/no-inline-object-param-type';
import noRedundantDefaultedParamType from './eslint/rules/no-redundant-defaulted-param-type';
import noRedundantPropertyCopy from './eslint/rules/no-redundant-property-copy';
import noRedundantTypeAlias from './eslint/rules/no-redundant-type-alias';
import noSplitJsxSpreads from './eslint/rules/no-split-jsx-spreads';
import noUncausedRethrow from './eslint/rules/no-uncaused-rethrow';
import preferShorthandSpread from './eslint/rules/prefer-shorthand-spread';

// FSD layers, highest first. Each may import from the layers below it plus
// `shared`, and from its own slice. See .claude/rules/fsd.md.
const FSD_LAYERS = ['pages', 'widgets', 'features', 'entities'];

const PUBLIC_API = 'index.ts';

// Steiger (`pnpm lint:fsd`) checks the same directionality and public-API
// discipline at CLI time; boundaries restates them as inline editor feedback,
// which Steiger has no live extension for. Scoped to src/ — root `app/` is the
// FSD app layer, above every slice, so it imports downward by definition.
//
// `boundaries/dependencies` carries all of it: v7 folds the former `entry-point`
// and `external` rules into its policies.
const boundariesConfig: Config = {
  plugins: { boundaries: boundariesPlugin },
  files: ['src/**/*.{ts,tsx}'],
  settings: {
    'boundaries/elements': [
      // The app layer is segmented, not sliced — like `shared`, and unlike
      // every layer in FSD_LAYERS.
      {
        type: 'app',
        pattern: ['src/app/(*)/**'],
        capture: ['segmentName'],
        partialMatch: false,
      },
      ...FSD_LAYERS.map((layer) => ({
        type: layer,
        pattern: [`src/${layer}/(*)/**`],
        capture: ['sliceName'],
        partialMatch: false,
      })),
      // Ordered before the generic shared pattern so it wins the match:
      // shared/lib is addressed one sub-library at a time, never through a
      // segment-wide barrel.
      {
        type: 'shared',
        pattern: ['src/shared/lib/(*)/**'],
        capture: ['segmentName'],
        partialMatch: false,
      },
      {
        type: 'shared',
        pattern: ['src/shared/(*)/**'],
        capture: ['segmentName'],
        partialMatch: false,
      },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        policies: [
          // The app layer sits above all of them, so it may import any,
          // through their public API.
          {
            from: { element: { type: 'app' } },
            allow: {
              to: {
                element: {
                  types: { anyOf: [...FSD_LAYERS, 'shared'] },
                  fileInternalPath: PUBLIC_API,
                },
              },
            },
          },
          // It is one unit rather than a set of isolated slices, so its
          // segments reach each other directly.
          {
            from: { element: { type: 'app' } },
            allow: { to: { element: { type: 'app' } } },
          },
          ...FSD_LAYERS.flatMap((layer, index) => [
            // Downward, and only through the target's public API.
            {
              from: { element: { type: layer } },
              allow: {
                to: {
                  element: {
                    types: {
                      anyOf: [...FSD_LAYERS.slice(index + 1), 'shared'],
                    },
                    fileInternalPath: PUBLIC_API,
                  },
                },
              },
            },
            // Inside its own slice, a file reaches any sibling directly.
            {
              from: { element: { type: layer } },
              allow: {
                to: {
                  element: {
                    type: layer,
                    captured: { sliceName: '{{ from.captured.sliceName }}' },
                  },
                },
              },
            },
          ]),
          {
            from: { element: { type: 'shared' } },
            allow: {
              to: {
                element: { type: 'shared', fileInternalPath: PUBLIC_API },
              },
            },
          },
          {
            from: { element: { type: 'shared' } },
            allow: {
              to: {
                element: {
                  type: 'shared',
                  captured: { segmentName: '{{ from.captured.segmentName }}' },
                },
              },
            },
          },
        ],
      },
    ],
    'boundaries/no-ignored-dependencies': 'error',
    'boundaries/no-unknown-dependencies': 'error',
    'boundaries/no-unknown-files': 'error',
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // --- @eslint-react: TypeScript-native, React 19-aware, type-checked ---
  // Replaces most eslint-plugin-react rules with faster, type-aware equivalents.
  // Also covers react-hooks rules (exhaustive-deps, rules-of-hooks, etc.).
  eslintReact.configs['recommended-type-checked'],
  // Turn off react/* rules that @eslint-react supersedes (avoids duplicate diagnostics):
  eslintReact.configs['disable-conflict-eslint-plugin-react'],
  // Turn off react-hooks/* rules that @eslint-react supersedes:
  eslintReact.configs['disable-conflict-eslint-plugin-react-hooks'],

  // --- React Compiler: flags patterns that break compiler optimization (Next.js 16) ---
  reactCompiler.configs.recommended,

  // --- Unicorn: code quality, filename-case, modern JS patterns ---
  unicornPlugin.configs.recommended,

  // Prettier must come after all other configs to override formatting rules.
  prettierConfig,
  boundariesConfig,

  // Project-local ESLint rules (eslint/rules/).
  {
    plugins: {
      vova: {
        rules: {
          'no-default-true': noDefaultTrue,
          'no-hardcoded-strings': noHardcodedStrings,
          'no-inline-object-param-type': noInlineObjectParamType,
          'no-redundant-defaulted-param-type': noRedundantDefaultedParamType,
          'no-redundant-property-copy': noRedundantPropertyCopy,
          'no-redundant-type-alias': noRedundantTypeAlias,
          'no-split-jsx-spreads': noSplitJsxSpreads,
          'no-uncaused-rethrow': noUncausedRethrow,
          'prefer-shorthand-spread': preferShorthandSpread,
        },
      },
    },
  },
  // Import sorting (deterministic, auto-fixable, Prettier-compatible).
  { plugins: { 'simple-import-sort': simpleImportSort } },
  {
    // Restrict to same file types as nextVitals so jsx-a11y/@next/next/@typescript-eslint
    // plugin scopes (declared there with files: ['**/*.{js,...}']) cover this config too.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        // Enable type-aware linting. Auto-discovers tsconfig.json via projectService.
        // This makes ~35 additional @typescript-eslint rules available that require
        // TypeScript type information (e.g. no-floating-promises, no-unsafe-*).
        projectService: true,
      },
    },
    // The full rule set, merged from the per-plugin groups in eslint/rule-groups/.
    rules: {
      ...coreRules,
      ...typescriptRules,
      ...nextRules,
      ...reactRules,
      ...jsxA11yRules,
      ...unicornRules,
      ...importSortRules,
      ...vovaRules,
    },
  },
  // Custom ESLint rule implementations (eslint/) and the root tooling configs.
  // Relax only the patterns intrinsic to AST-walking rule code; everything else is linted.
  {
    files: ['eslint/**/*.ts', '*.config.{ts,mts,cts,mjs,cjs,js}'],
    rules: {
      // Rule visitors are closures over `context`/`sourceCode`; hoisting them to
      // module scope would mean threading those through every call.
      'unicorn/consistent-function-scoping': 'off',
      // Walking the AST indexes into arrays whose bounds the traversal already
      // guarantees; noUncheckedIndexedAccess makes the assertions unavoidable.
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Type-guard predicates are passed by reference to .filter()/.map() so the
      // result is narrowed — inlining them as arrows would drop the narrowing.
      'unicorn/no-array-callback-reference': 'off',
      // Rule implementations that work with TypeScript's internal type system must
      // cast ts.Type to narrower subtypes (e.g. ts.TypeReference) to access fields
      // that only exist on those subtypes — there is no TypeScript-safe alternative.
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Dev artifacts (gitignored, transient — CLAUDE.md § "Key principles"):
    'tmp/**',
  ]),
]);

export default eslintConfig;
