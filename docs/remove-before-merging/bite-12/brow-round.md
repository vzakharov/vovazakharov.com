# brow-round — the operator's second play (portrait phone)

Screenshots in `brow-round/`, the operator's red marks on each:

- `1.webp` — a blue flower at the screen's middle stands with its foot
  above the brow's fringe, on the far strip, short of going under.
- `2.webp` — the same far flower near the screen's left edge, after a
  turn, stands lower, its foot at the brow. Turning moves far flowers up
  and down through the straight brow.
- `3.webp` — a flat pale band across the hills, a thin lighter line with
  a translucent flat-topped region under it, seen at some headings and
  not others.

The operator, verbatim:

> 1- положение по вертикали в момент "ухода за горизонт" выше горизонта
> (скрин 1), при этом оно зависит от того, находится ли цветок по центру
> или сбоку (скрин 2), поэтому при повороте далёкие цветы то вылазят
> вверх, то обратно идут вниз. закруглить горизонт? или считать вместо
> тригонометрии как-то иначе расстояние? или может другие идеи которые
> тебе придут в голову
>
> 2- периодически вылазит вот такая полоса, не знаю с чем связанная.
> видна на определённых поворотах но не на других.

The call is in the plan, item 4, "**Decided, from the operator's second
play: the brow is round.**"

---

# brow-round — hand-over note

Package: the round brow and the flat pale band, plan item 4's "**Decided,
from the operator's second play: the brow is round.**" Paths under
`src/pages/mushrooms/ui/scene/`.

## Step 1 — the trace, measured

A flower at a fixed distance `r` from the eye (heading 0), placed at three
screen x's, through HEAD's `sunk` (foot row in CSS px; "brow" is the drawn
straight brow, `coverRow`; "circle" is the row of the `D_SEE` circle at that
x, `y_h + (groundTop − y_h)/cos θ`):

| screen              | r                  | x mid                | x ¾               | x edge             |
| ------------------- | ------------------ | -------------------- | ----------------- | ------------------ |
| phoneP (brow 597.3) | D_SEE − 0.6        | 605.3 / circle 588.4 | 606.6 / 589.7     | 610.2 / 593.1      |
|                     | D_SEE              | **588.4** / 588.4    | **589.7** / 589.7 | **593.1** / 593.1  |
|                     | D_SEE + 0.3 (sunk) | **596.3** / 588.4    | **595.0** / 589.7 | **591.7** / 593.1  |
|                     | D_SEE + 0.8 (sunk) | 608.7                | 607.4             | 604.2              |
| tabL (brow 503.5)   | D_SEE              | **492.0** / 492.0    | **501.1** / 501.1 | 524.8 / 524.8      |
|                     | D_SEE + 0.3        | **502.1** sunk       | **493.2** sunk    | 513.9 not sunk     |
|                     | D_SEE + 0.8        | 518.0 sunk           | 509.4 sunk        | **496.9 not sunk** |

What it shows:

- **Things go under at `groundTop`, the brow is drawn `seamReach` lower.**
  `sunk` reflects about `groundTop` (the row of `D_SEE` straight ahead), so
  a thing near `D_SEE` at the middle stands with its foot up to `seamReach`
  (phoneP 8.9 px, tabL 11.5 px) above the drawn brow: screenshot 1.
- **The sink is keyed on `ahead`, the depth along the heading, not on the
  distance** (`behindHills` reads `placed.ahead`), so the plan's "keyed on
  the distance along the ground (kept)" does not describe HEAD: HEAD is the
  plan's _beaten_ option. A thing at a fixed distance sinks at the middle
  and stands unsunk at the side (tabL, `D_SEE + 0.8` at the edge: foot at
  496.9, 6.6 px above the brow, not sunk), and turning toward it sinks it.
- **The row of a fixed distance falls toward the edges** (the `D_SEE`
  circle: phoneP 4.7 px lower at the edge, tabL 33 px), so a far flower
  rides up at the middle and down at the side as the child turns:
  screenshot 2.

So the decided fix holds as written, with one change it implies: the sink
is keyed on the distance (`ahead / cos θ`), as the plan meant, and the brow
is the `D_SEE` circle's row at each x.

## Step 3's band, traced

