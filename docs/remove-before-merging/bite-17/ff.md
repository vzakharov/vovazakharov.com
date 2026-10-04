# Package ff — fireflies probed, flared in the play, chimed

`## Left` item 5 of the plan. Paths under `src/pages/mushrooms/ui/scene/`
unless named.

## Done

- **`__probe.fireflies()`** (`scripts/lib/mushroom-probe-reads.ts`, zod
  `Fireflies` in `mushroom-probe-answers.ts`): each lit firefly by its index
  in the dozen, its screen point, its host key (`cap:<id>` / `flower:<id>`)
  and `flare`, 0 to 1. It reads `scene.dusk.fireflies.shown`, both private
  fields (as `sprouts` reads the bed's dots). `FireflyView` keeps
  `flaring` (`flare(…).glow` as of the last frame) on each firefly for it.
- **The flare shot** (`scripts/lib/play-dusk.ts` `shootFlare`): right after
  `dusk-dusk`, taps the lit firefly nearest the screen's middle, steps 15
  frames, expects its flare over 0.5, shoots `dusk-flare`. tabL: 12 lit,
  flare 1, the frame shows it lifted over the caps with its halo swollen.
- **The chime** (`sound.ts` `glint`, `MeadowSound.glint(pan)`): two sines a
  rising fourth (pentatonic steps 2 and 4, an octave up), 80 ms apart, 0.7 s
  decay, peak 0.05, each with a faint ×2.76 bell overtone; panned by the
  firefly's x across the screen. `FireflyView` takes a
  `Pick<MeadowSound, 'glint'>`; `dusk-view.ts` widens `DuskSound` with
  `glint` and passes its sound on (a two-line edit outside the owned list:
  the view holds no sound otherwise).

## Left

- Shot on tabL only; phoneP not run.
- The chime is not heard by anyone yet — a person should listen.
- The play's frame budget on tabL read 28.4 ms median (over 26, reported
  only) — the grass band's cost, `## Left` item 6, not this package's.
