> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Segment order: a strict import order between segments, `model` split in two

The second of `docs/masd.md` § "Open directions" — sub-entities, a facet several
entities share — resolved without a new layer. Domain-aware code that is not an
entity stays in `shared`, and what keeps it disciplined is an **import order
between segments**: a segment reaches only the segments below it, so `shared`
knows the domain by gradient, rising up its order, rather than by a binary
"business or not" call the code showed it cannot make.

## The methodology

- **Every segmented place has a strict segment order** — a slice, and the
  segmented layers `app` and `shared` of each app. A file reaches a segment
  below its own; inside one segment, files reach each other freely. Test code is
  the slice's own consumer and reaches any segment of its place.
- **The standard segments, highest first**:

  ```
  ui → logic → api → shape → config → lib
  ```

  - **`logic`** — what a slice does with its data: stores and their actions,
    pure domain functions (`isReleased(movie)`).
  - **`shape`** — what the data looks like: zod schemas and the types inferred
    from them, drizzle tables, `const` arrays of enum values.
  - **`config` below `shape`**, because a schema is built from a config's values
    (`z.enum(GENRES)`, per CLAUDE.md § "Derive types…").
  - **`lib` lowest**: a helper knowing neither the domain nor the settings;
    `kernel/shared/config/site-env.ts` already takes `oneOf` from `lib`.

- **`model` is banned.** FSD's `model` holds "schemas, interfaces, stores, and
  business logic" — four purposes under one name, which fails FSD's own rule
  that a segment is named by purpose. Its contents go to `logic` and `shape`,
  which also breaks the cycle FSD's surveyed repos show (model calls api at
  runtime, api imports model's types).
- **A place with a non-standard segment declares its order** in a `masd.json`
  beside its segments — `src/<app>/shared/masd.json`, or a slice's own — as
  `{ "segments": [...] }`, highest first. The array lists every segment of the
  place and keeps the standard ones in the standard order; a place with only
  standard segments has no file. Root `src/masd.json` stays the app graph and
  learns nothing of an app's internals.
- **Across apps nothing changes**: an ancestor is always below, so a descendant
  reaches any segment of an ancestor's `shared`. The order only tightens what a
  place reaches of itself, so it cannot conflict with composition.
- **No source file in a layer but `.ts` and `.tsx`**, so nothing escapes
  `boundaries`, which lints only those.

## Steps

1. **Spike Steiger in `tmp/`**: a `masd.json` at a slice root and in `shared/`,
   and segments named `logic` and `shape`, through `pnpm lint:fsd`. If a rule
   fires (a root file read as a file segment, say), the plan stops and comes
   back with what fired; no exemption without the operator.
2. **Loader** (`eslint/masd-graph.ts`): `STANDARD_SEGMENTS` in order, a zod
   schema for a place's `masd.json`, and `segmentOrder(placeDir)` returning the
   place's order — its file's, or the standard one. It fails when the file
   reorders the standard segments, names one twice, or omits a segment the place
   has a module in. Tests beside it in `masd-graph.test.ts`.
3. **Rule `vova/segment-order`** in `eslint/rules/`, beside
   `no-relative-escape.ts` and finding the place the same way: a relative import
   between two segments of one place is an error unless the target is lower;
   test code is exempt. Imports, re-exports and dynamic imports alike. Wired in
   `eslint.config.ts` with `error`, tested like `no-relative-escape.test.ts`.
4. **`check:masd`** (`scripts/masd-check.ts`): fails on a `.js`, `.jsx`, `.mjs`,
   `.cjs`, `.mts` or `.cts` under any `src/<app>/<layer>/`, and on a `model`
   segment anywhere.
5. **Split every `model`** (15 slices): each becomes `logic`, except what an
   `api` reaches — in `mushrooms/pages/mushrooms`, `kept-record.ts` with its
   `kept-record.schema.json` and `meadow-number.ts` move to `shape`. Imports
   rewired; the only standard-segment edges today (ui → model 164, ui → lib 33,
   ui → api 5, api → model 5, config → lib 1) all point down once that is done.
6. **Split `mushrooms/shared/world`** into three segments, each with its own
   `index.ts` (and `index.test-only.ts` where the old one served it):
   - **`space`** — the space and camera engine: `ground`, `pinhole`,
     `eye-height`, `view`, `view-inverse`, `eye-crop`, `pan`, `stride`, `walk`,
     `walking`, `anchor`, `backdrop-depths`, `repaint-queue`. `ground`'s
     `FLOWER_SIZE` becomes a parameter, so the engine knows no flower.
   - **`sky`** — `dusk`, `weather`.
   - **`meadow`** — what knows the game's things: `occupant`, `anchored-ground`,
     `crowding`, `seat-reach`, `shelter-seats`, `bed-place`, `acting`.

   `src/mushrooms/shared/masd.json`: `ui`, `meadow`, `sky`, `space`, `lib`. The
   218 `@/mushrooms/shared/world` imports and 11 test-only ones are rewired to
   the segment each name lives in.

7. **Declare every other non-standard place**: each app's `shared` with a
   segment outside the standard list (kernel's `cache`, `i18n`, `seo`,
   `typings`; blog's, music's, basilisk's, shell's, vova's), and the slices with
   an `i18n` segment (`lsa/pages/lsa-home`, `maya/entities/maya`,
   `maya/pages/whisper`, `maya/pages/home`). Each array is read off that place's
   current imports, which the predecessor measured acyclic in every app's
   `shared`; where a place has two segments no import orders, the one more
   generic goes lower.
8. **Prose**: `.claude/rules/masd.md` § "Rules" gains the order, the standard
   list, `model`'s ban and the `masd.json` declaration, and § "Layers" drops
   "shared knows no business" in favour of the gradient. `docs/masd.md` drops
   sub-entities from "Open directions" ("Four things" → "Three") and records
   where it went.
9. **Vet with `VET_MEADOW=1`** — the split touches the game
   (`src/mushrooms/CLAUDE.md`).

## Scope

One session, one PR, no split: steps 2–4 are small, and 5–7 are wide but
mechanical. Out of scope: the other three open directions, and turning Steiger's
`forbidden-imports` off.

## DRY notes

- The standard order has one home, `STANDARD_SEGMENTS` in
  `eslint/masd-graph.ts`, read by the loader, the rule and `check:masd`; a
  place's file lists only its own order.
- `vova/segment-order` reuses `no-relative-escape`'s way of finding a file's
  place rather than a second parser of `src/` paths: the shared part moves into
  a helper both rules import, since two copies of "which slice is this" would
  drift on the next layer change.
- `boundaries` is not taught the order: its elements stop at the slice and the
  segmented layer's segment, and a segment-level element per layer would double
  every element and policy for what a 50-line rule says directly.

## Open questions (recommendations in force above)

1. The domain segment of `mushrooms/shared`: **a) `meadow`** (recommended —
   everything in it is a thing on the meadow) · b) `world` (keeps the old name
   for a smaller part) · c) yours.
2. Test code and the order: **a) exempt** (recommended — `api`'s tests set up a
   kept record with `logic`'s `settled`) · b) held to it like production code.
