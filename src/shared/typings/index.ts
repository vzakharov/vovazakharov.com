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

/** An image's intrinsic pixel size — what reserves its box before it loads. */
export type Sized = {
  width: number;
  height: number;
};

/** A title that may be absent — a document's is derived, so it exists only once read. */
export type MaybeTitled = { title?: string };

export type Described = { description: string };

/** The short name a thing is shown or logged under. */
export type Labeled = { label: string };

/** Rendered or authored text, as opposed to a title or a label. */
export type WithText = { text: string };

/** The one line under a name — what is on offer, said once. */
export type WithTagline = { tagline: string };

/** A name and the line it is billed under: a site's identity, a card's header. */
export type Billed = Named & WithTagline;

/** Extra classes a caller merges into the component's own. */
export type WithOptionalClassName = { className?: string };

/** What a wrapper component renders inside itself. */
export type WithChildren = { children: ReactNode };

/** A heading and whatever renders under it. */
export type TitledBlock = Titled & WithChildren;

/** The case study a card cross-links. */
export type WithOptionalCaseStudyHref = { caseStudyHref?: string };

/** Where an anchor points. */
export type Linked = { href: string };

/**
 * One of a page's own files: where `public/` serves it, and what a saved copy
 * is called — its path under the site, dot-joined, so the file says what it is
 * and whose once it has left the browser. Only an anchor's `download` can set
 * that name; a static export has no `Content-Disposition` to set it with.
 */
export type DocumentFile = Linked & { download: string };

/**
 * Paper's copy of a link: absolute, because the page leaves the browser that
 * resolved it, and spelled without the scheme, which tells a reader holding
 * paper nothing. `printedUrl` builds one; a component takes one to render.
 */
export type PrintedLink = Linked & WithText;

/**
 * Paper's copy of a link is handed to a component rather than derived inside
 * it: deriving needs the site this build is, and reading that costs a client
 * bundle zod's weight. `linkTo` makes both halves out of one route.
 */
export type WithPrinted = { printed: PrintedLink | null };

/** Both halves of an internal link: where it points, and paper's copy of it. */
export type LinkedPerMedium = Linked & WithPrinted;

/** What a Next route hands the page it resolves to, its segments still raw. */
export type WithParams<Params> = { params: Promise<Params> };

/** An anchor whose content is its own label — markup rather than a string. */
export type Anchored = Linked & WithChildren;
