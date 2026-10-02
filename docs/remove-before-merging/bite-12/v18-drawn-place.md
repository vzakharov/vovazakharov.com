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
  `model/flight-timing.test.ts`.

## Left

- Step 2, the scene building `drawn` into every Sight it dispatches.

## Decided

- The drawn place is read only while the cut leg is still flying
  (`now < arrives`); landed or hovering, the perch's place stands, as before.
- It is read for a leg in from away too: the drawn point is what the scene
  sets the next leg off from, where `placesFlying` had nothing to go on.
- `nextFlight`/`flightAway` take an insect whose `id` is optional
  (`Partial<WithId>`): one without an id is drawn nowhere and falls back.
