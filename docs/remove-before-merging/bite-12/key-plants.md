# Key plants (item 4b) — hand-over

**Done**: while the flower picker is open, on a tuft or a flower and at either
stage, a note or drum key plants (or replaces) the flower that makes its
sound, and the picker shuts as after a pick. Octave keys only shift the
octave. With the picker shut, keys play through the flowers in view as before.

- `keyPlanting` (`ui/scene/keyed-flowers.ts`) is the rule, pure: picker shut
  → `undefined` (play through flowers in view); open → the picker's own
  actions, `colour` (seeds drawn by the planter's `shapeSeeds`) then `plant`
  with the key's shape. When the colour row already chose the key's colour,
  only `plant` goes, so the flower planted is the one the shape row shows.
- `classOf` (`model/flower-sounds.ts`) reads `soundOf` backwards, returning
  the `FLOWER_SHAPES` element itself (`shapeSeed` finds it by identity).
- `playKey` asks `KeyedPlay.plant` first; `Planter.plantSounding` runs
  `keyPlanting` and dispatches; `playTheMeadow` takes it as a new argument
  from `meadow-scene.ts`.
- Sound: the key does not sound through `instrument.key`; the planted flower
  sounds from `FlowerBed.reconcile`, as any planting does (so at the
  flower's own pitch, not the keyboard's octave).
- A key where the picker cannot plant (`plantable` false: a tuft that no
  longer takes a flower) gets the pick's `nuhUh` and the picker stays — the
  key does not then fall through to the flowers in view.
- No colour-pick `pop`: the key dispatches the reducer action directly, as a
  shape pick does, not through `Planter.colour`.

Tests: `keyed-flowers.test.ts` (routing, `playKey` with the picker open, and
the reduced meadow for a tuft and for a flower), `flower-sounds.test.ts`
(`classOf` round trip).

**Left**: a play check in the browser.
