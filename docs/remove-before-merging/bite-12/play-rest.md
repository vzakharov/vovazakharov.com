# play-rest — hand-over note

Package: the species and tufts plays against the eye/view scene, then the
full play run on all five screens; then, if room, spec §4's checks from
`play-walk.md`'s "Left". Files: `scripts/play-mushrooms.ts`, `scripts/lib/*`,
`scripts/sweep-mushrooms.ts`.

## Done

1. `play-band.ts`: the band and ring are read off `bed.selection`
   (`outline`, `footRing`), where `MushroomSelection` keeps them. The frame
   the check draws with only the mushroom and its band holds each hidden
   object's `setVisible` off for that frame, since the view re-places (and
   re-shows) what it draws every step: a flower in front of a chanterelle's
   foot read as 26 gaps in its band.
2. `play-tufts.ts`: tufts are aimed at where the last frame drew them
   (`grass.shown.near`), not at their layout at the opening eye.
3. `play-species.ts`: a band gap's failure names where and in what colour.
4. `species,tufts` green on tabL (probe build of HEAD in a scratch
   worktree: the checkout's uncommitted `mushroom-patch.ts` edit threw
   "meadowCamera is not defined" at load).
5. `openingCrop` is still exported by `src` (`visit-play.ts`); left as is.

## Left

- The full run on all five screens.
- Spec §4: walk to a back-row mushroom and tap its drawn cap; an insect
  after a 180° turn; the frame budget walking into the forest.
