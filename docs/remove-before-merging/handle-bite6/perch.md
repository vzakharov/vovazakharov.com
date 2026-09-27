# Perch group — paused

Threads T50, T52, T53 (air half), T59 (test half), the catchability judgment
call, and the two nits (orientation-independent flower cap, `flight.ts` 208
settle-back ignoring crowding).

## Done

Nothing is committed yet. No source file is edited; the working tree has none
of this group's changes.

## Half-done

The measurement harness is in `tmp/handle-bite6/perch/`, which is gitignored:
`sim.ts` drives the real `reduce` + `perchSight` and tracks drawn positions
with `flightPoint`, and `measure.ts` prints every metric. Rerun it with
`N=10 MIN=5 pnpm exec tsx tmp/handle-bite6/perch/measure.ts`.

## Baseline (10 visits, 5 min, all ten released unless noted)

| screen  | lost visits | body overlap frames | catch b/f/e | bee roam (4 butterflies + 3 bees) | fly on spotted, all ten (of caps) |
| ------- | ----------- | ------------------- | ----------- | --------------------------------- | --------------------------------- |
| tabL    | 0           | 20.9%               | 87/67/46%   | 46%                               | 30% (48%)                         |
| tabP    | 0           | 13.4%               | 92/59/57%   | 75%                               | 47% (59%)                         |
| phoneP  | 0           | 39.8%               | 96/80/90%   | 68%                               | 36% (47%)                         |
| phoneL  | 0           | 12.2%               | 92/82/60%   | 23%                               | 36% (52%)                         |
| phoneS  | 5/10        | 90.6%               | 97/91/98%   | 96%                               | 41% (53%)                         |
| desktop | 0           | 9.4%                | 84/80/33%   | 15%                               | 36% (51%)                         |

The air holds 8 spots on phoneP and phoneS, 13–21 elsewhere. The widest
wingspans in each kind's own units are butterfly 1.207, fly 1.352 and bee 1.198.

## Plan left

1. The `crowded` tuple gains a third element: the ordered kind pairs it crowds,
   computed per kind's seat and widest span (`insectSizes`), so
   `[a, b]` destructuring in `flier-watch.ts` keeps working. `taken` carries the
   holder's kind. The settle-back checks crowding too.
2. A denser air grid, spaced by the smallest kind's span, with a half-span edge
   margin, so every screen holds ≥ 10 spots. As a last resort the flier hovers
   in place rather than going `away`.
3. `seededFlowers` becomes `flowers.length`.
4. Flight time scales with the screen, for catchability. Check spottedPull and
   flowerShare against ≥ 60%.
5. Tests: the T50 loss sweep, bee roam, fly spotted share, the phoneS overlap
   sweep, catchability, swarm.test on the real `perchSight`, the air property,
   and the flight-kinds 72–75 fix.
