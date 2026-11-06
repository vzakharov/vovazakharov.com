# Relay 1 — Island, bite 0 paused before the board is built

## 1. Standing constraints

None stated by the operator beyond the repo's own rules.

## 2. The conversation

**Operator (1):**

> Ну что ж, спустя месяц-ish после "Грибов", пора браться за что-то новое и грандиозное?
>
> помнишь карту, которую Сяма с Золтаном рисовали в vzakharov/life? Хочу по её мотивам игру, пока просто исследовалку.
>
> Представь: сначала мы видим весь остров почти из космоса. Кое-где проплывают облака, то есть вид не просто "гугл мапс", а практически реалистичный.
>
> Мы спускаемся вниз -- до какого-то этапа мы необпределённое бестелесное создание, которое может перемещаться (приближаться) очень быстро.
>
> По мере приближения к высоте птичьего полёта (ориентировочно -- при перелёте через слой облаков), мы превращаемся в птицу, паряющую над всем этим. Земля всё ближе, ближе; ландшафт начинает очерчиваться.
>
> Когда уже близко, реки становятся реками, холмы-холмами, деревья-деревьями. Всё красиво. Городов-людей-животных пока нет, это потом. Пока это нетронутый мир, который мы исследуем.
>
> Когда мы приближаемся вплотную к земле, мы начинаем мочь ходить. Сами себя мы всё это время не видим, но наш "вид" можно угадать по способу нашего движения: без колебаний на самом верхнем уровне, с небольшими подъёмами-спусками когда мы "птица" (при этом если мы не машем крыльями, то мы "парим", плавно спускаясь по естественной тракетории); когда шагаем, мы уже шагаем (похоже как в "грибах")
>
> Мир должен генерироваться, естественно, не весь сразу, а по мере приближения. То есть то что видно с определённой высоты -- в момент когда оно видно, а конкретные конфигурации-расстановки деревьев и т.п. -- тогда, когда мы уже ближе.
>
> Чтобы ты не думал, что тебе это не по силам -- вдохновись вот этой небольшой репой: https://github.com/Noniv/web-ocean
>
> Это не значит, что нужно брать решения оттуда, просто -- это возможно, и для технологии, и для тебя. В качестве inspired by -- можно. Дерзай! :)
>
> Строить будем, разумеется, слоном. При этом давай попробуем взять методологию для общения между ветками из vzakharov/sc-hub (см. соответственно memo.py и методику оркестрации /workday) (это inspired by указывать не нужно, так как это мы и есть). Кажется, что запускать членов команды на конкретные куски, смотреть что они делают, потихоньку вливать и раздавать новое, выкладывая статус в качестве майндмэпа-артефакта -- хорошая идея. По ходу дела будем решать, что из этого работает, что нет.

(Attached: a web-ocean screenshot, sunset over the sea — on disk at `tmp/session-images/20261106T170957Z-91664c74.webp`, which dies with the container; see Pointers.)

**Mid-turn operator message:**

> я бы сказал это не просто слон, а мамонт. Мы как-то начинали писать скил вслед нашего опыта с "грибами", но так и не закончили. Но суть в том, что нужно написать большими мазками и сходу не пытаться предусмотреть всё

