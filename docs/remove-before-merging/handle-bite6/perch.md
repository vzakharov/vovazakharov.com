# Perch group — paused (second pause)

This note covers T50, T52, T53 (the air half), T59 (the test half), the
catchability call, and the two nits. The rules are in
`tmp/handle-bite6/common.md`.

## Done

- 643bdb6 is only the first pause note. **No source is committed.**

## Half-done: all of it is in `perch.patch`, beside this note

The source work is written but not committed. The test files do not
type-check against it yet, so the commit rule forbids committing it. It may
also still be in the working tree. If it is not, run
`git apply docs/remove-before-merging/handle-bite6/perch.patch` from the
repo root. The patch holds only this group's files:

- `src/pages/mushrooms/model/flight.ts`, `insects.ts` and
  `ui/scene/perch-sight.ts`.
- The new `model/flight-habits.ts`.
- The measuring scripts under `tmp/handle-bite6/perch/`.

What the patch does:

1. **Kind-aware crowding (T52).** `Crowding = [Perch, Perch, Pairing[]]`,
   where `Pairing = [kindOnFirst, kindOnSecond]`.
   - `perchSight` computes each pairing from each kind's own seat, through
     `seatAt(…, kind)`, which calls `flowerLift` with `{ r, disc }`.
   - It uses `WIDEST_SPANS` (butterfly 1.22, fly 1.36, bee 1.2) × `insectSizes`.
   - For perches, a pair crowds when
     `(a + b) / 2 - MOST_OVERLAP * min(a, b)` exceeds the distance, with the
     slack taken sideways only. Air spots crowd at `(a + b) / 2`.
   - `taken` is `Held[] = { kind, perch }`. `blockedFor` builds a set once per
     choice.
   - `[a, b]` destructuring in `flier-watch.ts` still works.
2. **Butterflies make way for bees (`keptForBees`).** While a bee waits in
   the air, or while the flowers open to a bee are no more than the bees,
   other kinds take neither those flowers nor any perch crowding them.
3. **Flies (T52).** Fly `spottedPull` is 8, `flowerShare` 0.1, and
   `fussy` 0.85: with no spotted cap open, a fly roams the air 85% of the
   time. The butterfly's `spottedPull` is 0.25.
4. **The air (T50, T53).**
   - The grid step is the narrowest kind's span. The edge margin is half a
     butterfly span. The grid reaches `AIR_BELOW` = 0.15 of the ground's
     depth below `groundTop`.
   - That gives at least 12 spots on small phone and 30 or more elsewhere.
   - Air legs now pause at the spot: each kind has a `hovering` range.
   - Roaming favours nearer spots, weighted by `stride`.
   - As a last resort a flier hovers where it is, never `away`.
5. **Catchability.** `Sight.places` (optional) holds each perch's position in
   butterfly sizes, keyed by `perchName`. A flight longer than the kind's
   `stride` (butterfly 3, fly 0.9, bee 1.4) takes proportionally longer.
6. **Nits.**
   - `seededFlowers` is now `flowers.length`.
   - A flier settles back on its perch only if that perch is uncrowded.
   - `flightAway` takes `{ places }`.

## Left

- Fix the test files so they type-check.
  - `flight.test.ts`, `flight-kinds.test.ts` and `roaming.test.ts` pass
    `Perch[]` as `taken`; wrap each entry as `{ kind, perch }`. Their crowded
    pairs need a third element listing the pairings.
  - `roaming.test.ts` asserts `from.leaves === from.arrives` for air legs;
    make it `>=`, since air legs now hover.
  - `flight-kinds.test.ts`: fix the spotted-share tests for pull 8 and 0.25.
    Change lines 72–75 so a bee can be left with no open flower: assert it
    never goes to a cap, and goes to a flower whenever one is open.
  - Then run `pnpm exec tsc --noEmit` and every mushrooms test.
- New tests, on the real `perchSight` and every `VIEWPORTS` screen:
  - T50: air spots ≥ the sum of `INSECT_LIMITS`, and all ten released for
    5 minutes gives no `away` leg.
  - T52: bee roaming share, and the fly's spotted share in a forest.
  - T53: small-phone overlap sweep.
  - T59: `swarm.test.ts` fed from `perchSight`, and "the air" asserting that
    no two held spots overlap by their kinds' spans.
  - Catchability: ≥ 70% per kind.
  - Check each one fails on base 643bdb6.
- Commit, split by thread, then report.

## Measurements with the patch (10 visits, 5 minutes)

Baseline figures are from the first pause note.

| screen  | lost visits | aloft bodies overlapping | catch b/f/e | bee roam (4 butterflies + 3 bees) | fly on spotted, all ten |
| ------- | ----------- | ------------------------ | ----------- | --------------------------------- | ----------------------- |
| tabL    | 0           | 10.2%                    | 98/85/88%   | 1.9%                              | 76%                     |
| tabP    | 0           | 9.8%                     | 98/85/88%   | 23%                               | 75%                     |
| phoneP  | 0           | 10.1%                    | 99/100/99%  | 11%                               | 73%                     |
| phoneL  | 0           | 13.2%                    | 98/100/100% | 0.9%                              | 74%                     |
| phoneS  | 0 (was 5)   | 17% (was 90.6%)          | 100/100/99% | **55.7% — unmet**                 | 78%                     |
| desktop | 0           | 10.5%                    | 97/83/88%   | 1.1%                              | 76%                     |

**Unmet: bees on small phone roam 50–56%, against a target under 40%.**

- With the bees alone they already roam 32%: about 2 flowers stand in sight
  for 3 bees, a limit set by `flower-sight.ts`.
- Butterflies resting on the clump's caps crowd the remaining flowers.

**For the view owner:** a flier holding an air spot is drawn still at the
spot, because `flightPoint` has no flutter after arrival. A slow hover bob
would read better.

## The harness (in the patch, under `tmp/`)

- `sim.ts` runs `opened()` as `perch-sight.test.ts` does, and releases the
  given kinds 300 ms apart through the real `reduce`.
  - It re-runs `perchSight` whenever something is planted.
  - It tracks each leg's start (the last drawn point) and end (the kind's
    seat) and draws every frame with `flightPoint`, using `carriedFrom` and a
    flutter of 0.28 × size.
- The metric scripts:
  - `measure.ts`: every metric.
  - `catch.ts`: taps aimed where the flier was drawn 200 ms earlier, counted
    as hits inside `tapReach(span / 2)`.
  - `overlap.ts`: aloft bodies overlapping, bodies being discs of
    `bodyLength × size`.
  - `bees.ts` and `flies.ts`.
- Run each with `pnpm exec tsx tmp/handle-bite6/perch/<script>.ts`; `N` sets
  the number of visits.
