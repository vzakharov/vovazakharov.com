# Bite 18 — saving: the spec

The contract is `docs/plans/mushroom-game-syama/saving.md` (five bullets,
settled). Paths are under `src/pages/mushrooms/` unless they say otherwise.
Line numbers are as of the commit that adds this file.

**Gap in the brief:** `brief-common.md` points at the plan's `## This bite`
and at `bite-18.md`; neither exists yet (the plan's last section before
`## Rest of the elephant` is the index). This spec is written against
`saving.md` alone; the orchestrator writes `bite-18.md` from it.

## 1. Fact sheet

### The clock

Every timestamp in `Meadow` is ms on the scene's clock: `Timed.now` is
Phaser's `update(time)` (`ui/scene/meadow-scene.ts:199-208`). That clock
runs from page load, so a value from one load means nothing in the next. A
settled timestamp is therefore written as a moment **at or before 0**, which
every load has already passed by its first frame. One constant, defined in
the keeping module, serves every rewritten stamp:
`RESTED_AT = -SPROUT_MS` (−120 000 ms). It is longer than every span a rule
measures from a stamp (`SPORE_FALL_MS` 700, `SPORE_DWELL_MS` 2000, `DUSK_MS`
4000, `WET_MS`, the rainbow's 12.5 s). A test asserts that each rule reads
"at rest" from it.

**Nothing kept may be `±Infinity`.** IndexedDB's structured clone would keep
it, but the schema (call 1) would have to allow it, and every value has a
finite meaning anyway.

### `Meadow` (`model/game.ts:68-96`), field by field

| Field                                                  | File:line                                                       | Kept?                    | Settled at rest                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mushrooms: Planted[]` (`Placed & Housed & Sprouting`) | game.ts:70, sprouting.ts:44-47, house.ts:44-49, placement.ts:42 | yes                      | `id`, `seed`, `species`, `foot {x,y}`, `lean`, `house {windows, door}` as they are. `sprout` (`{at, parent}`) is **dropped**: a full-grown sprout is the same as a grown mushroom to every reader (`isOld`, `sproutScale`: sprouting.ts:59-71; `mushroom-shown.ts:74-98`; `perch-sight.ts:251`; `spore-drift.ts:46` reads only newborns). Spores that would come up in the shower under way come up first (see `spores`). |
| `selected`                                             | game.ts:71                                                      | no                       | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                               |
| `picking`, `furnishing`                                | game.ts:73-75                                                   | no                       | `false` (`PICKERS_SHUT`, game.ts:169)                                                                                                                                                                                                                                                                                                                                                                                     |
| `planting`                                             | game.ts:77                                                      | no                       | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pulled: string[]`                                     | game.ts:83                                                      | yes                      | as is (ids of seeded flowers, which the kept visit seed reproduces; see below)                                                                                                                                                                                                                                                                                                                                            |
| `grown`, `released`, `scattered`                       | game.ts:85, 87; sprouting.ts:53                                 | yes                      | as is, after the settling sprouts bump `grown`                                                                                                                                                                                                                                                                                                                                                                            |
| `insects: Flier[]` (`Swarm`)                           | insects.ts:51, 58                                               | yes, settled             | see "Fliers" below                                                                                                                                                                                                                                                                                                                                                                                                        |
| `planted: Sown[]` (`Swarm`)                            | insects.ts:58, pollen.ts:35-42                                  | yes                      | as is: `{id, seed, foot: Footing}` or `{id, seed, ring, parent}`; no clock in it                                                                                                                                                                                                                                                                                                                                          |
| `rain: Rain \| undefined`                              | game.ts:89, weather.ts:11                                       | no                       | `undefined`. A stopped shower leaves behind only the rainbow and the sprouting rule; the spores are settled first, so nothing reads it (`sproutedInRain` returns at once with no rain, sprouting.ts:150)                                                                                                                                                                                                                  |
| `dusk: Dusk`                                           | game.ts:91, dusk.ts:17                                          | **yes, the time of day** | `toward === 'dusk'` → `FULL_DUSK`, else `FULL_DAY` (dusk.ts:23-26). A turn under way is settled where it is going.                                                                                                                                                                                                                                                                                                        |
| `nightRuns: NightRuns`                                 | game.ts:93, night-runs.ts:31-35                                 | `made` only              | `{ due: undefined, made, last: undefined }`. `made` indexes the outing's stream (`gapOf`), so it keeps counting; `due` restarts on the first dusky tick (`nightRan`, night-runs.ts:79-99); `last` would replay an old outing (`MouseRuns.night`)                                                                                                                                                                          |
| `spores: Spore[]` (`Spored`)                           | sprouting.ts:50-53                                              | yes, settled             | first `sproutedInRain(meadow, Infinity)` (sprouting.ts:149) when `rain` is set, so every spore with a moment in the latest shower comes up, as it would have once the shower ended; the rest keep everything with `at: RESTED_AT` (a lying spore's `at` is read only by the fall, the dwell and "sown after the stop", sprouting.ts:136-141)                                                                              |

### Fliers (`Flier = Insect & Flight & Shying & (Visitor | Pollinator)`, insects.ts:42-51; `Leg`, flight.ts:160-170)

Kept: `id`, `seed`, `kind`, `legs` (it indexes the leg stream,
flight.ts:175), a bee's `pollen` (pollen.ts:71-76, no clock). Dropped:
`shied` (a dart on one leg's count), and on the leg `dash`, `pivots`, `out`
(flight-only). Kept on the leg: `hops` (how it holds an air spot).

By where the current leg goes (`leg.to.kind`):

- **`away`** (it is leaving, `isLeaving`, flight.ts:439) → **dropped**: once
  settled it is gone.
- **`flower`, `cap`, `air`** → seated there:
  `from: to, departs: RESTED_AT, arrives: RESTED_AT,
leaves: max(0, leg.leaves − max(now, leg.arrives))` — the rest of its stay,
  counted from the load. A flier still in flight gets its whole stay.
- **`shelter`** → seated at that shelter seat with `leaves: 0`. No shower is
  under way, so the first tick finds the seat unoffered (`isDue`,
  insects.ts:229) and it comes out from under the cap, as after a shower.
  (Stop-and-report point for the scene step: if a shelter seat cannot be
  drawn without rain, map it to its cap's `cap` perch instead.)

Drawn on load (checked in the code, to be confirmed by a frame):
`InsectView.show` sets `entering` only for a leg from `away`
(insect-view.ts:404), and `perchAt` places caps and flowers from the beds
and an unoffered air spot by its id (`perches.ts:121-141`), so a seated flier
is drawn on its perch wherever it is. A perch out of the eye's reach is
unoffered on the first tick and the flier takes off to a near one, which is
the walk's behaviour today.

### Scene-held state a child would expect back

| State                                                                              | Where                                                                                | Kept?                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visit seed**                                                                     | `meadow-scene.ts:67`                                                                 | **yes — required.** It grows the seeded flower bed (`visitFlowers`, :151, whose ids `pulled` and bee rings name), the opening clump (`firstMeadow`, :146), the layout's flower placement (:403-409), the backdrop's hills and clouds (:415), the grass (:420), the dusk view's and the burrows' streams (:180, :207) and the map (:98). Without it a reloaded meadow is a different meadow. |
| **Openers** (the mushrooms the visit opened with, which place the flowers)         | `meadow-scene.ts:73, 402`                                                            | derived, not kept: `firstMeadow(mulberry32(seed)).mushrooms`, drawn **before** `visitFlowers` from the same `random`, exactly as `create` does now. Taking them from the kept meadow would move every seeded flower once a child had thinned an opener.                                                                                                                                     |
| **Creature streams** (grown mushrooms', released insects', planted flowers' seeds) | `arrivals.ts:49-51`, `planter.ts:73` (`visitSeed ^ 0x7f_10_e5`, meadow-scene.ts:123) | no — see call 8                                                                                                                                                                                                                                                                                                                                                                             |
| **Eye** `{x, y, heading}` and **gait**                                             | `EyeInput` (eye-input.ts:44-63), `Walk` (model/walk.ts:88-115)                       | yes — call 6                                                                                                                                                                                                                                                                                                                                                                                |
| Mouse counts per house                                                             | `MouseRuns.counts` (mouse-runs.ts:90)                                                | no — call 9                                                                                                                                                                                                                                                                                                                                                                                 |
| Runs, worms, open windows, taps, the map open, sounds                              | scene                                                                                | no (transient)                                                                                                                                                                                                                                                                                                                                                                              |
| Colour scheme opening at dusk                                                      | `meadow-scene.ts:145` (`schemeIsDark`)                                               | a kept meadow's `dusk` wins; a fresh one follows the scheme, as today                                                                                                                                                                                                                                                                                                                       |

## 2. Calls

1. **Schema: zod, typed against the model, not the model rewritten from it.**
   `zod` ^4.5 is already a dependency (package.json:61; client code has
   none yet, so `/mushrooms` gains it in its chunk). The source of truth is
   the model's types, spread over a dozen modules; rewriting them as
   schema-inferred types is churn across the game. So the schema is written
   once and pinned to the type: `const KeptSchema = z.object({…}) satisfies
z.ZodType<Kept>`, with every enum from the model's own `const` arrays
   (`MUSHROOM_SPECIES`, `INSECT_KINDS`, `TOWARDS`, `SHELTER_SEATS`, `SIDES`,
   `GAITS`; `WINDOW_KINDS` and `PERCH_KINDS` are module-private today and get
   exported). A drift in the type then fails `pnpm typecheck`. Beats: a
   hand-cast (`as Kept`), which CLAUDE.md forbids at a boundary; and the
   model derived from the schema, correct but a game-wide rewrite.
   `Kept`'s meadow is `Omit<Meadow, 'selected' | 'picking' | 'furnishing' |
'planting' | 'rain'>` with `nightRuns` stored whole (its settled
   `due`/`last` are `undefined`, two optional fields cheaper than a new
   type).

2. **The record and "cannot read".** One IndexedDB record per meadow, key
   = its number: `{ version: 1, seed, meadow, eye, gait }`. `KEPT_VERSION =
1`. _Cannot read_ = the record's `version` is not 1, or `KeptSchema`
   rejects it. Such a record is never written or deleted; the game opens a
   fresh meadow under **highest kept number + 1** ("beside it") and
   rewrites the hash there. A later format bumps the version and adds a
   migration from 1; nothing in this bite migrates. The IndexedDB database
   (`mushrooms`, store `meadows`, `keyPath: 'number'`, db version 1) never
   deletes a store in an upgrade.

3. **Where it lives (FSD).** All inside the `pages/mushrooms` slice — the
   only consumer, so no lower layer (`decisions.md` § DRY, Steiger's
   `insignificant-slice`):
   - `model/keeping.ts` — `settled(meadow, now): KeptMeadow` and
     `reopened(kept): Meadow`, pure; `model/flier-rest.ts` — the fliers'
     settling, pure (kept apart so `keeping.ts` stays small and the flight
     rules stay next to flight).
   - `model/kept-record.ts` — `KeptSchema`, `KEPT_VERSION`,
     `readKept(raw: unknown): Kept | undefined`.
   - `model/meadow-number.ts` — the hash rule, pure.
   - `api/meadow-store.ts` — the IndexedDB adapter (FSD's `api` segment).
   - `api/open-kept.ts` — the boot: storage, hash, record → `Opening`.
     Beats a `shared/lib/storage` (one consumer) and putting IndexedDB in
     `ui/scene` (it is not drawing).

4. **The hash.** `meadowNumber(hash, kept: readonly number[]):
{ number, fresh: boolean }`:
   - `#<n>`, n a positive integer → n; `fresh` when n is not kept (a typed
     `#7` opens a fresh meadow kept as 7);
   - `#new` → `max(kept) + 1` (1 when none), fresh;
   - anything else (bare, `#`, `#0`, `#abc`) → `max(kept)`, else 1 fresh.
     The hash is rewritten with `history.replaceState` (no history entry, so
     Back never replays a `#new`, and no `hashchange` fires). Then the record
     is read; unreadable → call 2's "beside".

5. **When it writes.** Every dispatched action except `tick` writes at once.
   The tick's own changes (legs, sprouts, bee flowers, night runs) and the
   eye's walk write at most once a second, polled from `update`. Writes are
   coalesced, not debounced: one write in flight at a time, and the newest
   record waiting behind it replaces any older one waiting, so a closed tab
   loses at most the write in flight. `visibilitychange` → `hidden` writes
   too. The scene's `dispatch` (meadow-scene.ts:308-323) hands the keeper
   the new meadow after its reconcile; the keeper settles and writes. A
   write that fails after a successful open is **not** covered by the
   contract's "no storage" bullet — **stop-and-report:** the operator
   either approves "log once with `console.error`, stop keeping for this
   load", or wants the error to surface. Recommendation: the first, since
   the meadow on screen is unaffected.

6. **The eye and the gait are kept.** The child reopens where she stood,
   facing the way she faced, on foot or in flight, and the fliers perched
   near her are still near her. Cost: `{x, y, heading}` plus `gait` in the
   record, and `walk.ts`'s `openingWalk` taking the start
   (`openingWalk(camera, from = { eye: OPENING_EYE, gait: 'steps' })`, rise
   `{ from: gaitHeight(gait), startedAt: 0 }`). Beats opening on
   `OPENING_EYE` every load (simpler, but the child loses her place in a
   forest she walked to, and every far flier flies off at once).

7. **Fliers are kept, settled** (fact sheet). Beats dropping them all
   (simpler, but the contract says "perched", and decisions.md says nothing
   is lost).

8. **The RNG on reload: the visit seed is kept; the creature streams are
   seeded afresh each load.** `Arrivals` and `Planter` draw seeds from
   streams off the visit seed (arrivals.ts:49-51, meadow-scene.ts:119-136).
   Restarted on a reload, they repeat: the first butterfly released after a
   reload would be the twin of the first one released before it, against
   "Butterflies are a meadow, not siblings". So a kept meadow gives them a
   fresh `streamSeed` (`Math.random`, seeded in the play run like
   everything else); a fresh meadow passes `visitSeed`, so a fresh visit
   plays exactly as today. Beats keeping the streams' draw counts (more
   state, and the planter draws four at a time).

9. **Mouse counts are not kept.** They are scene state (`MouseRuns.counts`,
   mouse-runs.ts:90), and on load each door brings its mouse again
   (`known`, :94, :154), so a house that had three mice has one. The total
   stays one per door. Alternative: a `mice` map in the record restored into
   `MouseRuns`. The operator decides whether that is noticed; the spec
   leaves it out.

10. **No storage.** `openStore()` resolves `undefined` when reading
    `globalThis.indexedDB` throws (Chrome's opaque-origin sandbox, which is
    the Artifact's) or it is absent, `indexedDB.open` throws or fires
    `error`, or no `success` comes within **2 s** (a `blocked` open or a
    browser that never answers): the child never waits on an empty sky. With
    no store the hash is neither read nor written, no `hashchange` listener
    is set, and the game opens `{ seed: random, streams: seed }` as today.
    This open-time fallback is the contract's fifth bullet, so it is not a
    silent swallow; anything else that throws in the boot propagates.

11. **Booting async without changing the callers.** `startGame(parent)`
    (ui/scene/start-game.ts:15) stays synchronous and keeps its signature:
    inside, it awaits `openKept()` and builds the `Phaser.Game` when it
    resolves, unless `stop()` came first; a rejection is rethrown through an
    `onError` the canvas passes in (meadow-canvas.tsx already turns a failure
    into a render-time throw). The Artifact entry
    (`scripts/build-mushroom-artifact.ts:53-57`) then needs no change. The
    scene takes the opening through its constructor
    (`scene: [new MeadowScene(opening)]`): the target is ES2017, so a
    parameter property is assigned before the field initializers that read
    the seed (`planter`, `arrivals`).

12. **`hashchange` while playing reloads the page** (`location.reload()`),
    only when a store is open. Everything is already kept, and the boot is
    the one path that opens a meadow. Beats switching the scene live
    (tearing down every bed for a case a child reaches only by editing the
    URL).

13. **Opening a kept meadow draws it at rest, silently.** The mushroom bed
    already opens without pop-ins (`reconcile(…, true)`, meadow-scene.ts:183,
    mushroom-bed.ts:109-150). Two beds do not: `FlowerBed.reconcile` treats
    every planted flower as just planted and leads the melody with it
    (flower-bed.ts:179-188), and the flowers and insects are only reconciled
    on a dispatch that changes them. `create` therefore reconciles the
    flowers with a new `opening` flag (shown open, no sound, no bloom) and
    the insects once.

14. **Two tabs on one meadow:** the last writer wins. Accepted, not
    handled (no `BroadcastChannel`).

15. **The play run's fresh meadow.** Every play opens a new target in one
    browser profile (`scripts/play-mushrooms.ts:158-203`), so with keeping
    the second play would reopen the first play's meadow. Each play gets
    its own `Target.createBrowserContext` (in-memory storage, thrown away
    with it), and its `createTarget` passes that `browserContextId`. Beats
    navigating to `#new` (meadows pile up, numbers drift between plays).

## 3. Steps

Each step is one agent's work, with its tests, `pnpm typecheck`,
prettier and eslint on its files. Steps 1, 2 and 3 touch disjoint files and
can run **in parallel**; 4 needs 1 and 2; 5 needs 3 and 4; 6 needs 5.

### Step 1 — settled at rest (pure)

- New: `model/keeping.ts` (`RESTED_AT`, `KeptMeadow`, `settled`,
  `reopened`), `model/flier-rest.ts` (`restedFliers(insects, now)`), their
  `*.test.ts`.
- Tests: on meadows played through the real reducer (`opened` in
  `ui/scene/visit-play.ts`, with showers and released fliers; `reduce` for a
  dusk turned midway and a shower under way): every rule reads rest —
  `isOld` and `sproutScale` 1 for every mushroom, `raining`/`wetness`/
  `rainbow` 0, `duskness` 0 or 1 at `now = 0`, no flier `isAloft` at 0 and
  none leaving, `sproutedInRain` on the result returns it unchanged; a
  spore lying in a shower under way comes up; `reopened(settled(m))` has
  the pickers shut. Settling twice equals settling once.
- Must not touch: `game.ts`, `insects.ts`, `flight.ts`, any `ui/` file.

### Step 2 — the record and the hash (pure)

- New: `model/kept-record.ts` (`KEPT_VERSION`, `KeptSchema satisfies
z.ZodType<Kept>`, `readKept`), `model/meadow-number.ts`, their tests.
- Touched: `model/house.ts` (export `WINDOW_KINDS`), `model/flight.ts`
  (export `PERCH_KINDS`) — one word each.
- Tests: `readKept` round-trips a settled played meadow (deep-equal);
  rejects version 2, a missing field, a wrong species; `meadowNumber` over
  every row of call 4.
- Builds on: step 1's `KeptMeadow` type. If step 1 is not committed yet,
  step 2 declares `Kept` over `Omit<Meadow, …>` itself in `kept-record.ts`
  and step 1 imports it from there — agree which file owns `KeptMeadow`
  before both start (recommendation: `kept-record.ts` owns the types,
  `keeping.ts` the functions).
- Must not touch: `ui/`, `api/`.

### Step 3 — the eye's start (pure)

- Touched: `model/walk.ts` (`openingWalk(camera, from?)`), `model/walk.test.ts`
  (`eyeAt(openingWalk(camera, from), t)` returns `from.eye` and its gait,
  the eye at the gait's height from the first frame).
- Must not touch anything else. Fits in a parallel slot with 1 and 2.

### Step 4 — the store and the boot

- New: `api/meadow-store.ts` (`openStore(): Promise<Store | undefined>`,
  `Store.numbers()`, `read(n): Promise<unknown>`, `write(n, record)`),
  `api/open-kept.ts` (`openKept(location, history): Promise<Opening>`,
  `Opening = { seed, streams, kept?: Kept, keep?: (record) => void,
number? }`), and the keeper (`api/keeper.ts`: coalesced writes, call 5's
  failure handling as the operator decides).
- Tests: the keeper's coalescing against a fake `Store` (an in-memory
  object behind the same type — the adapter boundary, as CLAUDE.md's "mock
  at the boundary" asks); `openKept` with a fake store and a fake
  location/history: bare → highest, `#new` → next and replaced, unreadable
  → beside, untouched record. `meadow-store.ts` itself has no unit test
  (node has no IndexedDB); the play run covers it.
- Must not touch: `ui/`, the model files of steps 1-3.

### Step 5 — the scene wired

- Touched: `ui/scene/start-game.ts` (call 11), `ui/meadow-canvas.tsx`
  (pass `onError`), `ui/scene/meadow-scene.ts` (opening via constructor:
  seed, openers from `firstMeadow`, the kept meadow through `reopened`,
  `streams` to `Arrivals`/`Planter`, the eye and gait to `EyeInput`; the
  keeper after `dispatch`, the once-a-second poll, `visibilitychange`, the
  `hashchange` reload), `ui/scene/eye-input.ts` (start eye),
  `ui/scene/flower-bed.ts` (`opening` flag, call 13). To stay under the
  cap, the boot (`Opening` → meadow, openers, flowers) moves out of the
  scene into a new `ui/scene/meadow-opening.ts`.
- Tests: `pnpm typecheck`, `meadow-rules.test.ts`, `flower-bed`'s and
  `eye-input`'s tests where they exist; no new pure logic lands here.
- Play-run check (a screenshot looked at by eye is the model): one screen,
  tabL — grow, furnish, plant, turn to dusk, walk, reload; the frame after
  reload shows the same meadow at dusk from the same place, nothing popping
  in, no notes played.
- Must not touch: `model/` beyond steps 1-3's exports, `scripts/`.

### Step 6 — the play run keeps

- Touched: `scripts/play-mushrooms.ts` (a browser context per play, call
  15), new `scripts/lib/play-keep.ts` (the `keep` play: grow two, furnish
  one, plant one, turn to dusk; `Page.reload`; assert by `__probe` reads
  that mushrooms, houses, planted and `dusk.toward` came back and the hash
  is `#1`; navigate to `#new`: hash `#2`, two mushrooms, daylight; frames
  `keep-before`, `keep-after`, `keep-new`), `PLAYS` gains `keep`.
- Run: `flock …/tmp/site.lock pnpm play:mushrooms --screens tabL --plays
keep,meadow`.
- Must not touch: `src/`.

Then the orchestrator republishes the Artifact (it opens fresh in the
sandbox: no storage) and adds to `to-check.md`, in Russian:

- **Перезагрузка (бит 18).** На планшете Сямы: посадить, построить дом,
  включить сумерки, закрыть вкладку, открыть снова — та же поляна, там же,
  в сумерках, насекомые сидят?
- **`#new` и номера.** Ссылка с `#new` открывает новую поляну `#2`; голая
  ссылка — последнюю; `#1` — первую.
- **Приватное окно.** Открывается свежая поляна и ничего не ломается.
- **Мыши.** После перезагрузки в каждом доме с дверью по одной мыши, как
  бы их ни было до неё — заметно ли?
- **Артефакт.** Открывается свежая поляна, как раньше.

## 4. Collision list

| File                        | Lines now | Step | Grant                                                                                                    |
| --------------------------- | --------- | ---- | -------------------------------------------------------------------------------------------------------- |
| `ui/scene/meadow-scene.ts`  | 443       | 5    | net ≤ +5, by moving the boot into `meadow-opening.ts` (and `mapShot`/`controlScene` beside it if needed) |
| `ui/scene/flower-bed.ts`    | 450       | 5    | net 0: the `opening` flag pays for itself or a helper moves out                                          |
| `model/walk.ts`             | 449       | 3    | net ≤ +2 (the default parameter)                                                                         |
| `model/flight.ts`           | 445       | 2    | net 0 (`export` on an existing line)                                                                     |
| `model/game.ts`             | 430       | —    | untouched                                                                                                |
| `ui/scene/insect-view.ts`   | 439       | 5    | untouched unless the load frame shows a flier drawn off its perch; then net ≤ +5                         |
| `scripts/play-mushrooms.ts` | 439       | 6    | net ≤ +8 (the context per play, `keep` in `PLAYS`)                                                       |
| `ui/scene/eye-input.ts`     | 236       | 5    | free                                                                                                     |
