# PR #224: feat(vova): CV and Playgram case study catch up with the profile

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/224
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← feat/cv-profile-gaps
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T05:26:30Z
- **Updated:** 2026-10-28T06:53:25Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/remove-before-merging/squash-message.md`:5 — unresolved — last: @vzakharov (human) 2026-10-28T06:48:23Z — "у нас публичная репа, не надо тут ссылаться на закрытые (то…" → [↓](#t01)
- **T02** `src/shared/i18n/messages/ru.json`:113 — unresolved — last: @vzakharov (human) 2026-10-28T06:49:58Z — "как-то тут всё можно переписать в более деловом виде, давно…" → [↓](#t02)
- **T03** `src/shared/i18n/messages/ru.json`:150 — unresolved — last: @vzakharov (human) 2026-10-28T06:50:21Z — "не надо сравнивать с "командой", речь про после проекта vs д…" → [↓](#t03)
- **T04** `apps/vova/public/case-studies/playgram.mini.md`:137 — unresolved — last: @vzakharov (human) 2026-10-28T06:51:21Z — ""though, not against" -- медведь. Нужно естественнее вплести…" → [↓](#t04)

---

## Body

## Summary

- **CV, both variants, en + ru**: adds what the job-search profile (vzakharov/life PR #252, `work/job-search/profile.md`) found missing — the mitko Telegram bot (aiogram 3, pgvector, PydanticAI) among independent projects; Redis, Django Q2, SQLAlchemy, DRF, pgvector, PydanticAI and Azure OpenAI in the stack; a product-minded line in the dev variant's working style; a Playgram bullet comparing against the Bubble team. Nothing from the profile's "Чего нет" list was added.
- **Playgram case study and its `.mini`/`.nano` cuts**: the comparison with the two Bubble developers — about four releases a week either side (Bubble: 124 releases, 22.12.2025–11.07.2026; 4.x: 48 releases, 21.05–10.08.2026), ~8.5 changes per release against ~3, so ~2.5× the changes a week, and 712 of the window's 806 merged PRs by Vova — with both caveats (until 11.07 mostly porting existing features; 4.x notes are written by the `/release` skill and run finer). The +65% (6.8 → 11.2) is marked as Vova against his own earlier, weaker agent tooling. Counts re-done from `bubble/bubble-release-notes.md` and `docs/release-notes/` in Playgramai/playgramapp.
- **Fitting the 3-page ceiling** took cuts: Unfindables gave mitko its slot, Flows left both catalogues, the stack line lost APScheduler, Alembic, Postmark, Mixpanel and S3, and the Russian JobGenie line was shortened twice. All four PDFs now print 3 pages.
- Left out on purpose: C++ (olympiads/university, not production — it would need a qualifier the locale-free stack line can't carry); a public link to life PR #252, since that repo is private.

## QA Checklist

- [ ] `cv-pdfs` — open the `/cv/dev/en`, `/cv/dev/ru`, `/cv/cto/en`, `/cv/cto/ru` PDFs: each is exactly 3 pages, no blank trailing page, no block orphaned onto a page by itself.
- [ ] `cv-mitko` — the independent-projects list shows mitko, no Unfindables, no Flows, in both languages.
- [ ] `cv-stack` — the stack rows include Redis, Django Q2, SQLAlchemy, pgvector, PydanticAI, Azure OpenAI, and nothing from "Чего нет" (Kafka, gRPC, n8n/Make, 1C/Bitrix24, React Native).
- [ ] `cv-playgram` — the Playgram experience block carries the Bubble comparison bullet in both languages.
- [ ] `case-study` — `/case-studies/playgram` shows the Bubble comparison with both caveats and the +65% caveat; the `.mini` and `.nano` variants agree with it.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `cv-pdfs` | integration | ✅ | `content:pdf` fails past `CV_PAGE_CEILING`; blank-page and orphan checks are by eye |
| `cv-mitko` | manual-only | — | Copy check against the profile |
| `cv-stack` | manual-only | — | Copy check against the profile's "Что есть" / "Чего нет" |
| `cv-playgram` | manual-only | — | Wording and wrap are judged on the render |
| `case-study` | manual-only | — | Figures checked against the playgramapp counts above |

https://claude.ai/code/session_01DaohkEoTnfz5QUbDNT591q

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-28T05:26:54Z — "Proposed squash body: ``` The CV and the Playgram case study…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-28T05:26:54Z

