# Doors and gaps in the cube's floors

## Run (`/carte-blanche`, lead on Opus)

### Standing rules, verbatim

- «1 в этом, и через /carte-blanche (но на Опусе, кажется что тут без фейбла
  можно справиться), 2 через E/тап, и кстати подтяни мейн, там добавили
  мобильную навигацию, 3 ну пока у нас только один игрок так что кажется вопрос
  опережает технологию 🙂 а так вопрос хороший, добавь на доску»
- «никаких релеев кроме парка»
- The skill's standing answers hold: no merge to `main`, no outside services, a
  remark is not an order, MASD/linters/line cap not negotiable.

### Questions

None asked: the three forks the draft carried were answered above.

### The seam

`src/cube/entities/world/model/doorways.ts`: `WallKind`, `eastKind` /
`southKind`, `isPassable` / `isPassableEast` / `isPassableSouth`. Every read of
whether a wall lets a body or an eye through (`walls.ts`'s `mazeWalls`,
`geometry.ts`, `shelf.ts`) goes through it, so gaps go live the moment the
model's kinds do. Until the model lands, the kinds are the native maze's alone.

### Team

All on Opus, started 2026-11-14 20:19Z from 47b2d1fb.

- `model` — session_01DaohkF1JS8gB1tRwKtZtd1, `claude/cube-doors-model-oldy2u`:
  the doorway model behind the seam (rolls, window method, cache, tests).
- `sight` — session_01DaohkDz2WrSMUE8wwDgdtY, `claude/cube-doors-sight-oldy2u`:
  `seenFrom` and any other tree assumption, on a maze with loops.
- `doors` — session_01DaohkBudYCRGpUtpm5hS2H, `claude/cube-doors-open-oldy2u`:
  the door drawn, opened by the use action, shut behind; told to merge `model`
  once it returns doors, and the lead messages it when that lands.

### Status

- Built: the seam (lead); `sight` merged at 796a9bb9 and its session archived.
  `seenFrom` enumerates every walk whose arc stays open (arcs per room are not
  enough state: two walks reach one room along disjoint lines). Measured +5% at
  realistic gap rates, steep past 20% open walls: raising density or the gap
  share is felt there.
- `model` merged at 20f65329 (f5ef6f74), session archived. Departures it made,
  kept: settings sit at the top of `doorways.ts` as `DOORWAYS` (a config file
  read by one module made a cluster `masd:clusters` fails); `kind` is rolled per
  partition, since a partition holds one opening. Cost: cold ~0.27 ms a
  partition, warm ~4 µs. Its hour guard measures ~50 doors and ~15 gaps for the
  explorer on floor 7 in our seeds, not the sticky's 59/20: the simulator's
  floor-7 maze was an outlier (9.1 openings per 100 rooms against 8.2–8.9). Put
  to the operator whether to keep 10 or go to 8 (≈ +30%).
- Lead: `memo.ts`, one clear-when-full cache for `walls.ts` and the doorway
  model (15700c50).
- `doors` merged at 1ae0121f (2476ae0a), session archived: `DOORWAY_CUT` shared
  with floor 1's exit, `doorway.ts` (wall panes, leaf, `withOpen`),
  `features/player/model/door.ts` (pure state, 0.9 s swing, shuts out of reach
  or on a floor change), the opener's body/sight/mesh take the open door. 882
  cube tests green. Frames in `docs/remove-before-merging/frames/`; floor 8's
  three are on the board (b8e3fbd1).
- Second wave, `clear` — session_01DaohkDQ9KQGyhEf1cx1m5E,
  `claude/cube-doors-clear-oldy2u`: decor, signs and mounts keep a doorway and
  its swing clear; one target per use press (the most directly faced); a door
  prompt; a leaf that reads as a door (panels, handle, no wainscot across it);
  floor 4's frames re-shot lit.
- Lead: the doors simulator split under 400 lines (subagent), the cube board
  republished with the doors zone (subagent).
