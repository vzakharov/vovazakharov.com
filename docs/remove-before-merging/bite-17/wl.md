# wl — windows on a reversed turn (review-read1 item 1)

**Done.** A lagging house reads the turn before the current one until its
delay is past, so a reversed turn carries its light on from where it stood
instead of snapping to the new turn's `from`.

- `windows-lit.ts`: `windowsLit({ dusk, before }, now, phase)`; for
  `now − delay < dusk.startedAt` it reads `duskness(before, …)`.
- `dusk-view.ts`: `Lights` carries `before: Dusk`, set in `update()` when
  the dusk's `startedAt` changes (the dusk itself until the first turn).
- `house-view.ts`: passes `lights` whole.
- `windows-lit.test.ts`: every phase (plus a 1499 ms delay), T in
  0..DUSK_MS + LIT_DELAY_MOST step 50, over five turns including a reversal
  of a reversal: `|lit(turned(d,T),T) − lit(d,T−ε)| < 0.05`. Fails on the
  old behaviour at +1250 ms.

**Decided.** A pure function of the one `Dusk` record was tried first,
reconstructing the turn before as a full one ending at `from`: exact for a
reversal mid-turn, but the record cannot tell a turn that finished just now
from one that finished long ago, so a tap within 1.5 s after a turn ends (the
village still lighting) still jumped up to ~0.3. Hence the one field of view
state. Three turns within 1.5 s on a moving meadow still read the oldest as
held at its `from` — a jump bounded by that 1.5 s of movement.

**Left.** Nothing.
