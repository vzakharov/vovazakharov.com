# rv-insects — review 5391050029 (insects)

Contract: `docs/plans/mushroom-game-syama/bite-12/review.md` § "insects —
review 5391050029".

## Done

1. Finding 2 — a release's way out of view is timed to its own leaving spot.
   `onscreenOf` takes the released `{ kind, seed }` (`arrivals.ts` passes it)
   and `wayOutOf` its `Away` (`releasedAway` → `ownAway`, the same one
   `InsectView.awayOf` now uses); without one it keeps the band-middle spot
   (`scripts/lib/veer-away.ts` calls it so). Test: `insect-away.test.ts`
   "onscreenOf, for a release".

## Left

2. Finding 1 — leaving end fixed on the plane at set-off.
3. Finding 3 — `fly`'s leg-frame→screen chain out of `insect-view.ts`.

## Decided

- `arrivals.ts` (not on the owned list, not off limits) draws the release's
  seed before the dispatch so `onscreenOf` can stand that insect away.
