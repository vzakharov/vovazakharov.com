# Map — spores the child sows (bite 14, calls 30–35, 31 as amended, 38)

The mapping agent M's hand-over. Paths are under `src/pages/mushrooms/`
unless they start with `scripts/`. Line numbers are at 688d950. Each step
below is one agent; each leaves `pnpm typecheck` green on its own.

## 1. The retiring shed: every call site and what it becomes

| Where                                                     | What                                                                          | Becomes                                                                                                                                                        |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model/sprouting.ts:28-31`                                | `SPROUTS` 3, `PARENTS` 2                                                      | `SPORE_SEATS = 6` (call 31) in step a; `SPROUTS`/`PARENTS` deleted in d                                                                                        |
| `model/sprouting.ts:38-43`                                | `SHED_WINDOW_MS`, `SHED_SALT`, `PARENT_SALT`                                  | `SHED_SALT` → `SPORE_SALT` (same value, a: added; d: old name gone); the other two deleted (d)                                                                 |
| `model/sprouting.ts:51-63`                                | `Shed`, `Shedding`, `Shedder`                                                 | replaced by `Spore`, `Spored` (a); deleted (d)                                                                                                                 |
| `model/sprouting.ts:83-88`                                | `dueShed`                                                                     | deleted (d)                                                                                                                                                    |
| `model/sprouting.ts:90-103, 121-130`                      | B1's parent draw (call 28): `lastShedSpecies`, the salted ordering            | deleted (d) — the child picks the parent by tapping it                                                                                                         |
| `model/sprouting.ts:113-138`                              | `shedding`                                                                    | deleted (d)                                                                                                                                                    |
| `model/sprouting.ts:146-171`                              | `sprouted(meadow, {now, shed})`                                               | deleted (d); the rain's `sproutedInRain(meadow, now)` (a) replaces it                                                                                          |
| `model/game.ts:36-40`                                     | imports `Shed`, `Shedding`, `sprouted`                                        | `Spored`, `sown`, `unsown`, `sproutedInRain` (a); old names dropped (d)                                                                                        |
| `model/game.ts:85`                                        | `} & Shed;`                                                                   | `} & Shed & Spored;` (a), `} & Spored;` (d)                                                                                                                    |
| `model/game.ts:112`                                       | tick `& Shedding`                                                             | dropped (d)                                                                                                                                                    |
| `model/game.ts:136`                                       | `shed: undefined`                                                             | `spores: [], settled: 0` (a); `shed` line gone (d)                                                                                                             |
| `model/game.ts:435-438`                                   | tick: `sprouted(meadow, action)`                                              | `sproutedInRain(sprouted(meadow, action), action.now)` (a); `sproutedInRain(meadow, action.now)` (d)                                                           |
| `ui/scene/shedding.ts` (whole)                            | `shedIn`, `shedNow`, `footShown`                                              | deleted (d); `shedding.test.ts` with it                                                                                                                        |
| `ui/scene/meadow-scene.ts:36, 200`                        | import of `shedNow`; the tick's `shed: shedNow(scened, bed, time)`            | both lines deleted (b)                                                                                                                                         |
| `ui/scene/mushroom-bed.ts:49, 179-181`                    | `footShown` import; `inSight` (only `shedNow` and the probe read it)          | deleted (d) — the probe stops reading it in c                                                                                                                  |
| `ui/scene/mushroom-bed.ts:131` + `spore-drift.ts:299-334` | `driftSpores`: a newborn sprout's parent puffs and dots arc to it             | a newborn sprout pops at its own foot (puff at `BIRTH_PUFF * SPROUT_START`, grow sound); no parent lookup — so no throw when the parent was sunk (call 34) (b) |
| `ui/scene/visit-play.ts:17-21, 29, 41, 48, 86-92`         | `opened`'s `showers`: shed at each stop                                       | sow then rain (c)                                                                                                                                              |
| `ui/scene/visit-play.test.ts:20-41`                       | the shed case                                                                 | the sow-then-rain case (c)                                                                                                                                     |
| `model/sprouting.test.ts:95-276`                          | `shedding`, the tick carrying a shed                                          | sow/unsow/rain cases (a); old cases deleted (d)                                                                                                                |
| `scripts/lib/mushroom-probe.ts:482-519, 676-690`          | `sprouts()` and its `Sprouts` schema (`shed`, `oldInSight` via `bed.inSight`) | rewritten (c), § 4                                                                                                                                             |
| `scripts/lib/play-sprouts.ts` (whole)                     | the `sprouts` play                                                            | rewritten (c), § 4                                                                                                                                             |
| `scripts/sweep-mushrooms.ts:14-22, 55-59, 123-160`        | `--showers`                                                                   | re-meant (c), § 4                                                                                                                                              |

`model/game.test.ts` has no shed case; its `select` literals keep compiling
(the payload is optional).

## 2. What is reused

- **`roomFor(stand, seed, view, near)`** (`ui/scene/mushroom-room.ts:280`)
  and through it **`pickFoot`'s `near: { ground, reach: SPROUT_REACH }`**
  (`model/placement.ts:153`, `Near` at :112). One call per tap, the tap's
  seed, `near` the parent's stored foot — exactly one iteration of
  `shedIn`'s loop. It judges at full size (call 21 dropped back), so a spore
  is laid by the very rules a sprout's foot was.
- **The sprout clock**: `Sprout = Parented & Stamped`, `Sprouting`,
  `isOld`, `sproutScale`, `SPROUT_START`, `SPROUT_MS`, `SPORE_FALL_MS`
  (`model/sprouting.ts:32-81`) — kept whole.
- **`spore-drift.ts`'s arc**: `fall(scene, from, to, r, depth, landed)` and
  `arcAt` (:359-411), `crownOf` (:290). `fall` is exported and its `sprout:
