# The cube: looking at a frame headlessly, and the quick gates

Measured on this cloud container (4 cores, no GPU), 2026-11-12. Draft: timings for further frames and the gates are filled in below as they are measured.

## The recipe, shortest form

```bash
pnpm gallery:cube --floors 1 --out "$PWD/tmp/intro-probe"
```

- Run from the repo root, one foreground call, nothing to start first and nothing left behind.
- **Pass `--out` as an absolute path.** `pnpm gallery:cube` and `pnpm play:cube` go through `scripts/in-site.sh vova`, which enters `sites/vova/`, and the scripts `path.resolve` the flag against that. `--out tmp/intro-probe` wrote `sites/vova/tmp/intro-probe/floor-01.png` (gitignored by the `tmp/` pattern, but not where anyone looks). With no `--out` the default is the root `tmp/cube-gallery/` (`tmp/cube/` for `play:cube`).
- Output: `<out>/floor-NN.png`, 1280x800 PNG, ~1.5 MB. Open it with the `Read` tool.
- The floor-1 frame shows: an office room corner, cream walls over a green dado with a wood rail, a tiled ceiling with two lit panels, a cork board on the right wall, a door and a potted plant at left, speckled carpet with yellow seams, a "Floor 1" chip top-left. (Next's dev-tools "N" badge sits bottom-left, since the page is a dev page.)

## What the command starts

- **A `next dev` of its own for site `vova`**, on a free port the OS hands out (42135 on this run; different every run), spawned straight from `node_modules/.bin/next` in its own process group and killed when the script ends (`src/kernel/scripts/lib/print-origin.ts`). No static build is needed or used.
- **A headless Chromium** over the DevTools protocol on Node's own `WebSocket`, no Playwright or Puppeteer (`src/scene/scripts/lib/cdp.ts`). Flags: `--headless=new --no-sandbox --remote-debugging-port=0 --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --user-data-dir=<temp>` plus `WEBGPU_FLAGS`: `--enable-unsafe-webgpu --enable-features=Vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader`.
- The script prints `adapter: google swiftshader`: WebGPU on SwiftShader's Vulkan, a software adapter. Frames say what the scene draws, never how fast.
- It navigates to `http://localhost:<port>/cube?play` at 1280x800, device scale 1, waits up to 180 s for `window.__cubePlay.ready` to exist, awaits `ready()`, then shoots with `Page.captureScreenshot`.
- Any page error (uncaught exception, or what `watchPageErrors` hears) ends the run red at once rather than at the timeout.

## Timings (first run, cold `.next`)

- 0.4 s: pnpm up. 3.0 s: "waiting for the dev server". 21.6 s: `adapter:` line (dev server up, `/cube` compiled, hook ready). 40.5 s: first `shot` line. 40.7 s total wall clock.
- So ~20 s to a ready page and ~19 s for the first frame on a cold tree.

## Shooting from an arbitrary pose and clock

The hook is `window.__cubePlay` on `/cube?play` (`PLAY_HOOK`, `PLAY_QUERY` in `src/cube/pages/cube/lib/play.ts`; the page takes no input in that mode and opens with its clock stopped at `PLAY_INSTANT`, noon UTC 2026-11-01, so two runs shoot the same frame):

- `ready(): Promise` resolves once the scene can draw.
- `adapter(): string` is the adapter's vendor and architecture.
- `setPose(pose, moving?): Promise<void>` puts the eye at `pose`, with `moving` quads (hands, each in its own room's frame) drawn until the next call, and resolves once a frame of it is on screen. That is why a shot needs no sleep.
- `setClock(ms): void` stops the clock at `ms` since the epoch; every frame from the next is of that instant.
- `press(): Promise<void>` presses E as the keyboard would (a sign in reach opens its offer); resolves once a frame has read it.

A `Pose` is `{ n, x, y, u, v, eyeAbove, scale, yaw, elevation }`: floor `n` (1-based), room `x`, `y` as **bigints**, `u`, `v` in room sides (0 to 1), `eyeAbove` (use `EYE_HEIGHT` from `@/cube/features/player`), `scale` 1, `yaw` and `elevation` in radians.

From a script, copy `gallery-cube.ts` (it is 90 lines) and call the wrapper, which is the whole API a builder needs:

```ts
import { withCubePage } from './lib/cube-page';
await withCubePage(async ({ shoot, setClock }) => {
  await setClock(Date.UTC(2026, 10, 1, 20)); // optional
  await shoot('/abs/path/tmp/x.png', {
    n: 3,
    x: 2n,
    y: 1n,
    u: 0.5,
    v: 0.5,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: 0.3,
    elevation: -0.04,
  });
});
```

`withCubePage` exposes `shoot` and `setClock` only; `press` is on the hook but not on the wrapper, so a script that needs it adds a line to `src/cube/scripts/lib/cube-page.ts`. `play-cube.ts` shows the other pattern: run the pure `play()` simulation in Node to get poses and hands at chosen moments, then `shoot` each.

## The quick gates

(Measured durations follow in the next revision of this file.)

## Traps

- One `next dev` per site directory: a second one on the same checkout hits `sites/vova/.next/dev/lock`. Two agents shooting frames on one checkout collide; each needs its own worktree, or they take turns.
- Scratch `*.test.ts` under `tmp/` (and a leftover worktree inside the repo) is picked up by the test glob and turns the suite red.
