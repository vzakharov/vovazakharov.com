# ip-A — hand-over note

Package A of `insect-plane.md` R3.3 (away and seat): additive plane-terms
functions beside today's, which stay live. Package C calls them and deletes
the old path.

## Done

- Step 1, the way in and out: `insect-frame.ts` `aloftAt(view, at, distance)`;
  `insect-away.ts` `offAloft(view, side, away, distance)` and
  `entryAloft(view, side, away, seated?)` → `{ from, out? }`. Tests in
  `insect-frame.test.ts` (round trip to 1e-9 px, every screen turned or not,
  8 headings, two eyes, short of the brow) and `insect-away.test.ts`.

## Left

- Step 2: `insect-seat.ts` `drawnFlier`, `seatedZoom`, their tests.

## Decided

- `entryAloft`'s `seated` is the seat **as drawn**, in CSS px (B's
  `Perched.drawn`), not a plane point: shown on the screen → `from` halfway
  across to its `x`, no `out`; otherwise `out` goes past the edge on the side
  of the screen's middle its drawn `x` is on; no `seated` → `side`. A seat
  behind the eye that the host does not draw is C's to pass as `undefined`
  with the turn side as `side`.
- The round trip is tested short of the brow (to `0.99 · D_SEE`): at
  `D_SEE` itself rounding tips the foot behind the hills and `drawnAloft`
  sinks it, as it should.
