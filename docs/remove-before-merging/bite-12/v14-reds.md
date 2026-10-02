# v14-reds — the tablet reds of play-final2, fixed from the report

Plan item 1c. No play runs (operator's rule); each fix is proven by a unit
test that fails before it.

## Step 1 — the flip, the off facing, the crooked rest

**Cause.** `InsectView` sets a container's rotation (and place) only on a
frame the insect is drawn; one hidden off the screen or behind the brow
keeps the turn it was last shown at while `steer` turns its body on unseen.
Two things read that stale rotation:

- **The game**: a new leg took `turnedFrom` (how the body sat as it set
  off) from `container.rotation`. A flier hidden through a turn set off
  planning its take-off pivot from a turn it no longer held, so its body,
  chasing that plan at its `TURN_RATE`, swung toward the stale facing and
  back: off its way of flight early in the leg. Fixed: `legSetOff`
  (`ui/scene/insect-shown.ts`) takes it from `steering.turn`, as
  `insect-steering.test.ts`'s own `flyLegs` always has. Test:
  `insect-shown.test.ts`.
- **The flier watch** (`scripts/lib/flier-watch.ts`): it judged every
  insect, drawn or not. On the first frame one shows again, its rotation
  jumps from the stale turn to the steered one: butterfly-3's 180.91 rad/s
  is 3.02 rad over one 60 Hz frame, exactly that. A seated insect whose
  perch is off the screen or sunk behind the brow keeps the turn it flew in
  at: bee-11's 1.69 rad. The steered turn itself is rate-bound by
  construction (`steer` clamps it to `TURN_RATE`), and a settled flier's
  wanted turn is `restTurn`, within `REST_LEAN`; neither can be drawn as
  reported. Fixed: the watch judges only drawn insects (counts of visits
  and cap rests still count all), and a trail restarts when one shows again.

The dart (`v14-catch`) moves the point without turning, by design; the
`SKIM` easing (`v14-aloft`) changes height and distance only, never the
turn. Neither adds a flip.

**Not settled without a play:** what remains of the 81 of 4184 butterfly
flight frames over 0.3 rad off once hidden frames are out. The facing is
computed in the leg's frame; the drawn path is that frame bent by the
screen's edge, veered round the eye and sunk under the brow, so near those a
heading in the frame can sit off the path on the screen.

## 3 — no butterfly on a cap: no code fault found, nothing changed

Measured off `visit-play`'s `play` (the real reducer and `perchSight`),
four visits, all ten fliers, two minutes: butterflies land on caps on every
screen — tablet 18 of 108 legs in the opening clump, 43 of 105 in a forest;
every other screen alike (16–40%). Nothing rejects every cap. In the clump
there are only two caps a visit, and on 54 of 92 butterfly legs every cap
was already held — by the flies, which want caps (`spottedPull`, `fussy`,
`settles`). Over the meadow play's ~70 s four butterflies finding the
clump's caps held is the habit working, not a reject; play-final2's own
`tabL-perched-turned` shows a butterfly on `mushroom-1`'s cap. Raising the
share in a small clump would mean flies giving way, or a higher
`flowerShare` complement: a design call, for the orchestrator.

## 4 — the sky hairline: located, not fixed

In `final/tabL-back-row-tap.png` the line is device row 588 (CSS 294): the
sky there is mixed ~25% toward the far hills' colour (212,236,250 →
196,226,228; hill 147,198,160), and the hills' own fill steps by one unit at
the same row. So it is a row of the far-hill layer leaking over the sky,
not a seam in the sky's own bands (`paint-sky.ts`'s `fillRect` grid would
mix sky with sky). Next: `paint-land.ts` lines ~110–125 (the ranges'
`fillStyle(mix(...))` rows and `layers.near.fillStyle(RANGES.near.foot)`),
looking for a band or base rect whose top edge reaches above the ridge.

## Done

- Step 1 (02c0804).

## Left

- 4: fix the hairline at its cause (above).
- 5: `pnpm type-overlap` on `at: number` (`Steering`, `KeySown`).
- 6: done in passing — `insect-view.ts` is 442 lines.
