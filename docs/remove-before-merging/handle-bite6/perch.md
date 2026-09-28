# Perch group — paused (third pause)

This note covers T50, T52, T53 (the air half), T59 (the test half), the
catchability call, and the two nits. The rules are in
`tmp/handle-bite6/common.md`.

## Done

- **52295ea**: the old patch, with its tests fixed. It adds:
  - crowding by kind (`Crowding` carries its pairings);
  - `keptForBees`;
  - the flies' pull of 8 and fussiness of 0.85, and the butterflies' 0.25;
  - the denser air grid, reaching lower (`AIR_BELOW`);
  - air legs that hover;
  - `stride` and `Sight.places`;
  - the two nits.

  One change from the old patch: the perch crowding now measures each
  seat's **track**. A track runs through the spots an insect may take:
  straight across a flower, and over five points on a cap's dome. The old
  patch allowed slack sideways only, which let butterflies cover each other
  under a turned cap.
- **8321601**: T52 on small phone.
  - A seated butterfly or fly gives way while a bee waits in the air
    (`givesWay`).
  - A hovering bee flies on as soon as a flower is open to it
    (`flowerFreed`).
  - The rules for which perch an insect may take moved to
    `model/perch-room.ts`, which keeps `flight.ts` at 389 lines.
  - knip and type-overlap pass for these files. The remaining type-overlap
    findings are the heading group's.

The whole mushrooms suite passes at 8321601: 378 tests.

## Half-done: the new tests are in `perch.patch`

Apply the patch with `git apply docs/remove-before-merging/handle-bite6/perch.patch`.
It holds:

- **`ui/scene/visit-play.ts`**, used only by tests. It holds:
  - `opened`, moved out of `perch-sight.test.ts`;
  - `overlap`, also moved out of it;
  - `ALL_TEN`;
  - `play`, which runs the real `reduce` and re-reads `perchSight` whenever
    a bee plants.
- **`ui/scene/fliers.test.ts`**, which runs on every `VIEWPORTS` screen:
  - The air offers at least the sum of `INSECT_LIMITS` spots (T50). Passes.
  - All ten fliers, over 5 minutes, with the opening clump and with a full
    forest (T50, T53, T59):
    - no leg goes `away`;
    - no two seated fliers share a perch or overlap by more than
      `MOST_OVERLAP`, using each kind's own seat;
    - the share of ticks where two fliers holding air spots overlap stays
      under `AIR_CROWDED`.
    - Measured overlap share: 0 on every screen except small phone, which is
      0.68 with the opening clump and 0.06 with the forest.
    - **Left:** set `AIR_CROWDED` (at 1 now, as a placeholder) and remove
      the `console.log('AIR' …)` line.
  - Bees among butterflies roam under 0.25 of the time, and under 0.45 on
    small phone (T52). Passes.
  - Flies in a forest land on spotted caps at least 60% of the time.
    - This fails on tablet portrait: 0.58 over 3 visits.
    - Moving the test to `VISITS.slice(0, 8)` did not apply, because the
      replacement did not match. Widen the visits, or lower the bar to 0.55.
  - Catchability: at least 70% per kind, using the real `flightPoint`, taps
    trailing by 200 ms, and hits within `tapReach(span / 2)`. Passes.
- **Left:**
  - Check that each new test fails on base 643bdb6 (in a throwaway
    `git worktree add` under `tmp/`). None has been checked yet.
  - Then run lint, type-check and the suite, commit (`test:`, T50/T52/T53/T59),
    and push.

## Unmet

**Small-phone bees roam 42.3%, against a target under 40%.** That is 10
visits, 5 minutes each, with 4 butterflies and 3 bees.

- Three bees alone roam 28.7%. About two flowers stand in sight for three
  bees, a limit set by `flower-sight.ts`, which is outside this group's files.
- Allowing `keptForBees` one more flower changed nothing.

**Small phone, all ten: two fliers often hold air spots their wings overlap
on** (68% of ticks with the opening clump). There is too little air there for
ten fliers to stay apart, so the fallback in `roamFrom` (take a spot that is
crowded but not taken) is what keeps anyone from leaving.

## Measurements at 8321601 (10 visits, 5 minutes)

| screen  | lost | aloft bodies overlapping | catch b/f/e | bee roam | fly on spotted |
| ------- | ---- | ------------------------ | ----------- | -------- | -------------- |
| tabL    | 0    | 11.1%                    | 99/85/88%   | 0.7%     | 79%            |
| tabP    | 0    | 10.8%                    | 99/85/90%   | 2.5%     | 72%            |
| phoneP  | 0    | 12.0%                    | 99/100/100% | 8.7%     | 74%            |
| phoneL  | 0    | 13.2%                    | 98/100/100% | 0.5%     | 76%            |
| phoneS  | 0    | 18.4%                    | 100/100/100% | 42.3%   | 78%            |
| desktop | 0    | 10.6%                    | 97/83/88%   | 0.5%     | 78%            |

**For a person looking at the screen:**

- A butterfly that gives way leaves a flower moments after landing on it.
  Check that this reads as making way rather than as a twitch.
- A flier holding an air spot is drawn still there.

The harness is under `tmp/handle-bite6/perch/`. Run each script with
`pnpm exec tsx`. `bees.ts` takes `ONLY=<screen>`, and `time-sight.ts` times
`perchSight`.
