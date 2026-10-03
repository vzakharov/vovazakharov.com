# rh-a2 — T141, a scene-asked tend in slices

Step one (the patch, Left 1 and 3) landed as source; Left 2 and 4 remain,
designed below.

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

## Left

2. **Watch the sow frame.** `MeadowScene.update` runs `sow()` before
   `walk()`, so the `Tending` that `change` starts takes its first step,
   which reads the rules (`plantableIn`, 0.5–3 ms), in the sow's own frame.
   Either skip one `follow` after `change`, or hand the lazy judge from
   `lostOn` to the `Tending` when `sameAnchor(anchorOf(tendedAt),
anchorOf(view.eye))`. Decide after timing.
3. **Probe and play** (`scripts/lib/`):
   - `mushroom-probe.ts`: the tend timing is on `scene.grass.tended`
     already (Done). Still to add: record the
     scene's `update` ms for each frame that ran a tend, since headless
     frames have no rendered ms.
   - `play-approach.ts`: release bees to `INSECT_LIMITS.bee` before growing
     the forest, so plantings land during the timed run. Read `hitches()`
     across the whole approach, note the bee plantings, and expect the
     slowest frame carrying a tend to be ≤ 26 ms. Export `FRAME_BUDGET_MS`
     from `frame-budget.ts` for that.
   - Measure **before** on `src/` at 5cc0bb58 (before this package) with
     only the probe and play changes, timing `tend`, `retend` and `tendOn`
     on `scene.grass` there, then after. Run under
     `flock /home/user/vovazakharov.com/tmp/site.lock pnpm play:mushrooms
--screens tabL --plays approach`.

## Decided

- `paint` (a new layout) still tends whole: tufts on the old layout carry no
  meaning on the new one, so there is nothing shown to keep.
- The sow check is exact rather than a radius, because the crowding rule
  reaches `D_SEE` and covers are in screen space. A plane radius round the
  new foot would miss both.
