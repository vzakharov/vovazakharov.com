# Walk — state of the package, newest first

## 2026-11-13 ~12:30Z — code done, waking judged on a coarse strip, climb and jumps being shot

Branch `claude/cube-intro-walk`. It contains the lead at 874eab51 and core's
turned interior (2f4ab3ba); the lead merged this branch's 877a26f5.

### Done

- **The way out.** A body on floor 1 walks through the doorway's opening and
  nowhere else along that wall (`closedWalls` in `features/player/model/body.ts`
  reads the wall and span from `ROOM_DOORWAY`); past the sill it steps off and
  falls 3.6 m to the sand, at whole or half height (`stepOff` in `scenes.ts`,
  `isPastSill` / `onSill` in `threshold.ts`). The ladder is gone from the
  frame a body first comes in by it (`ladderGone`).
- **The turned interior.** Nothing in the walk assumes the doorway is the
  room's east wall: the sill's wall, the yaw across it (`yawToShell` /
  `yawToRoom`), the arrival spot (derived in W from `DOORWAY_BOX`) and the
  hands' palms (`turnedToRoom`) all go through core's seam. Tests in
  `threshold.test.ts` follow the doorway wherever the turn puts it.
- **The waking** (`waking` in `scenes.ts`): head on sand's `WAKE_AT`, lids
  part at 1.3 s, shut, open for good by 3.4 s; elbow, sitting, standing at
  10.1 s, the turn 12.2 → 14.1 s ending on the cube whole in frame, 15.3 s in
  all. No scripted splash; its four footfalls carry no ground of their own and
  take it from `land.level` at the frame they fall in (`footed` in
  `abroad.ts`).
- **The climb** (`ascent` in `scenes.ts`): the real `DOOR_LADDER`, a hand and a
  foot to every rung with `rung` cues, hands drawn on the rungs with pill's
  `grippingHand` (`climbing.ts`), ending inside looking at the pill's shelf —
  a test holds the stage's shelf against the planted world's pill.
- **No legs, no trunk, no shadow figure.** By the operator's word the body
  draws nothing of itself out of doors but its hands on the rungs;
  `legs.ts`, `standingOf` and `standingWithin` are deleted.
- **Sound's eye.** `hearing.outside` gets the scene's real eye: it reads as
  inside from the frame it passes the cube's east face (`whereOf`), which a
  test holds happens once per climb.
- **The floor badge** shows nothing for an eye out of doors, a script's too.

### Half-done

- **Strips.** Only the waking's coarse pass is committed
  (`frames/walk/`, with its README). The climb is being shot at the same
  2.4 s step; `jump` and `jump-small` were shot and judged good before the
  interior turned and the sky changed (frames only in a container's `tmp/`),
  and are owed again on this tree.
- **The climb is unjudged on the turned interior**: whether the hands sit on
  the rungs, and whether the last look lands on the shelf.

### Owed

- Climb, jump and jump-small strips with README lines; a finer waking pass
  (`--every 1.2`) if the coarse one hides a bad beat between 4.8 and 9.6 s.
- `/dry` and `/tend-prose` over the walk's diff, then the final report.
- Not the walk's, still red in lint here: pill's `turnOf` namesake in
  `features/player/model/take.ts` against `shared/sky/sky-fit.ts`.

### How to shoot a strip again

```
pnpm scenes:cube --scenes waking,climb,jump,jump-small --every 2.4 \
  --out /abs/path/to/tmp/cube-scenes/x > tmp/scenes.log 2>&1
```

Run it in the background: the first frame comes after about ten minutes of
shader compiling on the software renderer, then one every one to three
minutes. Do not edit `src/` while it runs — the dev server reloads the page.
The log holds each frame's eye and lens. Frames become strip files with
`convert <png> -resize 1280x -quality 80 <name>-<seconds>.webp`.

### Gates at 877a26f5

Typecheck clean; `features/player` tests 124 pass; `pnpm type-overlap`,
`check:masd`, `masd:clusters`, `check:cycles` clean; eslint clean on the walk's
files but for the namesake above.