[https://github.com/vzakharov/vovazakharov.com/pull/224#issuecomment-6461423312](https://github.com/vzakharov/vovazakharov.com/pull/224#issuecomment-6461423312)

Proposed squash body:

```
The CV and the Playgram case study lagged behind the job-search
profile assembled in vzakharov/life PR #252: work and stack Vova has
were missing, and the case study's headline figures lacked the
comparison and caveats that make them honest.

Both CV variants, in English and Russian, gain the mitko Telegram bot
(aiogram, pgvector, PydanticAI) among independent projects, and Redis,
Django Q2, SQLAlchemy, DRF, pgvector, PydanticAI and Azure OpenAI in
the stack. The dev variant's working style gains a product-minded
line; the Playgram experience gains a bullet on output against the
Bubble team. To hold the 3-page ceiling, Unfindables and Flows leave
the independent projects and the stack line drops its minor tools.

The case study and its mini and nano cuts compare with the two Bubble
developers: about four releases a week either side, but 8 changes per
release against 3 -- about 2.5x the changes a week -- and 712 of the
806 PRs merged 21 May - 10 August 2026 are Vova's, caveated that the
early window was mostly porting and that the 4.x notes run finer. The
+65% is marked as a comparison against his own earlier agent tooling.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:5 — unresolved — last: @vzakharov (human) 2026-10-28T06:48:23Z — "у нас публичная репа, не надо тут ссылаться на закрытые (то…" → [↓](#t01)
- **T02** `src/shared/i18n/messages/ru.json`:113 — unresolved — last: @vzakharov (human) 2026-10-28T06:49:58Z — "как-то тут всё можно переписать в более деловом виде, давно…" → [↓](#t02)
- **T03** `src/shared/i18n/messages/ru.json`:150 — unresolved — last: @vzakharov (human) 2026-10-28T06:50:21Z — "не надо сравнивать с "командой", речь про после проекта vs д…" → [↓](#t03)
- **T04** `apps/vova/public/case-studies/playgram.mini.md`:137 — unresolved — last: @vzakharov (human) 2026-10-28T06:51:21Z — ""though, not against" -- медведь. Нужно естественнее вплести…" → [↓](#t04)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:5 — unresolved

```diff
@@ -0,0 +1,29 @@
… 1 line elided …
+
+```
+The CV and the Playgram case study lagged behind the job-search
+profile assembled in vzakharov/life PR #252: work and stack Vova has
```

**@vzakharov (human)** — 2026-10-28T06:48:23Z

у нас публичная репа, не надо тут ссылаться на закрытые

(то что в история пиара останется -- переживём)

---

<a id="t02"></a>

### `src/shared/i18n/messages/ru.json`:113 — unresolved

```diff
@@ -110,7 +110,7 @@
… 1 line elided …
           "title": "Стиль работы",
           "paragraphs": [
-            "Я из тех разработчиков, которых можно оставить почти без присмотра. У меня достаточно жизненного опыта, чтобы разбираться в вещах самому, достаточно воображения, чтобы заполнить пустоты,…
+            "Я из тех разработчиков, которых можно оставить почти без присмотра. У меня достаточно жизненного опыта, чтобы разбираться в вещах самому, достаточно воображения, чтобы заполнить пустоты, и менталитет «относиться к любой работе, как к собственному детищу». Даже как разработчик я смотрю дальше кода: если задача не вяжется с продуктом, я так и говорю.",
```

**@vzakharov (human)** — 2026-10-28T06:49:58Z

как-то тут всё можно переписать в более деловом виде, давно назрело

---

<a id="t03"></a>

### `src/shared/i18n/messages/ru.json`:150 — unresolved

```diff
@@ -145,6 +145,10 @@
… 2 lines elided …
           },
+          {
+            "lead": "В 2,5 раза больше изменений в неделю,",
+            "text": "чем у команды на Bubble, при тех же четырёх релизах."
```

**@vzakharov (human)** — 2026-10-28T06:50:21Z

не надо сравнивать с "командой", речь про после проекта vs до проекта

---

<a id="t04"></a>

### `apps/vova/public/case-studies/playgram.mini.md`:137 — unresolved

```diff
@@ -134,6 +134,8 @@ They asked for 1.5–2 months. I agreed and missed it. At the two-month mark the
 
 The chart of units of work does show where my method changed, and it’s a single day: 25 April, when the work moved into the cloud. What takes a few weeks afterwards is the output catching up, not the…
 
+That is me against myself with weaker agent tooling, though, not against anyone working without agents. Against the two Bubble developers the code replaced: from `4.0.0` on 21 May to the 10 August handover the rewrite shipped about four releases a week, as many as they had shipped between December and July, but at eight changes per release against their three — about 2.5 times the changes a week, 712 of the window’s 806 merged pull requests mine. Two caveats: almost everything up to 11 July was carrying over what Bubble already had, and the 4.x notes are written by the `/release` skill, which splits changes finer than a human’s one-liners.
```

**@vzakharov (human)** — 2026-10-28T06:51:21Z

"though, not against" -- медведь. Нужно естественнее вплести это в канву повествования, не просто добавив абзац, а переписав так чтобы всё вместе естественно читалось.

примерный фрейминг: использование highly parallel web sessions даёт такой-то прирост, а по сравнению с no-code разработкой так вообще вот такой.

---

## Timeline (status, references, and other events)

- **2026-10-28T05:26:55Z** @vzakharov renamed from «feat(vova): CV and Playgram case study catch up with the job-search profile» to «feat(vova): CV and Playgram case study catch up with the profile».
- **2026-10-28T06:53:25Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/224#pullrequestreview-5678818424.
