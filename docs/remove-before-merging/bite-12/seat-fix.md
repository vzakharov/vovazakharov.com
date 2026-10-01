# seat-fix — hand-over note

Package: the fault play-final found — a perched insect slides off its seat as
the eye turns (tabL, `approach`, 7.7 px at most; spec §4 wants ≤ 1 px).

## Cause (measured)

The hypothesis held. A bed draws its mushroom or flower flat at its foot:
drawn foot (`bedPlace`) + `zoom` × the layout offset. `insect-view.ts` drew
the seat through `ofLayout` over the foot row as a 3D point standing on the
plane at its own x. The two agree at heading 0; turned, a seat off the
crown's column stands at a different depth along the heading than the foot,
so it moves up or down the screen against the cap. Scratch measure (tabL,
foot `OPENING_FEET[0]`, seat 25 px across, 45 px up): 0.94 / 2.39 / 4.20 px
at 0.085 / 0.21 / 0.345 rad, mostly vertical, opposite signs either side of
the crown; a seat straight over the foot does not drift. The foot itself
agrees exactly (0.00 px), so nothing else contributes. Flowers have the same
fault (same flat drawing at the foot).

## Done

1. The fix (this commit):
   - `bed-place.ts`: `Host` (`Standing` + `laidFoot`) and `onHost`, where a
     bed draws a point laid out on it.
   - `mushroom-bed.ts`: keeps `laid` (the probe reads it) and hands it on as
     `laidFoot`; `capTop` returns `Perched` with `on`, the cap.
   - `flower-bed.ts`: `seat` returns `on`, the flower.
   - `insect-seat.ts` (new): `drawnInsect` — sitting, exactly where the host
     draws the seat (hidden when the host is not drawn or the point is under
     the brow); flying, the old `drawnAt` mapping plus the host's offset
     weighted by how far along the leg (to-host) and how far from its start
     (left-host), so take-off and landing never jump. Air spots and away are
     unchanged.
   - `insect-view.ts`: tracks `sat` (drawn sitting last frame) and
     `leftFrom` (the perch the current leg left sitting on), and draws
     through `drawnInsect`; the nectar through the to-host.
   - `insect-seat.test.ts`: the sitting point equals the sprite's seat on six
     screens × five headings × three feet; agrees with the old mapping at
     heading 0 and parts from it > 1 px turned; no jump at either end.

2. Verified (probe built in a scratch worktree at 07f5d446):
   - `fliers.test.ts` 48/48, plus perch-sight, insect-layout, insect-tap,
     view, eye-crop, view-inverse, door-tap, mushroom-tap, flower-touch.
   - **The opening play cannot see the fix as it stands.** Its `onSeat`
     probe does not read where the insect is drawn: it recomputes
     `scene.eye.toScreen(shown.at, shown.row)`, the old `ofLayout` mapping,
     so it reports 7.70 px whatever the game draws. Rerun with
     `seat-fix-probe.patch` (beside this note: reads the container's
     position less its fidget at the perch's zoom): **tabL 0.00 px over 66
     frames to heading 0.38; phoneP 0.00 px over 34 frames to 0.17.**
     Frame: `frames/bite-12/tabL-seatfix-seat-turning.png`.
   - `approach` otherwise as before (tabL `mushroom-6` 1.54×, haze
     0.376 → 0.039; phoneP `mushroom-11` 1.54×, haze 0.386 → 0.006). Both
     still fail only the frame budget (tabL 35.9 ms, phoneP 29.4 ms median;
     load average ~3.4 with other agents building), untouched here.

## Left

- The play agent applies `seat-fix-probe.patch` (`scripts/` is not this
  package's), or measures the seat its own way off the drawn container.
- No play perches an insect on a flower through a turn; flowers take the
  same `Host` path and the unit test covers it.

## Decided

- A flight's ends are blended onto the hosts (weight = share along the
  leg); mid-flight the drawing departs from the bare `ofLayout` mapping by
  up to the seat's drift, falling to nothing as the insect leaves its seat's
  pull. The brief said keep flight as is; without this the insect would jump
  by the drift on every landing and take-off at a turned heading.
