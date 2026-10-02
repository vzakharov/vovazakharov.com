# rv-veer2 — the play after the leg-frame fix (34788c22)

Built once at 84291be0 (tabL `veer`), then `--no-build` for the rest.

## Verdict

§ 8 holds: bee-8's 15 overs are gone on tabL. The four new bee overs (and
fly-3's accepted § 7 2%) were the harness's, not the game's: the watch
counted a held turn's slide across the screen as the insect's own step.
Fixed in `veer-watch.ts` `steps`; after it tabL `veer` has no fly or bee
over.

## tabL `veer`

- Before the harness fix (84291be0, deterministic over two runs): fly 1
  over, fly-3 cap→cap 43.9 px vs 38.1 (42.9 with its 1.41 rad pivot), the
  known § 7 2%. Bee 4 over: bee-11 flower→flower 34.3 px vs 33.1 (lifted
  2.78), bee-16 32.1 / 32.1 / 31.7 vs 31.4 (lifted 2.25). All on the
  `←` held turn back to the clump (headings 4.41, 5.26) and fly-3 on the
  `→` turn (0.45).
- Traced from a dump of `seen` (not committed): the eye turns 0.0124 rad a
  frame and everything drawn slides `arc` (750 px/rad on tabL, measured off
  sitters at every x) × that = 9.3 px a frame. A sitting bee-11 steps 13.3
  px at its own size before it takes off. The bees and fly-3 fly with the
  slide; taken out, bee-16 is 24.5 (under the bare 25.8), bee-11 ≈ 25.5,
  fly-3 40.0 (under its 42.9).
- After the fix: **fly 0 over** (worst at own size 48.3, fly-30 cap→away
  lifted 2.91, inside its pivot bound); **bee 0 over** (worst 28.8,
  bee-11). Frame median 28.8 / 30.1 ms (noise).

## phoneP `veer`

- Fly 1 over: fly-26 cap→away 42.4 px vs 41.75 (lifted 1.10), 1.6% —
  § 7's accepted fly-26 residue (gone at rv-play, back after 34788c22's
  `levelWith`, under § 7's 3%). Bee 0 over (worst 29.0, bee-8 air→flower).
  Same numbers before and after the harness fix (heading 0, no turn).
  Frame median 26.6 / 25.0 ms.

## tabL `meadow,walk`

- Known reds only: no butterfly rested on a cap (v15); butterfly-1 0.39
  rad off its way at 24 733 ms (v17); least spans butterfly 38.2 < 52, fly
  27.3 < 30. Bee least span 31 now passes. Walks bob 3.28 px; frame median
  16.1 ms.

## Done

- Harness fix: `steps(seen, arc)` takes the held turn's slide out;
  `pace`/`flicks` take the lens; `veer-report.test.ts` covers a fly carried
  past its curve by the slide (fails without the fix) and one past it
  after.
- Frames: `frames/bite-12/review/legframe-tabL-veer-turning.png` (bee on
  the purple flower mid-turn), `legframe-tabL-veer-back-bee-1-in.png`
  (looking back, fliers landed in the clump at the left edge),
  `legframe-phoneP-veer-back-fly-in.png` (fly on the cap, butterflies in
  and over the flowers). phoneP's `veer-turning` shows no insect and was
  not kept.

## Departures

- The fix touches `scripts/lib/veer-watch.ts`, `veer-report.ts`,
  `play-veer.ts` and `veer-report.test.ts`, outside the files this
  package owns (a harness red, easy to make programmatic, so fixed rather
  than sent to `to-check.md`). The pan is taken out across only; `bendAt`'s
  sub-pixel change in y is left in the step.

## Left

- Nothing for this package. `to-check.md` unchanged (no harness red left).
