# Bite 13 — rain

The shower itself, per [rain.md](rain.md), whose behaviour is the contract;
what the shower leaves behind is item 14. The model is built (`model/weather.ts`,
`Meadow.rain`, the `rain` action). This file holds the calls rain.md leaves to
the scene, the packages they cut into, what was built and the review's
outcomes. Paths are under `src/pages/mushrooms/`.

## Calls

1. **A cloud takes a tap where it is drawn.** rain.md says "the cloud's
   circle", but a cloud is drawn as puffs spread `CLOUD_SPREAD` (4) radii
   either side of its middle (`paint-backdrop.ts`), so its circle misses
   most of what a child taps. The hit area is the drawn cloud's bounds, at
   least `TAP_RADIUS` from its middle line up and down. The test sits in
   `meadow-scene.ts`'s `tapMeadow`, ahead of the tuft: that handler runs only
   when no game object is over the pointer, which is the lowest priority
   rain.md asks for. The cloud's x is where `placeClouds` puts it now; its
   y and r come from `layout.clouds`.
2. **Which cloud was tapped is the scene's, not the model's.** The model has
   no clouds; `rain-view.ts` keeps the tapped cloud's index and darkens it
   first, the others following over ~0.6 s, and puts the drops densest under
   it wherever it stands now — about half of them in its drawn span while
   it is on screen, all spread across the screen while it is not.
3. **Nothing in the sky is redrawn per frame for the darkening.** Each cloud
   gets a dark twin (a second Graphics painted once per paint in the dark
   cloud colour, placed with it), crossfaded by alpha; the wash is one
   rectangle over everything but the drops, the splashes and the HUD,
   creatures included, its alpha following `wetness` up to ~0.3.
4. **The rainbow is a bake slid by azimuth**, as the sun and glow are:
   concentric bands from `palette-backdrop.ts`, standing at the sun's
   azimuth + π through `screenAt`, alpha `rainbow(rain, now)`. When a new
   shower starts under it, `rain-view.ts` fades it out from the alpha it had
   over ~0.6 s, since the model's `rainbow` drops to 0 at once.
5. **The drops are a pool of images from one baked streak**, at most 120,
   each falling from above the top edge to a landing point picked when it
   is spawned: a ground distance between the near rows and the brow, put on
   the screen through the view (`ofGround`); where the drop's column crosses
   a drawn cap above that point, the cap's top is the landing point instead
   (the cap outline the taps already use, `model/mushroom-outline.ts`).
   Where one lands it puts a small ring there, widening and fading over
   ~0.3 s, in `spores.ts`'s particle manner. A splash on the ground is
   placed as a foot on the plane, so it stays on the ground as the child
   turns and walks; drops in the air finish their fall after `stopsAt`.
6. **Flowers close by `wetness`**, the closing a parameter of
   `draw-flower.ts` from 0 (open) to 1 (folded up to the centre). A flower
   is repainted only when its closing crosses one of ~12 steps, so a flower
   is redrawn about a dozen times a shower, not each frame. A closed flower
   still plays.
7. **A mushroom swells by scaling its drawing about its foot**, by
   `1 + 0.06 · wetness`. Its tap outline is not scaled: 6% is inside the
   tap patch's slack.
8. **The sound lives in its own module beside `sound.ts`** (`MeadowSound`
   is at 329 lines): a hiss of filtered noise from `synth.ts`'s
   `brownNoise` and a patter of tiny ticks whose rate follows `downpour`,
   both levelled by `wetness` (which already eases in over 1.5 s; rain.md's
   "~1 s" is close enough not to keep a second curve), and a low soft
   whoosh on a cloud tap. Silent under the mute. Its level above ~300 Hz is
   checked by an `OfflineAudioContext` render, the play-run note's way.
9. **The probe** reads `__probe.rain()` — the span, `raining`, `wetness`,
   `rainbow`, the drops in the air and the flowers' mean closing — and
   `__probe.clouds()`, each cloud's tap point on the screen now.
10. **`meadow-scene.ts` only wires the rain bed**, and stays under ~450
    lines (it is at 457): whatever the wiring needs room for moves out.

11. **One wetness a frame, the scene's.** A shower started while the last
    one still dries resets the model's `wetness` to 0, so read alone it
    would flash the sky and spring the flowers open for a moment. `RainView`
    keeps the last span and gives the wetter of the two (R1's
    `rain-sky.ts`); the wash, the twins, the flowers' closing and the caps'
    swell all read that one value, passed to the beds from `meadow-scene.ts`.
    It beat backdating `startedAt` in the model, which would bend
    `downpour`'s and `rainbow`'s clocks too.
12. **Every cloud tap wobbles the cloud**, the first included (R1); rain.md
    asked it only of a restart, but a tap that starts the rain answers with
    the cloud too.

