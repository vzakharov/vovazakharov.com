# Bite 17 — package `perf`: dusk renders slower than day

The operator's report: «на сумерках значительно медленнее отрисовка, M2 Pro ~20 fps», day fine.

## Status

Measured, cause found, **no fix landed yet** — the agent ran out of context before
the fix. The next step is designed below so a successor can build it straight away.

## Cause

At full dusk the frame sends **4.5× the draw calls and 1.8× the vertices** of day,
because every dusk piece is a live `Phaser.GameObjects.Graphics`, which Phaser
re-tessellates and re-uploads (`bufferSubData`) every frame, and the fireflies switch
blend mode twice each, so every firefly breaks the batch. The script-side work is
small (all of `update` at dusk is under 1 ms); the cost is in `render`, almost
all of it in `setCurrentBatchNode → bufferSubData` (the CPU profile, below). On
Chrome/ANGLE-over-Metal, uploading into a vertex buffer the GPU is still reading
can stall, so the cost goes up with each extra flush. That would fit a fast
machine falling to 20 fps; no Mac was on hand to confirm it.

## Numbers (tabL 1180×820 @2, the play run's software rasterizer)

GL work per frame. These counts come from wrapping `gl.draw*` and are the same
on every run:

| frame                         | draw calls | vertices (indices) | framebuffer binds | clears |
| ----------------------------- | ---------: | -----------------: | ----------------: | -----: |
| full day                      |          8 |             62 694 |                 0 |      1 |
| full dusk, everything on      |         36 |            114 742 |                 5 |      4 |
| dusk, every dusk piece hidden |          7 |             61 014 |                 0 |      1 |

Each piece hidden alone at full dusk, and what that removes:

