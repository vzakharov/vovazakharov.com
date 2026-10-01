# Bites 12 and 12b — walking the meadow (spec)

Research for the orchestrator. The operator's rulings: idea-1 § «Что ты решил
(ревью 5355192406)», plus turning **(c)**: a real heading on a flat plane, 360°
on the spot, steps along the heading, and the sun as the compass («ходить мы
хотим. иначе как он "карту" засеивать будет?»). Paths are under
`src/pages/mushrooms/` unless stated otherwise.

## 0. The turning model: (c), and what it beat

- **(a) Strip, hard ends, steps in z.** About 1 bite. Stepping would be a
  per-row zoom about the screen's centre. It breaks nothing and reuses bite 11
  whole, but you cannot turn round, and you cannot walk head-on to a mushroom
  near a world end (the zoom pushes it out of the screen). Nothing to sow
  beyond the strip.
- **(b) Ring.** About 1.5–2 bites. Every world-px consumer needs wrapping
  arithmetic (placement, cap cover, sight edges, flight legs, the backdrop
  seams), the 0.3/0.6 parallax hills repeat inside one screen unless set to
  1, and the sun still needs a heading. You pay most of (c)'s cost and still
  walk no geometry: a step "toward" is a zoom.
- **(c) Heading on a plane: chosen.** About 2 bites (12 + 12b, §3). Under it
  every **gene, painter, motion clock, reducer rule and bed object** survives.
  What changes is where things are projected, the panorama, and input.

## 1. How projection works today, and what (c) changes

**Today is already a pinhole camera written in row form.**

- `model/ground.ts:155-166` (`project`): `y = groundTop + ground·down` with
  `down = CLUMP_DOWN − z/BAND_DEPTH` (`:145-147`), so y is _linear_ in z.
- `scale = unit·depthScale(down)/depthScale(CLUMP_DOWN)` (`:140-152`), with
  `depthScale = 0.7 + 0.5·down`. So scale is linear in screen y, zero at
  `down = −1.4`. That is a pinhole's horizon (`y_h = groundTop − 1.4·ground`),
  hidden behind the hills.
- `x = midline + x·scale`, so ground `x` is the true lateral offset.
- Matching a pinhole (`scale ∝ 1/d`, `y − y_h = h·scale`, true depth at the
  clump) gives these constants, all derivable in `ground.ts`:
  - eye height `h = 2·BAND_DEPTH·UP_PER_Z·s(CLUMP_DOWN) = 4.154` clump units;
  - the clump's distance `d_c = h/UP_PER_Z = 8.64`;
  - focal length `F = unit·d_c` px;
  - a ground point's true distance `D(z) = d_c·s(CLUMP_DOWN)/s(down) = 74.6/(8.64 − z)`.
- **So `z` is a warped distance and depth is one fixed scale per row.**
  Measured on that scale:
  - the frame (`FRAME_DEPTH`) runs from D = 7.79 to 13.24;
  - the screen's foot is at D = 7.78, the seam (`groundTop`) at D = 13.33;
  - the world's frame (`meadow-camera.ts:36-39`, `across` measured on
    `seen`'s x, `ground.ts:131-133`) is a **wedge of ±33.7° of heading**
    seen from an eye at the origin.
- **The pan is a small-angle yaw.** `pan-input.ts:76-78` sets the crop as
  `cameras.main.scrollX`, which shifts every bed object equally. The hills
  scroll at 0.3 and 0.6 (`parallax.ts:11`); the sky, sun, wash and clouds are
  screen-fixed (`layout.ts:216-226`, `paint-backdrop.ts:186-205`).
- **Baked once per screen size:**
  - `standMeadow` (`layout.ts:141-145, 201-236`), kept per screen;
  - the six baked pictures (`paint-backdrop.ts:129-221`): sky+sun together,
    two hill ranges, the ground with its mottles (`grain.ts:26-43`), and the
    wash;
  - each mushroom's and flower's Graphics, drawn at its layout `size`, haze
    and light (`mushroom-bed.ts:281-313`, `flower-bed.ts:88-115`).
- **Set per frame:** only transforms (`mushroom-bed.ts:193-233`,
  `flower-bed.ts:144-157`, `insect-view.ts:280-284`), plus the grass
  (`grass.ts:126-141`) and the clouds, which are redrawn.

