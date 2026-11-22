# /island: making the world beautiful

A `/carte-blanche` run. This file is the lead's memory: written for the lead and
whoever wakes after a compaction, never shown for approval. The lead's branch is
`claude/island-beauty-c1rj3b`, cut from `main` at `c035f7ae`.

## The operator's standing rules, verbatim

The first message, 2026-11-22:

> давай украсим наш мир. На этот подход хочется:
>
> 1- более реалистичной отрисовки ландшафта -- сейчас на отдалении отчётливо
> видны паттерны
>
> 2- отрисовки разных видов ландшафта по-разному, а не просто разные текстуры
> поверх одних и тех же вокселей
>
> 3- улучшения онтологии облаков -- сейчас, особенно сверху, видно что это
> просто много-много кусочков ваты, на реальные облачные структуры это непохоже.
> Надо изучить физику формирования облаков, может посмотреть спутниковые снимки
> и т.п.
>
> если останется возможность, хочется посмотреть где можно оптимизировать
> отрисовку без потери качества (может сделать как в кубе при просыпании
> генерацию 1/16 поля за кадр, но не так чтобы это выглядело "пьяно"). это
> должно висеть на переключателе, чтобы не потерять то что есть (то есть там где
> у нас сейчас "совсем убого" vs "полная отрисовка" должен быть промежуточный
> шаг, полная но с оптимизацией)
>
> послеживай за недельным лимитом, ставь на превью каждый раз когда есть что-то
> интересное посмотреть, чтобы не остаться посреди всего с кончившимся лимитом.
>
> работу с доской отдай подсессии попроще, пусть принимает промежуточные
> достижения (и фейлы) и не забывает снимать для таймлапса.
>
> ну и вообще, оптимизируй, смотри где подагентам не нужен обязательно fable.

