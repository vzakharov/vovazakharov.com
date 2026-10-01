# redfix — hand-over

Three things red on HEAD: the tablet forest tap floor in `mushroom-patch.test.ts`,
two ESLint errors in `mushroom-room.test.ts`, Prettier drift in
`backdrop-tones.test.ts` and `pan.test.ts`.

## Done

- ESLint in `mushroom-room.test.ts`: `counted()` owns its `fitting` flag and
  returns it; the roomless finder is typed `(): undefined` with no return.
- Prettier over `backdrop-tones.test.ts` and `pan.test.ts`.

## The tablet forest tap floor: the true tail, not a regression — stopped

- **Turned red by a675f2e** (the 14-flower bed), which landed a minute before
  d5d0715 wrote the test: d5d0715's test is green on a675f2e^ (worst 83.0%)
  and red on d5d0715 itself. None of the candidates since (6cb1c9d, 966c356,
  a401096, 362f232, 00fbc9a7, 7166ad7d) moves it.
- **What takes the taps:** of mushroom-10's 323 head taps on visit 4988973,
  mushroom-6 takes 72, every one where mushroom-6's own cap is drawn in front
  (none by its pad, no flower). That is the by-design case the test's own doc
  names. The bigger bed only changes where growth finds room, so a different
  pair overlaps.
- **Measured over all 2000 visits on the tablet** (20 000 grown mushrooms):
  - a675f2e^ (before the bigger bed): 8 below 80%, worst 75.5%, p0.1 86.7%,
    p1 100%.
  - HEAD: 6 below 80%, worst 76.5% (7245888/mushroom-11), 4988973/mushroom-10
    77.7%, p0.1 86.6%, p1 99.4%.
  - The test samples every tenth visit (200), and the 83% the floor was set
    from was the worst of that sample. The whole run has been below 80% on a
    handful of mushrooms all along.
- **Not changed:** the floor stays at 80% and the test stays red on the tablet,
  as the brief says. It is the orchestrator's call: a floor under the
  measured tail (for example 75%), or a rule that stops growth from covering
  more than 20% of a grown head. Scripts: `tmp/redfix/probe.ts`,
  `tmp/redfix/dist.ts`.