- Steer, operator: «А ты переимпользуешь модели дверей которые у нас уже есть?»
  — no, the first leaf was new. Sent to `clear`: build the real door from the
  decor fitting `door` (`features/decor/config/fittings.ts`, used by nine
  themes; also `happenings/model/fixtures.ts`'s `door` act), extracted to one
  shared build at the lowest layer both reach, leaf swinging on the side away
  from the handle, paint and handle rolled per wall.
- Steer, operator: «Я думаю декора двери теперь не надо». Decor doors go: the
  fitting's build moves to the real door, the fitting and every theme's
  `thing: 'door'` entry are removed; the happenings `door` act stays (an event,
  not decor). Sent to `clear`.
- Steer, operator, on the floor-8 open frame's coat rack read as a figure:
  «выглядит в хорошем смысле uncanny, запомни на борде, может будем делать
  jumpscare-ы в дверях» — sticky `doors-jumpscare` and the frame's caption
  (5186a875). Doorways stay clear; a scare would be placed on purpose.
- Doors simulator republished split at E42bCrk3t6DubakRH61irN v35; a stray
  duplicate Gf2FbMjCKfXwD8jHSgw8nw was created by mistake, deletion offered to
  the operator, not done. Cube board republished at v93 before 5186a875: needs
  one more republish (subagent: read the url, publish `tmp/board/cube/` with
  `images/` and `icons/` as `files`).
- Threshold, operator: «порог: 10 (около 50 дверей и 15 проёмов в час) — Так,
  да». Sticky and `DOORWAYS` doc carry the game's figures (179e5b29); the cube
  board needs a republish for it.
- `clear` merged at fe961aef (81692547): doorways kept clear through
  `Doored.isDoor` / `Setting.doors`; `aimOf` gives one target per press; door
  prompt; the real door in `entities/world/model/door.ts` from the old fitting,
  decor `door` and `'door'` thing removed (fifteen themes lost their slot,
  nothing refills it); frames re-shot on floors 6 and 8 (4–5 too dark). Floor
  6's three on the board (7a40e677), cube board v95.
- Sent back to `clear`, open: floor 8's leaf goes black under sconce light
  (half, open, far side), and `masd:clusters` fails on `features/player` (main
  has 0 clusters; `door.ts` + `aim.ts` tipped it) — cut by noun, no marker.
- Known and left: one open door at a time (a second snaps the first shut); no
  door sound; the door's look rolls from a module-level `rollWith` over
  `planted.seed` — the same for every player, kept.
- `clear` done and archived: floor 8's black leaf was the hotel's sconces
  painting walls only (`sconceGlow` lights the rest); `features/player` cut into
  seven noun sub-slices (0 clusters); sconces hang clear of the doorway spot via
  `DOORWAY_AT` (52414950), merged at d1935905. Frames on the board, v97.
- `/polish`: `polish(dry):` ba1486a7, `polish:` 988c167e (the floor);
  `/five-percent` posted review 5907343400 with two critical points, both taken:
  other themes paint wall fixtures into the doorway spot, and a press opens the
  nearest door rather than the faced one.
- Third wave, from 9690774f:
  - `themes` — session_01DaohkDeF8G4hEnoTz4rn3Z,
    `claude/cube-doors-themes-oldy2u`: every theme shader's wall fixtures clear
    of the doorway spot, frames per theme.
  - `aim` — session_01DaohkCcMFsgFLxWoWWTwm1, `claude/cube-doors-aim-oldy2u`:
    every door in reach goes to `aimOf`, ranked by gaze.
- `aim` merged at 23fc5f2e (1ace2eca), archived; its review thread answered.
- Vet's first runs failed on what the branch had piled up: the simulator's `.js`
  (source dropped, e09cbfdf), tsc, knip, type-overlap (`Angled` in kernel
  typings, `HeldOpen`), prettier, `walk.ts` over 400 (`scripted.ts`). Green on
  GitHub at 35c3d5b3 plus the aim session's estimate (383e87ed).
- Preview slot 2 (preview2.vovazakharov.com/cube) at 383e87ed.
- Left: merge `themes`, answer its review thread, `/polish` over the rest, vet,
  republish preview 2.

The doors analysis on this branch (the simulator, published as artifact
E42bCrk3t6DubakRH61irN, its source last held at 259136093 under
`docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/doors-sim/` and
removed because vet lints every tracked `.js`; the board's `ideas.yaml`) settled
the numbers: threshold 10, 75% of openings doors, density 100% kept as a
parameter. This plan puts them in the game.

## Scope

This PR does three things:

1. **The model.** Every wall gets a kind, and the doorway rolls decide it.
2. **Gaps go live.** A gap is a missing wall, so everything that asks whether a
   wall is open sees it: the body walks through, sight and meshes see through,
   signs and planting treat it as an opening.
3. **Doors go live.** A door is drawn in its wall, opens on the player's use
   action, E or a tap, and shuts behind them.

## The model — `src/cube/entities/world/model/doorways.ts`

- **Settings** in `src/cube/entities/world/config/`: `threshold: 10`,
  `density: 1`, `doorShare: 0.75`, each with the reason it has its value.
  Density stays a number even at 1, so playing with it is a one-line change.
- **Rolls** join the `Maze` struct in `maze.ts`, under the world seed like every
  other roll: per partition `doorway/{floor}/{partition}/has` (against density)
  and `…/at` (which allowed wall), per wall `…/kind` (door below `doorShare`,
  gap otherwise). A partition is a block and one of its four arms, so its key is
  the block key plus the arm, which `maze.ts` already has.
- **`wallKind(rolled, n, wall)`** returns `'passage' | 'wall' | 'door' | 'gap'`.
  It finds the wall's block and arm the way `isOpenAt` does, so a wall's kind is
  read from that wall's own partition alone, in O(1) plus that partition's
  allowed walls.
- **Allowed walls of a partition, by the window method.** The way round a wall
  crosses its partition only at the passage (or turns a blind partition's centre
  end), so it is at least `2·d + 1` for a wall `d` from it. Walls with
  `2·d + 1 ≥ threshold` are allowed with no search; only the window of at most
  `threshold − 1` walls next to the passage gets a breadth-first search over
  native passages, bounded at `threshold` steps. The search reads native walls
  only, never other doorways, so each partition is decided independently and the
  result never depends on what was asked first.
- **Cache per partition**, bounded like `walls.ts`'s: a partition's allowed set
  is computed once while it stays in the cache. The simulator measured a search
  at ~0.4 ms warm and 2.5 ms cold.
- **Floors too small for the threshold** get no doorways, by the same rule
  rather than a special case: floor 2's longest way round is 3.

## Gaps go live

- `isOpenEast` / `isOpenSouth` in `maze.ts` stay the native maze, which the
  doorway search needs. A new pair beside them answers "open to walk and see
  through": native passage or gap.
- **Every reader of open walls switches to the new pair**: `walls.ts`
  (`mazeWalls`, which `body.ts`, `rooms.ts`, `sale.ts`, `setting.ts`, `plant.ts`
  and `mount.ts` read through), and `geometry.ts` and `shelf.ts`, which call the
  maze directly today.
- **`rooms.ts`'s `seenFrom` stops being on a tree.** Its doc says each room has
  one walk from the seat; with gaps a room can have two, and the `seen` check
  keeps the first one found, which can miss a room only the second line of sight
  reaches. The fix keeps a room's arc as the union of the arcs that reach it, or
  re-walks it when a wider arc arrives; the tests pin a loop where the second
  walk is the one that sees.
- **Sale signs** keep their rule: a gap is an opening, so a dead end with a gap
  in it is no longer a dead end, and stops selling. A door reads as a wall.

## Doors go live

- **Look.** A door's wall is the floor-1 doorway wall (`geometry.ts`'s
  `doorwayWall`) with a leaf in the opening: the cut is shared, generalised from
  floor 1's one wall to any wall a door holds, and the leaf is a procedure of
  the room's theme like every other surface, nothing authored. Both faces show
  it, since the door belongs to the wall.
- **Opening.** The player's existing use action (`KeyE`, or a tap, in
  `features/player/ui/input.ts` and `touch.ts`, which pills and signs already
  answer) opens the closed door the player faces within reach. The leaf swings
  open on the clock, and shuts once the body has left the doorway's reach on
  either side.
