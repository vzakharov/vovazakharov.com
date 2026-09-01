// Member signatures shared across the project-local ESLint rules. AST vocabulary
// lives here rather than `lib/` because it has no business in the app's type
// catalog; a member the catalog already homes is re-exported from it instead, so
// `pnpm type-overlap` still sees exactly one declaration of it.

import type * as ESTree from 'estree';

// Relative, not `@/` — jiti gives `eslint/` no path alias.
export type { Named, WithText } from '../../lib/typings';

/** The `TSTypeAnnotation` wrapper (`: Foo`) a rule reports or autofixes over. */
export type WithAnnotation = { annotation: ESTree.Node };

/** The `type` key as a bare `string` — an ESTree node kind before it is narrowed. */
export type WithStringType = { type: string };
