# The fold engine

Paper is simulated, not posed: a model's look is where its creases' springs,
contact and friction settle. What the code alone does not tell:

- **A fold driven only by its crease's torque pushes back on the crease's own
  root**, so a crease near another layer's edge shoves that layer through its
  neighbour. `sequence.ts` turns every flap with the hand (`hand.ts`, outside
  springs toward a rigid turn about the fitted crease), which takes no reaction
  at the root; without it, tucks and multi-layer steps jam.
- **The model floats free.** A flap swinging under crease torque alone turns the
  whole base by its reaction; a weak crease nearby flips open into a strut that
  normal-only contact cannot turn. The hand is the fix, not pinning.
- **`flatFold` sends a mountain's flap to the bottom of the whole stack** and a
  valley's to the top; only a tuck (`direction: 'tuck'`, `into`) lands between
  layers. A valley or mountain whose flap would pass layers covering its crease
  is impossible paper, and `relaxSequence` jams on it — fold it as a tuck. Only
  `tuck()` checks for those layers today.
- **A coarser mesh breaks a tuck**: at every edge ≥ 0.05 the flap passes its
  lid, so the ring tests run at the default 1/25 (~30 s, split across two files
  to run in parallel).
- **`relax()` is one phase of `simulator.ts`, and its output is pinned
  byte-for-byte**: `Math.sqrt` of a sum of squares stays (not `Math.hypot`,
  which rounds differently).
- **Crossings ignore edges within 4 gaps of a triangle on the same crease line**
  — nested creases a one-edge wedge cannot resolve. The tucked ring's one
  crossing and ~5% worst strain sit at such a nested corner.
- **A step that holds a tuck's lid runs to its iteration cap** and reports
  `settled: false`; a phase hitting its cap is reported, never thrown.
