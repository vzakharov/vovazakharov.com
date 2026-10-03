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

## Left

- Step 2: the reach test on an off-axis cap.
