> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Doors and gaps in the cube's floors

The doors analysis on this branch
(`docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/doors-sim/`, the
board's `ideas.yaml`) settled the numbers: threshold 10, 75% of openings doors,
density 100% kept as a parameter. This plan puts them in the game.

## Scope

This PR does two things:

1. **The model.** Every wall gets a kind, and the doorway rolls decide it.
2. **Gaps go live.** A gap is a missing wall, so everything that asks whether a
   wall is open sees it: the body walks through, sight and meshes see through,
   signs and planting treat it as an opening.

**Doors stay in the model only.** What a door looks like, how it opens, and who
sees it open are design calls of their own (questions 2 and 3 below), so a
follow-up PR takes them. Until then a door reads as a closed wall everywhere,
and nothing in the game changes for it.

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

## Tests

- `doorways.test.ts`: the window method agrees with a full way-round count on
  every wall of floors 4–8 under several seeds; kinds come out at ~75/25; at
  density 1 every partition with an allowed wall has exactly one opening; no
  doorway on the outer boundary; floors 1 and 2 have none.
- An hour's tally on floor 7 lands within the simulator's numbers (~59 doors,
  ~20 gaps for the explorer), as a guard against the game drifting from the
  analysis it came from.
- `rooms.test.ts`: the loop case above.
- Existing tests that pin a floor's layout (sale, plant, setting, shelf) are
  re-read, and any change in what they pin is a gap appearing, said so in the
  commit.

## Questions

1. **Scope.** a) model and gaps now, doors' look and opening in a follow-up
   (recommended: those are design calls, and this PR is already whole without
   them); b) everything in this PR.
2. **Opening a door** (follow-up). a) walk into it, it swings open and shuts
   behind you (recommended: no new control); b) a key or a click.
3. **Who sees it open** (follow-up). a) the opener alone, as their own body's
   act, which `src/cube/CLAUDE.md`'s rules allow without a price (recommended);
   b) everyone nearby, which those rules make a purchase.

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
- **Not extracted**: the simulator's `sim.js` stays a reference, not a source.
  It lives under `docs/remove-before-merging/` and is deleted at merge, so
  sharing code with it would be sharing with something about to disappear.
