# Bite 13 — rain

The shower itself, per [rain.md](rain.md), whose behaviour is the contract;
what the shower leaves behind is item 14. The model is built (`model/weather.ts`,
`Meadow.rain`, the `rain` action). This file holds the calls rain.md leaves to
the scene, settled before any brief, and the packages they cut into. Paths are
under `src/pages/mushrooms/`.

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

Then the tail: the review subagent, its fixes, frames, `/polish`, the
Artifact.
