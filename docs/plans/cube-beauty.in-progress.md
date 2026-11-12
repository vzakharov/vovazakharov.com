# Make the cube beautiful — working state

Session `session_01DaohkEZGmfg7XD5wRftBnA`, branch `claude/cube-liminal-332pmv`
(no PR yet), published at https://preview.vovazakharov.com/cube (slot 1,
republished after every visible push). Planless `/go`; this file is the lead
session's memory across compactions and sessions, kept current at every
milestone. One-shot run: no questions to the operator, never merge to `main`,
preview slot only, no external services.

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

As of 12 Nov, 00:15 UTC, head "one home for what the cube's streams each wrote
for themselves". Paused at the operator's ask (account limit), to be taken up
from another account: `/go claude/cube-liminal-332pmv`.

- **Every stream is merged here**: descent, the five floor bands in full (4–8,
  9–20, 21–35, 36–52, 53–67), decor, happenings, lettering and posters, sound,
  voice. Their sessions are done; nothing is left on their branches.
- **Gates**: typecheck, eslint, prettier, `check:masd`, `masd:clusters`,
  `check:cycles`, `type-overlap`, `lint:fsd`, `shaders:cube` (67 of 67) are
  green. `pnpm test:all` fails one test only: the line limit, on three
  `src/mushrooms/scripts/lib/play-*.ts` files this branch does not touch.
- **On the page already**: the floors, the descent and hands, `goto05` with
  `?cheated_to=5`, and decor — `furnish(setting, decor)` is called in
  `cube-scene.ts` `build()`. Decor has not been looked at on this branch.
- **Merged but not wired** (each slice's `index.ts` still carries its
  `masd-disable insignificant` line, to drop once the page reads it):
  - Happenings: `happening(setting, n, clock) → { quads, sounds }` from
    `@/cube/features/happenings`; ask each near room per frame, `inPlace` the
    quads into the frame's `moving`, play each sound once keyed room + cue +
    `sinceEpoch`.
  - Posters and signs: `posterOf(n)`, `paintPoster(ctx, parts, scale)`,
    `POSTER_WIDE`/`POSTER_TALL` from `@/cube/entities/poster`;
    `strokes(text, scriptOf(n))` and `paintStrokes` from
    `@/cube/shared/lettering` for the sale signs. They go up as boards
    (`renderer.uploadBoards`).
  - Sound: `createSoundscape()` from `@/cube/features/sound` — `unlock()` on a
    gesture, `setPlace(theme.sound, pose.scale)` each frame, `cue(...)` for each
    of `Player.cues` (the player already paces its own steps) and for a
    happening's sounds with `bearingOf`. `SHRINK_SECONDS` in
    `sound/cues/model/cue.ts` is 3; the shrink takes 2 s.
  - Voice: `lineFor(moment, n, grain)` → `utter(line, voiceOf(who, n), rate)` →
    the soundscape's `play`, on the player's `say` cues;
    `pnpm voice:cube --out <dir>` renders the WAVs for the board's page.
- **Floor 67**: the maze places doors down to 66 only, so `mazeWalls` closes
  every wall past it — each room of 67 is the closed last room its theme draws.
  `play`'s go-to still stops at `DEEPEST_FLOOR`; 67 is reached by falling
  through 66's hole.
- **Known breaks**: Decor has no collision; the operator wants passability of
  every room to hold by construction (a clear region joining walkways, hole and
  lever, or a flood fill at furnish time), not by a sampled test. `build()`
  re-furnishes every room per mesh build.
- **Moving layer**: a frame hands the scene `moving` quads (each in its own
  room's frame); `Mesh.stood` places them, `renderer.uploadMoving` draws them.
  The play hook's `setPose(pose, moving)` stages them for a script.
- **Smooth surfaces**: a `Facet` may carry `normals` per corner, and
  `loft(rings, room, {surface, sides, paint?, arc?})` (world) builds such a
  surface. The hands are lofts; decor's and happenings' round things can be —
  the operator found the happenings' boxy figures "not scary".
- **Shared homes**: vector helpers are the world's (`plus`, `minus`, `times`,
  `cross`, `dot`, `unit`, `UP`); `clamp01`, `ramp`, `smooth`, `lerp` are
  `shared/lib/ease`; `Footing`, `Sound`, `Loud` are `shared/lib/acoustics`;
  `Furnishing` sits beside `THINGS`.
- **Board**: published, version 40, at
  https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3 — twelve frames in the zone
  "Making it beautiful", the last two being sheets of eight merged floors (5, 7,
  10, 15, 22, 33, 44, 61). To add one: a `beauty-NN-*.webp` beside
  `src/cube-board/app/config/cube/beauty.yaml` and an item in it (next free slot
  `[4128, 2460, 430]`), `pnpm board build src/cube-board/app/config/cube.yaml`,
  then publish `tmp/board/cube/index.html` to that `url` with
  `root: tmp/board/cube` and the new image in `files`. A session on another
  account must read the artifact before publishing to it, and may not have
  access to it at all.
- **Gallery**: `pnpm gallery:cube --floors … --out <absolute dir>` died once on
  a list of seventeen floors and runs on four; rerun in smaller lists. Eight
  floors were looked at as the board's two sheets, decor in them included; the
  other fifty-odd have not been.
- **Preview**: republish after each visible push (`preview.yml`, inputs
  `site: vova`, `slot: 1`); last dispatched for this head.

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

1. Wire what is merged: happenings into `moving`, posters and restyled sale
   signs as boards, sound and voice on the player's cues; drop each slice's
   `masd-disable` line as the page starts reading it.
2. Look at a gallery of every band and of decor; note what falls short of the
   bar. (Floor 66 loads; the mirrored lamps no longer sparkle — 3, 9, 11, 17 and
   66 looked at.)
3. The operator's asks from the run, not yet done: the hands move the lever at
   the pull; room passability by construction once decor collides; the voice
   samples page linked from the board.
4. Calibration toward the AAA bar: exposure, materials, lamp panel detail, floor
   3's grout still glinting inside the mirrored panels, the sleeve's fabric. Kit
   wishes from the bands: `ordinary` split into its light and its lens, a round
   `lampMask`, a distance-fade helper, a glowing surface without TV snow, a
   matte "shade" surface.
5. `/polish`, `/pr` (draft), `/five-percent`. Never `/finalize`, never merge.
