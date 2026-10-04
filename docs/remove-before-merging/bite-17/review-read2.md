# Bite 17 review — reader 2 (walk/eye/flight/grass/layout, scripts)

Diff 875adf9..1228765. Ran out at 170k before grass.ts, gait-icon.ts,
picker-rows.ts, flower-plots' other hunks, stride.test.ts, decisions.md.
Clean: resize mid-rise keeps rise/gait; seeded streams unshifted; eye-height
readers consistent (fliers' frames at EYE_HEIGHT by design); no file >450.

1. **Should fix — grass tended to the walking brow in flight.**
   `ui/scene/tending.ts:186` `const reach = browDistance(view) + PALE_SPAN;`
   — its caller `Grass.grownRound` (`tufts.ts:319`) passes
   `viewAt(stand.layout.camera, eye)`, defaulting to EYE_HEIGHT: tufts tended
   to 15.03 while flight's brow is 16.0; a flip with no step never re-tends
   (`strayed` checks place/heading only). Ask: fully risen, every lawn tuft
   ≤ browDistance + PALE_SPAN in the screen's azimuth is in
   `tended.standing()`; a flip re-tends within N frames.
2. **Should fix — haze stops at the things.** `model/eye-height.ts:4-6`.
   `hazeAhead` ignores eyeHeight; the ground bake hazes by row (0.4 at the
   brow) while a thing there gets ~0.63. Ask: the ground's haze at the brow
   row equals `hazeAhead` at browDistance within 0.02, or `bite-17.md` § Left
   carries it (fe.md § Left 1 designs the wash).
3. **Should fix — latent near/far index pairing.** `flower-layout.ts`
   `seededBed`'s `if (foot) bed.push(foot);` with `plotted`
   (`flower-plots.ts:223-225`) and `anchored-stand.ts:97` pairing by index:
   one dropped near slot shifts flower-14 into far slot 0. Ask: `seededBed`
   returns one entry per slot; over 200 random window sizes × 20 seeds every
   near flower id sits on a NEAR_BAND slot.
4. **Should fix — gait flip mid-drag moves a flight.** `walk.ts:122`
   (withGait doc), `:266` `stepAim(lensAt(walk, time), …)`, `:355`
   `lockAt(lensAt(…))`: the chase keeps its pressed gait but reads the
   current height; a flip or a press within the 0.5 s rise jumps the aim by
   0.2·distanceOfRow (1–2.7 units) and feeds the fling. `locking` (`:332`)
   reads gait at lock, not press. Ask: press in flight, flip to steps at
   0.1 s, move 1 px — the eye moves ≤ that row's ground distance, no fling.
5. **Should fix — no play checks flight's ground-under-finger.**
   `scripts/lib/play-walk.ts` (removed checkUnderFinger calls ~277, ~371);
   st.md said keep it for flight. Ask: a walk-play pass in flight asserts
   ground within 3 % of the finger on every move (at lensAt's height).
6. **Nit — gait-spot tier 3 may land on the meadow.** `gait-spot.ts:45`;
   no VIEWPORTS screen reaches it; the 4 px grid scan is ~130k spots at
   1920×1080, up to 3× per layout. Ask: fallback keeps
   `spot.y + reach <= groundTop`, or a test pins which sizes reach tier 3.