13. **A closed flower reads as a bud, not a speck.** R2's fold (petals to
    45% reach) leaves a dot a child takes for a flower gone (frames
    `tabL-r2-closed.png` against `-open.png`). Closed, the petals stand
    folded up into a cup or a pointed bud about two-thirds of the open
    head's height, the petal colour plain on it, so the flower is still
    there and visibly shut.

14. **The rainbow stays opposite the sun, behind the child on the opening
    screen.** R5 found it on no opening view; rain.md asks exactly that
    ("the child turns her back to the sun to see it"), and a rainbow put
    in sight instead would stand beside the sun, which no child has seen.
    The play turns round to it; `to-check.md` asks a person whether a
    child finds it.
15. **The sun dims while it rains.** R5's mid-shower frames show it bright
    and round under the dark clouds — rain in full sunshine. The sun and
    its glow fade with the one wetness to about half (`1 − 0.5 · wetness`),
    alpha on their bakes, nothing redrawn; the rainbow after needs the sun
    back, and it is.

## Packages

Wave 1, in parallel, file lists disjoint:

- **R1 — the sky.** `rain-view.ts` (new) and what it needs beside it: calls
  1–4, the wiring in `meadow-scene.ts` (all of it but the two bed lines R2
  owns), the probe's `rain()` and `clouds()` in `scripts/lib/mushroom-probe.ts`,
  colours in `palette-backdrop.ts`. Owns `paint-backdrop.ts` for the dark
  twins.
- **R2 — the meadow wets.** Calls 6 and 7: `draw-flower.ts`, `flower-bed.ts`,
  `mushroom-bed.ts` (and its painters as needed), and in `meadow-scene.ts`
  only the arguments the `bed?.update` and `flowers?.update` lines pass.
- **R3 — the sound.** Call 8: the new sound module, `synth.ts` primitives
  as needed, its methods on `MeadowSound`; no wiring (R4 calls it).

Wave 2, once R1 has landed:

- **R4 — drops and splashes.** Call 5 in a module of its own that
  `rain-view.ts` drives, and R3's sound wired into `rain-view.ts`.
- **R5 — the play.** `scripts/lib/play-rain.ts` and its place in
  `pnpm play:mushrooms` (`--plays rain`): a cloud tapped on every screen,
  frames mid-shower and at the rainbow, `rain` set, the flowers closed
  mid-shower and open after, the 26 ms budget held with the drops falling.
  A game red is fixed by the run; a harness red goes to `to-check.md`.

