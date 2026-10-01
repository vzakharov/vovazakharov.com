# ip-measures — hand-over note (stopped at context budget)

Research package for `insect-plane.md` round 3. **`insect-plane.md` is not
edited yet**: `## Round 3` and the new `## Left` are still to write, from the
numbers below.

## Prototype

`ip-measures.patch` (beside this note, `git apply` from the repo root) adds
`docs/remove-before-merging/bite-12/ip3/`: `proto.ts` (the leg's frame,
R2.1's formulas: `centreOf`, `framedOf`, `aloftOf`, `mixQ`, the veer
`veered`/`veerAloft`/`radiusOn`, `drawnAloft`), `legs.ts` (a leg flown in the
frame by the real `steer`, 60 fps, drawn through each veer variant), `world.ts`
(a visit's perches as `Aloft`s from the real `perchSight`/`footRows` via
`ofLayout`'s construction), `veer.ts` (R2.5), `back.ts` (bowed leg looking
back, **not run yet**), `bench.ts` (R2.6). Run each with
`node --import tsx <file>` from that directory (`SCREEN=`, `SEEDS=`, `LEGS=`,
`W=` on `veer.ts`). Committed as a patch, not source: `pnpm lint` /
`pnpm typecheck` were not tried on them (lines over prettier's width, at least).
Sanity: at the opening eye a seat's framed point equals `viewOf`'s to 0.1 px.

Assumptions in the prototype: cruise butterfly 1, fly 7, bee 4.6 butterfly
sizes/s; a leg's time its length in the set-off frame in drawn sizes (×
logmean q / CD) at the cruise, ≥ 0.3 s; "covers half the screen" = drawn span

> half the screen's width; a seat's sitter is hidden when its seat's zoom >
> CD / V_NEAR (the host culled).

## R2.5 measured (seeds 1, 42; LEGS=3)

Scenarios: `opening` (eye at the opening, 120 random legs/kind), `grid`
(eyes on x ∈ {−6..6 step 3}, y ∈ {2,5,8,11}, 4 headings, random legs among
seats + 40 air spots), `grid seat` (to/from the seat nearest each grid eye),
`by a perch` (eye 0.3 and 0.6 CD in front of each of 12 seats, facing it),
`walk-in` (eye walks at `STRIDE_CRUISE` from the opening through a hovering
air-perch insect, lateral offsets 0, 0.1, 0.3 CD). Variants: no veer;
`R_V = V_NEAR`; `R_V = V_NEAR · bend at the screen's edge` (0.625 CD on the
tablet); w = 0.1 and 0.25 CD. A seat end inside `R_V + w` fades the veer out
toward it (keep = smooth(flown / 0.3) off the start, mirrored at the end), so
a seat is reached exactly.

Max zoom while the middle is on the screen, no veer → edge R_V, w 0.1 CD
(butterfly / fly):

| screen          | grid                  | by a perch            | walk-in           |
| --------------- | --------------------- | --------------------- | ----------------- |
| tablet          | 7.45→1.82 / 5.35→1.89 | 5.79→2.38 / 4.24→2.11 | 200.6→1.72 / same |
| tablet portrait | 5.44→1.72 / 4.82→1.72 | 3.26→1.82 / 4.85→1.93 | 6.42→1.72         |
| phone           | 5.04→1.72 / 9.49→1.72 | 4.69→2.07 / 3.81→1.94 | 1.19 both         |
| phone sideways  | 7.05→1.89 / 12.5→1.74 | 9.08→2.24 / 6.17→2.10 | 17.8→1.72         |
| small phone     | 5.99→1.84 / 20.3→1.72 | 3.70→1.95 / 3.71→2.00 | 2.04→1.72         |
| desktop         | 5.23→1.88 / 5.36→1.98 | 5.19→1.89 / 5.73→1.99 | 20.5→1.72         |

- At the opening eye no leg comes within 0.5 CD; zoom ≤ 1.10; the veer
  changes nothing (identical rows).
- Random grid legs: 84–88% within 1 CD, 36–42% within 0.5, 8–12% within
  0.25 (no veer); with the veer 13–17% / 3–6% remain, all of them legs with a
  seat end inside the veer (the fade).
- Longest time a giant (span > half the width) holds the screen, no veer: up
  to 9.4 s (phone, butterfly), 1.1–3.0 s walking in; **0 s with either veer
  on every screen** but one 0.12 s (small phone, by a perch).
- Edge R_V holds zoom 1.72 wherever no seat end is inside it (walk-in, most
  grid rows); V_NEAR R_V gives 1.86–1.92 there. Above 1.72 is only the fade
  near a seat inside R_V (up to 2.38 tablet): the seat's host is culled, so
  the seat is below the screen's foot, and the sitter is reached there. No
  pops (a sitter hidden while drawn inside the screen) in any run.
- w 0.1 vs 0.25 CD: same max zoom, same jumps (±3 px); w barely matters.
- Jumps: the veer adds per-frame "whips" (a drawn step > width/20) for flies
  passing near the eye — tablet 0→4, phone sideways 3→13 (by a perch),
  pre-existing 42→46 on the phone; the radial push slides the point round
  the R_V circle fast when the raw leg passes very near.

Leaning (to confirm in the spec): **R_V = V_NEAR · bendAt(edge), w = 0.1 CD,
the seat-end fade over 0.3 of the way**.

## R2.6 measured (contaminated: run while six `veer.ts` processes ran)

Per insect per frame, tablet: today's `drawnInsect` with two hosts 1.55 µs,
no host 0.64 µs; the frame path (two `framedOf`, `aloftOf`, veer,
`drawnAloft`) 0.93 µs — 30 insects ≈ 28 µs vs 47 µs, against a 26 ms
budget. Re-run alone to report.

## Left

1. Re-run `bench.ts` alone; run `back.ts` (bowed leg looking back).
2. Write `insect-plane.md` `## Round 3` (R3.1 veer, R3.2 cost, R3.3
   packages firm), condense rounds 1–2, rewrite `## Left`; keep < ~450 lines.
3. Firm the packages (step 0 frame + veer — check origin for `ip-frame`'s
   `insect-frame.ts`; A away/seat; B perches; pace — `ip-pace`; C view).
4. Try `pnpm lint`/`pnpm typecheck` with the scripts under `ip3/`.