Standing from earlier runs (`.claude/skills/carte-blanche/SKILL.md` § "What
stands without being said"): never merge to `main`; no outside services; a
remark is not an order; MASD, the linters and the 400-line cap hold; the preview
always shows something worth looking at.

From his voice entry: sessions no longer needed are archived unasked and named
in the report; no relay — autocompact folds the session; parking is allowed.

## The one batch of questions

Asked in the first reply. Each carries the answer acted on until he says
otherwise; his answers get quoted under each when they come.

1. How much weekly limit is left? — Acting on: little.
   - His answer, 2026-11-22 ~10:00 UTC: «я думаю ты можешь найти, но вот», with
     a screenshot: 5-hour limit 3%, weekly all models 45%, weekly Fable 1%, the
     weekly ones resetting Monday 05:00 (tomorrow morning).
   - So: more than half the week is left for under a day. Builders run on Fable
     where the work is the look itself; the board and readers stay on Sonnet,
     fix-ups and the optimised look on Opus, on his standing word to look for
     where Fable is not needed.
2. Earth's landscape kinds from real geography or from a derived climate?
   - His answer: «этого пока не надо, нужно выбрать один какй-то тип и хорошо
     его отрисовать».
   - So: no climate model, no set of kinds. One kind of landscape, chosen by the
     lead and drawn well — in its own shape and its own surface — while the rest
     of the land stays what it is. The lead's choice is below.
3. Trees as objects this run? — His answer: «не надо».
4. B cycles three looks, plain → full with optimisation → full, and the page
   opens plain? — His answer: «да».
5. Which hardware judges speed? — His answer: «macbook m2pro».

## Steering, in the order it came

- 2026-11-22, after the answers: «хотя знаешь, давай замахнёмся на деревья
  тоже». Trees as objects are in; a fourth builder takes them.
- 2026-11-22, on the lead's reading of answer 2 as "one kind, a mountain range":
  «я не это имел в виду. я имел в виду, хорошо отрисовать то что у нас уже есть:
  песок, зелёное, корчиневое, горы -- выбрав один вариант климата для каждого».
  So: all four bands the land already has, each drawn well, each with one
  climate picked for it; no climate model. The relief and ground children were
  re-briefed by message the same turn.

- 2026-11-22 ~10:02 UTC: «меня не будет совсем, принимай креативные решения
  сам». No verdicts will come during the run; every look call is the lead's,
  made from frames and written here.

- 2026-11-22 ~15:45 UTC, after the 5-hour limit cut the whole team off at 11:48
  and he woke every session with «Продолжай»: «Ещё одну вещь которую забыл
  написать в самом начале: супер-ровные, как под линейку, линии берега. Они
  должны искривляться и фракталиться (но детерминированно, через rolled) по мере
  приближения». So: the coastline gains detail as the eye nears it, every scale
  of it a pure function of the world's roll and the place, never of the tile or
  the frame. A sixth package, the coast's.
- 2026-11-22 ~15:50 UTC: «На всякий случай уточню: вся случайность же через
  rolled делается?» — see "Every random thing is keyed by the world's roll"
  under the design decisions.
- 2026-11-22 ~15:55 UTC: «А на телефоне высокое качество как-то включить можно?»
  Today it cannot: the look changes on the B key alone and a touch screen has no
  key. The speed member, who is rebuilding that switch into three positions,
  adds a control a finger reaches.
- 2026-11-22 ~17:35 UTC, with a WebGPU screenshot of the open sea toward a low
  sun, look Fine: «just in case, вода до сих пор муарно-паттерновая (not
  complaining; прогресс по всем фронтам очевиден)». A remark, and the same
  defect as item 1 on another surface: the sun's glitter path shows a woven
  lattice. Cause, read from `lib/sea-wgsl.ts`: the wind sea is a sum of plane
  waves from one table, each coherent for ever, so their beats draw a regular
  grid. A seventh package, the sea's, on Opus.

## What is there today (read 2026-11-22)

- **Relief** — `src/island/entities/terrain/height/model/relief.ts`: a plateau
  by distance from the coast plus 17 octaves of value noise, 400 km to 6 m, the
  same recipe everywhere on every world. `height-sphere.ts` draws the noise in
  space with each octave's lattice turned about the cube diagonal.
- **Colour** — `pages/island/lib/land-colour.ts`: stops by height alone (sand,
  green, brown, grey, white), blended per fragment in `ui/ground-lighting.ts`;
  the fine look adds bare rock on steep ground and a noise relief on the
  normals.
- **Tiles** — a worker fills `TileMesh` (`entities/terrain/tile`): positions,
  normals and one `height` float per vertex, the only thing the land shader
  knows about a place besides its normal.
- **Clouds** — `pages/island/ui/cloud-nodes.ts` and `lib/clouds.ts`: one value
  noise field (two weather octaves, two "front" octaves, three cell octaves 9
  km–1.6 km) in one layer 1.5–3.5 km, five samples a ray, lit by height in the
  layer alone.
- **Looks** — `ui/scene-look.ts`: plain (default) and fine, toggled by B
  (`ui/fine-key.ts`); `ground-lighting.ts`'s `dress(fine, rippled)` swaps the
  material nodes.

## Design decisions

- **The run lives on a branch cut from `main`, not on `island/stretch-3`.** That
  branch's island code equals `main`'s; what it adds is the paused mammoth plan
  and its frames, which this run does not continue. Beat: merging it in for the
  board's history — it would put 500 files of another run's working directory
  into this PR's diff.
- **The four kinds are the four bands the land already has — sand, green, brown,
  mountains — and each gets one climate, chosen so the four read as one place**:
  a temperate mountain coast. Sand is an ocean beach with a belt of dunes behind
  it. Green is lowland meadow and mixed forest on rolling hills cut by stream
  valleys. Brown is subalpine upland: tussock and heath over stony soil,
  outcrops, the last conifers thinning out. Mountains are alpine: bare rock with
  its bedding, scree, snow. Beat: giving each band the climate that flatters it
  alone (a tropical beach under a taiga) — bands that share no climate would
  read as a quilt.
- **Each kind has its own shape as well as its own surface**: the relief recipe
  turns with the band, in the worker and in the eye's `groundAt` alike, because
  the ask is "not different textures over the same voxels". A band is told by
  the broad height the ground already has, blended, never a line.
- **No climate model, no latitude in the look.** One climate everywhere is his
  call; Earth's tropics keep snow on high ground until he asks otherwise.
- **Trees are objects** near the eye and shading far from it, and the two must
  agree on where forest is. So forest cover is one function, evaluated once: the
  tile worker writes it per vertex as `cover` (0 bare to 1 closed canopy), the
  tree placer reads the same function, and the ground shader reads the
  attribute. Beat: a noise written twice, in TS for the placer and in TSL for
  the shader — two copies that drift.
- **Trees draw in the full looks only.** The plain look is what a weak machine
  flies; it takes the canopy's tint from `cover` and no instances.
- **The speed target is the operator's M2 Pro at 60 fps** (the earlier island
  record: the fine look runs there at 7–14). The full look may cost up to half
  again what it costs today; anything dearer waits for the optimised look.
