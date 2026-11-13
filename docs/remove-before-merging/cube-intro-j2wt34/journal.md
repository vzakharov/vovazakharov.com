# The lead's journal, moved out of the plan

Entries moved verbatim from `docs/plans/cube-intro.in-progress.md` when it neared the line cap; `brief.md` holds the earlier ones.

## Progress and steering, 2026-11-13 10:48Z–11:12Z

- **10:48Z, the operator chose the beam's way (in pill's session)**: the sun
  stays, outside nothing changes, the cube's INTERIOR turns a quarter
  counter-clockwise against the shell — the east doorway opens into the room's
  south wall; bench and trees ahead, hatch and shelf front-left and out of the
  beam, the noticeboard to hang by the shelf and hatch, the painted door gone,
  none of it hardcoded. Routed 10:57Z: **core leads** (one rigid turn of the
  whole interior at the seam in `shared/outside/frame.ts`, the turn derived: of
  four quarter-turns, those whose beam footprint misses floor 1's hole quarter
  and shelf; ties come to the lead; a test holds it; outside eyes
  pixel-identical); **pill** — clear zone at the opening asked of the seam, the
  noticeboard by rule on the wall adjoining the shelf's, the opening consumes
  floor 1's rolled door; **shell** — comparison narrowed (commit what exists),
  and the oil-film tint comes off the underside and is capped elsewhere (the
  operator: "why the cube is pink underneath is beyond me"); **walk** — waits
  for core's seam. Core's lens pass comes after the turn. Board v68 holds the
  sky's frames 17–18; next free slots [5748, 3250], [6208, 3250].
- **~10:57Z, the operator put the body's shadow on hold** (to shell): «давай
  теней "от нас" пока не делать -- ни внутри, ни на песке… интуитивно кажется
  что это мимо атмосферы». Shell deletes `bodyShadow`, the room's `bodyShade`
  and `--body`; `frame.body` stays unread until he decides. **Merge shell's next
  head at once** — the lead's tree has the indoor shade live.
- **11:05Z: lead ffc34102** — shell 1114f295 merged (no body shadow; gates
  green; shell still owes the pink underside and deleting `bodyShadow`). **Tone,
  from the operator via board, nothing to build**: an allusion to Andy Weir's
  "The Egg"; afterlife metaphors, the endless maze as purgatory. Working titles
  he is turning over: "cubed away", "cubeaway". The FIRST approved frame is the
  sea one; the beach frame is another approved one, not the first.
- **11:12Z: lead 2b1e8f10** — sky 7416a7cd merged (grain gone), but its cumulus
  lost their relief (smooth marshmallows) and the march costs +50%: sky told to
  bring the modelling back (reference: its `opposite` at 54b3c2c7 minus the
  grain) and the cost down.

## Progress and steering, 2026-11-13 11:14Z–11:27Z

- **State at 11:15Z — lead 34484955** holds sand f0ff9882 (gold pass, wet
  foreshore mirrors the sky, 23.43 m waking spot), core 3a72bbfc
  (`daylightFilm`: the room's curve up to 1, a slower tail past it; the sun's
  white area about halved — further means lower exposure or a dimmer 5–20° ring,
  both the operator's), shell 1114f295, sky 7416a7cd. Typecheck, 73 shaders,
  type-overlap green; **no frame shot by the lead since 315051b5**. Board v70
  (sand's frames 19–20; next free [6668, 3250], [7128, 3250]; core sends its
  film pair itself). Sand is parked until the operator speaks on the tone.
  **Unmerged**: walk, pill, core's quarter-turn (its main job now). `brief.md`
  is at 397 lines — the next move out of this file goes to a new `journal.md`
  beside it.
- **11:14Z, the frame is approved for its overall feeling**: the operator, on
  sand's `1113-sky-approved-eye.webp` (gold sand under the real sky, board frame
  20): «АААА дайте две!», then «по оттенкам песка можешь экспериментировать если
  хочешь, я говорю про общее ощущение». That frame — sky as of 54b3c2c7 included
  — is the reference for the outside toward the sun; the sand's tone is NOT
  locked, it is sand's judgment (no further pass planned). Sky told not to
  change what that eye shows.
- **11:15Z, a splash screen** (the operator, on the same frame: «это должно быть
  splash screen-ом»), then «нене, это я про будущее. просто вынести на доску».
  **Nothing is built**: the lead's task to walk is withdrawn; board adds a
  sticky by frame 20. For when it is built: the eye is `-15.203, 2.10, 15.203`,
  yaw −45, pitch 4, and the first rule points to a live render rather than a
  shipped picture.
- **11:17Z: lead 2a21b2d1** — shell 3bc2319c merged ("final", but the oil film
  is still at `shell-material.ts:155–156` and `bodyShadow` still exported: both
  re-sent; archive shell only after that merge). **Pill, the operator's
  corrections**: "the room's door is the doorway" is withdrawn — the reception's
  list simply has no door (keep it so when main merges in); the clear zone
  stays, and after the turn only the noticeboard needs it; the doorway stays
  off-centre ("centre is definitely not pretty"). Pill d1d449af, waiting on
  core's seam.
