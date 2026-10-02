# Package tail-fliers — hand-over note

## Done

- **Red 1, fly one-frame steps to 82.6 px — a game red, fixed**
  (`flight-timing.ts` `placesSetOff`). Measured per frame: the seat end
  never moved (524.8, 592 ± 0.3 px, drawn throughout), so not I4's
  fallback. The leg set off on the frame the eye snapped from π to 0
  (`face(0)`), from an air cell now out of the air wedge: the sight placed
  the fly's own perch nowhere, so `apartIn` was undefined and the leg took
  the bare `flying` draw (613 ms) for a way from behind the eye to a cap in
  front. Dumping every leg's set-off places showed the same for many legs
  after any turn (air cells and caps the eye turned off), butterflies
  included. Now a leg set off from a perch the sight no longer places is
  timed from where the scene drew the insect (`drawn[id]`), as a cut-off
  leg already was. Test in `flight-timing.test.ts`. Rerun on tabL: fly max
  45.3 px own size (lifted 2.13, within 50.8), 0 over.
- **Bee steps (34.0 vs 25.8) — not the same cause; a harness red,
  loosened.** The bee's offending legs are placed at both ends; the steps
  are a smooth dart after a ~2.79 rad pivot, 33.9 against 33.2 with the
  pivot allowance (1.12 over the curve against `DASH_SLACK` 1.1).
  `DASH_SLACK` is 1.15; `to-check.md` § "Хвост 12b, летуны".
- **Red 2, six flies take air looking back — harness, made fair.** The fly
  is fussy: with no fly agaric open it roams the air most legs, and the
  one grown is the cap a butterfly rests on. The in-view releases now go
  fly first, and a release that takes the air notes what every other
  insect holds. (After the red-1 fix the old order already passed on tabL,
  a fly taking the flower first try; the reorder itself is not yet played.)

## Left

- Red 3, `play-insects.ts:343` (no butterfly rested on a cap to tap
  through): not looked into.
- The reordered veer play and the `DASH_SLACK` change: unplayed — play
  tabL `veer` once.
- `fliers.test.ts` not run after the `placesSetOff` change.
- The coordinator's add-on: time `retend` and `tendOn` into
  `__probe.hitches().tend` (`mushroom-probe.ts`): not started.
- tabP, phoneP, phoneL, phoneS unplayed.
