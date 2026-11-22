# Clouds — hand-over note

Branch `claude/island-beauty-clouds`. Package: the clouds of `/island`.
Everything here was shot on WebGL2 under software raster, so no frame time
below is a GPU's.

## Where it stands

**From above it is weather; from the ground it is not yet as good as the
baseline.** Step 1 of the brief is delivered, step 2 is started and not
finished.

- **Built and wired.** A weather map over the sphere (`ui/cloud-regimes.ts`)
  read once per ray: fair-weather cumulus on the storm track, cyclones with a
  front, a cold sector of open cells and an ice shield, trade cumulus, decks
  of closed cells breaking into open ones, cloud streets, ITCZ clusters under
  anvils, clear subtropics. Meso cells are packed (Worley) cells, warped
  (`ui/cloud-noise.ts`, `ui/cloud-cover.ts`). A separate ice sheet at 10.5 km
  (`ui/cloud-ice.ts`). The march (`ui/cloud-nodes.ts`) reads the field at the
  ends of its steps and takes each step's thickness as the exact mean between
  them, so there is no jitter and no hatch. Every scale fades before it nears
  a pixel's width (`toldFrom`), which is what removed the speckle from orbit.
  Light (`ui/cloud-light.ts`): Beer–Lambert toward the sun, a dark flat base,
  forward scattering, a diffuse floor, shaded creases between billows.
- **One drift is kept.** The whole field turns east rigidly on the clock; the
  cyclones live and die on a second clock that wraps with it
  (`lib/clouds.ts`, pinned by `lib/clouds.test.ts`).
- **`sky-nodes.ts` is unchanged**; `along`, `glanced` and `shade` keep their
  signatures, and `along` is still a function of a ray that a separate pass
  could call.

## What is wrong, in the order it shows

1. **From the ground the sky is thinner and blander than the baseline's.**
   Far clouds are grey smears along the horizon; there are no cumulus with
   flat dark bases and heaped lit tops. Cause: four steps across a grazing ray
   are 5–25 km apart, and the mean between two ends that far apart is smooth.
   The baseline hid the same undersampling under dither. The cure is samples
   where the cloud is, not more of them: a first coarse pass for the nearest
   cloudy stretch, then the steps inside it.
2. **Just over a deck and inside any cloud the view is soft grey.** Same
   cause. The "second of grey" passing through the deck is not cured.
3. **A front's dense band has a crisp edge** against the soft shield round it
   (`storm-3000km`, the white worms in `coast-20000km`).
4. **Open cells still read as lace from 2,300 km** where a field of them is
   wide, though they now come in fields with clear air between.
5. **Low sun and moonlight were not re-shot after the rewrite**, nor was
   `shade` checked against `along` by frame.

## Cost

Counted in value-noise reads per cloudy ray, the baseline being 19: the map
4, the cyclones about 3, the meso cells at the layer's two ends 2–7, five
field samples of 2–5 octaves each 10–25, the sunward read 4 from over the
layer and none from under it, streets 5 where there are any. That is 25–40,
so 1.3–2× the baseline against a budget of 1.5×. It needs measuring on the
M2; the first economies to take are three steps for rays from orbit and the
meso cells read once instead of at both ends.

## Outside my files

- Nothing was changed outside the cloud files.
- No land–sea mask is asked for.
- `pnpm knip` fails on `detailReach`, `sandAt` and `sandAtSphere` in
  `src/island/entities/terrain/`, which came with the merge of the lead's
  branch.
- `lookTo` is clamped, so `sky-2m` sees only the horizon; cumulus overhead
  cannot be judged from the shooter until the play hook lets it look up 40°.

## Frames

`frames/0010-clouds-1-*.jpg`, shot with `pnpm shoot:island --no-build --shot`;
the baseline is `frames/0000-before-*.jpg`.
