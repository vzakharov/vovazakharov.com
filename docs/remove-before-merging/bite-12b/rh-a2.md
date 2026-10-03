# rh-a2 — T141, a scene-asked tend in slices

All four of the note's items are done (06920038, 89244ebd). One bar is open,
for the orchestrator: § "Open".

## Done

- **`tuft-tap.ts`**: `bareToTap(stand)` is now `bareAmong(layout, flowersOf(stand),
stand.mushrooms)`. `bareAmong` is exported so the sow check can ask the
  newcomers alone. Behaviour is unchanged.
- **`tending.ts` `lostOn(was, now, eye)`**: whether a tuft that stood on `was`
  stands on `now`, both judged at `anchorOf(eye)`. It is exact against
  `!plantableIn(now, eye)` for a tuft that passed on `was`, by this argument:
  every rule `plantableIn` combines (`roomIn`'s groundFor and covers,
  `headClear`, `bareToTap`) is an "every" over single flowers or mushrooms,
  and losing one only frees room. So only newcomers can cover a tuft: the
  flowers of the anchored `now` that are not in the anchored `was` by id and
  foot, and the mushrooms that are not there by identity. The one exception
  is the flowers' count round a foot (`flowersCrowdAt`, `FLOWER_SLOTS`
  within `D_SEE`), which is asked of every flower. Inside a tuft, these are
  run exactly on the newcomers: `flowersCrowdAt`, `groundFor`, `headClear`
  and `bareAmong`. Covers (`flowerInSight`) go through a box prefilter,
  `mayCover`: the drawn box of a nearer newcomer mushroom against the box
  of every head the tuft's flower could grow. Where that prefilter hits,
  the full `plantableIn(now, eye)` decides, built lazily. A bee planting
  adds no mushroom, so it never builds the full judge.
- **`tending.ts` `Tended`**: the tuft bookkeeping, taken out of `Grass` so a
  test can drive it without Phaser:
  - `whole(stand, eye)` tends at once, used by `paint`, since a layout
    change has nothing shown to keep.
  - `change(stand, eye)` filters the standing tufts by `lostOn` at
    `tendedAt()`, then restarts a sliced `Tending` from the view's eye.
  - Also `follow(view)`, `tendedAt()`, `standing()` and `stand()`.
  - Its `tendedAt` docstring says every check of the planter judges there.

- **`Grass` on `Tended`** (`tufts.ts`): holds
  `new Tended(this.grownRound.bind(this))`; `paint` tends whole, `tend`
  calls `change`, `follow` calls `Tended.follow`; `tendedAt`, `holds`,
  `update` and `inView` read from it. The probe times `whole`, `change`,
  `retend` and `tendOn` on `scene.grass.tended`, and `play-hold.ts` counts
  `grass.tended.standing()`, since `Grass` no longer has those members.
- **Tests**: `tending.test.ts` — `lostOn` equals `!plantableIn(now, eye)`
  over the tufts standing on `was` for child, bee (`flower-sight` `roomFor`)
  and mushroom (`mushroom-room` `roomFor`) newcomers, forest 3 and clump 11,
  at the opening eye and (6, 9, 0.7), with a test that each kind lost some;
  through `Tended`, the tuft under the child's new flower is gone right after
  `change` and no `follow` reads more than `TEND_SLICE` tufts' feet, the
  finished re-tend equal to `tendTufts`. `planter.test.ts` — the tap-and-key
  property on every tuft of `Tended.standing()` two `follow`s after a
  `change`, `tendedAt` still the opening eye, at each walk.
  Mutations checked: dropping the `mayCover` path or the `bare` check fails
  `lostOn`'s tests; dropping the filter in `change` fails the planter's.
  Dropping the `flowersCrowdAt` check fails nothing: no case here crowds a
  tuft through a newcomer.

Measured with a bench on desktop Node, 1180×820, opening eye: `plantableIn`
setup takes 0.5–3 ms. A forest has 12 mushrooms and about 420 grown tufts,
of which 69–73 stand; judging them costs 30–57 µs a tuft (12–24 ms a sector).
A clump costs 12–26 µs a tuft.

- **The sow frame** (89244ebd): `Tended` passes the `follow` right after a
  `change`, so a re-tend's rules (0.3–5 ms) land on the next frame rather
  than on the sow's, which `MeadowScene.update` runs before the walk. The
  `Tended` test counts the follows, so it fails without the skip.
- **Probe and play** (89244ebd): the probe's `tendFrames()` gives each frame
  whose update ran a tending call, as `{ ms, tend }`: the update's ms and the
  tending calls' share of it. A call made inside another timed one, such as
  `change` → `retend`, counts once. `beePlanted()` counts bee plantings.
  `play-approach.ts` releases `INSECT_LIMITS.bee` bees before growing the
  forest, and notes those frames across the whole approach.

## Timing, tabL approach, 20 bee plantings

This machine was loaded during these runs: frames with no tending or
re-sight took a 26–28 ms median, against 14–20 ms when it is quiet.

|                                          | before (5cc0bb58 `src/`)       | after                                                     |
| ---------------------------------------- | ------------------------------ | --------------------------------------------------------- |
| a sow's tending call                     | 10–47 ms (`Grass.tend`, whole) | `change` 1–8 ms, plus `tendOn` 0.3–5 ms on the next frame |
| the tending's share of a frame, slowest  | 46.7 ms                        | 14.5 ms (a walk slice; median 1.3)                        |
| a frame that ran a tending call, slowest | 174 ms                         | 60–72 ms                                                  |

## Open

**The bar "the slowest frame that runs a tend ≤ 26 ms" cannot hold as
written.** The frames that stay slow after the change are slow for
other reasons. The perches' re-sight (`see`, 20–90 ms) runs in the same
frames, along with the sow's own work. In the slowest after-frame, 68 ms in
all, the tending took 12 ms and `see` took 24 ms. So the play notes the
numbers and does not judge them. The options, measured above:

- (a) Judge the tending's share of a frame against the budget. That holds
  after (14.5 ms on a loaded machine) and fails before (46.7 ms).
- (b) Keep the frame bar, and take `see` off the sow frame. The perches
  belong to another package.
- (c) Keep the frame bar and leave it red.

## Decided

- `paint` (a new layout) still tends whole: tufts on the old layout carry no
  meaning on the new one, so there is nothing shown to keep.
- The sow check is exact rather than a radius, because the crowding rule
  reaches `D_SEE` and covers are in screen space. A plane radius round the
  new foot would miss both.
