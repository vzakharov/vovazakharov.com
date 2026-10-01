# insect-arrive — hand-over note

Package: the two operator findings in the plan's § "Rest of the bite" — a
released insect seen at once and landing soon, and an insect drawn at its
depth's scale.

## Measured before (step 1)

Scratch measure (`opened(3, …, forest)`, 40 seeds a kind, eyes at the
opening position turned −1.2…1.2 by 0.4, plus two walked eyes), at
commit 193d22e:

- **Start point**: the view set a released insect off its span **past** the
  nearer screen edge (`offScreen`, `-span` / `width + span`), so it was wholly
  off screen on its first frame; the model timed the leg from `inset` (half
  the widest butterfly) past the shown stretch's edge.
- **Leg length** (model units, butterfly sizes; in px, the perch from the
  nearer edge): tablet 6.9 u median / 11.3 max, perch 263 / 587 px;
  phone 7.0 / 26.2 u (the 26 are the fallback below), 95 / 192 px; desktop
  8.2 / 14.8 u, 443 / 956 px.
- **Leg time**: butterfly median 4.3–8.8 s by screen, 15.3 s at most (its
  `flying` 2.4–3.9 s × up to `slowest` 4); fly ~1.6 s (≤ 2.0); bee ~2.6 s
  (≤ 3.0).

## Done

1. Step 1 (this commit):
   - `flight-in.ts`: `ARRIVAL` = 1500 ms and `arriving(leg)` — the leg flown
     in at most `ARRIVAL`, its stay after it unchanged. The away spots of a
     shown flight in stand **at** the shown stretch's edges (`edgesOf`), no
     longer `inset` past them.
   - `flight.ts` (`firstFlight`, two lines): a first leg to a perch the
     screen shows goes through `arriving`; the fallback to an unshown perch
     keeps its cruise. The random stream is unchanged.
   - `insect-away.ts` (not on the package's list; the entry lives there):
     `entry` sets an insect off with its middle **on** the nearer screen edge
     where the screen shows its first perch (`byEdge`, `past` 0);
     `offScreen` (leaving, and the fallback) still goes its span past.
   - Tests: `flight-in.test.ts` (lands within `ARRIVAL` for every kind, stay
     inside its habits; `arriving` on a long and a short leg; the fallback
     flies at its cruise; edges at 30/60), new `insect-away.test.ts` (entry
     placed on the nearer edge at its flying height over 6 screens × 4
     headings; leaving still a span past).
   - After, same measure: every first leg to a shown perch lands at 1500 ms
     on every screen and kind (each one's cruise was longer).

2. Step 2 (next commit), both halves — flight scale needs no plane of
   12b's: `ofLayout` already places a flying insect at its row's depth.
   - `insect-away.ts`: `drawnAt` returns `Zoomed` (the point and its
     `zoom`, 1 before the eye's first fit).
   - `insect-seat.ts`: `drawnInsect` returns `Zoomed`: sitting, the host's
     `stands.zoom`; flying, the row's zoom, carried onto the hosts by the
     same weights as the place, so take-off and landing never jump in size.
   - `insect-view.ts`: the container's scale is times that zoom; the hit
     radius is `tapReach` of the drawn span over the zoom, so the tap circle
     on the screen never falls under `TAP_RADIUS`; the nectar handed to the
     look is unzoomed about the middle, so the proboscis still reaches it.
   - Tests: `insect-seat.test.ts` (sitting zoom is the host's; no zoom jump
     at either end; zoom 1 at the opening, > 1 a step in, sitting equal to
     flying over the same row, the nearer foot larger).

## Left

- `fliers.test.ts` once at the final HEAD (see the report).
- Not looked at in a frame: a play of walking toward a perched butterfly.

## Decided

- A far insect's tap circle keeps `TAP_RADIUS` on the screen however small
  it is drawn (beds scale theirs with zoom); catching one is the child's
  game. Near ones grow theirs with their drawing.

- `ARRIVAL` is a ceiling, not a pace: a leg already shorter keeps its time,
  so a fly to a near perch still darts. Every measured first leg was longer.
- A release facing past the meadow's end shows no perch at all
  (`onscreenOf` none, or a sliver: phone |heading| ≥ 0.8, tablet ≥ 1.0 at the
  opening position), so it still flies to a perch in the world, unseen, at
  its cruise. The decision's "at every heading" holds wherever the screen
  shows the meadow.
- An entry over a far row can start sunk under the brow at the screen's edge
  (one case in the test's 6 × 4 × 10: phone held sideways, heading −0.3,
  the far foot, distance 13.34 against `D_SEE` 13.33); it is drawn from the
  frame it comes over the brow, as any flight there.
