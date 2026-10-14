# Ban `Pick<…>` and `Omit<…>` over the repo's own types

## Goal

A lint rule that rejects `Pick<X, …>` and `Omit<X, …>` wherever `X` is a type
this repo declares. The rationale: **the narrow type is declared first and the
wide one is built from it** (`type Wide = Narrow & { …own members… }`), never
the wide one first and the narrow one carved back out of it. A type derived from
a schema follows the same order, one level down: the narrow schema comes first,
the wide one `.extend`s it, and each type is `z.infer`red from its own schema.
That needs no rule of its own — a `Pick` over a schema-inferred type is caught
by this one, and the only fix it leaves is the narrow schema.

This is the same direction `pnpm type-overlap` already pushes in (every member
has one home, in a named base the wider types intersect); `Pick`/`Omit` are the
remaining way to name a subset without giving it a home.

## Today

231 sites in 125 files (218 `Pick`, 13 `Omit`):

- `src/pages/mushrooms/` — 199 sites in 98 files (`model/` 49 in 27, `ui/` 146
  in 70, `api/` 4 in 1).
- Everything else (`src/shared`, `src/entities`, `src/pages/music`, `scripts/`)
  — 32 sites in 24 files.

No `zod` `.pick()`/`.omit()` call exists today.

## The rule: `vova/no-pick-omit`

**Flags** a `TSTypeReference` named `Pick` or `Omit` (the global utility types —
a local binding of that name is left alone) whose first type argument is **owned
by the repo**: somewhere inside it, a type reference or a `typeof` query names a
binding that resolves, through ESLint's scope manager, to a declaration in the
file or to an import from a relative or `@/` path.

**Leaves alone**, because nothing there can be declared narrow first:

- a library or DOM type — the name resolves to an import from a package
  (`AnchorProps` from `@mantine/core`) or to no binding at all (a global from
  `lib.dom.d.ts`: `Location`, `History`, `KeyboardEvent`, `Document`);
- a type parameter — `pick<T, K>()` in `src/shared/lib/collections.ts` returns
  `Pick<T, K>`, which is the runtime helper's own contract.

A library generic wrapping a repo name is still the repo's:
`Pick<z.infer<typeof Runs>[number], …>` is flagged through `typeof Runs`.

**Purely syntactic** — scope analysis, no type services — so it runs in every
lint pass and has no "without type info" mode to define. `Partial<Pick<…>>` and
friends are caught by the inner `Pick`, with nothing extra.

The message says what to do, not just what is wrong: declare the narrow type,
make `X` intersect it; or, when `X` is `z.infer`red, declare the narrow schema
and `.extend` it.

**Files:**

- `eslint/rules/no-pick-omit.ts` — the rule.
- `eslint/rules/no-pick-omit.test.ts` — `node:test` over ESLint's `Linter` (the
  first `vova/` rule with a test, since what it flags is a pure function of the
  source): each "leaves alone" bullet above is a valid case; a repo type, an
  in-file type, a `typeof` inside a library generic, `Omit`, `Partial<Pick<…>>`
  are invalid ones.
- Registered beside the others in `eslint.config.ts`'s `vova` plugin and in
  `eslint/rule-groups/vova.ts` at `error`.

## Migrating a site

One recipe, three shapes:

- **`Pick<X, 'a' | 'b'>`** → a named base `type AB = { a: …; b: … }`, moved out
  of `X`'s body, and `type X = AB & { …rest… }`. The site uses `AB`. The name
  says what the subset _is_ to its consumers (`Routed`, `Sitting`), which most
  of the existing local aliases already do —
  `type Sitting = Pick<Leg, 'arrives' | 'leaves'>` becomes the declaration
  itself.
- **Several sites picking overlapping subsets of one type** (`Leg` is picked as
  `from`, `from | to`, `to | leaves`, `departs | arrives | out`, …) → `X` is
  decomposed into the fewest bases from which every site's subset is an
  intersection; a site needing `from | to | departs | arrives` takes
  `Routed & Spanned`. A subset no intersection reaches means the bases split
  further, never that a member is declared twice — `pnpm type-overlap` holds
  that line already.
