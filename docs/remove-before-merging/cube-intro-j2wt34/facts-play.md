# Cube: play fact sheet (for the intro + pill build)

Read from the tree at `e557f266` on `claude/cube-intro-j2wt34`. Paths are under `/home/user/vovazakharov.com/`.

**Coverage, stated up front.** Sections 1–5 and 8 were read line by line. **Sections 6 and 7 were NOT read** — the reader ran out of context before opening `src/cube/features/sound/**`, `features/voice/**`, `features/decor/**`, `features/happenings/**`, `entities/world/model/geometry.ts`, `entities/theme/**`, `pages/cube/lib/{mesh,shader,room-look}.ts`, `pages/cube/ui/renderer.ts`, `scripts/play-cube.ts`, `scripts/lib/cube-page.ts`. What those sections say is what the already-read callers show, each line marked **[seen]** (read in a caller) or **[unread]** (inferred from a grep line or a name). A fresh reader should finish 6 and 7 from the file list given there.

## 0. Units and axes (everything else leans on these)

- Lengths are **room sides of the floor the body stands on**. Floor 1's room side is 5 m (`FLOOR_ONE_SIDE = 5` in `pages/cube/ui/sale-offer.tsx`); each floor's is half the one above's. Room height is `ROOM_HEIGHT` from `src/cube/shared/lib/room-shape.ts` [unread; `lever.ts` calls 0.5 "the room's" height, i.e. 2.5 m on floor 1].
- Floor `n` counts down from 1 at the top and is `2^(n-1)` rooms across (`roomsAcross`, `isRoom` in `entities/world/model/room.ts`). **Floor 1 is one room, `{ n: 1, x: 0n, y: 0n }`**, all four sides the cube's boundary.
- `Room = { n: number; x: bigint; y: bigint }` — `x` east, `y` south. `InRoom = { u, v }` — `u` east, `v` south, each in `[0, 1)`.
- `Pose` (`entities/world/model/pose.ts`) = `Room & InRoom & { yaw; elevation; scale; eyeAbove }`. `yaw` radians, **0 looks east (+u), π/2 looks south (+v)**, so it grows clockwise seen from above and a right turn adds to it; `step` wraps it into `[0, 2π)`. `elevation` radians above the horizon, clamped to ±89° (`MAX_PITCH`). `scale` 1 = a person of this floor, 0.5 after a shrink. `eyeAbove` eye height over the slab in room sides, negative while falling.
- **There is no roll.** `lookAlong` in `pages/cube/lib/camera.ts` builds the view from `forward(pose)` and a fixed world up `[0, 1, 0]`. A head lying on its side, or tilting as it rises, needs a new pose field and a camera change.
- The eye's frame (what a mesh is built in): origin at the north-west corner of the eye's room on its slab, **x east, y up, z south** (`entities/world/model/frame.ts`: `footprint`, `placed`, `eyeInFrame`, `slabHeight`, `DROP`, `descend`). A room's own frame is the same with side 1 (`Setting` docstring, `inPlace` in `setting.ts`).
- Camera: `FOV_Y` 70°, `NEAR = 0.004`, `FAR = 24` room sides, both times the eye's scale; reversed depth. `FAR` is also how far `sight()` builds rooms.
- Body constants (`features/player/model/step.ts`, `body.ts`): `EYE_HEIGHT = 0.32` (1.6 m), `RUN_SPEED = 0.7` /s (3.5 m/s, the default pace), `WALK_SPEED = 0.28` /s (Shift held), `TURN_RATE = π/2` /s, `TILT_RATE = π/3` /s, `BODY_RADIUS = 0.06`, wall half-thickness `WALL_HALF = 0.012`.

## 1. The frame loop from input to pose

**`bindInput(target: HTMLElement, onError: (error: Error) => void): InputBinding`** — `features/player/ui/input.ts`. `InputBinding = { read: () => Input; dispose: () => void }`.

- Keys are matched by **physical position** (`KeyboardEvent.code`), listened on `globalThis` `keydown`/`keyup`; ignored while Ctrl/Meta is down or the target is a text field (`isTextField`). `blur` clears held keys.
- `AXES`: `KeyW`/`KeyS` → `walk` ±1; `KeyD`/`KeyA` → `strafe` ±1; `ArrowRight`/`ArrowLeft` → `turnKeys` ±1; `ArrowUp`/`ArrowDown` → `tiltKeys` ±1. `ShiftLeft`/`ShiftRight` → `walking: true`.
- **`KeyE` is already `pull`** (`const PULL = 'KeyE'`): set on a non-repeat keydown, `preventDefault`ed, a one-shot cleared by the next `read()`. The same press also presses a for-sale sign (below).
- Typing `goto` + two digits (`GO_TO` regex over the last 6 codes, `Digit` or `Numpad`) sets `goTo` to that floor, one-shot.
- Mouse: a click on `target` requests pointer lock; only while locked does `mousemove` add `movementX * 0.0025` to the yaw delta and subtract `movementY * 0.0025` from the elevation delta.
- **No `KeyY`/`KeyN` handling exists.** Every keydown code does go into the `typed` buffer for `goto`, harmlessly.