| piece                                            |      draws | vertices | other                                                                                                                                                                                                 |
| ------------------------------------------------ | ---------: | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fireflies (12, halo ADD + body + tail each)      |    **−24** |  −13 800 | blend switch ADD↔NORMAL inside each container breaks the batch twice per firefly                                                                                                                     |
| window glow (two houses, every window)           |         −1 |  −15 500 | `paintGlow` runs only on change, but the Graphics are tessellated again every frame: 8 halo rings per window                                                                                          |
| dusk cloud twins                                 |          0 |  −13 300 | the day clouds under them (same puffs) are tessellated too, though fully covered at level 1                                                                                                           |
| moon                                             | −4 (masks) |   −9 600 | **5 framebuffer binds + 3 clears**: a cloud mask is active (a cloud within the moon's reach), so the moon goes through a full-screen filter pass each frame; the shape is tessellated every frame too |
| stars (12 Graphics)                              |          0 |   −5 400 | —                                                                                                                                                                                                     |
| dusk wash, dusk sky/ground bakes, live `relight` |          0 |       ~0 | baked textures and one rectangle; `relight` and `raiseHills` redraw only on a `LIGHT_STEPS` change                                                                                                    |

Frame time, median of `game.step` in milliseconds. The machine was shared with
other agents' builds, so the same setup gave anything from 16 to 35 ms between
runs. Read the times as rough and the counts above as exact:

| run         |  day |      dusk | dusk, all dusk pieces hidden |
| ----------- | ---: | --------: | ---------------------------: |
| run 1       |  9.6 |      30.1 |                            — |
| run 4       | 10.5 |      28.3 |                            — |
| run 6 (A/B) |  9.9 | 26.4–29.3 |                         10.8 |

A/B timings (alternate frames with the piece on and off, run 5/6) pointed to the
fireflies (+2.4 to +8.9 ms), the dusk cloud twins (−0.5 to +7.4 ms) and the
window glow (−0.3 to +12.4 ms) as the costs. The wash, the dusk bakes and the
stars measured within noise.

CPU profile over 60 frames (the sampling profiler inflates everything, so read it
as ratios): the JS time per frame is 2.5× day's at dusk, and in both the cost is
`render → batch → setCurrentBatchNode → bufferSubData`. Update-side work
(`fireflies.update`, `house.light`, `relight`, `bed.update`) is ≤ 0.3 ms each.

## Next step (designed, not built)

The aim is fewer flushes and fewer vertices, with dusk looking the same:

1. **Fireflies** (`firefly-view.ts`, largest draw-call win, −24 draws). Split each
   firefly into a halo container (the ADD halo) and a body container (body + tail).
   Create all 12 halo containers first, then all 12 body containers, at the same
   `depth`, so the display list holds every halo and then every body: one ADD
   batch and one NORMAL batch. In `draw`, set both containers to the same
   position, scale, rotation and alpha, and keep the tap hit on the body
   container. Then bake the three static shapes (drawn once in `paint`) into
   textures and show them as `Image`s, which cuts ~13.8k vertices to about 36
   quads. Use `generateTexture` as `rain-drops.ts` does, drawn at
   `unit × devicePixelRatio`, or a `RenderTexture` at the layout ratio as
   `bake-picture.ts` does. Re-bake in `paint` only. Look change: a halo no longer
   lands over a neighbouring firefly's dark body when two overlap, which is rare
   and tiny.
   **Items 2 and 4 are done (package `pw`).** The glow is a `WindowGlow`: each house's lit
   windows painted on change into a canvas texture of its own at `zoom × camera zoom` texels a
   unit, shown as one `Image` in the house's transform, and destroyed with the house. The stars
   are `Image`s of one shared `dusk-star` canvas texture baked at the widest star's size in
   device pixels (`starImages`). Full dusk on tabL, same bench: **36 draws / 122 974 vertices
   before, 36 / 102 160 after (−20.8k)**; day unchanged at 8 / 62 706. A/B: house.glow now
   costs 3 vertices, the stars 66. Against a build of the base, the `dusk` play's frames differ
   only on the stars' and windows' antialiased edges. In the bench patch, the glow is now
   `s.house.glow.image` (two lines in `play-bench.ts`).

2. **Window glow** (`window-glow.ts` / `house-view.ts`, −15.5k vertices). Paint
   the glow into a texture whenever `paintGlow` runs now (on change only), and show
   it as an `Image` that follows the house's transform as the glow Graphics does
   now. Its resolution comes from the house's zoom, which already marks the
   house `stale` and repaints it.
3. **Day clouds under opaque dusk twins** — **done** (package `pm`, `pm.md`).
   `relight` sets the day clouds' alpha to 0 at `level === 1` (alpha, not
   `visible`, which `rain-view.placed()` and the probe read as "on the
   screen"). The moon's cut takes the twin as its source at full dusk and the
   day cloud before it (a fading twin is composited at its fade, so it would
   cut the moon only partly).
4. **Stars** (−5.4k vertices): one shared star texture, scaled per star, as
   Images, with alpha set from `starClear` as now.
5. **Moon** — **done** (package `pm`). `MoonView` (`moon-view.ts`) draws the
   moon once per paint, supersampled, into a texture a texel to a device pixel,
   and shows it as one quad faded by its alpha (`moonUp`); its place and tap
   are unchanged. The filter masks are gone: a cloud reaching it is _erased_
   from the shown texture, which is redrawn only when a cut moves by a device
   pixel (clouds drift 4–7 CSS px/s, so a few times a second), with no
   full-screen pass at all. Depth order was not usable: a cloud above the moon
   must also be above the wash (the moon is, call 7), and then it is unwashed
   and covers the fliers in front of it.

   Full dusk, tabL, the same bench before and after (fireflies, glow and
   stars untouched):

   | frame                      | draw calls | vertices | framebuffer binds | clears |
   | -------------------------- | ---------: | -------: | ----------------: | -----: |
   | before                     |         36 |  122 974 |                 5 |      4 |
   | after, most frames         |         33 |   94 086 |                 0 |      1 |
   | after, a frame that recuts |         35 |   97 638 |                 2 |      2 |

   The moon itself is now 1 draw and ~90 vertices on the screen (A/B), from
   −4 draws and −9.6k. Frames `before`/`after` of the `dusk` play differ only
   at the moon's antialiased edges (`frames/bite-17/pm-tabL.png`).

Before and after are measured with `perf-bench.patch` (beside this note). It adds
a temporary `bench` play and a `mac` screen (1512×900 @2) to
`scripts/play-mushrooms.ts`, which reports GL counts, per-object render times, A/B
toggles and a CPU profile:

```
git apply docs/remove-before-merging/bite-17/perf-bench.patch
BENCH_N=21 BENCH_OUT=<scratch>/b.txt flock /home/user/vovazakharov.com/tmp/site.lock \
  pnpm play:mushrooms --no-build --screens tabL --plays bench   # after a probe build
```

`BENCH_NOAB=1` skips the A/B toggles. The patch must never land as source:
reverse it with `git apply -R` before committing.
