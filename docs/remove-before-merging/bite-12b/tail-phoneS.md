# Package tail-phoneS — hand-over note

Two steps on a probe build of 70e1547, alone on the container: phoneL's
`approach` once more, then every play on phoneS, one per call.

## Step 1 — phoneL `approach`: red on a quiet container, the forest's cost

Still red, and reproducibly: frame-JS median **31.1 ms** (load 0.69 before,
4.26 after — the build and the play's own browser), **30.7 ms** on a re-run
with `--no-build` (load 3.92 → 4.71, nothing but the play running). The
"neither" frames (no lawn tending, no perch re-sight): 710, median 29.0 ms.
phoneP on the same build and the same play: **12.2 ms**. So the 47.1 ms of the
last run was partly the busy machine, but the red is the screen's own.

**Where a frame goes.** A CPU profile of every drawn frame (sampling at
100 µs, on an unminified build), the 197 frames within 3 ms of the median: of
26.4 ms in `game.step`, Phaser's `GraphicsWebGLRenderer` takes 24.1, of which
`earcut` — the triangulation of every filled path — 13.1 and the batcher 5.4.
The game's own work is small: `drawMushroom` 0.4, `paintLit` 0.4, lawn
`tendOn` 0.2, `update` 2.3 in all. Phaser re-triangulates every Graphics'
command buffer on every frame it draws, whether or not the game redrew it.

**Why landscape costs more.** Counting the Graphics drawn per frame on the
same play (median frame):

| Screen | frame JS | Graphics drawn | buffer entries | ones over 5000 entries |
| ------ | -------- | -------------- | -------------- | ---------------------- |
| phoneL | 29.0 ms  | 85             | 205 455        | 19                     |
| phoneP | 12.5 ms  | 35             | 69 756         | 6                      |

The ones over 5000 entries carry 7–12.7 k each and are the mushrooms (depth
by distance, one per planted mushroom); at the median frame they take 17.8 ms
of phoneL's 23.9 ms of Graphics time. Frame time follows how many are in view
— phoneL frames with 3–5 of them take 7–8 ms, with 16 about 21 ms, with
24–26 38–56 ms; phoneP's frames with 12 take 20.7 ms. About **1–1.5 ms per
mushroom in view**, and the landscape phone sees about three times the forest
the portrait one does (27 mushrooms stand there).

**Not fixed** — the cause is the game's (how its mushrooms are drawn), but no
small change removes it. Options, for a call:

1. **Bake a mushroom to a texture** while its drawing holds still, drawing it
   as an image; re-bake when it changes. Removes the per-frame triangulation
   for still mushrooms; the light turns with the heading, so a turning walk
   re-bakes every mushroom in view anyway — the turn is half this play.
   Not small.
2. **Fewer points for a small mushroom** — a level of detail by drawn size: a
   far cap 20 px across carries the same 12 k entries as one filling the
   screen. Cuts the cost where the forest is deepest; needs a look that the
   far caps still read.
3. **Hold phoneL to its own budget** (or the approach play to one): a harness
   call that states the forest on a wide screen costs ~30 ms under the
   software rasterizer. Leaves a real phone's CPU doing the same `earcut`.

## Step 2 — phoneS, every play

Pending.
