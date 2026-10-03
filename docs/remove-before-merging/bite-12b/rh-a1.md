# rh-a1 — T140, T147 (tap)

## Done

- **T140, one eye for a tuft.** `Scened` carries `tendedAt` (the scene wires
  it to `Grass.tendedAt()`, one line in `meadow-scene.ts`), and the planter's
  every rule judges there: `plantable`, `plantSounding`, `tapTuft`, and
  `sowSounding` too, since it picks among the shown tufts. `Planter.eye()`
  is gone. `tapTuft` takes `Pick<Grass, 'refuse'>`, the voice
  `Pick<MeadowSound, 'pop' | 'nuhUh'>`, so a test drives the real planter.
- **T147's tap.** `planter.test.ts`: six visits on 1180×820 with ten flowers
  planted, tended at the opening eye, five walks short of a re-tend
  (`!strayed` asserted); for every tuft `Grass.holds` would hold, a tap opens
  the picker on it, `plantable` is true, a key plants there, and nothing
  shakes or says "nuh-uh". It also asserts that some held tuft refuses at
  the walked eye, so the test can fail; judged at the walked eye, it does.

## Left

- `tufts.test.ts`'s self-comparing `faultsOf` checks (step two).
