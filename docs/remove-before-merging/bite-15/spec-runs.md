# Bite 15 — spec `runs`: a mouse runs to another door, sized to its door

The operator's asks 1 and 2 (`bite-14.md` § "From the operator's play — for
item 15"; his frame `frames/bite-14/operator-chanterelle-mouse.png`). Paths
are under `src/pages/mushrooms/` unless they say otherwise.

**Where it stands today.** The mouse is not a thing at all: it is a function
of the clock and its own door. `HouseView` holds a `Tapped`
(`phase`, `tappedAt`); `mouseOut` (`model/motion.ts`) is the larger of
`peek` (an outing every 6–12 s by phase) and `peekAfterTap`; `paintHouse`
opens the door by `out × DOOR_LEAD` and `paintMouse` draws a front-view head
rising in the doorway. The chanterelle frame comes from `mouseScale`
(`door-reach.ts`): a door too small for a 28 px head draws the mouse up to
several times its door's scale, clipped only above the sill, so it covers its
door. Nothing in `model/game.ts` knows a mouse exists.

## Calls

1\. **The mouse is sized to its door: `mouseScale`'s floor goes.** The head
is `MOUSE_HEAD_R` (0.3) of the door's width at every size, clipped to the
doorway always, as a door wide enough draws it today. `MOUSE_HEAD_LEAST`,
`mouseScale` and `ABOVE_SILL` go; `mouseHead` is `2 · MOUSE_HEAD_R · width`.
The door's tap area stays `doorHitArea`'s, never under `TAP_RADIUS`, so a
mini-mouse's door is as easy to hit as before. [Beats: a lower floor — any
floor is the same rule at a smaller door, the frame he sent coming back on a
farther or smaller chanterelle; he asked for mini-mice outright. R1's play
note measures the smallest head drawn, for `to-check.md`.]

2\. **A run is scene state held in the scene, its rules pure functions in
`model/`** — not `Meadow` state through `reduce`. The scene keeps which
door holds how many mice and the runs under way (`ui/scene/mouse-runs.ts`);
every rule — the run's timeline, its length, which door it picks, where a
sinking house's mice go — is a pure function in `model/mouse-run.ts` under
`node:test`. Why: a run starts from what is drawn (call 3), which only the
scene knows, as today's peeks are already scene-only; nothing the model
decides reads a mouse; `meadow-scene.ts` stands at 450 lines with no room for
a new dispatch path; and a `Meadow` changing at every run start would send
every bed through `reconcile`. Nothing persists across a reload either way.
[Beats: `Meadow.runs` + a `run` action, as fliers' legs are — that buys a
reducer test of what the pure functions already test, at the cost above.]

3\. **"Near enough to be seen" is both doors drawn now, and the two feet
within `RUN_REACH` on the plane.** A door is a target when its mushroom is
standing (`goneAt === Infinity`), its door seated (`HouseView.doored`), and
its `stands` is `drawn` and not `behind` — on screen, not culled, short of
the brow (`D_SEE`); the start door the same. `RUN_REACH` = 2.5 of the
clump's size (the opening clump's feet are 0.25 apart, `D_SEE` is 13.3), so
a run is at most ~4 s and stays on one screen. [Beats: within `D_SEE` of each
other — two doors at opposite screen edges, or one behind the child, would
make a run the child cannot follow; `PERCH_REACH` — the same, wider.]

4\. **Which door: the emptiest in reach, then the nearest** on the plane,
ties by id. So a house a mouse has left is the first refilled. [Beats:
nearest only — two mice would shuttle between the same two of five houses.]

5\. **Mice are conserved and live in houses; a house may stand empty.** Each
door put in brings one mouse (as today). A run moves one mouse from its door
to the target's: the start is one fewer from the run's first frame, the
target one more when it goes in. An empty house does not peek and starts no
run; a house with two or more peeks one head at a time. Nothing is lost: a
mouse is always in a house or on a run (call 10 covers sinking). [Beats: every
door always "has its mouse" — a child sees the mouse leave and then a mouse
peek out of the house it left; a swap, two mice crossing — twice the drawing
for the same idea.]

