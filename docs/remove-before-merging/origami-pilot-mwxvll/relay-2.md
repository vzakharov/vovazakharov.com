# Relay 2 — origami pilot → infrastructure task

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

This session started from `/relay take claude/origami-pilot-mwxvll` (relay-1.md
holds everything before it). Its Next step was: run the pilot in `tmp/` — a
renderer worth looking at, then design an origami model nobody has done.

**Agent (pilot, before any operator message):** Set the estimate, inspected
Rabbit Ear and found it folds only all layers at once (plus reverse/squash
helpers), so wrote its own layered engine and a three.js renderer in
`tmp/origami/`, then sketched a "basilisk" model.

**Operator 1 (mid-turn):** «будущий сайт представляю так: 3д-моделька, можно
вращать как угодно, каждый шаг анимированно складывает и показывает что делать.
то есть в перспективе можно делать и обычные типа кораблика или журавлика,
только с удобными эксплейнерами»

**Agent:** Acknowledged: a step stores line, moving flap and angle, so an
animated frame is the same rotation from 0° to 180°; crane and boat fit the same
format. Kept going.

**Operator 2 (mid-turn):** «подагентом посмотри есть ли уже сайты с таким же
uvp»

**Agent:** Ran a research subagent. Its findings (reported in the last reply
before Operator 3): no one publishes new AI-invented models as rotatable 3D
step-animated explainers. Nearest on format: Papirko (iOS, since 2026-06,
classics only) and ppconde's Fold (three.js web, github.com/ppconde/fold). Nearest
on "AI invents": DeepMind COrigami (arXiv 2606.26299, NeurIPS 2026) — crease
patterns, not fold sequences; Learn2Fold (arXiv 2603.29585). Turning a crease
pattern into a human-followable sequence is the open problem. Classics alone are
a crowded niche.

**Agent (end of pilot turn):** Reported: engine + renderer work; first sketch is
a green serpent with a gold head, reads more like a swan; flat relief, no 3D
pose; missing crimp, squash, petal folds. Rabbit Ear not used any more, so the
GPL question is moot (the subagent claimed MIT, file headers of 0.9.41 say
GPLv3). Committed the pilot to the branch (6d12562f). Context-budget warning
noted. Asked: taste direction (cobra / rooster-basilisk / other), next engine
priority (3D pose + animated player vs. crimp/squash/petal), site voice.

**Operator 3:** «шикарно. но, кажется, из обычной бумаги так не сложишь, она не
настолко идеальная :)»

**Agent:** Agreed, with numbers from the engine: the neck reverse fold goes
through 16 layers and 30 lie at its base, because each narrowing doubles the
stack; ~3 mm of paper on a 15 cm sheet; the 5.6° needle amplifies a 1 mm error.
The engine models zero thickness and perfect accuracy, so it cannot see this.
Proposed: (1) teach the engine physics — per step report layers folded,
thickness vs flap width, warn past a budget (~8 layers per reverse fold for
ordinary paper); (2) redesign within that budget (drop the third narrowing,
thin only the tail). Big thin paper (tissue-foil 35 cm) kept only as a fallback,
since the site is about ordinary paper. Suggested a fresh session. (verbatim
in Last agent turn)

**Operator 4:** «да, давай. наверное уже можно как таску. пусть пока будет на
"подготовить инфраструктуру", чтобы не думать заранее о второстепенных вещах
типа сайта и голоса»

The relay turn answers this message.

## 3. Intent

An origami project: the agent invents original models by folding in code and
judging renders, later published as interactive 3D explainers (rotate freely,
each step animated), classics possibly too. **Now: "подготовить
инфраструктуру"** — the tooling, not the site and not the voice, which the
operator explicitly deferred as secondary. Designs must be foldable from
ordinary paper.

## 4. Decisions

- **Own engine over Rabbit Ear.** Rabbit Ear's sequential folds go through all
  layers along a line; real models need "fold this flap" and reverse folds.
  Engine model: paper = convex pieces, each with its paper polygon, a 2D affine
  flat placement, a global stacking key `z`, and a 4×4 shaping matrix for non-
  flat (3D) folds. A fold: line, moving-side point, selection (`"all"`,
  `"flap"` = pieces under the moving point, `{at, top|bottom|all|layers}`,
  `{tag}`), `dir` valley/mountain/inside/outside, optional `angle` (≠180 = 3D
  shaping), `tag`. Closure over paper adjacency (edges not on the fold line),
  splitting pieces it crosses. Valley/mountain: flap order reverses, lands
  above/below everything. Reverse folds: halves told apart by a tag set at the
  fold-in-half (`lower: "L"`), each half's moving part restacked onto its own
  stationary part, inside or outside. Crease pattern M/V derived from the flat
  state.
- **Renderer:** three.js 0.170 page served by a tiny Node static server,
  Playwright Chromium with SwiftShader flags; ACES tone mapping, key + fill +
  hemisphere lights, PCF soft shadows on a shadow-catcher ground, canvas paper
  fibre texture, two materials (FrontSide/BackSide) for paper colours, layer
  nudge = local stack depth × eps along z before shaping.
- **Rabbit Ear GPL question:** moot while the engine is ours.
- **Physics first** (operator 3–4): next work makes infeasibility visible
  before more design.
