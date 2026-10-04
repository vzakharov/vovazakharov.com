# ft — fireflies give taps back (review-play item 1)

Done:

- `firefly-tap.ts` (+ test): `tappedFirefly` — a tap within a firefly's
  `TAP_RADIUS` reach goes to the nearest firefly (`tappedInsect`), and only
  where nothing else under the finger answers.
- `firefly-view.ts`: each firefly's hit callback asks `tappedFirefly`;
  "anything else" is `othersAnswer` (every other shown, enabled interactive
  object's own hit test, as Phaser runs it) or a bare tuft (`tuftUnder`).
  `drawn` is cleared when a firefly loses its seat, so it never glides in
  from a stale point.

Measured (dusk play, tabL + phoneP, 8 frames by day and 8 at full dusk, a
measuring step run uncommitted): fireflies take 0 % of every mushroom's
day-reachable points and 0 door points. What still costs doors and stems at
dusk is a running mouse (night runs), not fireflies.

Decided: no glowing "core" that wins over a cap — a 12 px core cost
mushroom-2 9–14 points of its reach. The moon, clouds and spores (meadow taps
with no game object) are not yielded to: fireflies circle hosts on the
ground, not the sky.
