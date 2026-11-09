# b3-b7c-look2 — items 3 and 4 of the B7c look, and item 2's brightness gap

Looked at e01403fb (`island/round-world`), the vova static export, headless
Chromium over CDP (swiftshader), 1440×900. Driver: `b3-b7c-look2/look.ts.txt`
(the predecessor's script, output dir moved, item 4 tracing every step, a `gap`
/ `gap2` probe added); `b3-b7c-look2/grounds.ts.txt` reads both worlds' ground
in Node from the same `openSphereWorld` the tile worker runs.

## 3. Noon and midnight over #1's opening — pass

`heavensAt` at 10° N 0° E: t 0 → sun 20.0° up (16:39 sun time); noon t 19.355 →
80.0° up, where-line "12:00 sun time"; midnight t 7.355 → −80.0°, "00:00 sun
time". The where-line reports sun time, not elevation; the elevations are
`heavensAt`'s, the function the scene lights by.

| frame                   | mean RGB         | look                                     |
| ----------------------- | ---------------- | ---------------------------------------- |
| `3-opening-orbit.png`   | 6.6/12.4/20.5    | lit disc, terminator side darker         |
| `3-noon-orbit.png`      | 8.3/15.7/24.1    | whole disc evenly lit, island in colour  |
| `3-midnight-orbit.png`  | 4.6/7.0/13.3     | disc dark navy, island faint (moonlight) |
| `3-opening-1000km.png`  | 88.3/99.8/67.3   | day, low-sun shading                     |
| `3-noon-1000km.png`     | 140.1/152.2/99.9 | full day, flat overhead light            |
| `3-midnight-1000km.png` | 17.5/23.3/19.7   | dark, shapes readable, snow blue-grey    |

Noon/midnight brightness ratio at 1,000 km: ~7×. Nothing broken: no seams, black
tiles or banding in any of the six.

## 4. `hashchange` to another world with a pose — pass; nothing to fix

**The script's "high Earth spots" are not high on #0.** World #0 is not pinned
(`PINNED_ROWS` holds only `'1'`), so it is a rolled world opening at
`EARTH_OPENING`'s coordinates, not Earth: all seven spots are sea floor on #0
(−3,280 to −3,543 m), so the eye's surface there is the sea and the switch is
trivial. The trace ran instead at #0's seven highest 1°-grid points (1,883–2,099
m), each sea on #1, so the switch starts from floor 0 under ~2,000 m of new
ground: the worst case.

Per spot, from `#1@spot,2,90,0` to `#0@spot,2,90,0`, one 1/60 s `step` per read:

| spot (#0 ground)   | field lands after | eye vs #0 ground before | first step after landing |
| ------------------ | ----------------- | ----------------------- | ------------------------ |
| −40, 65 (2,099 m)  | 2,506 ms          | −2,097 m                | +2.0 m                   |
| −5, −108 (2,084 m) | 1,966 ms          | −2,082 m                | +2.0 m                   |
| −36, 86 (2,031 m)  | 2,287 ms          | −2,029 m                | +2.0 m                   |
| −31, 75 (1,961 m)  | 1,805 ms          | −1,959 m                | +2.0 m                   |
| 8, −163 (1,960 m)  | 1,861 ms          | −1,958 m                | +2.0 m                   |

(10, 119 and 19, −146 were framed but their trace output was lost to a run
timeout.)

- **Before the field lands** (the worker's build, `buildMs` 1,665–2,268 ms):
  `setWorld` keeps #1's `groundAt` and `placeAt` takes the floor from it, so the
  eye sits 2 m over #1's sea, numerically ~2,000 m under #0's ground. Nothing of
  #0 is drawn then — `view.clear()` emptied the tiles — so the frame is the
  ocean globe and a horizon (`4-<spot>-before-field.png`): no view from inside
  terrain.
- **From the first step after it lands** the eye is exactly 2 m over #0's
  ground. `step` eases the floor up (`k = 1 − e^(−(1/60)/0.6) = 0.0274` a step)
  and lifts the height to `surface + 2 − floor`: the where-line's height reads
  `0.9726 · s + 2` at step 1 (−5, −108: 2,028.6 → s = 2,083.7 m, Node's ground
  2,084 m; −31, 75: 1,908.8 → 1,960.5 m, Node 1,961 m), and decays by 0.9726 a
  step to 72–76 m at step 120 (2 s), which is the floor still catching up, not
  the eye rising. Settles in under one frame, well inside the ~1 s.
- Step-1 frames are flat sea colour (`4-<spot>-step1.png`): the field has just
  landed and no #0 tile is filled yet. Step 120 shows #0's terrain from 2 m
  (`4--5_-108-step120.png`: snowy upland under day sky).

**One side effect, not fixed** (outside a one-line change): the where-line's
`height` is `eye.height`, metres over the **floor**, and the floor takes ~3 s to
catch up after the switch. A `P` in that window copies, say, 1,000 m, and that
hash reopens the eye 1,000 m over the ground where it was 2 m. The same holds on
any flight over steep ground, where the floor lags by `FLOOR_SECONDS`. A fix
records `eye.floor + eye.height − surface` in `poseOfEye`, which then needs
`groundAt` — a decision for the owner of `eye-pose.ts`.

## Item 2's brightness gap — a stale light uniform in the harness, not a lag a player sees

Replaying item 2's A (`moveTo`, `turnTo`, `setTime(2.5)`, `setHeight`, 5 steps
in one `evaluate`): `gap-1-as-item2.png` mean 47.4/71.6/59.4, the predecessor's
bright frame; 5 more steps in a second `evaluate` (`gap-2-…`) 15.6/25.1/23.2,
the reopen's correct darkness; after that no change (`gap-3-…`, `gap-4-…`). In
`gap2`, 5 steps then 3 s idle then a capture with no step is still bright
(`gap-5-…`); one step in a new task makes it dark (`gap-6-…`). So it is no stale
screenshot: the drawn frame itself is lit by the old sun.

Cause: three 0.187's `AnalyticLightNode` updates its uniforms once per
`NodeUpdateType.FRAME`, and the frame id advances only in the renderer's own
`requestAnimationFrame` (`renderers/common/Animation.js`). Every `render()`
inside one animation frame reuses the light direction of that frame's first
render. Under `?play` the harness renders many times in one task, so after
`setTime` the lights keep t 0's sun until a render in a later task. Live, one
render per animation frame, the lag is at most one frame. A harness fix: let a
frame pass (`await new Promise(requestAnimationFrame)`) before the last step of
`shoot` in `src/island/scripts/lib/play-tab.ts`, or after `setTime`.
