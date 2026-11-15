# Island — the sea, and the near ground as the cube draws it

The sea lead's memory, a `/carte-blanche` run on `island/sea`; one PR into
`island/stretch-3`, never `main`. The island lead's plan is
`world-game-zoltan-syama.paused.md`; its standing constraints hold here.

## The operator's standing rules

- «на ближнем приближении должно быть как снаружи куба, при этом как-то всё это
  сделать так чтобы компьютер не сдох всё отрисовывать (на кубе, например,
  нещадно тормозит и пришлось делать "drowsy" -- тут этого не хочется). при этом
  как совмещать воксели three с тем что у нас снаружи куба я тоже без понятия,
  возможно придётся вообще-всё переписывать»
- «the general feel of web-ocean, sea and sky; a sun glint from orbit is
  optional, not required»
- The board is the island lead's: frames and verdicts go by memo
  (`python3 scripts/memo/memo.py post --as member --branch island/sea -`), each
  naming the frame's path under `docs/remove-before-merging/`.
- Preview: `/preview live vova 1|2`, the slot published longest ago.
- Performance on a phone and a laptop is part of the brief.

## The batch of questions (asked 2026-11-15, defaults in force until answered)

1. WebGL2 keeps today's plain sea; the new sea and shore are WebGPU-only.
2. The cube's shore formulas move to a shared app; the cube's picture holds.
3. Within ±15 m of the waterline every world's shore takes the cube's beach
   profile; the coastline stays.
4. Clear sky, sun, horizon haze; no clouds in this bite.
5. One swell heading for the whole planet; lee shores keep 30%.
6. The sea runs on the shared clock, not the day keys.
7. Target 60 fps on an integrated-graphics laptop, 30+ on a mid phone; real
   numbers come from a preview slot (the container renders in software).

Answers, verbatim (2026-11-15):

> 1 если пока легче так, ок. в перспективе наверное вообще стоит убрать. wgslFn
> -- это "wgsl в three"? 2 окей, только не уверен что sea хорошее название 3 на
> твоё усмотрение + экспериментирование 4 не мелочись, давай с облаками 🙂 5
> было бы классно модель ветра, поначалу можно простенькую 6 окей 7 остров в
> кубе даёт ~18 fps без пьяни, ~60 с ней. M2 Pro, на телефон не ориентируйся
>
> и вот что хочется услышать: как ты собираешься делать то что не пляж/пясок:
> возвышенности, горы и пр.

So: the shared app is `nature`, not `sea`; clouds are in; a simple wind model is
in (it turns the ripples, shelters lee shores, drifts the clouds); the target is
60 fps on an M2 Pro without drowsy, the phone no yardstick; WebGL2 may go
altogether later.

## Steering

- «и не забывай пополнять доску интересными находками, достижениями и фейлами!)»
  — finds, wins and fails go to the island lead by memo as they happen, frames
  attached.
- «что ещё важно -- "остров" куба впоследствии хочу сделать прямо частью мира
  какого-то засеянного island (будет ли там что-то кроме этого острова или нет
  -- не знаю), поэтому технологии двух аппов нужно если не унифицировать, то
  идти в этом направлении» — whatever this bite writes new (ripples, the water's
  light, sky, clouds, wind, ground detail) is a pure WGSL function of place,
  clock and parameters in `nature`, with no frame uniform and no binding, so the
  cube can take it as it stands; the island only composes them in TSL.
- On the shared app's name, after `outdoors` was offered: «outdoors навевает
  улицей или чем-то таким … я бы смотрел в принципе в направлении "модель
  мира/планеты" … даже "планета" тут может быть слишком узким, если соберёмся
  делать звёзды»; on `nature`: «во, nature это норм». The app is `nature`.
- «послеживай за лимитами. где-то на 90% надо сворачиваться и ставить на паузу,
  чтобы я мог продолжить с другого акка или вообще в другой раз. в идеале к
  этому времени что-нибудь бы вкусное уже на preview (не обязательно всё,
  конечно)» — at about 90% of the usage limit (he sent 35% of the 5-hour, 62%
  weekly at the time) the run parks: plan current, everything pushed, children
  told to push and stop. The first preview publish comes as early as there is a
  sea worth looking at, before the rest of the list.
- «смотри действиетнльо ли все подсессии нужны на фейбле, иногда можно запустить
  на опусе а контролировать тебе» — a child's model is chosen by its package:
  mechanical moves and wiring run on Opus under the lead's review, the flagship
  only where the picture is being invented.
- What the lead told him of the ground that is not beach: a material by place
  (sand, grass and soil, rock on steep and high ground, snow) from height, slope
  and coast distance; relief below the mesh's 1.2 m cell drawn by light, each
  noise octave fading as it passes under a pixel; no new landforms and no
  vegetation in this bite.

## Design decisions

- **The cube's cost is its machinery, not its shore formulas.** The FFT wave
  field (4 cascades of 256², ~20 compute dispatches a frame), a 650k-triangle
  sea mesh, the cloud march and the sand's per-grain search are what drowsy pays
  for. Swell train, water level, wetness and cusps are scalar closed forms of
  bed height and clock. The island takes those and replaces the machinery.
