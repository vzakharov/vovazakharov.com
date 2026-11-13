# The scenario round: items, measurements, who wrote what

Moved out of `docs/plans/cube-intro.in-progress.md` whole, which points here.

Ticked is written, committed and pushed (aa0b4008 the scenario, b5ecc5ab the
quality, the bench before them); none of it has been seen in a browser — the
operator walks slot 2. As written: the climb's look up is 0.3 rad where it was
0.5, so a hand stays in frame; the aside is 0.87 rad at 0.7 of the rungs' time;
the eye is 0.2 m behind the ladder's line at its own height; the refused look
leans at 0.7 s, holds to 1.9 s, is back by 3.2 s, its line from 1.0 s. The
quality is three levels on `Q` (8892581b, `pages/cube/ui/quality.ts`: the
levels, the frame-rate mark and the hint; the console switch is gone). The
bench's frame (`pnpm outside:cube --eyes in-beam`) is still to be shot. 2b is in
as ec122481 (the double press is two Shift keydowns within 0.3 s, in `pace.ts`),
and a run's stride is 2.5 walking ones (bb8e5531, `stridesIn` in `step.ts`); 9
is in as 346448f9 (`shared/sea/water-body-wgsl.ts`), its frames seen: dark teal
above and below the surface's line, the bed fading in green. Left by 9 and not
taken up: sand between the still sea and 0.9 m under it is drawn dry for an eye
inside a crest but over the still level; an eye under water looking steeply up
sees the sky. All of it is in `src/cube/features/player/model/` unless a path
says otherwise; read `scenes.ts`, `abroad.ts`, `roam.ts`, `threshold.ts` and
`src/cube/pages/cube/ui/walk.ts` first, they are short. After it: commit, push,
republish slot 2, then `/finalize` (the two red `source` checks on the way).

- [x] **1. The player turns to the cube, and the hero says "hm?".**
  - `scenes.ts` `waking`: drop the beats at 12.2, 14.1 and 15.3 and the steps at
    12.1 and 13.2, so it ends at 10.9 looking out to sea; `cubeHigh` goes,
    `side` stays.
  - A new `sight.ts`: `seesWhole(outside, box)`, true when every corner of the
    box is ahead of the eye and within a square of view of half-angle 0.52 rad,
    which is inside the page's 70° field of view on any screen.
  - `abroad.ts`: `Mind` gains `sawCube`; free, the first frame `seesWhole` holds
    for `stage.cube` adds `{ cue: 'say', moment: 'wonder' }` and sets it.
    `asleepOn` starts it false, `steppingOut` true, `roamingFree` as
    `ladderGone`.
  - `player.ts` `Cue`: `'wonder'` joins the `say` moments. Voice
    (`features/voice/model`): `'wonder'` joins `MOMENTS` in `script.ts`,
    `vocal.ts` exports `wonder = (dice) => line(asked(dice))`, `line-for.ts`
    `LINES` takes it.
- [x] **2. Walking by default on the island.** `roam.ts`: the pace is
      `input.walking ? RUN_SPEED : WALK_SPEED` — Shift runs out of doors, where
      indoors it walks; say so in `Input`'s docstring in `step.ts`. The swim's
      pace stays `RUN_SPEED * SWIM_SHARE`, and a footfall's strength is over a
      run's pace, so a walk sounds softer. `roam.test.ts` and `abroad.test.ts`
      pin 3.5 m/s.
- [x] **2b. Walking everywhere, Shift for the other pace.** After the two
      scenario subagents return (they are writing 2 as above): `Input.walking`
      becomes `running`, true on a frame the body runs; `step.ts` and `roam.ts`
      both take `running ? RUN_SPEED : WALK_SPEED`.
      `features/player/ui/input.ts` keeps the standing pace (walk at first) and
      reads `running = standing run XOR Shift held`; two Shift presses within
      about 0.3 s flip the standing pace. A `Way` `'run'` — "Hold Shift to run,
      double-tap to keep running" — shows on a floor of 3 or deeper while no
      other hint does, until Shift is first pressed. `scripts/play-cube.ts`
      passes `walking: true` indoors and no longer needs to.
