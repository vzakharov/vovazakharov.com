# Bite 12 — the tail's review and its calls

Three reviewer agents, briefed from
`docs/remove-before-merging/bite-12/review-brief.md`, each on one group of
the diff from dd3503d2. Each finding's call, and what it beat.

## eye-and-world — review 5391045656

1. **The walk's bob drops the beds under a screen-fixed brow** (`sunkAway`,
   `view.ts`): fix. The bob goes into the view the beds and the sink both
   read, or the brow and ground take the bob too — whichever keeps the foot
   on its ground row; the fix agent measures which on a mid-step rim frame.
2. **Dead `groundSeam` / `seamAt`** (`skyline.ts`): delete them and their
   tests, and correct the header.
3. **`meadow-scene.ts` past 450 lines**: move the `Controls` callbacks out.

## insects — review 5391050029

1. **A leaving flier comes at the child's face when he turns toward it**
   (`insect-view.ts` `fly`, `insect-away.ts`): the leaving end is recomputed
   each frame from the current view, so its depth along the new heading falls
   to the `V_NEAR` clamp. Call: **the leaving end is fixed on the plane when
   the leg sets off** — the place past the screen's edge at that eye — so a
   child turning after it sees it fly off across the meadow at its own
   depth, and the leg's timing stays the timing of the path drawn. Beaten:
   recomputing per frame (the defect); clamping only the depth to the
   set-off depth (still slides sideways with the turn, and the timing still
   misses). A unit test turns the eye during a leaving flight.
2. **A release with no perch in view is timed to the band-middle spot**
   (`wayOutOf`): carry the flier's own `Away` into its `WayOut`, as
   `Sight.aways` does for a leg out (`leg-timing.md` § 6).
3. **`insect-view.ts` past 450 lines**: move `fly`'s leg-frame→screen chain
   (veer, shadow, sink, cull, pose, hit circle) to a helper beside
   `insect-seat.ts`, unit-tested.
