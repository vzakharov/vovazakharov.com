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

- **C1 (T143, unit)**: the game already followed — the case was green
  before any change. 2ad466a (`perch-follow.test.ts`, through the real
  `reduce`: fly and butterfly take far caps after the eye moves 40 up, the
  bee an air spot, the far copy having no flowers; red with `isDue`'s
  `!isOffered` removed), 1afd77a (the reach case on a cap at (15.5, 5.5),
  16.45 out, placed by `placeIn` and refused only by `inReach`; the strip
  past the reach is thin, so a change to `MEADOW_FRAME` or `PERCH_REACH` may
  move it). C2 launched on the play half.
- **F (T145–T147)**: 91ad7b8 (T145: `isShown` judges a place's plane
  distance round the eye against `D_SEE`, as the brow does; a place without
  a plane point keeps `fromEye`), eef972b (T146: at turn −1.1, not +1.1 —
  facing inward at x 20 bends only 0.06–0.12, short of the 0.15 bar;
  accepted), 22b4b8f (T147: the seam, the clump layout by eye-moved foot,
  the light by closed form). The bed-repaint test is not written: the beds
  are Phaser classes no test builds, and the one pure piece (`laidOf`) is
  now covered — accepted. Its fliers run found three reds from B's d43c203;
  B is told to settle them before it reports.
- **A1 (T140, T147 tap)**: e4e8c72 (`Scened.tendedAt`; `plantable`,
  `plantSounding`, `tapTuft` and `sowSounding` — the last beyond the call,
  it picks among tufts judged there — read it), c7f4db61 (`planter.test.ts`
  drives the real `Planter` through five walks short of a re-tend, red with
  the walked eye; `tufts.test.ts`'s faults measured on planted heads, not
  the rule that chose them). One line outside its files: `meadow-scene.ts`
  wires `tendedAt`. A2 launched on T141.
- **B (T142)**: d43c203 (spots carry where the anchor draws them;
  crowding on drawn points, wings × zoom; red at fb82ca1 on all three
  screens, green now; spots offered unchanged on every screen, ten of ten
  insects seated), 65a68ecd (`fliers.test.ts`: the air-apart check moved to
  the drawn measure, tolerance still 0, red at fb82ca1 on phone sideways;
  the fly's tap rate on tabP was sample noise — 0.704 before, 0.705 after
  over 8 visits — so `TAP_SEEDS` 8, bar 0.7 unchanged). fliers 48/48.
- **D (T144)**: 1da1a918 (`roomFor` offers a ring slot only where every
  head the flower's genes could grow, with its sway, stays between
  `screenSides(camera)` as the anchor sees it). Births in a 40 s bee play:
  phoneS 21 → 9, phoneP 19 → 6, tabL 20 → 15, none off screen after (17,
  14 and 3 before). Halving on phones is accepted: the call traded count
  for sight, and every screen still plants. Loose end for `/polish`:
  `onscreenOf` in `perch-sight.ts` repeats `screenSides`' half-width.
- **A2 (T141)**: no source change; filled at 170k and pushed its design as
  `rh-a2.patch` (b2a16cd8): `lostOn(was, now, eye)` — the tufts a sow must
  hide in its own frame, exact rather than a radius round the foot, since
  the flower count reaches `D_SEE` and mushroom covers work in screen space
  (accepted) — and `Tended`, the standing-tuft bookkeeping out of `Grass`.
  `paint` still tends whole (a resize lays everything anew: accepted).
  A2b launched to apply, wire and test it from `rh-a2.md`.
- **C2 (T143, play)**: d33f10e1 (`playFollow` last in the meadow play: ↑
  20 s, 31.8 units, four of ten insects left past `PERCH_REACH`; green on
  tabL, every insect in reach 30.3 s after the walk, and phoneP, 19.5 s).
  The 30 s window became 30 s heading-in plus 90 s settled: a butterfly on
  a 64 s flight to an air spot was following, slowly — the harness's red,
  so a line went to `to-check.md` (accepted, per the play-run rule).
  **Open lead for the tail:** drawing the 30–90 s wait raised tabL's frame
  median from ~17 to 27.4 ms, so frames after a long walk may cost far more
  than at the opening; the wait now steps without drawing, so no play
  watches those frames. Trace it with its own agent before bite 13.
- **E (T139)**: 0d391410 (`isCrowdedAt(meadow, foot, from)`, `roomFor`
  passing its anchor; phoneL and tabL now stop at 12, from 22 and 15).
  Turned, phoneL still shows 5 of 12 tappable and tabL 6 of 12; options
  measured — placing the opening inside the turned screen too, on every
  screen or landscape only — strand none but make phoneL refuse at 9.
  **Call: the twelve stays the same on every screen, and a turned phone
  showing fewer of them is accepted**, since the field turns and walks and a
  drag brings each one back; the count changing with the screen is what
  decisions.md rules out (written there). The reducer's `grow` still counts
  round the foot alone: the scene's `roomFor` already applies the anchor
  rule before every grow it sends — accepted.