**Agent:** Routed to `/task` → plan and hand off (a team-eaten elephant is the operator's shape to pick). Cloned `vzakharov/life` and `vzakharov/sc-hub` to `/home/user/life`, `/home/user/sc-hub` (read-only references). Renamed the branch, wrote a broad-strokes plan, opened draft PR #255, posted the squash proposal. Asked: 1 name (`/world` vs kids naming it), 2 real vs ×10-compressed scale, 3 copy `map.jpg` into the repo vs derived masks only. Offered the muthur sync once (3 commits since 3e94db8f6398) — made; never offer again.

**Operator (2):**

> 1 наверное island
> 2 ага, то есть если ты хочешь переместиться далеко, тебе надо взлететь, подняться заоблака, и там ты уже можешь перемещаться чем выше тем быстрее. это тоже нужно будет по ходу продумывать конечно, механики вот всё это, заранее не предугадаешь
> 1 класть-то кладём, но думаю на каком-то этапе мы всё-таки должны это преобразовать в векторную форму, и уже от неё идти. То есть сама игра не должна собираться из произвольного джпега. хотя.... представляешь вариант, где любой ребёнок рисует свою карту, и мы от неё идём. Да, давай так. грубо говоря, на исходной карте считаем белое водой, остальное землёй. Как быть с реками пока не ясно, решим по ходу. А, и берега должны быть, конечно, не идеально ровные, а фракталиться по мере приближения

**Agent:** Folded in: name Island, `src/island/`, `/island`; real scale, far travel by climbing above the clouds; any drawn map is the input (white = water), traced once into a vector coastline the game builds from, the tracer one pure TS module reused later in the browser for "your own map"; coast fractals on approach; rivers open. Refreshed PR title/body and squash proposal.

**Operator (3):**

> я бы не закладывал волны заранее. Давай подойдём так: есть путеводная звезда, и мы как-то к ней идём, по ходу дела понимая, что то что казалось супер сложным на самом деле оказалось простым, и наоборот.
>
> а, и ещё давай добавим в оценку трудозатрат типичные роли в геймдеве; интересно будет, сколько "человек" бы это сделали и каких и за сколько
>
> > реки и климат выводятся из неё и одного seed
>
> о, об этом я даже не думал -- предполагал, что карту нужно будет "запоминать". То есть, получается, у нас единственное число задаёт всю карту вплоть до последнего камушка?
>
> > То, что должно сходиться по всей карте (реки текут к морю, климат), считается при сборке
>
> круто, я об этом даже не думал. Давай пробовать.
>
> > Движок — three.js на WebGPU, где WebGPU нет, он сам переключается на WebGL 2.
>
> насколько часто сейчас не бывает webgpu? чтобы не поддерживать и то и то? или это дело одной переменной на весь код?
>
> > Вспомнил и недописанный скил с «Грибов»: это .claude/skills/megabeast/notes/, всё, что узнаем про работу командой, будем дописывать туда.
>
> давай mammoth. правда мы его назвали golem, когда начинали над ним работать (см. #101, но это для вдохновения, а не черрипика), но тут я подумал, что таки переход elephant -> mammoth более естественный

**Agent:** Plan rewritten to a north star (no waves); added game-dev roles to the ledger's `rates.repo.json` (game-designer, graphics-programmer, gameplay-programmer, technical-artist, environment-artist, producer) and a studio forecast in the plan (~3,100 h, seven people, the busiest five months); rename `megabeast/` → `mammoth/` put into bite 0. Answered: yes, the coastline plus one seed fixes the world to the last pebble (caveat: changing generator code changes the world; only player changes would ever need storing); WebGPU ~70–76% globally per secondary sources (gaps: Firefox on Linux/Android, older Android, old GPUs), and with three.js it is one code path, the cost being no compute shaders. (verbatim in Last agent turn)

**Operator (4):**

> а давай кое-что ещё нестандартное придумаем: вместо плана у нас будет артефакт (но хранимый врепе, чтобы можно было воспроизвести с любого акка) тпиа "бесконечной доски" -- со стикерами, линиями где надо (и без них где не надо), произвольно прикрепляемыми картинками для вдохновения и проверки ит.д. и т.п. -- в неё могут рисовать любые сессии, я могу тоже что-то добавлять, по нему удобно общаться и т.п. Это вместо того артефакта, о котором говорил в начале. (Только я не знаю как решаются гонки и конфликты между сессиями при редактировании одного артефакта)
>
> собственно его нужно создать и сейчас, это будет у нас вместо плана.
>
> и ещё -- кейс-стади по этой игре мы будем писать по ходу, каждый раз со слепками-скриншотами из доски на этот момент. А то опыт показывает, что задним числом такие вещи пишутся оочень туго.
>
> замахнулся, а? :)

**Mid-turn operator message** (with a screenshot of the estimate output, 8 senior-hours):

> гы, это у тебя задел на всю игру?)

**Agent:** Took «собственно его нужно создать и сейчас» as the go-ahead for bite 0 with the board first; read the artifact capabilities (db, user, assets), settled the board's design and the race handling, recorded both in the plan's `## Rest of the bite`, flipped the plan to in-progress then paused it at the context budget (~304k), nothing of the board built. Answered the joke in chat: the 8 h are this session's planning only; the whole game is the plan's ~3,100 h forecast.

## 3. Intent

An exploration game, Island, over the world Zoltan and Syama drew: a descent from near space (spirit) through clouds (gliding bird) to the ground (walker), detail generated as it comes into view, no towns/people/animals yet. Built as a **mammoth** — an elephant eaten by a team of parallel sessions — steered by a north star rather than a laid-out schedule. The plan surface is an **infinite board** artifact, stored in the repo, that every session and the operator draw on; a **case study** is written as the work goes, with board snapshots. The operator ruled out: waves planned in advance; the game building from an arbitrary JPEG (it builds from the traced vector); trying to foresee everything up front.

