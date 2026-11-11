# Make the cube beautiful — working state

Session `session_01DaohkEZGmfg7XD5wRftBnA`, branch `claude/cube-liminal-332pmv`
(no PR yet), published at https://preview.vovazakharov.com/cube (slot 1,
republished after every visible push). Planless `/go`; this file is the lead
session's memory across compactions, kept current at every milestone. One-shot
run: no questions to the operator, never merge to `main`, preview slot only, no
external services.

## The ask (operator, verbatim essentials)

1. Liminal-space-inspired, not a Backrooms copy. All 66 floors different and
   procedural, every texture drawn on the spot, everything through `dice` so two
   viewers see the same thing at the same place **and the same time**.
2. Procedural decor: lighting, signs, objects, gags, non-interactive jumpscares;
   style-wall breaks welcome (comic, cartoon); no interactivity.
3. Sound: synthesized steps, breath, effort; occasional synthesized phrases,
   decaying into absurd language-like speech deeper down. No Russian except
   easter eggs; script decays into invented alphabets.
4. After each descent a quiet poster showing, life-size, the thing you are now
   the size of (mouse → bacterium → virus → … quarks).
5. Sale signs must not argue with the posters and signage.
6. **Descent, as changed mid-run (supersedes the grab-the-hatch sequence):**
   pulling the lever just shrinks you, standing a little aside from the hatch —
   the first time you look at your hands and around and say "wtf", the second
   time "here we go again", and so on. Small, you may run about the upper floor
   if you like. Walking up to the hatch, you simply jump in: no pulling up, no
   lowering down.
7. Bar: "orders of magnitude better than before, but not AAA level" was said of
   the first frames — aim higher.
8. Keep the board (`src/cube-board/`) and take screenshots at milestones,
   **failed and intermediate attempts included**, for the board and for the
   operator scrolling the chat. First-attempt frames are kept in
   `tmp/cube-timeline/01-first-compile-floor-{1,2}.png`.
9. Sacred: MASD, linters, the 400-line limit, "we fight entropy". Only
   `masd-disable insignificant` may be used, where the consumer is known.
10. Budget about $1,500 at API rates; close a viewable piece on the preview
    before limits cut off. Context: wind down at 330k, write this file and
    commit at 350k; auto-compact lands near 367k. Do not relay.

## Architecture as built

- **One shader per floor**, compiled on first sight (`renderer.prepare`), the
  mesh drawn as per-floor vertex runs (`pack` sorts by floor).
- **Vertex** (`pages/cube/lib/vertex.ts`, one `FIELDS` list generating the
  layout, the WGSL structs and the offsets): position, normal, room-local
  position, face uv, surface kind, the room's seed, flags, paint, cell.
- **World** (`entities/world`): every face names the room it faces into
  (`Quad.room`); walls are two faces `WALL_HALF` either side of the room's edge;
  a slab is `SLAB_THICK` of the rooms under it, their ceilings at
  `CEILING_HEIGHT` (`shared/lib/room-shape.ts`, which the shader's `ROOM` reads
  too), a hole going down a shaft; `pillars`; `traits(seed)` rolls a room's
  `grain` and `lamp`; `Setting`, `settingOf`, `inPlace` for whatever is set in a
  room.
- **Theme entity** (`entities/theme`), cut into sub-slices: `kit/` (the WGSL
  every floor is written over — `core`, `hash`, `light`, `finish`, `stuff`,
  `grade`, `ordinary` — and `FloorTheme`, `roomFlags`), one per band
  (`workplace/`, `dwelling/`, `leisure/`, `laboratory/`, `edge/`, each a
  `config/NN-name.ts` per floor) and `catalogue/` (`themeOf(n)`: a designed
  floor or `generic(n)`). A theme's WGSL defines
  `themeMaterial(s: Surf) -> Material`, `themeLight(s, m) -> vec3f` and
  `themeLens(l: Lens) -> vec3f` (a screen-space pass: style breaks go here);
  `ordinary(id, look)` writes the last two for a plain lit room.
- **Frame**: scene pass into `rgba16float` (rgb scene light, `a` metres away) →
  bloom (`pages/cube/ui/bloom.ts`) → the eye floor's lens to the canvas.
- **Clock**: `shared/lib/clock.ts`; the play hook freezes it.
- **Player**: typing `idclip` stands the body on the floor below (`Input.clip`),
  the operator's way to see every floor.
- **Scripts**: `pnpm shaders:cube [--floor N]` compiles every floor's WGSL in
  seconds and prints errors with their source;
  `pnpm gallery:cube --floors 1,2,3 --out <absolute dir>` shoots an eye-level
  frame a floor; `pnpm play:cube` plays the pull.

## State

- Floors 1–3 are designed (reception, open plan, school corridor); the rest are
  `generic(n)`. Every gate was green at `5985ed03`; re-run before `/polish`.
- Timeline frames, for the board (`src/cube-board/app/config/cube.yaml`, webp)
  and not yet on it: `tmp/cube-timeline/` (container-local) — first compile,
  HDR + bloom, eye level, pillars + door light, thick walls.
- Streams (`docs/plans/cube-beauty.streams.md`): see § "Streams launched".

## Next

1. **Continuous light.** The operator saw the floor's brightness jump at room
   edges and a hard edge where a lit room meets a dark one: each room is lit by
   its own lamps alone. `roomLight` is to sum the lamps of the eight rooms
   around too — each lamp windowed to nothing a room side away, a neighbour's
   counted only through open sides (the flags gain the diagonal routes) — in
   place of `doorLight`, so light is the same from both sides of an open edge
   and spills through doorways into dark rooms.
2. Launch the five theme bands once the light holds; merge every stream here.
3. The lead's wiring: a per-frame 'moving' vertex layer for hands and
   happenings; sound and voice cues; posters; decor; happenings; the sale signs
   restyled so they sit with the floor's signage.
4. Calibration toward the AAA bar: exposure, materials, lamp panel detail.
5. The board; `/polish`, `/pr` (draft), `/five-percent`.