**`Input`** (`features/player/model/step.ts`), a closed type built in three places — `bindInput.read`, the `STILL` constant, and the test kit's `pull`/`ahead`:

```ts
type Input = {
  walk: number;
  strafe: number;
  turnKeys: number;
  tiltKeys: number; // each in [-1, 1]
  yawBy: number;
  elevationBy: number; // radians to add this frame
  walking: boolean;
  pull: boolean;
  goTo: number | null;
};
```

**`step(pose: Pose, input: Input, dt: number, walls: Walls): Pose`** — turns, then moves `(forward·cos − right·sin, forward·sin + right·cos)` in `(u, v)` at `speed × pose.scale × dt`, diagonal normalised; sets `eyeAbove = EYE_HEIGHT * scale`; collides and changes rooms through `walk()` in `body.ts`. Throws `RangeError` on a negative or non-finite `dt`.

**`walk<P extends Pose>(pose: P, du: number, dv: number, walls: Walls): P`** (`body.ts`) — sub-steps under half the body radius, pushes out of `closedWalls(pose, walls)` (unit segments on `u = 0|1`, `v = 0|1` of the 3×3 rooms around), rebases `u`/`v` into `[0, 1)` and bumps `x`/`y`. `Walls = { isOpenEast(n, x, y); isOpenSouth(n, x, y) }` (`entities/world/model/walls.ts`). **It only knows rooms on a grid** — island walking is new code, or a `Walls` over a fake floor.

**`play(player: Player, input: Input, dt: number, walls: Walls, here: Holed | null): Player`** — `features/player/model/play.ts`.

```ts
type Player = Posed & {
  act: Act | null;
  lever: Pulled | null;
  sincePull: number;
  strode: number;
  cues: readonly Cue[];
};
type Act = { actFor: number } & (
  | (Looking & { act: 'shrinking'; yaw: number; elevation: number }) // the resting gaze
  | { act: 'falling'; from: InRoom; to: InRoom }
  | { act: 'landing' }
);
type Holed = Looking & { quarter: Quarter; lever: Lever };
type Cue =
  | { cue: 'step'; strength: number }
  | { cue: 'lever' }
  | { cue: 'shrink' }
  | { cue: 'jump' }
  | { cue: 'landing'; speed: number }
  | { cue: 'say'; moment: ShrinkMoment | 'landing' };
```

Dispatch order inside `play`: (1) `act.act === 'shrinking'` → `shrink()`; (2) `'falling'` → `fall()`; (3) `act === null && input.goTo` in `1..DEEPEST_FLOOR` → `standingAt({ ...arrivedOn(goTo), yaw, elevation })`; (4) `act === null && input.pull && here && canPull(pose, here.lever)` → starts the shrink; (5) otherwise `walk()` (private, also runs the `'landing'` knee dip for `LANDING_TIME = 0.5` s).

- `standingAt(pose): Player`, `isStanding(player)` (`act === null`), `pulledOf(player): Pulled | null`, `arrivedOn(n): Pose` (middle of room `(0, 0)`, `u = v = 0.5`, `yaw = 0` i.e. **looking east**, whole).
- `shrink()`: feet rooted (`noWalk`), `scale = scaleAt(t) = 2 ** -rise(t, 0, SHRINK_TIME)` with `SHRINK_TIME = 2`, `SMALL = 0.5`; ends at `max(SHRINK_TIME, spanOf(look))`.
- Small body walking onto the hole (`onHole`, `fall.ts`) → `'falling'` with a `{ cue: 'jump' }`; at `LAND_AT` → `'landing'` on the floor below as a whole body, cues `landing` + `say 'landing'`, and `lever`/`sincePull` reset (it goes through `standingAt`).
- Footfalls: a `step` cue every `STRIDE = 0.15` own room sides, `strength = min(1, speed / RUN_SPEED)`.

**How `onFrame` hands the pose to the scene** — `pages/cube/ui/cube-canvas.tsx` `walk()` → `mountCube(canvas, options)` in `cube-scene.ts`.

