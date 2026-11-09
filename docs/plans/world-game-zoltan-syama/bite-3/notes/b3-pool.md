# b3-pool — the tile pool sized by the device's cores

**Verdict: the phone check holds.** On the phone screen at 527 m the view
settles in 3.2 s on 4 workers against 4.7 s on 2, the main thread stalls no
more, and the field still builds in 2.2 s (< 3 s). The price is memory — each
worker adds ~135 MB to the page, not the 16 MB its field takes — and a first
frame ~0.7 s later, which at 13 km eats the whole fill gain.

## Change

`poolSize(cores)` in `src/island/pages/island/lib/tile-pool.ts`:
`hardwareConcurrency − 1`, clamped to 1…4, and 2 when the browser does not say;
the pool spawns `poolSize(navigator.hardwareConcurrency)` workers. Test beside
it (undefined → 2, 1 → 1, 2 → 1, 4 → 3, 8 → 4). `COAST_FINER` stays 2.

## How it was measured

The vova export built at c3137343 (`pnpm build vova`), driven over CDP as run 5
and b3-coast did (`b3-pool/drivers/pool.ts.txt` → `tmp/b3-pool/`).
`hardwareConcurrency` is overridden before any page script
(`Page.addScriptToEvaluateOnNewDocument`), and a counting `Worker` wrapper
confirms the pool: **hc 3 → 2 workers (the old pool, "before"), hc 4 → 3, hc 8 →
4**. Each run a fresh browser: world #0 opened at 20,000 km over the pose
(heading 300°, look 0), `ready()`, then `setHeight(h)` timed until it resolves
(every selected tile drawn). 13 km over 41° N 14° E; 527 m over 41° N 13.96° E.
Desktop 1440×900 @1; phone 390×844 @3, mobile, touch. Two runs per cell, mean
shown. While descending, a `requestAnimationFrame` probe logs frame gaps and a
`longtask` observer the main thread's long tasks. Memory is the renderer
process's RSS once settled (workers live in it; one browser running, load ≤
3.6). Headless, SwiftShader, 4 cores.

## Numbers

Settle = `setHeight` to every tile drawn. Ready = navigate to first frame (field
built). fps = rAF callbacks per second while loading.

| screen  | h     | workers | ready (s) | buildMs | settle (s) | ready + settle | fps loading | renderer RSS (MB) |
| ------- | ----- | ------- | --------- | ------- | ---------- | -------------- | ----------- | ----------------- |
| desktop | 527 m | 2       | 2.22      | 1.63 s  | 5.60       | 7.8            | 53          | 1,445             |
| desktop | 527 m | 3       | 2.55      | 1.90 s  | 4.38       | 6.9            | 48          | 1,564             |
| desktop | 527 m | 4       | 2.87      | 2.30 s  | 3.78       | 6.6            | 42          | 1,702             |
| desktop | 13 km | 2       | 2.26      |         | 1.98       | 4.2            | 44          | 1,342             |
| desktop | 13 km | 3       | 2.65      |         | 1.72       | 4.4            | 35          | 1,439             |
| desktop | 13 km | 4       | 3.16      |         | 1.60       | 4.8            | 24          | 1,611             |
| phone   | 527 m | 2       | 2.13      | 1.53 s  | 4.67       | 6.8            | 52          | 1,411             |
| phone   | 527 m | 3       | 2.54      | 1.80 s  | 3.68       | 6.2            | 49          | 1,561             |
| phone   | 527 m | 4       | 2.80      | 2.19 s  | 3.20       | 6.0            | 46          | 1,680             |
| phone   | 13 km | 2       | 2.09      |         | 2.81       | 4.9            | 48          | 1,374             |
| phone   | 13 km | 3       | 2.40      |         | 2.32       | 4.7            | 44          | 1,530             |
| phone   | 13 km | 4       | 2.97      |         | 2.10       | 5.1            | 41          | 1,648             |

(buildMs per screen is the mean over both heights' runs.)

- **Settle at 527 m: −32 % on 4 workers** (desktop 5.6 → 3.8 s, phone 4.7 → 3.2
  s), short of Node's halving (3.96 → 1.99 s) because the page's upload and draw
  do not shrink with the pool. At 13 km, −20 to −25 %.
- **Main thread: no more stutter.** rAF median 16.7 ms in every run; exactly one
  long task per descent, 77–153 ms total, with no trend over the pool. The
  longest rAF gap grows (0.46–0.61 s on 2 workers, 0.58–1.03 s on 4) and fewer
  frames arrive while loading (desktop 13 km 44 → 24 fps): with no long task to
  account for it, that is the workers taking CPU from the SwiftShader rasterizer
  on this 4-core box — the hc 8 run puts 4 workers on 4 real cores. A GPU-drawn
  phone does not pay that, so this is the pessimistic side.
- **buildMs: under 3 s, but it grows ~40 %** (1.5–1.6 s → 2.2–2.3 s on 4
  workers). The field is built **per worker**, all at once on `init`; the build
  reported is worker 0's, slowed by the others building theirs beside it. It
  does not multiply, but a device whose 2-worker build is already over ~2.1 s
  would cross 3 s on 4.
- **Memory: ~135 MB of renderer RSS per worker** (four configurations, all
  +128–137 MB/worker; 2 → 4 workers adds ~270 MB). The 16 MB field is the small
  part: each worker is its own isolate with the terrain code, its field build's
  scratch and its tile buffers. The main thread's JS heap (66–159 MB) does not
  move with the pool. `performance.memory` sees the main thread only, and the
  workers' own heaps did not answer over CDP (`Runtime.getHeapUsage` on an
  attached worker timed out), so RSS is the measure.
- **Console: clean** — no page or console error in any of the 24 runs.

## Left

- The memory cost is the open question for phones: a 3 GB phone reporting 8
  cores gets ~540 MB of workers. A device-memory cap (`navigator.deviceMemory`)
  could bound it; not part of this step.
- Workers 1…n rebuilding the field worker 0 already copies out is where the
  slower first frame and the build scratch come from; handing them that copy
  instead would remove both. Not measured.