6\. **When: some of a mouse's own outings become runs, and a door tap runs
it.** Outings keep `peek`'s schedule; each outing `k` of a house (`outingOf`,
call 15) is a run when a target is in reach and either the house holds two
or more mice or the seeded draw on (`seed`, `k`) falls under `RUN_SHARE` =
0.5; otherwise it is the peek it is today. A tap on a door with a mouse home
and a target in reach starts a run at once (the door opens within the frame,
with today's squeak); with no target it is today's tap peek. A tap on an
**empty** door calls a mouse home: the fullest house in reach sends one,
running here, the tapped door swinging open at once to wait for it and the
squeak sounding; with no mouse in reach, the door opens on its empty doorway
and shuts, with a knock (`voice.knock`). [Beats: runs only on the schedule —
a child would wait 6–24 s to discover one; every outing a run — the look-about
peek, the house's one charm, would vanish wherever a second door stands.]

7\. **The path is straight on the plane, between the two doors' fronts.** A
door's front is its foot moved toward the eye by the stem's half width there,
so the mouse leaves and enters in front of its stem as the door is drawn; the
fronts follow the eye each frame (by a stem's half width at most), so
the path is a pure function of the run, the clock and the view. A stem on the
way is passed by depth (call 9) — behind a nearer one, before a farther —
which reads as going round it. [Beats: steering round stems — a path planner
for what depth sorting already shows; a path bent through a midpoint.]

8\. **The timeline, a pure function of seconds since the run began**
(`runAt(elapsed, length)` in `model/mouse-run.ts`), five legs reusing
`outAndBack`'s `smooth`:

- _peek_ 0.35 s up, 0.5 s looking toward the target (the start house
  draws it, as today; `out` from the run, `open` from it too);
- _leave_ 0.25 s: the runner hops from the sill down to the ground at the
  start's front, the start door still open, the head gone from it;
- _run_ `length / RUN_PACE`, `RUN_PACE` = 0.6 clump sizes a second
  (`along` eased in and out over its first and last 0.15 s), clamped to at
  least 0.4 s;
- _enter_ 0.25 s: a hop up to the target's sill, its door open;
- _close_ 0.3 s: the target door shuts behind it, the mouse counted in.
  A door's open is the larger of its peek's and any run's at it. Runs are not
  timed in a flier's leg frame (`model/flight-frame.ts`): that frame keeps a
  flier's on-screen speed steady across a turn, whereas a mouse on the
  ground is placed by the plane each frame like a mushroom, and plane timing
  makes the run's end independent of where the child walks. [Beats: the leg
  frame — eye-dependent timing for a thing that never leaves the ground.]

9\. **Its depth is its plane point's row** — the runner is a graphics of its
own stood by `standAt(bedPlace(view, point))`, so it sorts among the
mushrooms by foot rows: behind every nearer cap and stem, in front of every
farther one, in front of its own house at both ends (the front is nearer the
eye than the foot, past `HOUSE_NEARER`). Past the brow it sinks and squeezes
as any bed object (`sunk`, `depthOf`); near the eye it culls. The _peek_ and
_close_ legs stay in the house's graphics, clipped to the doorway.

10\. **A sinking house (`−`):** its mice home run out to the target call 4
picks, one every 0.3 s, at once; with none in reach, to the nearest door on
the field (counted there at once if off screen, with no drawing); with no
door left on the field they sink with it, as the door does. A run whose
target sinks re-targets from where it is, a fresh run with no _peek_ or
_leave_ leg, by call 4 — else back to its start if standing, else the nearest
door on the field. A run whose start sinks carries on.

11\. **Out of sight mid-run, nothing changes**: the run lives on the clock,
its runner drawn whenever its point is, and lands by count whether seen or
not. Starting needs both doors in sight (call 3); finishing does not.

12\. **Drawn running: a side view, in `draw-mouse.ts`, sharing its inks.**
`paintRunner(graphics, width, stride, facing, brush)`: a body ellipse, the
head forward with one ear, eye and whiskers, a curved tail, four legs
scissoring by `stride` — the distance run over a stride length, so the legs
match the pace — and a bob; facing left or right by the run's sign across the
screen this frame. `paintMouse`'s `fill`/`inked` move into a helper both
painters take, so the colours and ink weights are one home. A small ground
shadow under it, from `drawMushroomShadow`'s tone. [Beats: the front-view
head carried along — it reads as a sliding face.]

13\. **Its size along the way follows its door, then the target's.** The
runner's width is a plane length: each door's width in the clump's size,
mixed by `along`, drawn at its point's depth as `viewOf` scales any plane
length; the _leave_ and _enter_ hops keep their end's. So a fly agaric's
mouse running to a chanterelle shrinks as it goes — the operator's "против
биологии", taken as given. [Beats: keeping the start's size — a big mouse
arriving at a door half its width, the frame he complained about.]

