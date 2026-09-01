import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import boundariesPlugin from 'eslint-plugin-boundaries';
import prettierPlugin from 'eslint-plugin-prettier';

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
const boundariesConfig = {
  plugins: { boundaries: boundariesPlugin },
  files: ['src/**/*.{ts,tsx}'],
  settings: {
    'boundaries/elements': [
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
  prettierConfig,
  boundariesConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Scratch space for dev artifacts (CLAUDE.md "Dev artifacts go under tmp/").
    'tmp/**',
  ]),
]);

export default eslintConfig;
