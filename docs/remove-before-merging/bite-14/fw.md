# FW — the review's walk/shelter findings

Review: PR 57, review 5400519622.

## Done

1. 08c78ffa — `shelter.ts` formatted (prettier).
2. The model half of call 44 (this commit): `stride.ts`'s chase no longer
   runs at the cruise. `chaseTo` sets the eye at `origin + aim` along the
   chase's line at once (pace = the finger's blended velocity, `walked`
   counts it), `tick` holds a chase still, and `liftChase` either flings
   (call 43, unchanged), stands at rest (finger still), or, a walking key
   held, hands the finger's pace to the keys via `yieldChase` (as the pan's
   `release` → `keyedFrom`). The lifted-chase ease (call 37's) and its
   course (`chased`, `chaseRoom`, `progress`, `chasing`) are gone.
   `STRIDE_FLING_FASTEST`'s comment states the bound only. Tests:
   `stride.test.ts` (drag block rewritten round `dragged`/`swiped`),
   `walk.test.ts` (step and strafe tests check the ground under a moving
   finger every frame, then the glide on; "a chase's end" checks a finger
   at rest leaves the eye standing).

   Measured (model, tabL 1180×820, 12-frame swipes, `tmp/measure-walk.ts`
   in the worktree, not committed). Ground's distance from the finger, px:

   | swipe         | before: lift / rest | after: lift / rest                                                     |
   | ------------- | ------------------- | ---------------------------------------------------------------------- |
   | strafe 150 px | 119.8 / 58.1        | 0 across (8.2 px down: the strafe keeps x, the row bends) / 167.6 past |
   | strafe 400 px | 368.8 / 187.5       | 0.6 / 165.0 past                                                       |
   | step 150 px   | 122.2 / 22.0        | 0.0 / 236.5 past                                                       |
   | step 250 px   | 222.2 / 78.0        | 0.0 / 336.1 past                                                       |

   "Past" is the glide carrying on beyond the finger, as the sky's does.
   No visible jump: the bottom row's largest frame-to-frame move while the
   finger is down (17–77 px) is under the already shipped glide's first
   frames (29–129 px) in every case.

## FW2

1. The walk play (this commit). `Page.dragTraced` + `dragMoves`
   (`mushroom-probe.ts`, `play-mushrooms.ts`); `checkUnderFinger` in
   `play-walk-checks.ts` (the ground under the crossing at the finger on the
   drag's axis, every move past the slop and at the lift, within 3 % of the
   swipe); `checkWalk` takes the finger-down frame count and bounds/slows
   from the lift on only. `checkBack`/`goneAlong` moved to the checks file
   (`play-walk.ts` 429 lines). The patch is deleted.
   **Game fix**: the step drag left the ground 12.1 px (6 % of a 205 px
   swipe) off the finger at an off-centre x on tabL — `follow`'s step aimed
   by unbent row distance. `walk.ts`: the step lock holds the crossing's
   ground (`reference` ahead, `across`) and `stepAim` halves for the step
   that draws it on the finger's row (bend included), capped at
   `STRAFE_WIDEST`. `walk.test.ts`'s step test also runs at 0.8 width.
   Play: tabL and phoneP green — strafe and step 0.0 px off the finger on
   every move and at the lift; at rest the glide carries the ground on
   (strafe −106.5 / −96.7 px, step 228.6 / 249.0 px). Frames
   `frames/bite-14/fw-tabL-strafe-{lift,rest}.png`.

2. The rain play (this commit). The probe's `rain()` reads `fliers` too.
   Mid-shower: every flier sheltering up to the seats offered
   (`sheltering === min(fliers, seats)`). After the stop: the look moved
   from a fixed 1500 ms to the middle of `LINGER_MS` (1400 ms), and with two
   or more sheltering, some must be out and some still under. tabL: 3 of 3
   under, 7 seats; 2 of 3 still under at 1400 ms. phoneP: 3 of 3 under, 3
   seats; 2 of 3 at 1400 ms. Both green.

Nothing left of FW's list.

## Left (as FW wrote it; FW2's step 1 built the first item)

- **The walk play** (`scripts/lib/play-walk.ts`, `play-walk-checks.ts`) —
  not yet run against the change, not yet extended. Designed:
  - `fw-play-drag-traced.patch` beside this note adds `Page.dragTraced`
    (`mushroom-probe.ts`, `play-mushrooms.ts`): `drag` with an expression
    read after each move. It does not type-check yet: `inTurn` returns
    `void`; collect the reads in an array inside the callback instead.
  - `playStrafes`: drag with `dragTraced(..., '__probe.eye()', Eye)`; the
    ground under the crossing (`planeSeen(camera, pressed, crossing)`)
    projected with each traced eye (`viewOf(camera, eye, ground, 0)`) must
    sit at the finger's x within 3 % of the swipe, every frame after the
    crossing and at the lift — "a drag's frames move with the finger". Then
    the fling check as now, from the eye at the lift. Note the ground's
    distance from the finger at the lift and at rest. Same for the step
    drag on y.
  - `checkWalk` gets the number of finger-down frames; it applies the
    fling bound and "only slowing" from the lift on, the finger-down frames
    being checked by the caller against the finger.
  - `play-walk.ts` is at 453 lines: put the under-the-finger check in
    `play-walk-checks.ts`.
  - Run `walk` on tabL and phoneP; look at a frame pair.
- **The rain play** (`scripts/lib/play-rain.ts:175`, `:185`): untouched.
  Every released flier sheltering mid-shower when seats ≥ fliers; after the
  stop, some gone and some under a cap, looked at a time from `LINGER_MS`
  (justified in a comment). Report rather than loosen if seats' placement
  prevents the first.
