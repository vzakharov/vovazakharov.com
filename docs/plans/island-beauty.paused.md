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
- 2026-11-22 ~20:50 UTC, with the usage panel (weekly all-models 45% → 79%,
  weekly Fable 1% → 59%): «Потратили, получатся, 35% недельного лимита -- и весь
  текущий заход надо постараться уложить в оставшиеся 20%. То есть остаток
  рассчитывай примерно на половину от того что уже за сегодня сделали across
  sessions. Нужно закрепить гештальт в каком-то логичном виде, и к концу
  следующей недели к этому вернёмся (на недели тратить лимиты на сайд-проекты
  будет непозволительно)». So: the run winds down to a state that stands by
  itself — see "Closing this approach".
- 2026-11-22 ~20:52 UTC, three screenshots of one dune view over the sea on his
  M2 Pro, preview e3f3f062: «разницы между "fine" и "swift" по качеству
  отрисовки я практически не заметил». The frame times on them: plain 13.4 ms,
  swift 159.4, fine 202.8. Then the same place facing inland — «вид без воды --
  отрисовка намного быстрее»: plain 12.7 ms, swift 68.0, fine 79.1. The lead
  first read this as "swift is hardly faster" and he corrected it at ~21:10: «я
  тут как раз скорее про то что fine не даёт таких сильных улучшений в
  отрисовке, а не про то что swift не даёт улучшений в скорости» — swift's
  saving shows in the milliseconds, «и там и там много», and fine buys only
  «чуть больше "блобов" деревьев, травинок». His idea with it: «мерить fps,
  усредняя по какому-то окну, чтобы адкеватнее сравнивать». The lead's own
  reading, not his: both full looks are far from a frame budget, and a view with
  the sea in it costs 90–125 ms more than one without, which nobody here
  measured because the shooter draws no rippled sea.
- 2026-11-22 ~20:58 UTC, a sunset over the dunes
  (`/island#1@10.28448,-0.47036,31.5,247.5,10.7,1.400`): «не на этот заход, но
  мне кажется закатное солнце ландшафт рисует не так как в жизни, не так красно.
  где-то записать, чтоб не забыть». Lit sand reads saturated vermilion against
  charcoal shade. For the next approach, not this one.
- 2026-11-22 ~21:00 UTC, a screen recording of a climb over the lowland forest
  in swift: «деревья при пролёте над ними растут-уменьшаются как грибы на
  стероидах. ну и на деревья они с такого ракурса не особо похожи. делать их
  фотореалистичными в этом заходе не надо -- но посмотреть почему такие
  "спецэффекты" при движении можно». Sent to trees ahead of its shade: find why
  a crown's drawn size follows the eye, and make a tree's size in the world
  independent of where the eye is.

The baseline the run started from is in the `0000-before-*` frames and in `main`
at the branch point.

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

Every child was cut from the lead's branch and pushed to its own; none opened a
PR. All of them are finished, merged and archived: a successor works from a
member's branch and its note under `notes/`, not from its session.

- **Lead** — `session_01DaohkBiucpraEhsFyZ58M9`, Fable,
  `claude/island-beauty-c1rj3b`. The plan, the seams, integration, the preview,
  the one PR.
