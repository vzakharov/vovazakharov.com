# SB — step (b), the spores' scene

Built `map-spores.md` § 5 (b) with § 3 "Scene", on SA's model (aacbd7f4).

## Done

- `ui/scene/spore-seats.ts`: `sporeOnTap(scened, id, now)` — `sowable`, then
  one `roomFor(stand, seed, view, parent.foot)`; `{}` when either finds
  none. Test beside it: six feet within `SPROUT_REACH`, none at the
  seventh, none from a growing sprout.
- `ui/scene/spore-bed.ts`: `SporeBed`, owned by `MushroomBed` as the public
  `spores` field — `reconcile` (a new id falls from its parent's crown along
  `fall`, then rests; opening or parent not shown: rests at once; gone id
  destroyed), `follow(view)`, `pickUp(at)`. A dot is `PALETTE.spore` mixed
  toward `PALETTE.air` by the haze, an ink rim fading with it, radius
  `0.02` of the laid size × zoom (≥ 1.2 px), stood with `standAt(…,
SHADOW_NEARER)`.
- `ui/scene/spore-drift.ts`: `fall` exported, one dot, `to: () => Point`;
  `driftSpores` pops every newborn at its own foot (a sprout's puff ×
  `SPROUT_START`) with the grow sound, no parent lookup.
- `ui/scene/mushroom-bed.ts` 429 → 436 (+7): the field, its construction,
  one line each in `reconcile`, `paint` (re-lays on a refit), `follow`.
- `ui/scene/meadow-scene.ts` 448 → 450 (+2): `shedNow` out; `onTap`
  dispatches `select` with `sporeOnTap`'s payload; `tapMeadow` tries
  `bed.spores.pickUp(at)` after the cloud and before the tuft, dispatching
  `unsow`.

## Decisions the map did not take

- **`sporeAt` and `pickUp` are one call**, `pickUp(at): string | undefined`,
  and the scene reaches it through `bed.spores` rather than a bed delegate:
  the two-call shape put `meadow-scene.ts` at 453 and the bed past +8.
- **`fall` lost its `DOTS` count rather than taking it as a parameter**: no
  four-dot caller is left once the shed's drift goes.
- **A dot's size**: 0.02 of the size its foot is laid out at. The meadow
  play's tabL frame at 0.012 showed the dots as 2–3 px specks a child would
  miss, so it went up; the frames agent judges it again.

## Left

- `shedding.ts`, `footShown`, `MushroomBed.inSight` stay for the probe until
  (c), and go in (d).
- The look (three dots round a cap, one picked up, the pop under rain) is
  the next agent's play.
