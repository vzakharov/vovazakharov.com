# Package C — the map's play run: hand-over

## Done

- `__probe.map()` → `{ open, drawn: { centre, middle, reach, scale, things } | null }`;
  `MapView.last` keeps the frame and count of things it last drew.
- `scripts/lib/play-map.ts`, registered as `map`: fresh meadow, the map shot
  closed (`m0`), 3 frames into the unfold (`m1`), open (`m2`); a tap on the
  sheet shuts it; three mushrooms grown, the newest given a window and a
  door, a flower planted on the nearest tuft, a turn and a walk (`m3`), the
  map open again (`m4`). Fails on a map that does not open or shut, a
  centre off the eye, a furnishing that did not land, or fewer than four
  more things drawn the second time.
- Ran on tabL and phoneP; every frame looked at.

## Fixed

- **Flowers were placed by their layout place, not their plane foot.**
  `flowersOf` gives each flower `place` (the layout's screen footing) and
  `foot` (the plane, in clump sizes); `map-view.ts` framed and drew by
  `place`, so the reach came out ~2057 clump sizes, the scale 0.2 px and the
  whole opening clump sat on the child's dot. Now `foot`: reach 14.4,
  25 px per clump size on tabL, 10.5 on phoneP.

## Looked at and left as is

- Orientation holds: the clump lies on the heading, the sun ~30° right of
  it on the map as in the view; after a 0.56 rad turn right the arrow
  points at the map's sun, as the view has the sun dead ahead.
- Paper and edge sit with the palette; the sun clears the 26 px margin;
  nothing clips at the sheet's edge once open.
- `emerge` overshoots, so mid-unfold the sheet is briefly larger than the
  screen (by call 4's design); `to-check.md` asks the operator.
- The house at map scale (ink 1 px) reads as a dot and a smudge; the
  12 px cap floor holds mushrooms readable on phoneP; flowers sit at
  their 9 px floor. Both in `to-check.md`.
- On phoneP the scale fits the reach to the width, and everything planted
  lies ahead of the child, so a fresh meadow is a narrow band in the
  middle of a mostly empty sheet. That follows call 7's centre-on-child and
  shorter-half-side fit, so it is a question for the operator, not a fix.

## Left

Nothing of package C's.