Shown` parameter loosened to a `() => Point` for the foot, so the settle
  drops one dot (`DOTS` → a parameter, 1 for a spore) from the parent's
  crown to the spore's foot over `SPORE_FALL_MS`, then `landed` shows the
  resting dot.
- **The salted seed stream**: `nextSeed(saltedStream(parent.seed,
SPORE_SALT, meadow.settled))` (`model/random.ts:42, 117`) — the spore's
  seed, the foot search's seed and the sprout's seed are one number (call
  17).
- **The tap's puff path**: `MushroomBed.tap` (`mushroom-bed.ts:421-427`)
  already puffs from the crown and calls `onTap(id)`; the spore rides that
  same `onTap`. `puffSpores` (`spores.ts:70`) makes the pick-up's tiny puff;
  `voice.pop()` (`sound.ts:224`) its soft sound.
- **Crowding**: `isFull`/`isCrowdedAt` (`model/crowding.ts:30, 56`) — their
  `Stand` learns spores, so every count (the model's `grow`/`pick`, the
  `+` control's `growable`, `roomFor`'s `admits`) takes spores in one edit.
- **Placement**: `laidOf`, `viewedOrLaid`, `standAt` (`clump-layout.ts:205`,
  `bed-place.ts:165, 200`) — the dot is stood as the mushroom's shadow is
  (`standAt(dot, place, SHADOW_NEARER)`), so it sorts, sinks under the brow
  and hides off the sides with its row.
- **`PALETTE.spore`** (`palette-creatures.ts:74`, 0xfff6d8) with the ink rim
  `fall` already gives a dot. A white of its own goes in that file only if
  the frames show the cream lost on the grass.
- **`TAP_RADIUS`** (`ui/scene/tap-reach.ts:17`) for the spore's reach.

## 3. The new shape

### Model (`model/sprouting.ts`)

```ts
export const SPORE_SEATS = 6;
/** How long after the dark sets in the spores may sprout, each at its seed's moment. */
const SPROUT_WINDOW_MS = 6000;
const SPORE_SALT = 0x3c_9e_51_a7;   // SHED_SALT's value
const MOMENT_SALT = <new>;