- **Relief** — `session_01DaohkDs92YhSSpimFpJwfJ`, Fable,
  `claude/island-beauty-relief`. Left unfixed: some straight alpine crests (the
  value noise's lattice), valleys that do not join into one drainage, faint
  creases in green ground.
- **Ground** — `session_01DaohkDMLPfW237JGnaUuWd`, Fable,
  `claude/island-beauty-ground`: `ui/ground-lighting.ts`, the `land-*` files.
- **Clouds** — `session_01DaohkDgngV6hJwJPofVnqB`, Fable,
  `claude/island-beauty-clouds`: the regimes from above, in `cloud-noise.ts`,
  `cloud-cover.ts`, `cloud-regimes.ts`.
- **Clouds' march** — `session_01DaohkBXfgifZ4H5a5Boh1U`, Opus,
  `claude/island-beauty-clouds-march`: the view from the ground and from low
  flight, in `cloud-march.ts`, `cloud-step.ts`, `cloud-nodes.ts`.
- **Trees** — `session_01DaohkFamqbS2PFoQEC5UKv`, Fable,
  `claude/island-beauty-trees`: the `cover` seam, the species as instances, the
  tile worker's page side.
- **Coast** — `session_01DaohkB8k3wxxLHdRRwsBDQ`, Opus,
  `claude/island-beauty-coast`.
- **Sea** — `session_01DaohkBNMrEzd6kyEhPXjND`, Opus,
  `claude/island-beauty-sea`: `lib/sea-wgsl.ts`, `lib/ripples.ts`,
  `ui/sea-surface.ts`; judged by a CPU twin, since the rippled sea draws on
  WebGPU alone and the shooter cannot.
- **Speed** — `session_01DaohkCd79gE98JUq5Svi61`, Opus,
  `claude/island-beauty-speed`: B's three looks, swift's cloud buffer, the tile
  bracket, `?without=` and Measure.
- **Keeper** — `session_01DaohkEpVZaFGj3BXpvEYCv`, Sonnet,
  `claude/island-beauty-board`: the island board's beauty zones and the
  timelapse; frames from everyone.

## Built / in flight / left

- The shooter draws on WebGL2: SwiftShader's WebGPU device is lost here at the
  first tile upload whatever the launch flags, so no frame of this run shows the
  rippled sea. Beat: more hours on the software device — the land, trees and
  clouds this run is about all draw on WebGL2.
- The finished relief (38456e5d): ranges gathered into belts, sand at the shore
  only, lowland floor 65 m rolling into hill country, kinds by broad height
  (green under 300 m, brown to 550, alpine 600→1100), peaks to ~3.6 km, snow
  from orbit a spine, dunes a land form. The beauty set has a place per kind.
- The rule that cured forest in rectangles from orbit, binding on ground and
  trees: far from the eye, colour contrast comes only from per-fragment
  functions of place and from height; per-vertex `cover` fades toward a
  per-fragment expectation by ~150 km, and `tileCover` is band-limited the way
  the relief is, so a tile and its parent never differ by a whole patch.
- The lattice seam is `ui/lattice-value.ts`: `latticeValue` and `worldCell`
  shift every shader lattice by a roll of the world (`rollLattice(world)` at
  each pool start). Ground and clouds both read it (0599b47e0).
- `lookTo`'s clamp is the eye's own rule (`lookWithin`), so nobody sees cumulus
  overhead; for clouds the horizon is the view to get right.
- The operator will not sit reading counters run after run («увы я не смогу быть
  здесь чтобы давать счётчики каждый раз»), so speed's measurement is one link
  and one click that ends on a table to paste, whenever he next opens it.
- The finished coast: `CoastDistance` carries an optional `calm` (0–1, a 50 km
  seeded roughness field). Calm stretches keep the beach and the dune belt;
  rough ones keep a ~20 m strip of sand and skerries ~80 m across some 600 m
  out. Thirteen bends from 20 km to 4.9 m, the coast moving at most 3.8 km; fill
  costs +56% on rough coast tiles, accepted unless speed's M2 numbers say the
  workers fall behind. `DUNES` is 43.733, 10.266 heading 164, a calm stretch.
- Swift as built: trees draw every tree fine draws with ~40% of the triangles
  (480k against 1,218k from 2 m), through `treeView.drawAs(look)` — the name
  `setLook` collided with `LookSwitch` under `pnpm type-overlap`, and no shared
  base is wanted. Ground reads 9 lattice values per fragment against fine's 12
  and plain's 4.
- New for ground: rock on rough shores — dark wet rock within tens of metres of
  the waterline where `calm` is low, skerries all rock, no tree or dune grass on
  it. The lead built the seam at ground's request: `rockAt` beside `sandAt` in
  the terrain's `shore.ts`, `shoreAtSphere` giving both from one coast read,
  `tileShore` in `forest-cover.ts`, and a per-vertex `rocky` attribute
  (`ROCKY_ATTRIBUTE`) — 1 on a rough stretch's first 20 m and its skerries, gone
  by 90 m inland, 0 on calm stretches.
- Board cards carry no `why`, so a verdict goes in the card's text, in English
  (`check:board-language` rejects Cyrillic).
- The seventh merge's frames (`0014-merge-7-*`, shot at 6974e7256) and the
  verdicts sent on them. Wins: the alpine range from 3 km, the dune belt at
  every height, the coast with skerries. To ground: straight tile edges in the
  lowland's meadow colour from 4–34 km; near moor olive-brown against far hills
  teal with purple hollows; snow in soft round blobs that ignore the relief, a
  dot screen on rock, contour stripes on a grass slope; canopy tone and
  crown-scale mottling beyond the last placed trees. To trees: from 300 m a
  forest reads as a lawn with bushes (far tier's density must not fall with
  distance, hand-over by pixel size); the forest ends at the dunes along a ruler
  line; nothing grows on shore rock (`shoreAt` in `TreeGround`).
- Merged at 2170765ea the sea (9bfee46f): each wave's phase drifts with two slow
  world-keyed noise fields, so the 64 waves no longer beat into a grid; a
  float64 twin (`lib/ripples.ts`) and a regularity test (ACF peak 0.51 before,
  0.14–0.16 after). Unseen on real WebGPU until the operator looks. The Sea
  member's last item is the shoal's cream smear at a beach's waterline.
- Merged at 0185c8196 the clouds' items 1 and 2 (9bfa7a87): cumulus fields are
  heaps on packed points with turned axes (no grid, but bubble wrap of one
  size), open cells have thick uneven walls (still a doily round a blur). Sent
  back: a size spectrum over a decade with lanes and clumps; walls broken into
  beads; texture in the solid mass. Items 3 and 4 (front, decks) next.
- Merged at 2b0fe24c8 speed's swift clouds (6d902a36f): a half-resolution buffer
  marching one pixel of each 2×2 block a frame and reprojecting the rest
  (`ui/swift-clouds.ts`), a sixteenth of fine's marches; a turn differs from
  fine by ~0.08/255. Swift costs 20–40% less than fine on the software raster,
  and plain 2.5× less than swift: what is left is the air, per fragment.
- `InLook` (`@/island/shared/play`) is the one home of a `look: Look` member.
- Merged at ae86aff73 (178 tests): ground through 060e84b07 (forest past its
  trees by expectation, a moor without purple, snow by aspect, shore rock) and
  the sea's shoal (fef69dff3). Its frames (`0018-merge-9-*`): alpine snow crisp
  and placed by hollows and aspect, contour stripes on the grass slope still
  there; the upland without purple; from 34 km the meadow clearings read as
  paint spills with hard outlines and some straight tile edges; the lowland
  forest from 300 m still a lawn with bushes.
- Merged at e6bd01ec1 the clouds' items 3–4 (56c0a436): the front is ragged and
  asymmetric but still a narrow worm; decks are white with a cell mottle.
- Merged at a10bdda4f (179 tests) the trees through bf7cb4eed and the sea
  through efa1be4b2. Trees: the crowns that swelled in flight (steering, 21:00)
  were a tree shrinking toward its foot over the last third of its tier's reach
  and a coarse tier's tree widening up to three times with distance; a tree now
  stands whole until the eye passes a distance of its own, then is gone. Fallen
  logs; the shade under a tree is laid and not drawn. Sea: five cost cuts (no
  shading on sand it discards, the zenith sky and the tiles' mirrored sky once a
  vertex, an unseen wave skips its cosine, swift without the cloud glance or the
  four finest bands) — pixel-identical on WebGL2 and **unmeasured on WebGPU**,
  the first thing to check on the preview. Not done: the ocean globe is still
  rippled under tiles; early-Z needs depth from the vertex stage and a sea mask
  without `discard`.
- Merged at 6f7d29862 (192 tests, knip green) speed's Measure: `?without=`
  leaves a named cost out of swift and fine (`clouds`, `cloud-shadow`, `air`,
  `ripples`, `sea-sky`, `trees`, `tufts`); the HUD (`I`) shows the mean of 60
  frames; `?measure` runs 17 readings by itself and ends on a table to copy. The
  operator's two links are in `notes/speed.md`'s first Report. **The first act
  of the next approach is reading his table.** Also in: swift's smear at 560 m —
  the buffer marched its rays to the planet's far side, and now stops at the sea
  — and the tile bracket (alpine 3000 m: 167 tiles → 86, main 112).
- Merged after it the march (under 12 km a ray finds its first cloud crossing
  before it steps: from the ground the bars are gone and clouds have shapes; ~40
  reads a cloudy ray against 19, a sixteenth of that in swift) and speed's last
  two fixes (swift's comb at the horizon: the buffer is read through a tent).
- **The clouds' last step is reverted on this branch (4c94788b0)**: heaps as
  discs of many sizes in clumps (1bc8d994) and the front's wider tail (c959efc5)
  are better from 820 km, but with them no cloud is drawn from the ground
  (`0019-merge-10-empty-sky-*`; four places of four). The step stays on
  `claude/island-beauty-clouds`; which of its parts empties the sky — the disc
  radii, the lanes between clumps, the far field's mean cover, or the march's
  search missing the new heaps — is not found.

## Closing this approach

Decided 20:55 UTC on the operator's budget: about half of the day's spend is
left, and the run ends as one branch with green gates, the preview on its head,
a draft PR and this plan renamed `.paused.md`. Beat: finishing every list — it
does not fit, and a half-merged team is worth less than a smaller whole.

- **Nobody starts a new item.** Each member finishes what is in its hands,
  leaves its branch green and its note current, reports, and is archived.
- **What budget is left goes to frame time**, on the operator's numbers: speed
  on a measurement he can run alone, sea on the cost of its own surface.
- **Two questions to the operator stand unanswered**: whether a plain
  half-resolution swift may be tried, and whether preview slot 2 (another
  branch's build) may be overwritten for a before/after. Without the second, the
  sea's cuts went into this branch unmeasured.
- **`/five-percent` and a whole-branch `/polish` wait for the approach that
  finishes the work**; children ran `/dry` and `/tend-prose` on their own diffs.
  `./scripts/vet.sh` passed on 0ecae061b, the head preview slot 1 serves; from
  the ground it draws clouds in fine and in swift (coast 560 m, lowland 300 m).

## Left, for the next approach

- Frame time on an M2 Pro, target a swift look near 30 ms, led by his Measure
  table and frames of 23 November (`operator-1123.md` beside the relays): the
  clouds' shadow and the ripples are nearly all of swift; fine shows only near,
  so one look drawing fine near and swift far. The sixteenth of the pixels a
  frame (21:20) is what swift's clouds do; for the whole frame — half resolution
  with a jittered eye, rebuilt by depth — it is the candidate that keeps the
  picture, a plain half-resolution swift waits on his word. Then the air's
  volume, the sea's globe under tiles, trees' triangles (1.2M → ~800k).
- Ground: straight tile edges in the lowland's meadow colour from 4–34 km, the
  rock's dot screen, contour stripes on grass slopes — check each on fresh
  frames first, ground's last commits may have cured some.
- Trees: a forest from 300 m as a lawn with bushes, the ruler edge at the dune
  belt, nothing growing on shore rock (`shoreAt` in `TreeGround`), crowns, the
  shade under a tree (laid, not drawn).
- Clouds: polygonal flakes and even parallel stripes at every height (his
  frames, 23 Nov), clumps at one scale, heaps too round, no streets along the
  wind, a narrow front; from the ground streaks and a featureless grey inside.
- The sunset's vermilion sand (steering, 20:58).
- Relief's leftovers under "The team".
