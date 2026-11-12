# The cube: looking at a frame headlessly, and the quick gates

Everything here was run on this cloud container (4 cores, no GPU) on 2026-11-12, branch `claude/cube-intro-j2wt34`, unless a line says "documented". Load average is given where it bears on a time.

## The recipe

```bash
pnpm gallery:cube --floors 1 --out "$PWD/tmp/intro-probe"
```

- One foreground call from the repo root. Nothing to start first, nothing left running after (checked: no `next`, no Chromium, no listening port).
- **Pass `--out` as an absolute path.** `gallery:cube` and `play:cube` run through `scripts/in-site.sh vova`, which enters `sites/vova/`, and the script resolves the flag from there: `--out tmp/intro-probe` wrote `sites/vova/tmp/intro-probe/floor-01.png`. With no `--out` the frames go to the root `tmp/cube-gallery/` (`tmp/cube/` for `play:cube`).
- Output: `<out>/floor-NN.png`, 1280x800, about 1.5 MB. Look at it with the `Read` tool.
- `--floors 1,12,40` takes any list; the default is floors 1 to 8. Each floor is shot from a pose the script picks (eye height, a room near the floor's middle, down the longest open run).
- What floor 1 shows: an office room corner, cream walls over a green dado with a wood rail, a tiled ceiling with two lit panels, a cork board on the right wall, a door and a potted plant at left, speckled carpet with yellow seams, a "Floor 1" chip top-left. Next's dev badge ("N") sits bottom-left in every frame, because the page is served by `next dev`.
- The frame is deterministic: floor 1 came out byte-identical in three separate runs.

## What it starts

- **Its own `next dev` for site `vova`**, on a free port the OS picks (42135, 34221, 41495 on three runs), spawned from `node_modules/.bin/next` in its own process group and killed when the script ends (`src/kernel/scripts/lib/print-origin.ts`). No static build is used.
- **Headless Chromium over the DevTools protocol**, on Node's own `WebSocket`; the repo keeps no Playwright or Puppeteer (`src/scene/scripts/lib/cdp.ts`). Flags: `--headless=new --no-sandbox --remote-debugging-port=0 --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --user-data-dir=<temp profile>`, plus `WEBGPU_FLAGS`: `--enable-unsafe-webgpu --enable-features=Vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader`.
- The run prints `adapter: google swiftshader`: WebGPU on SwiftShader's Vulkan, in software. A frame says what the scene draws, never how fast it draws.
- It opens `http://localhost:<port>/cube?play` at 1280x800, scale 1, waits up to 180 s for `window.__cubePlay.ready`, awaits it, then takes each frame with `Page.captureScreenshot` (`src/cube/scripts/lib/cube-page.ts`).
- The first page error ends the run red at once.

## Timings

- **Cold tree (no `.next`), one floor: 40.7 s.** Dev server up and the page's hook ready at 21.6 s, the frame saved at 40.5 s.
- **Warm tree, four floors (1, 2, 3, 12): 133 s.** First frame about 24 s in, then 38.5 s, 36.4 s and 34.8 s for each further floor. Load average reached 5 from this run alone.
- **Same floor, new pose: 15 to 17 s a frame.** From a scratch script: hook ready 5 s after start, first floor-1 frame 18 s later, three more floor-1 poses at 16.7, 15.2 and 15.5 s; the first frame of floor 2 took 41 s and the second 23 s; back on floor 1, 20 s.
- So budget about 25 s to the first frame, 15 to 20 s for each further frame on a floor already drawn, 35 to 40 s for the first frame of a new floor. Ten frames across floors is about five minutes, inside the tool's ten-minute ceiling; more than that is two calls.
- `pnpm play:cube` (ten frames: the hole from both sides, then the lever pull and fall) was not run here; by the numbers above it is four to six minutes.

## Shooting from any pose and clock

The hook is `window.__cubePlay` on `/cube?play` (`PLAY_HOOK` and `PLAY_QUERY` in `src/cube/pages/cube/lib/play.ts`). In that mode the page takes no input and its clock is stopped at `PLAY_INSTANT`, noon UTC on 2026-11-01, which is why two runs give the same frame.

- `ready(): Promise` resolves once the scene can draw.
- `adapter(): string` is the adapter's vendor and architecture.
- `setPose(pose, moving?): Promise<void>` puts the eye at `pose`, draws the `moving` quads (the hands, each in its own room's frame) until the next call, and resolves once that frame is on screen. A shot therefore needs no sleep.
- `setClock(ms): void` stops the clock at `ms` since the epoch; every frame from the next is of that instant.
- `press(): Promise<void>` presses E as the keyboard would (a sign in reach opens its offer) and resolves once a frame has read it.

A `Pose` is `{ n, x, y, u, v, eyeAbove, scale, yaw, elevation }`: floor `n` from 1, room `x` and `y` as **bigints**, `u` and `v` across the room from 0 to 1, `eyeAbove` (`EYE_HEIGHT` from `@/cube/features/player`), `scale` 1, `yaw` and `elevation` in radians.

The script-side wrapper is `withCubePage` (`src/cube/scripts/lib/cube-page.ts`), which hands a script `shoot(file, pose, moving?)` and `setClock(ms)`. This scratch file, saved as `tmp/x/probe.ts` and run with `scripts/in-site.sh vova tsx "$PWD/tmp/x/probe.ts"`, worked as written:

```ts
import path from 'node:path';
import { EYE_HEIGHT } from '@/cube/features/player';
import { withCubePage } from '@/cube/scripts/lib/cube-page';

await withCubePage(async ({ shoot, setClock }) => {
  await setClock(Date.UTC(2026, 10, 1, 23)); // optional
  await shoot(path.resolve(import.meta.dirname, 'f2.png'), {
    n: 2,
    x: 0n,
    y: 0n,
    u: 0.5,
    v: 0.5,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: 2,
    elevation: -0.04,
  });
});
```

- That frame is a real picture of floor 2: green striped walls, blue checked carpet, a desk with a monitor and a red chair, a poster, a pinboard partition.
- `setClock` to 23:00 UTC left the floor-1 frame byte-identical at the pose tried, so nothing in that view reads the clock. Which parts of the scene do was not looked into here; `cube-canvas.tsx` line 151 (`frozen`) is where the clock is held.
- `press` is on the hook but not on `withCubePage`; a script that needs it adds one line to the wrapper beside `setClock`.
- `play-cube.ts` is the pattern for a moment in a sequence: run the pure `play()` in Node to get the pose and hands at that moment, then `shoot` it. Nothing is timed against the wall clock.
- Name a scratch script anything but `*.test.ts`: the test glob reaches into `tmp/`.

## The quick gates

Each measured alone, one after another, load 1 to 2.5. All green except where said.

- `pnpm shaders:cube` — 2.9 s, "66 of 66 floors compile". Every floor's WGSL through Chromium's WebGPU compiler; it starts a blank page on its own port and no dev server. `--floor 12` for one (1.7 s). The cheapest check there is on a shader change.
- `pnpm typecheck` — 17 s. `tsc --noEmit` on the root project, tests included.
- `pnpm lint:files src/cube` — 36 s. ESLint over the cube alone, MASD boundaries included.
- `pnpm lint:check` — 151 s, the whole tree. `pnpm lint` is the same with `--fix`, so it rewrites source.
- `pnpm exec prettier --check src/cube` — 3.3 s.
- `pnpm format:check` — 23 s, **red at HEAD**: `src/cube-board/app/config/cube/best-of.yaml`, committed in 7136ff81. Not the cube's, but vet will stop on it.
- `pnpm test` — under 1 s on a branch that has changed nothing; it runs only the tests the branch reached (a changed test, or the `<stem>.test.ts` beside a changed file).
- `pnpm test $(find src/cube -name '*.test.ts')` — 18 s, 57 files, 565 tests: the cube's whole suite.
- `pnpm test scripts/line-limit.test.ts` — 0.8 s: the 400-line cap.
- `pnpm check:masd` — 2.2 s. `pnpm masd:clusters` — 1.5 s. `pnpm check:cycles` — 5.7 s. `pnpm check:poison` — 2.3 s.
- `pnpm type-overlap` — 2.2 s. `pnpm knip` — 2.4 s. `pnpm lint:css` — 2.0 s.
- `pnpm lint:fsd` — 27 s (Steiger, one run per app root).

The slow ones are `lint:check` (2.5 min), `lint:files src/cube` (36 s), `lint:fsd` (27 s), `format:check` (23 s), the cube tests (18 s) and `typecheck` (17 s). With lint and prettier scoped to `src/cube` the whole list is about two and a half minutes in sequence.

Not for a quick pass: `pnpm test:all` (the rule file says not to start it by hand; the mammoth notes put the suite at six to ten minutes) and `pnpm build` (one build per site).

## How `./scripts/vet.sh` differs

- It runs on GitHub's runners, from the **pushed** head: bare, it refuses a dirty tree or an unpushed commit (exit 2), dispatches `.github/workflows/vet.yml` on the branch, runs only its `local` phase here (the checks that read the branch's history and the cost ledger), then waits and prints the failed jobs' logs.
- It is the only place the builds run, and `pnpm build` is the only check that covers a page; the checks that read the exports (`check:mantine-styles`, `check:i18n-payload`) come with it.
- It runs at milestones, with `/finalize` as its usual caller, and nothing runs on pull requests.
- One phase can be run here by hand: `scripts/vet.sh typecheck`, `source`, `built`, `local`, `build <site>`, `lint <k>/<n>`.

## Traps for several agents on one checkout

- **One `next dev` per site directory** (documented in `print-origin.ts`, not tried here): it holds `sites/vova/.next/dev/lock`, so a second frame run on the same checkout fails while the first is up. The mammoth notes' answer was a `flock` around anything that builds or serves the site, or a worktree per agent.
- **Ports do not collide**: the dev server, the shader page and Chromium's debug port are all OS-assigned.
- **CPU does.** One frame run takes the load to 3 to 5 on 4 cores, so two at once roughly double every time above, against a 180 s wait for the hook and 120 s for the dev server. Frames one agent at a time.
- **No build beside a type check or ESLint in one tree** (documented, `.claude/rules/stack.md`): a build rewrites `.next/types/` under them.
- **A production build fails in a worktree inside the repo** (documented, mammoth `subagents.md`: Turbopack symlinks, Google Fonts) and works in a scratchpad worktree after `pnpm install --offline` with a real `node_modules`.
- **A harness worktree (`isolation: "worktree"`) lands under `.claude/worktrees/` and starts from the default branch**, not this one, and its tests fall into the suite's glob; remove it when its work lands.
- **Scratch `*.test.ts` under `tmp/` turns the suite red** for everyone.
- **In a shared tree, no `git stash`, `git checkout -- <path>` or `git restore`**: they sweep up a sibling's edits. `git add` your own paths only and wait out an `index.lock`.
- **`tsc -p sites/vova/tsconfig.json` skips the tests**; `pnpm typecheck` is the one vet runs.
- **Agents' usual gate lists miss `pnpm knip`**; an export nothing reads goes red only at vet.
