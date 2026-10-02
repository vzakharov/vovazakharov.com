# Package tail-face — hand-over note

The red: tabL `meadow`, "butterfly-1 (butterfly) faced 0.39 rad off the way
it flew at 24733 ms" (flight watch, `MOST_HEADING_OFF` 0.3).

## Measured (c274649 + ca05b62, a per-frame trace of butterfly-1's leg 2)

- The eye never turned or walked over the leg (heading 0, eye at the origin,
  centre 0); the butterfly was on screen the whole stretch measured, leaving
  past the left side at ~31.6 s. No teleport, no off-screen frames.
- Over one flutter bob (28 frames), at the worst stretch (24.6–25.8 s):
  - drawn body vs drawn motion: 0.32–0.36 rad off (the red);
  - the same body vs the motion in the leg's frame (`shown.at`): 0.17–0.23;
  - of that, 0.16 is the bank into its curve (`BANK_TURN`, by design), the
    rest a small facing lag;
  - the drawn motion's direction vs the frame's: 0.14–0.15 apart.
- So the body's turn is right in the leg's frame, and drawn unmapped: the
  frame is a tangent pinhole (`framedOf`), the screen lays azimuth straight
  across and bends rows down (`viewOf`, `bendAt`), and toward the screen's
  side the two disagree on directions by ~0.15 rad. A game red: what a
  child sees is the body pointing that much further off its way.

## Done

- (nothing committed yet beyond this note)

## Left

- Draw the body's turn as the screen's image of its frame turn, faded out
  as it sits (its own rest facing is the screen's), with a unit test; re-run
  tabL `meadow`.
