// Member signatures shared across the project-local ESLint rules. They live here
// rather than `lib/` because jiti gives `eslint/` no `@/` alias, and because an
// AST vocabulary has no business in the app's type catalog.

import type * as ESTree from 'estree';

/** The `TSTypeAnnotation` wrapper (`: Foo`) a rule reports or autofixes over. */
export type WithAnnotation = { annotation: ESTree.Node };

/** The `type` key as a bare `string` — an ESTree node kind before it is narrowed. */
export type WithStringType = { type: string };

export type Named = { name: string };

export type WithText = { text: string };
