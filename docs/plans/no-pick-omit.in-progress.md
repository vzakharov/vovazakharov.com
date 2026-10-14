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

## The loop

An elephant: one PR, a bite per session. **Bites hand over unattended** — the
operator asked not to review between them — so a bite's end runs `/go` Steps 3
and 4, pauses the plan, and then `/relay go` hands the branch to a fresh session
that takes the next bite. The last bite completes the plan and stops there,
leaving `/finalize` to the operator.

Until the last bite, the files the rule still flags sit in one scoped `off`
override for `vova/no-pick-omit` in `eslint.config.ts`, each named in `files:`,
so every bite leaves `vet` green. That list is the work left: each bite removes
the files it migrated, and the last removes the override. It never reaches
`main`, the PR landing whole.

A meadow bite is a game change: it runs `VET_MEADOW=1 ./scripts/vet.sh` (or
`pnpm test:meadow`) before it pauses, per `src/pages/mushrooms/CLAUDE.md`.

## Eaten so far

- **The rule is live.** `eslint/rules/no-pick-omit.ts`, registered at `error`,
  with `eslint/rules/no-pick-omit.test.ts` (16 cases, passing) over ESLint's
  `Linter` and `@typescript-eslint/parser`, now a direct dev dependency. Over
  the tree it reports 219 sites in 117 files; the only files using `Pick`/`Omit`
  it passes are the DOM, Mantine and type-parameter ones (`open-kept.ts`,
  `keyboard.ts`, `title-gloss-line.tsx`, `collections.ts`, `text-link.tsx`).
- **Bite 1, outside the meadow, is done** (`3557d2b`): all 21 files left the
  override. Narrow bases now declared first: `FileInCollection`,
  `ServedMarkdown`, `ProseSource` under `ContentDocument`; `UnlinkedRssItem`;
  the metadata's `Addresses`; `TextLinkBaseProps`; `WithAvatar`; the song
  schema's `Released`, `Tracked`, `Mastered`, `Mp3Copied`, `CreditedSong`,
  `ScriptKept`, `UntitledSongText`; the player's `Playing`, `QueuePositions`,
  `Cursored`, `WithPlayerLabels`; `CoverHeadBody`; the case's `Docketed`; the
  probe's `RunEnds`; and `Opened` in `mouse-run-clock.ts` (a meadow file, still
  in the override for its other sites). `LaunchButtons` takes
  `Messages['music']` whole, ~3 KB more in the music index's RSC payload.
  `build:vova` and `build:basilisk` pass on the new schemas.
- **Bite 2, `src/pages/mushrooms/model/`, is done** (`934edd0`): its 27 files
  left the override, `pnpm test:meadow` green. The model's wide types are now
  intersections of named bases, which `ui/` sites can take too:
  - `flight.ts` — `Leg = Span & Route & Leaving & OutFirst`, `Route` over
    `Origin` and `Destination`; `Sight` over `FlowersSeen` (`Flowered` and a
    local `Crowded`), `Placed` and `Sheltered`; `Perches` adds `Raining`;
    `Choosing` over `Hemmed`. `flight-timing.ts` — `Span` over `Scheduled`
    (`Departing & Arriving`) and `Dashing`.
  - `mushroom-genes.ts` — `MushroomShape` over `Stemmed`, `StemShaped`, `Capped`
    (`CapWide`), `CapTilted`; `Tilted = Bent & CapTilted`; `OfSpecies` exported.
  - `game.ts` — `Meadow = Unkept & KeptMeadow`: `Unkept` over `Pickers`;
    `KeptMeadow` (moved here from `kept-record.ts`) over `Swarm`,
    `WithMushrooms`, `WithPulled`, `WithDusk`, `Spored`. `insects.ts` —
    `Swarm = WithInsects & WithPlanted`.
  - `ground.ts` — `Camera` over `GroundedScreen` (`Grounded`) and `WorldScaled`;
    `geometry.ts` — `Point = Abscissa & …`; `shared/typings` —
    `Sized = WithWidth & …`.
  - The rest: `placement.ts`'s `Stood`; `mouse-run.ts`'s `LeftFrom`, `HeadedTo`;
    `mouse-run-clock.ts`'s `InLeg`, `Bowed`; `night-runs.ts`'s `NightOuting`;
    `insect-genes.ts`'s `Bodied`, `Winged`; `bee-genes.ts`'s `BeeHeaded`;
    `flower-genes.ts`'s `Petalled`, `Classed`; `motion.ts`'s `Switched`;
    `insect-steering.ts`'s `Faced`; `cruise.ts`'s `Eased`.
  - A base knip found unused outside its file is declared without `export`; a
    `ui/` site that needs one exports it.
- **The 69 `ui/` and `api/` files sit in the grandfather override** in
  `eslint.config.ts`, `pnpm lint`, `typecheck`, `type-overlap` and `knip` clean.

## This bite

**The layout and paint side of `ui/scene/`** — ~66 sites in 34 files, the ones
picking `MeadowLayout`, `Controls`, `Camera`, view's `Placed`/`Viewed`, `Point`,
`Circle`, `Box`, `Stand`, `Bake`, `Lighting`, `BuzzParts`, `Siding`, `Laid`,
`Planted`, `Mottle`, `Room`, `BrowBlade`, `FlowerGenes`, `Footed`, `Standing`.
`MeadowLayout` is decomposed into named bases its 19 sites intersect.

Files leaving the override: `anchored-stand`, `backdrop-tones`, `bake-picture`,
`bed-place`, `brow`, `clump-shade`, `draw-buzz`, `draw-flower`, `dusk-stars`,
`flower-cover`, `flower-layout`, `flower-plots`, `flower-seat`, `flower-sight`,
`flower-tints`, `gait-spot`, `grass`, `insect-away`, `insect-shadow`, `lawn`,
`layout`, `mottles`, `mushroom-light`, `paint-backdrop`, `panorama`,
`picker-rows`, `rain-sky`, `repaint-queue`, `shapes`, `sky-layout`, `skyline`,
`sun-layout`, `view`, `widest-spans`.

## Rest of the elephant

- **The scene wiring and shown objects of `ui/scene/`, and `api/`** — ~77 sites
  in the 37 files left in the override: `Scened`, `MeadowSound`, `PerchHosts`,
  `Shown`, `Swell` and the classes (`Planter`, `MapView`, `FlowerBed`,
  `Perches`, `MushroomBed`, `RainView`, `DuskView`) are the big ones. Model
  types they pick mostly have their bases already
  (`Pick<Leg, 'from' | 'departs'>` is `Origin & Departing`; `Pick<Meadow, …>`
  takes `WithPlanted`, `WithMushrooms`, `WithPulled`, `Spored`, `WithDusk`). The
  last bite removes the override and completes the plan.
- **The rule forced on lists every site left**:
  `npx eslint --rule '{"vova/no-pick-omit":"error"}' src/pages/mushrooms/ui src/pages/mushrooms/api`.
- **Running `pnpm test:meadow` from one Bash call overruns its 10-minute
  limit**; split the 147 files into ~12 chunks (`split -n l/12`), each under it.

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
