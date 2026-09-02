/**
 * The repo's shared base types — the single home for any member more than one
 * named type declares. `pnpm type-overlap` fails the run when two types
 * duplicate a member, and intersecting a base from here is the fix.
 *
 * Names follow the families in scripts/type-overlap-check.README.md; a base
 * whose declarers all sit in one module belongs in that module instead, which
 * is why this segment holds only what genuinely crosses slices.
 */

export type WithId = { id: string };

export type Titled = { title: string };
export type Described = { description: string };

/** Extra classes a caller merges into the component's own. */
export type WithOptionalClassName = { className?: string };

/**
 * A hyphen-joined name family: `Suffixed<'a', '' | 'b'>` is `'a' | 'a-b'`. The
 * empty suffix is the family's bare root and takes no hyphen.
 */
export type Suffixed<
  Base extends string,
  Suffix extends string | number,
> = Suffix extends '' ? Base : `${Base}-${Suffix}`;