- [x] **3. Forward again before the doorway.** `scenes.ts` `ascent`: the yaw
      used to drift to the shelf all the way up, which is the look aside the
      operator liked. Make it explicit — a yaw key aside at about three quarters
      of the climb, back to the ladder's `yaw` at `over`, and the arrival
      keeping that `yaw` with elevation 0. `Stage.shelf` then has no reader: it
      goes from `Stage`, `intro-stage.ts` (with `SHELF_*` and the `toWorld`
      import), `abroad.test-kit.ts`, and the shelf tests in
      `intro-stage.test.ts` and `scenes.test.ts`.
- [x] **4. No step off the sill the first time.**
  - `scenes.ts`: `lookingDown(from, scale, stage)` — from the sill, lean out
    over the edge, look down at where `ladder.foot` stood, hold, say `wonder` at
    about 1.3 s, then back to the gaze it had, half a metre inside. `GONE_SHOWS`
    is the second its line appears at.
  - `abroad.ts`: `Playing.into` gains `'sill'`; `entered` is true for any ending
    that is not `'island'`; `handsAbroad` stays on `'cube'`;
    `refusedAt(from, scale, stage, seconds)` plays it with `ladderGone` and
    `sawCube` true; `findsLadderGone(abroad)` is true from `GONE_SHOWS`.
  - `walk.ts`: a `sill` state `'unseen' | 'seen' | 'free'`. Leaving while
    `unseen` saves `player`, plays `refusedAt` and goes `seen`; the scene's end
    restores the saved player at the shot's `u`, `v` and gaze (not
    `standingAt(poseWithin(...))`, which would make a shrunk body whole). `seen`
    becomes `free` on a frame inside with no `walk` or `strafe`, so a held key
    is not a second try; leaving while `free` is `steppingOut`.
  - `Way` gains `'gone'`, shown while `findsLadderGone`;
    `pages/cube/config/messages/en.json` `ways.gone`: "The ladder is gone".
- [x] **5. A fragment once the waking has played.** `pages/cube/lib/start.ts`:
      `Start.ashore` becomes `'asleep' | 'awake' | null`; the fragment `awake`
      (not base64url of an address's length, so `decodeAddress` never sees it)
      starts `'awake'`. `abroad.ts`: `awakeOn(stage, seconds)` is `roamingFree`
      from the waking track's last shot, the ladder standing. `walk.ts` writes
      `awake` with `writeFragment` in the frame the waking scene ends, when
      `earned`.
- [x] **6. The step off writes nothing.** Already so — `follow` runs only in the
      indoor branch — so it needs a test or a comment at most, and no write
      added by 5 after the body has been inside.
- [x] **7. The bench in the beam** (above).
- [x] **8. Low quality by default, the full one on a console command.** What the
      operator's five frames with the meter say (M2 Pro, a window of about
      1785×1150 CSS pixels at two device pixels each, `scene` stage): waking,
      half sand and half sky, 59.5 ms; the sea filling the lower half, 43.8 ms;
      floor 1's room with the outside seen through the doorway alone, 42.6 ms;
      the cube close up, 28.2 ms; floor 2, 3.6 ms. So the cost is the sand's and
      the sea's fragments, per pixel, and floor 1 pays all of it for pixels its
      walls then cover: the outdoor layers are drawn behind the rooms with no
      depth to cull them, and the sea writes `frag_depth`, which rules out the
      early test. That reordering is the next round's. This round: the canvas is
      one pixel to the CSS pixel unless raised (`resize` in `cube-scene.ts` is
      the one place the ratio is read), and a function on `globalThis` raises it
      to the screen's own and lowers it again.
