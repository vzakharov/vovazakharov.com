# ip-veer — hand-over note

The veer's values and the seat fade in
`src/pages/mushrooms/ui/scene/insect-frame.ts` (+ its test), from
`ip-measures`' round 3. Nothing draws through it yet; the view package calls
`veeredAlong` per frame.

## Done

- One step (see the commit "feat(vova): veer an insect's leg by its screen…"):
  `VEER` is gone; `veerOf(camera): Veer` gives `near = V_NEAR ·
bendAt(pinholeOf(camera), 0)` (tablet 0.625 CD) and `width = 0.1 CD`;
  `veered(eye, aloft, veer)` now takes the veer explicitly, formula
  unchanged; `SeatEnds`, `SEAT_FADE = 0.3`, `veeredAlong(eye, aloft, veer,
flown, ends)`.

Nothing is left in this package.

## Decided

- `veerOf` takes a `Camera`, not a `View`: the veer depends on the screen
  only, and a `View` is a `Camera`.
- `ends` are the leg's seat ends as plane points, `{ from?, to? }`, an end in
  the air absent; distances are measured from the `eye` passed, so they
  follow the eye per frame.
- A seat end's fade depth is `smooth((near + width − d) / width)`: 1 inside
  `near`, 0 from `near + width` out. The fade's window is `SEAT_FADE ·
depth` of `flown`, not the prototype's fixed 0.3 with a partial keep: the
  insect then lands exactly on any seat the veer moves (the prototype's
  missed seats in the band by up to ~w/27), and the keep stays continuous as
  the eye walks a seat out of the band. Inside `near` it is the full 0.3.
- The keep scales the veer's displacement linearly (`aloft + keep · (veered −
aloft)`), as the prototype's `veerAloft` did.