- **`Omit<X, 'k'>`** → the same move from the other end:
  `type X = Rest & { k: … }` and the site takes `Rest`.
  `Omit<SongText, 'title'> & { gloss?: … }` is the case where the narrow type
  was always the real one.

Two shapes need more than the recipe:

- **A class picked by its methods** (`Pick<Planter, 'colour' | 'plant'>`,
  `Pick<MapView, 'flip'>`) — the narrow type is a `type` declaring those
  members, and the class says `implements` it. That is the narrow-first order
  for an instance type.
- **A schema-inferred type** (`Pick<CaseFrontmatter, 'case' | 'date'>`,
  `Pick<SongFrontmatter, …>`) — the narrow `z.object` is declared first, the
  full schema becomes `narrowSchema.extend({…})`, and the site takes
  `z.infer<typeof narrowSchema>` under its own name.

`Pick<Messages['music'], …>` (`src/pages/music/ui/launch-buttons.tsx`) is the
one site with no narrow type to declare — `Messages` is `typeof` a JSON file. It
takes `Messages['music']` whole rather than earning an exemption.

## Shape: a pizza, three slices

Recommended split (question 2 below):

1. **This PR** — the rule and its tests; every site outside
   `src/pages/mushrooms/` migrated (32 in 24 files); the 98 mushroom files
   grandfathered in one `off` override in `eslint.config.ts`, each file named in
   `files:`, the comment naming the tracking issue.
2. **`src/pages/mushrooms/model/`** — 49 sites in 27 files; the override list
   shrinks by those files.
3. **`src/pages/mushrooms/ui/` and `api/`** — 150 sites in 71 files; the
   override goes away.

**Why a pizza:** the rule on `main` stops new `Pick`/`Omit` from landing in
every file not on the list, while the meadow — the most actively edited slice —
is migrated; and each mushroom slice is a game change, so it runs `VET_MEADOW=1`
(half an hour), which slice 1 does not. Slices 2 and 3 are filed as issues by
`/go` from this list, and are planned when taken; the decomposition of `Leg`,
`MeadowLayout`, `Placed` and the rest is that slice's plan, not this one's.

## DRY notes

- **Reused:** the plugin wiring the existing `vova/` rules use; ESLint's scope
  manager (no new resolution code); `eslint/rule-severity.ts`'s `withSeverity`.
- **Not shared with `@typescript-eslint/no-restricted-types`**, which bans
  `Pick`/`Omit` by name only: it cannot tell `Pick<Leg, …>` from
  `Pick<Location, …>` or `Pick<T, K>`, and the rationale does not reach the
  latter two.
- **The migration adds named bases and removes no logic.** Each base is declared
  where its widest consumer was declared, so no new module appears; a base two
  slices share follows `shared/typings`' existing rule (that segment holds only
  what genuinely crosses slices).
- **Not extracted:** a codemod. The work at each site is choosing the bases and
  naming them, which a codemod cannot do; the mechanical part (rewriting
  references) is a few lines per site.

## Checklist

- [ ] `eslint/rules/no-pick-omit.ts` and its test; registered at `error`.
- [ ] Migrate `src/shared/` (`site-avatar`, `documents`, `rehype-content-links`,
      `construct-metadata`, `text-link`, `name-link`, `feeds`).
- [ ] Migrate `src/entities/case/` via a narrow case-frontmatter schema.
- [ ] Migrate `src/pages/music/` (song-frontmatter schema included).
- [ ] Migrate `scripts/lib/` (`stanza-repeats`, `play-runs`).
- [ ] Grandfather the mushroom files in one scoped `off` override naming the
      tracking issue.
- [ ] File slices 2 and 3 as issues; the override's comment links them.
- [ ] `./scripts/vet.sh` green.

## Questions

1. **Library types.** (a) **Recommended:** exempt them — the rule fires only
   over the repo's own types, as above. (b) Ban `Pick`/`Omit` everywhere with
   the stock `@typescript-eslint/no-restricted-types`; then
   `Pick<Location, 'hash'>` becomes `{ hash: Location['hash'] }` under a name of
   its own, which is the same subset spelled longer.
2. **Shape.** (a) **Recommended:** the three-slice pizza above. (b) An elephant:
   one PR, the rule lands with the last mushroom file, bites per session. (c)
   Everything in this PR, no grandfathering.
