# rh-c1 — T143, the unit half

## Done

- Step 1: `ui/scene/perch-follow.test.ts` — the opening forest plus a copy of
  it 40 up the plane; a fly, a butterfly and a bee each released through the
  real reducer, ticked with the sight judged at (0, 0) (`Perches.see`) until
  it sits on a cap or flower, then ticked once with the sight judged at
  (0, 40). Its perch is gone from the new places, and its next leg goes from
  it to a perch among them (fly and butterfly to far caps, the bee to an air
  spot, the far forest having no flowers). Green with no source change: the
  game already follows (`isDue`'s `!isOffered` in `model/insects.ts`).
  Red with that clause deleted, all three cases.

- Step 2: `perches.test.ts`'s reach case now puts its cap at (15.5, 5.5),
  16.45 from the anchor (0, 0): a scan of the plane in half-steps finds the
  layout placing a cap past `PERCH_REACH` only at (±15–15.5, 5.5–6), the
  same on every screen (the frame is the world's). The case asserts
  `placeIn` places it and `perchSight` does not offer it; from (2, 0) it is
  offered. Red with the caps' `inReach` filter removed, green restored.

## Left

Nothing in this package; the play check is C2's.
