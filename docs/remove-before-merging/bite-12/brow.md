# brow — hand-over note

Package: `## Rest of the bite` item 4, "the seam is a horizon you can see" —
the cover row (`groundTop + seamReach`) drawn as the brow of a small round
planet's horizon. Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. 99f2007d, 1f0fd68e — step 1, the brow.
   - `brow.ts` (new): `browBlades(camera)` — blades round the whole
     panorama, one to each even share of the circle, from the brow's own
     seed (`BROW_SEED`), so the backdrop's `random` stream is untouched;
     `browShown(view, blades)` places them by azimuth (`screenAt`), so a
     turn slides them as it does the hills; `drawBrow` draws the crest (four
     rows from the cover row, `BROW.crest` fading into the ground over 0.45
     of the seam's reach) and the blades (dark, a third lit).
   - Sizes are shares of the seam's reach: gap 0.3 (≥ 2.5 px), height
     0.3–0.7, so no tip reaches `groundTop`, where a thing crossing `D_SEE`
     has its foot — nothing goes behind the blades at once.
   - `paint-backdrop.ts`: `Backdrop.brow`, depth −2.5 (over the ground at
     −3 and what sinks at −3.5, under the wash and grain), drawn live with
     the hills only when the heading changes (no rebake, no per-frame cost
     while still).
   - `view.ts` `coverRow`, which `sunkAway` and the brow share.
   - Palette: `BACKDROP.browLit`; tones `BROW` in `backdrop-tones.ts`.
   - `brow.test.ts`: tips below `groundTop`, roots at or under the cover
     row, one density at every heading, a turn slides them, same camera
     same blades.

2. Frames (scratch worktree at f28b892e, walk play): `frames/bite-12/`
   `tabL-brow-rim.png` and `-rim-close.png` (walked back to the rim: the
   blue flower right of the clump is going down behind the fringe, its
   stem's foot hidden by the blades), `tabL-brow-quarter.png` (bare
   ground a quarter turn round: the crest and blades across the screen),
   `phoneL-brow-rim.png`. Walk play green on both (tabL: 5 under the cover
   on ↓, at most 8.4 px over it; phoneL: 5, 4.0 px); frame JS median 11.3
   and 9.6 ms.

## Left

- Step 2: paling into the haze before the brow (not started). Only
  mushrooms haze (`mushroom-bed.ts` through `hazeAhead`); the way in is an
  extra term in `hazeAhead` past `D_SEE`, rising as a thing sinks, so the
  opening frame (back row ≤ 13.24 ahead) is untouched. Flowers have no
  haze, so paling them needs `flower-bed.ts` (a `.patch`).
- The crest is soft; on tabL it reads as a light line under the blades. If
  it should read stronger, `BROW.crest`'s mix (0.5) and `CREST_DEPTH` are
  the knobs.

## Decided

- The brow's blades do not sway: they are drawn with the hills, only when
  the heading changes, so a still frame costs nothing.
