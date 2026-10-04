# Package A — the light: hand-over note

Calls 1–7 and 14 of `bite-17.md`. Paths under `src/pages/mushrooms/`.

## Done

- Step 1 (in source) — `model/dusk.ts` (`Dusk`, `DUSK_MS`, `FULL_DAY`,
  `FULL_DUSK`, `duskness`, `dusky`, `turned`) with its tests;
  `Meadow.dusk` (opens `FULL_DAY`) and the `dusk` action (`Timed`) in
  `model/game.ts`'s `reduce`, tested in `game.test.ts`.
- Step 2 begun, **as a patch** (`a-light-step2.patch` beside this note,
  `git apply`-able): `ui/scene/palette-dusk.ts` (`DUSK`), exported from
  `palette.ts`; `PALETTE.duskWash`, `moon`, `moonShade`, `moonHalo`, `star`
  in `palette-backdrop.ts`; `backdrop-tones.ts` rebuilt round
  `tonesOf(colours)` → `Tones` (sky stops, ranges, rim, ground stops, brow),
  with `DUSK_TONES`, `tonesAt(dusk)` (source colours blended, so live-drawn
  parts match the cross-faded bakes), and `skyAt`/`groundAt`/`groundRowAt`/
  `ridgeTone` taking an optional `tones` (day by default). Typechecks and
  `backdrop-tones`, `ground-seam`, `ink`, `panorama` tests pass; **eslint
  fails** on it: `unicorn/consistent-destructuring` in `tonesOf` (use the
  destructured names for `farHill`, `nearHill`, `groundLit`… too), and
  `no-unsafe-type-assertion` in `tonesAt` (build the blend with a typed
  mapper over `DUSK`'s entries rather than `Object.keys(...) as`/`as
BackdropColours` — e.g. spell the object out key by key, or a helper
  `blendColours(a: BackdropColours, b: BackdropColours, t)` returning a
  literal built from `tonesOf`'s own keys).

## Left — designed

1. **Bakes** (`paint-backdrop.ts`, 408 lines — move `bake`/`aboutTheSun`/
   `Picture` into a new `bake-picture.ts` first): bake `duskSky` (the dusk
   sky via `paintSky(graphics, layout, DUSK_TONES)` plus a dozen ringed stars
   from a fixed seed, never `random`, in the upper band) at a new
   `DEPTHS.duskSky` -7.5 (over the glow, under the sun), and `duskGround`
   (`paintGround` with `DUSK_TONES`) at -2.9, bobbing like the ground. Both
   kept in `Backdrop`, their alpha carried over a repaint (else 0).
2. **Clouds**: a dusk twin per cloud in `paintClouds` (created between the
   day cloud and the rain twin, same puffs, `DUSK` cloud colours, haze toward
   `DUSK.skyTop`); `placeClouds` and rain-view's `scaleCloud` move them too.
   Fade them whole with rain-view's `shade` and its filter-camera setup —
   move both into a shared module (`twin-fade.ts`) both views import.
3. **Hills and brow**: `drawHills(layers, hills, view, tones)` and
   `drawBrow(..., tones)` take `tonesAt(level)`; a `Range` keeps a key into
   `tones.ranges` instead of its tones. `Backdrop.relight(level)` (a closure
   like `follow`) redraws them when the level, quantised to 1/64, changes.
4. **`dusk-view.ts` `DuskView`**: wash rectangle `PALETTE.duskWash` at
   `DUSK_WASH_DEEPEST * level` at `hudDepth - 2` (stacks with the rain's);
   `glowDepth = hudDepth - 1.5` — **the seam for packages B and C**: windows
   and fireflies draw at `dusk.glowDepth` and read `dusk.level`; the moon
   (a `Graphics`, drawn on paint by a shared `drawMoon` in `paint-moon.ts`:
   pale disc, crescent shadow = disc minus a circle offset ~0.35 r, a rosette
   of petals in `moonHalo` outlined in `inkCool`) at the sun's screen point
   (`layout.sun.x + shiftOf(backdrop.view, layout.sun.x)`), rising from
   ~0.5 r below and fading in by level; the sun columns sink ~0.4 r by level
   (record their baked `y` on paint), the sun's wash columns alpha `1 −
level`; `tap(at, bob)` within `max(TAP_RADIUS, sun.r * SUN_RAY_REACH)` of
   that point dispatches `{ kind: 'dusk', now }` and sounds `voice.sink()`
   toward dusk, `voice.grow()` toward day; `schemeIsDark()` reads
   `data-mantine-color-scheme` on `<html>`, else `prefers-color-scheme`.
5. **Rain view**: `update(rain, dusk)` — sun and glow alpha
   `sunShown(wet) * (1 − dusk)`, rainbow `* (1 − dusk)`.
6. **Scene** (427 lines, keep ≤ 450): hold `DuskView` like `RainView`;
   `this.meadow = { ...firstMeadow(random), dusk: schemeIsDark() ? FULL_DUSK
: FULL_DAY }`; update the dusk view before `rain.update`; `tapMeadow`
   tries `dusk.tap` after the clouds.
7. **Map**: move `drawSun` out of `map-view.ts` (445 lines) into a compass
   module with a moon drawn by `drawMoon`; `MapSnapshot` gains `dusky`.
8. **Probe and play**: `__probe.dusk()` → `{ level, toward }`,
   `__probe.sunAt()` → the sun's screen point or `null`; a `dusk` play
   registered in `play-mushrooms.ts`: tap the sun, shoot day, mid-fade
   (`DUSK_MS / 2`) and dusk, tap the moon, shoot morning; tabL and phoneP.

## Decided

- A partial turn takes its share of `DUSK_MS` (a turn reversed at half way
  goes back in 2 s), so the light always moves at one pace.
- The `dusk` action changes nothing but `dusk`: unlike `rain` it leaves the
  flower picker open. Package B may shut it when it closes the flowers.
- A dark page opens with `FULL_DUSK` set on the first meadow by the scene;
  `firstMeadow` itself always opens in `FULL_DAY`.
- Hills, brow and clouds are drawn live, not baked, so they take the dusk by
  live tones (`tonesAt`) and cloud twins rather than a second bake.