/** A spore on the ground: the sprout it will be, its `at` when it settled. */
export type Spore = Placed & Sprout;          // id, seed, species, foot, lean, parent, at
/** `Mushroom & Footed`, named: `Planted` and `Spore` both spell it (type-overlap floor 2). */
export type Placed = Mushroom & Footed;        // Planted becomes Placed & Housed & Sprouting
export type Spored = { spores: readonly Spore[]; settled: number };  // settled: ids and seeds
```

- **`sowable(meadow, id, now): Seeded | undefined`** — the seed the next
  spore of `id` grows from, or `undefined` when `id` is unknown, not
  `isOld`, already has `SPORE_SEATS` spores, or the field `isFull`. The
  scene calls it before searching; the reducer calls it again.
- **The tap action's payload**: `select` gains `spore?: Footed & Timed` —
  the foot the scene found and the tap's moment.
  `({ kind: 'select'; spore?: Footed & Timed } & WithId)`.
- **`sown(meadow, action)`** — the reducer's re-check: `sowable` again
  (same seed, deterministic), then `!isCrowdedAt(meadow, foot)` as `grow`
  re-checks; appends `{ id: \`spore-${settled + 1}\`, seed, species of the
  parent, foot, lean, parent: id, at: now }`, `settled + 1`. Same object
when no payload or the check fails. The `select`case spreads`...sown(meadow, action)`where it spreads`...meadow` today, so
  selection is unchanged (call 30 "beside the puff it already makes").
- **`unsow` action (call 38)**: `({ kind: 'unsow' } & WithId)`; `unsown`
  filters the spore out, same object when unknown. It changes no selection
  and no picker (decision, § 7).
- **The rain's sprout moment** (call 34). "The dark sets in" is the
  meadow's wetness reaching 1: `wetness` (`model/weather.ts:32`) eases in
  over `WET_MS` 1500 from `startedAt`, and the sky's and clouds' darkness
  are that wetness (`rain-sky.ts`'s `cloudDarkness`, lagged ≤ 600 ms per
  cloud). `weather.ts` gains `export function darkAt(rain) { return
rain.startedAt + WET_MS; }`. A spore's moment in `rain`:
  `m = darkAt(rain) + saltedStream(seed, MOMENT_SALT, rain.startedAt)() *
SPROUT_WINDOW_MS` — 1.5 to 7.5 s into a 10 s shower, stable when a tap
  lengthens it (`startedAt` is kept).
- **`sproutedInRain(meadow, now)`**: for each spore with `rain` defined,
  `spore.at < m`, `m <= now`, `m < rain.stopsAt`: `grown + 1`, a `Planted`
  `{ id: \`mushroom-${grown}\`, seed, species, house: EMPTY_HOUSE, foot,
  lean, sprout: { at: m - SPORE_FALL_MS, parent } }`, the spore dropped. The
`at`is backdated by`SPORE_FALL_MS`so the sprout shows at 0.4 the
moment the dot goes (the fall was spent on the tap); call 16's clock is
untouched. No crowding re-check — the spore already held its place in
every count. Same object when nothing sprouts; first line`if
  (meadow.spores.length === 0 || meadow.rain === undefined) return meadow`
  keeps the per-frame tick free. Out of sight too: the tick runs on the
  meadow, not the screen.

### Counts (`model/crowding.ts`)

Its local `Stand` becomes `{ mushrooms: readonly Stood[]; spores: readonly
Stood[] }`; `isFull` counts `mushrooms.length + spores.length`;
`fullRound` runs over both. Callers pass a `Meadow` or a scene `Stand`, both
of which carry `spores` once `flower-sight.ts:69`'s `STOOD` gains
`'spores'`. Consequence a player sees: six spores round a full clump make
`+` refuse sooner — call 31 as written.

### Scene

- **Seat search** — new `ui/scene/spore-seats.ts` (it replaces
  `shedding.ts` as the scene's half): `sporeOnTap({ meadow, stand, view }:
Pick<Scened, …>, id, now): Pick<…, 'spore'>` — `sowable`, then
  `roomFor(stand, seed, view, parent.foot)`; `{}` when either is
  `undefined`. `meadow-scene.ts:140-142`'s `onTap` becomes
  `this.dispatch({ kind: 'select', id, ...sporeOnTap(this.scened, id, this.clock * 1000) })`.
  `roomFor`'s `feet` (`mushroom-room.ts:303`) takes spores' feet too, so
  a new spore or mushroom keeps clear of every dot (call 31 amended:
  "clear of every mushroom, sprout and spore").
- **The dots** — new `ui/scene/spore-bed.ts`, a `SporeBed` the
  `MushroomBed` owns (so `meadow-scene.ts` gains nothing for drawing):
  `reconcile(spores, shown, layout, opening)` — a new id gets a circle
  (radius a few px at the clump's depth × `stands.zoom`), a `fall` from its
  parent's crown unless opening, then rests; an id gone is destroyed.
  `follow(view)` stands each by `viewedOrLaid` + `standAt(…, SHADOW_NEARER)`
  and hazes it as the bed hazes a mushroom (`hazeHere`'s rule); `sporeAt(at:
Point): string | undefined` — the nearest drawn dot within `TAP_RADIUS`;
  `pickUp(id)` — tiny `puffSpores` at the dot and `voice.pop()`. Bed hooks:
  one line each in `reconcile`, `follow`, `update` (if the haze needs the
  clock), plus `sporeAt`/`pickUp` delegates.
- **Tap routing (call 38)**. Mushrooms, insects, controls and doors are
  Phaser-interactive; `meadow-scene.ts:334-345`'s `tapMeadow` runs only
  when `over` is empty, then tries a cloud, then a tuft (`grass.at`), else
  deselects. The dot stays **non-interactive** and is tried in `tapMeadow`
  between the cloud and the tuft:
  `const spore = this.bed?.sporeAt(at); if (spore) { this.bed?.pickUp(spore); this.dispatch({ kind: 'unsow', id: spore }); return; }`
  — so a mushroom's drawn outline wins (its interactive hit runs first),
  a spore beats a tuft, a cloud beats a spore (the sky has no spores). An
  interactive circle was measured out: Phaser's top-only pick sorts by
  depth, so a dot in front of a farther mushroom would take a tap on that
  mushroom's outline, against call 38.

## 4. Outside `src/pages/mushrooms/`

- **`scripts/lib/mushroom-probe.ts` `sprouts()`** → `sprouts()` returns
  `{ spores: [{ id, parent, shown, at: Point | null (its screen point, for a
tap), apart }], sprouts: [as today, minus nothing] }`; `shed` and
  `oldInSight` go (and with them the probe's read of `bed.inSight`). `apart`
  keeps today's unit (clump sizes at the parent's zoom). Schema `Sprouts`
  (:676) follows.
- **The `sprouts` play** (`scripts/lib/play-sprouts.ts`; its name and its
  row in `play-mushrooms.ts:94` unchanged, so the runner is not touched):
  1. tap the opening clump's front cap (`__probe.mushroom(id)`) three
     times, a few frames apart → three spores, each `shown`, each of that
     parent, each `apart <= SPROUT_REACH * SLACK`; frame `sprouts-1-sown`
     after the first fall has landed.
  2. tap one spore's point → one fewer spore, and `__probe.state()` shows
     no flower picker open (call 38's "never opens the flower picker by
     surprise"); frame `sprouts-2-picked`.
  3. tap a cloud, step to `darkAt + SPROUT_WINDOW_MS` plus slack → no spore
     left, as many sprouts as there were spores, each `ofParent` and
     `shown`; frame `sprouts-3-pop`. The 24 timed frames round the pop stay.
  4. step 20 s → each grew; frame `sprouts-4-grown`.
- **`scripts/sweep-mushrooms.ts --showers N`** and `visit-play.ts`'s
  `opened(…, showers)`: a round = every old mushroom in the view sown up to
  `SPORE_SEATS` (`sowable` + `roomFor` near + `reduce(select with spore)`,
  stopping at the first miss), then `rain` and a tick at `stopsAt`. The
  line reports spores sown, sprouts, and the share of mushrooms that found
  all six; R1's check runs as today over the result. Cost to watch: up to 72
  `near` searches a round per visit (≈10 ms each by P2's 30 ms per
  three-seed shed) — print the ms a visit as now.

## 5. The step cut

Measured `wc -l` at 688d950: `model/game.ts` 443, `ui/scene/mushroom-bed.ts`
429, `ui/scene/meadow-scene.ts` 448. Cap ~450.

### (a) Model — spores, sow, unsow, rain sprouting; the shed kept as a shim

- **Owns**: `model/sprouting.ts`, `model/sprouting.test.ts`,
  `model/game.ts`, `model/crowding.ts`, `model/weather.ts` (`darkAt` only),
  `ui/scene/flower-sight.ts` (`STOOD` line only), the `spores: []` lines in
  `ui/scene/flower-sight.test.ts:79` and `flower-plots.test.ts:92`,
  `ui/scene/mushroom-room.ts` (`feet` takes spores; ±2 lines),
  `ui/scene/shedding.ts` and `model/sprouting.ts`'s `sprouted` only as far
  as the crowding `Stand` change forces (`{ mushrooms, spores }`).
- **Functions**: `sowable`, `sown`, `unsown`, `sproutedInRain`, `darkAt`;
  `reduce`'s `select`, new `unsow`, `tick`; `firstMeadow`; `isFull`,
  `fullRound`'s callers; `Planted` re-spelt on `Placed`.
- **Tests**: `sprouting.test.ts` (new: sow cap at 6, not old refuses,
  crowded refuses, seed deterministic and new each tap, unsow, moment inside
  [darkAt, darkAt+6 s), a spore settled after its moment waits for the next
  shower, sprouting out of sight, sunk parent still sprouts, same object
  with nothing due), `game.test.ts`, `weather.test.ts`, `placement.test.ts`,
  `mushroom-room.test.ts`, `flower-sight.test.ts`, `flower-plots.test.ts`,
  `shedding.test.ts`, `visit-play.test.ts` (shim still green);
  `pnpm type-overlap`.
- **Grant `game.ts`**: net ≤ **+7** (→ 450): `firstMeadow` +2, the `unsow`
  action +2, its case +3; `select` spreads `sown(…)` in place, `tick` wraps
  in place. If prettier wraps the `select` union member past that, move the
  furnishing helpers (`withPiece`, `newestWithRoom`, `furnishedTarget`,
  `canFurnish`, ~45 lines at :152-215) to a new `model/furnishing.ts`
  first, repointing `controls.ts`, `planter.ts`'s imports if any of those
  are theirs (`canFurnish` is `controls.ts`'s).
- No grant on the bed or the scene.

### (b) Scene — the settle on tap, the dots, the pick-up, the sprout's pop; the shed wiring out

- **Owns**: new `ui/scene/spore-seats.ts` (+ a test of `sporeOnTap` on the
  opening stand: a foot within `SPROUT_REACH`, none at six, none for a
  growing sprout), new `ui/scene/spore-bed.ts`, `ui/scene/spore-drift.ts`
  (`fall` exported and loosened, `driftSpores`' sprout branch → own-foot
  pop), `ui/scene/mushroom-bed.ts`, `ui/scene/meadow-scene.ts`,
  `palette-creatures.ts` only if a white of its own is needed.
- **Grant `mushroom-bed.ts`**: net ≤ **+8** (→ 437): field + construct +2,
  `reconcile`/`follow`/`update` +3, `sporeAt`/`pickUp` delegates +3.
  `driftSpores`' call stays one line.
- **Grant `meadow-scene.ts`**: net ≤ **+2** (→ 450): −2 (`shedNow` import
  and the tick's `shed:` line), +1 import of `sporeOnTap`, `onTap`'s
  dispatch reflowed (+0…+2), the spore branch in `tapMeadow` (+2…+3). If it
  lands at 451+, move `tapMeadow`'s body to a pure `groundTap(at, {rain,
bed, grass})` in a new `ui/scene/ground-tap.ts` returning which of cloud /
  spore / tuft / none took it, the scene keeping a three-way switch — not
  before measuring.
- **Look**: `/preview` or a `--no-build` play frame of three dots round a
  cap, one picked up, and the pop under rain. The old `sprouts` play fails
  at run time from here until (c) — it types, so `pnpm typecheck` is green.
- **Tests**: `spore-seats.test.ts`, `mushroom-room.test.ts`,
  `perches.test.ts`, `mushroom-tap.test.ts`; `pnpm typecheck`.

### (c) Probe, play, sweep, visit

- **Owns**: `scripts/lib/mushroom-probe.ts` (`sprouts()` and `Sprouts`
  only), `scripts/lib/play-sprouts.ts`, `scripts/sweep-mushrooms.ts`,
  `ui/scene/visit-play.ts`, `ui/scene/visit-play.test.ts`.
- § 4 for each. `visit-play.ts` stops importing `shedding`/`shedIn`/
  `sprouted`; `SHOWER_EVERY` keeps `RAIN_MS + SPORE_FALL_MS + SPROUT_MS`.
- **Tests**: `visit-play.test.ts` (no showers opens as before; one round: a
  sprout per spore, each of its parent's species within `SPROUT_REACH`;
  two rounds extend one), `pnpm sweep:mushrooms --showers 1` on two
  viewports, `pnpm play:mushrooms sprouts` under the site lock.

### (d) Retire the shed

- **Owns**: `model/sprouting.ts`, `model/sprouting.test.ts`,
  `model/game.ts`, `ui/scene/shedding.ts` + `.test.ts` (deleted),
  `ui/scene/mushroom-bed.ts` (`inSight` and the `footShown` import out).
- Everything marked (d) in § 1. **Grants**: `game.ts` net ≤ −2,
  `mushroom-bed.ts` ≤ −5. Small enough to fold into (c) if one agent has
  room.
- **Tests**: `sprouting.test.ts`, `game.test.ts`, `pnpm typecheck`,
  `pnpm type-overlap`, a grep for `shed` under the game and `scripts/`.

## 6. Collisions

- **C37** (`model/stride.ts`, `model/walk.ts`, `ui/scene/eye-input.ts` and
  tests): no step touches them.
- **FB** (`scripts/lib/frame-budget.ts`, the runner's budget lines in
  `scripts/play-mushrooms.ts`): (c) leaves `play-mushrooms.ts` untouched —
  the play keeps its name and row — and `play-sprouts.ts` reads only
  `page.rendered`. No collision.
- Inside the bite: (a) and (b) both touch `mushroom-room.ts` — (a) the
  `feet` line only; run them in order.

## 7. Calls that hold only on a reading, with the options

1. **Call 34 is silent on a spore settled during a shower after its
   moment** (a tap at 8 s). Options: (i) it waits for the next shower —
   the rule `spore.at < m` gives this, and the child sees the dot stay; (ii)
   it sprouts at once, `max(m, at + SPORE_FALL_MS)` — the dot lands and
   pops in the same breath, so the dot is barely seen (call 30's "each tap
   leaves a dot" lost for that tap). The map takes (i); the orchestrator's
   call.
2. **Call 16's hidden `SPORE_FALL_MS` against call 34's "the dot is gone as
   the sprout pops"**: held by backdating the sprout's `at` by
   `SPORE_FALL_MS`, so the clock is unchanged and nothing is hidden at the
   rain. The other reading — the sprout hidden 0.7 s after the dot goes —
   leaves an empty gap on the ground.
3. **Call 33's "under every mushroom"**: taken as the dot sorting with its
   own row a shadow's step nearer (`SHADOW_NEARER`), so a mushroom standing
   nearer covers it and one farther does not. A depth under every mushroom
   would hide a dot in front of a farther mushroom's stem — wrong in
   perspective.
4. **Call 31's "laid as a sprout at its start size would be"**: `roomFor`
   judges at full size (call 21 dropped back), so the spore is laid by the
   sprout's actual rules — stricter, never looser.
5. **Call 38's pick-up and the selection**: a spore tap changes neither the
   selection nor a picker — a tap on bare meadow deselects today, a spore
   tap does not. The other reading (it deselects as bare ground does) is
   one line in `unsown`.
6. **Per-tap cost**: one `near` search on the tap frame, ≈10 ms by P2's
   figure. No call promises a frame budget for a tap; the play's frame
   after the tap shows it.