- **11:27Z — lead eafe03e3** (sand's README with the splash frame's re-shoot
  data: eye y 2.0962, clock `PLAY_INSTANT` 2026-11-01T12:00Z, pinned by the
  script page; **every frame is recorded with eye, clock, commit** —
  `briefs/notice.md`). Decor, by the operator's ruling (~11:27Z, over the
  lead's): two general rules only — nothing in front of `ROOM_DOORWAY` on floor
  1, and nothing hung shares plan footprint with a standing thing; a hung thing
  with no place vanishes ("better than a carpet behind a cupboard"); NO special
  rule for the noticeboard ("we'll live with that" — it lands on the east wall
  by the SE corner, the clock near the hole). Pill reports the per-floor count
  of what vanishes. Board v77 holds core's film pair (21–23); next free slot
  [7128, 3700]. The pill's black half has no highlight on floors 2, 5, 7 — the
  'plastic' glint in the room's renderer goes to shell, after the pink underside
  and deleting `bodyShadow`. Core's seam is out (`ROOM_DOORWAY`, core 2f4ab3ba,
  unmerged, not yet reported to the lead).

## The plan's state blocks at 11:45Z and 12:10Z, moved here verbatim at the park

- **State at 11:45Z — lead de2ea63a** holds: shell c49ee5ed (pink underside
  fixed — film a faint cool sheen, none underneath; `bodyShadow` deleted),
  core's quarter-turn dda6d590 **as wip** (`INTERIOR_TURN` in
  `shared/outside/turn.ts`, `interior-turn.test.ts` asserts exactly one of four
  turns keeps the beam off the hole's quarter; `entering`/`room-doorway` right;
  `doorway-out` shows the noticeboard across the opening until pill's clear zone
  lands; core still owes `entering` at indoors 0/0.5 and one outside eye
  pixel-identical), sound 1165e5ec9 (the sill cuts sea, wind and hum to silence;
  the boom the operator tried is removed), sky 89c6dae3 (relief back, cost back;
  undersides and two "mushrooms" next). Gates green at each merge; **the lead
  has shot no frame since 315051b5**. **Unmerged**: pill 107f9524+ (two decor
  rules built; then the clock, by the operator's ruling at ~11:50Z: the hour
  hand follows the minute hand everywhere, one rolled time per clock — and floor
  1's time is NOT derived from the sun, it stays rolled: «вредит трушности…
  лучше приму часы которые показывают неправильное время», and «найдём в этом
  философию»), walk df3ea135+ (turned interior, waking at `WAKE_AT`, no legs out
  of doors by the operator's word; strips re-shooting), sea 33ad5cd2+ (finer
  lace, shore cusps, `shelterAt` — merge when it says its frames confirm). Sand:
  tracing a ~12 px staircase at the wet sand's mirror edge in the cube's shadow
  (the operator pointed at it). Shell owes the glint on indoor 'plastic' and
  re-reading `RECEPTION_SHRUBS` once pill lands. **Messaging**: a message
  reaches a session only when its turn ends (priority "next" tested, does not
  join a turn) — every package now runs shoots in the background and ends its
  turn; `briefs/notice.md`. Board v78.
- **State at 12:10Z — lead e6cb063b** holds everything reported green: pill
  0b1b21bb (clear strip at the doorway, hung keeps off standing, one rolled time
  per clock), sound 423f1231 (final; the operator: «теперь идеально»), sand
  4d5cb8b5 (wetness asked per pixel — the staircase is gone), shell 29c61d18
  (plastic polished, mirrors the ceiling panels), sky a6c022d8 (the cloud's body
  is 54b3c2c7's again by the operator's direct word: uneven top, no dome, no
  uneven base), core 001b3c9b (the turn finished; `seenOutside` builds the
  outdoor view from the world pose, so turn 0 vs 1 differ in 0 pixels;
  `frame.body` unpacked; `outside:cube` writes `<name>.shot.json`). Gates green,
  405 tests round core's change. **Archived**: sound, sky. **The operator's
  answers at ~11:52Z**: the cube's specks stay; the body's shadow does not come
  back; "cubed away" is the title whose sound he likes (no decision); the lens
  toward the sun «не знаю» — the lead ruled the sky stays as it is (sky's trial
  milked the whole sky; no painted hole), closed. **The lead's eyes at
  49186bc5** (`frames/lead/1113-1200-*`, README): `wake-cube`, `wake-sea`,
  `under`, `ladder-foot`, `room-doorway` all read; `doorway-out` shows the
  island (through the room's lens it is washed out — re-shooting at
  `--indoors 0`). **Open, with owners**: sand — thin dark arcs by the waking
  spot read as pen strokes; sea — blue dots on the shallows in the cube's
  shadow, a flat white bar with a dithered end at the horizon, and 501fa487
  (cusps, lace) unjudged; shell + pill — the bench in floor 1's beam casts no
  shadow: ruled (b), the beam reads the decor's own boxes from pill's placement
  (≤ N, no authored box, a test on the planted seed); pill — rename its `turnOf`
  (`vova/no-export-namesake` is red on the lead), then floors 10/27 frames,
  grip, act sheet, /dry, /tend-prose; walk 93be80f2 — code done (waking, turned
  interior, no badge out of doors), strips shooting, merge on a coarse strip
  that reads right; core — second step of the body's removal once walk drops
  `Standing`, then /dry and /tend-prose. Board v84+ (the lead's five frames
  sent).
