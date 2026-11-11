# Make the cube beautiful — working state

Session `session_01DaohkEZGmfg7XD5wRftBnA`, branch `claude/cube-liminal-332pmv`
(no PR yet). Planless `/go`; this file is the lead session's memory across
compactions, kept current at every milestone. One-shot run: no questions to the
operator, never merge to `main`, preview slot only, no external services.

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
  (`Quad.room`); walls are two faces, one per room; ceilings belong to the child
  rooms; `pillars`; `traits(seed)` rolls a room's `grain` and `lamp`.
- **Theme entity** (`entities/theme`):
  `FloorTheme { name, air, pillar, dark, shader, sound }`, `themeOf(n)`
  (designed floor or `generic(n)`), bands in `config/bands/*.ts` (offices 1–8,
  homes 9–20, breaks 21–35, labs 36–52, edges 53–66), a floor per file in
  `config/floors/`. A theme's WGSL defines `themeMaterial(s: Surf) -> Material`,
  `themeLight(s, m) -> vec3f` (scene light) and `themeLens(l: Lens) -> vec3f`
  (the frame's pixel, a screen-space pass: style breaks go here).
  `ordinary(id, look)` writes the last two for a plain lit room.
- **Kit** (`entities/theme/lib/kit`): `core` (Surf, Material, `matte`,
  `polished`, `glowing`, `embossed`, Lens), `hash`, `light` (per-room lamp grid,
  highlights, mirrored panels, corner shade, stutter on the shared clock),
  `finish` (plaster, tiling, carpet, damp, band), `stuff` (prop materials by
  kind, `ownedMark`), `grade` (haze, tonemap, `through`, grain, vignette).
- **Frame**: scene pass into `rgba16float` (rgb scene light, `a` metres away) →
  bloom (`pages/cube/ui/bloom.ts`) → the eye floor's lens to the canvas.
- **Clock**: `shared/lib/clock.ts`; the play hook freezes it (`setClock`,
  `PLAY_INSTANT`).
- `shared/lib/colour.ts`, `shared/lib/surface.ts` (kinds, shared by mesh and
  shader).

## State at this commit

- Type-check clean; unit tests green before the HDR/lens change (re-run).
- The first version (lit in the surface shader, no post pass) rendered. **The
  HDR + bloom + lens version has not rendered yet**: `pnpm play:cube` hung for
  ten minutes — find out why first (most likely a shader or pipeline error that
  leaves `ready()` unresolved; make such an error fail fast).
- Not yet run: `pnpm lint`, `lint:fsd`, `check:masd`, `masd:clusters`,
  `check:cycles`, `type-overlap`, `format:check`.
- `src/cube/scripts/lib/cube-page.ts` holds the browser session; a
  `gallery-cube.ts` script (one eye-level frame per floor, eye in a mid-floor
  room looking down its longest open run) is still to write.

## Next

1. Get the HDR frame rendering; calibrate exposure and materials on floors 1–3
   from eye-level shots; send frames to the operator and the board.
2. Run every checker; commit; publish to the preview slot.
3. Launch the parallel streams as remote sessions on their own branches off this
   one (each `/go <task>, no PR`, reporting back by message), merge them here:
   sound effects; voice; lettering and scale posters; the shrink sequence, hands
   and the jump (ask 6); decor kit; timed happenings. They deliver pure
   functions with tests (`=> Quad[]`, sound buffers); the page wiring is the
   lead's.
4. Second wave: the five theme bands, sale-sign restyle, style-break floors.
5. `/polish`, `/pr` (draft), `/five-percent`.
