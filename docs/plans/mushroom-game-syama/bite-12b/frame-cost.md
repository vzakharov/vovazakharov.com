# Bite 12b — what a frame costs on the endless field

What holds the 26 ms frame (`FRAME_BUDGET_MS`) once the field has no edge,
measured on tabL unless it says otherwise. Paths under
`src/pages/mushrooms/ui/scene/` unless they say otherwise.

## The render is Phaser's, per visible Graphics

Phaser 4 re-triangulates every **visible** Graphics every frame
(`GraphicsWebGLRenderer` → `Earcut` per fill path; no bounds culling,
`willRender` reads only flags), and a mushroom carries 7–12.7 k buffer
entries whatever its drawn size. So what a frame costs is how many Graphics
are visible, never how many the field stores, and anything a later bite adds
as Graphics (rain, fireflies) pays the same per object.

- **The side cull.** `bedPlace` hides what stands off the screen's sides; a
  mushroom behind the eye within `D_SEE` was otherwise drawn off screen
  (azimuth π stands at `ahead` 7.07 > `V_NEAR`). Under the area cap at
  most 36 stand within `D_SEE` and 19 on a tabL screen; 36 drawn would cost
  ~31 ms, 19 ~23 ms. So the field-wide 96 bounds the store and the area cap
  bounds the frame; a lower ceiling buys nothing.
- **Detail by drawn size.** `curveSteps(drawn)` in
  `model/mushroom-profile.ts` is the one size→detail map (`ceil(drawn / 3)`
  chords, from 8 to `CURVE_STEPS` 28); stem light in fewer, more opaque
  layers; far spots as polygons; `repaintsDue` repaints a mushroom whose
  count changed. phoneL `approach` 30.0 → 18.4 ms median (19 mushrooms on
  screen there against phoneP's 6); the far forest reads the same. The gill
  band keeps all 28 (`BAND_STEPS`): its error is where the angle samples
  fall on the notch round the stem, and resampling the notch would move the
  tap outline. Beaten: baking (the turning light re-bakes every frame of a
  turn); a phoneL budget of its own (a real phone runs the same `Earcut`).

## Game work spread over frames

- **The lawn's re-tend** (`tending.ts`): `TEND_SLICE` 60 tufts a frame after
  a 0.3 ms gather, for the walk's re-tend and a sow's alike (a sow hides what
  it covers at once, `review.md` T141). Frames carrying lawn work 43.3 →
  26.7 ms median. Kept over shrinking the tended sector.
- **The perches' re-sight on a sow** (`flower-sight.ts`, `perches.ts`): a
  sow sees afresh, because a new flower is a perch and changes where a bee
  may plant. `sightAt(layout, covers, foot)` judges a ring foot once per
  layout and covers (a new anchor brings new ones, and the memo goes with
  them), and `Perches.see` walks the beds' rows rather than every place.
  Exact, no answer changed: the slowest sow frame 79.5 → 43.1 ms.
- **Frames do not grow after a long walk.** Objects, standing tufts (88–108),
  mottles (243), perches placed (~660) and air spots (~650) hold flat; the
  drawn frame tracks what is visible, insects on screen above all.
  `__probe.costs()` is the readout (`scripts/lib/mushroom-probe.ts`).
- **The approach play's median is ~26 ms on a loaded container**, the drawn
  forest's render, which neither the lawn nor `see` moves: accepted.

## To build: the walk's re-sight is the air's crowdings

A re-sight at a fresh perch anchor (`PERCH_STEP`/`PERCH_TURN`) costs ~18 ms
median on tabL; in Node 8.1 of its ~9 ms is `airOf`, fresh at every anchor
(`KEPT` caches a few), and 70 % of that is `crowdingsAsDrawn` over every
near pair of ~650 spots. The pairs hardly change between adjacent anchors
and spots keep their names (`air-<i>-<j>`), so either judge only the pairs
touching spots new to this anchor and carry the rest from the last anchor's
`Air` where both ends are still offered and their drawn zooms moved less
than a set share, or spread `airOf` over frames as `Tended` spreads the
lawn, the old air offered until the new is whole. Either keeps "never two
per perch" (crowdings exact or conservative); the approach play's "perches'
re-sights" line measures it.
