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

## fliers.test.ts

- "hold spots in the air apart" measured layout px against unzoomed wings,
  the spacing T142 replaced; it now measures the drawn points at the
  layout's anchor, each wingspan × zoom. With that measure it is red at
  fb82ca1 (phone sideways, overlap 0.0017) and green after.
- "caught by a tap … seven times in ten" had fly on tablet portrait at 0.704
  at fb82ca1 and 0.691 after, over 2 visits. Over 8 visits it is 0.704 before
  and 0.705 after, so the game did not get worse; the sample is now 8 visits
  (`TAP_SEEDS`), the 0.7 bar unchanged. It still sits only just above the bar
  on tablet portrait, before and after.

## Left

Nothing in this package.
