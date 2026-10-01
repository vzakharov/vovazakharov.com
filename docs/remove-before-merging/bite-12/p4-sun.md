# p4-sun — hand-over note

Package: plan `## Rest of the bite` item 3, "Re-decided: the cross yields to
the sun". Paths under `src/pages/mushrooms/ui/scene/` unless given.

## Done

1. The cross yields to the sun.
   - `sun-layout.ts` and its test are back as they stood before 749fc52f:
     `placeSun` reads the mushrooms' and the house's rows only;
     `groundTopUnder` is gone. The sun stands where it did (tabL
     (991, 160) r 61.5, small phone (126, 228) r 24).
   - `picker-rows.ts` `beside`: takes `drawn`, circles its reach stays out
     of (the sun's rays); tries past last, before first, under last, under
     first, then under each between from the last's side in; where none
     keeps above the floor, the first that keeps all else; else under last.
     Its screen-edge bounds allow rounding (a spot under the row's first
     failed `x - reach >= BUTTON_INSET` by 1e-14).
   - `sky-layout.ts` (outside the named files: the cross was computed
     there): `flowerCross(controls, drawn)` places the cross;
     `flowerPicker(layout)` returns the colours, the shapes and the
     layout's `cross`. `Crossed = { cross }`.
   - `layout.ts`: `MeadowLayout` carries `cross`, placed after the sun with
     its rays as `drawn` — the one place both are laid out, and it keeps
     `sky-layout` from importing `sun-layout` (which imports it).
   - Where the cross stands now: tabL before the colours' first
     (217, 64); small phone under the colours' last (51, 294), it stood
     where the sun does; 600×280 under the colours' first (142, 130), it
     stood on the sun's rays; every other named screen unchanged.
   - Tests: `sun-layout.test.ts` "stands the flower picker's cross on the
     screen, off the sun's rays and clear of every button…" over the
     300–2600 × 300–1600 grid (the button clause skipped on the few
     screens whose colours themselves stand on an insect's button);
     `layout.test.ts` "the controls" asserts the cross off the rays on every
     named screen. `mushroom-light.test.ts` 24/24, `layout.test.ts` 67/67,
     `flower-picker.test.ts` 9/9 green.

2. Startling an insect does not shut a picker open on a flower.
   - `model/game.ts` `startle`: shuts the flower picker only where it is
     open on a tuft; open on a flower it stays (the tap goes on through an
     insect at rest, `flower` on the held one returns the meadow as it
     stands), so a press through a resting insect on the held flower no
     longer shuts and reopens it 0.45 s on.
   - Test: `planting.test.ts` "stays open on a flower through an insect
     startled…" (18/18); `game.test.ts` 41/41.

3. Replays (scratch worktree at f12b4b11): `hold` green on tabL, phoneP
   and phoneS — 1 tuft back where the seeded flower stood on each; frame JS
   median 13.1 / 10.3 / 10.9 ms. Frames in `frames/bite-12/`: tabL's four
   `p4-*` replaced (the sun back at (991, 160), the cross before the
   colours' first), phoneS's four new (the cross under the white colour,
   the sun where it stood, r 24), phoneP's came out identical. The pulled
   frames are replaced with the held ones, since they too showed the sun
   where it no longer stands. phoneL not replayed (its cross and sun did
   not move).

## Left

Nothing in this package.