- The scene owns the pose. `type FrameHook = (pose: Pose, seconds: number, signOf: SignOf) => Frame`, `type Frame = Posed & { pulled: Pulled | null; moving: readonly Quad[] }`. `tick` calls it once per animation frame with `seconds = min(elapsed, 0.1)`.
- The page's hook: `read = input.read()`; `controls = offering() ? STILL : read`; `player = playFrame({ ...player, pose }, controls, seconds, plantedWalls, holedHere(pose))`; `hearing?.body(cues, moved)`; `reach(moved, signOf, controls.pull && standing)`; `follow?.(moved, standing, seconds)`; returns `{ pose: moved, pulled: pulledOf(player), moving: handsOf(player) }`.
- `holedHere = plantedHoled(setFailure)` (`features/player/model/holed.ts`): `(pose) => Holed | null`, resolving each room's hole **asynchronously** on first ask — a room reads as unholed until the answer is in.
- `render()`: `at = inEyeRoom(pose)` (descends once `eyeAbove < 0`); the mesh is keyed `roomKey(at)#generation` and built by `build(pose, copy, bought)` in `cube-mesh.ts` (async: `sight` → `holesOf` → `faces` + `furnish` + boards); until built, the previous room's mesh is drawn if within one floor. Then `renderer.draw({ viewProjection, eye, clear: airAt(depth), lens, ...clock })`.
- **A mesh is always "the rooms seen from one room of the maze".** `mountCube` takes `start: Pose`; there is no outdoors, sky, ground or cube exterior anywhere in `build`. `clear` is the theme's `air` colour.

## 2. Scripted looks today

**The shrink look** — `features/player/model/look.ts`.

```ts
type Look = { hands: number; glance: number; turn: boolean; side: 1 | -1; moment: ShrinkMoment; sayAt: number };
type Looking = { shrinkLook: Look };
type ShrinkMoment = 'first-shrink' | 'shrink';
const FIRST_LOOK: Look = { hands: 3.3, glance: 1.5, turn: true, side: -1, moment: 'first-shrink', sayAt: 2.2 };
looks(seed: string): (room: Room) => Look      // n === 1 → FIRST_LOOK; deeper: rolled per room, often no look, sayAt = LEAD
spanOf(look): number                            // LEAD + hands + glance, or 0
glimpse(look, t): Glimpse                       // { aside, toHands, handsUp, turned }
gazeOf(glimpse, yaw, elevation): { yaw, elevation }
```

- Timeline constants: `LEAD = 0.4` s ("the lever's swing" — nothing happens to the eyes before it), `DROP_GAZE = 0.6`, `TURN_OVER = 0.7`, `HANDS_ELEVATION = -1` rad, `AROUND = 0.8` rad. Easing is `rise(t, from, to)` and `hump(t, [a, b, c, d])` in `features/player/model/ease.ts` over `ramp`/`smooth` in `shared/lib/ease.ts`.
- How the gaze is taken: the act stores the resting `yaw`/`elevation`; each frame `gaze = gazeOf(glimpse(look, t), yaw, elevation)` while `t < span`. Mouse input during the look is thrown away (`step` runs from the resting gaze with `noWalk`), and the frame the look lets go on starts from the resting gaze. **This is the pattern for every new scripted camera beat**: a new `Act` variant holding its own clock and resting gaze, a handler, one line in `play`'s dispatch.
- The gaze script moves `yaw` and `elevation` only. Eye **position** during a look is never scripted today except `eyeAbove` (shrink, fall, landing dip) and the hop's `u`/`v` (`hopAt`). Rising from lying, bending to look under the cube and climbing a ladder all need scripted `u`/`v`/`eyeAbove`, which the pose can carry.

**Hands** — `features/player/model/hands.ts`; exported API is only `handsOf(player: Player): Quad[]`.

