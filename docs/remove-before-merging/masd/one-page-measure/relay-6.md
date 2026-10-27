# Relay 6 — the layout hub flipped, three hubs and the engine to go

The elephant is MASD (PR #169, branch `claude/multi-app-sliced-design-7bn3oq`). This branch, `masd/one-page-measure`, is PR #216, based on the elephant, and carries bites 6a (significance by modularity) and 6b (the mushroom game split into slices). `relay-3.md`, `relay-4.md` and `relay-5.md` beside this file cover the sessions before; this relay covers the session that picked up relay 5.

## Standing constraints

- «не надо гонять игру на каждом пуке … по крайней мере не делать это до финалайза» — no `play:mushrooms` or other runs of the game before `/finalize`.
- «делай, по результатам будем смотреть» — build through and bring results; don't stop on each call. (It supersedes the earlier «давай только не городи поверх исправлять, а остановись, подумай, скажи мне что думаешь, и вместе решим» for this bite's calls.)

## The conversation

1. **Operator** (launch): `/relay take masd/one-page-measure — развязать четыре узла игры (перевернуть стрелку), спустить движок раскладки по существительным, разложить по слайсам и принести результат`
   **Agent:** attached (the session started on a detached HEAD at the branch's relay commit, no auto-branch to delete), set the estimate, flipped the plan to in-progress (50a7839), and built: re-laid the noun tree, flipped `MeadowLayout` across its readers, made `Stand` generic in its layout. At the context budget's 300k warning it paused the plan with typecheck at 10 errors (b9901aa) and relayed, with no operator message in between. No Last agent turn section: the whole session was this one turn, and `scripts/relay-last-reply.py` reads only the turns before the relay's.

## Intent

Unchanged from relay 5: the game cut by nouns — base entities never import one another, an encounter is a feature named for what happens, the whole sits above in `widgets/meadow` if modularity passes it — as the test of 6a's significance rule, built through to a result the operator can look at. No hacks that only quiet a checker; nothing dumped in `shared` to dodge a rule.

## Decisions

All of relays 3–5's hold. Added here, all calls the agent made under «делай», to be reported to the operator with the result:

- **Files re-laid in `nouns.ts` by the noun they serve** (no code moved): `placement`, `crowding`, `door-sight`, `clump-shade`, `cap-cover`, `clump-layout`, `shelter-seats` → `entities/mushroom` (a mushroom's place and its cap's seats); `flower-sight`, `flower-layout`, `flower-plots`, `flower-cover`, `anchored-stand` → `entities/flower` (relay 5's "the flowers' place to the flower"); `gait-spot` → widget (it places the gait button among the controls); all of `keep-meadow` → widget (the kept record is the whole `Meadow`).
- **`insects-perch`, `insects-shelter` and `bee-pollinates` are one feature, `features/insects-fly`**, because they import one another (the operator's answer 2: features that would import each other are one). Open: `flight.ts` (insect entity) imports `perch-room`, `pollen` and `shelter`, which import it back. The intended untying: the insect entity keeps the vocabulary (`Perch`, `Place`, `Leg`, `Route`, `Side`, `perchName`…) and its motion files, and the choosing (`flight`'s `nextFlight` and the rest) moves up into `insects-fly`. A snag: `Perch` names a `ShelterSeat`, whose `ShelterSide` is the mushroom's (`shelter-seats`). And `flower-sight` reads the insects' size (`InsectScaled`), so flower → insect is sideways; it may belong in `insects-fly` after all.
- **"Flip the arrow" for `MeadowLayout`**: each narrow type lives with its owner, and `MeadowLayout` is their intersection (`layout.ts`). Each reader declares `export type <File>Layout`, made of the field types it reads and its callees' aliases. `sun-layout` no longer reads the controls or the clump: it takes `SunControls` (built by `sunControls` in `sky-layout`) and the places and horizon row the widget hands `washRings`.
- **`Stand` and its parts (`WithLayout`, `SeededLayout`, `PlotGround`) are generic in the layout**, `L` unconstrained, defaulting to `FlowerSightLayout`. A function taking a stand is `<L extends <its alias>>(stand: Stand<L>)`, and the widget, tests and scripts spell `Stand<MeadowLayout>`. `Tending`/`Tended` in `tending.ts` are generic classes.
- **Terms**: a _hub_ is a type or file the whole game reads (`MeadowLayout`, `Meadow`/`Planted`/`Action`, `MeadowSound`, `MeadowSeen`). _Flip the arrow_ means the reader declares the narrow structural type it reads and the whole is assembled above. The _engine_ is the layout files every feature uses (`bed-place`, `repaint-queue`, `mushroom-shown`, `sky-layout`, …).

## Errors and dead ends

- The codemods hit two unrelated local types named `Stand` (`model/crowding.ts`, `scripts/lib/play-approach.ts`). Both were reverted to their committed text, so any codemod over `Stand` must skip files declaring their own.
- A first `nouns.ts` rewrite by regex produced duplicate object keys (last wins). It was rewritten as a `[slice, stems][]` list.
- `MeadowLayout`'s fields matched by word catch `.map(` as the controls' `map`. `narrow.ts` therefore ignores the control fields, and a reader of the controls (`mushroom-room`) shows up as a type error instead.

## State

- **Branch:** `masd/one-page-measure`, pushed, head at this relay's commit after b9901aa.
- **PR:** #216, draft, base `claude/multi-app-sliced-design-7bn3oq`, mergeable at the session's start. Its title, body and `squash-message.md` are still stale, refreshed once 6b is built.
- **Plan:** `docs/plans/multi-app-sliced-design.paused.md`; its `## Rest of the bite` records what this session did and what is left.
- **Typecheck: red, 10 errors** (`pnpm exec tsc --noEmit -p .`, ~25 s):
  - `anchored-stand.ts` 102, 122: the module-level `anchoredLayouts` cache is typed without `L`;
  - `dusk-view.ts` 123: paints the fireflies, a composition that belongs in the widget;
  - `lawn.ts` 129;
  - `mushroom-room.ts` 130, 140: reads the pickers (`Controls`), to flip like `SunControls`;
  - `mushroom-room.ts` 343, 453: passes a `Stand<MeadowLayout>`, and its `Found`;
  - `tending.test.ts` 30: names the now-generic `Tending` bare.
- **Layout:** `layout.ts` over `nouns.ts` prints 171 broken imports, down from 220.
- **Estimate:**
  - this session: 0.3 h senior architect + 3.5 h senior developer;
  - handed on: about 0.3 h senior architect (the insect split, the map re-asked) and 7 h senior developer (the ten errors, three hubs, the engine, the remaining untyings, the move, the checks).
- Nothing running or waiting: no CI, no PR subscription, no check-in.

## Pointers

- `layout-tools.md` here holds the tools, with the current `nouns.ts` and five new codemods: `retarget.ts`, `narrow.ts`, `compose.ts`, `genericize.ts` and `stand-full.ts`. Copy every block to `tmp/modularity/` (a small Python loop over the `## <name>` + fenced blocks does it) and run `pnpm exec tsx tmp/modularity/layout.ts` for the broken imports, `who.ts <stem>…` for a file's slice and edges, and `retarget.ts <home file> <Name>…` to repoint imports after moving a type.
- `docs/plans/multi-app-sliced-design.paused.md` § "Rest of the bite".
- `src/mushrooms/pages/mushrooms/ui/scene/layout.ts`: `MeadowLayout`, now an intersection. `flower-sight.ts`: the generic `Stand`. `model/game.ts`: `Meadow`, `Action`, `reduce`, the next hub.
- `src/mushrooms/pages/mushrooms/CLAUDE.md`: the meadow tests, about 20 minutes on 4 CPUs in three chunks.
- This session: https://claude.ai/code/session_01FCoziCLvP2C78EMdm4Xihg

## Next step

The operator's latest words still stand: «делай, по результатам будем смотреть». Resume the paused plan with `/go` and build through:

1. clear the ten type errors;
2. flip the remaining hubs: `game.ts` (`Planted`, the sprout and `Placed` to the mushroom, sow-spores and furnishing generic over `WithMushrooms & …`, each `Action` variant declared by its dispatcher), `MeadowSound`, `MeadowSeen`;
3. move the engine down (`bed-place` to `shared/world` with `placement`/`backdrop-depths` untied, `repaint-queue`, `mushroom-shown`) and split the insect entity from `insects-fly`;
4. do the remaining untyings: `flower-genes` back to the flower, `repaint-queue`'s profile, `Timed` to `shared/lib`, and `paint-backdrop` to the widget;
5. drive `layout.ts` to zero, move with `move.ts`, re-count the 27 tests, run `check:masd`.

Bring the result to the operator, including whether the map can now leave the widget and the calls listed under Decisions. No game runs before `/finalize`.
