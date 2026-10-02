# v14-aloft — keeping a flight over the ground

## The cause

A leg is steered in its frame's screen space and its forward distance is
mixed along the chord (`mixD` of `flown`). Along the chord itself that is
safe: the ground line under the chord is linear in `flown` too, so the room
below the chord is the ends' heights mixed — never negative. What goes under
is everything `insect-paths.ts` swings off the chord: the bow (a butterfly's
`arc` 0.3 of the distance flown), the fly's zigzag, the flutter and the hop.
A leg across the screen bowed down the screen dips below the chord's ground
line by up to ~0.68 of the chord over the room's 0.3 — the −1.76 the play
measured. `aloftFramed` read that point back at the chord's forward, so
underground.

## The fix (step 1)

`aloftFramed` keeps the screen point and moves the insect nearer along its
own sight instead: below the horizon a sight drops `EYE_HEIGHT − h` over
`forward`, so a point the bow swings below its chord's ground line is a
point nearer than the chord, over the grass. Its height is the exact
inverse's from `SKIM` (0.1 clump sizes) up, and below that eases to 0 on
`SKIM · exp((h − SKIM) / SKIM)`, matched in value and slope at `SKIM` — so
no kink in its height, its distance or its size, and it never reaches 0.
The exact inverse is kept as `unframed` (the layout round-trips use it).

Nothing in `insect-view.ts` changed: it already calls `aloftFramed`.

Not a clamp: the screen path is exactly what it was, so a child sees no
bounce; what changes is depth — the swoop reads as toward the viewer (drawn
up to ~1.4× bigger at the deepest dip measured), and its shadow lies under
it. At an `away` end (h = 0 past the brow) the knee pulls the insect ~0.9%
nearer; it is past the brow and sunk there.

Test: `insect-frame.test.ts` § `aloftFramed` — a butterfly leg between two
caps 0.3 up, bowed down the screen, reads to −0.54 `unframed` and stays
over 0 with `aloftFramed` on its own screen point; a dt²-scaled bend test
catches a hard floor (grows 3.7× as samples thicken; the knee 1.1×).

## Commits

- 41d6ee7 fix(mushrooms): keep a flying insect over the ground, nearer on
  its own sight

## Step 2 — dropped by the operator

Step 2 (the play and its frames) was taken out of scope; the operator
checks by hand. One tabL `meadow` run had already gone before the word
came, with a temporary per-frame dump (reverted, not committed): over 3910
frames and 9668 visible shadows, the lowest drawn `h` was 0.00005, none
under 0, no shadow drawn above its insect, no shadow on screen with its
insect hidden (the v14-insect-play run had 15 of 52 shadows over insects
underground). The play's other reds were the ones v14-insect-play listed,
unchanged. No frames committed.

## Noted

- `pnpm type-overlap` is red before this package (`at: number` shared by
  `Steering` in `insect-steering.ts` and `KeySown` in `planter.ts`); not
  touched here.