14\. **Sound: a patter, and squeaks only where a tap is.** While the runner
is drawn, a soft tick per footfall from `synth.ts`, panned by `panOf`
(`flight-frame.ts`) and quieter with distance, in `sound.ts`'s new `patter`;
a scheduled run or peek stays silent as peeks are today. A tap on a runner
(call 16) squeaks.

15\. **`motion.ts` gains `outingOf(time, phase)`** — which outing `peek` is
in, the period read by one helper both use — so a run replaces exactly the
peek of its outing: the house reads `out` from the run while one started from
it is in its _peek_ leg, and from `peek` otherwise.

16\. **A tap on a running mouse: it squeaks and hops**, a jump on the clock
(`hop(t − tappedAt)`, 0.3 s) over its path; the run's timing is unchanged.
The runner takes taps through a `TAP_RADIUS` circle round its body, depth
sorted like everything else, so it never covers a nearer cap. [Beats: the tap
going through to the ground — it would open the flower picker on a tuft under
a mouse the child aimed at.]

## Steps

Each is one agent: one build step and its tests; the play and the frames are
separate.

- **R1 — the size rule** (call 1). `ui/scene/door-reach.ts` (floor out,
  `mouseHead` plain), `ui/scene/draw-mouse.ts` (clip always to the doorway),
  `scripts/lib/play-house.ts` (the `MOUSE_HEAD_LEAST` expectation becomes a
  note of the head against `0.6 ·` the door's drawn width). Test: a new
  `door-reach.test.ts` — the head is 0.6 of the door at 8, 20 and 60 px.
  Independent of everything below; lands first.
- **R2 — the rules, pure** (calls 3–8, 10, 13, 15). New `model/mouse-run.ts`
  - `mouse-run.test.ts`: `RUN_REACH`, `RUN_PACE`, `RUN_SHARE`; `runAt` (legs,
    `along`, hop height, `out` and `open` at each end); `runTarget(from,
doors)` (emptiest, nearest, in reach); `runsOuting(seed, k, mice)`;
    `moved(mice, from, to)` and `scattered(mice, sinking, doors)` on a
    `ReadonlyMap<string, number>`; `widthAlong`. `model/motion.ts`: `outingOf`
    and the shared period in the peek block only. Tests: every leg's edges,
    a 0.25 run's length, target order, conservation over moves and sinks
    (count before = count after, unless no door is left).
- **R3 — the scene** (calls 2, 5–11, 13). New `ui/scene/mouse-runs.ts`
  (`MouseRuns`: the counts, the runs, the outing watch per house, the runner
  graphics stood by `bedPlace`, re-targeting and sinking), `house-view.ts`
  (door `out`/`open` from the runs, no peek when empty, the door tap handed
  to `MouseRuns`), `mushroom-bed.ts` (makes `MouseRuns`, calls it from
  `update` and the sinking loop in `reconcile`), `draw-mouse.ts`
  (`paintRunner` and the shared fill helper, call 12). Tests: what of
  `mouse-runs.ts` is pure (the front point, the facing) beside it; the
  runner is looked at in R5.
- **R4 — tap and sound** (calls 14, 16). `mouse-runs.ts` (runner hit circle,
  `hop`), `sound.ts` (`patter`), `model/mouse-run.ts` (`hop`) + its test.
- **R5 — probe and play.** `scripts/lib/mushroom-probe.ts`,
  new `scripts/lib/play-runs.ts`, `scripts/play-mushrooms.ts` (`runs` in
  `PLAYS`), and `play-house.ts` where its door taps now start runs (below).
- **R6 — frames.** A look-at-frames agent: the play's frames at tabL and
  phoneP, the operator's chanterelle redone; writes what it cannot judge
  by code into `to-check.md` (call 7's stems, a far mini-mouse's few px).

## Collision list with `worms`

| File (lines now)                      | `runs` touches                                                                                                           | `worms` keeps                                                                    | Net grant                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `ui/scene/house-view.ts` (243)        | the constructor's pointer-down body (→ `MouseRuns`), `out`, `update`'s door gating, `paint`'s `door` object, `drawnHead` | `furnish`'s window loop, `paint`'s `windows`, any window hit area and its fields | runs ≤ +25, worms ≤ +45                                                                          |
| `ui/scene/draw-house.ts` (303)        | none expected: `ShownDoor` already carries `open` apart from `out`                                                       | the windows; a worm painter in its own `draw-worm.ts`                            | worms ≤ +30                                                                                      |
| `model/house.ts` (322)                | none: the sill height is computed in `mouse-run.ts` from `DoorPlace`                                                     | `windowSlots` and anything worms read off windows                                | worms ≤ +30                                                                                      |
| `model/motion.ts` (338)               | the peek block, lines 267–322 only                                                                                       | appends after `blink`, or better its own module                                  | runs ≤ +15, worms ≤ +30                                                                          |
| `ui/scene/mushroom-bed.ts` (429)      | `show`'s `HouseView` call, `update`, `reconcile`'s sinking loop, one field                                               | window taps in `tap`/`show`                                                      | runs ≤ +10, worms ≤ +6; the second to land past 445 moves `nearestDoor` into `door-tap.ts` first |
| `ui/scene/sound.ts` (354)             | a `patter` method                                                                                                        | a worm's voice                                                                   | each ≤ +20                                                                                       |
| `scripts/lib/mushroom-probe.ts` (881) | `runs()`, `mice()`, the `Run` schema                                                                                     | `worms()`                                                                        | each ≤ +45                                                                                       |
| `scripts/lib/play-house.ts` (202)     | the head expectation (R1), the door-tap block                                                                            | none: worms play in their own file                                               | —                                                                                                |
| `HouseView`'s constructor signature   | adds one callback, `onDoor`                                                                                              | adds what it needs after it                                                      | whichever lands second rebases the bed's `new HouseView` call                                    |

`meadow-scene.ts` (450) is touched by neither.

## Play and probe

`__probe` gains:

- `runs()` → each run under way: `{ from, to, leg, along, x, y, depth,
width }` — the runner's foot on screen, its graphics' depth and its drawn
  width in CSS px; `[]` with none.
- `mice()` → `{ [id]: count }` for every doored house.
- `mouse(id)` keeps `tappedAt`, `out`, `head`, and gains `door`, the drawn
  door width in CSS px, so `head / door` is checked against 0.6.

**The `runs` play**, on the opening clump, one screen per call:

1. Furnish a door on each mushroom (`play-house`'s steps), settle; read
   `mice()` = 1 and 1.
2. Tap the front door. Within a frame the front door is open (`out` > 0);
   shoot `r1-peek` at 0.5 s, `r2-leave` at 0.95 s, `r3-running` mid-run (its
   `depth` between the two mushrooms' foot rows, or below the front one's),
   `r4-in` at the end. `mice()` = 0 and 2; no run left.
3. Tap the empty front door: a run from the back house to it starts in the
   frame; shoot `r5-called-home`; `mice()` back to 1 and 1.
4. `−` the back mushroom with its mouse home: a run starts toward the front
   door; shoot `r6-flee`; once over, `mice()` front = 2.
5. On a chanterelle grown alone in view (`species`'s way), a door tap peeks
   and starts no run; shoot `r7-mini-mouse` and note `head / door`.

Fails on: no run started by a tap with a target in reach, a run started with
none, a count that changes the total, a runner drawn in front of a mushroom
whose foot is nearer. Prints, never fails: head and runner widths in px.
`play-house` keeps its door taps' checks — the tap reaches its door, the
mouse comes out (`out` > 0.9 at 24 steps falls inside the _peek_ leg) and the
selection holds — and leaves where the mouse goes next to this play.
