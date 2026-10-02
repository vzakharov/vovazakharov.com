# v14-reds2 — the sky hairline and the red type-overlap

Continues `v14-reds.md` (its items 4 and 5). No play runs; each fix is
proven by a unit test that fails before it.

## 1 — the sky hairline: fixed

**Cause.** Phaser's fill skips any path point within `pathDetailThreshold`
(1 device px) of the point it kept before. A hill band is the skyline
clamped into the band, so where the skyline dips below the band its outline
runs flat along the band's bottom edge, and that run starts at the point
where the skyline crosses the edge (`crossings`). When that crossing fell
within 1 px of the skyline sample before it, Phaser skipped the crossing and
started the flat run from the sample instead, a fraction of a pixel above
the edge: a sliver of the band, under a pixel thick and as long as the dip,
sloping across the sky. Under the canvas's multisampling it shows as one
row ~25% toward the band's colour — `tabL-back-row-tap`'s row 588, a far
range band's edge (the hills' fill steps there). `beforeCorner` already
guarded the one such case at the band's lower right corner; the crossings
along the skyline were unguarded.

**Fix.** `hillBands` (`ui/scene/skyline.ts`) passes each band's outline
through `keptOnEdges`, which replaces `beforeCorner`: a point on the band's
top or bottom edge is never the one Phaser skips — the off-edge points
within `PATH_SKIP` before it go instead (moving the outline by under
`PATH_SKIP`, inside the band). The corner case is one instance of it.

**Test.** `skyline.test.ts` § "the hill bands along their edges": no point
on a band's edge is skipped by Phaser's path detail (×1, ×2, ×3) after a
point off that edge — six screens, five visits, 720 headings, all three
ranges. Failed on every screen before the fix; the tiling and simple-polygon
tests still pass.

Not confirmed on a rendered frame: the hairline depends on the visit's
skyline and the heading, so a still of a random meadow would not show it;
the play's seeded meadow is the one that does.

## 2 — `pnpm type-overlap`: green

`Steering.at` (ms on the scene's clock, the frame the body was held at) and
`KeySown.at` (seconds on the scene's clock, the frame keys sowed in) are not
one meaning — a shared base would invite mixing the units. Per the README's
rename pass, `Steering.at` became `heldAt` (it is read as `held.heldAt`;
`pan.ts`'s `sampledAt` is the precedent). `KeySown` keeps `at`.

## Done

- 1 and 2 (see commits on the branch, `fix(mushrooms): …` from v14-reds2).

## Left

- Nothing of this package.
