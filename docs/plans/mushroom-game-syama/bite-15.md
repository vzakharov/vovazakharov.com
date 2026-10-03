# Bite 15 — the house's dwellers

Item 15 of the plan, the operator's three asks after playing bite 14
(`bite-14.md` § "From the operator's play — for item 15"): a mouse runs only
to another door, a mouse is sized to its door, a window answers a tap with a
worm. Two packages, each mapped by a spec (`spec-runs.md`, `spec-worms.md`
under `docs/remove-before-merging/bite-15/`) whose recommendations are taken
except where a call below says otherwise. Paths are under
`src/pages/mushrooms/`.

## Calls — runs

1\. **A mouse's head is 0.3 of its door's width, clipped to the doorway, with
no floor.** The operator's chanterelle frame came from `mouseScale`'s floor
(`MOUSE_HEAD_LEAST`, `door-reach.ts`) scaling a small door's mouse up to a
28 px head, clipped only above the sill, so it covered its door. The door's
tap area keeps its `TAP_RADIUS` minimum. Beat: a lower floor, which brings
the defect back on a smaller door.

2\. **Runs are scene state over pure rules.** How many mice each door holds
and the runs under way live in `ui/scene/mouse-runs.ts`; every rule is a pure
function in `model/mouse-run.ts` under `node:test`. Beat: `Meadow` and a
`run` action — a run starts from what is drawn, which only the scene knows,
as a mouse's tap time already is.

3\. **"Near enough to be seen"** is both doors drawn now (on screen, not
culled, short of the brow) with their feet within `RUN_REACH` (2.5 clump
sizes) of each other. Beat: `D_SEE` or `PERCH_REACH`, which allow runs the
child cannot follow.

4\. **The target is the emptiest house in reach, then the nearest**, ties by
id, so mice spread rather than shuttle between two houses.

5\. **Mice are conserved.** Each new door brings one mouse; a run moves it; a
house may stand empty, and an empty house does not peek. Beat: every door
always holding its mouse, which shows a mouse peeking from the house it just
left.

