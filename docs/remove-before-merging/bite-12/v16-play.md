# v16-play — tabL veer, walk, planting, hold after v15-eyeframe and v15-watch

Under the play-run rule. One game fix committed (an arrival's timing); the
run that followed it exposed v15's cap→away red again. Frames in
`frames/bite-12/v16/`.

## Runs

1. `--screens tabL --plays veer,walk` (with the build) at 671b9fa0: frame
   median 26.9 ms over 524 (over the 26 ms budget; v15 had 22.9 — other
   agents' builds were running in the container). `planting,hold`
   (`--no-build`): 13.3 ms over 144.
   - Fly cap→away overs: none of the 22 fly overs was a cap→away leg
     (listed in full with an uncommitted widening of the report).
   - Flier watch's worst heading: 0.15 rad in planting (bees only; the
     watch with flies runs in `meadow`, not in this run's plays), so the
     shying-fly case was not exercised.
   - Reds: 22 fly overs, all **away→air / away→cap arrivals** (fly-16/18/19
     at heading 1.83, fly-3 at heading 0), most 65.2 px own size vs 38.1;
     14 bee overs (bee-20 arrivals, bee-8 flower→flower, most 31.0 vs 25.8);
     a bee drawn 29.1 px across, under 30 (`LEAST_SPANS`, harness, as v15).
2. After the fix, `--screens tabL --plays veer,walk` (with the build): frame
   median 31.2 ms over 585. Arrival overs gone; **81 fly overs, all cap→away**
   (fly-10 leg 12, fly-18 and fly-22 leg 3, fly-21), heading 0, most
   163.9 px own size: every one timed 1329 ms and drawn across the whole
   screen (fly-10 from x 68 to 978 within 0.55 of its leg). The same class
   as v15's fly-22: the scene's timeline shifted with the fix, and other
   legs off veer-grown caps hit it.
3. `--no-build --screens phoneP --plays veer`: not run (context).

## The fix — an arrival timed from where it is drawn setting off

A release into a perch in view was timed from the screen's edge nearer it
(`shownOf`'s `edgesOf`), but drawn from over the brow halfway from the
screen's middle to its seat (`entryAloft`, since d290cd0d). Probe at seed 3,
drawn ÷ timed: ×0.13 to ×12.8 before, ×0.98–1.02 after (tabL and phoneP at
heading 0, tabL at 1.83).

- `model/flight-in.ts`: `entryOf(places, wayOut, side, to)` — the away spot
  at `brow` with x halfway to `to`; `firstFlight` times an in-view release
  with it. `edgesOf` stays: it still weighs the first perch's choice
  (`nextPerch`'s `near`).
- Tests: `flight-in.test.ts` (entryOf, cruise timed from the entry);
  `ui/scene/insect-away.test.ts` cross-checks the drawn chord off
  `entryAloft` against `entryOf`'s timing for every cap in view, opening
  and walked/turned eyes, tablet and phone (0.9–1.1). Passing too:
  `flight.test`, `roaming`, `insect-motion`, `flight-kinds`, `insects`,
  `perches`, `perch-sight` (68). `fliers.test.ts` not run (context).

## Left

- Trace the cap→away red: dump `sightFrom(view).places` for the cap at
  fly-10's set-off (veer play ~121.35 s, heading 0) against where the cap is
  drawn. The suspect is the cap's `Aloft` from `aloftOfLayout` over the
  layout point for a cap the veer play grew at heading 1.83 (laid in a
  turned view) vs where its bed stands it.
- Run `fliers.test.ts`; phoneP veer.
- A release out of view's rest from the out point to the air is timed
  ×0.50–2.59 (`veer-away.ts`), out of view at the opening eye.
