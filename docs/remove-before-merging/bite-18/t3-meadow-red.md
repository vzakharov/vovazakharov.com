# t3-meadow-red — hand-over

**Done.** The `meadow` play's "the butterfly sent away is still in the
meadow" on tabL was the harness's. In the meadow the play gets since S5a
(bd99a9c), butterfly-1 is sent away from flower-8 and flies out to the left
edge in 21.4 s (departs 24.7 s, arrives 46.1 s game time). The look loop
stops at its `MOST_LOOKS` cap (80 looks, 20 s) at 45.6 s, half a second
before that flight lands, so the check found it still flying, drawn at
x = -42, past the screen's left edge. The game is right: a flight away is
gone once it lands (`ticked` in `model/insects.ts`), and a long flight from
a far perch on a wide screen is fine.

`playInsects` (`scripts/lib/play-insects.ts`) now steps until the butterfly's
flight away has landed before the check, whatever meadow the seed gives. The
probe's seed is left as it is: the harness no longer depends on which meadow
it gets.

**Play.** `--plays meadow`: tabL green, phoneP green.

**Left.** Nothing for this red. The tabL run before the fix also passed every
other line, the turn rate included (fastest 32.5–36.0 rad/s, under 36.36).
