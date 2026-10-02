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

- Step 2 — the play (v14-strafe2):
  - `page.key(key, type, { repeat, shift })`: Shift goes out as CDP's
    modifier bit 8 on the arrow's own event (`play-mushrooms.ts` sends it),
    so `keyAction` reads `shiftKey`; the Shift handover in `listenForKeys`
    is not exercised by the play.
  - `play-walk.ts` § `playStrafes`, run right after the `↑` walk (near the
    middle: from the rim a strafe slides along it, and once the slide ends
    square to the strafe `Shift+→` has no room at all — the first run, with
    the strafes at the end of the play, showed exactly that, correctly).
    A 150 px leftward swipe over 12 frames from a bare point in the sky, then
    `→` held 1.5 s under Shift: each checked square to the heading (the
    along-heading part ≤ 2 % of the sideways), the heading unturned, under
    the cruise, bobbing, a footstep per step; the swipe's total checked
    against `reference · (tan a₀ − tan a₁)` with a₀ between the press and a
    frame past the slop. `walk-strafe-drag-lift`, `-drag-rest`, `-key`.
  - Run (tabL, walk): green. The swipe strafed 2.418 units (the far ground
    13.33 ahead): 0.128 by the lift, nine tenths 1.30 s after it. `Shift+→`
    2.43 units at most 1.60 u/s.
  - Frames: `frames/bite-12/v14/tabL-walk-strafe-{drag-lift,drag-rest,key}.png`.

## The feel, from the frames

- **Nothing above the horizon moves.** Sky, sun, clouds and hills are at
  infinity; a strafe cannot move them (the clouds' shift between the frames
  is their own drift). The finger presses the sky and slides — and the thing
  under it stays put. The far ground the drag holds is the seam's, a
  featureless band of grass: at rest it has moved 150 px, but there is
  nothing on it to see move. What visibly moves is the near meadow (the two
  near flowers slide ~250 px), with the finger's way. So "the hand holding
  the far world slides it" does not read: it reads as "a sideways swipe in
  the sky walks me sideways", the near things sliding more than the finger.
- **The lag is real.** 5 % of the strafe is done when a quick swipe lifts;
  the rest, at the walk's cruise, takes ~1.3 s more. On a slow drag (≥ 1.5 s
  for 150 px) it would track; a flick feels like a glide that started late.
  The cap is the plan's ("no faster than the cruise"), so it is not changed
  here — the operator's call: a higher cap for strafe chases, or a reference
  nearer than the seam (less aim per px, so less lag, but the far world
  moves less than the finger).
- `Shift+→` reads as intended: the near meadow slides left, eased.

## Left

- The operator's play on a device; the two feel points above are theirs.
- `play-walk.ts` is 546 lines (over the ~450 rule of thumb); its three
  `check*` helpers are the seam if it is split.

## Decided

- The drag's reference distance is the farthest ground the screen shows (the
  seam), so the far world moves with the hand; nearer things slide farther, as
  parallax. Exact in azimuth (the tan form), not the small-angle ratio.
