# The cube's world

Four rules hold for everything drawn, heard or simulated here, and no checker
catches a breach of any of them:

- **Nothing authored.** Every surface is a procedure of place and clock: no
  image is drawn by hand, shipped or stored. A map the GPU computes at run time
  from formulas — a wave field, a sky, the frame's own screen-space targets — is
  that procedure's working, and allowed. The one thing drawn elsewhere is the
  lettering of signs and posters, which a canvas draws because WebGPU draws no
  text.

- **The same thing looks and sounds identical to two players at one point at one
  moment, on any machine.** The world's state is a pure function of place and
  the shared clock — a wave arrives for everyone at once — and nothing depends
  on when the page opened. How one player's eye presents it may carry that
  player's own earlier frames, as the drowsy eye's history does.
- **Every random number is rolled** — `roll` / `rollWith` from
  `@/dice/shared/roll`, under a named path. A shader keeps only per-pixel noise,
  through `@/cube/shared/shader/hash.wgsl` salted by a rolled value.
- **Interactions come at a price.** Nothing one player does changes the state of
  the world — a footprint, a moved object, a ball kicked across a floor — except
  by purchase. What a player's body does is theirs alone (their pose, their
  hands, what they swallowed); the world is as it was for whoever comes next.
