# Bite 11 — package "hills" hand-over

## Done

- Step 1: the far ranges are pressed, not clamped, under the sun
  (`skyline.ts`). `sunBowl` is the old parting's bowl as a ceiling; each far
  range (`farRange`, `farthestRange`, which return the unparted line and its
  crest) is squashed toward the near hills' band (`nearHills`) by the share
  that brings its crest to the bowl, eased by a smooth soft-min
  (`share / (1 + share³)^(1/3)`), so the lowered stretch keeps rolling with
  no level top and no shoulder, and never rises above the bowl. The bowl's
  sides widen from 3 to 5 sun radii (`PARTED_SPREAD`) so the lowering eases
  in over a wide shoulder; its sag is `sin²` (no corner at the sweep's ends)
  and bends no sharper than half the sides do, however short the sweep.
  `skyline.test.ts` gains a pure test: the parted line's sharpest bend (per
  sun radius) exceeds the unparted line's by at most 0.25, and it stays below
  the disc along the sun's whole track, on every screen, 200 visits. The old
  clamp fails it on every screen.

## Left

- Render before/after frames (`look/hills-*.png`) and replace
  `frames/bite-11/phoneP-pan-dragged.png`.

## Decided

- Squash toward `nearHills` rather than the horizon: the lowered range's
  troughs sink a little below the horizon (into the near hills' band, which
  covers them), which is what keeps it rolling where the bowl is lowest
  (phone held sideways, where the bowl nearly reaches `nearHills`).
- The soft-min lowers a range slightly even where the bowl just clears its
  crest (at room = 1 it keeps ~0.79 of its height); far from the sun's track
  it keeps its whole height to within a percent.
