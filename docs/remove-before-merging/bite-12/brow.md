# brow — hand-over note

Package: `## Rest of the bite` item 4, "the seam is a horizon you can see" —
the cover row (`groundTop + seamReach`) drawn as the brow of a small round
planet's horizon. Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. Step 1, the brow (this commit).
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

## Left

- Frames (tabL, phoneL, walking back), the walk play.
- Step 2: paling into the haze before the brow.

## Decided

- The brow's blades do not sway: they are drawn with the hills, only when
  the heading changes, so a still frame costs nothing.
