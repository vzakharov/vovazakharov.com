# rv-play — the review round's play, tabL and phoneP

Built once at 23b18cae, every play on each screen (the build run took the
plays but `veer`, which ran `--no-build` after it, as one run would pass the
10-minute call limit). Frames in `frames/bite-12/review/`.

## tabL

- opening, meadow, walk, approach, planting, species, tufts, hold, keys:
  pass but the known reds — no butterfly rested on a cap to be tapped
  through (v15); butterfly-1 0.39 rad off its way at 24 733 ms (v17,
  `to-check.md`); least spans butterfly 38.2 < 52, fly 27.3 < 30 (v15), bee
  29.1 < 30 (v16, `to-check.md`). Bob 3.28 px on every walk; frame medians
  24.8 / 19.8 ms.
- veer: fly-3 cap→cap 43.9 vs 42.9 (accepted, `leg-timing.md` § 7).
  **New, not traced to the end: 15 bee steps over**, all bee-8's leg 15
  (flower→flower, lifted 2.28, 5.66 s), 38.4 px at its own size against
  31.5 allowed, on the 14 frames straight after the play's `face(0)` snap
  (heading 1.83 → 0 in one frame, before "a walk into a hover"). The bee
  then crosses the screen's foot (y 796–829 of 820) at d 7.8. Read so far:
  the veer (`veered`) only acts inside `V_NEAR + width`, so the snap
  should not bend a path at d 7.8; the drawn chord against the leg's timed
  length was not measured. The meadow's history differs from v21's
  (`arrivals.ts` now draws a release's seed before its dispatch), so this
  leg is new to the run, not necessarily new to the game. Frame median
  24.8 / 23.4 ms. Deterministic over two `--no-build` runs.

## phoneP

- opening … keys: known reds only (no butterfly on a cap, least spans
  butterfly 40.1, fly 24.4, bee 29.1). **One harness red, fixed** (ef174a5b):
  the sideways drag turned 0 and stepped the eye 0.072 — `BARE_START`
  scanned from 0.6 of the height (506 px), above phoneP's ground top
  (588), where a sideways drag strafes by the game's own `lockOf`. The scan
  now starts at the ground's top; the drag down after it then walks 4.09
  units, past one settle, so its chase is traced twice as long. Both
  screens' walk pass after it (phoneP turns 0.159 of 0.200, as at
  lens-land).
- veer: **green** — no fly or bee over; fly-26's 3 % (§ 7) gone.

## What the fixes show

- `*-walk-forward` (mid-step, ↑ held): ground, grain and brow bob as one;
  no sky between the near hills and the brow. `*-walk-rim`: at rest.
- `*-veer-walk-in-5`, `*-veer-turning`: fliers across the turn at depth.
- `*-keys-walked-tap`: after walk-and-turn, the note key's flower in view.

## Left

- bee-8's 15 overs: game or the snap's — measure the leg's drawn chord on
  the plane against its timed length (dump of `seen` from `play-veer.ts`).
- Departure: the harness fix touched `play-taps.ts` and `play-walk.ts`,
  outside the files this package owns; one-line each, reported.