- **One WGSL source, called from TSL through `wgslFn`**, with the assembled
  pieces as a `code()` include. Beat: rewriting the closed forms in TSL, a third
  copy beside the TS and WGSL twins `swell.test.ts` already holds together.
  Cost: WebGPU only (question 1).
- **The shared formulas live in an app `nature` (parents `scene`, `dice`) that
  `cube` and `island` both extend**; the WGSL kit (`wgsl`, `assemble`, `f32`,
  `hash.wgsl`) drops to `scene/shared/shader`. What needs the cube's analytic
  `islandHeight` (`waterLevel(xz, t)`, `shoreRise`) stays in the cube.
- **Bed height is the tiles' `height` vertex attribute**, already the floor's
  under the sea. No analytic height in a shader, no height texture.
- **The swell's run is `dot(world position, axis)`**, its hour-periodic part
  taken in float64 at the eye and the remainder from `positionWorld`, as the
  ripples' place is. Beat: a per-tile object uniform, which loses the place on a
  coarse tile whose centre is far from the eye.
- **Ripples are an analytic sum of sines in the fragment**, each octave faded to
  roughness as it passes under a pixel. Beat: the FFT (cost) and a baked normal
  map (the cube's "nothing authored" holds here by taste).
- **One forward pass, no render targets, no drowsy.** The sea stays opaque: the
  bed shows through as colour computed from the floor attribute.
- **The globe draws first without writing depth**, so a stand-in pushed 3%
  deeper can never fall behind it: bite 3's blue flashes.
- **The shore's dynamics fade with the pixel's footprint**: past a few hundred
  metres the surf is a still foam line, so nothing aliases from high up.

## The team

- **Lead** (this session): the sea material, the shore on land tiles, wiring,
  integration, the PR.
- **Sky** — `island/sea-sky`, session_01DaohkCJdeeFwaqj45LNp9n: analytic sky,
  sun, aerial haze, clouds; seam
  `SkyNodes { radiance, aerial, background, update }` plus `shade` for cloud
  shadows.
- **Extraction** — `island/sea-kit`, session_01DaohkEEm3LNwEwmSEUQqq4, on Opus:
  the `nature` app and the kit's move to `scene/shared/shader`. Sends "barrels
  exist" first. (Its flagship predecessor, session_01DaohkEJvpB9uSL7xF31AzF, was
  archived after eight minutes of reading, nothing pushed.)

## Built / in flight / left

- Built (00314cbe, frames 01–05, memo sent, preview slot 1): the sea's surface —
  `lib/ripple-table.ts` (64 plane waves, integer vectors over a 256 m period),
  `lib/sea-wgsl.ts` (`windAt`, `ripplesAt`, `seaColour`, a stand-in `seaSky`),
  `ui/sea-surface.ts` (the TSL seam; a fragment's place is the eye modulo the
  period plus `positionWorld`, so no per-tile uniform), `ui/ocean-globe.ts`
  (drawn first, no depth write: the blue flashes' fix, not yet checked in
  flight). `groundLighting().rippleSea()` dresses the Lambert sea materials with
  the surface as emissive once the backend is WebGPU. The selection's `relief`
  bounds a tile by the sea too: deep-water tiles near the eye were culled by
  their floor.
- Built (5d92f863, frames 06–08, preview slot 1 redispatched): the kit's first
  merge (d90aa892: `nature` with swell, shore level, wetness, cusps); the swell
  on the sea. `SWELL_AXIS` and `swellClock(eye, seconds)` in `lib/sea-wgsl.ts`;
  sea vertices rise by `seaVertexLevel` (ashore they ride 1.5 cm over the sand
  and `maskNode = seaLies` cuts the surface to the sheet a fragment at a time);
  the fragment adds the swell's slope and `brokenAt` foam; land's `outputNode`
  darkens by `seaDampTint` (`drySince`/`dampAfter`). Shelter is 1 everywhere.
- Traps met: three's types give `wgslFn` an untyped `Node`, which `colorNode`
  refuses and `emissiveNode`, `maskNode`, `positionNode` and `outputNode` take —
  so a WGSL result goes into one of those slots. `h.step` on the software
  renderer costs ~3 s a call: shoot with `--frames` ≤ 60, never `--t`.
- Built (a9d17034, frames 09–12, preview slot 1 redispatched): the swash's cusps
  (`seaTongue`, `swellAt(eye, seconds)` returning the clock and the eye's place
  along the crests); the kit's final head 0b8a9e5f (child archived); the sky
  child's bd35d5b4 merged and wired — `seaSurface(radiance)` samples the still
  sea's mirror direction and the zenith, the sea's own haze and `seaSky` are
  gone, every material's `outputNode` is the sky's `aerial`, the land's damp
  tint over it. The sky stays TSL (typed), not WGSL in `nature`: the
  cube-convergence steer waits there.
