> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# A hub's target shuffles on a sine tempo

## The ask

A hub portal stops holding one target for a minute. Its target changes on ticks
whose rate swings along a sine over a cycle of a few seconds: on the slow part a
room hangs for a couple of seconds, on the fast part they flicker at several
hertz. The popular targets sit on the slow ticks, the rare ones on the fast — so
walking into a popular room is easy, and a rare one is a matter of timing and
luck.

The way back still leads to the spoke's one hub, but not at any time: a spoke
opens on a timetable of its own, for a short window every few minutes, longer
apart the farther up it climbs.

## The tempo

`portal-tempo.ts`, new, beside `portals.ts` in `entities/world/model`.

- **Constants in `PORTALS`**, replacing `periodMs`: `cycleMs: 5_000`,
  `ticks: 11`, `swing: 10.5`. The tick phase is
  `Φ(t) = ticks·t/T + swing·sin(2πt/T)/2π`, a tick ending at each whole `Φ`: the
  rate is `(ticks + swing·cos(2πt/T))/T`, fastest at the cycle's edges (4.3 Hz),
  slowest mid-cycle (0.1 Hz instantaneous). The holds come out as
  `0.23 0.24 0.27 0.33 0.50 1.85 0.50 0.33 0.27 0.24 0.23` s: one room hanging
  ~1.9 s, two shoulders of half a second, the rest a flicker. An odd tick count
  keeps the slowest tick whole in mid-cycle rather than cut by the cycle's edge.
- **The boundaries are a table of whole milliseconds**, solved once at module
  load by bisection and rounded. `Math.sin` is not bit-identical across engines,
  so a test pins every unrounded boundary at least `1e-6` ms off a rounding
  edge: two machines then build the same table, which is what the world's
  same-for-everyone rule asks of it.
- **`tickAt(epochMs)`** → `{ cycle, tick, startMs, endMs }`, and each tick's
  **time-share window** `[lo, hi)` in ms of the cycle: the ticks sorted by hold,
  longest first, their holds laid end to end. The slowest tick owns `[0, 1850)`,
  the two shoulders the next 1000 ms between them, the flicker the rest.

## Popular on the slow part

`hubTarget` keeps its two draws, rolled per tick instead of per minute:
`rolled.portal.hub` is keyed `{ n, hub, cycle, tick }` (`cycle` is
`epochMs / 5000`, a safe integer).

- **The floor** is picked by quantile, not by plain draw. The floors the hub
  reaches are ranked by `jumpWeight`, heaviest first (ties to the shorter drop),
  their weights laid end to end over `W`. The tick's draw lands on a point of
  its own window, scaled from the cycle's `T` ms onto `W`, and the floor whose
  stretch holds that point is the target. All in `bigint`: the point is
  `lo·W + drawBelow(draw, (hi − lo)·W)` against weights scaled by `T`.
- **The spoke** on that floor is drawn uniformly, as today.

**What this preserves:** a player stepping through at a random instant lands on
floor `m` with exactly the law's share `w_m / W`, up to how ticks cut the
quantiles — the law the simulations artifact picked is unchanged in time, only
rearranged across the cycle. With drop 7 at ~29% of a floor-20 hub's law, the
slowest tick (37% of the cycle) shows a drop of 7 nearly always and a 6 the
rest; a one-floor drop (<1%) can only come up in the flicker.

**Every hub turns on the same tick**, as now, since the table is shared.

Ranking by the chance of the very room — floor weight over its spokes — was
ruled out: deeper floors hold ~4× the rooms each, so it ranks the shallowest
reachable floors first and erases the 7-peak from the slow part. A 4 s cycle of
13 ticks (6 Hz flicker) was ruled out for its longest hold, ~1.2 s.

## The way back runs on a timetable

A spoke still leads to its one hub, and only while it is open. `PORTALS` gains
`spoke: { openMs: 20_000, everyMsPerFloor: 60_000 }`.

- **The window.** A spoke climbing `d` floors opens for `openMs` once every
  `d · everyMsPerFloor`: a 7-floor climb every 7 minutes, a 21-floor one every
  21, a one-floor one every minute — the deeper the fall, the longer the wait.
- **Its own phase, fixed.** Each spoke's window starts at a rolled offset within
  its period, `rolled.portal.spoke` keyed `{ n, spoke }`, the same every period:
  a spoke keeps a timetable a player can learn, and the spokes of one floor open
  at scattered times, so a player who missed theirs can go looking for another.
  `isOpen(spoke, epochMs)` is `(epochMs − offset) mod period < openMs`, in whole
  milliseconds.