- **Each child is one package on its own branch and reports to the lead; the
  board has a keeper of its own** (the operator: «работу с доской отдай
  подсессии попроще»). `docs/plans/island-beauty/brief-common.md` holds what
  every brief shares.
- **Clouds are built from a written catalogue of regimes**
  (`docs/plans/island-beauty/clouds-research.md`, a Sonnet reader's digest of
  the physics and of what satellites show), not from tuning the one field.

- **Sand is told by a mask, not by height.** The dunes stand up to 22 m on
  ground that rises to 90 m, so the sand stop at 20 m paints them green and
  their lee faces rock. Relief exports a pure `sandAtSphere` (0–1, the beach and
  the belt), the trees child writes it per vertex as `sand` beside `cover`, the
  ground child colours by it. Beat: holding the ground under the belt below 20 m
  — a dead-level strip whose crests still cross the stop; and a height rule in
  the shader — sand scars on steep lowland hills far from any sea.
- **A tile's height bracket comes from heights already known, not from a global
  slope bound.** The rougher relief took `SPHERE_GROUND_SLOPE` from 12.5 to
  ~750, so every tile wider than 7 m is culled against a 10.5 km column. The
  speed child cures it in the quadtree. Beat: tightening the bound's arithmetic
  — relief measured it would still land near 100–200.
- **The coast bends by perturbing the coast distance itself**,
  `d′ = d + Σ aᵢnᵢ`, seeded value noise from ~20 km (the field's cell, where the
  line is straight today) down to metres, band-limited by the tile's `finest`
  and faded out with |d|. Every reader of the distance — height, sand, splits,
  trees — then agrees on one line. Beat: bending the drawn shoreline in the
  shader (the beach, the dunes and the walker's ground would still follow the
  straight one); a finer coast field (20 km → 1 km is 400× the memory and still
  straight under 1 km).
- **Every random thing is keyed by the world's roll** — the operator, 15:50 UTC:
  «вся случайность же через rolled делается?». True of the world's shape, the
  relief, the forest and each tree. Not true of the shader's `latticeValue`
  (ground texture, clouds, cyclones): it hashes the place alone, so every world
  has the same texture and weather. The lead folds the two copies into one home
  that adds a per-world offset uniform rolled from the world.

## The team

Every child was cut from the lead's branch and pushes to its own; none opens a
PR. Session ids are claude.ai remote sessions.

- **Lead** — `session_01DaohkBiucpraEhsFyZ58M9`, Fable,
  `claude/island-beauty-c1rj3b`. The plan, the seams, integration, the preview,
  the one PR.
- **Relief** — `session_01DaohkDs92YhSSpimFpJwfJ`, Fable,
  `claude/island-beauty-relief`, FINISHED at 38456e5d and archived; all of it is
  merged. Its hand-over is `notes/relief.md`; a fix-up there goes to an Opus
  child. Left unfixed by it: some straight alpine crests (the value noise's
  lattice), valleys that do not join into one drainage, faint creases in green
  ground.
- **Ground** — `session_01DaohkDMLPfW237JGnaUuWd`, Fable,
  `claude/island-beauty-ground`. `ui/ground-lighting.ts`, `lib/land-colour.ts`,
  `lib/ground-wgsl.ts`: nothing repeating at any distance, then each band's
  surface; reads the trees' `cover`.
- **Clouds** — `session_01DaohkDgngV6hJwJPofVnqB`, Fable,
  `claude/island-beauty-clouds`. `ui/cloud-nodes.ts`, `lib/clouds.ts`: regimes
  from above, then the sky from the ground and inside.
- **Trees** — `session_01DaohkFamqbS2PFoQEC5UKv`, Fable,
  `claude/island-beauty-trees`. The `cover` seam first, then two species as
  instances; owns the tile worker's page side and `ui/tile-view.ts`.
