/**
 * The repo's shared base types — the single home for any member more than one
 * named type declares. `pnpm type-overlap` fails the run when two types
 * duplicate a member, and intersecting a base from here is the fix.
 *
 * Names follow the families in scripts/type-overlap-check.README.md;
 * a base whose declarers all live in one module belongs in that module instead.
 */

export type Named = { name: string };
export type WithId = { id: string };

/** A record carrying an id and a human-readable name — the recurring `{ id, name }` shape. */
export type NamedRecord = Named & WithId;

/** A filesystem/repo path. Keyed `filePath` so the path shape doesn't collide with `file: File`. */
export type WithFilePath = { filePath: string };

export type Titled = { title: string };

/** A title that may be absent — a document's is derived, so it exists only once read. */
export type MaybeTitled = { title?: string };

export type Described = { description: string };

/** Rendered or authored text, as opposed to a title or a label. */
export type WithText = { text: string };

/** Extra classes a caller merges into the component's own. */
export type WithOptionalClassName = { className?: string };
