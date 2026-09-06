/**
 * The repo's shared base types — the single home for any member more than one
 * named type declares. `pnpm type-overlap` fails the run when two types
 * duplicate a member, and intersecting a base from here is the fix.
 *
 * Names follow the families in scripts/type-overlap-check.README.md; a base
 * whose declarers all sit in one module belongs in that module instead, which
 * is why this segment holds only what genuinely crosses slices.
 */

import type { ReactNode } from 'react';

export type Named = { name: string };

export type WithId = { id: string };

export type Titled = { title: string };

/** A title that may be absent — a document's is derived, so it exists only once read. */
export type MaybeTitled = { title?: string };

export type Described = { description: string };

/** Rendered or authored text, as opposed to a title or a label. */
export type WithText = { text: string };

/** Extra classes a caller merges into the component's own. */
export type WithOptionalClassName = { className?: string };

/** What a wrapper component renders inside itself. */
export type WithChildren = { children: ReactNode };

/** Where an anchor points. */
export type Linked = { href: string };

/** An anchor whose content is its own label — markup rather than a string. */
export type Anchored = Linked & WithChildren;
