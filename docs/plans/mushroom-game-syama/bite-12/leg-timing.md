# Bite 12 — a leg timed by its drawn length

The play run at the final HEAD (plan § "Rest of the bite", item 2) found
fliers drawn far faster than their cruise. Each call below, what it beat,
and the hand-over note that holds its numbers (under
`docs/remove-before-merging/bite-12/`).

1. **Every place in the eye's frame** (30e4919, `v15-flyspeed.md`,
   `v15-eyeframe.md`). Every `Place` `sightFrom` gave was in the opening
   layout's frame, only `fromEye` following the eye, so once the eye walked
   or turned a leg was drawn at 0.3–1.9× its cruise. Every place, and
   `onscreenOf`, is measured in the eye's frame (`framedOf` at the eye's
   heading, the azimuth clamped to `±FRAME_MARGIN`), which at the opening
   eye is the layout. This overrides `insects.md`'s ip-away call that kept
   places in the layout frame. Beaten: correcting `x, y` per perch after the
   fact (two frames still meet in `apartOf`). Facing away, a release flies
   out by the side, timed with `outFirst`.
2. **A release flying in, timed from where it is drawn setting off** over
   the brow (9d1ba38, `v16-play.md`, `entryOf` in `model/flight-in.ts`), not
   from the screen's edge; the edges only weight the first perch's choice.
3. **A leg cut mid-flight** (an eviction, a shy, a perch withdrawn) timed
   from the insect's place by the share of its time flown (74ed8ec,
   `v16-capaway.md`, `placesFlying` in `model/flight-timing.ts`), not from
   the perch it never reached. A leg in from away keeps the old timing.
4. **The scene tells the model where it drew a flier cut mid-flight**
   (47d3a06, e66e719, `v18-drawn-place.md`; `Sight.drawn`, `placesSetOff`).
   It applies only while the cut leg is still in the air, and to a leg in
   from away too, which with a drawn place no longer needs item 3's old
   timing. The scene steers every flight
   (`steer` in `insect-view.ts`), so neither the time share nor the dash
   curve finds the drawn point (0.05 of the way at 0.21 of the time, 0.92 at
   0.57; the dash-curve try made it worse, 162.6 px). The sight the scene
   sends with each tick carries each drawn flier's place, and `onward` times
   the new leg from it, falling back to `placesFlying` without one. The
   model stays pure: the place is input, as the perches' are. Beaten:
   modelling `steer` in the model (a second copy of the scene's steering);
   accepting the overs (a fly streaking across the screen is what a child
   sees).

5. **A flier that turns on its perch first darts its leg faster, and the
   watch allows it** (`v18-play.md`). `steer` flies the path from
   `departs + pivot` to `arrives`, so a leg that pivots for a share `s` of
   its time is drawn up to `1/(1 − s)` its cruise (1.33× at `PIVOT_SHARE`
   0.25); every surviving fly over at c52a36e is such a leg. The watch's
   speed bound for a leg is divided by `1 − s`, `s = PIVOT_SHARE·|lifted|/π`
   the share its own turn takes, derived from the constant (1fdf65a built it
   all-or-nothing; `v19-pivot-watch.md` found that hid phoneP fly-18, a
   1.27× dart after a 0.04 rad turn, so it goes proportional). A fly
   darting off after it turns is a fly; the operator judges the look on
   `to-check.md` ("Из прогона v18"). Beaten: a pivot timed outside
   the flight (moves every landing, and the model does not know the turn,
   which the scene takes from how the flier sat); the path moving during the
   pivot (changes every take-off's look for a 25% peak).

6. **A leg to away is timed to the flier's own leaving spot** (3a0b29d,
   `v21-fly18.md`): its own wingspan past the edge, at the height its phase
   picks in the band, carried in the sight as `Sight.aways` beside `drawn`;
   an insect without one keeps the band-middle spots. The way in has the
   same mismatch unmeasured (`wayOutOf` → `awayOn` band-middle, `entryAloft`
   the insect's own), fixed with the review's round.
7. **What is left is accepted**: phoneP fly-26 under 3% over (1.6% at
   3aaf95a), the size of the flutter `dashPeak` leaves out. Beaten: tracing
   a 2–3% residue, which no child sees. tabL fly-3's 2% was the held turn's
   slide (9.3 px a frame on tabL) read as the flier's step; the veer watch
   takes it out (3aaf95a, `rv-veer2.md`).
8. **A leg is timed in the frame it is drawn in** (34788c22, `rv-bee8.md`,
   `rv-legframe2.md`; tabL and phoneP veer with no bee over, `rv-veer2.md`). § 1
   frames each place alone at the eye's heading, its azimuth clamped to
   `±FRAME_MARGIN`; the view frames a leg's two ends together (`centreOf`),
   so a leg with an end past ~101° of the heading is drawn at 0.3–29× its
   timing (31 of 49 bee legs in the review's tabL veer; bee-8 1.71×, seen
   once the child turns to it). `centreOf`/`framedOf` move to the model,
   each `Place` carries its plane pose, and `apartOf` frames the pair by
   that one rule. Beaten: extending the clamp straight per perch (pairs
   both behind the eye still ~2.5× off); accepting it (a bee streaking
   across the screen is what a child sees, as in § 4).

**Where it stood at 300f3c0** (`v17-play.md`, tabL `veer,meadow`): units
green (`fliers.test.ts` 48/48); fly overs 88, worst 71 px against 38 — 58
from cut legs, 9 cap→away from rest, 14 whole cap→cap, 5 air→cap; bees 21,
worst 29.8 (the known class); the shying fly's heading passes (293ea93 skips
it). `walk,planting,hold` passed at v16.

**The frame median is not a signal in this container**: f584982, 22.9 ms
at v15, measured 32.1 beside HEAD's 29.0 (load 3–4.6 on 4 cores), so the
play's frame check reads as noise until a quiet run.
