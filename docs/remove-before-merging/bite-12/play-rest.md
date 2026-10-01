# play-rest — hand-over note

Package: the species and tufts plays against the eye/view scene, then the
full play run on all five screens; then, if room, spec §4's checks from
`play-walk.md`'s "Left". Files: `scripts/play-mushrooms.ts`, `scripts/lib/*`,
`scripts/sweep-mushrooms.ts`.

## Done

1. `play-band.ts`: the band and ring are read off `bed.selection`
   (`outline`, `footRing`). The frame the check draws with only the mushroom
   and its band holds each hidden object's `setVisible` off for that frame,
   since the view re-shows what it places every step (a flower before a
   chanterelle's foot read as 26 gaps). A gap's failure names where and in
   what colour.
2. `play-tufts.ts`: tufts are aimed at where the last frame drew them
   (`grass.shown.near`), and only those whose middle is on the screen (a
   tuft is drawn while its blades reach over the edge). A refusal names the
   tuft the tap reached and whether it shook its head.
3. `play-insects.ts` / `play-buzzers.ts`: `fliersOn` gains `tappable` (on
   screen, off every control's tap reach) and `waitInReach`; the resting
   butterfly tap and the fly-in-flight taps wait for an insect a finger can
   reach. A miss names what the tap reached.
4. `openingCrop` is still exported by `src` (`visit-play.ts`); left as is.

Probe builds ran in a scratch worktree of HEAD: the checkout held the
patch agent's uncommitted `mushroom-patch.ts`, which threw "meadowCamera is
not defined" at load.

## The run, per screen

- tabL: all five plays pass (at b3254511, before the patch fix 2758d677).
- tabP: all five pass (same build).
- phoneP: all five pass (608fbcfc). Before 2758d677 the `+` opened nothing
  once one mushroom was grown, failing meadow/species — the patch fix's.
- phoneL: walk, planting, species, tufts pass (608fbcfc); meadow failed 8
  of 10 fly taps (taps under the `+`/`−` column, a script aim), passes
  after the fix (adfe6fc6 + item 3).
- phoneS: walk, planting, species, tufts pass (adfe6fc6); meadow failed on a
  resting butterfly drawn at x = −9 (script aim), passes after item 3.

## Left

- One full five-screen rerun at the final HEAD (tabL/tabP were last run
  before 2758d677).
- Spec §4: walk to a back-row mushroom and tap its drawn cap; an insect
  after a 180° turn; the frame budget walking into the forest.
- Frames from these runs are not committed (they sit in the scratch
  worktree's `tmp/play/`).
