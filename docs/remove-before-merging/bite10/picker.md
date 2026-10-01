# Bite 10, half B — the child plants flowers (group `picker`)

## Done

- 5655d05 model: `Meadow.planting`, actions `tuft` / `colour` / `plant`; a
  child's flower is a `RootedFlower` in `meadow.planted` beside the bees'
  `BeeSown`, so `FLOWER_LIMIT` and ids cover both; `shapeSeeds`.
- 610e7f7 `tuftAt`, `tuftFoot` (tufts.ts), `takesFlower` (flower-sight.ts);
  `drawFlower` split into stem and head painters.
- 7d30ff0 UI: tuft taps (`Planter`, `Grass`), colour + shape stages
  (`flowerPicker`, `flower-icons.ts`), generic `Picker` flight.
- 1f4ee21 play step `scripts/lib/play-tufts.ts`; swatch ink fix.
  Played phoneS, tabL, phoneP: pass. phoneL, tabP not re-run after the fix.

## Decisions

- Tuft reach: max(22 px, 1.4 × tuft size) round its middle — bare ground
  between tufts stays bare (alt: a full 32 px finger pad, which covers
  most of the ground on a phone).
- A tap on a tuft while the picker is open closes it (plan's rule), not
  moves it to the new tuft.
- A refused tuft shakes its blades + nuh-uh, and deselects like any meadow
  tap (alt: leave the selection, as `+` does).
- Colours stand on the house picker's five slots, shapes on the caps' four;
  on a screen too narrow for a stage whole (280 px) three abreast and the
  rest in a row under.
- Colour order: notes darkest first, then drums (blue pink yellow violet
  white).
- Shape buttons show the exact seed that will grow, head enlarged on a
  short stem; they play nothing on press — the flower sounds as it opens,
  and the child's leads the melody (alt: a sound on press, doubled).
- Planting rules = the bees': flower band, off mushroom feet, heads apart,
  in sight on this screen. About 7 of 31 tufts take a flower in a phone's
  opening meadow.

## Defect found, not fixed (not in scope)

On the 280 px phone (`FLOOR_HELD`) the species picker shows only three of
four caps, and the house picker's two band buttons overlap each other
(28 px apart at r 38). layout.test covers `VIEWPORTS` only.
