# p1c-grass-taps — hand-over note

Package: bite 12 P1 steps 2–3 remainder — the grass through the view, then
drawn-only taps and `+` judged in the view. Paths under
`src/pages/mushrooms/ui/scene/`.

## Done

1. Step 1, the grass through the view (this commit):
   - `tufts.ts`: `shownSprouts(view, sprouts)` projects every standing
     ground tuft per frame (`ofGround` at its foot, size × zoom, colours
     toned by the screen row, culled at `V_NEAR` and off screen) into
     `near` and `behind` (past `D_SEE`). `Grass.follow(view)` keeps the
     frame's view; `update` draws `near` and the seam grass into the old
     Graphics and `behind` into a second one at
     `depthOf({ ...UNPLACED, behind: true })` (−4.5, under the near hills).
     `at(point)` hit-tests the tufts where the last frame drew them
     (`tuftAt`, now generic over `WithTuft`), screen px as `tapMeadow`
     already passes; marked/refused tufts keep their identity on the layout
     tuft.
   - `grass.ts`: `seamGrass` gives `SeamTuft`s by azimuth round 360° (one per
     even share of the circle, jittered; count by `2π·F`), row =
     `seamCrest(azimuth)` + scatter; `seamShown(view, seam)` places them via
     `screenAt`. `parallax` import gone.
   - `ground-seam.test.ts`: scatter measured against `seamCrest`; coverage
     over 12 headings; a step moves no seam tuft and a full turn returns
     them. `tufts.test.ts`: `shownSprouts` at the opening (layout less the
     opening left, size unchanged, none behind) and at an eye stepped 3 in
     (at `ofGround`, size × zoom, a tap at the drawn middle lands).
   - `meadow-scene.ts` (one-line edit, not owned): `walk` calls
     `grass?.follow(view)` after `backdrop.follow`.

## Left

- `/preview` frames `walk-opening.png`, `walk-turned.png`, `walk-in.png` —
  not taken (context).
- Step 2 (drawn-only taps, `fingerPad` gone, `+` judged in the view, tests
  at two eyes) — not started.

## Decided

- Tuft taps are judged against the drawn (projected) tufts, not by mapping
  the finger back through `eye.toLayout`/`groundUnder`: what is hit is
  exactly what is drawn, at its drawn size, and the scene needs no change.
- Tufts behind the hills are drawn but take no tap (their middle is under
  the near hills).
- Seam tufts are stratified in azimuth so no heading's screen is bare; the
  old uniform scatter failed the coverage check on phone portrait once
  spread round 360°.
- Plantability (`plantableIn`, `bareToTap`) is still judged at the opening
  eye: a growth rule, like `keepsPatches`.
