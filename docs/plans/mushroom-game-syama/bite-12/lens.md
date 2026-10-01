# Bite 12 — the turn, the lens and the view

Bite 12's settled decisions on the length of a full turn and the panoramic lens, built, with what they beat. Moved verbatim from the plan's `## Rest of the bite`; a hand-over note's "item N" means the plan's old `**Left, in order:**` list, its items kept here with their numbers.

**Decided, from the operator's turn: the meadow is half as deep, so a full
turn is half as many screens.** The operator's complaint is the length of the
circle, not the slide («претензии не к тому с какой скоростью движутся
цветы-грибы, это как раз ок, а к тому какой длины ощущается "полный
поворот"»), and the opening stays as it is («выглядит как будто ты прямо
посреди грибочков… и это хорошо»). Measured (`tmp/fov.ts`): a circle is
`2π · focal` px, and `focal = unit · CLUMP_DISTANCE`, so it is 7.9 screens
on tabL, 5.2 on phoneL and 18–19 on every portrait screen (a 19° view).
The row form fixes only `EYE_HEIGHT` (a row's scale is `(row − horizon) /
EYE_HEIGHT` whatever the focal length); `CLUMP_DISTANCE` is free. So
`CLUMP_DISTANCE` halves (8.64 → 4.32), `EYE_HEIGHT` stays 4.15 by its own
derivation from the row form, and `focal` halves with it: `viewOf` at
`OPENING_EYE` is still `project`, every screen's opening frame identical to
the pixel, and only depth along the plane halves — the clump stands nearer
and what is beside it comes round sooner. A circle becomes 3.9 screens on
tabL (77° across), 2.6 on phoneL, 9–9.5 on portrait. `TURN_CRUISE` comes out
of the slide in px, which stays (`0.38 · old focal` → 0.76 rad/s, 8.3 s a
circle). Everything else measured along the plane follows `CLUMP_DISTANCE`
rather than being retuned by hand: `GLADE`, `STRIDE_CRUISE` (so the clump
nears at the same pace on screen), `V_NEAR`, the brow, the repaint queue.
Beaten: a faster `TURN_CRUISE` alone (the circle still 7.9 screens, the
complaint stands); a cylindrical lens over a world spread sideways (the
spread would have to differ per screen, and the world is one); a narrower
crop (the clump shrinks, which the operator ruled out).
**On hold, measured (`half-depth.md`, `half-depth.patch`): the opening does
not stay identical.** `viewOf` = `project` holds, so everything placed
through `project` stays put, but the brow is the `D_SEE` circle, and with
the view twice as wide its sides bend much lower (×1.07 → ×1.28 at tabL's
edges) and far side flowers sink at the opening (11 shown against 15); 10–36%
of the opening's pixels differ (`frames/bite-12/half-depth-opening-*`).
That is a wider view itself, not the patch: at a wider angle the circle of
equal distance dips harder at the sides. Put to the operator with the
frames: accept the rounder brow, a smaller cut (`DEPTH_SHARE` 0.7–0.8), or
a straight brow (beaten before, see "the brow is round" in `seam-and-brow.md`).
The operator: «не, это конечно выглядит не айс».

**Re-decided: a panoramic lens with a bent screen, as games with a round
horizon do (Animal Crossing's rolling world).** A wide pinhole dips a near
circle at its sides; the brow's roundness has to stop coming from the field
of view. So across, a screen is linear in azimuth (`x = c · azimuth`, a
cylinder), rows go by distance rather than depth along the heading, so the
circle `D_SEE` is a straight row and every row is turn-invariant, and the
whole ground is then bent down toward the screen's sides by a fixed
screen-space curve, today's brow curve (`hypot(1, dx / focal)` at today's
focal), so the opening's roundness is today's. **A full turn is 4 screens
on tabL** («каждый "экран" направо это поворот: восток-юг-запад-опять
север»): the meadow's angles widen by one factor everywhere (the world is
one), which gives the other screens their own count (portrait ≈ 9.5, phoneL
≈ 2.7), and the turn's slide in px stays. The clump and the middle stay;
things at the opening's sides draw inward (≈ 15% at tabL's edge, more on
phoneL) — **a probe first**: the opening on tabL, phoneL and phoneP beside
HEAD's, and tabL after a quarter turn, before anything is built (the
operator: «про пробу — ок»). Beaten: the half-depth pinhole (above), a
brow drawn at the old focal over a wider pinhole (what sinks would ride up
and down as the child turns).
Probed (147a6c6, `lens-probe.md`, `lens-probe.patch`,
`frames/bite-12/lens-probe-*`): 4.00 screens a turn on tabL (tabP 9.76,
phoneP 9.43, phoneL 2.66, phoneS 9.30), 8.4 s; the clump 0 px off; side
flowers in by 4–5% on tabL, 9–10% on phoneL, under 1% on portrait; nothing
HEAD shows sinks (phoneL gains a cut-off flower whole); 0.9–2.8% of the
opening's pixels differ. The probe spreads angles inside `viewOf` round the
eye (`SPREAD` 1.9617), exact only for the opening eye and turning in place;
**the build spreads the ground itself** (`planeOf`, `ofLayout`), then the
inverse projections (taps), the insects, the tests. The operator
looked: «мне ок» — so that build is the next package (`lens-build.md`),
and then the half-depth package's other carried items (the fliers'
ground-point sink, `PAST_BROW`, the no-perch leg, the world's-end release,
the insect cull by drawn extent, `V_NEAR`'s ceiling re-measured).
Built (88c9357 → 0f4c63c5; `lens-land.md`, `lens-carry.md`): the lens with
its tests, plays and frames (the opening the probe's to the pixel), the
sink, `PAST_BROW`, the no-perch leg, the cull, `V_NEAR` kept (ceiling
0.614).
