import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      // `type` over `interface`: interfaces allow unintentional declaration
      // merging, and the type-overlap gate scans type aliases only — the ban is
      // what makes that scope cover every named object shape rather than a
      // subset. See scripts/type-overlap-check.README.md.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Scratch: CLAUDE.md sends dev artifacts here, so a spike must not fail vet.
    'tmp/**',
  ]),
]);

export default eslintConfig;
