# mr — mice runs on a child's meadow, and `mouse-runs.ts` split

**Done.**

- (a) `scripts/lib/play-night-run.ts` gains `playGrownRuns`, the play
  `night-run` in `scripts/play-mushrooms.ts`: three mushrooms grown with `+`
  (the first three caps), each given a door (the house picker's last piece)
  while selected, the sun tapped, full dusk waited, then up to 13 s for an
  outing whose two houses are both grown; its runner shot mid-run
  (`night-grown`, `night-grown-close`). The waiting and the shooting are
  shared with the dusk play's `shootNightRun` (`outingAfter`, `shootRunner`).
  tabL: grown mushroom-3/4/5 all doored; outing 1 runs mushroom-3 → mushroom-5;
  the frame shows the mouse on the grass leaving the far-left amanita.
- (b) `ui/scene/mouse-runs.ts` 462 → 406 lines: how a door shows (`DoorShown`,
  `MouseDoor`, the kept door `DoorKept`, a run as its doors see it `DoorRun`,
  and `doorShownAt`, the old `doorAt` body) moved to `ui/scene/mouse-door.ts`;
  `house-view.ts` imports its door types from there. `MouseRun` derives from
  `DoorRun` and is no longer exported (nothing imported it). The re-target
  comment now says "no door in sight". No behaviour change: mouse-run,
  -clock, -course, night-runs and door-tap tests green; the dusk and
  night-run plays pass on tabL.

**Left.** Nothing. Only tabL was played; phoneP is mc.md's other measured
layout and would be the next screen to try the `night-run` play on.
