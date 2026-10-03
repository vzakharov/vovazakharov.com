# rh-b — T142, air crowding as drawn

## Done

- `air-spots.ts`: each spot carries where the anchor draws it (`drawnAloft`
  at `viewAt(camera, anchor)`, as `Zoomed`). `crowdingsAsDrawn` crowds on
  those points, each wingspan × its zoom: `pointCrowdings` finds the
  candidates at the largest zoom any spot has, then each pair's pairings are
  kept only where drawn distance < (w_p·z_a + w_q·z_b)/2. `seatsEveryOne`
  (coarse or halved lattice) judges on the same drawn points and zoomed
  spans.
- `air-spots.test.ts`: new case, the bar as asked, on 844×390, 1180×820 and
  1920×1080 at eye = anchor = `OPENING_EYE` (red at fb82ca1 on all three,
  green after). The old "crowds nearer on the screen than a butterfly's
  wings" case judged layout px, so it now judges drawn points at each eye,
  butterfly wings × zoom, still "and no others".

## Measured (opening eye, seeds 3 and 7)

Spots offered, before → after: tablet 647 → 647, tablet portrait 888 → 888,
phone 390×844 400 → 400, phone sideways 146 → 146, small phone 252 → 252,
desktop 897 → 897 (the lattice picks the same spacing everywhere). Greedy
seating of all 10 insects, widest first, against the crowdings: 10 of 10 on
every screen, before and after.

## Left

Nothing in this package.
