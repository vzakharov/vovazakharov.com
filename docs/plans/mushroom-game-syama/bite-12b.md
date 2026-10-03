# Bite 12b — the endless field

The bite's contract is [endless-field.md](endless-field.md); below, its calls
as decided before the build, then what the build added to them. Each call's
rejected alternative is in brackets.

## The calls

- **Spec first, by a mapping agent** (`docs/remove-before-merging/bite-12b/spec.md`):
  every reader of layout `Ground {x, z}` and of `GLADE`, endless-field.md's
  insect section reconciled with `model/flight-frame.ts` and
  `model/flight-in.ts`, a step 0 that changes the store's shape alone, then
  packages by disjoint files. [Building from the sketch in
  `bite-12/step-spec.md` § 3, which predates bite 12's insect work.]
- **The store is the plane.** Stored feet are plane points; the layout
  keeps the opening frame for the opening clump and its seeded flowers only.
- **Nothing is sown but the opening.** No seeded flowers or mushrooms round
  the glade: the operator's «пустое поле пока он туда что-то не посадит»
  overrides the step-spec's "seeded flowers round the glade".
- **The lawn is laid by plane cells**, each cell's tufts and mottles grown
  from its own seed, so a walk back finds the same grass; a tuft where no
  flower fits is not drawn, judged from where the child stands. [Tufts
  grown round the eye per frame: the grass would reshuffle on every step.]
- **The cap per area: at most `MUSHROOM_SLOTS` (12) mushrooms within
  `D_SEE` of a new foot, and 96 on the whole field**, `+` shaking its head
  at either. The frame is bounded by the area cap and **a side cull**:
  `bedPlace` hides what stands off the screen's sides, since Phaser
  re-triangulates every visible Graphics a frame (0.23–0.52 ms a mushroom)
  and one behind the eye was drawn (spec § 6: 36 drawn fails 26 ms, 19
  passes). The 96 bounds the stored field, not the frame. [One cap for the
  field: sowing stops after twelve; a lower ceiling: buys nothing.]
- **Flowers per area too: at most 48 within `D_SEE`** of a new one; a bee
  past it plants nothing, and a tuft there is not drawn, so no tuft ever
  refuses. [No flower cap: bee rings sow an endless field without bound.]
- **A thing grown off the opening is laid out at the clump's distance in
  its own frame**, sized by its genes, so nothing repaints on a re-anchor.
  [Laid out at the current anchor: every re-anchor repaints all, a ~26 ms
  spike.]
- **Rules read only what stands near the eye**: `plantableIn`/`roomFor`
  within `D_SEE`, the tufts tended over the view's sector and a screen
  either side (spec § 11: 800 live tufts tended whole cost 32–76 ms). The
  lawn is even on the plane, so near grass reads a little sparser than
  bite 12's opening: accepted.
- **Light by heading** through the repaint queue, side component
  `sin(heading − α_sun)`, at most `REPAINTS_PER_FRAME` a frame.
- **Insects on the plane** (`bite-12b/spec-insects.md`), perching where
  they like («садятся куда хотят») **within `PERCH_REACH` of the snapped
  eye** (`perch-sight.ts`: `D_SEE`, or the opening frame's far corner where
  that stands farther, 15.9), so they follow the child and a far mushroom
  gets them once he walks there.
  [Any perch on the field: an insect flies off for minutes and the meadow
  empties; 2·`D_SEE`: they live behind the brow.] Perch seats and crowding
  stay in layout px, re-anchored at the snapped eye like every rule [plane
  units: ~200 lines duplicating the beds' geometry]. A release still comes
  up over the brow, which already works at any heading [entry from the
  view's edge, which bite 12 replaced]; "shown" also checks depth and the
  screen's foot. Air spots are a plane lattice round the eye; two hovering
  may overlap briefly after a step, being apart only as seen from the
  anchor. Take-offs and shies pan by azimuth.
- **Rules judged from the current eye keep their code**: the stored plane
  points are moved into the eye's frame and converted to `Ground` (spec § 3;
  exact within ±3.08 rad of the heading), `placeIn` and its callers
  included, so a mushroom grown behind the opening eye still covers flowers
  and tufts. A rule's answer may differ from another eye: accepted.
- **A bee's ring has no depth band**: the band from the eye
  (`flower-plots.ts`) holds for the child's planting, which is in view
  anyway; a bee plants round a far flower by the plane's room and cover
  rules alone. [The band from the current eye: a bee off in the field could
  never plant.]
- **A grown mushroom leans by the side of the eye it grew in front of**,
  fixed for its life. [The opening plane's centre line: behind it, half
  lean toward the child.]
- **Clear-outs**: `GLADE` and the rim slide, `nearestTheSun`/`acrossFromSun`
  (the "out of the wash" rule restated against the sun's azimuth, or gone),
  `openingCrop`, `rebloom`.

## What the build settled

Paths under `src/pages/mushrooms/ui/scene/` unless they say otherwise.

- **One anchoring path.** `model/anchor.ts`'s `anchorOf(eye)` snaps the eye
  (`ANCHOR_STEP` 0.5, `ANCHOR_TURN` 0.5/`D_SEE`); `anchoredGround(ground,
anchor)` moves the stored plane feet into that eye's frame, the same
  object while the anchor stays, and `placeIn` and every rule read it.
  Perches snap coarser (`perchAnchorOf`, 2 units / 0.3 rad), a re-see costing
  more than a frame's share. It holds because `viewOf` reads only the eye's
  offset and heading, so a point is seen from an eye exactly as its
  eye-moved copy is from `OPENING_EYE`.
- **Identity by the stored numbers.** `openingIndex` and `sameFoot` compare
  stored plane points with `===`; a `planeOf`/`groundOfPlane` round trip
  before the comparison breaks it silently, so they never compare a
  converted pair.
- **The caps.** `MUSHROOM_SLOTS` 12 within `D_SEE` of a new foot
  (`isCrowdedAt`), `FIELD_MUSHROOMS` 96 in all (`isFull`), `FLOWER_SLOTS` 48
  (`flowersCrowdAt`); `roomFor` returns a plane `Footed` and reads no `D_SEE`
  cut, since opening caps stand to 15.9.
- **A bee's ring on the plane**: `ringFoot(parent, ring, anchor)`, a fixed
  offset of `RING_DEPTH` 1.5 round the parent's plane foot, turned by the
  anchor's heading [layout offsets from the stored foot: wild off the
  opening; a ring within half a tuft of bite 12's: no fixed offset gets
  there, and a ring is laid fresh each visit, so none moves before anyone's
  eyes]. Planted flowers are spaced by plane distance, the seeded bed by its
  screen spacing, so the opening is unchanged.
- **The lawn** (`lawn.ts`): cells of 4 units, 14 tufts a cell, live within
  `D_SEE`; `Grass` tends only the view's sector (`tendedIn`), a tuft's tap
  judged at the eye it was tended at, so a shown tuft never shakes its head.
  Mottles grow from the same cells (`mottles.ts`).
- **Light by heading**: `headedLight(light, heading)`, `SIDE_DRIFT` 0.1,
  exact at the opening heading; each bed relights what it shows through its
  own repaint queue (`Shown.lightsAt`, `paintFlowerLit`), up to two mushrooms
  and two flowers a frame while turning [one shared queue in
  `meadow-scene.ts`: only if the play run shows a hitch from it].
- **Insects**: air spots on a plane lattice round the eye (`air-spots.ts`,
  `widest-spans.ts`), each named by its cell (`air-<i>-<j>`) so walking
  never renames one, offered from `CLUMP_DISTANCE` to `AIR_FAR` within
  `AIR_WEDGE` of the heading; a perch counted as shown only above the bottom edge and
  short of the brow (`Onscreen.downTo`/`far`), an undrawn host's seat from
  its plane foot (`Host.foot`, `opening`) with the sideways offset × `SPREAD`
  across the line of sight to the foot, take-offs and shies panned
  (`panOf`, `sin` of the azimuth off the heading: stereo cannot tell front
  from back, accepted).
- **The wash rule** went with `nearestTheSun`/`acrossFromSun`: the sun
  stands at its azimuth and every foot below the brow, so
  `sun-layout.test.ts` holds the wash's outer ring at or above `browRow`
  less the farthest place's `WASH_FOOT_CLEAR`, column by column.
- **Splits**: `mushroom-shown.ts` and `flower-shown.ts` out of the beds;
  `tuft-tap.ts` out of `tufts.ts`.
- **The play run** walks back with no rim (`checkBack`), walks a dense
  forest of two clusters (`play-approach.ts`) and times the lawn's re-tend
  and the perches' re-see (`__probe.hitches()`).

## What the tail settled

The frame's costs and the calls that hold it to 26 ms — the side cull,
detail by drawn size, the lawn and the sow spread over frames, and the
air's crowdings still to spread — are [bite-12b/frame-cost.md](bite-12b/frame-cost.md);
the review's nine calls are [bite-12b/review.md](bite-12b/review.md).

- **The mottles read at `MOTTLE_TONE` 0.7, `MOTTLE_ALPHA` 0.4**: the
  planned 0.3/0.16 was all but invisible, 0.8/0.5 smudges where they
  overlap far out.
- **A leg setting off from a perch the sight no longer places** (after any
  turn) is timed from where the insect was last drawn (`placesSetOff`),
  not by the random flight time, which crossed from behind the eye in
  ~0.6 s.
- **A flier's body faces its drawn flight**: `drawnInsect`'s rotation is the
  screen direction of a one-pixel step along its turn (`bentTurn`,
  `insect-drawn.ts`), faded with `aloft` so a sitter keeps its rest facing.
  The step is taken between the unsunk `placed` points, so a flier sinking
  past the brow points along its flight rather than along the slide.
  [The sunk step: past `D_SEE` the sink mirrors the rows, so a flier going
  straight away over the brow flips 0 → π in one frame.]
- **The plays judge what is on screen.** The heading and turn-rate watches
  judge a frame only while the body's middle is on screen; the pop check
  passes over a change more than its drawn height past a side; the wait for
  a butterfly on a cap looks every minute (`CAP_LOOK`); the bee's dash bound
  is `DASH_SLACK` 1.25; a bee kept off the one planted flower by
  butterflies is noted, not failed. Each loosening has its line in
  [to-check.md](to-check.md). `play-fliers.ts` is out of `play-insects.ts`.
- **Every play green on every screen**: tabL, tabP, phoneP, phoneS, and
  phoneL once far mushrooms paint fewer chords.