Then: **R1b** (R1's dark-twin fix and the rainbow), **R6** (call 13),
**R7** (call 11 and the rainbow), **F** (small fixes and call 15), **T**
(`pnpm type-overlap` clean); the review (two reviewer agents) and its fixes
in **X1** and **X2**; the tail.

## Built

Frames in `docs/remove-before-merging/frames/bite-13/`. Modules under
`ui/scene/`.

**The sky (R1, R1b, R7, F).**

- `rain-sky.ts`, pure and tested, holds the levels: `wetnessShown` (the
  wetter of the last two spans, call 11), `cloudDarkness` (the cloud that
  started the shower first, the rest lagging by azimuth up to 600 ms on
  `wetness`'s own curve), `rainbowShown`, `rainbowArc`, `sunShown`
  (`1 − 0.5 · wet`, call 15), `cloudAt` and `CLOUD_SPREAD`.
- `rain-view.ts`'s `RainView` drives it all from one `update` a frame and
  owns the frame's one `wetness`. `lead` (the cloud that started the
  shower, which the others darken after) is kept apart from `tapped` (the
  last tapped, which the drops fall densest under), so a restart elsewhere
  does not reshuffle the darkening. Every cloud tap wobbles the cloud.
- The dark twins are `Backdrop.rainClouds`, each created straight after its
  cloud at the same depth. A Graphics' alpha falls on each puff, so a
  half-faded twin showed its puffs' overlaps as rings: while it fades a
  twin renders whole through its filter camera
  (`setFiltersForceComposite`, one screen-sized framebuffer per twin on
  screen); the canvas renderer has no filters and keeps plain alpha. The
  wash is one screen-fixed rectangle at `HUD_DEPTH - 2`; the drops are at
  `HUD_DEPTH - 1`.
- The rainbow is `Backdrop.rainbow`, seven bands stroked outermost first.
  Its radius is `min(0.8 · nearHills, max(0.42 · width, 0.6 · nearHills))`:
  without the 0.6 floor a tall phone's arch stood wholly behind the far
  hills' crests. Depth −6.5, between the sun (−7) and the clouds (−6).
- The sun and glow take `sunShown` as alpha. At half alpha the sun reads
  see-through more than veiled; a grey tint would be a palette colour and a
  second bake (`to-check.md`).

**The meadow wets (R2, R6, R7).**

- `flower-closing.ts`: `closingStep` (one of 12), `closingsDue` (at most 6
  heads a frame, drawn before hidden, nearest first), and the bud (call
  13): `BUD` — 1.35 of the open head's 2.0 height, petals 1.35× as wide,
  the centre gone under them by 1/1.6 shut so no dot shows — and
  `petalPose`, swinging each petal to standing the short way round.
  `PetalPose` is a labelled tuple, since an object of
  `foot`/`angle`/`length` overlaps `Footed`, `Mottle` and `Wing` under
  `pnpm type-overlap`. `draw-flower.ts` paints the petals at their poses in
  the open colour; `flower-shown.ts` repaints a head alone in its last
  light.
- `flower-seat.ts` (tested): `foldedHead` gives the perches — the bee's rim
  closing to the bud's foot, the butterfly's centre rising to its tip. The
  tap reach stays the open head's, so a closed flower plays.
- Caps swell (call 7) by the scale `MushroomBed` already sets about the
  foot, `RAIN_SWELL` 0.06. The Phaser hit area is in the graphics' frame,
  so it grows with the drawing as with breathing; only the gene outline
  (`mushroom-outline`, which drops and flower yielding read) stays
  unscaled.
- Both beds' `update` take the frame's `wetness`, not the span;
  `rain.update` runs before them.

**Drops and splashes (R4, F, X2).**

- `rain-fall.ts`, pure and tested: where a drop falls (`dropColumn`: half
  in the tapped cloud's span while it shows), what it lands on
  (`firstCrossing`), where it first shows (`shownFrom`), and how many
  start: 96 steady, a restart tap's gush of 24 in its own room above them,
  120 at most.
- `rain-drops.ts`'s `RainDrops`: 160 pool slots of a streak and a ring, so
  landed rings never starve the drops. A drop starts above y 0 (not
  `worldView.y`, which the device ratio's zoom offsets), slanted, and lands
  where picked at its start: a row uniform in screen rows between the brow
  and the screen's foot (uniform in ground distance crowds the brow), put
  on the plane, or the first drawn cap its path crosses (`hit-areas.ts`'s
  `drawnMushrooms`, which the flower hit test shares). The landing is
  re-placed every frame, so a splash stays put as the child turns and
  walks.
- `cloud-puffs.ts` holds the puff layout `paintClouds` reads and its widest
  reach, any shaping, any sun (2.78 r across, 1.22 r below);
  `CLOUD_SPREAD` is that reach, so taps, drops and the probe follow the
  drawn puffs. A drop under a showing cloud is hidden till it clears the
  cloud's underside — hidden, not started there, which would have a
  shower's first drops appear in one row.
- `RainDrops.start`'s `if (!foot)` never fires: every landing row lies
  under the horizon on any camera.

**The sound (R3, F).** `rain-voice.ts`'s `RainVoice`: a brown-noise hiss
under 450 Hz, and a patter of three baked tick loops, layer k at
`clamp(3·downpour − k, 0, 1)`, so the rate follows `downpour` with no node
per tick; both levelled by the scene's wetness, so a restart while the last
shower dries keeps the hiss. A steady shower touches no node; the graph is
let go on the first dry frame. `whoosh` on every cloud tap. An ad hoc
`OfflineAudioContext` render put a full shower ~12 dB under a C5 note above
300 Hz.

**The play (R5, X1).** `scripts/lib/play-rain.ts` (`--plays rain`) taps a
cloud, checks drops falling and flowers shut mid-shower and open after,
then holds `→` until `__probe.rainbowAt()` is mid-screen and the rainbow
shows. It times frames one at a time against `FRAME_BUDGET_MS` over the
closing ramp, mid-shower and the reopening (tabL 16.1 / 18.9 / 13.0 ms
median). `__probe.rain()`'s `closing` is the fold the paint recorded.

**The scene and types (F, T).** `meadow-scene.ts` (446 lines) wires the
rain bed; its event wiring is `meadow-listeners.ts`'s `listenOnMeadow`.
`WithTapArea` (`mushroom-tap.ts`) is the one home of a mushroom's `area`;
`Slot`'s fields are `droppedAt`, `splashedAt` and `nearness`, renamed
rather than based since they share only a name with `KeySown.at`,
`Turns.landed` and `Scaled.size`.

## The review

Its calls, each with the alternative it beat:
[bite-13/review.md](bite-13/review.md). Outcomes:

1. B1 — `Shown.headR` is the open head's radius; the folded reach is
   `Shown.perch`, which only `FlowerBed.seat` reads (cea5c240).
2. B2 — `drawHead` records the `Folding` it painted as `shown.painted`;
   `closing()` averages it, and a broken `drawHead` fails the play
   (d3a911c8).
3. B3 — the play times the closing and reopening ramps too (fe968caf).
4. A1 — a cloud takes taps over its drawn puffs (74c5eec1).
5. A2 — rain falls out of the cloud, never over it (f0b88ecb).
6. A's hunch — the groundless drop never happens; left as it is
   (1607713b).