- **Who sees it open.** The opener alone: the open door is part of the player's
  own state, like their pose, so nothing in the world changes and no price is
  due (`src/cube/CLAUDE.md`). With one player today that is everyone; the
  multiplayer question is on the board (`doors-who-sees`).
- **Walls while open.** `Walls` reads a door as closed. The player's body and
  sight take the open door as an extra opening on top: `closedWalls` gets the
  doorway's jambs, as floor 1's does, and the room's sight and mesh are rebuilt
  when the door opens and when it shuts.
- **A door is never a gap to signs or planting**: those read the world, not one
  player's state, so a door stays a wall to them.

## Tests

- `doorways.test.ts`: the window method agrees with a full way-round count on
  every wall of floors 4–8 under several seeds; kinds come out at ~75/25; at
  density 1 every partition with an allowed wall has exactly one opening; no
  doorway on the outer boundary; floors 1 and 2 have none.
- An hour's tally on floor 7 lands within the simulator's numbers (~59 doors,
  ~20 gaps for the explorer), as a guard against the game drifting from the
  analysis it came from.
- `rooms.test.ts`: the loop case above.
- Door state: a pure function from the player's pose, the door opened and the
  clock to the leaf's angle and to whether the door has shut, tested without a
  page; `closedWalls` with an open door gives the jambs.
- The door's look is checked by eye on `/preview`, as the page has no suite.
- Existing tests that pin a floor's layout (sale, plant, setting, shelf) are
  re-read, and any change in what they pin is a gap appearing, said so in the
  commit.

## Decisions

- **Scope**: everything in this PR — «1 в этом».
- **Opening**: the use action — «2 через E/тап».
- **Who sees it open**: the opener, one player being all there is — «пока у нас
  только один игрок так что кажется вопрос опережает технологию»; the question
  itself goes on the board.

## DRY notes

- **Reused**: `maze.ts`'s block lookup (`levelOf`, `blockAt`, the half and
  offset arithmetic in `isOpenAt`) is shared by `wallKind` rather than copied:
  `isOpenAt`'s locating half becomes a function both call. `walls.ts`'s bounded
  cache is the pattern for the partition cache, extracted into one helper both
  use if the two end up identical, kept apart if one keys by wall and the other
  by partition need different eviction.
- **Shared, not duplicated**: one "open" predicate pair for every reader, so
  `geometry.ts` and `shelf.ts` stop being the two places that read the native
  maze directly.
- **Generalised, not copied**: floor 1's doorway — its cut in `geometry.ts` and
  its jambs in `body.ts`'s `DOOR_WALL` — becomes the one doorway shape every
  door uses, so the exit and the doors cannot drift apart. The use action is the
  existing one, so a door is one more thing it answers.
- **Not extracted**: the simulator's `sim.js` stays a reference, not a source.
  It lives under `docs/remove-before-merging/` and is deleted at merge, so
  sharing code with it would be sharing with something about to disappear.