- Returns `[]` unless `act.act === 'shrinking'` and `glimpse(...).handsUp > 0`. So hands exist **only** inside a shrink's look; there is no way to ask for them otherwise.
- A hand = a `fabric` sleeve (7 `Slice`s, 28 cm of forearm), a `skin` palm (8 slices), five `Digit`s (index..little via `finger()`, plus `THUMB`) each a `loft` of rings with a painted nail (`NAIL.paint = 0xe9cfc6`). Shape is in **centimetres of a whole body**, `CM = 0.002` room sides, times `scale`. Built by private `hand(wrist: Vec3, axes: Axes, scale: number, room: Room): Quad[]`, `Axes = [along fingers, across towards thumb, through out of the palm]`.
- Posed over time by two numbers only: `handsUp` (wrists rise from `LOWERED = 0.09` under to `HELD = [0.07 ahead, 0.034 aside, -0.04 below]` of the eye, in view axes) and `turned` (rotates `across`/`through` by `turned × π`: palms up → backs up). Both hands are mirror images (`side = ±1`).
- **Fingers do not articulate**: each digit's `curl` is a constant in `HAND_DIGITS`. A pinch round a pill, a hand travelling to the mouth, one hand acting alone, or a hand reaching to a wall are all new: `hand()` needs a curl/pose parameter and `handsOf` a second driver besides `glimpse`.
- Reusable as is: `loft(rings, room, { surface, paint?, sides, arc? })` and `Ring = { centre, wide, thick }` (`entities/world/model/loft.ts`) for any rounded limb — legs, feet, a pill capsule; `box(corner, [p, q, r], room, surface, paint?)` and `face(...)` (`quad.ts`) for a shelf; the view basis in `handsOf` (`ahead`, `right`, `up` from yaw/elevation).
- **No body exists**: no legs, feet, torso. A body seen from its own eyes is new geometry.

**"Moving" scenery** — `Frame.moving: readonly Quad[]`: quads for this frame alone, **each in its own room's frame** (side 1, origin the room's NW slab corner) and tagged with that `room`. `cube-scene.ts` concatenates `moving` (the page's), `staged` (the play hook's `setPose(pose, moving)`), and the happenings' quads, **drops every quad whose `room.n` is not a floor the current mesh prepared shaders for (`lenses`)**, then `renderer.uploadMoving(mesh.stood(seen))`. `mesh.stood` groups by room, `inPlace(…, placed(pose, room))`, `pack(…, lookOf)` — so a moving quad is lit by its room's look. A quad needs a real `Room` to be drawn at all.

`Quad = Facet & Stuff`; `Stuff = { surface: Surface; paint?: number /* 0xRRGGBB */ }`; `Surface` is in `src/cube/shared/lib/surface.ts` [unread]. Surfaces seen in use: `skin`, `fabric`, `trim`, `plate`, `handle`, `paper`. Whether a new surface (pill, sand, water) is a one-line addition or shader work is in `pages/cube/lib/shader.ts`, `lib/mesh.ts` and `entities/theme/kit` [unread].

## 3. The lever end to end

**Place** — `entities/world/model/lever.ts`.

