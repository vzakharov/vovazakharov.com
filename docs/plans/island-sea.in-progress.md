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
- **The swell's run is `dot(world position, axis)`**: per tile a float64
  `tau0 = −dot(centre, axis)·pace mod 3600` as an object uniform, the local
  remainder in float32. Every swell sum is periodic in the hour, so the mod is
  exact.
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
- **Sky** — `island/sea-sky`: analytic sky, sun, aerial haze. Session: see below
  once started.
- **Extraction** — `island/sea-kit`: the `sea` app and the kit's move. Session:
  see below once started.

## Built / in flight / left

- In flight: the `wgslFn` spike; both children.
- Left: sea material; swash and wet sand on land; beach profile; sand grain near
  the eye; vertex swell; glint from orbit (optional); blue flashes; bite 3's
  leftovers where touched; preview; frames to the board by memo; `/polish`,
  `/pr`.

## DRY notes

- The swell, level, wetness and cusp formulas have one WGSL source and one TS
  twin, in `sea`; the cube and the island both read them.
- The island's sea composition (ripples, lighting) is its own: the cube's is
  bound to its FFT maps and frame uniform, and sharing it would drag both in.
- Sky and haze are one module the sea's reflection, the background and the
  land's haze all call.
