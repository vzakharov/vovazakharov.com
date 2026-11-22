# Speed — hand-over note

Branch `claude/island-beauty-speed`, cut from `claude/island-beauty-c1rj3b`.

## Report — 2026-11-22, item 1: `?without=` and Measure (605bee2dc)

**The preview can now tell us what each cost takes on the operator's
machine, in one visit and one click.** Lead: 605bee2dc is ready to publish.
Two links for the operator, each running the whole measurement on load:

- dune place, facing the sea:
  `https://preview.vovazakharov.com/island?measure#1@10.28452,-0.47031,22.3,243.3,10.7`
- the same place, facing inland:
  `https://preview.vovazakharov.com/island?measure#1@10.28452,-0.47031,22.3,58.0,10.7`

  The coordinates are the lead's, as lat,lon in world 1. If the place was in
  another world, the number after `#` changes.

- **`?without=`** (comma-separated, beside `#place` or `?play`) leaves each
  named cost out of fine and swift; plain is untouched. The names:
  - `clouds` — the cloud march in the sky and over surfaces; in swift, the
    buffer pass is skipped too;
  - `cloud-shadow` — `clouds.shade` on every surface;
  - `air` — `aerial`'s scattering over every surface (the sky dome stays);
  - `ripples` — the sea's ripple normals (a flat sea);
  - `sea-sky` — the sky the sea mirrors, replaced by one flat sky colour;
  - `trees` — every tree;
  - `tufts` — grass, bushes, logs and the forest floor's litter.

  Each is one conditional where the look is dressed, read when the look is
  built, so there is no second code path. An unknown name throws to the error
  boundary, naming the known ones.

- **The HUD (`I`)** reads `frame 16.7 ms, 60 fps (mean of 60)`: the mean of
  the last 60 frames, the same mean Measure reports.
- **Measure** (the HUD button, or `?measure` on the address, which opens the
  HUD and starts at the first frame) runs 17 readings by itself:
  - plain, swift and fine whole;
  - then swift and fine each without each name alone.

  Each reading waits until every tile is in and 60 more frames are drawn,
  then takes the mean and the worst of the next 60. About 2000 frames in all:
  half a minute at 60 fps, about 1.5 min if fine runs at 25 fps. Afterwards it
  puts back the look and the `?without=` it started with.

  The table opens with the commit, the view's link, lat/lon, height, heading,
  pitch, sun time and tiles, then the backend and the canvas in device
  pixels. One row per reading: look, left out, ms, fps, ms saved against that
  look whole, worst frame. A Copy button takes it. If the tab is hidden
  during the run, so the frames are throttled, the first line reads
  `INVALID`. Nobody needs to touch anything.

- **knip** is green: the two `detailReach` re-exports went
  (`entities/terrain/height/index.ts`, `entities/terrain/index.ts`). Nothing
  outside the slice read them; `bounds.ts` keeps the function.
- **Tile bracket** (3b6c7b134, earlier today): at alpine 3000 m, 167 tiles
  selected before, 86 after (main: 112). There are no draw timings after it,
  because the run was cut by these orders.

