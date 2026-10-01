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

## Left

- `fliers.test.ts` run; the play on tabL then phoneP.

## Decided

- A flight's ends are blended onto the hosts (weight = share along the
  leg); mid-flight the drawing departs from the bare `ofLayout` mapping by
  up to the seat's drift, falling to nothing as the insect leaves its seat's
  pull. The brief said keep flight as is; without this the insect would jump
  by the drift on every landing and take-off at a turned heading.
