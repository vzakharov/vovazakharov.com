# Bite 18 — the meadow is kept

The operator's contract is [saving.md](saving.md); the facts and the
reasoning behind each call are in the spec,
`docs/remove-before-merging/bite-18/spec.md` (fact sheet § 1, calls § 2 by
the same numbers). Every call below is made: build it.

1\. **The visit seed is kept.** It grows the seeded flowers (whose ids
`pulled` and the bee rings name), the hills, clouds, grass, layout and
opening clump; without it a reloaded meadow is another meadow. The opening
mushrooms that lay out the flowers are recomputed from the seed, never read
from the record, so a pulled opening mushroom moves no seeded flower.

2\. **Settled at rest.** Every kept timestamp becomes `RESTED_AT =
-SPROUT_MS`. Before a write: spores a shower under way would raise come up
and `rain` clears; a grown sprout drops `sprout`; dusk becomes `FULL_DAY` or
`FULL_DUSK`, whichever way it was going; mice outings keep only their count;
pickers and the selection reset; leaving fliers are dropped, the rest sit on
their perch with what was left of their stay, sheltering ones with none.
Settling twice equals settling once.

3\. **The record**: zod (already a dependency), written once and pinned to
the model's types with `satisfies z.ZodType<Kept>`, never a hand copy of
them. One record per meadow, `{version: 1, seed, meadow, eye, gait}`, keyed
by its number. "Cannot read" is another version or a schema failure: that
record is left untouched and a fresh meadow opens under the next number
past the highest. `kept-record.ts` owns the `Kept` types, `keeping.ts` the functions.

4\. **The hash**: `#n` opens meadow n (fresh when none is kept); `#new` opens
the highest + 1; anything else opens the highest kept, or `#1`. The hash is
rewritten with `history.replaceState`. A hash edited while playing reloads
the page, only when a store is open.

5\. **Writes**: every action but `tick` writes at once; tick changes and the
walking eye at most once a second, and when the tab hides. One write in
flight, the newest waiting, no debounce. **A write refused after the store
opened** stops keeping for the rest of that load, logged once with
`console.error` — the same case as saving.md's "no storage, no keeping"
(the browser refusing storage), so the game keeps playing; it goes to
`to-check.md` for the operator to confirm.

6\. **The eye and the gait are kept**: `openingWalk` takes a start, so a
reload stands where the child stood. Fliers are kept, settled (call 2).

7\. **Seeds on reload**: the visit seed is kept; the streams that seed new
mushrooms, insects and flowers start fresh each load, so the first
butterfly after a reload is no twin of the one before.

8\. **Mice are not kept** — the counts are the scene's — so each house with a
door has one mouse after a reload. Accepted; in `to-check.md`.

9\. **No storage**: `indexedDB` throwing, `open` failing, or no answer within
2 s. Then the hash is neither read nor written and a fresh meadow opens, as
before this bite. The Artifact's sandbox lands here.

10\. **Boot**: `startGame` keeps its signature and awaits the opening inside,
failures through an `onError` the canvas passes; the Artifact build needs no
change. The scene takes the opening through its constructor. Persistence is
the `pages/mushrooms` slice's own: pure parts in `model/`, IndexedDB and the
boot in a new `api/` segment.

11\. **A kept meadow opens at rest, silently**: flowers shown open with no
note and no bloom (an `opening` flag on `FlowerBed.reconcile`), insects
reconciled once at start, mushrooms as today.

12\. **Two tabs on one meadow**: the last writer wins, not handled.

13\. **The play run gives each play its own browser context**, so no play
reopens another's meadow; a `keep` play reloads and opens `#new`.

## Steps

One agent each (spec § 3 holds each step's files and tests):

- **S1** settled at rest ∥ **S2** record and hash ∥ **S3** the eye's start
  — pure, disjoint files.
- **S4** the store, `openKept` and the keeper (after S1, S2) ∥ **S6** the
  `keep` play written (scripts only).
- **S5a** the boot moved to `meadow-opening.ts` and the opening through the
  constructor, the flowers' `opening` flag (after S3, S4).
- **S5b** the keeper wired: writes after `dispatch`, the once-a-second poll,
  `visibilitychange`, the `hashchange` reload (after S5a).
- **S6** run, then a look at its frames.

Grants near the cap: `meadow-scene.ts` net ≤ +5 (the boot moves out),
`flower-bed.ts` net 0, `walk.ts` ≤ +2, `flight.ts` 0, `play-mushrooms.ts`
≤ +8.