- **Keeper** — `session_01DaohkEpVZaFGj3BXpvEYCv`, Sonnet,
  `claude/island-beauty-board`. The island board's `beauty` zone and the
  `island-timelapse` release; takes frames from everyone.
- **Speed** — `session_01DaohkCd79gE98JUq5Svi61`, Opus,
  `claude/island-beauty-speed`. Step 1 the tile bracket (below), step 2 B's
  three positions with the middle one drawing as full, step 3 the optimisation
  behind the middle look — clouds at low resolution over several frames — which
  waits for the lead's word that the clouds' step 1 is merged.
- **Coast** — `session_01DaohkB8k3wxxLHdRRwsBDQ`, Opus,
  `claude/island-beauty-coast`, started 15:45 UTC. The perturbed coast distance
  under `entities/terrain/height/model/`, its bounds, and one-line call-site
  changes in the readers; reports after its step 1 so the seam merges early.
- **Sea** — `session_01DaohkBNMrEzd6kyEhPXjND`, Opus,
  `claude/island-beauty-sea`, started 17:15 UTC. `lib/sea-wgsl.ts`,
  `lib/ripple-table.ts`, `ui/sea-surface.ts`: wave groups in place of
  everlasting plane waves, judged by a CPU port's glint map and its
  autocorrelation, since the rippled sea draws on WebGPU alone and the shooter
  cannot.

## Built / in flight / left

- Built: the common brief; the clouds research; `pnpm shoot:island` and the
  eleven `0000-before-*` frames (ee989e9e); the trees' `cover` seam (f54e984b1)
  and the board's `beauty` zone, both merged at 62d542e4c.
- The shooter draws on WebGL2: SwiftShader's WebGPU device is lost here at the
  first tile upload whatever the launch flags, so no frame of this run shows the
  rippled sea. Beat: more hours on the software device — the land, trees and
  clouds this run is about all draw on WebGL2.
- What the baseline shows: clouds from orbit are speckle, from 10 km cotton with
  a dither hatch; sand lies in sheets kilometres inland; a band is one flat
  colour; hills are low domes of one character. `lookTo` is clamped, so the sky
  shot looks up only a few degrees — raise it for the play hook if clouds asks.
- Relief's first step (c9d498fe, then 96b2dfe2) is merged and on preview slot 1
  (`preview.vovazakharov.com/island`, built from f513200e): ranges gathered into
  belts, sand at the shore only, lowland floor 65 m, kinds by broad height
  (green under 300 m, brown to 550, alpine 600→1100), peaks to ~3.6 km. Sent
  back: the lowland went dead flat, dunes read as straight stripes, snow from
  orbit shows the value noise's cells (gradient noise if inside 1.5× fill).
- Trees told the new heights and to import `noiseSalt`/`valueNoise3` from the
  terrain barrel; until they do, `pnpm knip` is red on those two exports.
- Relief's steps 2 and 3 (39dba2c5, 964d9e1e) are merged at dc63d9728 and on the
  preview: the lowland rolls (hill country beside vales), the range at 27.25, 77
  has spurs and valley floors, snow from orbit is a spine, dunes are a land
  form. The beauty set has a place per kind (`0002-*`, `0003-*` frames). The
  surface is now the weakest part: snow in blotches by height alone, flat green,
  rock-brown lee faces on dunes.
- Ground's step 1 (1944a92f) and the trees' step 1 (fbbf0dfa) are merged at
  152193d8f; B reaches the trees through `sceneLook`'s `onLook`. From 4.4 km the
  coast is the best frame so far (forest with clearings). From 2,300 km it is a
  regression: forest in rectangular patches along tile edges, because per-vertex
  `cover` changes with tile level, and the range lost its snow.
- The rule that cures it, sent to ground and trees: far from the eye, colour
  contrast comes only from per-fragment functions of place and from height;
  per-vertex `cover` fades toward a per-fragment expectation by ~150 km, and
  `tileCover` is band-limited the way the relief is so a tile and its parent
  never differ by a whole patch.
- In flight: ground on the orbit regression, then canopy tone, then each band's
  surface; trees on the `sand` attribute, cover across levels, then sunset glow,
  wind, undergrowth; clouds still with nothing pushed; speed on the tile bracket
  (`detailReach` is exported for it); the keeper.
