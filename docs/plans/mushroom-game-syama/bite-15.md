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

## Calls from the review

The worms' review is PR #57 review 5401128817.

26\. **A peek rises no higher than its cap allows**: its length is the
lesser of `WORM_LENGTH` and the room under `capSurface − MUSHROOM_INK`
above the slot (a russula's hollow), the body shrinking with it. Beat:
tilting the peek, which reads as the worm leaving for a window that is not
there.

27\. **The head is never dropped by rounding**: a segment at the path's end
is kept within an epsilon of its length (or `along` clamped), so the peek's
look always shows. Beat: none; it is a defect.

28\. **The worm's girth floor and `WINDOW_REACH` are screen pixels**,
divided by the house graphics' zoom, so a far mushroom's worm reads and its
windows take a finger as the opening clump's do; `to-check.md`'s numbers
say which mushroom they were taken on. The door's `TAP_RADIUS` floor,
older than this bite, keeps its unit. Beat: measuring a far mushroom and
leaving the floors, which ships a 4 px worm.

The runs' review is PR #57 review 5401240514.

29\. **A run is drawn from its own state, not from its houses'**: its
start and end placements are taken when it starts (and on a re-target),
so a sunk start house never hides the runner; the play expects `shown` on
every frame between the hop down and the hop in. Beat: keeping a sunk
mushroom in `shown` until its runs end, which leaks bed state into runs.

30\. **A doorway with a run's mouse in it answers a tap with that mouse's
squeak**: during a run's peek out of a door, or its enter/close into it,
a tap on that door starts no run and never knocks. Beat: counting the
mouse home until it leaves the doorway, which moves call 5's count timing
and R3's two-starts-in-one-frame guard.

31\. **`RUN_BOW` is measured from the nearer foot in drawn runner
lengths**: a shared constant for the runner's span in door widths, the
course's middle at least one such length nearer than the nearer foot, a
`mouse-run-clock` test holding it. Beat: the arbitrary `CLEARANCE` 0.12.

32\. **A run re-targeted from the ground is straight**: no bow and no
`RUN_LEAST`, taking its straight distance at `RUN_PACE` plus the hop; and
`retarget`'s last fallback (a door at any distance) counts the mouse
straight in, as `scattered` does, rather than running off screen. Beat: a
second loop from 30 px away.

33\. **`pnpm type-overlap`'s `side`** (`RunCourse` against `baking.ts`'s
`FaceFrame`) is a coincidence of names: the course's member is renamed for
what it means (the bow's sign).

## Calls from the operator's play

34\. **`z`/`c` strafe left/right while held, `.`/`/` step the octave down
/up, and Shift does nothing to the arrows** (the operator: «переключение
октав сделаем `.` и `/` … а `z` и `c` переделаем для стрейфа (убрав для
него шифт+стрелки) — тогда можно будет одновременно стрейфиться и
поворачивать, как в компьютерных играх»). A strafe key and a turning
arrow held together strafe and turn at once. `x` is left unbound. Read by
`event.code` as every key is (`KeyZ`, `KeyC`, `Period`, `Slash`).

35\. **A strafe by drag moves the ground smoothly under the finger** (the
operator: «при стрейфе перетаскиванием как-то дёргано всё идёт (с
клавиатуры нормально)», suspecting call 37 of bite 14, 7d0b6871; ccfff90d
"the ground stays under a moving finger" landed the same day). A defect:
the cause is traced against the commit before each suspect, then fixed;
no call 37 behaviour (the chase easing on the lift, a key cancelling it)
is given up for it.

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
- **W3** f089806, 099c778, 4cb519f — `type-overlap` green (`TapTimed` and
  `Looking` bases in `motion.ts`; the trip's `source`/`target`/`travel`);
  the probe's `windows(id)`, `worm(id)`, `topAt`'s `window:<id>:<i>`;
  `play-worms.ts` from `playHouse`'s end, worm checks green. Window reach
  and girth at their floors (16.1 px, ~5 px); the mushroom keeps 61% of its
  cap on tabL and 40% on phoneP. The worm reads, arches on the face, the
  target is plain; a wriggle splays the segments like beads (W4 fixes).
  The meadow play is red at `playHouse`'s door taps (a tap now runs; R6).
- **R6** 298d75e, 15a82e8, cd4b7ad — call 25 in `model/mouse-run-course.ts`
  (a curve between the door fronts, its middle a runner's length nearer
  than the nearer front, a sideways bow on a side fixed at the start;
  `RUN_LEAST` 1 s, `RUN_BOW` 1.8); `play-house`'s door taps accept a call
  home, meadow green on tabL. The flee frame's head is the front's own
  mouse, allowed by call 5. On the opening clump the runner still only dips
  ~22 px below the door with ~5 px across: the toward-eye push makes the
  length, so the sideways bow never starts (R7 makes the bow carry it).
- **W4** 357c94e, 1ba4f4d8 — the worm one body: 8 overlapping segments,
  inks laid before fills, the band a collar; the wriggle a small wave
  running head to tail (`WRIGGLE_DEPTH` 0.2, `WRIGGLE_LAG` π/4). Thicker
  and slower: girth 0.35 pane, floor 6 px, length 4.5 girths, pace 0.25,
  crawl 1.4–3.5 s (a three-window trip ~2.3 s), inch 0.4 s. Meadow green
  on tabL and phoneP.
- **R7** 72b5b69a, def40bb2, ff5d2108 — the bow sideways first, then
  toward the eye: on the opening clump the run is a loop out to one side
  and back, sweeping 63 px on tabL and 49 on phoneP, turning once at the
  loop's far end (`facingAlong`). `RUN_BOW` 1, `RUN_LEAST` 2.4 s (a whole
  run ~4 s), `RUN_PACE` 0.6. Runs from one door start `FLEE_EVERY` 0.8 s
  apart (W4's two mice on one spot were the back house's two, 0.4 s
  apart). Call 25's clearance at `RUN_BOW` 1 is unmeasured.
- **The worms' review** (5401128817, three findings, each replied to with
  its commit): **FW** 8c0c11ca — the head kept within 1e-9 of the path's
  end (call 27); 8ae79d1e — a peek no higher than its cap (call 26; a
  russula's peek is now as short as 0.21 of a body, a `to-check.md` line);
  4f1fec8e — the girth floor and `WINDOW_REACH` divided by the house's
  perspective zoom (call 28; `wormGirth` moved to `model/worm.ts`). Meadow
  green on tabL and phoneP.
- **Call 33** f57f2ec8 — `RunCourse.side` is `bowSign`; `type-overlap` green.
- **X3** 718ef2fc — call 31: `RUNNER_SPAN` 1.82 door widths
  (`RUNNER_REACH` back 0.9, ahead 0.92, which `paintRunner` draws to) in
  `model/mouse-run-course.ts`; `bowedPath` takes the `reach` its middle
  may not pass, `pathBetween` gives it the nearer foot less
  `RUN_BOW · RUNNER_SPAN · wider across`; `RunEnd` has an optional `foot`
  (`endOf`'s fourth argument), the front standing in without one. Until
  `mouse-runs.ts` passes `shown.foot` (handed to X1) the bow is a stem's
  half width deeper than the rule: the runner ~20 px lower on tabL, the
  sweep 63 px as R7's.

Open for wave 3: `pnpm type-overlap` reds in W2's files (`look` shared by
`Peeking` and `ShownWorm`, and `house-worm.ts`'s `Trip`); the meadow play's
phoneP fly-7 turn at 36.46 rad/s against 36.36 (call 42's bend allowance),
seen by R1 and not this bite's.
