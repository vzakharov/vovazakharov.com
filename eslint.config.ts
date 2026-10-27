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
// Type-aware linting is enabled via parserOptions.project. This allows the
// full @typescript-eslint rule set including rules that require type information
// (no-floating-promises, no-unsafe-*, strict-boolean-expressions, etc.).
//
// Formatting is Prettier's alone: eslint-config-prettier disables the rules that
// would fight it, and `pnpm format:check` is the check that enforces it.
//
// This config is TypeScript; ESLint loads it via jiti (a direct devDependency).

import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';

import { boundariesConfig } from './eslint/masd-boundaries';
import { coreRules } from './eslint/rule-groups/core';
import { importSortRules } from './eslint/rule-groups/import-sort';
import { jsxA11yRules } from './eslint/rule-groups/jsx-a11y';
import { nextRules } from './eslint/rule-groups/next';
import { reactRules } from './eslint/rule-groups/react';
import {
  NEXT_INTL_CLIENT,
  typescriptRules,
} from './eslint/rule-groups/typescript';
import { unicornRules } from './eslint/rule-groups/unicorn';
import { vovaRules } from './eslint/rule-groups/vova';
import noDefaultTrue from './eslint/rules/no-default-true';
import noExportNamesake from './eslint/rules/no-export-namesake';
import noHardcodedStrings from './eslint/rules/no-hardcoded-strings';
import noInlineObjectParamType from './eslint/rules/no-inline-object-param-type';
import noPickOmit from './eslint/rules/no-pick-omit';
import noRedundantDefaultedParamType from './eslint/rules/no-redundant-defaulted-param-type';
import noRedundantPropertyCopy from './eslint/rules/no-redundant-property-copy';
import noRedundantTypeAlias from './eslint/rules/no-redundant-type-alias';
import noRelativeEscape from './eslint/rules/no-relative-escape';
import noSplitJsxSpreads from './eslint/rules/no-split-jsx-spreads';
import noUncausedRethrow from './eslint/rules/no-uncaused-rethrow';
import preferShorthandSpread from './eslint/rules/prefer-shorthand-spread';

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
          'no-export-namesake': noExportNamesake,
          'no-hardcoded-strings': noHardcodedStrings,
          'no-inline-object-param-type': noInlineObjectParamType,
          'no-pick-omit': noPickOmit,
          'no-redundant-defaulted-param-type': noRedundantDefaultedParamType,
          'no-redundant-property-copy': noRedundantPropertyCopy,
          'no-redundant-type-alias': noRedundantTypeAlias,
          'no-relative-escape': noRelativeEscape,
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
        // Enable type-aware linting. This makes ~35 additional @typescript-eslint
        // rules available that require TypeScript type information (e.g.
        // no-floating-promises, no-unsafe-*).
        //
        // Every file is checked against the root tsconfig.json, which includes
        // every app's files. projectService would give each file its nearest
        // tsconfig — one program per app on top of the root one, each nearly all
        // of src/ plus the library types: five programs overrun a 2.3 GB heap
        // where one fits in ~1.7 GB.
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
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
  // These pages are served at one address in one language — the CV is the only
  // localized route — so their copy is authored in English in the JSX and there
  // is no `ru` rendering for a literal to defeat. The exemption spans each whole
  // slice because a page is composed from one section component per topic. Drop
  // a slice from the list if its page is ever localized; the rule stays `error`
  // everywhere else, including every component the CV renders.
  {
    files: [
      'src/vova/pages/{home,writing}/ui/**/*.tsx',
      'src/music/pages/{music,artist,album,song,radio}/ui/**/*.tsx',
      'src/music/{widgets,entities}/*/ui/**/*.tsx',
      'src/music/shared/ui/*.tsx',
    ],
    rules: { 'vova/no-hardcoded-strings': 'off' },
  },
  // Temporary, tracked by #170: app scripts that reach past a public API into
  // their own app's layers, which `.claude/rules/masd.md` forbids. Each app's
  // entries leave as #170 restructures it, then the block goes. A new file is
  // never added here.
  {
    files: [
      // basilisk
      'src/basilisk/scripts/lib/basilisk-card.ts',
      'src/basilisk/scripts/lib/docket.ts',
      // kernel
      'src/kernel/scripts/lib/og-job.ts',
      // mushrooms
      'src/mushrooms/scripts/build-mushroom-artifact.ts',
      'src/mushrooms/scripts/lib/flier-watch.ts',
      'src/mushrooms/scripts/lib/mushroom-probe-answers.ts',
      'src/mushrooms/scripts/lib/mushroom-probe-drive.ts',
      'src/mushrooms/scripts/lib/mushroom-probe-reads.ts',
      'src/mushrooms/scripts/lib/painted-cap.ts',
      'src/mushrooms/scripts/lib/play-approach.ts',
      'src/mushrooms/scripts/lib/play-band.ts',
      'src/mushrooms/scripts/lib/play-buzzers.ts',
      'src/mushrooms/scripts/lib/play-dusk.ts',
      'src/mushrooms/scripts/lib/play-fliers.ts',
      'src/mushrooms/scripts/lib/play-house.ts',
      'src/mushrooms/scripts/lib/play-insects.ts',
      'src/mushrooms/scripts/lib/play-keep.ts',
      'src/mushrooms/scripts/lib/play-keys.ts',
      'src/mushrooms/scripts/lib/play-map.ts',
      'src/mushrooms/scripts/lib/play-night-run.ts',
      'src/mushrooms/scripts/lib/play-opening.ts',
      'src/mushrooms/scripts/lib/play-rain.ts',
      'src/mushrooms/scripts/lib/play-runs.ts',
      'src/mushrooms/scripts/lib/play-species.ts',
      'src/mushrooms/scripts/lib/play-sprouts.ts',
      'src/mushrooms/scripts/lib/play-veer.ts',
      'src/mushrooms/scripts/lib/play-walk-checks.ts',
      'src/mushrooms/scripts/lib/play-walk-flight.ts',
      'src/mushrooms/scripts/lib/play-walk-swipe.ts',
      'src/mushrooms/scripts/lib/play-walk.ts',
      'src/mushrooms/scripts/lib/play-worms.ts',
      'src/mushrooms/scripts/lib/veer-dash.ts',
      'src/mushrooms/scripts/lib/veer-report.test.ts',
      'src/mushrooms/scripts/lib/veer-report.ts',
      'src/mushrooms/scripts/lib/veer-watch.ts',
      'src/mushrooms/scripts/sweep-mushrooms.ts',
      'src/mushrooms/scripts/veer-away.ts',
      // music
      'src/music/scripts/list-untold-songs.ts',
      // shell
      'src/shell/scripts/generate-styles.ts',
      // vova
      'src/vova/scripts/lib/cv-card.ts',
      'src/vova/scripts/render-og.ts',
      'src/vova/scripts/render-pdf.ts',
    ],
    rules: { 'boundaries/dependencies': 'off' },
  },
  // The two links built on a bare `Anchor`: `TextLink` itself, and `FileLink`,
  // whose site-root `href` names a file to save rather than a page, so it wants
  // neither `next/link` nor a printed half.
  {
    files: ['src/shell/shared/ui/{text,file}-link.tsx'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { paths: [NEXT_INTL_CLIENT] },
      ],
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
    // Default ignores of eslint-config-next, re-stated for `sites/*` because each
    // site builds into its own directory rather than the repository root.
    '**/.next/**',
    '**/out/**',
    'build/**',
    '**/next-env.d.ts',
    // Dev artifacts (gitignored, transient — CLAUDE.md § "Key principles"):
    'tmp/**',
    // The cost ledger's rows: JSON only, and vet's concurrent cost tests make
    // and remove month directories here while ESLint walks the tree.
    '.claude/costs/sessions/**',
  ]),
]);

export default eslintConfig;