- **Terms:** "basilisk" — working title of the first sketch (crowned serpent
  from a square: kite, two more narrowings, fold in half, inside-reverse neck,
  outside-reverse head showing the gold side, two-fold tail).

## 5. Errors and dead ends

- An infinite fold line with `select: "all"` sliced the body and tail when
  folding the head; fixed by flap selection (pieces under the moving point,
  closed over paper connectivity).
- A sign error sent the neck down at first (line angle measured toward −h).
- Suspected camera degeneracy at el=90 (it was not the cause; a guard was added
  anyway: `camera.up = (0,0,-1)` above 89°).
- Playwright is preinstalled at `/opt/node-tools/node_modules/playwright`; ESM
  `import "playwright"` fails, `createRequire` on that path works.
- The draft is not foldable from ordinary paper: 16 layers in the neck reverse
  fold, 30 at its base, three narrowings (5.6° half-angle).

## 6. State

- Branch `claude/origami-pilot-mwxvll`, no PR, no plan file, no CI, no
  subscription, no scheduled check-in. Last pushed commit: the one carrying
  this file (pilot commit 6d12562f before it).
- Pilot code + renders committed at
  `docs/remove-before-merging/origami-pilot-mwxvll/pilot/` (a copy of the
  gitignored `tmp/origami/`, which the successor's container lacks).
- Estimate for this session revised to the work done: 3 h senior developer
  (engine + renderer), 1.5 h senior designer (first sketch), 0.5 h middle
  analyst (competitor scan). The infrastructure task is the successor's to
  estimate.

## 7. Pointers

- `docs/remove-before-merging/origami-pilot-mwxvll/pilot/engine.mjs` — the
  engine (`fold`, `where`, `layers`, `creasePattern`, `snapshot`, `run`).
- `.../pilot/render.html` — three.js scene; `window.show({model, view, colors})`.
- `.../pilot/shoot.mjs` — `node shoot.mjs <model> [--views "az,el;..."]
[--seq] [--out dir]`; writes PNGs, `model.json`, `cp.svg`. Expects to run
  from a directory with `node_modules/three` (`npm i three@0.170.0`) and
  `models/`.
- `.../pilot/inspect.mjs` — prints pieces in axis coordinates.
- `.../pilot/models/basilisk.mjs` — the sketch; parameters via env (`NECK`,
  `HEAD`, `TAIL1`, `TAIL2`, `HEADDIR`, `THIRD=0` drops the third narrowing).
- `.../pilot/renders/` — `steps.png` (11-step sheet), `three-quarter.png`,
  `side.png`, `crease-pattern.svg`.
- `relay-1.md` beside this file — the tool survey and GPL discussion.
- This session's transcript: https://claude.ai/code/session_01DaohkBFEUGePGjut8uJ9Lc
  (predecessor: https://claude.ai/code/session_01DaohkDn9dzDmyDgMr7F1BY).

## 8. Next step

task подготовить инфраструктуру для оригами-проекта: движок складывания и рендер
из пилота (docs/remove-before-merging/origami-pilot-mwxvll/pilot/) перенести в
репозиторий как настоящий инструмент и научить его физике бумаги — толщина
слоёв, сколько слоёв сгибает каждый шаг, предупреждения о несложимом для обычной
бумаги. Сайт и голос пока не трогать — «чтобы не думать заранее о второстепенных
вещах типа сайта и голоса».

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Да, ты прав. Я пересчитал по движку, и дело не в «неидеальности» бумаги вообще, а в конкретном месте: **шея складывается обратной складкой сразу через 16 слоёв, а у её основания лежат 30 слоёв.** Всё из-за третьего сужения. Каждое сужение удваивает стопку (2 → 4 → 8 → 16), а сложение пополам и шея добавляют ещё.

Как это выглядит на настоящем листе 15×15 см:

- **Толщина.** 30 слоёв обычной бумаги ≈ 3 мм. В основании шеи полоска шириной в пару сантиметров должна загнуться внутрь самой себя через 1,5 мм бумаги. Она порвётся или просто не ляжет.
- **Точность.** Третье сужение делает остриё под углом около 5,6°. Ошибка в миллиметр на первом сгибе там превращается в кривой хвост, и пальцами её уже не исправить.
- **Мой движок этого не видит.** У него бумага нулевой толщины и сгибы идеальные. Поэтому он счастлив там, где руки сдались бы.

Чинить лучше в два слоя:

1. **Научить движок физике.** Пусть каждый шаг сообщает, сколько слоёв он сгибает, во что это складывается по толщине против ширины клапана, и предупреждает за пределом. Для обычной бумаги это примерно 8 слоёв на обратную складку. Тогда я буду ловить такое сам, ещё на стадии эскиза, а не ты по картинке.
2. **Переделать саму модель под этот бюджет.** Например, убрать третье сужение: тогда в шее будет 8 слоёв, а не 16. Тонкость хвоста добирать сужением только хвостовой части, без удвоения у шеи.

Есть ещё путь, которым ходят мастера, — крупный тонкий лист (тишью-фольга, 35 см). Но сайт про то, что можно сложить из обычной бумаги, так что этот путь я бы держал только как запасной.

Если согласен, начну с физики в движке: без неё следующий эскиз опять выйдет красивым и несложимым. Делать это лучше в свежей сессии: эта уже тяжёлая, а работа новая.
```
