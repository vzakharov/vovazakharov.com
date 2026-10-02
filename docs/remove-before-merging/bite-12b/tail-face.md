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

- Static check of the mapping at the run's frame point (608, 449.5),
  forward 13: drawn at (131.8, 471.1) — the trace drew (131.8, 472.8) — and
  a frame turn of −1.07 drawn −1.19: 0.12 rad of bend, most of it the skim
  easing the flight down onto the grass (`aloftFramed`), the rest the
  screen's azimuth-straight lay.

## Done

- `fix(mushrooms): draw an insect's body turned as the screen draws its
  frame turn` — `drawnInsect` gives `posed.rotation`: the way a px's step
  along the frame turn is drawn, through the same pipeline that draws the
  body (`bentTurn`), faded by `aloft` (0 sitting, so a seat's rest facing
  stays the screen's own; it fades in over the take-off and out over the
  settle). `InsectView` sets and poses by it. Tests in
  `insect-drawn.test.ts`: the middle of the screen keeps the frame's turn;
  the run's point is drawn the way a step is drawn, >0.1 rad off the frame's
  turn; sitting keeps the turn.
- tabL `meadow` after: green. Watch: worst heading 0.28 (was 0.39);
  butterfly frames facing over 0.3 off: 0 of 6260 (was 74); butterfly-1's
  own worst 0.285 at 25.4 s — the rest is the bank into its curve (0.16, by
  design) and a small facing lag. Turn rate, light (0.393, the same) and
  worst rest (0.45, the same) unchanged.
- `fliers.test.ts` not run: the fix touches neither flight nor perches,
  only the drawn rotation, which that suite does not read.

## Left

- Nothing of this red. The heading margin left is thin (0.285 against 0.3):
  a curvier leaving leg could cross it again by bank alone.
