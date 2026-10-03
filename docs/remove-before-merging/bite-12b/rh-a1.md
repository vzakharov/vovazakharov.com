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

- **T147, `tufts.test.ts`.** `faultsOf` no longer checks the standing tufts
  against `plantableIn`, which is how they were chosen. "A tuft's flower
  would meet a head" now plants a flower on each standing tuft and measures
  its drawn head against every standing flower's. "A tuft fit to plant on
  is missing" now asks whether a tuft that does not stand passes `roomIn`,
  `bareToTap` and `headClear`, the rules `plantableIn` is documented to
  combine. Mutated, each fires: tufts standing without the head rule meet a
  head, every other standing tuft dropped is missing. The file runs in ~4 min
  where it ran in ~6, since the rule is no longer rebuilt per stand.

## Left

Nothing.