## 4. Decisions

- **Mammoth** = elephant eaten by a team: a **lead** session holds the plan/PR; **members** are separate cloud sessions (`create_session`), each on a bite branch with a PR based on the elephant's branch. Beat: subagents (members outlive restarts, the operator can watch each).
- **Channel**: `scripts/memo.py` ported from sc-hub, sides `lead`/`member`, a memo file per bite branch, one `wait` over all open branches. Beat: `send_message` by session id (a branch channel survives relays and is reviewable in git).
- **North star, no waves** (operator, message 3). The plan's `## Rest of the elephant — the north star` lists destinations in no order; each next bite is chosen when the last lands.
- **Real scale** (Arc = DR Congo, island ~5,000 km, Earth-radius planet); far travel by climbing.
- **Input = a drawn map**, white water / rest land, traced once to a vector coastline; the tracer one pure TS module (build now, browser later for "your own map"). Coast fractals on approach. Rivers open.
- **Two tiers**: whole-map features (rivers to sea, climate) computed once from the coastline; finer detail a pure function of a tile key.
- **three.js `WebGPURenderer`** with its automatic WebGL 2 fallback, one code path; tiles filled in workers (no compute shaders).
- **`src/island/` at `/island`** in vova's `(game)` route group.
- **The board** (design in the plan, § "The board replaces this plan"): repo truth one JSON file per item under `docs/plans/world-game-zoltan-syama/board/`; the operator's edits in the artifact's `db` (one doc per item) and `assets`; last-writer-wins per item by `updated`, tombstones for deletes; only the lead publishes; `board.ts build | sync | snapshot`. Replaces both the plan's content and the earlier status mind map.
- **Case study**: `sites/vova/public/case-studies/island.md`, `hidden: true` until the game ships, dated entries with board snapshots in `assets/island-board-<date>.png`.
- **`megabeast` → `mammoth`** for `.claude/skills/megabeast/notes/`; PR #101 (`/golem`) is for ideas only.
- **Game-dev roles** are in the ledger's `rates.repo.json` (multipliers: game-designer 0.9, graphics-programmer 1.25, gameplay-programmer 0.95, technical-artist 1.0, environment-artist 0.8, producer 0.85, all senior).

## 5. Errors and dead ends

- First plan draft was too detailed (CDLOD, reversed-Z, projection); the operator asked for broad strokes — cut.
- Waves were laid out in advance; the operator replaced them with a north star.

## 6. State

- Branch `claude/world-game-zoltan-syama-hodowq`, head `1bf01be8` pushed.
- PR https://github.com/vzakharov/vovazakharov.com/pull/255 — draft, open, title `feat(vova): /island, exploring the world Zoltan and Syama drew`; squash proposal posted and tracked at `docs/remove-before-merging/world-game-zoltan-syama-hodowq/squash-message.md`.
- Plan: `docs/plans/world-game-zoltan-syama.paused.md` (approved; go-ahead quoted in commit `e7172bb5`).
- No CI, no subscription, no scheduled check-ins. A keepalive watcher ran in this container only.
- Estimate: this session 3 h senior game-designer ("the three bodies and the north star are a game's core loop, decided before any code") + 3 h senior architect ("whole-map vs per-tile generation and one seed for the world are calls every later step stands on") + 3 h senior producer ("a team of parallel sessions and an operator need one shared board, its sync rules and its status settled"). Remainder handed on: 6 h senior developer ("an infinite board with live multi-writer edits, repo-backed items and a db merge is a small app of its own") + 1 h senior copywriter ("a case study begun mid-work needs its frame and first entry set in the site's voice").

## 7. Pointers

