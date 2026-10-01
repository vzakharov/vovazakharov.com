# ip-jump — the veer play's one-frame jumps, traced: no fault in `src/`

The veer play's 17 steps over width/20 on tabL have two causes, neither a
seam in the insect view. No source changed.

## How it was measured

`InsectView` itself, driven at 60 fps in node: Phaser stubbed by a resolve
hook, a proxy look, seats built as `capTop` builds them (`seatAt`, the foot
row, `placedAt` + `sunk`, `cull`, `onHost`), meadows from `visit-play`'s
`play` at a 1000/60 ms tick, the eye on the play's course (facing the clump,
`→` turned at `TURN_CRUISE`, back to 0, walked 160 frames at
`STRIDE_CRUISE`, `←` back round). Script kept outside the repo at
`<scratchpad>/ip-jump-repro/` (copy to `<checkout>/repro/`, then
`node --import tsx --import ./repro/register.mjs repro/jump.ts <seed>
<walk heading> <jumps to print>`).

## 1. The play's `face()` snaps (every butterfly and bee step)

With the eye moving only as a held key moves it, over 18 runs (seeds 1–6,
walk headings 0, 0.3, −0.4) no butterfly stepped more than 11 px in a frame
and no bee more than 39. `face()` sets the heading in one frame, and a snap
of Δ moves every insect drawn on both frames by `arc · Δ` — 751 px/rad on
tabL, so any snap over 0.079 rad counts each of them. With a 0.12 rad snap
added before the walk, every kind gets one ≈90 px step on that frame
(butterfly 90.3, fly 90.3, bee 90.9 on seed 1). The play snaps three times
(π, 0, the hover's azimuth), and the last one is small enough that insects
are on screen on both sides of it.

The fix is in the play, not the game: `steps()` (or `flicks`/`pace`) skips a
step whose heading moved more than a held turn moves it in one frame
(`TURN_CRUISE / FPS`, with margin), or the play drops the record across each
`face()`.

## 2. The fly's dash (the rest of the fly steps)

`dash-cap.md` caps a fly's dash at 60 butterfly sizes/s on tabL; at a size of
60 px and 60 fps that is 60 px a frame **at its own size** — the check's
59 px threshold, before any zoom. Measured with no snap: a fly's fastest
frame is 58–66 px over its zoom (the hermite's middle and the zigzag above the
cap's average), drawn at that times its zoom, up to 1.66 in the veer band. So
the worst case, 98 px on a cap→cap leg at d 5.95, is the dash at zoom ≈1.5.
`flown` jumping 0.07 a frame on such a leg is the same thing.

The 6.78 s cap→away leg's "0.00 flown a fifth in" is the take-off pivot
(`PIVOT_SHARE` 0.25 of the leg for a turn right round, `insect-motion.ts`):
a fly that turns about π has not left yet at a fifth. Its 131 sizes/s frame is
twice anything the harness measured without a snap (66), so it is most
likely a snap frame at a small zoom (a 0.1 rad snap is 75 px; over zoom 0.57,
131 sizes/s). This one could not be confirmed without the play's record.

## Not the cause (measured)

- The end switching source (`seatAloft`'s two branches): for a still host the
  two give the same point to 1e-3 on either side of the cull at `V_NEAR`,
  head-on and off to the side.
- `centreOf` / the frame: `centre` stays fixed through each jump leg; `start`
  and `end` do not move on the jump frames.
- The veer fade, `offAloft`, the hidden→shown hand-over: no step of a kind
  other than the fly exceeds 39 px without a snap.

## Left

The design call: what bound the play holds a fly's step to, given that the
designed dash is at the threshold before zoom (see the report).
