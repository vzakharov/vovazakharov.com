// Member signatures shared across the project-local ESLint rules. AST vocabulary
// lives here rather than `src/kernel/shared/typings` because it has no business in the
// app's type catalog; a member the catalog already homes is imported from it, by a
// relative path, so `pnpm type-overlap` still sees exactly one declaration of it.

import type * as ESTree from 'estree';

/** Loosely-typed AST node — the TS-specific node kinds aren't in @types/estree. */
export type AstNode = ESTree.Node & Record<string, unknown>;

/** Cast a TS-only node `type` string that @types/estree's union doesn't include. */
export const tsType = (name: string): ESTree.Node['type'] =>
  name as ESTree.Node['type'];

/** The `TSTypeAnnotation` wrapper (`: Foo`) a rule reports or autofixes over. */
export type WithAnnotation = { annotation: ESTree.Node };

/** The `type` key as a bare `string` — an ESTree node kind before it is narrowed. */
export type WithStringType = { type: string };
