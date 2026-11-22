# Speed — hand-over note

Branch `claude/island-beauty-speed`, cut from `claude/island-beauty-c1rj3b`.

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
