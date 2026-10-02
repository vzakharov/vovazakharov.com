# rv-eye-world — fixes for review 5391045656

Contract: `docs/plans/mushroom-game-syama/bite-12/review.md` § "eye-and-world — review 5391045656".

## Done

- Finding 2 — `groundSeam` / `seamAt` deleted from `skyline.ts`, header and
  `seamCrest` docstring corrected. The two tests that read `groundSeam` keep
  the contracts they guarded on what draws: the "wavers" test samples
  `seamCrest` across the opening view as `drawHills` does, and the grain test
  starts the strips at `groundTop − seamReach`, as `paintGrain` does.

- Finding 1 — the brow and the ground take the bob. The ground's picture,
  its grain and the brow now scroll with the camera's bob (`GROUND_BOB` in
  `walking.ts`, scroll factor `(0, 1)`), as every bed object already does;
  the hills and the sky stay still. The near range's foot now reaches past
  the ground's top bobbed at its deepest (`nearFoot` in `brow.ts`,
  `browFloor + deepestBob + 2`), or a strip of sky would open under the
  brow's edges mid-step (tablet: `browFloor = browLowest`, bob 3.28 px
  against the old 2 px overlap). Tested in `walking.test.ts` § "the bob
  against the ground"; both tests fail on the old arrangement.

  **Why this one, not the bob in the view.** Putting the bob into the view
  would leave the ground's rows (baked once, screen-fixed) under every foot
  sliding by the bob, so they would have to read it too, and so would every
  placement, the insects' and the grass's, and the tap's world point, which
  the camera scroll already carries. Bobbing the three ground pictures with
  the camera keeps every foot on its row with no reader changed.

  **Measured** (probe on the pure functions, opening eye, mid-step bob at a
  full walking pace, the farthest thing still drawn as it sinks):

  | screen | bob    | thing    | drawn   | sliver at rest | mid-step, brow fixed | mid-step, brow bobbing |
  | ------ | ------ | -------- | ------- | -------------- | -------------------- | ---------------------- |
  | tabL   | 3.28px | 0.3 tall | 31.4 px | 6.38 px        | 3.10 px              | 6.38 px                |
  | tabL   | 3.28px | 1 tall   | 92.7 px | 18.69 px       | 15.41 px             | 18.69 px               |
  | phoneP | 3.38px | 0.3 tall | 24.4 px | 4.97 px        | 1.59 px              | 4.97 px                |
  | phoneP | 3.38px | 1 tall   | 72.3 px | 14.56 px       | 11.18 px             | 14.56 px               |

  A foot slid 3.28 px (tabL) / 3.38 px (phoneP) against the ground's rows
  mid-step; it now slides none. No play run: the numbers settle it.

- Finding 3 — the `Controls` callbacks live in `control-actions.ts`
  (`controlActions(scene)`, 54 lines), the scene handing it its voice, the
  arrivals, the planter, `dispatch` and the controls' repaint
  (`controlScene()`); `repaintControls` became an arrow property so it can
  be handed on unbound. `meadow-scene.ts` is 440 lines (was 457).

## Left

Nothing.

## Departures

- `walking.ts` (not in the owned list) gains `GROUND_BOB` and `deepestBob`:
  it is the bob's home, and nothing else of the package could hold them.
- The seam tests were repointed rather than deleted (finding 2).