6\. **When a mouse runs**: an outing it would make anyway becomes a run when
a door is in reach and its seeded draw (`RUN_SHARE` 0.5) says so, or its
house holds two. A door tap with a mouse in starts a run at once when a door
is in reach (else today's peek), with the squeak. **A tap on an empty door
calls a mouse home** from the fullest house in reach; with none in reach,
the door opens on an empty doorway and shuts with a knock.

7\. **The path is straight on the plane** from door front to door front; a
stem in the way is passed in front or behind by depth. Beat: path planning.
A straight run crossing a third stem is a `to-check.md` line.

8\. **A run is a pure function of its own clock**: peek, hop down, run at
`RUN_PACE` (0.6 clump sizes a second), hop up, door shuts — on the plane, not
in a flier's leg frame, the mouse never leaving the ground.

9\. **A running mouse has a graphics of its own**, stood by
`standAt(bedPlace(view, point))`, so it sorts by its foot's row: behind
nearer caps, in front of farther ones and of its own house at both ends.

10\. **A house that sinks sends its mice out** to a door in reach, else to the
nearest door on the field, else they sink with it. A run whose target sinks
turns for another door; one whose start sinks carries on. Going out of sight
mid-run changes nothing: the run lives on the clock.

11\. **Drawn side-on**, `paintRunner` in `draw-mouse.ts` sharing its fill and
ink: legs in step with the distance, a bob, facing the way it runs on
screen; its width eases from its own door's to the target's along the way.

12\. **Sound**: a soft patter, panned and quieter with distance (`patter` in
`sound.ts`); a squeak only on a tap. **A tap on a running mouse** (a
`TAP_RADIUS` circle) squeaks and hops it, the run's timing unchanged — it
never goes through to the ground's flower picker.

13\. **`RUN_REACH`, `RUN_PACE`, `RUN_SHARE` are starting values**, tuned from
frames by the look agent.

## Calls — worms

14\. **A window tap does the worm only** — no wobble, spore or select, an open
picker staying open, as the door does. Beat: both, which rocks the cap under
the worm and teaches "windows give spores".

15\. **A window's tap reach is the bigger of its painted pane and 16 px,
cut to the cap as drawn**, against the standing `TAP_RADIUS` 32: at full
reach a row of windows covers a small cap's face, and with the door the
mushroom could no longer be selected for `+`'s house or `−`. A near miss
lands on the mushroom, so no tap is dead. Within a house the nearest of the
door and the windows takes the tap (`tappedDoor`). The probe measures how
much cap the mushroom keeps; the fallback is full reach limited to the
windows' band. A `to-check.md` line: whether a window is easy enough to hit.

16\. **The worm goes to the farthest window along the row**; from the middle
one it alternates left and right by a trip count. Beat: nearest (a
one-pane twitch), random, or the slot order (which jumps, slots running from
the middle outward).

17\. **The path**: on a dome an arch across the cap's face, rising toward
`capSurface` with the trip's length and kept inside the outline; on a
chanterelle along the row under the rim (`slotLevel`, exported), dipping
with it.

18\. **A worm is a pure clock function of its tap** (`model/worm.ts`): out
0.25 s, a crawl at ~0.35 units/s held to 1.2–3 s, in 0.3 s, inching every
0.45 s (head, then tail). With one window it peeks, reusing the mouse's
`outAndBack` and `lookAbout`.

19\. **Drawn as five round segments and an eye** (`draw-worm.ts`), painted
after the windows, its thickness 0.3 of a pane with a 5 px floor; two inks,
`worm` and `wormBand`, in `palette-creatures.ts`.

20\. **One worm per house**: a tap mid-crawl wriggles it with a half-volume
sound, its course unchanged; a window put in mid-crawl changes nothing. It
rides the house's graphics, so it wobbles, swells and sinks with the cap.
The sound is `MeadowSound.wriggle()`, a soft pip-pip, at the tap only.

21\. **Scene-only**, on `HouseView`, the pure parts in `model/worm.ts`.
**Worms coming out on their own in rain (the spec's W5) is not built** —
not asked, and the bite is taken small.

## Packages and waves

Each step is one agent, its files as its spec names them.

- **Wave 1, in parallel: R1** the size rule (`door-reach.ts`,
  `draw-mouse.ts`, `play-house.ts`'s head check, `door-reach.test.ts`);
  **R2** `model/mouse-run.ts` and `motion.ts`'s peek block (`outingOf`);
  **W1** `model/worm.ts` and `house.ts`'s `slotLevel` export.
- **Wave 2, in parallel: R3** the runs' scene (`mouse-runs.ts`, the bed's
  wiring, `paintRunner`) and **W2** the worms' scene (`window-reach.ts`,
  `draw-worm.ts`, the inks, `wriggle`). Shared, by function:
  - `house-view.ts` (243): R3 the door-tap handler's body, `out`, `update`'s
    door gating, `paint`'s `door`, `drawnHead`, ≤ +25; W2 the tap setup
    dispatching to `tapDoor()` (today's door body moved verbatim, which R3
    then owns) or `tapWindow(i)`, the trip's fields, the repaint check,
    `paintHouse`'s last argument, ≤ +55. The `HouseView` constructor: R3
    adds `onDoor`, W2 adds after it.
  - `draw-house.ts`: W2 only, ≤ +6.
  - `mushroom-bed.ts` (429): R3 ≤ +10; W2 none. Past 445, `nearestDoor`
    moves to `door-tap.ts` first.
  - `sound.ts` (354): R4 `patter` after `squeak`; W2 `wriggle` after
    `knock`; each ≤ +20.
- **Wave 3, in parallel: R4** the tap on a runner and the patter; **R5** and
  **W3** the probe and plays (`mushroom-probe.ts`: R5 `runs()`, `mice()`,
  `mouse(id).door`; W3 `topAt`'s window line, `windows(id)`, `worm(id)`;
  each ≤ +45 after the mouse's reader; `play-runs.ts`, `play-worms.ts`).
- **Wave 4: R6 and W4**, an agent each looking at the frames and tuning
  constants only; then the tail.

## Calls from the build

22\. **A mid-run mouse left with no door on the field sinks with the last
one** (R2's open case), as call 10's "else they sink with it".

23\. **`model/mouse-run.ts` is split before it grows**: at 459 lines after R2,
the run's clock (`runAt`, `runDuration`, `runnerAt`, `endOf`, `widthAlong`)
moves to `model/mouse-run-clock.ts` in R4, before `hop` lands.

24\. **A window worm inches with its holding end creeping** at about a third
of the leading end's pace on a long crawl (W1: an inch's step outruns the
body's squeeze at 0.35 units/s); W4 tunes pace, length or inch from frames.
A chanterelle has one window, so its worm only peeks.

25\. **A run's course bows toward the eye** so its middle crosses open grass
in front of both houses, at least a runner's length nearer than the nearer
foot, and it is no shorter than about a second at `RUN_PACE`. R5's frames
showed a straight run on the opening clump (doors ~20 px apart, ~0.4 s)
hidden behind the front stem nearly end to end: the child saw a mouse vanish
and a door move, not a run. This replaces call 7's straight path; depth
still sorts the runner against stems at both ends. Beat: path planning
round stems (call 7's own beat), and leaving it to `to-check.md`, which
ships a run nobody can see.

## Built

Each package's hand-over note under `docs/remove-before-merging/bite-15/`
holds its detail and the next step's API.

- **R1** 305c2cbf — a mouse sized to its door, clipped to the doorway
  (`door-reach.ts`, `draw-mouse.ts`); its head 0.6 of the door's width
  (`MOUSE_HEAD_R` 0.3 is the radius), 10.9 px at the smallest on phoneP.
  `layout.test.ts`'s 28 px floor test went with the floor.
- **W1** df1924d3 — `model/worm.ts`: target, path, trip clock, body.
- **R2** 2d7c2994 — `model/mouse-run.ts`: counts, reach, target, outings,
  taps, sinking, the run's clock; `outingOf` in `motion.ts`.
- **W2** 078286cd — window taps and the worm on screen (`window-reach.ts`,
  `draw-worm.ts`, `house-worm.ts`, `wriggle`, the inks).
- **R3** 2eceec8f — `mouse-runs.ts` holds the mice and runs, `run-front.ts`,
  `paintRunner`; `house.mouse.tappedAt` is set only by a tap that peeks.
  No one has yet looked at a runner or a worm on screen.
- **R4** f8b471f, 17bcf36, 3374512 — the clock split to
  `model/mouse-run-clock.ts` (call 23); a tap on a runner squeaks and hops it
  (`hop`, 0.3 s, half a runner's width); `patter` ticks every 0.08 s while
  running, panned by `panOf` — by time, not per footfall, which buzzes.
- **R5** 139059c, 2765901, 4e311a4 — the probe's `runs()`, `mice()`,
  `mouse(id).door`; `play-runs.ts`, green on tabL and phoneP. Head ÷ door
  0.60 everywhere (chanterelle ~4.5 px); runner ~1.8 doors wide. The run on
  the opening clump hides behind the front stem (call 25); in the flee
  frame a head peeks from the front door while the runner is hidden,
  unexplained. `play-house`'s change not yet run.

Open for wave 3: `pnpm type-overlap` reds in W2's files (`look` shared by
`Peeking` and `ShownWorm`, and `house-worm.ts`'s `Trip`); the meadow play's
phoneP fly-7 turn at 36.46 rad/s against 36.36 (call 42's bend allowance),
seen by R1 and not this bite's.
