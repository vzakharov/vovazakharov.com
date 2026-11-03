# Relay 2 — unsquatted: polish, motion, then finalize

## Standing constraints

Carried from relay-1: «не, для домейнеров точно не хочу ничего» — nothing on the site serves domain investors.

## The conversation

0. Session opened as `/relay take claude/unsquatted-hundred-picks-555goo`; the predecessor (session_01DaohkB3kf6vg5HXMRJRhw4) forwarded, verified against its transcript: «а давай ещё какую-нибудь анимашку при перемешивании, типа одни и те же строки (если остаются при перемешивании) "переезжают", старые улетают в одну сторону, новые прибегают с другой»
   - Agent: built the redraw flight (f8480cc), resumed the plan, ran `/polish` in a subagent (fixed a `.zones` list-reset regression 1a342d2, tightened comments b0fcd5e, posted a /five-percent review with two optional proposals), flipped the plan to completed, refreshed PR #242's body and squash proposal. Asked: rows never stay on a redraw at 100 names, so the "move" path never shows — keep or draw 10 of 100 plainly?
1. **Operator:** «> В статичном HTML главной теперь нет ни одного имени… чем это нам гипотетически грозит? поисковики не увидят предлагаемых доменов? / > RUNBOOK… не надо, смысл -- экономить токены контекста (описание грузится всегда) / > Вынести любой из них значит завести общий хелпер в kernel — выноси, только таки наверное в shell / > Сейчас при каждом броске тянутся десять новых имён… ок, забей на анимацию»
   - Agent: extracted the seeded test generator to `src/shell/shared/lib/seeded-random.ts` (pushed); `inTurn` was reverted — mushrooms inherits kernel only, and kernel/shared/lib then trips Steiger's 15-module `shared-lib-grouping`; recommended keeping two copies. Explained SEO risk.
2. **Operator (mid-turn):** «на превьюшку опубликуешь?» — Agent: published unsquatted to preview.
3. **Operator (mid-turn):** «хочу подумать, стоит ли рисовать сразу фавиконки для каждой. попробуй на 10, без публикации, просто мокапом…» — Agent: `docs/remove-before-merging/unsquatted-hundred-picks-555goo/favicon-mockup.html` (three columns), recommended not drawing them.
4. **Operator:** «> Отдельных страниц у имён нет… а зачем нам чтобы они индексировались?» — Agent: no reason; keep the browser-side draw.
5. **Operator:** «а новые могут прилетать одновременно с тем как улетают старые? сейчас есть небольшая задержка между»
6. **Operator (mid-turn):** «что-то не нравится кубики что и тут и там, давай лучше обычный значок а ля обновить (стрелки по кругу), и без очертания кнопки»
7. **Operator (mid-turn):** «ещё не оч нравится как выглядит hover в curated списке» (screenshot: the heart on a filled dark-green plate)
8. **Operator (mid-turn):** «> Моё мнение: не рисовать… согласен» (favicons dropped)
9. **Operator (mid-turn):** «пусть самые первые up for grabs тоже "приезжают", типа стилистически обыграть мелькание после гидратации»
   - Agent (5–9, f4da77f): old rows fly off a ghost copy on `<body>` while new ones arrive simultaneously; first ten arrive on load; heading button is lucide `RefreshCw`, subtle, no plate; heart hover takes the liked colour, no plate.
10. **Operator:** «перепубликуй и больше не спрашивай :)» — Agent: republished; wrote the rule into the operator's entry.
11. **Operator:** «это не правила vzakharov.md, это общие правила. я тут один :) / плюс я заметил ты не откомментировал "в сессии" для замечаний пятипроцентника. / после этого -- можно финализировать»

- Agent: moved the rule into `.claude/skills/preview/SKILL.md` § "Published" (db2a7d4); replied «В сессии: …» on both /five-percent threads; relayed for the context budget (verbatim in Last agent turn).

## Intent

Ship PR #242: 100 picks, the runbook, the drawn ten with motion. Ruled out: favicons, a static ten for SEO, a runbook skill, drawing 10-of-100 with repeats, sharing `inTurn`.

## Decisions

- Seeded generator in `shell/shared/lib` (lowest app both basilisk and unsquatted inherit); `inTurn` stays duplicated (Steiger threshold in kernel/shared/lib).
- Redraw motion: `ui/shuffle-motion.ts` — a ghost clone on `<body>`, removed on a timer, not awaited, so no promise is swallowed.
- Preview republish after each visible change is a house rule in the preview skill.

## State

- Branch `claude/unsquatted-hundred-picks-555goo`, head db2a7d4 (before this file), pushed. PR #242 draft. Plan `docs/plans/unsquatted-hundred-picks.completed.md`.
- PR body and squash proposal predate f4da77f (simultaneous flight, first-ten arrival, refresh glyph, hover) and the seeded-random move — `/finalize` reconciles them.
- Preview holds this branch's f4da77f build. Vet not run.
- Estimate: this session 1 h + 1.5 h + 0.5 h middle developer, 1 h middle designer. Remainder handed on: `--part 1 middle developer "land prep on a multi-part diff: vet, base merge, squash record reconciled against late UI changes"`.

## Pointers

- `src/unsquatted/pages/home/page/ui/{pick-deck.tsx,shuffle-motion.ts,unsquatted-home.module.scss}`, `src/shell/shared/lib/seeded-random.ts`.
- relay-1.md for the earlier session; this session's transcript: https://claude.ai/code/session_01DaohkBYQqWV2gRBJTkvBLD

## Next step

`finalize` — the operator: «после этого -- можно финализировать».

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Перепубликовал: на https://preview.vovazakharov.com теперь сборка с одновременным перелётом строк, въезжающей первой десяткой, кнопкой обновления и новым наведением на сердечко.

Больше спрашивать не буду. Записал в твои предпочтения: если ветка уже выложена на превью, после каждой видимой правки перепубликую сам. Запись идёт этой же веткой и заработает во всех сессиях после мержа.

Контекст этой сессии на пределе. Следующая заметная правка уйдёт уже в новую сессию, её я заведу сам. Дальше по ветке: `finalize`.
```
