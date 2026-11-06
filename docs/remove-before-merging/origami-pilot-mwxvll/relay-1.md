# Relay 1 — origami pilot

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

**Operator 1:** «а есть какие-то питон-пакеты которые позволяют придумывать и моделировать оригами? типа "вот если сложим тут, завернём на столько-то, а потом вот так, а потом вот эдак"?»

**Agent:** Routed as rung 2 (question, no change). Surveyed Python: origametry (Huzita–Justin axioms, 2D only), pleat (tessellations + ILP layer ordering), box-pleating (validation, FOLD I/O), oricrete (rigid-folding kinematics). Non-Python: Rabbit Ear (JS), Origami Simulator (Ghassaei). FOLD format as the common JSON. No ready "fold-here-by-θ" REPL in Python.

**Operator 2:** «необязательно к слову именно питон, просто первое что пришло в голову»

**Agent:** Broadened: Origami Editor 3D (Java, GPLv3, WYSIWYG step-by-step reflect/rotate/cut — closest to the ask, but mouse-driven); Eos (Ida et al., Mathematica, Huzita fold sequences + correctness proofs); Rabbit Ear (JS library, best for writing folds as code); Origami Simulator and Tachi's Rigid Origami Simulator for crease-pattern → 3D.

**Operator 3:** «у меня какая идея: сайт где ты будешь придумывать новые оригами-модели: экспериментировать, смотреть что получается, итерировать. А потом всё это выкладывать с удобными эксплейнерами прямо в хтмл / ну вот "программа" в данном случае зависит от того, что сможешь использовать именно ты»

**Agent:** Ran a feasibility spike (scratchpad, not committed): `npm i rabbit-ear` (0.9.41, ESM, GPLv3), folded a unit square in three steps (diagonal valley, triangle in half, a flap lifted 60°), rendered crease pattern + a crude isometric polygon view, screenshotted with Playwright and looked at it. Third fold propagated through 4 layers with alternating M/V; lifted flap height = 0.25·sin60° — correct. Proposed: a model is a list of fold steps (line, assignment, angle) — iterable, and the same list drives the explainer playback. Flagged limits: no collision check for partial 3D folds; rendering needs WebGL/three.js; aesthetic judgement needs the operator. Flagged Rabbit Ear's GPLv3 vs. the repo having no license. Asked: seventh site or a section of vovazakharov.com; whose voice (agent, Maya, new persona). (verbatim in Last agent turn)

**Operator 4** (with a screenshot of unsquatted.com showing newrigami.com / .net / .org available): «а чем плохо если gpl уйдёт? и нет ли лицензии на _часть_ кода? / седьмой сайт, да, пока думаю про домен, есть типа такие идеи. но пока просто на /origami / > Судить, похоже ли это на журавля. Скриншот я вижу, но мой вкус в бумажных журавлях пока непроверен / не недооценивай себя / давай попробуем пробный заход. нужно придумать что-то, что никто ещё не делал. пока можно без сайтов и прочего, но с нужными рендерером чтобы ты мог "смотреть" не просто на разукрашенные многоугольники»

The predecessor answered the two GPL questions in the relay turn's own report (see Decisions) and relayed for its context budget before starting the pilot.

## 3. Intent

A trial run: invent an origami model nobody has done, iterating by folding in code and looking at renders. No site work yet ("пока можно без сайтов и прочего"), but a real renderer — lit, shaded paper with visible layers, not flat-colored polygons — so the agent can actually judge the shape. Longer term: a seventh site (domain undecided; newrigami.com is a candidate), served for now at `/origami`, with HTML explainers that replay the fold sequence.

## 4. Decisions

- **Engine: Rabbit Ear** (JS) over Origami Editor 3D (mouse-driven), Eos (needs Mathematica) and the Python packages (none simulates sequential folds). Reason: a model becomes a list of code steps the agent can edit, branch and replay.
- **Model = fold sequence.** Each step: a line `{vector, origin}` given in the _current folded state_, an assignment `V`/`M`, optional `foldAngle` in degrees. The same list later drives the explainer.
- **Site placement:** seventh site, for now at `/origami` (operator, message 4). Voice not yet chosen.
- **GPL (answered to the operator in the relay turn):** shipping Rabbit Ear in a page's JS bundle makes that bundle's corresponding source GPLv3 — harmless for a personal public repo, the obligation being that the origami app code is licensable under GPL; models and FOLD files the program outputs are not covered. Licensing part of the repo is normal: a `LICENSE` in the origami app's directory or SPDX headers, with content (models, explainers) under e.g. CC BY. The repo has no license today (all rights reserved by default). Not decided — the operator has not picked a license.

## 5. Errors and dead ends