**Left** (dropped by the lead's orders, not done):

- the air volume (a froxel grid for `aerial`);
- the tile-bracket follow-up (draw timings after the bracket);
- the M2 timing table — Measure is how the operator's machine fills it.

## Report — 2026-11-22, swift clouds (3f38e4ea) and where a frame goes

**Swift now draws its clouds from a buffer; fine is unchanged.** Swift costs
20–40% less than fine per frame; the clouds are no longer what separates swift
from plain. What does is the air, per fragment.

Frame time, SwiftShader, 1440×900, whole frames ending in a read of the canvas
(`tmp/speed/ablate.ts`). Absolute numbers are a CPU rasteriser's; the ratios
are what carries to an M2 Pro.

| spot           | plain | swift | fine |
| -------------- | ----: | ----: | ---: |
| alpine 300 m   |  1027 |  2538 | 3259 |
| lowland 2 m    |   884 |  2173 | 2754 |
| lowland 3000 m |   759 |  2041 | 3438 |

Where fine's extra goes (each draw kind skipped in turn): the tiles' fragments
≈ 65%, the sky's background mesh ≈ 15%, the ocean globe 10–20%. Inside swift
at lowland 3000 m: the cloud passes 98 ms, sky 203 (fine: 473), globe 318
(715), tiles 1501 (2430; plain 641). Two ablations of swift by rebuild: the
clouds' shadow on the ground (`clouds.shade`, per fragment) is 230–250 ms
(10–12%); drawing swift's land with the plain surface instead of the fine one
changes nothing measurable (2538 → 2538, 2041 → 2018). So **the rest, ≈ 1 s
over plain, is the air**: `aerial`'s two-lamp scattering, evaluated in every
fragment of every tile, the ocean and the trees.

**How the swift clouds work** (`ui/swift-clouds.ts`):

- A half-resolution buffer, a quarter of the screen's pixels. Each frame
  marches one pixel of every 2×2 block, in a Bayer walk, so a frame marches a
  sixteenth of the pixels fine marches, and the whole buffer is fresh every
  four frames.
- The other pixels carry over from the last frame, reprojected by the eye's
  turn and travel at the cloud's mid-stretch distance. They are clamped to
  the span of the freshly marched 3×3 neighbours (+10%), and replaced by their
  bilinear blend where the last frame did not see the point.
- History resets on the first frame, a resize, a switch into swift, or a jump
  (more than 2 km plus the eye's height in a frame). A reset marches all four
  pixels of each block at once, so a still shot is never patchy.
- The buffer holds each ray's whole stretch of the cloud layer, the ground
  ignored. It is therefore smooth across every silhouette, with no
  depth-edge halo. Each fragment cuts it at its own distance as if the cloud
  were spread evenly along the ray; that is exact at both ends, and
  approximate only for a surface inside the layer.
- The merged clouds' march has no screen grain, so the 3×3 tent that hid it
  is gone: a freshly marched pixel is used as marched.
- The cut assumes the cloud spread evenly over the ray's whole stretch of the
  layer (500–11 500 m). For a surface inside the layer, or a low eye's
  near-level ray, that misplaces the cloud along the ray; the fragment still
  gets the right total where its ray leaves the layer.

**On the merged clouds (72d2324dd).** The stretch is `cloudRays(frame).stretch`
over `LOWEST_BASE`–`HIGHEST_TOP`; `swift-span.ts` is gone. The lead's turning
proof — 300 m, pitch 10°, heading 0→50° in 5° steps, eleven frames drawn one
after another with swift on — differs from the same turn in fine by a mean of
0.07–0.08 / 255 per frame, flat over the turn (max one pixel 62, at 45°, a
coast edge). Grid: `frames/speed-swift-turning-5deg.jpg`, swift left, fine
right, every 10°.

**"Not drunk", checked** (`tmp/speed/turn.ts`, frames below):

- A turn of 0–42° in steps of 3° and then 10°: swift's clouds stand where
  fine's do in every frame. The mean difference from fine is 1.1–1.4 / 255 and
  flat from the first frame to the last, so the reprojection adds nothing a
  fresh march does not have.
- Flying north at 800 m, 330 m per frame (20 km/s at 60 fps): 0.54 → 0.63 /
  255 over six frames, no trail.
- At the cloud edges swift is softer than fine. Fine shows its own grain
  there, at full resolution.

**What the code touches.** The cloud shading is reached through `clouds.along`
alone. `skyNodes` builds `aerial` and `background` twice, as `fine` and
`swift`, over a cloud source. `ground-lighting`'s `dress(look, rippled)` picks
one and returns the look's background. `scene-look` prepares the swift passes
in `shine`, before the render. `island-scene.ts`: 371 lines.

**For the clouds member.** `along` must stay valid in a full-screen pass: no
`positionWorld`, the direction handed in. Its cost may change freely; the
swift pass marches it a sixteenth as often.

**Proposed next swift cuts, not built:**

1. **The air from a buffer**, the largest remainder: an aerial-perspective
   volume, in-scatter and transmittance over a 32×32 screen grid × 32 depth
   slices, filled once a frame and read by every fragment for its distance.
   The air is smooth in all three, so it holds up where the clouds needed
   reprojection. It is mine to build if the lead wants it; it touches
   `sky-nodes.ts`' `aerial`, nobody else's file.
2. **The clouds' ground shadow** at quarter resolution, or from the same
   volume (10–12%).
3. Trees' LOD and the ground's near-only normal are the other members'. By
   the second ablation the ground's fine surface is not where swift's time
   goes, at least on this rasteriser.

**Listeners** of `onLook` receive the look itself (`'plain' | 'swift' |
'fine'`); `isFine(look)` says whether it draws the sky, trees and sea.

Frames for the keeper to number, in `frames/`:
`speed-swift-vs-fine-{c560,c4400,sky2}.jpg` (swift on top, fine below),
`-turning.jpg` (swift left, fine right; 0°, 6°, 12°, 22°, 32°, 42°),
`-flying.jpg` (swift left), `-edge-crop.jpg` (swift on top, 1:1).

## Report — 2026-11-22, look button (908ef965)

On your 71def30f9, merged in (one-line import conflict in `island-scene.ts`).

- **Look button**, `ui/look-button.tsx`: bottom right, named by the current
  look ("Plain" / "Swift" / "Fine"), a tap steps it. It calls the scene's
  `stepLook`, the one function B also calls (`sceneLook` binds the key to it),
  and the page learns the look through `onLook`, so the button and B cannot
  disagree. Checked in Chromium: three taps go Plain → Swift → Fine → Plain,
  then B gives Swift, on an emulated iPhone 13 and on a 1440×900 desktop.
- 44 px tall on a touch screen; 27 px beside a keyboard. It is a sibling of the
  canvas, and the eye's pointer listeners sit on the canvas alone, so a tap on
  it never moves the eye and it takes no gesture outside its box.
- Not rendered under `?play`: the scene hands the page `stepLook` only off
  play, so no shot carries it.
- The page still opens plain. The controls hint has a touch row for the button,
  and the B row now names the three looks.
- **No ru**: the island page has one catalogue, `config/messages/en.json`, which
  every island string reads (`COPY`). The three names live there with the rest.
- `onLook` now carries the look itself, and `isFine(look)` in
  `@/island/shared/play` says which looks draw the trees, sky and sea. The
  trees still draw in swift and fine. `island-scene.ts`: 369 lines.
- `groundSpread` and the `spread` line in `cube-quadtree.ts` are untouched,
  for coast.

## Blocked: this session cannot send messages

Both `send_message` calls (to relief, then to the lead) were refused by this
session's permission classifier. This note is the channel until the operator
allows `mcp__claude-code-remote__send_message` here.

**The ask for relief**, to forward:
`export function groundSpread(metres: number): number` from the height barrel —
a TRUE upper bound on
`|heightAtSphere(coast, seed, p, f1) − heightAtSphere(coast, seed, q, f2)|` for
surface points `p`, `q` at most `metres` apart, any coast and seed, any two
detail cuts. Monotone; at 0 it is the most two cuts disagree at one point.
Roughly `Σ_k min(steepest_k · metres, swing_k)` plus the cut gap, with a test
sampling random pairs that it is never exceeded. When it lands, the `spread`
const in `quadtree/model/cube-quadtree.ts` becomes that import — one line.

**A smaller ask that also closes it**: `detailReach(f)` is already exported,
and |h0(p) − h0(q)| ≤ 2·detailReach(f) + slope_f·d, so what is missing is
slope_f, a slope bound for the ground drawn at cut f. In
`height/model/bounds.ts` that is `groundSlope(…, finest = 0)` with `per(...)`
summed over octaves no shorter than 2·f (the fade is constant in space, so it
adds no slope) and the dunes term dropped where `DUNE_SPACING_METRES < 4·f`, as
`detailReach` does, plus a test that sampled pairs never exceed it. About five
lines. With it, the quadtree picks f per tile to minimise
2·detailReach(f) + slope_f·side/2.

## Step 1 — tile brackets

Measured with `tmp/speed/count-tiles.ts` and `tmp/speed/experiment.ts` (world 0,
16:9, heading 0; counts are tiles selected):

| spot          | main | now | exact bracket | 2× measured spread |
| ------------- | ---: | --: | ------------: | -----------------: |
| alpine 3000 m |  112 | 167 |            86 |                110 |
| alpine 300 m  |  212 | 233 |           114 |                142 |
| alpine 2 m    |  171 | 215 |           116 |                134 |
| lowland 3000m |  146 | 252 |            78 |                116 |
| lowland 300 m |  233 | 239 |           116 |                147 |
| lowland 2 m   |  185 | 215 |           128 |                136 |

"Exact" samples 9×9 per tile with no slack (optimistic, not a bound); the last
column is what a true spread bound about twice the measured one would give.
Measured spread (largest |Δh| over 3000 random pairs on land): 2 m → 4, 32 m →
86, 512 m → 902, 2 km → 1495, 32 km → 2422, 512 km → 5525 m. The slope bound
says 750 m per metre.

Landed: the bracket reads all nine cap points, takes its slack from one
`spread` function, and is intersected with the parent's bracket (a child's
subtree lies in its parent's, so it stays a true bound). With the slope
stand-in the counts are unchanged; the gain arrives with `groundSpread`.

Not done, on purpose: judging `cubeSplitRule`'s distance at the tile's bracket
rather than at `min(eye, HIGHEST_GROUND)`. With a realistic bound it buys
little (lowland 3000 m 116 → 107), changes the LOD under the eye, and needs the
worker's `cubeDetailCut` call (trees' file) to change in the same commit.

## Step 2 — three looks (d1bda3f4)

`LOOKS = ['plain', 'swift', 'fine']` and `nextLook` in `@/island/shared/play`.
B steps plain → swift → fine → plain; the page opens plain. The hook's
`setFine(0|1)` is now `setLook(look)`, and the shooter takes
`--look plain|swift|fine` (default fine). Trees draw in swift and fine. Swift
draws exactly as fine for now. To make room, the `IslandScene` type moved whole
into `ui/island-scene-api.ts` (island-scene.ts: 360 lines), and `fine-key.ts`
became `look-key.ts`. Gates green; knip flags only `sandAt`/`sandAtSphere`,
which came in with the lead's merge.

## Step 3 — proposal, waiting for clouds' step 1 to merge

1. Clouds at quarter resolution with temporal reprojection: raymarch one texel
   of each 4×4 block per frame, reproject the rest by the eye's motion, drop
   history on disocclusion or outside the neighbourhood clamp. Largest win if
   the clouds are the fragment cost. SwiftShader can count texels raymarched
   per frame, not time them.
2. Trees' instance LOD by distance in swift (up to ~700k triangles at closed
   canopy).
3. The ground's 12-sample fine normal only within a few km of the eye.

Order proposed: clouds, then trees. The lead decides.
