# Bite 12b — the review's handling

The review: https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5398479115
(threads T139–T147 in `docs/pr/57/pr.md`). Each finding's call, made by the
orchestrator before any brief; the packages build to it. A package that finds
a call cannot hold stops and reports with the options measured.

## The calls

- **T139, the cap on a turned screen** (`model/game.ts`, `isCrowdedAt`). The
  twelve is counted round the snapped eye as well as round the new foot: a
  new mushroom is refused when `MUSHROOM_SLOTS` already stand within `D_SEE`
  of its foot **or** of the anchor it grows from. So the opening holds at
  most twelve on every screen, phoneL and tabL included. The bar it protects:
  after `+` refuses at the opening, turning the screen leaves every mushroom
  tappable on screen (decisions.md, "a count that changed with the screen
  would strand a mushroom"). If twelve on a landscape opening still strand
  some when turned, the package stops and reports how many on which screens,
  with the options measured. [A cap per screen: the count would change with
  the screen, which decisions.md rules out.]
- **T140, one eye for a tuft** (`planter.ts`, `tufts.ts`, `grass.ts`,
  `tuft-tap.ts`). `plantable`, `plantSounding`, `tapTuft` and `holds` all
  judge at the eye the grass was tended at (`grass.tendedAt()`), since that
  is the eye the shown tufts were judged from. [Judging all four at
  `this.eye()`: a shown tuft would refuse until the next re-tend.]
- **T141, a scene-asked tend in slices** (`tufts.ts`, `grass.ts`,
  `tending.ts`). `sow()`'s tend goes through `Tending` like the walk's, so no
  frame carrying `Grass.tend` goes over budget, timed in `__probe.hitches()`
  on tabL in the play's forest approach with bee plantings. What a sow must
  change at once — the tufts a new mushroom or flower now covers — is
  hidden in the same frame by a local check round the new foot, so a shown
  tuft still never shakes its head. [Showing it fits whole: 15–34 ms on a
  desktop is over a tablet's budget.]
- **T142, air crowding as drawn** (`air-spots.ts`). Crowd on the drawn
  points at the anchor (`drawnAloft`), wings × zoom. Bar: drawn distance ≥
  (wings_a·zoom_a + wings_b·zoom_b)/2 for every uncrowded on-screen pair on
  844×390, 1180×820 and 1920×1080, as a test.
- **T143, the insects follow the child.** A reducer- or flight-level case (a
  perched insect whose cap leaves `sight.places` takes its next leg to a
  perch in the new places), the reach test on an off-axis cap the layout
  places and only the reach refuses, and a short play check (walk ↑ 20 s,
  then within 30 s every drawn insect within `PERCH_REACH` of the eye). The
  plan names the reach it has, `PERCH_REACH` (the frame's far corner); the
  orchestrator fixes the wording.
- **T144, bees plant where the child sees it** (`flower-sight.ts`). The
  handler's call: blocking. A bee's planting is judged against the screen as
  seen from the anchor — every planted head inside the screen's sides —
  because the juice is what the bite exists to show (decisions.md, "all in
  plain sight"). A bee whose ring has no slot on screen plants nothing that
  visit. Bar it must not break: bees still plant on every screen in a
  40 s bee play (`births` > 0 on phoneS, phoneP and tabL); if a screen falls
  to none, stop and report. [Off-screen planting as intended: most of the
  juice would play where no one sees it.]
- **T145, "shown" by the radial brow** (`model/flight-in.ts`). The radial
  plane distance against `D_SEE`; the reviewer's case as a test.
- **T146, the side bend held at a side** (`insect-drawn.test.ts`). The
  reviewer's case: x = 20 on 844×390, turn 1.1.
- **T147, tests that can fail.** The tap after a walk short of `TEND_STEP`
  lands with T140. The rest — no bed repaint when only the anchor changes,
  heading at the sun's azimuth giving `toward.x ≈ 0`, `hasGround` true to
  3.08 and false from 3.09 (`anchored-stand.ts`), and replacing the
  self-comparing assertions in `clump-layout.test.ts` and
  `mushroom-light.test.ts` with ones that can fail — are a tests package of
  their own; `tufts.test.ts`'s are A1's.

## Packages

| Package | Threads          | Owns                                                                                                                               |
| ------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| A1      | T140, T147 (tap) | `planter.ts`, `tuft-tap.ts`, `tuft-tap.test.ts`, `tufts.test.ts`                                                                   |
| A2      | T141             | `tufts.ts`, `grass.ts`, `tending.ts`, `tending.test.ts`, the probe's hitch timing — after A1                                       |
| B       | T142             | `air-spots.ts`, `air-spots.test.ts`, `widest-spans.ts`                                                                             |
| C1      | T143 (unit)      | `perch-sight.ts`, `perch-sight.test.ts`, `perches.ts`, `perches.test.ts`, a new flight test file                                   |
| C2      | T143 (play)      | a `scripts/lib/play-*.ts` check — after C1                                                                                         |
| D       | T144             | `flower-sight.ts`, `flower-sight.test.ts`, `flower-plots.ts`, `flower-plots.test.ts`                                               |
| E       | T139             | `model/game.ts`, `model/game.test.ts`, `mushroom-room.ts`                                                                          |
| F       | T145, T146, T147 | `model/flight-in.ts` and its test, `insect-drawn.test.ts`, `clump-layout.test.ts`, `mushroom-light.test.ts`, `ground-seam.test.ts` |

## Reports

Filled in as each lands.