**What (c) changes.** `project` gains an eye `{x, y, heading}` on the plane.
A layout point goes to the plane as `(X = x, Y = D(z))`, then to the eye's
frame `(u, v)`, then to the screen:

- `sx = cx + F·u/v`
- `sy = y_h + F·(h − height)/v`
- `scale = unit·d_c/v`

**At `OPENING_EYE` (origin, heading 0) this reproduces today's opening crop
exactly**, so every layout invariant keeps holding there. The projection
becomes per frame, but it is only a transform. Graphics keep being drawn at
their layout size and get `setScale(k = d/v)`, so a step or a turn re-places
objects and rebakes nothing. Drawing depth must be recomputed per frame
(`setDepth(sy)`), because yaw reorders rows. That replaces the static
`setDepth(y)` at `mushroom-bed.ts:296`.

## 2. The design

### Eye state, limits, collisions

- **Where the state lives: in the scene, as pure state like `model/pan.ts`.**
  It is not in the `Meadow`, because it changes every frame and the
  reconcile-skip relies on the `Meadow`'s identity. The map (item 15) can read
  it from the scene.
- **Bounds (bite 12): a glade disc of centre (0, 8) and radius 12** in plane
  units. It holds the whole wedge, its farthest corner 10.3 from the centre.
  It leaves 4 units to step back from the opening and keeps the eye 0.5 inside
  the rim. At the rim the move is projected onto the tangent, so you slide and
  are not stopped dead.
  - _Beat:_ bounds shaped like the wedge (corners trap a child mid-turn), and
    no bounds (you walk off into bare ground).
  - _Cost:_ one ray–circle room function. Bite 12b re-sizes the glade once
    sowing sets the density.
- **Pass through everything.** No collisions, as the idea doc has it. Every
  mushroom is shorter than the eye (`h = 4.15`), so its drawn top sinks below
  the screen's foot before `v < 7.78·(1 − H/h)`. Objects are culled at
  `v < V_NEAR = 2`, and a test asserts that every gene's tallest head is
  below the screen at `V_NEAR`, so the cull never pops.
- **Far side:** objects with `v > D_SEE = 13.33` are behind the seam. They
  fade in over `v ∈ [12.3, 13.33]` (alpha only).

### Pace and easing

- **Turn axis: `model/pan.ts` generalised.**
  - The view's `left` becomes `heading·F`. The ends become optional, and none
    means the heading wraps. The cruise is explicit:
    `TURN_CRUISE = 0.38 rad/s`, the tablet's bite-11 turn of
    0.5 screen-widths/s at its 43.7° view, now the same on every screen.
    Keeping it in screen widths would give phone portrait (an 11° view) a
    60 s full turn.
  - The slop, the 1:1 follow, the glide, the key ease and "keys and fingers
    add up" are all kept and tested as they are. `recrop` keeps the heading
    in radians across a resize, which is "a phone turn is a crop".
- **Stride axis: a new `model/stride.ts`.**
  - Same shape: pace in units/s, timed by event stamps, stepped by `tick`.
  - Cruise `STRIDE_CRUISE = 1.6 units/s`, eased over `KEY_EASE` 0.25 s.
  - `STEP_LENGTH = 0.8`, which is two steps a second, a walking cadence. The
    glade crosses in about 15 s.
  - Held `↑` or `↓` gives a heading of ±1; both held stand. The room ahead is
    the ray's distance to the rim, so braking reuses pan's "brake on the curve
    that rests exactly at the end".
  - **Pan's integrator loop (`pan.ts:337-382`) moves to `model/cruise.ts`**,
    and both axes call it. One copy of the braking maths.

### A drag

- **The slop becomes radial**, `hypot(dx, dy) > SLOP` (24). Inside it, the
  press taps on the press, as bite 11 ruled.
- **Axis lock at the crossing** (recommended): within 45° of horizontal turns,
  otherwise steps. The lock holds until the lift.
  - _Beat:_ both axes at once, like a dragged photo. A child's drift while
    turning would walk her.
  - _Property:_ a drag within 45° of horizontal never changes the eye's
    position.
  - _Cost:_ to switch axis, lift the finger.
- **Horizontal: the azimuth under the press stays under the finger.**
  `heading = heading₀ + atan((x₀−cx)/F) − atan((x−cx)/F)`. This is exact for
  a yaw, and it is pan's 1:1 measured in angle. The glide on release is kept.