- Built (e21dee97, frames 13–14, preview slot 1 redispatched; `./scripts/vet.sh`
  green on a9d17034): the ground's relief — `lib/ground-wgsl.ts`
  (`groundNormal`, ridges read off the ripples' table, footprint-faded) as the
  land's `normalNode`, and bare rock in TSL where the mesh is steep above the
  beach (`ROCK_COLOUR`, `rock`, `roughness` in `ground-lighting.ts`). Rock has
  not been looked at on a real cliff yet: find one and shoot it.
- If parked here: everything is pushed and no child is alive — the sky child
  (session_01DaohkCJdeeFwaqj45LNp9n) is archived, its last head 3caa40e8 merged
  (frames 21–23: five jittered samples, 1.4–2× the cloudless frame on software).
  Draft PR #288 into `island/stretch-3` is open with its squash proposal;
  `/polish` ran (9d7a0e3a, 8b1a2bac, 8b156a29) and `/five-percent` left two
  optional proposals on the PR: the swell's heading taken from `windAt` at the
  eye (today one fixed axis, so swell and ripples disagree and no shore is in
  the lee), and ripples, `windAt` and `groundNormal` moved into `nature` as
  `.wgsl`. `/dry` left open: one `wrapped(value, period)` for `sea-wgsl.ts`,
  `sea-surface.ts` and `lib/clouds.ts`; the per-wave setup shared by `ripplesAt`
  and `groundNormal`. Left: read `./scripts/vet.sh`'s verdict on the pushed
  head. Then, optional: the far clouds read as slanted strokes on the horizon
  from the beach at 640 px (frame 21 — few samples through a thin slab at a
  grazing ray); the shoreline's polygons; film mirror on wet sand; shelter;
  beach profile; `sea-wgsl`/`ground-wgsl` into `nature`; the wind driving the
  clouds' drift; `pointAt` (cloud-nodes) and `aerial`'s far-end geometry
  (sky-nodes) are the same maths, left apart for float32 at orbit. Unmeasured:
  fps on a real GPU.
- Built (e177eb5b, frames 15–18, preview slot 1 redispatched): rock at
  `smoothstep(0.04, 0.15, steep)` (the island's mountains are gentle; it shows
  as outcrops in the snow); `eyeKeeps` in `lib/sun.ts` dims a sun above the
  opening's 20° on the lights and, by injected constants, in the sea's WGSL —
  noon sand, foam and snow stay under white; the sheet's froth is its 1.2 cm
  tip; the sky child's fe9df61b (black space from mid orbit) merged and checked
  on WebGPU. The sky child now holds its last package: clouds and `shade`.
- Built (frames 19–20, sky-clouds-\*): the sky child's clouds (a033b922) merged
  — `ui/cloud-nodes.ts`, `lib/clouds.ts`; `aerial` carries their shadow and lays
  them in front of every material, `radiance` includes them,
  `shine(heavens, up, height, seconds)`. Checked on WebGPU at 2 m, 6 km and 4000
  km. The two listings and the two `HOUR_SECONDS` below are now one each. The
  child's last round: cut the clouds' cost (2–2.8× on software), jitter the
  edge-on banding, `/dry` + `/tend-prose`, then stop. When it reports: merge,
  shoot, archive it, run `./scripts/vet.sh`, `/polish`, `/pr` into
  `island/stretch-3`.
- Polish notes (done, see above): `lib/nature-listing.ts` (the kit's
  `NATURE_LISTING`) and `sea-wgsl.ts`'s own `assemble([...])` are two listings
  of the same pieces — keep one; `HOUR_SECONDS` lives in both `ripple-table.ts`
  and nature's swell.
- (Stale below: the orbit bug is fixed.) Open with the sky child: blue space and
  a veiled disc from mid orbit (frame 11; the far-orbit opening, frame 12, is
  right); then clouds and `shade`.
- (Superseded below where it names the sky's wiring or the kit as pending.)
- In flight: the extraction child (optics and sand, its final report); the sky
  child.
- Next, in this order: the sky child's `radiance` and `aerial` in place of
  `seaSky` and the flat background; the shoreline's polygons (the sheet's
  outline follows the 1.2 m mesh — soften it with the cusps' `tongue` or noise
  in the reach) and the sand's film mirror (`filmAfter`); shelter from the
  floor's gradient; the beach profile (candidate: land side
  `h + 0.9·tanh(h / 0.08)` — it moves pinned heights); ground detail off the
  beach; move `sea-wgsl` into `nature` as `.wgsl` and dedupe `HOUR_SECONDS`; a
  TS twin of `windAt` for the sky child; `./scripts/vet.sh`, `/polish`, `/pr`.
- Known: the inlet's shoreline is polygonal at 2 m (frame 06); the blue-flash
  fix is unchecked in flight; knip, type-overlap and masd:clusters have not run
  over the new files.

## DRY notes

- The swell, level, wetness and cusp formulas have one WGSL source and one TS
  twin, in `nature`; the cube and the island both read them.
- The island's sea composition (ripples, lighting) is its own: the cube's is
  bound to its FFT maps and frame uniform, and sharing it would drag both in.
- Sky and haze are one module the sea's reflection, the background and the
  land's haze all call.
