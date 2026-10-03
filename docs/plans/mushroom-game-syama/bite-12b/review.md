# Bite 12b — the review and its calls

One reviewer agent, review
https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5398479115
(threads T139–T147: six blocking, three nits). Each finding's call, what it
beat, and where it landed. Paths under `src/pages/mushrooms/ui/scene/`
unless they say otherwise.

1. **T139, the cap on a turned screen** (`model/game.ts`, `isCrowdedAt`).
   A new mushroom is refused when `MUSHROOM_SLOTS` already stand within
   `D_SEE` of its foot **or** of the anchor it grows from, so the opening
   holds twelve on every screen (phoneL and tabL had grown 22 and 15).
   Turned, phoneL still shows 5 of the 12 tappable and tabL 6: **the twelve
   stays the same on every screen, and a turned phone showing fewer is
   accepted**, since the field turns and walks and a drag brings each one
   back (`decisions.md`). Beaten: a cap per screen (a count that changes
   with the screen); placing the opening inside the turned screen too
   (strands none, but phoneL refuses at 9). The reducer's `grow` counts
   round the foot alone; `roomFor` applies the anchor rule before every
   grow it sends.
2. **T140, one eye for a tuft** (`planter.ts`, `tuft-tap.ts`). `plantable`,
   `plantSounding`, `tapTuft` and `sowSounding` judge at the eye the grass
   was tended at (`Scened.tendedAt`), the eye the shown tufts were judged
   from. Beaten: all of them at the current eye — a shown tuft would refuse
   until the next re-tend. `planter.test.ts` drives the real `Planter`
   through walks short of a re-tend.
3. **T141, a sow's tend in slices** (`tending.ts`, `grass.ts`). A sow hides
   at once what it must — the tufts a new mushroom or flower now covers,
   `lostOn(was, now, eye)`, exact rather than a radius, since a flower's
   cover reaches `D_SEE` and a mushroom's works in screen space — and
   re-tends the rest in `TEND_SLICE` slices from the next frame, through
   `Tended`, the standing-tuft bookkeeping `Grass` hands off. Judged by the
   lawn's share of a frame against `FRAME_BUDGET_MS` (tabL, 20 bee
   plantings: 46.7 → 14.5 ms), which the approach play now holds. Beaten:
   tending whole on a sow (15–34 ms on a desktop). A resize still tends
   whole, as it lays everything anew.
4. **T142, air crowding as drawn** (`air-spots.ts`). Air spots crowd on the
   points the anchor draws them at, wings × zoom: for every uncrowded
   on-screen pair, drawn distance ≥ (wings_a·zoom_a + wings_b·zoom_b)/2,
   tested on 844×390, 1180×820 and 1920×1080; `fliers.test.ts`' air-apart
   check measures the same way, tolerance 0.
5. **T143, the insects follow the child.** The game already did:
   `perch-follow.test.ts` (through the real `reduce`: a perched insect whose
   cap leaves the sight's places takes its next leg among the new ones), a
   reach case on a cap only `inReach` refuses (the strip past the reach is
   thin, so a change to `MEADOW_FRAME` or `PERCH_REACH` may move it), and
   `playFollow` last in the meadow play (↑ 20 s, then every insect within
   `PERCH_REACH`, 30 s heading in plus 90 s settled: a butterfly on a 64 s
   leg follows, slowly).
6. **T144, bees plant where the child sees it** (`flower-sight.ts`).
   `roomFor` offers a ring slot only where every head the flower's genes
   could grow, with its sway, stays between `screenSides(camera)` as the
   anchor sees it; a bee with no slot on screen plants nothing that visit.
   Births in a 40 s bee play: phoneS 21 → 9, phoneP 19 → 6, tabL 20 → 15,
   none off screen. **Halving on phones is accepted**: the juice is what the
   bite exists to show, and every screen still plants. Beaten: off-screen
   planting (most of the juice where no one sees it).
7. **T145, "shown" by the radial brow** (`model/flight-in.ts`). `isShown`
   judges a place's plane distance round the eye against `D_SEE`, as the
   brow does; a place without a plane point keeps `fromEye`.
8. **T146, the side bend held at a side** (`insect-drawn.test.ts`). The
   case holds at turn −1.1, not the reviewer's +1.1: facing inward at x 20
   the bend is 0.06–0.12, short of the 0.15 bar — accepted.
9. **T147, tests that can fail.** The seam, the clump layout by
   eye-moved foot and the light by closed form replaced self-comparing
   assertions; `hasGround` is true to 3.08 rad and false from 3.09. No bed
   repaint test: the beds are Phaser classes no test builds, and the pure
   piece (`laidOf`) is covered — accepted.
