# porcini-flicker — hand-over note

The operator's report: on porcini only, the cap's fill flips ~10 Hz between
two looks, not always, since porcini arrived (bite 8).

## Cause (measured)

The porcini's pale margin (`paintMargin`) is a `crescent` along an arc with
two sharp corners, where each side's climb meets the flat underside. The
crescent pulls its inner edge in along each vertex's normal by up to
`0.2 * capHeight`, more than those corners can take, so the inner edge loops
back over itself at both corners: every porcini's margin crossed itself
(120/120 seeds × lights at 28 chords, 96–120/120 at fewer). Phaser re-runs
earcut on every Graphics fill every frame, on the points as the frame's
scale and rotation place them and after skipping points within 1 device px
(`pathDetailThreshold`), and earcut fills a crossed outline differently
under sub-pixel changes: the idle breath alone swung the margin's covered
area by up to 74% between frames. No other polygon a mushroom paints
crossed itself or moved (a probe recording every `fillPoints` of the real
painter, swept over 60 frames of sway).

## Done

- `crescent` moved out of `shapes.ts` (which loads Phaser) into the pure
  `ui/scene/crescent.ts`, its inner edge now `untangled`: a loop is cut at
  its crossing, so no crescent's outline can cross itself. Where the inner
  edge never looped (every other crescent in the game) the outline is the
  same point for point.
- The margin's outline is the pure `marginBand` in
  `ui/scene/porcini-margin.ts`, so a test can build the real one.
- `segmentCrossing` in `model/geometry.ts`.
- `porcini-margin.test.ts`: the band uncrossed across 120 seeds × four
  sizes (chord counts), and as Phaser keeps it across 60 frames of sway; a
  sharp-cornered crescent uncrossed. All three fail on the old `crescent`.

## Left

Nothing for the flicker. Seen in passing, not fixed: at the fewest chords
(8) a porcini's band ink (`inkedFill` → `inkUnder` in `paintBand`) crosses
itself on about a third of seeds, but its covered area did not move across
frames, so nothing flickers from it.
