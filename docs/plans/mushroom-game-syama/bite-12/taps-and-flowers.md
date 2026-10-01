# Bite 12 — taps, patches, the flower picker and keys

Bite 12's settled decisions on what takes a tap and how a flower is planted, changed and pulled, built. Moved verbatim from the plan's `## Rest of the bite`; a hand-over note's "item N" means the plan's old `**Left, in order:**` list, its items kept here with their numbers.

1. P1 step 2 is built (86503fb, 9d637ea; `p1d-taps.md`): taps only where
   drawn, `+` judged in the current view, `pan-input.ts` gone. Left: the
   phone growth it broke, `mushroom-patch`/`meadow-rules`/`layout`
   re-run, `fliers.test.ts` once, `openingCrop` → `openingView`.
   **Decided: a grown mushroom's own patch scales with the drawn size.**
   With the pad gone, `GROWN_PATCH` 16 px of drawn body stops phones
   growing past the clump (41/20/20 of 120 to six). The patch is 16 px at
   a tablet's camera unit and shrinks in proportion to the screen's unit,
   floored at 8 px. Beaten: 8 everywhere (restores phones, but lets
   tablet forests crowd for no gain) and no growth on phones (breaks "the
   meadow only gets fuller"). If the scaled floor leaves a phone short of
   the old 120, the floor goes to 8 on that screen, measured.
   Built (d396ca72, `p1e-patch.md`): 120 to six on every screen. The
   clump's own patch follows the same rule — `CLUMP_PATCH` 12 at a
   tablet's unit, scaled, floored at 8 (the sideways phone's back cap
   kept a crescent too thin for 12; 0 failures at ≤9). Left, red since
   86503fb: `layout.test.ts` "grows 12 over the world" on the sideways
   phone (3 of 200 stop at 5–8, not for the patch), and
   `clump-layout.test.ts` "wider cap farther in" (tablet 318 → 589 of
   2250 pairs) — each traced to its cause and judged against the rule it
   stands for before anything is tuned.
   Traced (2758d677, 5d6f8d88, `p1f-reds.md`): the lost back rows were
   the patch, not the view's `+` — a back-row mushroom is drawn at 0.65
   of a front one and could not hold the screen's one patch size. The
   patch now also shrinks with depth (`× min(1, scaleAt(z))`): tablet,
   phone and small phone grow behind the clump again (70/67/59 → 131/
   129/120 of the first 20 visits), clump-layout's tablet pairs 589 → 303. **Set (45d9cce4): `LEAST_PATCH` 8 → 6.** The sideways phone's scaled
   patch is 7.6–4.9 px, so the 8 floor kept its back rows shut and both
   reds red; at 6, `layout` "grows 12" 200/200, clump-layout 358/2250,
   57% behind the clump (pads: 66%). Beaten: 5 (66%, but the farthest
   cap's patch gets hard for a finger) and relaxing the tests (they
   state the rule the meadow keeps). Left: set it, re-run
   `mushroom-patch`, `layout`, `clump-layout` and `fliers`.

<!-- the old list's item 3 -->

3. P4: the long press, the flower picker with the cross, the ring
   (`walking.md`). Built (6ce6e395, 13f5a80a, 7a3a3d53; `p4.md`), with the
   `hold` play. **Decided for the fix round:** a pulled seeded flower
   leaves a tuft where it stood, since every planting spot is a tuft and
   the plan's "its tuft coming back" is about the spot, not the record
   (beaten: bare grass, which hides where the child can plant again); a
   press on the flower the picker is already open on keeps it open
   (beaten: shut then reopen, a flicker); a press through a resting
   insect is a long press too; the sun keeps off the cross as it does
   off the colour row. Then flowers' paling (`brow-flower-pale.patch`).
   Built (560e0db2–422c373b, `p4-fix.md`). **Re-decided: the cross
   yields to the sun, not the sun to the cross.** Moving the sun for the
   cross moved it on every screen at all times (tablet lower, small phone
   r 24 → 16) for a button shown only while picking, and broke
   `mushroom-light`'s small-phone case; so `placeSun` goes back to
   reading the button rows only, and the cross takes the first of its
   spots that keeps off the sun's disc and rays (on tabL, before the
   colour row's first button). Also: startling an insect does not shut a
   picker open on a flower, so a press through a resting insect does not
   flicker.

<!-- the old list's item 4b, under item 4 -->

4b. **A key plants (operator, playing the round brow).** While the picker
is open on a tuft, a note or drum key plants the flower that sounds it
there at once — its colour and shape are the key's, by `soundOf`'s law
(`seedSounding`) — sounding as a planting does, in view of a matching
flower or not, and the picker shuts («нажатие на "клавишу" этого цветка
будет сразу его сажать, без необходимости выбирать цвет-форму… сто лет
буду запоминать где там например фа диез»). Either stage of the picker
takes it. The same holds for the picker open on a flower: the key
replaces it, the picker being one picker. Beaten: keys planting only at
the colour stage (the child would still have to find the colour).
Octave keys still only shift the octave.
