# Relay 1 — drowsy eye builder, parked

## Standing constraints

From the lead's builder brief, which the /carte-blanche run delivered as this
session's opening message:

- Do not edit `docs/plans/drowsy-eye-intro.in-progress.md`. It is the lead's.
- Do NOT open a PR, and do not run /task, /plan, /go or /pr.
- Do not ask the operator anything. Their words: «меня не спрашивай, кажется,
  обсудили достаточно».
- Work on `claude/drowsy-eye-build-ha4w78` and push after every step that
  passes. The lead named this branch, so it is not renamed.
- Report to the lead with ONE `send_message` to
  `session_01DaohkEDLi4h9PRuRHgXuPy`; send an interim message only when blocked.

## The conversation

No operator message was typed in this session. Its turns were:

- **The opening brief** (system-delivered, from lead session
  `session_01DaohkEDLi4h9PRuRHgXuPy` on `claude/drowsy-eye-intro-ha4w78`): port
  the prototype's drowsy eye (`docs/plans/drowsy-eye-prototype.md`) into the
  cube's WebGPU renderer per `docs/plans/drowsy-eye-intro.in-progress.md`. Every
  knob goes on a console object `cube`, plus a GPU slowdown emulation.
  - The agent built it across several commits and reported to the lead that
    scatter could not be ported.
- **The lead's cross-session message**: "drop scatter entirely — no
  `setScatter`, no field in the settings schema, no shader path … Also drop the
  rolled salt/hash.wgsl requirement".
  - The agent removed scatter (15d1ad6c).
- **The final report**: the agent got vet green, ran /dry and /tend-prose, sent
  the lead the one report, and stopped the dev server. (verbatim in Last agent
  turn)
- **The keepalive's last wake**: it asked for `/relay park`, which wrote this
  file.

## Intent

Port the prototype's behaviour faithfully. With the eye off, the frame must be
byte-for-byte today's. Everything is controlled from the console, and the
slowdown makes the GPU's cost visible in the F meter's GPU ms.

## Decisions

- **Scatter is dropped.** A raster pass draws through one view-projection, so
  every block shares one sub-pixel offset. The lattice that leaves is the
  accepted cost ("embrace the glitch"). A resolve-side dither is the lead's
  follow-up to scope.
- **Fractional slowdown repeat goes first.** A pass's clear is not scissored,
  so a whole repeat after the fractional one leaves the image intact.
- **Type-overlap bases**:
  - the jitter is the scene's `Point`;
  - `Settled` is shared by the console and the settings;
  - `Vignetted` lives in the theme kit's `lens.ts`;
  - `SeenOnScreen` lives in `clock.ts`;
  - `Repeat.coverage` (not `rows`, which names a count);
  - History owns its textures through `dispose`.

## Errors and dead ends

- **Headless WebGPU.** `--disable-vulkan-surface` gives a white canvas. The
  flag set that works is in `tmp/preview/drowsy.cjs`, which is gitignored and
  not on the branch: `--enable-unsafe-webgpu --enable-features=Vulkan
--use-vulkan=swiftshader --use-webgpu-adapter=swiftshader
--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- **The F meter under SwiftShader** reads 0 fps and seconds-long frame times,
  with no GPU ms, so it cannot show the slowdown. A real GPU is needed.
- **The last local vet** failed only on `estimates`, from a git ref-lock race
  on `cost-ledger`. Re-run alone, it passed.

## State

- Branch `claude/drowsy-eye-build-ha4w78`, head 15d1ad6c (plus this relay
  commit). No PR, by the brief.
- Vet: GitHub run 43608036038 is green. The previous head was fully green in
  run 43607535968.
- The report to the lead was delivered. Nothing is running or waiting.

## Pointers

- New files:
  - `src/cube/pages/cube/ui/drowsy-{eye,phases,settings,resolve.wgsl}.ts` and
    their tests
  - `slowdown.ts` and `board-textures.ts` (same directory)
  - `src/cube/pages/cube/lib/uniforms.ts`
- Wired in: `renderer.ts` (at 400 lines), `bloom.ts`, `mips.ts`,
  `reflection.ts`, `pass-timer.ts`.
- Transcript: https://claude.ai/code/session_01DaohkDmAN4kMsfC88FQYVE

## Next step

Wait for the operator or the lead.

## Last agent turn

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Every job on GitHub's runners passed. The one failure is the local `estimates` check, and its cause is a git fetch race on the `cost-ledger` ref, not the code. Re-running it alone:

Every check is green. Stopping the dev server, then sending the report.

The drowsy eye is built and pushed to `claude/drowsy-eye-build-ha4w78` (head 15d1ad6c), vet is green, and I sent the lead the report.

**Vet:** every job on GitHub's runners passed (run 43608036038). Only the local `estimates` check failed, because a git fetch collided with another one on the `cost-ledger` ref. It passed when re-run on its own. The previous commit, c9e80f89, passed vet with nothing failing at all.

**Render check:** headless Chromium could run WebGPU through software rendering (SwiftShader), so I could look at it.
- `cube.setDrowsy(true)` visibly changes the view. At share 4 and drowsiness 1 the beach and sky turn blocky and smeared; with the eye awake the picture is clean.
- Two early shots (awake, share 2 at drowsiness 1) caught the intro while it was still dark (the opening eyelid phase), so they show little.
- I could not confirm the slowdown on screen. Software rendering takes seconds per frame, and it reports no GPU timings, so the F meter shows 0 fps either way. The GPU ms with `cube.setSlowdown(4)` still needs a check on a real GPU.

**Scatter:** removed completely, as the lead asked mid-run. A raster pass gives every block the same sub-pixel offset, so it could not work.

**Clean-up passes:** /dry changed nothing. The one borderline repeat is that three files build the same kind of texture; two of them predate this branch, so I left it. /tend-prose made two comment fixes, which are committed.

**Changes outside the new files:**
- `src/cube/CLAUDE.md`: one rule now lets a player's view use their own earlier frames.
- Two shared types added because the type-overlap check required them: `SeenOnScreen` in `clock.ts` and `Vignetted` in the theme lens kit.
- `bloom.ts`, `mips.ts` and `reflection.ts` take a repeat parameter for the slowdown.
- The two lens shaders apply the vignette.

The screenshots are in `tmp/preview/`, and I stopped the dev server. I started no sessions, so there are none to archive.
```