- **Shut, a spoke is a door that will not open.** `isDoor` takes the instant, so
  the press offers no shut spoke, and the geometry still draws it as a door. A
  spoke held open past its window goes dark and stops the body like a wall until
  it opens again: `Ways.beyond` tells a door that leads nowhere this instant
  apart from one that leads to the room behind it, and `play.ts` blocks the step
  through the first.
- **A hub is never shut.** The body coming out of a spoke stands in its room
  with the spoke's door open behind it; turning back through it reaches the hub
  only inside the spoke's window, which is the point.

`portalTarget`'s round trip keeps its promise only within an open window, and
its test says so.

## The view through the door

Today `portal-view.ts` builds the rooms beyond when the door first leads
somewhere and keeps showing them until the next build lands. At a minute a
target that was harmless; at four hertz the door would show one room and drop
the body into another. So:

- **Builds run ahead of the clock.** Each frame with a portal door open, the
  view walks the ticks of the coming cycle (`tickAt` from now, `endMs` on), asks
  `farSideOf` for each tick's target, and queues a build for any not yet built.
  Built rooms are kept in a cache keyed by the way out, the eleven of a cycle
  and the next cycle's as it comes, oldest dropped past 24.
- **The door shows the current tick's target or nothing.** A target whose build
  has not landed shows what an unbuilt door shows today — never the previous
  room. Switching is an `uploadBeyond` of a mesh already built, so a tick costs
  a buffer upload, not a build.
- **The crossing is the clock's**, unchanged: `carriedThrough` asks `beyond` at
  the frame's instant, so the body goes where the door leads then, built or not.

How long one build takes decides whether a cycle's eleven fit in its five
seconds; `/preview` measures it on a deep floor, and if they do not fit, the
queue builds in tick order — the slow tick's target first, since it is the one a
player can aim for.

## Tests and the script

- `portals.test.ts`: "holds its target for a minute" becomes the tempo — the
  hold table, every hub turning on the same tick, a target constant inside a
  tick. The floor-20 law test samples instants uniformly over many cycles
  instead of epochs and keeps its shares. New: on the slowest tick a floor-20
  hub shows a 7- or 6-floor drop in nearly every cycle; a drop under 1% of the
  law never lands on a tick held over 0.3 s.
- `portal-tempo.test.ts`, new: the table — `ticks` boundaries, monotone, the
  last at `cycleMs`, the holds as above to the millisecond, and the
  rounding-edge margin; `tickAt` on a boundary, inside a tick, across cycles.
- `portals.test.ts`, the timetable: a spoke open exactly `openMs` in each of its
  periods, at the same offset every period; the spokes of one floor not all in
  phase; a shut spoke leading nowhere and offered to no press.
- `play.test.ts` (or the body's door test): a step through a spoke held open
  past its window is stopped at the doorway.
- `src/cube/scripts/portal-cube.ts` shoots "open a minute on": its search walks
  ticks instead of minutes, and the frame is renamed `open-next-tick`. Its
  look-back frame waits for the spoke's window.

## DRY notes

- **Reused:** `drawBelow` for the in-window draw, `jumpWeight` and `spokesOf`
  for the ranking and the spoke, `farSideOf` for the view's look-ahead — the
  view asks the model what a door leads to at an instant rather than learning
  hubs.
- **Moved, not copied:** `floorBelow`'s plain weighted draw becomes the quantile
  pick in place; nothing else draws a floor.
- **New and single-homed:** the tick table and `tickAt` in `portal-tempo.ts`,
  read by `portals.ts`, the view and the script. The script's tick walk and the
  view's look-ahead both iterate ticks from an instant; that walk is one
  exported generator in `portal-tempo.ts` rather than two loops.
- **Not extracted:** the cache in `portal-view.ts` is a `Map` with an eviction
  order — a cache helper for one caller would be net-negative.

- **The timetable reuses the tick idea, not its code**: a spoke's window is one
  modulo against a rolled offset, with nothing of the sine table in it, so it
  sits in `portals.ts` beside `spokeTarget` rather than in `portal-tempo.ts`.

## Questions

3. **When a spoke opens.**
   - **a (recommended)** — a fixed offset per spoke: a timetable a player can
     learn, like a train's.
   - **b** — rolled afresh each period: once per period, guaranteed, but never
     when you expect.
4. **How often.**
   - **a (recommended)** — 20 s every `d` minutes, `d` the floors it climbs.
   - **b** — the same for every spoke, say 20 s every 5 minutes.
5. **What a shut spoke is.**
   - **a (recommended)** — a door that will not open; one held open past its
     window goes dark and stops the body.
   - **b** — an ordinary door into the room behind it: no new door state, but
     the floor's mesh then depends on the clock and is rebuilt every time a
     spoke opens or shuts.