- `leverOf(rolled: RolledMaze, room: Room, quarter: Quarter): Lever`; `Lever = WallMounted & { mount: 'x-wall' | 'y-wall' | 'post' }`; `WallMounted = { at: InRoom; facing: InRoom }` (`at` = the plate's foot on the wall line, `facing` a unit vector into the room).
- Rule: level with the hole's middle (`holeMiddle({ qx, qy }) = ((qx + 0.5) / 2, (qy + 0.5) / 2)`, i.e. 0.25 or 0.75). If the hole quarter's outer wall across `u` is closed → `x-wall`, `at = { u: qx, v: holeV }`; else if the one across `v` is closed → `y-wall`, `at = { u: holeU, v: qy }`; else a `post` in that corner.
- **Which rooms**: every room with a hole — exactly one per floor, on every floor but the last (`holeQuarter(world, n, x, y)` in `hole.ts`, async, SHA-256 commitments in `config/world.json`). On **floor 1** the room's walls are all boundary, so the mount is always `x-wall`: the west wall if the hole is in a west quarter (`qx = 0`), the east wall if `qx = 1`. The planted quarter was not computed here; `holeQuarter(planted, 1, 0n, 0n)` gives it (`scripts/play-cube.ts` lines 80–107 does exactly this).
- Height and size: `PLATE_HEIGHT = 0.2` (1 m on floor 1) is the plate's middle; plate `0.05 × 0.07 × 0.006`; handle `0.045` long, `0.01` thick, tilted ±35°; a post is `0.03` square and `0.5` tall. On a wall the foot stands `WALL_HALF` in.

**Mesh and animation** — `leverFaces(lever, room, origin: Vec3, side: number, swung: number): Quad[]` (surfaces `trim` post, `plate`, `handle`). Called from the private `lever(rolled, pose, room, holeOf(room), pulled)` in `entities/world/model/geometry.ts` (lines 281–343), inside `faces(rolled, pose, full, holeOf, pulled, owns, pillarOf)`, which draws a lever in every holed room it walls.

- `Pulled = InRoomOf & { swung: number }` (0 up, 1 down); `swungIn(pulled, room)`. The chain: `Player.lever` → `pulledOf(player)` → `Frame.pulled` → `mesh.faces(pulled)` → `faces(...)` → `leverFaces(..., swung)`.
- `swungAt(t) = rise(t, 0, PULL_SWING)`, `PULL_SWING = 0.25` s (`shrink.ts`); `swinging()` in `play.ts` advances it every frame; it stays 1 while the body is small and resets on landing.
- The lever is part of the **static** mesh: `cube-scene.ts` compares `pullKey()` (`room + swung`) with `uploadedPull` and **re-packs and re-uploads the whole static scenery** each frame the swing changes. A pill that vanishes from its shelf can ride the same `Pulled` channel (a "taken" flag in place of `swung`), or be drawn as `moving`.

**Reach** — `canPull(pose, lever)` (private in `play.ts`): `pose.scale >= 1 && hypot(pose.u - at.u, pose.v - at.v) <= LEVER_REACH`, `LEVER_REACH = 0.48` (2.4 m on floor 1). **No facing test** — the body may have its back to the lever. `press.ts` reuses `LEVER_REACH` as `SIGN_REACH` and adds a 50° gaze test for signs (`canPress`).

**Cues, sound, voice, hint**

- The pull frame's cues are `[{ cue: 'lever' }, { cue: 'shrink' }, ...]`; `{ cue: 'say', moment }` follows at `look.sayAt` (2.2 s on floor 1, 0.4 s deeper).
- `pages/cube/ui/hearing.ts` `soundOf` maps `lever`/`shrink`/`jump` straight to `SoundCue { kind }`. The lever's sound is `lever(seed, rate)` in `features/sound/cues/model/fixture.ts` — a 0.25 s creak then a clank (`LEVER_SWING = 0.25`), wired in `cues/model/cue.ts` (union line 52, switch line 82, loudness table `lever: 0.7` line 151).
- **No voice line is about the lever**; the said moments are `first-shrink`, `second-shrink`, `shrink`, `landing`.
- **No hint text exists for the lever.** The only hints are the for-sale sign's. A "Press E" hint by the pill would be new.
- No poster, sign or lettering mentions a lever [grep over `src/cube`: none in `entities/poster`, `shared/lettering`, `config/messages`].

**Every file that mentions the lever** (`git grep -i lever -- src/cube src/cube-board`), by what turning it into a pill on a shelf takes:

- _Rewrite — the thing itself_: `entities/world/model/lever.ts` (place rule can stay; `leverFaces` becomes shelf + pill; `Pulled.swung` becomes taken/not), `entities/world/model/lever.test.ts`, `entities/world/index.ts` (exports `Lever`, `leverOf`, `Pulled`), `entities/world/model/geometry.ts` (private `lever()`, the `faces` docstring), `entities/world/model/geometry.test.ts` (lines 186, 199: "draws a lever in each holed room…", "swings the pulled lever's handle down…").
- _Rewrite — the mechanic_: `features/player/model/play.ts` (`Holed.lever`, `Cue 'lever'`, `Player.lever`/`sincePull`, `pulledOf`, `swinging`, `canPull`, the pull branch), `shrink.ts` (`LEVER_REACH`, `PULL_SWING`, `swungAt`), `look.ts` (`LEAD` is "the lever's swing"; comments), `hands.ts` (new hand script), `holed.ts` (`lever: leverOf(...)`), `press.ts` (`SIGN_REACH = LEVER_REACH`), `step.ts` (`Input.pull` docstring), `ui/input.ts` (`PULL` comment), `play.test-kit.ts` (`holed.lever`, `beside`, `pull`), `play.test.ts` (lines 35, 49–132, 303).
- _Rewrite — the sound_: `features/sound/cues/model/fixture.ts` (`lever`), `fixture.test.ts` (`ONCE = { lever, ring, knock, thud }`, "clanks the lever after its creak"), `cue.ts`, `cue.test.ts` (lines 26, 129).
- _Follow the rename / check the clearance_: `features/decor/model/clear.ts` (`leverSpot(setting)` re-derives the lever's spot from `setting.closed`, keeps a `REACH` zone round it clear of furniture — a shelf must sit inside that zone), `clear.test.ts` (pins `leverSpot` equal to `leverOf`), `furnish.test.ts` line 117, `features/happenings/model/fixtures.ts` line 41 (comment), `entities/world/model/room.ts` line 10 (comment), `pages/cube/ui/cube-mesh.ts` and `cube-scene.ts` (comments, `pulled` plumbing), `scripts/play-cube.ts` (the frame script that pulls floor 1's lever).
- _Leave — history_: `src/cube-board/app/config/cube/{zero,one,beauty}.yaml` (the build board's past entries).

## 4. Hints and overlays

- State lives in `CubeCanvas` (`cube-canvas.tsx`): `floor` and `inReach: SignKind | null` are React state **set every frame** from the frame hook (`Hooks.setFloor`, `setInReach`; React drops a set to the same value); `offer: Signed | null` is state; `offeringRef` is a ref the frame reads through `Hooks.offering()`.
- The hint is one `<p className={classes.hint} aria-live="polite">`, fixed at `bottom: 18%`, centred, `pointer-events: none` (`cube.module.scss`). It shows `offerCopy.hint` / `hintYours` when a sign is in reach and no offer is open. **It is the place for a pill hint and the Y/N prompt**; today it has exactly one source, so a second needs a small priority rule.
- `reach(pose, signOf, press)` runs every frame: `canPress(pose, sign)`; on a press it calls `open({ room, sign })` and exits pointer lock. Signs never hang in a holed room or on floor 1 (`lotSign`: `room.n < 2 → null`, ends excluded), so **E for the pill and E for a sign never compete in one room**; `press` is also gated on `standing`.
- The offer is a Mantine `Modal` in `sale-offer.tsx`, with its own `MantineProvider` and hand-ordered stylesheet imports (the `(game)` route group has no Mantine root; `pnpm check:mantine-styles` holds the order).
- **Keys while an overlay is open**: `controls = offering() ? STILL : read` — the frame's input is read and dropped, so the body stands still. Nothing in `bindInput` knows about the overlay. A Y/N prompt differs: the body is mid-act, so the answer should reach `play()` as input (a new `Input` field), not be swallowed.
- Y/N by position or by letter: every existing key is by `event.code`. `KeyY`/`KeyN` by position print as Y/N on QWERTY only (QWERTZ swaps Y, AZERTY and Cyrillic layouts differ); the on-screen copy names letters. Decide deliberately.
- **Persistence today**: none seen. The URL fragment carries the address only (`Address = { hatch: Cell | null; at: Standing }` — no spare bits, checksummed); bought rooms live in `holdingsRef` "until the page reloads"; `hearing.ts` keeps `afterFirst` in memory. No `localStorage`/`sessionStorage` in any file read (`cube-canvas.tsx`, `fragment.ts`, `sale-offer.tsx`, `hearing.ts`, `features/player/**`) — **the rest of `src/cube` was not grepped for it**.
- "First time only" already has a deterministic stand-in: floor 1's look is `FIRST_LOOK` with moment `first-shrink`, "the same for everyone". Keying the Y/N ritual on `n === 1` needs no storage, but a walk resumed deeper from a fragment, or cheated, never sees it, and a reload on floor 1 sees it again.

## 5. Starting the walk

`startOf(query: URLSearchParams, fragment: string): Promise<Start | null>` (private, `cube-canvas.tsx`); `Start = Posed & { hatch: Address['hatch']; resumable: boolean }`.

1. `?cheated_to=<n>` (`CHEAT_QUERY`) wins: `{ pose: arrivedOn(n), hatch: null, resumable: false }`; a bad floor throws `RangeError` to the route's error boundary.
2. Empty fragment: `{ pose: arrivedOn(1), hatch: null, resumable: true }` — **this is the only branch a first visit takes, and where "start outside on the island" hooks in.**
3. Otherwise `decodeAddress(planted, fragment)`: `null` → the `nowhere` notice; else the decoded `Standing` at `EYE_HEIGHT`, `scale 1`.

Then `walk(canvas, start, play, selling, hooks)`:

- `?play` (`PLAY_QUERY`, `pages/cube/lib/play.ts`): `input = null`, **no hearing**, the frame hook returns the pose untouched, the clock is frozen at `PLAY_INSTANT`, and `globalThis.__cubePlay` (`PLAY_HOOK`) is installed: `CubePlayHook = { ready, setPose(pose, moving?), adapter, setClock(ms), press() }`. `src/cube/scripts/play-cube.ts`, `gallery-cube.ts`, `shaders-cube.ts` and `scripts/lib/cube-page.ts` drive it.
- Address write-back: `followAddress(start.n, hatch, encode, writeFragment, setFailure)` (`pages/cube/lib/fragment.ts`) returns `Follow = (pose, standing, seconds) => void`. It writes **at once on its first standing frame**, on every new room, and at most every `WRITE_EVERY = 0.5` s while moving; a non-standing frame writes nothing; a floor change other than `+1` goes to `onError`. `encodeAddress` throws unless `1 <= n <= floorsOf(world)` and the hatch matches the floor.
- A `goto` cheat sets `follow = null` and `writeCheat(n)`.

What must not break:

- **`?play` must open straight inside the cube at `start`, with no intro and no input** — the frame scripts shoot poses through `setPose` and expect the first frame (`ready`) to be the room.
- **`?cheated_to` and a non-empty fragment must skip the intro.**
- **The intro must never reach `follow` as a standing frame**: an island pose is not an address. Either `follow` is created when the body steps into floor 1's room, or the intro's acts are non-standing. Note the consequence of the first write: one standing frame inside and the URL has a fragment, so a reload resumes inside — the intro replays only from a bare `/cube`.
- `mountCube` wants a `Pose` in a real room from frame one and builds its mesh from `sight(pose, …)`. The island is either geometry added to floor 1's mesh as seen from a pose outside the grid (then `isRoom`, `closedWalls`, `holesOf`, `roomLooks`, `settingOf` all get asked about a room that is not one), or a separate scene mode before the first room mesh. This is the largest structural seam of the build.
- `walk()`'s effect depends on `[offerCopy]`; `CubePage` passes the JSON module, so it is stable.

**Route and copy**: `sites/vova/app/(game)/cube/page.tsx` re-exports `CubePage` as default and `cubeMetadata` as `metadata` from `@/cube/pages/cube` (hidden from index and sitemap, `lib/cube-metadata.ts`). `CubePage` (`ui/cube-page.tsx`) is `<CubeCanvas {...COPY} />` with `COPY` imported straight from `config/messages/en.json`. **There is no `ru.json` and no next-intl on this page** — copy is English only, typed as `typeof COPY`, slots filled by `fillSlots` from `@/kernel/shared/i18n`. Keys today: `canvas`, `unsupported`, `floor`, `nowhere`, `offer.{signs, sold, hint, hintYours, title, titleYours, price, paid, size, buy, demo, close}`.

## 6. Sound and voice seams — PARTLY UNREAD

[seen] in `pages/cube/ui/hearing.ts`, the only place player cues meet sound and voice (features may not import each other, so the page composes them):

- `createSoundscape()` from `@/cube/features/sound` gives `scape.unlock()`, `scape.setPlace(themeOf(n).sound, scale)`, `scape.cue(sound: SoundCue, offsetSeconds?)`, `scape.play(samples, rate)`, `scape.dispose()`. Silent until the first `pointerdown` on the canvas or any `keydown`.
- Body cues: `soundOf(cue, pose)` → `{ kind: 'step', strength, footing }` (footing from `themeOf(n).sound`), `{ kind: 'landing', speed }`, and **`{ kind: cue.cue }` for everything else** — so a new player cue whose name is also a `SoundCue` kind needs no change here.
- Room sounds (happenings): `{ kind, seed, from: bearingOf(pose, pose.yaw, at), loud }` with an offset into the sound — **one-shots positioned by bearing; this is the only spatialisation seen**.
- Voice: `say(moment, pose)` = `scape.play(utter(lineFor(moment, n, grain), voiceOf('visitor', n), VOICE_RATE), VOICE_RATE)`, `VOICE_RATE = 32_000`. So the voice is **synthesised to samples in code** and played as a buffer; `Moment` is exported by `@/cube/features/voice`.

[unread] and to be confirmed by a fresh reader:

- One-shot cue, expected steps: a synth function in `features/sound/cues/model/fixture.ts` (or `body.ts`) returning `Float32Array` via `sampled(duration, rate, fn)`; a member in `SoundCue` (`cue.ts` ~line 52), a `case` in its switch (~line 82), a loudness entry (~line 151); tests in `cue.test.ts` (it lists every kind, lines 26 and 129) and `fixture.test.ts`; then the `Cue` union in `play.ts`.
- Continuous bed (surf, wind, a hum at the cube): the only bed seen by name is the floor's room tone, `features/sound/scape/model/tone.ts` driven by `setPlace` in `scape/ui/soundscape.ts`. Whether a second looping or positioned bed can be added without restructuring is unknown.
- Everything appears procedural (file names: `dsp/lib/dsp.ts`, `footstep.ts`, `stirs.ts`, `tone.ts`; no audio assets seen under `src/cube`), unconfirmed.
- Voice internals (`features/voice/model/`: `line-for.ts`, `lexicon.ts`, `tongue.ts`, `phone.ts`, `vocal.ts`, `utter.ts`, `voice.ts`, `script.ts`) — what language the lines are in, how a moment's line is chosen, and whether a wordless groan fits `utter` — unread. Adding a moment starts at the `Moment` type and `lineFor`, with `line-for.test.ts` and `lexicon.test.ts` beside them.

## 7. Floor 1's room — UNREAD

Not opened: `features/decor/**`, `entities/theme/**`, `geometry.ts`. What the callers show:

- [seen] `build()` in `cube-mesh.ts` furnishes each near/below room with `furnish(setting, themeOf(setting.room.n).decor)`, `setting = settingOf(walls, rolledTraits, room, holeOf(room))` = `{ room, closed: Sides /* [east, south, west, north] closed */, hole: Quarter | null, grain }`, `grain = traits(planted.seed).room.at(room).grain`. So decor is **a pure function of the theme's recipe, the room's closed sides, its hole and a per-room number rolled from the planted seed** — fixed for the planted world, different under another seed, unless the floor's recipe pins it.
- [seen] Floor 1's setting: `closed = [true, true, true, true]`, `hole` = the planted quarter, so the lever's clear zone (`clear.ts`) shapes where furniture may stand.
- [unread] The bench, potted plant, wall clock and door-like thing: look in `features/decor/config/{recipes,office,fittings,clutter,works,home,leisure}.ts` and `model/furnish.ts`; floor 1's theme is the first file under `entities/theme/workplace/config/` (numbered `01-…`; themes run workplace 01–08, dwelling 09–20, leisure 21–35, laboratory 36–52, edge 53–66), catalogue in `entities/theme/catalogue/config/floors.ts`. **Which wall the door-like thing is on, and whether it is seeded, is not established here** — it decides where the ladder and doorway go, so it must be read before the intro's geometry is laid out. Lights and the clock may come from the theme's shader rather than decor (`entities/theme/kit/lib/light.ts`, `shared/lib/clock.ts`).
- [unread] `features/happenings`: by its use in `cube-scene.ts`, `happening(setting, n, clock)` returns `{ quads, sounds }` — things going on in a room by themselves at a clock instant (figures passing, fixtures, traces), drawn as moving quads and heard as positioned one-shots.

## 8. Traps

- **400-line limit** (`scripts/line-limit.test.ts`): `pages/cube/ui/cube-canvas.tsx` is 362 lines, `features/player/model/hands.ts` 327, `play.test.ts` 330, `play.ts` 313. The intro, the prompt and the pill hand will not fit in these files; plan the splits first.
- **`play.test.ts` pins the pull**: first frame's cues are exactly `[{ cue: 'lever' }, { cue: 'shrink' }]`; the cue sequence is `['lever', 'shrink', 'say']`; reach is `LEVER_REACH ± 0.01`; the lever swings in `PULL_SWING` and holds while small; landing lets it go. `look.test.ts` and `hands.test.ts` pin `glimpse` and `handsOf` (hands only inside a shrink's look).
- **The shrink starts on the pull frame today.** With a pill, the swallow comes first: the scale, the `shrink` cue and the look's clock (`LEAD`, `sayAt`) all shift, and `FIRST_LOOK`'s 2.2 s `sayAt` is timed against the hands look.
- `lever.test.ts`, `geometry.test.ts` (186, 199), `clear.test.ts` (`leverSpot` ≡ `leverOf`), `furnish.test.ts` (117), `cue.test.ts`, `fixture.test.ts` — all name the lever.
- **`Input` is closed and constructed in three places** (`bindInput.read`, `STILL`, the test kit); a new field must land in all.
- **`holedHere` is async**: `here` is `null` for the first frames in a room, so a prompt or hint keyed on it flickers in a frame or two late — and entering floor 1 by a scripted climb should ask for the room before the body can press E.
- `follow` errors on any floor change that is not `+1` from where it started; `encodeAddress` throws outside `1..floors`.
- `sight`, `closedWalls`, `holesOf`, `roomLooks` assume a room on the grid; a moving quad with a `room.n` outside the mesh's `lenses` is silently dropped.
- Camera has no roll and `elevation` is clamped to ±89° by `step` (a scripted act that bypasses `step` may exceed it; `elevationOf` in `address.ts` clamps on write).
- MASD: `features/player`, `features/sound`, `features/voice`, `features/decor`, `features/happenings` are siblings and may not import one another; `entities/world` may import no feature. Anything joining two of them goes in `pages/cube` (as `hearing.ts` does). `interface` is banned; shared members between named types need a base (`pnpm type-overlap`); no import cycles; no lint suppressions without the operator's yes.
- **An app named `island` already exists** (`src/island`, `src/island-board`, route `sites/vova/app/(game)/island/`), and `cube` inherits only `scene` and `dice` (`src/masd.json`), so the cube cannot import it. Name the cube's island code so it does not read as that app.
- `sale-offer.tsx`'s Mantine sheet list is hand-ordered and checked; a new Mantine component in a prompt needs its sheet there. A plain `<p>` like the hint needs none.
