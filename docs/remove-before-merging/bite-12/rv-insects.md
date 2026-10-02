# rv-insects — review 5391050029 (insects)

Contract: `docs/plans/mushroom-game-syama/bite-12/review.md` § "insects —
review 5391050029".

## Done

1. Finding 2 — a release's way out of view is timed to its own leaving spot.
   `onscreenOf` takes the released `{ kind, seed }` (`arrivals.ts` passes it)
   and `wayOutOf` its `Away` (`releasedAway` → `ownAway`, the same one
   `InsectView.awayOf` now uses); without one it keeps the band-middle spot
   (`scripts/lib/veer-away.ts` calls it so). Test: `insect-away.test.ts`
   "onscreenOf, for a release". (0a60977)
2. Finding 1 — a leaving flight's end is fixed on the plane on its leg's
   first frame (`legEnd` in `insect-away.ts`, kept in `Shown.goal`, which
   `legSetOff` clears). Test: `insect-away.test.ts` "legEnd" turns the eye
   0→1.5 rad each way during the flight. (ed5b34e)
3. Finding 3 — `fly`'s leg-frame→screen chain (veer, shadow, sink, cull,
   pose inputs, hit circle) is `drawnInsect` in `insect-drawn.ts`, tested in
   `insect-drawn.test.ts`; `insect-view.ts` is 414 lines.

## Left

Nothing of the three findings.

## Decided

- `arrivals.ts` (not on the owned list, not off limits) draws the release's
  seed before the dispatch so `onscreenOf` can stand that insect away.
