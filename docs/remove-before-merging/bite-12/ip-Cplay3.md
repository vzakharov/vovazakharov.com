# ip-Cplay3 — veer: a perch behind the eye, the jump fixes, tabL and phoneP

## Done

- e01f3fd, 5783689: looking back, the no-perch releases are kept
  (`veer-back-<kind>-out-*`), then `perchesBack` grows a mushroom off `+` and
  plants a flower on a tuft in view, and each kind is released again (up to 6)
  until one flies in to a cap or flower with no `out` frame. A release's `to`
  names a cap even when it leaves by the side, so `to` alone is not "in view".
- f71c92d: `steps()` skips a frame whose heading moved more than
  1.5·`TURN_CRUISE`/FPS (the play's `face()` snaps); `flicks` is a check per
  kind — dashing kinds `step/zoom ≤ 1.1 × cruising·way/time` in butterfly px a
  frame (from `FLIGHT_HABITS`), butterfly and bee `≤ width/20` drawn.
- 15d6d8b: a 24-heading sweep logs where `+` has room and how many tufts a tap
  reaches; run last, after every measure.
- 6dc5fc2: the hover search waits 80 looks (40 found none twice on tabL).

## Findings

1. **No perch can be grown at heading π on either screen.** `+` has no room
   (`arrivals.roomy()` false) and no tuft is drawn from 2.09 to 4.19 rad on
   tabL, 1.83 to 4.45 on phoneP: the meadow's ground is the world ahead of the
   opening eye, and room/tufts are judged inside it. So check 1's landing half
   and `satBack` stay vacuous at π: the play fails "the + and a cap grew no
   mushroom" and "none of 0 tufts". Options: hold check 1 at the farthest
   heading with room (≈1.83 tabL, ≈1.57 phoneP), or accept that behind the eye
   only the fly-out-by-the-side case exists.
2. **The fly's/bee's dash per frame from the code is not 60 px.** `cruising ·
way / time` is 21.25 sizes/s for a fly, 15 for a bee (21.3 / 15.0 px a frame
   at 60 px butterflies, both screens); 1.1× that is 23.4 / 16.5 px. Measured
   peaks at own size: fly 64.7 (tabL) / 64.0 (phoneP), bee 48.1 / 31.1 — the
   hermite ease and zigzag peak ~3× the mean dash. Against dash-cap.md's
   60 / 36 sizes/s × 1.1 (66 / 39.6 px) the fly passes on both screens; the bee
   fails on tabL (48.1). `dash-cap.md`'s `across` cap is no longer in
   `flight-timing.ts`. The bound needs a decision.

## Left

- Decide finding 1 (heading for check 1) and finding 2 (what "dash cap per
  frame" is), then rerun.
