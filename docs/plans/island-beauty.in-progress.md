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
- **The one kind of landscape is a mountain range.** It reads at every height
  the eye passes through — from orbit as the structure of a continent, at 10 km
  as ridges and valleys, at two metres as a skyline — and it is where "the same
  voxels under another texture" is most plainly false today: rounded noise hills
  painted grey, then white. Beat: a sand sea (dunes read only below ~50 km, and
  Earth's opening beach is nowhere near one) and a forest (without trees as
  objects, which he ruled out, it is shading alone).
- **A range changes the relief itself**, in the worker and in the eye's
  `groundAt` alike, and gets a surface of its own in the shader: the ask is "not
  different textures over the same voxels". Ranges lie in belts a slow field of
  the world's own places; everywhere else the ground keeps today's recipe.
- **No climate contract.** The first draft of this plan had the relief child
  land a `climate` vertex attribute first; the operator's answer to question 2
  removes its reader. What the mountain shader needs — height, slope, and the
  latitude, which a fragment can work out from its own position — is already
  there.
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

## The team

- **Lead** — this session, Fable. Owns the plan, the seams, integration, the
  preview and the one PR.
- Children are listed here by session id, branch and package as they start.

## Built / in flight / left

- In flight: the clouds research (Sonnet agent); a digest of the board, frame
  and preview mechanics (Sonnet agent).
- Left: everything else.
