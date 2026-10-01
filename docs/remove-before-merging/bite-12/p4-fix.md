# p4-fix — hand-over note

Package: the fix round of bite 12 P4 (plan `## Rest of the bite` item 3,
"Decided for the fix round"). Paths under `src/pages/mushrooms/` unless
given.

## Done

1. A pulled flower leaves a tuft where it stood.
   - `ui/scene/flower-plots.ts`: `pulledFeet(stand)` — where each pulled
     flower stood, in the order they went (the plot's foot map, pulled
     included); a flower that never stood has none.
   - `ui/scene/tufts.ts`: `leaveTufts(stand, grown, left, random)` — one
     tuft, in a planted flower's size (`FLOWER_SIZE`), at each pulled foot no
     grown or left tuft already stands on. `Grass` keeps `left` beside
     `grown`, regrows it on its feet on a relayout (`regrowTufts`), and
     tends both. A tap on one opens the picker as on any tuft (it is in
     `tufts`, so `at` and `holds` see it).
   - Tests: `tufts.test.ts` "leaves a tuft where a seeded flower pulled up
     stood…" (every seeded flower of 6 visits on every screen: ~80 % of the
     left tufts stand, the rest kept away by what keeps any tuft away — the
     test holds it over half); `flower-plots.test.ts` "leaves the foot it
     stood on…"; `model/planting.test.ts` "plants on the tuft a seeded
     flower pulled up leaves".
   - `scripts/lib/play-hold.ts`: the tuft count must rise for the seeded
     pull too.
2. A press on the held flower keeps the picker open; a press through a
   resting insect is a long press.
   - `model/game.ts`: `flower` on the flower the picker is open on returns
     the meadow unchanged (a picked colour stays).
   - `ui/scene/flower-bed.ts`: `tap(id)` — the one entry for the head's
     pointer-down and `Perches.tapThrough` — also `hold.press`es; `touch`
     dispatches no `deselect` on the flower `update` last got as `held`.
   - Test: `planting.test.ts` "stays as it stands on a press on the flower
     it is open on"; the hold play taps the held flower and expects the
     picker still open.

3. The sun keeps off the cross.
   - `ui/scene/sun-layout.ts`: `placeSun` reads `flowerPicker` — its colours,
     shapes and cross — beside the mushrooms' and the house's rows; the rays
     keep off all of them (`fitsSky`), but only the rows bring the sun down
     below them (`sunAt`): the cross stands under the colour row on narrow
     screens, and coming down below it drops the sun under the horizon
     (phoneL went to the moved-sun fallback and a far hill rose onto its
     rays). `groundTop` comes back from the horizon (`groundTopUnder`,
     `horizonAt` undone), since `placeSun` is handed the horizon only.
   - Moved: tabL (991, 160) → (966, 222), r 61.5 kept; small phone
     (126, 228, r 24) → (182, 236, r 16), the cross being where the sun
     stood; phoneL unchanged.
   - Tests: `sun-layout.test.ts` checks the rays off every picker's button,
     the flower picker's included.
   - **Red, not mine to edit:** `mushroom-light.test.ts` "lights every
     mushroom on the side facing the sun … on a small phone screen" asserts
     `overhead > 0` ("no mushroom under the sun") on the small phone only —
     a coverage guard for the overhead branch, pinned to where the sun used
     to stand. With the sun moved off the cross no mushroom is under it
     there. Green at HEAD before this step (24/24).

4. Flowers pale behind the brow: `brow-flower-pale.patch` re-placed by
   hand in `ui/scene/flower-bed.ts` (the import, `BROW_FADE`, the two lines
   at the end of `stand`, unchanged from the patch) and the patch deleted.

## Left

5. Replays and frames.

## Decided

- Any pulled flower leaves a tuft where it stood, a bee's included — the
  decision's "every planting spot is a tuft" — not only a seeded one.
- A left tuft is fixed on its foot from the moment it is left, as a grown
  one is, so a flower planted on it keeps matching it through a resize.
- A press through an insect resting on the held flower still shuts the
  picker for the moment the insect startles (`startle` shuts the flower
  picker in the model) and reopens it 0.45 s on.
