# Relay 7 — the hubs flipped, the engine and the flower's fork to go

The elephant is MASD (PR #169, branch `claude/multi-app-sliced-design-7bn3oq`). This branch, `masd/one-page-measure`, is PR #216, based on the elephant, and carries bites 6a (significance by modularity) and 6b (the mushroom game split into slices). `relay-3.md` through `relay-6.md` beside this file cover the sessions before; this relay covers the session that picked up relay 6.

## Standing constraints

- «не надо гонять игру на каждом пуке … по крайней мере не делать это до финалайза» — no `play:mushrooms` or other runs of the game before `/finalize`.
- «делай, по результатам будем смотреть» — build through and bring results; don't stop on each call.

## The conversation

1. **Operator** (launch): `/relay take masd/one-page-measure — дочинить десять ошибок типов, развязать оставшиеся три узла игры и движок раскладки, разложить по слайсам и принести результат`
   **Agent:** attached (the session started on a detached HEAD at the relay commit, so there was no auto-branch to delete), set the estimate, flipped the plan to in-progress, cleared the ten type errors and flipped the three hubs (`game.ts`, `MeadowSound`, the planter's `MeadowSeen`/`StandSeen`/`Dispatching`), taking the layout from 171 broken imports to 138. At the context budget's 300k warning it paused the plan and relayed, with no operator message in between. No Last agent turn section: the whole session was this one turn, and `scripts/relay-last-reply.py` reads only the turns before the relay's.

## Intent

Unchanged from relays 5–6: the game cut by nouns — base entities never import one another, an encounter is a feature named for what happens, the whole sits above in `widgets/meadow` if modularity passes it — as the test of 6a's significance rule, built through to a result the operator can look at. No hacks that only quiet a checker (no casts, no suppressions without the operator), nothing dumped in `shared` to dodge a rule.

## Decisions

All of relays 3–6's hold. Added here, all under «делай», to be reported to the operator with the result:

- **The anchored stand rebuilds its layout instead of caching it.** A module-level cache cannot carry a generic `L`, and `@typescript-eslint/no-unsafe-type-assertion` is on (a cast would need `as unknown as` and a suppression). So `anchored-stand.ts` caches only `Reseeded` (the flowers' anchored feet, the seeded flowers, `from`) per layout and builds `{ ...layout, mushrooms: anchoredGround(…), flowers }` afresh. Layout identity mattered to `flower-sight`'s two stores, which now key on `layout.mushrooms` (`perGround`): everything they measure is a function of the ground (camera, screen height, insect sizes from `unit`, anchor), and `anchoredGround` already keeps one object per anchor. A non-generic `anchoredStand` was tried and rejected: its callers (`perches`, `tending`, `mushroom-room`) need their own `L` back.
- **`everyButton`** (`EveryButton` in `mushroom-room.ts`): every control's hit area, pickers included, laid by `layout.ts`, so `mushroom-room` no longer reads `Controls` from `sky-layout` (widget).
- **`model/planted.ts`** in `entities/mushroom`: `Planted`, `Placed`, `Sprout`, `Sprouting`, `Spore`, `WithMushrooms`, `WithSpores`, `Grown`, `WithSelected`, `Deselect`, `isOld`, `sproutScale`, `SPROUT_*`. `sown`, `unsown`, `sproutedInRain` are generic `<M extends …>(meadow: M): M`; `furnishing` reads `WithMushrooms & WithSelected`.
- **Homes for the rest of `game.ts`**: `sameFoot` → `ground.ts`; `Timed` → `motion.ts`; `WithDusk`, `DuskFrom`, `TurnLight` → `dusk.ts`; `WithRain`, `StartRain` → `weather.ts`; `WithPulled` → `flower-genes.ts`; `Tended` → `flower-sight.ts` (game imports it from there); the flower picker's `Chosen`, `Planting`, `shapeSeed`, `PickColour`, `PlantShape`, `HoldFlower` → new `model/flower-planting.ts` (`entities/flower`). `Action` is the union of those variants and the rest.
- **`dusk` and `weather` re-laid to `shared/world`**: the world's clock of light and rain, read by windows, fireflies and flowers alike — not the sky's. `dusk-view` re-laid to the widget (it composes the moon and the fireflies). `Lights` → `windows-lit.ts`, `DUSK_WASH_DEEPEST` → `palette-dusk.ts`.
- **Voices**: each `MeadowSound` reader declares what it calls — `Wriggling` (house-worm), `MouseVoice` (mouse-runs), `Popping` (spore-bed), `Growing` (spore-drift), `DuskVoiced = Growing & …` (dusk-view), `RainSound` (rain-view), `Glinting` (firefly-view), `Waking`/`Keyed` (instrument), `SoundPlanting` (instrument-input); `PlanterVoice = Popping & { nuhUh }`; `MeadowSound implements` them all.
- **`model/acting.ts`** (`shared/world`): `Dispatching<A>`, `MeadowSeen<M>`, `StandSeen<S>` — generic so a member like `dispatch` has one home (`pnpm type-overlap`); readers pass their slice, the widget passes `Meadow`/`Action`.
- **Terms**: as relay 6 (_hub_, _flip the arrow_, _engine_). _Cascade root_: an edge whose fixing lifts many files at once, as `lift.ts` shows.

## Errors and dead ends

- `as SeededLayout<L>` on the cache: tsc refuses (needs `unknown`), and the lint rule forbids it anyway. Dropped for the rebuild above.
- `retarget.ts` repoints every import of a name; `Placed` is declared in both `sprouting` (now `planted`) and `flower-plots`. It now takes `FROM=<file>` to repoint only imports of one file.
- The Bash hook refuses `sed`/`cat`/`head` on files and `cat >`/`sed -i` writes: read with `Read`, write with `Write`/`Edit` or a Python heredoc.

## State

- **Branch:** `masd/one-page-measure`, pushed; head at this relay's commit after 6a30a7a.
- **PR:** #216, draft, base `claude/multi-app-sliced-design-7bn3oq`, `MERGEABLE`/`CLEAN` at this session's start. Title, body and `squash-message.md` still stale, refreshed once 6b is built.
- **Plan:** `docs/plans/multi-app-sliced-design.paused.md`; `## Rest of the bite`'s last two bullets record this session and what is left.
- **Typecheck: green** (`pnpm exec tsc --noEmit -p .`, ~30 s). `perches.test.ts`, `flower-sight.test.ts`, `lawn.test.ts` pass; nothing else run (no lint, no vet, no meadow tests).
- **Layout:** `layout.ts` over `nouns.ts` prints 138 broken imports (from 171).
- **Estimate:**
  - this session: 0.2 h senior architect + 3 h senior developer;
  - handed on: about 0.3 h senior architect (the flower's fork, the insect split, the lawn/sky noun, the map re-asked) and 6 h senior developer (the engine, the remaining untyings, the move, the 27 tests, the checks).
- Nothing running or waiting: no CI, no PR subscription, no check-in.

## Pointers

- `layout-tools.md` here: every tool, current `nouns.ts` included, plus new `scc.ts` (import cycles), `lift.ts` (the lift-to-widget fixpoint: the cascade's roots) and `reach.ts` (entity files' transitive reach). Copy each `## <name>` fenced block to `tmp/modularity/` (a short Python loop over the headings does it); `pnpm exec tsx tmp/modularity/layout.ts > tmp/modularity/broken.txt`, then `awk '{print $6}'` tallies by target file and `awk '{print $1" -> "$3}'` by slice pair.
- `docs/plans/multi-app-sliced-design.paused.md` § "Rest of the bite".
- `src/mushrooms/pages/mushrooms/model/planted.ts`, `model/flower-planting.ts`, `model/acting.ts`: this session's new homes. `ui/scene/anchored-stand.ts`, `flower-sight.ts` (`perGround`): the identity call.
- The scc output at this session's end: one 16-file cycle (`perch-sight`/`perch-hosts`/`air-spots`, `spore-drift`/`spore-bed`, `mushroom-frame`/`windows-lit`/`window-glow`, `runner-shown`/`mouse-runs`, `mushroom-shown`/`house-view`/`mushroom-bed`/`flower-bed`, `firefly-view`, `dusk-view`), the insect `flight*` ↔ `shelter`/`pollen`/`perch-room` 7-file cycle, the insect genes' 5-file one, `sprouting`/`furnishing`/`game`, `flower-plots`/`anchored-stand`/`flower-sight`, `gait-spot`/`layout` — rerun `scc.ts`, since the hub flips changed it.
- This session: https://claude.ai/code/session_01HsLe5SAZdn16nzwZeg8SU9

## Next step

The operator's latest words still stand: «делай, по результатам будем смотреть». Resume the paused plan with `/go` and build through:

1. the engine down: `bed-place`, `repaint-queue` (and the mushroom profile's reach into it), `mushroom-shown`, `insect-size`, `clump-layout`'s ground; `meadow-camera`'s read of the mushroom's genes;
2. the insect split (`flight`'s vocabulary down, the choosing up into `features/insects-fly`);
3. the flower's fork — the flower standing among the mushrooms — taken the way the plan's last bullet frames it (an encounter feature, or the mushrooms handed in structurally), recorded as a call for the operator;
4. the lawn/sky knot, `tufts` up, `flower-genes`, `paint-backdrop`;
5. `layout.ts` to zero, `move.ts`, the 27 tests re-counted, `check:masd`.

Bring the result to the operator with every call listed under Decisions here and in relay 6, and whether the map can now leave the widget. No game runs before `/finalize`.
