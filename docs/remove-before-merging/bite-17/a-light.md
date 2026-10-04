# Package A — the light: hand-over note

Calls 1–7 and 14 of `bite-17.md`. Paths under `src/pages/mushrooms/`.

## Done

- Step 1 (in source) — `model/dusk.ts` (`Dusk`, `DUSK_MS`, `FULL_DAY`,
  `FULL_DUSK`, `duskness`, `dusky`, `turned`) with its tests;
  `Meadow.dusk` (opens `FULL_DAY`) and the `dusk` action (`Timed`) in
  `model/game.ts`'s `reduce`, tested in `game.test.ts`.
- Step 2 (in source, package a1): `ui/scene/palette-dusk.ts` (`DUSK`), exported from
  `palette.ts`; `PALETTE.duskWash`, `moon`, `moonShade`, `moonHalo`, `star`
  in `palette-backdrop.ts`; `backdrop-tones.ts` rebuilt round
  `tonesOf(colour)` → `Tones` (sky stops, ranges, ridge, ground stops, brow),
  `colour` a typed lookup by `DUSK`'s names, with `DUSK_TONES`,
  `tonesAt(dusk)` (source colours blended, so live-drawn parts match the
  cross-faded bakes; tested), and `skyAt`/`groundAt`/`groundRowAt`/
  `ridgeTone` taking an optional `tones` (day by default).
- Left item 1, the bakes (package a1): `bake`/`aboutTheSun`/`Picture` in
  `bake-picture.ts`; `paintSky`/`paintGround` take an optional `tones`;
  `Backdrop.duskSky` (-7.5; its twelve ringed stars from `dusk-stars.ts`'s
  fixed seed are `Backdrop.stars`, one graphics each, package a3) and
  `Backdrop.duskGround` (-2.9, bobbing), alpha carried over a repaint, else 0. **DuskView sets their alpha with `backdrop.relight(level)`.**

## Left — designed

1. **Bakes** — done (see Done).
2. **Clouds** — done (package a2, `a2.md`): dusk twins faded by
   `backdrop.relight(level)`.
3. **Hills and brow** — done (package a2, `a2.md`): `backdrop.relight(level)`
   also sets the dusk bakes' alpha (it replaces `showDusk`), so DuskView
   calls that one thing.
4. **`dusk-view.ts` `DuskView`** — done (package a3, `a3.md`): wash rectangle `PALETTE.duskWash` at
   `DUSK_WASH_DEEPEST * level` at `hudDepth - 2` (stacks with the rain's);
   `glowDepth = hudDepth - 1.5` — **the seam for packages B and C**: windows
   and fireflies draw at `dusk.glowDepth` and read `dusk.level`; the moon
   (a `Graphics`, drawn on paint by `drawMoon(graphics, moon, ink)`, built, in `paint-moon.ts`:
   pale disc, crescent shadow = disc minus a circle offset ~0.35 r, a rosette
   of petals in `moonHalo` outlined in `inkCool`) at the sun's screen point
   (`layout.sun.x + shiftOf(backdrop.view, layout.sun.x)`), rising from
   ~0.5 r below and fading in by level; the sun columns sink ~0.4 r by level
   (record their baked `y` on paint), the sun's wash columns alpha `1 −
level`; `tap(at, bob)` within `max(TAP_RADIUS, sun.r * SUN_RAY_REACH)` of
   that point dispatches `{ kind: 'dusk', now }` and sounds `voice.sink()`
   toward dusk, `voice.grow()` toward day; `schemeIsDark()` reads
   `data-mantine-color-scheme` on `<html>`, else `prefers-color-scheme`.
5. **Rain view** — done (package a3): `update(rain, dusk)` — sun and glow alpha
   `sunShown(wet) * (1 − dusk)`, rainbow `* (1 − dusk)`.
6. **Scene** — done (package a3; 432 lines, keep ≤ 450): hold `DuskView` like `RainView`;
   `this.meadow = { ...firstMeadow(random), dusk: schemeIsDark() ? FULL_DUSK
: FULL_DAY }`; update the dusk view before `rain.update`; `tapMeadow`
   tries `dusk.tap` after the clouds.
7. **Map** — done (package a-map, `a-map.md`): `map-compass.ts`
   `drawCompass` draws the sun, or the moon by `drawMoon` when `MapSnapshot.dusky`.
8. **Probe and play** — done (package a4, `a4.md`, with the `dark` play and the moon cut round the clouds): `__probe.dusk()` → `{ level, toward }`,
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