Phaser's Graphics fill drops every outline point within
`pathDetailThreshold` (default 1 device px) of the last kept one before
triangulating. A hill band's outline ends `…, last crest point, (right,
y1), (left, y1)`; where the clamped crest ends within a px of `(right, y1)`
that corner is dropped, the closing edge runs slightly sloped and crosses
the band's own clamped edge, and earcut fills triangles outside the band:
a flat slab of that band's colour across the range behind it, its top a
band level (flat), at only the headings where a crest end lands within a
px of a level. Measured (Phaser's own `Earcut`, its 1 px skip, 720 headings
× 6 hill seeds × 3 ranges × 16 bands): tabL 380 / 207 360 bands overfilled,
up to 12 400 CSS px²; phoneP 154, phoneL 473, tabP 231. With the skip off
(threshold 0): 0 on every screen.

**Fixed (see Done).** A Graphics' own `pathDetailThreshold` cannot lower
the game config's (`max(object, config, 0)`), so fa6dbe0a's threshold 0
did nothing in the game; the fix is in the outline: `hillBands` drops the
crest's end points within `PATH_SKIP` (1 CSS px) of the band's lower right
corner, so Phaser skips nothing that matters. The probe's sweep (720
headings, the game's own hill paths read from the command buffer, Phaser's
skip at the screen's ratio): phoneP 25 headings with a crossed band before
(5°, 23°, 54°, 59°, 65.5°, … 339.5°), tabL 59; after, 0 on both.
`frames/bite-12/phoneP-brow-round-band-{before,after}.png` (heading 23°):
the flat slab across the sky and hills at y ≈ 615 is gone.

## Done

1. 3157cfb7 — the trace above.
2. fa6dbe0a, 7b82014a — the pale band. fa6dbe0a's `pathDetailThreshold = 0`
   was a no-op (see above); 7b82014a is the fix: `skyline.ts`
   `PATH_SKIP`, `beforeCorner` in `hillBands`; `skyline.test.ts` sweeps 720
   headings × 3 visits × 6 screens × ratios 1–3 through Phaser's own skip
   and finds no band outline crossing itself (fails without the drop).
3. The round brow (this commit):
   - `view.ts`: `Placed.distance` (true distance on the plane);
     `behindHills` keys on it; `browRow(camera, x)`, the `D_SEE` circle's
     row at x (`groundTop` at the middle; phoneP 4.7 px lower at the edges,
     tabL 33 px), `browLowest`; `sunk` reflects about `browRow` at the
     thing's x; `buried`, `sunkAway` read the brow at its x. `coverRow` is
     gone.
   - `brow.ts`: `drawBrow` draws, along the curve, the ground from the brow
     down to `browFloor` (where the ground picture now starts:
     max(`groundTop + seamReach`, `browLowest`)) in the picture's own
     tones (`backdrop-tones.ts` `groundRowAt`, `GROUND_BANDS`, which
     `paintGround` now shares), over what sinks; the crest strips follow
     the curve; each blade is rooted on the brow at its own x. Still drawn
     only on a heading change; the curve itself is the same at every
     heading.
   - `paint-land.ts`: the ground picture starts at `browFloor`; the near
     range's foot fill reaches to it, so the far ground beyond the brow
     (between it and the hills, deepest at the screen's edges) is the near
     range's foot colour, under what sinks.
   - `bed-place.ts` carries `distance`; `repaint-queue.ts` `browPale` keys
     on distance, `hazeAhead` takes `{ahead, distance}` (haze on `ahead`, as
     the layout painted it; the paling on distance); `mushroom-bed.ts`
     passes its place.
   - `play-walk.ts` `checkPops` reads the brow at each thing's x (the trace
     records it). Walk green: tabL 6 under the cover on ↓, at most 9.4 px
     over it; phoneL 6, 4.5 px; frame JS median 10.7 / 9.9 ms.
   - Tests: `view.test.ts` — the brow is the circle (every eye, five
     angles), lower toward the edges; sinking per x with no jump; "no drawn
     foot above the brow at its x" over 36 headings × 4 eyes × 29 angles ×
     9 distances on 12 cameras; `sunkAway` per x. `brow.test.ts` — blades
     rooted on the brow at their x. `bed-place`/`repaint-queue` opening
     tests skip what stands past the brow (below).
   - Frames: `tabL-brow-round-rim.png` (the rim: the brow a visible curve,
     the blue flower right of the clump going under at the middle, the
     pink flower at the left edge on the lowered brow),
     `tabL-brow-round-side.png` (16° round: the blue flower near the left
     edge going under there), `phoneP-brow-round-rim.png` (the blue and
     purple flowers either side of the clump going under; the curve is ~5
     px on a phone), `phoneL-brow-round-rim.png`.

## Left

- `brow-round-flower-pale.patch` (beside this note): `flower-bed.ts`
  `stand` pales by `browPale(place.distance)` rather than `place.ahead`, so
  a flower pales by the same distance it sinks by. One line; applied in the
  frames' worktree. Until it lands a flower at the side pales a little less
  than it sinks.
- `brow-round-tufts-test.patch`: `tufts.test.ts` "draws every tuft at the
  opening as laid out" asserts no tuft sinks at the opening; on tablet,
  phone held sideways and desktop a grown tuft laid past the circle by the
  screen's side now does (as the opening's flowers do, below). The patch
  checks that what sinks is past the brow instead. **Red without it** (3
  tests); `tufts.test.ts` is with the tufts' owner, so it is not applied.
- Every other scene test file green at 085175dd, `fliers.test.ts` included.

## Decided

- **The sink keys on distance**, as the plan meant (HEAD keyed it on
  `ahead`, the plan's beaten option).
- **At the opening, a thing laid past the `D_SEE` circle sinks.** The world
  frame reaches past the circle toward the screen's sides: on 5 visits, 1
  on-screen opening thing on phoneL (0.82 past, sunk 14.6 px) and 1 on
  desktop (0.59, 28 px), none on tabL/tabP/phoneP/phoneS; off screen, 3–9
  a screen. The opening-identity tests (`bed-place`, `repaint-queue`) now
  skip what stands past the brow and check it sinks instead; such a
  mushroom is repainted once (paler) at the opening.
- **A thing crossing the brow passes behind the blades in one frame**
  (from its row's depth to −3.5), as it passes the fringe's own distance;
  the old "no tip reaches `groundTop`" rule is gone with the straight
  brow.