- [x] **10. Hands on the rungs.** On the preview the climb shows no hands but
      one stub for a second. Measured (`tmp/probe-hands.ts`, gone with the
      container: the track sampled every 0.28 s, each hand's rung against
      `climbing.ts`'s `ARM`): the hand is out of its arm's reach on all but two
      samples of the climb. The ladder leans a quarter of a metre in for each
      metre up, so at the eye's height, `EYE_ON_LADDER` over the feet's rung, it
      is 0.375 m farther than at the feet, and `OFF_LADDER` 0.4 puts the eye
      0.78 m from it against an `ARM` of 0.7. Bring the eye to about 0.2 m
      behind the ladder's line and check every sample of the climb proper has
      both hands in reach; the old drift of the gaze also took them out of the
      frame, which item 3's gaze cures at the climb's two ends.
- [x] **9. No grey under a wave.** Reproduced:
      `pnpm outside:cube --at 45,0.0,30 --yaw 200 --pitch -8` (three minutes on
      this machine's software GPU) shows the upper half dark teal — the
      surface's underside, `seaFragment`'s `DROWNED` branch — and the lower half
      a flat pale grey with faint vertical streaks: what lies under the horizon
      behind the water with no water drawn over it. The sky's backdrop under the
      horizon is the horizon's own haze (`clearSky` lifts `dir.y` to 0), and the
      sand's mesh draws its bed in air. Whatever an eye sees under the horizon
      that the sea's surface did not cover is seen through the water's body, so
      it should take the body's colour with distance. Not grey is the bar.

### What the outside costs: on the board

The operator asked whether the sand is drawn the best way («а, не к исправлению
сейчас а вообще, вообще то как мы рисуем песок -- оптимально? лет ли вообще
других подходов?»), was told no, and on the ways down being written here as a
later round's:

> "раундов" не надо, у нас есть борда с todo и идеями, вот туда и надо писать

So what is to do and not this PR's goes on the cube's board as an orange "To do"
sticky, never into this plan: the outside's cost is `intro-todo-*` in
`src/cube-board/app/config/cube/intro-late.yaml`.

### Who writes it

The operator, the round under way:

> кстати я думаю тут уже наверное не такая зубодробильная работа, делай наверное
> через опус-подагентов

So three subagents on Opus in the lead's own working tree, each on files the
others do not touch and committing nothing — the lead commits each package as it
returns: **scenario** (1–6 and 10: `features/player/model`,
`features/voice/model`, `pages/cube/lib/start.ts`, `pages/cube/ui/walk.ts` and
`cube-canvas.tsx`, the page's messages), **quality** (8:
`pages/cube/ui/cube-scene.ts` and a module of its own), **depths** (9:
`shared/sea`, `shared/sky`, `shared/sand`). Then the two red `source` checks, by
a fourth.

Details the scenario's items leave out:

- **1**: `seesWhole({ eye, yaw, elevation }, { min, max })` — for each of the
  box's eight corners, with `d` the corner less the eye:
  `along = dx·cos(yaw) + dz·sin(yaw)`, `right = −dx·sin(yaw) + dz·cos(yaw)`,
  `ahead = along·cos(el) + dy·sin(el)`, `up = dy·cos(el) − along·sin(el)`; false
  if `ahead ≤ 0` or either of `|right|`, `|up|` passes `tan(0.52)·ahead`.
- **2**: the speed is
  `lerp(pace, RUN_SPEED·SWIM_SHARE, smooth(ramp(depth, …)))·ROOM_METRES·scale`
  with `pace = input.walking ? RUN_SPEED : WALK_SPEED`.
- **3**: the old track had no yaw key between the foot and the arrival, so the
  gaze turned from the ladder's line (west) towards the shelf (south) all the
  way up, 73° off by the sill. Keep a look aside to that side, of about 50° at
  about 70% of the climb, eased back to the ladder's `yaw` by `over`.
- **4**: `lookingDown` beats — 0: `from`, roll 0; about 0.7 s: the eye out to
  `cube.max[0] + 0.25·scale`, yaw and elevation towards `ladder.foot`
  (`nearest(…, from.yaw)`); held to about 1.9 s; about 3.2 s: the gaze it had,
  half a metre of a whole body's inside the sill. Its one cue is the `wonder` at
  about 1.3 s; no step cues, which `outsideOf` would sound as sand. `GONE_SHOWS`
  about 1.0. In `walk.ts` the scene's end is
  `player = { ...saved, pose: { ...saved.pose, u, v, yaw, elevation } }` from
  `poseWithin(shot)`, and the frame it returns carries `takenOf(player)` and
  `handsOf(player)` as an indoor frame does.
- **5**: `awakeOn(stage, seconds)` is
  `roamingFree(shotAt(waking(stage), waking(stage).runs), 1, stage, seconds, false)`;
  `follow` stays null until the body climbs in, and nothing is written on the
  step off (6).
