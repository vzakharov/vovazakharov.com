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

- Step 2, the insect drawn: `insect-seat.ts` `drawnFlier(view, raw, flown,
ends)` and `seatedZoom(host)`. Tests in `insect-seat.test.ts`: a flier at
  its seat (`aloftAt(view, onHost(...), host.stands.distance)`) at `flown`
  1 lands where the host draws the seat (1e-6 px) at the sitter's zoom, from
  the opening's headings and from eyes 0.6–1.2 CD in front of each host (the
  veer's fade in play); a sitter's zoom is in a fixed scale with its cap's
  wherever the eye stands, and larger the nearer.

## Left

Nothing in this package. C switches the insect over and deletes the old
path (`entry`, `offScreen`, `drawnAt`, `flownAt`, `drawnInsect`, `offHost`
and their tests, including `drawnInsect`'s "its own size at the opening").

## Departs from the spec

- **The landing zoom matches to 1e-3 only for a seat over its host's foot.**
  A seat toward a rim is drawn off the foot's `x`, and `seatedZoom(host) =
CD / host.stands.ahead` takes the bend at the foot's `x`, while
  `drawnFlier` takes it at the seat's own: up to 1.2% apart (sideways phone,
  ±30 world px seats, a foot near the screen's edge) — a step of well under a
  px at landing. The test holds that bound (< 1.5%) for rim seats. Exact
  instead: `seatedZoom` by the seat's drawn `x`, `CD · bendAt(pin, drawn.x) /
host.stands.distance`, which needs the seat's drawn point in its
  signature. Not taken: the orchestrator's call.
- `drawnInsect`'s "its own size at the opening" test is left as it is, the
  old path still being live; the `CD / ahead` property is a new
  `seatedZoom` test (the sitter's zoom over its cap's constant as the eye
  steps in, and larger nearer).

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
