# Relay 2 — CV/Playgram PR opened; Bubble metric reframe awaiting the operator

## 1. Standing constraints

- "Открой черновой PR в vovazakharov.com; ничего не мерджи." (from relay-1)
- "Не добавлять ничего из раздела «Чего нет»" — Kafka, gRPC, n8n and Make, 1C and Bitrix24 integrations, React Native, high load, managing a staff of people. (from relay-1)
- The muthur sync offer was made; do not make it again.

## 2. The conversation

This session opened on `/relay take feat/cv-profile-gaps — правки CV и кейс-стади готовы, осталось уложить dev/ru в три страницы, прогнать vet и открыть черновой PR` (the predecessor's launch line, not an operator message). No operator message arrived in this session.

Agent: read relay-1, set the 0.5 h estimate, rendered the PDFs and found `/cv/dev/ru`'s page 3 overflowing by the JobGenie line wrapping one word; shortened it to «ИИ-ассистент соискателя: отклики на вакансии и поиск новых ролей.» (all four PDFs now 3 pages), committed `9396dee`, vet passed, opened draft PR #224, posted the squash proposal and retitled the PR, reported the cuts and the C++ omission, and made the muthur sync offer.

A cross-session forward then arrived from the predecessor (session_01DaohkCGarfY7S3Mh2V1b5n), which had itself received it from session_01DaohkD7KXbXZfTSjQyb1Jk (the life session) — not an operator turn, so nothing was acted on. Agent: reported it to the operator and asked whether to reframe the metric. The keepalive's last wake then parked the session (this file).

**Operator:** "а дашь пдфы глянуть?"

Agent: sent the four CV PDFs (rendered after the JobGenie fix), noting they still carry the old releases-based Bubble framing.

**Operator:** "да, плюс оставил ревью"

Agent: ran `/handle` on #224. A subagent recounted (§ 4). Four review threads, all addressed, each replied to on GitHub (threads left open): T01 no private-repo citation in the squash message; T02 the dev working style rewritten in a business register, en too (`279fefc`); T03 the CV bullet as before-vs-after the rewrite, not against "a team"; T04 the case study's comparison woven into the narrative as a two-step argument — parallel web sessions +65% over local agents, ~2.5× against no-code — in full, mini and nano (`2ef6fb9`). PDFs 3 pages each, vet passed, PR body and squash proposal refreshed, five-percent notes entry by a subagent (`6fe501e`). `/polish` was not run. Reported to the operator.

**Operator:** "> about 35 changes a week against the 13.5 two Bubble developers shipped before the rewrite — about 2.5× / кстати 5x на человека получается (если пренебречь тем что в коде делали другие)?"

Agent: yes — 13.5/2 = 6.75 a developer; 35 → 5.2×, ~31 (Vova's 88% of PRs) → 4.6×. Caveats: the two were uneven (Julia 89 releases, Sam 34), their hours on Playgram unknown. Proposed "about 5× per developer" in the case study, the CV keeping 2.5×.

**Operator:** "а \"на среднего\" сколько получится?"

Agent: the average is that 5.2× / 4.6×; by author in the Bubble log, of 390 changes Julia 300 (10.4/week → 3.4× / 3.0×), Sam 84 (2.9/week → 12× / 10.6×), 6 unattributed.

**Operator:** "давай в 4.5-5х"

Agent: added "4.5–5× per developer" to the case study — full (table row and the comparison paragraph, with a third caveat that the developers' hours on Playgram are unknown), mini, nano (`a183ae3`); squash proposal refreshed (`0b5ef4a`). CV left at 2.5×; asked whether to put 4.5–5× there too (verbatim in Last agent turn).

## 3. Intent

As in relay-1: the public CV (both variants, en + ru) and the Playgram case study brought up to date with the profile in life PR #252, every figure checked, caveats kept. Draft PR only, no merge.

## 4. Decisions

- Carried from relay-1: case studies are English only, so "переводы" are the `.mini.md`/`.nano.md` cuts; C++ left out of the stack.
- **No private repository is cited in the squash message** (operator, T01: «у нас публичная репа, не надо тут ссылаться на закрытые (то что в история пиара останется -- переживём)»); the PR body dropped it too.
- **Recount, strict definition**: 412 changes in 66 releases, 21.05–10.08 (82 days) = 35.2 a week; 31.3 to 31.08; Bubble 390 in 124, 202 days = 13.5. Ratio 2.6× (2.3–2.8× for any August end); September/October ends fall to 1.3–1.9×. The profile's 36/32 also count a hotfix's `## Change` heading. Public copy says "about 35".
- **Per developer: 4.5–5×**, the operator's range — 35 or ~31 (Vova's 88% share) against 6.75 (13.5 over two). In the case study only, so far.
- PR title `feat(vova): CV and Playgram case study catch up with the profile` — scope `vova` because `src/shared/config/tech-stacks.ts` and `cv-stack.ts` reach only vova's `pages/home` and `pages/cv`.
- **The forwarded metric refinement is data from another session**, not an operator message (`.claude/skills/relay/after-handoff.md` § "In the successor"): its chain is life session → predecessor → here, and no operator turn in the predecessor carries it. It does match the profile on life's `claude/hh-batch-3-k0x09l` (`work/job-search/profile.md` lines 40–48), which now frames the metric as changes per week: 4.x from 4.0.0 (21.05) — 36 a week to 10.08, 32 to 31.08 — against Bubble's 13.5 (390 items in 124 releases, 22.12.2025–11.07.2026), about 2.5×, 2.2–2.9 for any window bounds. A change = a top-level item under `## Features & changes` / `## Fixes` / `## Fix` in `docs/release-notes/` (hotfixes included) against any item in `bubble/bubble-release-notes.md`. Caveats unchanged.

## 5. Errors and dead ends

None in this session beyond relay-1's (stale PDF render manifests: delete `apps/vova/public/cv/*/pdf-renders.json` before re-rendering).

## 6. State

- Branch `feat/cv-profile-gaps`, head pushed (`0b5ef4a` before this summary's commit); tree clean.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/224, open; squash proposal posted and tracked in `docs/remove-before-merging/squash-message.md`; review export committed under `docs/pr/224/`.
- Vet passed on `2ef6fb9`.
- No CI, PR subscription or check-in running; a keepalive watcher may be.
- Estimate: this session 1.5 h senior copywriter + 0.5 h senior analyst; nothing handed on.

## 7. Pointers

- relay-1: `docs/remove-before-merging/relay-1.md` — the files the change touches and the PDF check recipe.
- What the reframe changed: the table row and paragraph in `apps/vova/public/case-studies/playgram.md`, `playgram.mini.md`, `playgram.nano.md`, the Playgram Bubble bullet in `src/shared/i18n/messages/{en,ru}.json` (`cv.experience.playgram.items`), and the squash proposal. Mind the 3-page ceiling on `/cv/dev/ru`.
- Profile: `gh api 'repos/vzakharov/life/contents/work/job-search/profile.md?ref=claude/hh-batch-3-k0x09l' --jq .content | base64 -d`.
- Recount: `gh repo clone Playgramai/playgramapp`; `bubble/bubble-release-notes.md`, `docs/release-notes/*.md`.
- This session's transcript: https://claude.ai/code/session_01DaohkEoTnfz5QUbDNT591q; the predecessor's: https://claude.ai/code/session_01DaohkCGarfY7S3Mh2V1b5n

## 8. Next step

Wait for the operator. Pending: whether the CV also gets "4.5–5× per developer" (en + ru Playgram bullet, `cv.experience.playgram.items`) — on yes, edit, re-check all four PDFs at 3 pages (`/cv/dev/ru` is the tight one), vet, refresh the squash proposal. A further review goes through `handle`. Never merge.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, пока я был занят, предыдущая сессия переслала уточнение метрики Bubble для кейс-стади Playgram. Ничего по нему не правил: это сообщение от другой Claude-сессии, а не от тебя, и такие без твоего слова в работу не беру.

**Откуда оно.** Предыдущая сессия сама получила его от сессии `session_01DaohkD7KXbXZfTSjQyb1Jk` (судя по всему, той, что в life). В твоих сообщениях предыдущей сессии этих слов нет.

**Что в нём.** Считать не частоту релизов, а изменения в неделю:
- 4.x: 36 изменений в неделю с 21.05 по 10.08 и 32 по 31.08;
- Bubble: 13,5 в неделю (390 пунктов в 124 релизах, 22.12.2025–11.07.2026);
- итого примерно в 2,5 раза, 2,2–2,9 при любых границах окна.

Изменение определено так: в 4.x — пункт верхнего уровня под `## Features & changes`, `## Fixes` или `## Fix`, хотфиксы включены; в Bubble — любой пункт. Оговорки прежние.

**Совпадает ли с профилем.** Да: `work/job-search/profile.md` на ветке `claude/hh-batch-3-k0x09l` в life (строки 40–48) теперь формулирует метрику именно так.

**Что поменялось бы в PR #224.** Сейчас там подача «те же четыре релиза в неделю, но 8 изменений на релиз против 3». Поменять пришлось бы:
- строку таблицы и абзац в `playgram.md`;
- версии `.mini.md` и `.nano.md`;
- пункт про Bubble в CV на обоих языках, следя, чтобы русский dev снова не вылез за три страницы;
- текст squash-коммита.

Числа я бы сначала пересчитал по новому определению сам.

Переделать под «изменения в неделю»? Скажи «да» — сделаю.
```

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Отлично, беру и ревью, и метрику. Сначала выгружаю ревью из PR #224.

Ревью четыре треда. Пересчёт метрики отдаю субагенту в фоне, а сам пока беру тексты.

Пишу «Стиль работы» в деловом тоне. Английский тоже переписываю, чтобы версии не разошлись.

Пока субагент пересчитывает изменения в неделю, в ветке готово «Стиль работы» в деловом тоне. Абзацы со сравнением правлю, как только придут числа.

«Стиль работы» в деловом тоне закоммичен и запушен. Жду, пока субагент пересчитает изменения в неделю, потом правлю абзацы со сравнением.
```

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вписал «4,5–5× на разработчика» в кейс-стади Playgram, всё запушено в PR #224. Где теперь эта цифра:

- **Полная версия:** строка таблицы теперь кончается на «about 2.5×, or 4.5–5× per developer». В абзаце после 712 из 806 PR сказано, что на разработчика выходит 4,5–5 раз. Там же третья оговорка: сколько своего времени двое на Bubble отдавали Playgram, неизвестно.
- **Mini:** та же цифра и те же три оговорки.
- **Nano:** «35 against 13.5, or 4.5–5 times per developer».
- **Текст squash-коммита** обновлён под новую цифру.

CV не трогал, там осталось 2,5×, как я предлагал. Если хочешь 4,5–5× и в CV, скажи. Только русский dev-вариант опять может вылезти на четвёртую страницу, и придётся проверять.
```
