# The cube's world

Four rules hold for everything drawn, heard or simulated here, and no checker
catches a breach of any of them:

- **No textures.** Every surface is a procedure evaluated in the shader from
  place and clock; nothing drawn is looked up from a stored image, baked or
  computed — no map, no lookup table, no noise texture. The only textures are
  the frame's own screen-space targets and the boards — what a sign carries,
  drawn in code on a canvas.

- **The same thing looks and sounds identical to two players at one point at one
  moment, on any machine.** A frame is a pure function of where the eye is and
  the shared clock: nothing remembers earlier frames, and nothing depends on
  when the page opened.
- **Every random number is rolled** — `roll` / `rollWith` from
  `@/dice/shared/roll`, under a named path. A shader keeps only per-pixel noise,
  through `@/cube/shared/lib/wgsl-hash` salted by a rolled value.
- **Interactions come at a price.** Nothing one player does changes the state of
  the world — a footprint, a moved object, a ball kicked across a floor — except
  by purchase. What a player's body does is theirs alone (their pose, their
  hands, what they swallowed); the world is as it was for whoever comes next.
