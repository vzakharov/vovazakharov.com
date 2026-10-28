> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Sub-entities: a layer of roles between `entities` and `shared`

The second of `docs/masd.md` § "Open directions": a facet several entities share
— the occupant is the first — as a named kind of slice rather than a file in
`mushrooms/shared/world`.

## What the facets are

Reading `shared/world`, two files are already such facets, and both describe
themselves the same way — _a thing as the things beside it meet it_:

- **`occupant.ts`** — "a thing standing on the meadow as the things beside it
  meet it". Implemented by `entities/mushroom` and `entities/flower` (each turns
  its own into an `Occupant` through `Occupying`), read by the features that
  judge ground and sight.
- **`seat-reach.ts`** — "a flower's head as whatever sits on it meets it":
  `HeadReach`, `Sitter`, `Lifting`, `Spanned`. `entities/flower` judges a seat
  by it, `entities/insect` says what sits.

Neither is a business noun (no entity of its own), neither is noun-free (it
knows mushrooms, flowers, heads), and neither can sit in one entity, since its
other implementer would reach it sideways. `shared/world` is where they landed
because it was the only legal floor, not because they are world.

`shelter-seats.ts` (a cap's two seats, one constant) stays in `shared/world`: it
is a number the cap and the insect agree on, not a facet with behaviour.

## The shape: a sliced layer, `roles`, between `entities` and `shared`

```
app → pages → widgets → features → entities → roles → shared
```

- **A sliced layer**, each slice one role: `mushrooms/roles/occupant`,
  `mushrooms/roles/seat` (the flower's head as a seat, with its sitter).
- **Imports follow the layer rule unchanged**: entities and everything above
  reach a role through its `index.ts`; a role reaches `shared` only; two roles
  never reach each other (sideways, as between any two slices).
- **Significance unchanged**: a role with a single upward consumer belongs
  inside it, exactly as a slice anywhere — `check:masd` counts it the same way.
  A role is earned by **two entities implementing it**, which is the whole point
  of the layer; one is an entity's own type.
- **Optional, like every layer**: kernel, blog and the rest have none, and an
  app with no roles is still plain FSD. MASD departs from FSD here — the one
  layer FSD does not have — and `.claude/rules/masd.md` says so in one line.

**Why a layer rather than marked slices inside `entities/`** (the alternative,
1b below): the checkers are layer-list driven — `SLICED_LAYERS` in
`eslint/masd-graph.ts` feeds `eslint/masd-boundaries.ts` and
`scripts/masd-check.ts` — so a layer costs one array entry, and the "strictly
lower" rule gives role→entity separation for free. Marked slices inside
`entities/` need a new exception to the sideways rule in `boundaries` and a
Steiger exemption for every entity→role import, which `.claude/rules/masd.md` §
"Rules" forbids ("move the code rather than exempting the path").

**Why `roles`.** Every facet found reads as "X as Y meets it" — a part an entity
plays among the others, which is what a role is. It also reads as the code does:
a mushroom _is_ an occupant, a flower's head _is_ a seat. Against the operator's
candidates:

- **абстракции / abstractions** — every layer below `pages` is an abstraction;
  the name would not tell this one apart.
- **зародыши / germs** — says "an entity not grown yet", but an occupant never
  becomes an entity; it is a part of two.
- **кирпичики / parts** — closest of the three, and the runner-up: but a part
  sounds like a piece of one thing (a cap, a stem), where a role is shared by
  several by definition.
- **`facets`** (the word `docs/masd.md` uses) and **`traits`** (the TypeScript
  reader's word for exactly this) are the other two worth naming.

## Steps

1. **Spike Steiger in `tmp/`** before anything else: run `pnpm lint:fsd` with a
   `src/mushrooms/roles/occupant/` present. Steiger does not know the layer;
   expected outcome is that it ignores the directory (its rules key on known
   layer names) and `typo-in-layer-name` stays quiet for `roles`. If either rule
   fires, the plan stops and comes back with what fired — no exemption is added
   without the operator.
2. **Graph**: `SLICED_LAYERS` in `eslint/masd-graph.ts` gains `'roles'` after
   `'entities'`. Read `masd-boundaries.ts` and `masd-check.ts` for any place
   that names `entities` or the lowest sliced layer literally rather than
   through the list (`CHECKED_LAYERS` drops `pages` by name — fine) and fix it
   there. The import sort's grouping goes through the same loader; check it
   orders a role import between entities and shared.
3. **Move `occupant.ts`** to `src/mushrooms/roles/occupant/` (segment `model/`,
   since it holds types and two pure functions, no drawing), with an `index.ts`
   carrying what `shared/world/index.ts` exports of it today, plus
   `index.node-safe.ts` / `index.test-only.ts` only where a script or test reads
   it (the entities' `index.node-safe.ts` re-export `Occupant` today, so the
   role likely needs one). Its imports of `ground`, `view`, `anchored-ground`
   and `lib/geometry` become `@/mushrooms/shared/world` and
   `@/mushrooms/shared/lib/geometry`.
4. **Move `seat-reach.ts`** the same way to `src/mushrooms/roles/seat/`.
5. **Rewire importers** (≈20 files across `entities/`, `features/`,
   `pages/mushrooms`, `scripts/lib/veer-report.ts`) and drop the two blocks from
   `shared/world/index.ts`.
6. **Prose**: `.claude/rules/masd.md` § "Layers" gains `roles/` between
   `entities/` and `shared/`, with the "X as Y meets it" test and the
   two-implementers bar; § "The model" or "Rules" the one line on departing from
   FSD. `docs/masd.md` drops the item from "Open directions" ("Four things" →
   "Three"), and adds `roles` wherever it lists the layers.
7. **Vet with `VET_MEADOW=1`** — the move changes the game, so the meadow's
   tests run (`src/mushrooms/CLAUDE.md`).

## Scope

One session, one PR; no split. Out of it: hunting for roles in other apps (none
is known), and the other three open directions.

## DRY notes

- Nothing is duplicated: two files move, their exports move with them, and
  `shared/world/index.ts` loses what moved rather than re-exporting it.
- The layer list keeps its one home, `eslint/masd-graph.ts`; every checker reads
  it, so the new layer is one entry, not one per checker.
- No new abstraction beyond the layer itself. A per-role helper (say, an
  "implements a role" type) is net-negative: `Occupying<Thing>` already is that
  for the occupant, and the seat needs none.

## Open questions (recommendations in force above)

1. Name: **a) `roles`** (recommended) · b) `parts` · c) `facets` · d) `traits`.
2. Shape: **a) a layer between `entities` and `shared`** (recommended) · b)
   marked slices inside `entities/` with a sideways exception.
3. Scope: **a) occupant and seat both** (recommended — two roles show it is a
   kind, not a one-off) · b) occupant only.
