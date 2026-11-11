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
- **Player**: typing `goto05` stands the body on floor 5 (`Input.goTo`, any two
  digits) and makes the URL `?cheated_to=5`, the operator's way to see every
  floor.
- **Scripts**: `pnpm shaders:cube [--floor N]` compiles every floor's WGSL in
  seconds and prints errors with their source;
  `pnpm gallery:cube --floors 1,2,3 --out <absolute dir>` shoots an eye-level
  frame a floor; `pnpm play:cube` plays the pull.

## State

As of 11 Nov, 23:50 UTC, head "go to any cube floor by typing goto…" plus the
`?cheated_to=` rename.

- **Merged here**: the descent (complete: the lever shrinks the body where it
  stands, small it hops into a hole), and the five floor bands as they stood at
  23:25 — workplace 4–8, dwelling 9–20, leisure 21–31 (32–35 still `generic`),
  laboratory 36–52, edge 53–67. All 67 shaders compile; every gate was green
  after the merges.
- **Not merged yet**: `claude/cube-sound`, `-voice`, `-lettering`, `-decor`,
  `-happenings`, and whatever the bands pushed after 23:25 (leisure 32–35 at
  least). `git fetch origin` and compare each with this branch; a stream is done
  when its last commits are `polish:` ones or its session reports.
- **Moving layer**: a frame hands the scene `moving` quads (each in its own
  room's frame); `Mesh.stood` places them, `renderer.uploadMoving` draws them.
  The hands are its first user; happenings go the same way. The play hook's
  `setPose(pose, moving)` stages them for a script.
- **Smooth surfaces**: a `Facet` may carry `normals` per corner, and
  `loft(rings, room, {surface, sides, paint?, arc?})` (world) builds such a
  surface. The hands are lofts; decor's round things can be.
- **Hands**: second take, after the operator's "not AAA hands" on the boxes.
  `handsOf` costs ~5 ms a frame while they are up; a cache of the hand in its
  own axes would cut that if it shows.
- **Cheat**: `goto05` (any two digits, 01–66) replaces `idclip`; the URL then
  reads `?cheated_to=5`, which also starts the page on that floor.
- **Board**: published, version 39, at
  https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3 — ten frames in the zone
  "Making it beautiful". To add one: a `beauty-NN-*.webp` beside
  `src/cube-board/app/config/cube/beauty.yaml` and an item in it,
  `pnpm board build src/cube-board/app/config/cube.yaml`, then publish
  `tmp/board/cube/index.html` to that `url` with `root: tmp/board/cube` and the
  new image in `files`. Frames live in `tmp/cube-timeline/` (container-local).
- **Gallery**: `pnpm gallery:cube --floors … --out <absolute dir>` died once on
  a list of seventeen floors and ran on two; unexplained, rerun in smaller lists
  and read the error if it recurs. No frame of the merged bands has been looked
  at yet — do that before calling them done.
- **Preview**: republish after each visible push (`preview.yml`, inputs
  `site: vova`, `slot: 1`); last dispatched for the `?cheated_to=` commit.
- Sub-sessions hit the account's five-hour limit around 22:50 UTC and resumed on
  their own; a stream that looks stalled may only be waiting for it.

## Streams launched

Each a remote session on its own branch off this one, reporting back by message
when done; the lead reviews and merges.

| Stream                | Session                            | Branch                   |
| --------------------- | ---------------------------------- | ------------------------ |
| Sound                 | `session_01DaohkCMHPHHGXcrztjJDt5` | `claude/cube-sound`      |
| Voice                 | `session_01DaohkEDinAS3N4MKmhDZME` | `claude/cube-voice`      |
| Lettering and posters | `session_01DaohkCp3iTMNfzGeXLrg5o` | `claude/cube-lettering`  |
| Descent               | `session_01DaohkEv5QzP5HRqvoP2WgS` | `claude/cube-descent`    |
| Decor                 | `session_01DaohkCozV972W1BLmTzXwA` | `claude/cube-decor`      |
| Happenings            | `session_01DaohkE68cpjBn2aT8RoyZv` | `claude/cube-happenings` |
| Workplace 4–8         | `session_01DaohkFE4tn3iw7qZBGoodk` | `claude/cube-workplace`  |
| Dwelling 9–20         | `session_01DaohkDiYMM81V4SNZcJemR` | `claude/cube-dwelling`   |
| Leisure 21–35         | `session_01DaohkBMVGXdEuW3E2ayjQi` | `claude/cube-leisure`    |
| Laboratory 36–52      | `session_01DaohkEULbbnPnqNmdjyPte` | `claude/cube-laboratory` |
| Edge 53–67            | `session_01DaohkB98NDbXs6XjN5h4KC` | `claude/cube-edge`       |

The voice stream was told, after the operator found a formant voice too robotic
for the protagonist: the visitor makes wordless vocal sounds only; the words are
the building's public-address voice, which the robot timbre suits.

The operator, in the voice session, asked for the voice on the board. The voice
stream adds `pnpm voice:cube --out <dir>` (WAVs plus `manifest.json`: the
visitor's lines on floor 1, "here we go again" down the floors, the voice from
somewhere). On merging it: render them, publish a small artifact page of audio
players, and link it from a sticky in the board's "Making it beautiful" zone, as
the board already links the pricing chart.

## Next

1. Look at a gallery of the merged bands; note what falls short of the bar.
2. Merge the remaining streams as they finish: decor and happenings (wire decor
   into `faces`' callers in `cube-scene.ts`, happenings into the frame's
   `moving`), lettering and posters (as boards), sound and voice (cues from
   `Player.cues`, see `features/player/model/play.ts`), the voice samples page
   for the board.
3. The sale signs restyled so they sit with the floor's signage.
4. Calibration toward the AAA bar: exposure, materials, lamp panel detail, the
   broken mirror of floor 3's lamps in its tiles, the sleeve's fabric (its weave
   is drawn in a face's `uv`, which a curved surface has no steady one).
5. `/polish`, `/pr` (draft), `/five-percent`.