- 11:48 UTC: the 5-hour limit cut every session off mid-step. The operator woke
  all of them with «Продолжай» at 15:39, so none was replaced; each read the
  lead's queued messages only then. A reader agent's digest of where each stood:
  speed had step 2 (a `swift` look between plain and fine, `fine-key` →
  `look-key`) uncommitted in its tree; trees committed wind on waking and
  started the `sand` seam; ground was on sand by a sandiness input and took the
  orbit regression next; clouds had six cloud files modified, a shader at ~3×
  the old cost and a survey cut off at 8 of 12 sites; the keeper was carding the
  `0005-*` frames.
- Merged at 01844ccc8: trees' skyward crown normals (8034bf31) and speed's tile
  bracket (897c4b5a). Preview slot 1 serves 2eed543fb — the finished relief,
  ground step 1, trees step 1 — checked against the slot's deployed commit.
- The lead's verdicts on the merged frames (`0005-*`, `0006-*`), sent to ground:
  the alpine range is one white sheet from 300 m (rock on faces over ~40°, a
  ragged snow line, snow under 0.9); the upland's far hills are flat blue-green
  with magenta hollows; the lowland's brown ends in arcs concentric with the eye
  (a tile-level seam); dune backs want straw-green. The forest from 2 m and from
  60 m is the run's best; from 300 m it is blobs on bare brown that end a
  kilometre off.
- Merged since, in order (every merge gated: typecheck, lint:check,
  format:check, `pnpm test`): trees' sand seam, cover across levels, wind
  (rectangles from orbit gone); speed's three looks on B and the touch look
  button (`ui/look-button.tsx`, bottom right, not under `?play`); coast step 1;
  ground's forest by expectation, canopy tone, snow by height and slope, moor,
  scree; trees' undergrowth and far tier; at 19e5bb3ab coast's domain warp
  (e483f6734) and `groundSpread` (79d4dcc53), ground's gentler ripples
  (2afbeccac); at 72d2324dd the clouds' step 1 (cfbfd6173).
- The lattice seam is `ui/lattice-value.ts`: `latticeValue` and `worldCell`
  shift every shader lattice by a roll of the world (`rollLattice(world)` at
  each pool start). Ground and clouds both read it (0599b47e0).
- Coast verdicts: step 1 (additive bends at 3–9% of wavelength) was invisible —
  the lead's own numbers; the warp is the coast that was asked for (frames
  `0012-merge-5-coast-*`). It moved the shooter's dune place under the sea, so
  `DUNES` is 44.024, 10.052 now. Left to coast: metre-scale teeth checked by
  number, notes current, then done and archived.
- `groundSpread` buys no tiles (alpine 3000 m 143 either way): the bound is
  sup-times-sup, 100–700× the measured spread. Tile counts stay worse than
  main's 112 until speed brackets a tile from its own filled heights.
- Verdicts sent 17:05 UTC. Ground: crisp snow edges placed by hollows and lee
  slopes, the rock's dot pattern, orbit forest as even 100 km blobs (read the
  trees' `PATCHES`), dune slip faces as pen strokes from afar, scree in crop
  rings, the shoal's smear; then its swift path. Trees: smooth crown normals,
  the ring where placed trees end, tan trunks, black crown undersides; then the
  swift path (`setShown` takes the look) with triangles per look.
- Clouds' step 1 from orbit is weather (decks, open cells, a front, an ice
  shield) and no longer speckle, but the open cells are crisp crochet lace and a
  front is a white worm; from the ground the member itself calls it blander than
  the baseline (four steps across a grazing ray). `lookTo`'s clamp is the eye's
  own rule (`lookWithin`), so nobody sees cumulus overhead; the horizon is the
  view to get right.
- Preview slot 1 serves 36ffc9038 (checked): everything above but the clouds.
- Speed's step 3 is decided: clouds at quarter resolution with temporal
  reprojection behind swift, cloud shading behind one function so the new shader
  drops in; it also owes a turning sequence as proof nothing swims.
- Left: clouds from the ground and the lace; the verdict queue above; swift
  paths in ground and trees; speed's step 3 and tile bracket; `pnpm knip` red on
  exports members left unused; `/dry`, `/tend-prose`, `/five-percent`, vet, the
  PR.