- **Vertical: "follows the finger, no faster than a step".**
  - The press row's distance is `v₀ = F·h/(y₀ − y_h)`, and the finger's row
    is `v_f`, with both rows clamped to the seam or below. The target is
    `eye₀ + heading·(v₀ − v_f)`.
  - The stride chases the target at most at `STRIDE_CRUISE`, braking into it.
  - On release it finishes the chase, then rests. There is no glide: a step
    has no momentum.
  - _Property:_ `|d(eye)/dt| ≤ STRIDE_CRUISE` always. Once settled, the
    pressed ground row is under the lift point (minus the slop lag), unless
    the rim clamped it.

### What is re-placed per frame, and what stays baked

| Thing                                      | Bite 12                                                                                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mushrooms, shadows, houses, selection ring | per frame: position, `scale·k`, depth, cull or fade. Hit polygons are local, so they follow the transform free (`hit-areas.ts:30-45`)                           |
| Flowers, planted flowers, sprouts          | per frame, as above. The head's hit circle scales with the container                                                                                            |
| Bare tufts                                 | per frame, projected in `paintSprouts`, already redrawn every frame                                                                                             |
| Seam grass                                 | per frame, placed by azimuth on the seam row (the horizon, no step parallax), periodic over 360°                                                                |
| Sky gradient                               | baked, screen-fixed (rows only)                                                                                                                                 |
| Sun disc, rays, glow                       | **split out of the sky bake** into a small baked sprite at `cx + F·tan(α_sun − heading)`, hidden outside the view                                               |
| Wash                                       | baked rings, a sprite moving with the sun, reaching the **sky only**                                                                                            |
| Clouds                                     | per frame by azimuth (already redrawn). The 3 opening clouds keep their opening azimuths; about 5 more are seeded round the sky                                 |
| Hills (far, farther, near)                 | **live Graphics over the visible azimuth span**, from a periodic crest (`skyline.ts`), redrawn only while the heading changes. The parting bowl sits at `α_sun` |
| Ground bands                               | baked, screen-fixed rows (distance bands are valid at any eye)                                                                                                  |
| Grain                                      | screen-fixed (paper tooth)                                                                                                                                      |
| Mottles                                    | dropped in 12; plane objects in 12b                                                                                                                             |
| Haze                                       | by distance, through a repaint queue (below)                                                                                                                    |
| Light                                      | frozen as painted at the opening (bite 12); by heading in 12b                                                                                                   |

- **Hills, live vs baked.** A 360° baked panorama is `2πF` wide: about 9.3k
  CSS px on a tablet and 11.9k on phone portrait. That is 44–86 MB of texels
  at the device ratio. Lazy 2048-column bakes would hitch the frame on
  baking. Live polygons cost a few hundred vertices, only while turning.
- **Parallax is gone.** At infinity, rotation has no parallax, and a step
  moves nothing on the panorama. So `parallax.ts` and `layerSpan` retire.

### The sun as the compass, and what it costs

- The sun, the wash, the sky's glow round the sun and the clouds belong to an
  azimuth. `α_sun = atan((sun.x − cx)/F)` at the opening, so the opening
  frame is unchanged. A full turn carries the sun off the screen and back.