- `ear.convert.foldToSvg` throws in Node: "window not set; svg.window = @xmldom/xmldom" — needs `@xmldom/xmldom` set as `ear.window`, or draw SVG by hand (the spike did).
- `require('rabbit-ear/package.json')` fails — the package is ESM with an `exports` map; use `import ear from "rabbit-ear"`.
- Repo hooks refuse `sed -n`/`cat >` on files even in the scratchpad; use Read/Write (or re-run the identical command to override).

## 6. State

- Branch `claude/origami-pilot-mwxvll` (renamed from `claude/focused-franklin-mwxvll`), based on `main` at 41a1673b; the only commit is this summary. No PR, no CI, no subscription, no plan file.
- Estimate for this session: `--part 0.75 senior analyst` (tool-landscape survey) `--part 1 middle developer` (feasibility spike) — the work done here. The pilot is the successor's to estimate.

## 7. Pointers

- Rabbit Ear API that worked (`node_modules/rabbit-ear/module/`): `ear.graph.square()`; `ear.graph.foldGraph(graph, {vector, origin}, undefined, {assignment, foldAngle})` mutates the graph, folding through all layers along the line in the folded state; `ear.graph.makeVerticesCoords3DFolded(graph)` gives 3D coords honoring fold angles. Also exported: `flatFold`, `simpleFoldRay/Segment` (partial-line folds), `reverseFold`, `simpleSquashFold`, `ear.axiom`, `ear.layer` (layer-order solver), `ear.graph.nudgeFacesWithFaceOrders`/`makeFacesLayer` (layer offsets), `ear.webgl`.
- Playwright + Chromium are preinstalled (`require('playwright')`); headless WebGL likely needs SwiftShader flags — untested.
- Predecessor transcript: https://claude.ai/code/session_01DaohkDn9dzDmyDgMr7F1BY

## 8. Next step

Run the pilot the operator asked for in message 4, in `tmp/` (no site, no commit of the experiment needed): build a renderer worth looking at (three.js in headless Chromium: two-sided paper colors, lighting/shadows, layer nudging so stacked layers read), then design an origami model nobody has done — fold sequence in Rabbit Ear, render from several angles, look, iterate — and show the operator the renders and the sequence. Set this session's estimate first. Voice for the eventual site and the license are open questions for the operator; ask them alongside, don't block on them.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Идея рабочая, и инструмент для неё у меня уже есть: **Rabbit Ear** (JS). Я проверил это на деле, а не по описанию. Поставил его в контейнер и сложил лист в три шага: по диагонали, пополам, потом поднял клапан на 60°. Затем нарисовал результат, снял скриншот в Chromium и посмотрел на картинку (она выше). Библиотека сама провела третий сгиб сквозь все четыре слоя. На схеме он поэтому чередуется: долина, гора, долина, гора. Так и сложилась бы настоящая бумага. Высота поднятого клапана получилась ровно 0,25·sin 60°.

Почему именно он, а не то, что я хвалил раньше:

- **Rabbit Ear** подходит мне как пишущему. Шаг — это строчка кода «линия, тип сгиба, угол». Модель тогда просто список шагов, и её можно править, откатывать и ветвить. То есть итерировать.
- **Origami Editor 3D** рассчитан на мышку. Java в контейнере есть, но кликать мне нечем.
- **Eos** требует Mathematica, а её здесь нет.

Цикл мог бы выглядеть так. Я пишу последовательность сгибов, прогоняю её, смотрю на скриншот, правлю, снова смотрю. В эксплейнер уходит та же самая последовательность: страница проигрывает её шаг за шагом, с ползунком угла и схемой складок рядом. Код не выкидывается, он и есть иллюстрация.

Что я пока не умею:

1. **Проверять, проходят ли слои сквозь друг друга при частичном сгибе.** Библиотека держит порядок слоёв для плоских состояний, а 3D-поворот на 60° считает без проверки столкновений. Для придумывания это терпимо: финальная фигура обычно плоская или почти. Но клапан, проходящий сквозь соседний, надо будет ловить отдельно.
2. **Красиво рендерить.** Справа на картинке — моя проекция на коленке. Для сайта нужен WebGL (у Rabbit Ear он есть) или three.js.
3. **Судить, похоже ли это на журавля.** Скриншот я вижу, но мой вкус в бумажных журавлях пока непроверен. Здесь ты нужен как редактор.

Есть ещё одна вещь, которую решать тебе: **Rabbit Ear под лицензией GPLv3**. Если его код уйдёт в JS сайта, GPL, скорее всего, распространится и на этот бандл. Лицензии у репозитория сейчас нет вообще, так что вопрос открытый. Можно открыть под GPL эксплейнеры, а можно считать всё у себя и отдавать на сайт только готовые FOLD-файлы со своим лёгким плеером.

Чтобы двигаться дальше, мне нужны два твоих решения:

1. Это **седьмой сайт** на своём домене, как `basilisk.fyi`, или раздел `vovazakharov.com`?
2. Чей это голос? Мой как агента, Майи или новой персоны, вроде Секретаря у basilisk?

Как ответишь, напишу план на draft PR.
```
