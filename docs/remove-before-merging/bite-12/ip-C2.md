# ip-C2 — the switch-over (step 1 of package C): built

Built on `ip-C1.md`'s design with its three calls as decided. `pnpm
typecheck`, `type-overlap`, eslint/prettier on the touched files green;
`insect-frame`, `insect-away`, `insect-seat`, `insect-layout`, `insect-tap`,
`perch-sight` tests green, and `fliers.test.ts --test-name-pattern="caught by
a tap"`. **Not run: the whole `fliers.test.ts` (~6 min)** — the next agent
runs it first. `pnpm knip` lists 11 unused exports, none in a file touched
here (`depthScale`, `BROW_PALE`, `seamAt`, `regrowTufts`, `Place`,
`Scaling`, `Lasting`, `PanKey`, `StepKey`, `ShownSprout`), not checked
against the base.

## What landed, by file

- `insect-view.ts`: flies every leg in its frame. `centreOf` on the leg's
  first frame; start `framedOf(from)`, end `framedOf` of: the out spot; for
  an away leg `offAloft` at `from`'s distance from the eye; a seat's
  `seatAloft`; an air perch's `aloft`; else last frame's `goal`. Steered at
  `size` and `flutter` × `CD / mixD(…, last frame's flown)`; fidget and bob
  added in frame px × that zoom; `aloftFramed` at `mixD(…, flown)`, drawn by
  `drawnFlier`, whose veered `aloft` (no bob) becomes `shown.drawn`, the
  next leg's `from`, hidden or not. A sitter goes through `drawnSitter`.
  `SeatEnds.from` = `from` on every leg not in from away, `to` = the end on
  a leg to a seat. `see()`, `sat`, `leftFrom`, `stage`, `clump`, `feet`
  gone; the view is always defined.
- `insect-shown.ts`: `from`/`drawn`/`goal: Aloft`, `centre`, `flown`,
  `at: Point` and `end: Framed` in the leg's frame (the probe's), `out:
Aloft`; `fromRow`/`row`/`OverRow` gone. `freshShown(parts, from)`.
- `insect-seat.ts`: `drawnFlier` → `{ aloft, drawn }`; `seatedZoom(view,
host, drawn)` with the bend at the seat; new `seatAloft`, `drawnSitter`;
  `drawnInsect`/`onSeat`/`offHost` gone.
- `insect-away.ts`: ip-C1.patch's cut, plus `seenFor(view, aloft)` (the
  drawn point, else just past the side the eye turns by) for `entryAloft`.
- `insect-frame.ts`: `azimuthOf` exported.
- `perch-hosts.ts`: `Seat = Point & { on, drawn, nectar? }`, `Perched = Seat
| { aloft }`, `isSeated`; `PerchHosts.air` gone. `perches.ts`: `air` map
  gone, `see()` returns nothing. `capTop`/`seat` return `Seat`;
  `insect-look`'s `Drinking` picks `Seat`'s `nectar`.
- `meadow-scene.ts`: `viewNow()` (`eye.view() ?? viewAt(camera,
OPENING_EYE)`); tick, startle and `Arrivals` read `sightFrom(viewNow())`.
- `scripts/lib/mushroom-probe.ts` `insect()`: `at`/`end` straight from
  `shown`, frame px; `ofLayout` gone. `play-insects.ts`: only its comment.
- Tests: `insect-away.test.ts` keeps `reachesScreen` (no undefined view),
  `entryAloft`, `offAloft`, adds `seenFor`. `insect-seat.test.ts` keeps
  `drawnFlier` (rim bound 1e-3) and `seatedZoom` (taken at the foot; "own
  size at the opening" as `CD / ahead` to 1e-3), adds `drawnSitter`,
  `seatAloft`.

## Decisions not in ip-C1.md

- **`Seat` keeps the world-px `Point`** (the laid seat): where the host is
  not drawn (behind the eye, culled), `drawn` means nothing, so the end is
  `aloftOfLayout` of the laid seat instead of `aloftAt(drawn)`. The end can
  step when the host's `drawn` flips; the insect is hidden there anyway.
- `entryAloft`'s seat point is `seenFor(goal)`, so a perch behind the eye
  sends a release out by the side the eye turns by.
- A new insect's placeholder `from` is the screen's top middle at
  `CLUMP_DISTANCE` (was the world's top middle).
- `footRows`/`FootRows`/`clumpRow` stay exported: `perch-sight.test.ts`
  uses them and knip counts tests.

## Left

1. `fliers.test.ts` in full.
2. Step 2: tests for `flowerLiftAt` and for `seat`'s and `capTop`'s `drawn`.
3. C's play checks (`play-veer.ts`), the orchestrator's.