- **Rules that assume a screen-fixed sun, and their fates:**
  - `nearestTheSun` and `acrossFromSun` (`sun-layout.ts:227-249`) go. With
    them goes `washReach`'s bound "off every foot on every crop"
    (`:262-276`): no bound over every eye exists. The wash is cut to the sky:
    its outer radius is at most `groundTop − sun.y`.
    - _Cost:_ the land's upper third loses the glow, measured once on tabL.
  - `skyline.ts:85-113` (`sunBowl`, parting "along the whole stretch the sun
    sweeps as the crop pans") becomes **one bowl at `α_sun`** on the periodic
    crest. This is simpler: the sun and the hills share the panorama, so the
    sweep and the sag envelope go.
  - `placeSun`'s keep-off of the opening crowns (`layout.ts:191-198`) holds
    at the opening only.
  - `roomFor`'s "the sun's rays off it where they stand over the crop now"
    becomes the rays where the sun stands in the current view.
  - The baked `sky` loses the sun layer (`paint-backdrop.ts:205`).
- **For item 13 (rain):**
  - A cloud tap hits a cloud at its azimuth.
  - "Densest under the tapped cloud" turns with it.
  - The splashes go through the projection.
  - **The rainbow stands opposite the sun**, at `α_sun + π`: to see it, the
    child turns her back to the sun.

### Haze and the repaint queue

- Walking up to a misty back-row mushroom must clear it. The haze is up to
  0.39 at D = 13.24, and the operator's own case is «подойдёт».
- New `ui/scene/repaint-queue.ts`:
  - an object whose projected haze is ≥ 0.04 from its painted haze is queued;
  - at most 2 repaints a frame, nearest first. A mushroom costs 0.4–1 ms
    (idea doc's measurement), so that is ≤ 2 ms;
  - light stays as painted (`mushroomLights` with the layout place).
- 12b adds the heading-lit light (high sun, side component
  `sin(heading − α_sun)`) to the same queue.
- _Beat:_ frozen haze (a foggy mushroom at arm's length), and a per-frame
  repaint (20 mushrooms eat the budget).

### Bob and footsteps

- **The bob is a function of the distance walked, not of time**:
  `scrollY = −A·|sin(π·s/STEP_LENGTH)|`, `A = 0.004·height` (3 px on a
  tablet), on `cameras.main`.
  - Controls are `scrollFactor 0` and do not bob. Everything else bobs
    together.
  - It is only ever ≤ 0, so content moves down and no strip below the land is
    revealed.
  - It is zero at rest. Reduced motion (item 17) sets A = 0.
- **A footstep sounds each time `s` crosses a multiple of `STEP_LENGTH`.**
  - `MeadowSound.step(side)`: about 60 ms of the breeze's brown noise
    (`sound.ts:123-145`) through a low-pass near 600 Hz.
  - Sides alternate through a `StereoPannerNode` at ±0.3, inserted in
    `play`'s chain (`sound.ts:282`).
  - Silent under the mute. Its level is checked by rendering.

### Taps

- **A mushroom takes taps only where it is drawn:**
  `containsMushroom ≡ drawnHolds`. `fingerPad` and its branch go
  (`mushroom-tap.ts:40-49`, `hit-areas.ts:36-44`).
  - The front-most-drawn rule and `mushroom-patch.ts` keep working on drawn
    areas.
  - `keepsPatches` stays a growth rule, judged at `OPENING_EYE`.
  - `ZOOM_FLOOR` stays: it still fits the opening clump.
  - _Beat:_ a pad scaled by k (keeps the 2000-visit test shape, but
    contradicts the ruling).
- **A flower's tap circle scales with its container**, `TAP_RADIUS` at k = 1,
  so the opening is unchanged.
- **The tests move from k = 1 to two eyes:** `OPENING_EYE`, and one eye
  stepped 3 units in.

### Insects (bite 12: an adapter; 12b: the plane)

- **In bite 12, `insect-view.ts` keeps computing every leg in layout space,**
  the opening eye's world px, untouched. It draws through
  `view.ofLayout(point, footRow)`. Each insect carries a foot row:
  - perched, its perch's foot;
  - in flight, a lerp of the leg's two;
  - in the air, the clump's row.
    The point then maps to `(X, Y, height)` and is projected. This is exact for
    a perched insect. Its size is unchanged: "a perched butterfly keeps its
    size". It is culled at `v < V_NEAR`.
- **The sight rule is dropped** (the ruling):
  - `perch-sight.ts` keeps only the static edge test (head clear of the
    world's edge by the wingspan). The cover-by-nearer-mushroom test goes,
    and nothing is recomputed per step.
  - The first perch is still on screen: `onscreenOf` asks the view, and the
    entry point is off the current screen edge at that perch's row, mapped
    back to layout.
  - Where no perch is in view, the insect enters from the strip's nearer end
    (accepted in 12).
  - `fliers.test.ts` (about 354 s) reruns.

### Growth in bite 12

- `+` keeps `roomFor`'s rules at `OPENING_EYE`, and additionally requires the
  cap to be on screen and off the controls and the sun **as the current view
  projects it**. Candidates are still drawn over the wedge.
- Facing away from the wedge, `+` gives its "nuh-uh". That is honest, since
  bite 12's ground there is bare. Bite 12b sows it.

## 3. Packages

**The cut.**

- **Bite 12** ends on a child turning all the way round and walking anywhere
  in the glade:
  - the sun is the compass, and the hills ring the meadow;
  - the whole present meadow (clump, forest, 14 flowers, tufts, houses,
    insects) stands on the plane where it stood;
  - everything taps and grows as before inside the wedge;
  - there is bare glade behind, and the light is as at the opening.
- **Bite 12b** makes the glade sowable and makes light and insects belong to
  the plane.

**Bite 12, step 0 (lands first; `pnpm typecheck` + `node:test` alone).** These
are Phaser-free:

- `model/ground.ts`: `Eye`, `OPENING_EYE`, `EYE_HEIGHT`, `CLUMP_DISTANCE`,
  `planeOf`, `viewOf(camera, eye, point, height)`.
- `model/cruise.ts`: new, extracted from `pan.ts`.
- `model/pan.ts`: optional ends and explicit cruise.
- `model/stride.ts`: new, including the glade room.
- `ui/scene/view.ts`: new and pure. It holds the per-frame `View` type and
  `ofLayout`, `cull`/`fade`, `onScreen` and the contract each bed implements,
  `follow(view)`.
- Their tests, among them **opening identity**: for a sweep of `Ground`
  points, `viewOf(OPENING_EYE)` equals `project − openingLeft` within 1e-9,
  and a full turn returns every point.
- `pan.test.ts` passes unchanged.

**The three packages after step 0.** Their file lists are disjoint, and all
three depend only on step 0, so they run in parallel.

- **P1 — the ground on the plane.**
  - Files: `mushroom-bed.ts`, `flower-bed.ts`, `house-view.ts`, `tufts.ts`,
    `grass.ts`, `repaint-queue.ts` (new), `mushroom-tap.ts`, `hit-areas.ts`,
    `mushroom-patch.ts`, `mushroom-room.ts`, and their tests.
  - Steps:
    1. `follow(view)` on the mushroom and flower beds and the house: position,
       scale, depth, cull, fade.
    2. Tufts and seam grass by view; the haze queue.
    3. Drawn-only taps, and `+` judged in the view.
- **P2 — the panorama.**
  - Files: `layout.ts` (sun and cloud azimuths), `paint-backdrop.ts`,
    `paint-sky.ts`, `paint-land.ts`, `grain.ts`, `sun-layout.ts`,
    `skyline.ts`, `panorama.ts` (new: azimuth→x, the live hills),
    `parallax.ts` (deleted), and their tests.
  - Steps:
    1. The sun sprite, the wash to the sky only, and clouds by azimuth.
    2. The periodic hills drawn live, with the bowl at `α_sun`.
    3. The land screen-fixed, without mottles.
- **P3 — walking in.**
  - Files: `pan-input.ts` → `eye-input.ts` (`Crop` becomes `EyeInput`:
    radial slop, axis lock, `view()`, `toScreen`/`toLayout`), `keyboard.ts`
    (`↑`/`↓`), `instrument-input.ts`, `meadow-scene.ts`, `perch-sight.ts`,
    `insect-view.ts`, `visit-play.ts`, `sound.ts`, `synth.ts`,
    `scripts/lib/mushroom-probe.ts`, `scripts/lib/play-pan*.ts` →
    `play-walk*.ts`.
  - Steps:
    1. `eye-input` + keys + footstep voice (no scene).
    2. Scene wiring, bob, and the insect adapter. This step **waits for P1
       step 1 and P2 step 1**, whose `follow` and `turn` it calls.
    3. The probe and the play run.
  - `meadow-scene.ts` is at 429 lines: the wiring goes through `follow` loops
    and `eye-input`, so it stays under 450.

**Bite 12b (sketch, re-specced when taken).**

- **Step 0:** the store becomes the plane. `Ground` becomes plane `{x, y}`,
  because points behind the opening eye cannot be written as a `z`. This
  covers `Planted.foot`, the flower feet, and `pickFoot` over the glade. The
  layout keeps the opening frame only for the clump.
- **Q1 — sow the glade:**
  - seeded flowers and tufts round the glade;
  - `+` in front of you anywhere;
  - `MUSHROOM_SLOTS` becomes a per-area cap. This needs the operator's
    number.
- **Q2 — light by heading** through the repaint queue; mottles as plane
  objects.
- **Q3 — insects in the plane:**
  - legs with height, air spots round the eye;
  - entry from the view's edge;
  - take-offs panned by azimuth.
  - The adapter retires.

## 4. Play-run checks (per screen, tabL tabP phoneP phoneL phoneS)

- **Opening identity:** at `OPENING_EYE` every mushroom's and flower's drawn
  position is within 0.5 px of bite 11's opening crop.
- **Turning by keys:**
  - `→` held 2 s turns one way only, never past `TURN_CRUISE`, eased in and
    out;
  - a full turn by keys returns every bed object within 0.5 px;
  - the sun leaves the screen and comes back.
- **Horizontal drag from bare ground:** a flower foot's azimuth stays under
  the finger (minus the slop), and nothing is tapped.
- **Vertical drag:** the eye moves along the heading, its speed never past
  `STRIDE_CRUISE`. Once settled, the pressed row is under the lift. Nothing
  is tapped. The footsteps counted (`__probe.sound.steps`) equal the distance
  over `STEP_LENGTH`, ±1.
- **`↑` to the rim:** eases in, cruises, rests softly inside the rim; `↓` the
  same backward.
- **Walk through the clump:** it sinks below the screen's foot, with no page
  error and nothing visible at `v < V_NEAR`.
- **Walk up to a back-row mushroom** until `k ≥ 1.5`:
  - its haze has dropped (the probe reads the painted haze);
  - a tap on its drawn cap selects it;
  - a tap 4 px outside its outline, where the pad was, does not.
- **Resize** (tabL↔tabP, phoneP↔phoneL): heading and position unchanged.
- **Bob:** `cameras.main.scrollY` stays in `[−A, 0]`, is non-zero while
  walking and is 0 at rest.
- **Insect:** released facing the clump, it perches in view. After a 180°
  turn there is no page error. A perched insect stays within 1 px of its
  seat.
- **The 26 ms median frame budget,** traced while walking into the forest and
  turning at the closest approach (the fill-rate worst case).

## 5. Risks

- **Fill rate under the software renderer.**
  - The danger: walking close makes caps cover much of the screen. The 26 ms
    median is rasterisation-bound in SwiftShader.
  - Mitigation: `V_NEAR`, plus a budget trace at the closest approach. If it
    fails, raise `V_NEAR` before touching the painters.
- **Per-frame cost.**
  - The danger: the projection and depth re-sort are O(objects), about 100;
    the live hills cost hundreds of vertices only while turning; haze
    repaints cost ≤ 2 ms.
  - Mitigation: the repaint cap. Light stays frozen in 12, so a turn never
    repaints.
- **Texture memory.**
  - The danger: a baked 360° panorama would take 44–86 MB.
  - Mitigation: avoided by drawing the hills live.
- **Breaking `pan.ts`'s tested behaviour.**
  - Mitigation: step 0 extracts the integrator under `pan.test.ts`
    unchanged.
- **The opening frame drifting.**
  - Mitigation: identity is a unit test (step 0) and a play-run check.
- **Invariants in `decisions.md` this rewrites.** The orchestrator updates
  each at the bite's end.
  - "Made for a six-year-old's hands: one drag — past a 24 px slop it pans"
    becomes one drag that turns or steps, axis-locked, past a radial 24 px.
  - "Every mushroom is a finger's target, on every screen" becomes
    "tapped where drawn". `ZOOM_FLOOR` stays for the opening.
  - "An insect perches only where it can be seen": the sight part is
    dropped, and only the world-edge test and "first perch on screen" stay.
  - "Flowers stay put … such a flower is out of sight": "stay put" holds,
    and the sight clause goes.
  - Bite 11 is superseded in four places:
    - screen-fixed sun, wash and clouds become azimuths;
    - the 0.3/0.6 hill parallax becomes none;
    - "the wash keeps off every foot any crop brings under the sun" becomes
      the wash on the sky only;
    - "hard ends" become a wrapping heading inside a glade rim.
  - **Holds:**
    - "A resize reconciles … never destroying one": the eye survives a
      resize;
    - "a tap on a resting insect goes through it";
    - "buttons stay above every insect";
    - "no tap is ever answered with a shrug": `+` facing bare ground
      shakes its head.
- **The insect adapter's edge cases (bite 12 only).**
  - The danger: a leg whose end is behind the eye is culled, not drawn, for
    that stretch; a release facing away flies to the strip unseen.
  - Mitigation: accepted for 12 and named in the bite file; 12b's plane
    flight removes both.