- `docs/plans/world-game-zoltan-syama.paused.md` — the plan; `## Rest of the bite` holds the board and case-study design in full.
- The map: `vzakharov/life` → `family/world-map-zoltan-syama/screenshots/map.jpg` (1920×1362) and its `README.md` (countries, areas, scale) and `measure.py` (land/sea flood fill). Re-fetch: `add_repo vzakharov/life`, then `git clone --depth 1 https://github.com/vzakharov/life /home/user/life` (1.9 GB, long timeout).
- sc-hub originals: `vzakharov/sc-hub` → `scripts/memo.py`, `workday/runbook.md`. Re-fetch the same way (`/home/user/sc-hub`, 130 MB).
- The web-ocean screenshot the operator attached lives only in this container (`tmp/session-images/20261106T170957Z-91664c74.webp`); the successor can take a fresh one from https://github.com/Noniv/web-ocean's README, or ask the operator to re-attach.
- Artifact capability typings: loaded via the `artifact-capabilities` skill (`db.d.ts`, `user.d.ts`, `assets.d.ts`).
- `.claude/skills/megabeast/notes/` — the mushroom run's notes (esp. `subagents.md` on orchestrating), to be renamed `mammoth/`.
- Case-study conventions: `.claude/rules/content.md`; example `sites/vova/public/case-studies/playgram.md`.
- This session: https://claude.ai/code/session_01DaohkDHg8CCY4MnYQWDxdJ

## 8. Next step

Resume the paused plan through `/go` Step 1 (go-ahead already given and quoted): build the board as `## Rest of the bite` describes — the tooling under `scripts/board/`, the items for the plan's current content (north star, load-bearing calls, how the mammoth is eaten, bite 0's remaining steps, the map and the web-ocean image), publish it as an artifact with `db`, `user` and `assets`, run the one functional check, and shrink the plan to a pointer. Then start the case study with its first entry and a board snapshot. Then the remaining tooling (memo.py, the mammoth rename) and the first member — the operator's words: «собственно его нужно создать и сейчас, это будет у нас вместо плана».

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

````text
Вношу правки: путеводная звезда вместо волн, mammoth вместо megabeast, геймдев-роли в оценку.

Обновляю описание PR и коммичу.

Вова, переписал план: вместо волн теперь путеводная звезда. Кода по-прежнему нет, план ждёт «поехали».

**Путеводная звезда вместо волн.** В плане остались только решения, на которых стоит всё, сама звезда (список без порядка: остров с орбиты, нырок сквозь облака, фрактальный берег, реки, леса, море, три тела, телефон, своя карта) и открытый кусок. Следующий кусок выбираем, когда приземлился предыдущий, по тому, что он показал. Сколько кусков идёт параллельно, решаю на месте, по тому, какие файлы свободны. `/preview live` выкладываю, как только появляется на что посмотреть.

**Mammoth.** Переименование `megabeast/` → `mammoth/` вписал в нулевой кусок, туда же переедут все ссылки. PR #101 про golem там упомянут как источник идей, не для черри-пика.

**Геймдев-роли в оценке.** В таблицу ставок добавил game designer, graphics programmer, gameplay programmer, technical artist, environment artist и producer. Работа этой сессии теперь записана на них. В план положил прогноз, сколько студия потратила бы на весь остров: около 3 100 часов, семь человек, самый загруженный — graphics programmer, примерно пять месяцев. Когда доедим, сравним прогноз с тем, что накопит леджер.

**Про seed — да, одно число задаёт всё, вплоть до последнего камушка.** Хранится только векторный берег, остальное каждый раз вычисляется заново, и выходит одинаково. Тут две оговорки:
- Если поменять код генератора, мир тоже поменяется. Если когда-нибудь понадобится, чтобы он не «переезжал» между версиями, генератору понадобится номер версии.
- Запоминать придётся только то, что изменит сам игрок, когда это появится.

**Про WebGPU.** По вторичным источникам, его поддерживает примерно 70–76% браузеров в мире. Точную цифру с caniuse я не нашёл. Нет его в Firefox на Linux и Android, на старых Android-телефонах и на старых видеокартах. Chrome, Edge и Safari 26, включая iPhone и iPad, его поддерживают. Код при этом один: в three.js материалы пишутся один раз и компилируются под оба движка, а переключение на WebGL 2 происходит само. Цена — без compute-шейдеров, поэтому тайлы считаем в воркерах. Бонус: headless-браузер, которым я снимаю кадры для ревью, как раз рендерит через этот запасной путь.

PR: https://github.com/vzakharov/vovazakharov.com/pull/255

Чтобы начать, открой новую сессию с командой ниже или просто скажи «поехали» здесь:

```
/go claude/world-game-zoltan-syama-hodowq
```

Sources:
- [WebGPU is now supported in major browsers — web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
- [WebGPU adoption in browsers, 2026 — enterno.io](https://enterno.io/en/s/research-webgpu-adoption-browsers-2026)
- [WebGPU 2026: ~70% browser support — byteiota](https://byteiota.com/webgpu-2026-70-browser-support-15x-performance-gains/)
````
