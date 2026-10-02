# v14-strafe — hand-over note

The plan's **Strafing** bullet (§ "Rest of the bite" → "The operator's play of
version 14").

## Done

- Step 1 — the model and the keys (commit below this note's first push):
  - `model/stride.ts`: a second pace, `sidePace`, square to the heading
    (`sidewaysOf(heading)` = heading + π/2, the eye's right); `holdStrafe` /
    `letGoStrafe`; `tick` cruises the step along the heading, then the strafe
    across it, each through `cruise.ts`, so each eases over `KEY_EASE` and
    brakes on the rim as a step does. A step and a strafe held together share
    the cruise (each asks 1/√2), so the diagonal goes at the walk's pace.
    `walked` adds the frame's hypotenuse, so the bob and the footsteps count a
    strafe. `Steps` extends `pan.ts`'s `Held` (now exported).
  - `model/walk.ts`: `lockOf` — a drag within 45° of horizontal that went down
    above `groundTop` (the hills or the sky) locks to `'strafe'`, on the ground
    to `'turn'`; steeper ones step. A strafe re-takes the chase along
    `sidewaysOf(heading)` and aims it so the ground at the far seam's distance
    (`distanceOfRow(lens, groundTop)`) under the crossing's azimuth comes to
    the finger's azimuth exactly: `aim = reference · (tan a₀ − tan a₁)`, a₁
    clamped to ±1.3 rad. No faster than the cruise, no glide, never turning.
    `holdStrafe` / `letGoStrafe` over the stride.
  - `ui/scene/keyboard.ts`: `←`/`→` under Shift are `{kind: 'strafe'}`; an
    arrow's release lets go both its turn and its strafe (`letGoMoves`);
    Shift going down or up under a held arrow hands it over between turning
    and strafing. `instrument-input.ts` and `eye-input.ts` route it.
  - Tests: `stride.test.ts` (sideways at the cruise, eased, right is +x at
    heading 0, both held stand, diagonal at the cruise, rim brake and slide,
    a sideways chase), `walk.test.ts` (the ground-vs-above split, the far
    ground under the finger exactly on every screen, square to the heading,
    no faster than a step, keys), `keyboard.test.ts`.

## Left

The context budget ran out before the play run. What remains:

- A strafe line in `scripts/lib/play-walk.ts`: a horizontal drag from the
  sky (`y < camera.groundTop`) — the eye moves square to the heading, the
  heading unchanged, no faster than `STRIDE_CRUISE` (`checkWalk(..., 'drag')`
  fits it as it stands) — and Shift+`→` held, shot mid-way as
  `walk-strafe-*.png`. `page.key` (`mushroom-probe.ts` ~l. 461) sends no
  modifiers yet: Shift needs CDP's `modifiers: 8` on the arrow's
  `keyDown`, or a `Shift` key of its own in `ARROWS`, which
  `listenForKeys` hands over on.
- `pnpm play:mushrooms --screens tabL --plays walk` under the site lock, and
  a frame or two of a strafe mid-way into `frames/bite-12/v14/`.

## Decided

- The drag's reference distance is the farthest ground the screen shows (the
  seam), so the far world moves with the hand; nearer things slide farther, as
  parallax. Exact in azimuth (the tan form), not the small-angle ratio.
