# v18-drawn-place — a leg cut mid-flight timed from where the scene drew it

Builds `leg-timing.md` § 4.

## Done

- **Step 1, the model** — `Sight.drawn`, where the scene last drew each
  flier, by its id, in the places' frame (insect sizes of
  `layout.insectSize` px, `fromEye` in the clump's size: `placeOfAloft`'s
  units). `placesSetOff` (`model/flight-timing.ts`) times a leg set off
  before the old one arrived from that drawn place, falling back to
  `placesFlying` where the sight has none for the insect; `onward` takes
  it, so `nextFlight` and `flightAway` both read it. Test:
  `model/flight-timing.test.ts`. Commit 47d3a06.
- **Step 2, the scene** — `InsectView.drawnAlofts()` hands each shown
  insect's last drawn point (`shown.drawn`, what `legSetOff` sets the next
  leg off from), none for one not yet flown in (`entering`);
  `Perches.sightFrom(view, drawn)` frames them with `placeOfAloft`, the
  same seam as the perches' places; `MeadowScene.sightNow()` is the one
  spelling of the sight the release, tick and startle dispatch. Tests
  green: `fliers` 48/48 (3 min 45 s), `perches` 2, `perch-sight` 68,
  `insect-away` 7, `insect-shown` 2, the model's flight files.

## Left

- The play run (tabL `veer,meadow`), another agent's: whether the cut-leg
  overs (58 at v17) go. `fliers.test.ts` simulates its own drawing and
  sends no `drawn`, so it exercises only the fallback.
- `insect-view.ts` (451) and `meadow-scene.ts` (452) sit just past ~450.

## Decided

- The drawn place is read only while the cut leg is still flying
  (`now < arrives`); landed or hovering, the perch's place stands, as before.
- It is read for a leg in from away too: the drawn point is what the scene
  sets the next leg off from, where `placesFlying` had nothing to go on.
- `nextFlight`/`flightAway` take an insect whose `id` is optional
  (`Partial<WithId>`): one without an id is drawn nowhere and falls back.
- The sight's `drawn` is the previous frame's draw, framed through this
  frame's view: the tick dispatches before `InsectView.update`, and
  `legSetOff` starts the new leg from that same last-drawn point, so the
  leg is timed from exactly where it is drawn setting off.
- Every shown insect is in `drawn`, sitting ones too; the model reads it
  only for a leg still flying.
