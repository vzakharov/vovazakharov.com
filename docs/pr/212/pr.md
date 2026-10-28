# PR #212: feat: an LSA blog opening on the five-percent article, and /five-percent

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/212
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/five-percent-qryluk
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T07:31:16Z
- **Updated:** 2026-10-28T03:47:32Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at e337a58). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T02** `.claude/rules/content.md`:217 — unresolved — last: @vzakharov (human) 2026-10-28T03:46:04Z — "давай-ка всё-таки помечать комменты от "пятипроцентника" не…" → [↓](#t02)

---

## Body

## Summary

- `writing/notes/the-five-percent.md` had enough in it for conclusions: 219 bumps over fourteen learnings, 42% of them on one ("What it was handed, it treats as fixed"), and 89% readable as that one. It retires here, with the length check only it used.
- **`/five-percent`**, a read-only third `/polish` pass: it asks of a branch's diff the one question the top learning makes — what did it take as given, down to whether what it edits should exist — and posts at most three alternatives as one PR review anchored to the lines, each graded critical or optional — no edits, no commits. Its floor is a marker in its own review; planless `/go` runs it after `/pr`; `/finalize and merge` stops only on a critical one its own run posted. The mandatory notes entry leaves `CLAUDE.md`.
- **Every answered proposal is scored**, so the pass has a measure of its own: each proposal opens on a hidden marker naming `.claude/skills/five-percent/verdicts.md`, and the session answering it writes a 0–1 verdict into `writing/notes/five-percent-verdicts/<branch>/verdicts.json` — one file per branch, so none conflicts on merge. `scripts/five-percent-verdicts/tally.py` sums them overall and by branch; vet runs its tests and `--check`.
- **A bilingual blog on latestageagentic.com**, on the pattern Майя's site set in #208, opening with the five-percent article: Vova's Russian text, its English translation, a measurement with its caveats kept in, and the retired `/writing` page as its closing example. Blog pages write their dashes as dashes (`.claude/rules/lsa-voice.md`).
- **vovazakharov.com drops `/writing`**, a page of Glitchporn articles a fractional CTO's site has no use for; the home page's footer links `/music` alone.
- #187 (the six music posts) is not this blog's: they are Vova's rather than the agency's, and stay for a vovazakharov.com blog.

## QA Checklist

- [ ] `pass-posts` — on a test PR, `/five-percent` posts one `COMMENT` review of at most three proposals: each carries the marker, a grade and a concrete alternative, anchored where it points at lines, and the body ends with the `five-percent` head-SHA marker
- [ ] `no-edits` — after the pass, `git status` is clean and no new commit sits on the branch
- [ ] `empty-run` — on a diff that took nothing worth questioning as given, no review is posted and the report says so
- [ ] `floor` — a second run after one new commit reviews only that commit's diff
- [ ] `no-pr` — `/polish` on a branch with no PR reports the pass as deferred; planless `/go` runs it after `/pr`
- [ ] `finalize-stop` — `/finalize and merge` stops on a critical proposal its own polish posted, and merges past optional ones
- [ ] `marker` — a proposal the pass posts opens on `<!-- five-percent proposal · … -->`, hidden on GitHub and present in `docs/pr/<n>/pr.md` after an export
- [ ] `verdict` — after answering a proposal, `/handle` adds its row to the branch's `verdicts.json`, and `python3 scripts/five-percent-verdicts/tally.py` counts it under the branch
- [ ] `claude-md` — the staged `CLAUDE.md` no longer asks for a notes entry after a review session
- [ ] `lsa-blog` — on the LSA preview, the home page lists the blog in English, `/ru` in Russian, and the switch moves between them
- [ ] `article` — `/blog/the-five-percent` and `/blog/the-five-percent/ru` render, each with its feed entry and social card
- [ ] `writing-gone` — vovazakharov.com/writing answers with the site's 404, and the home page's footer links only `/music`

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `pass-posts` | manual-only | — | An agent's judgement posted to GitHub; read the review |
| `no-edits` | manual-only | — | Inspect the tree after a live run |
| `empty-run` | manual-only | — | Needs a live run on a trivial diff |
| `floor` | manual-only | — | Needs two live runs on one PR |
| `no-pr` | manual-only | — | Skill wiring, observed in a run |
| `finalize-stop` | manual-only | — | Skill wiring, observed in a run |
| `marker` | manual-only | — | Needs a live run of the pass |
| `verdict` | unit | ✅ | `test_tally.py` covers the parse and the sums; the write itself is an agent's, observed in a run |
| `claude-md` | manual-only | — | Read the staged copy's diff |
| `lsa-blog` | e2e | — | Build `lsa`, assert both locale homes list the post |
| `article` | e2e | — | Build `lsa`, assert both article pages and feeds exist |
| `writing-gone` | e2e | — | Build `vova`, assert no `out/writing` and no link to it |

https://claude.ai/code/session_01787cehEVE8kBCirE8itYr1

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T07:31:34Z — "Proposed squash body: ``` writing/notes/the-five-percent.md…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T07:31:34Z

[https://github.com/vzakharov/vovazakharov.com/pull/212#issuecomment-6410653339](https://github.com/vzakharov/vovazakharov.com/pull/212#issuecomment-6410653339)

Proposed squash body:

```
writing/notes/the-five-percent.md collected 214 bumps over fourteen
learnings, each a frame the agent took as given until a review broke
it. That is enough to put them to work before review, and to write
them up.

/five-percent is a third /polish pass, after /dry and /tend-prose, run
by the same subagent. It asks of the branch's diff the one question
the top learning makes — what did it take as given, down to whether
what it edits should exist — and posts at most three alternatives as
one COMMENT review, each inline and graded critical or optional. It
edits and commits nothing; an answered proposal becomes work through
/handle, which also scores the answer 0–1 into
writing/notes/five-percent-verdicts/<branch>/verdicts.json, one file
per branch so none conflicts, for tally.py to sum. Its floor is a
head-SHA marker in its own last review. Planless /go runs it after
/pr, and /finalize and merge stops on a critical proposal.

latestageagentic.com gets a blog, bilingual as Майя's is: English at
the bare address, Russian under /ru. It opens with the five-percent
article, a measurement written in Russian and translated, its
caveats kept in. vovazakharov.com drops /writing, a page of articles
from another career a fractional CTO's site has no use for. Every
served page writes its dashes as dashes; two hyphens are for channels.

The notes retire with the article, as does the length check only they
used, and the mandatory entry after a review session leaves CLAUDE.md.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-10-26T14:55:19Z_

[https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5654038492](https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5654038492)

Одно предложение, критичных нет.

<!-- five-percent: 36ee824c97e4308c113efdaeb74047be58fa9f4b -->

<a id="r02"></a>

### R02 — Review by @vzakharov (agent) — COMMENTED

_2026-10-27T03:09:05Z_

[https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5661778733](https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5661778733)

Одно предложение, критичных нет.

— Claude Code · https://claude.ai/code/session_01DaohkFaopWx9kWFUWcJNRD

<!-- five-percent: 97b7cfe5281092e54c411616654eff1d19ddc09e -->

<a id="r03"></a>

### R03 — Review by @vzakharov (agent) — COMMENTED

_2026-10-27T05:40:24Z_

[https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5662708879](https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5662708879)

Одно предложение, критичное — одно.

— Claude Code · https://claude.ai/code/session_01DaohkF1PQFSP4AMFg12djV

<!-- five-percent: ee92a84cf4142e8440f3392cf091817dbde1ffba -->

<a id="r04"></a>

### R04 — Review by @vzakharov (agent) — COMMENTED

_2026-10-28T03:37:06Z_

[https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5677494212](https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5677494212)

Одно предложение, критичных — ни одного.

— Claude Code · https://claude.ai/code/session_01DaohkDpBRoHfKRhLCUy7EY

<!-- five-percent: ef6d02af9284c67e8faebddd73e04a19788d8944 -->

_21 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `scripts/vet.sh`:185 — unresolved — last: @vzakharov (agent) 2026-10-27T05:38:02Z — "Оставил как есть; предложение записано в учёт с оценкой 0 —…" → [↓](#t01)
- **T02** `.claude/rules/content.md`:217 — unresolved — last: @vzakharov (human) 2026-10-28T03:46:04Z — "давай-ка всё-таки помечать комменты от "пятипроцентника" не…" → [↓](#t02)

<a id="t01"></a>

### `scripts/vet.sh`:185 — unresolved

```diff
@@ -182,6 +182,7 @@ source_checks=(
   test='scripts/vet-test.sh'
   hearing='python3 scripts/lib/test_hearing.py'
   song-facts='python3 scripts/song-intake/test_song_facts.py'
+  five-percent='python3 scripts/five-percent-verdicts/test_tally.py && python3 scripts/five-percent-verdicts/tally.py --check'
```

**@vzakharov (agent)** — 2026-10-27T03:08:59Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**`form`** · optional

Ты просил «какой-то скриптик», чтобы сводить статистику по веткам, и пользоваться им в основном будет агент, когда сядем за вторую статью. Ветка же построила вокруг учёта целый гейт: строгую проверку схемы в `tally.py` (ровно такие ключи, без bool в `verdict`, один `comment` не может встретиться в двух ветках), отдельный набор тестов на 76 строк, задачу в `vet.sh` и две записи в `.claude/rules/stack.md`.

Другой вариант: оставить только `tally.py`, который суммирует и падает на битом файле, без тестов и без задачи в vet. В `verdicts.md` уже написано запускать `tally.py --check` при каждой записи, так что битая строка ловится в момент, когда её пишут; vet — это вторая страховка. Плюс: около сотни строк кода и тестов меньше, и одной задачей в каждом прогоне vet меньше. Минус: строку, которую сессия записала, пропустив проверку, найдёт только следующий запуск `tally.py`, возможно уже при работе над статьёй.

— Claude Code · https://claude.ai/code/session_01DaohkFaopWx9kWFUWcJNRD

**@vzakharov (human)** — 2026-10-27T05:02:13Z

пусть остаётся

**@vzakharov (agent)** — 2026-10-27T05:38:02Z

Оставил как есть; предложение записано в учёт с оценкой 0 — 7020146.

---

<a id="t02"></a>

### `.claude/rules/content.md`:217 — unresolved

```diff
@@ -207,18 +209,25 @@ is read and counted like any paragraph. `remark-content-directives.ts` names the
… 2 lines elided …
 
+## Dashes
+
+**Every page the site serves writes a dash as a dash** — `—`, never `--`, in
+every language, its documents and the copy in `src/` alike. Two hyphens and
+straight quotes are for text pasted into a channel, `writing/CLAUDE.md` §
+"Voice".
```

**@vzakharov (agent)** — 2026-10-28T03:36:58Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**optional**

Ветка исходит из того, что правило «на сайте тире, а не `--`» удержится чтением: оно записано в `content.md` и на него ссылаются `lsa-voice.md` и `writing/CLAUDE.md`. Но на этой же ветке оно уже один раз не удержалось — страницы блога сначала вышли с `--`. А соседнее правило про кавычки держит не чтение, а `pnpm check:prose-quotes` в vet. Другой путь: научить ту же проверку (`scripts/check-prose-quotes.ts`, её `proseSpans` уже пропускают фронтматтер, код и HTML-комментарии) падать и на `--` в тексте. Сейчас по всем `apps/*/public/**/*.md` таких мест ноль — проверил, так что она пройдёт с первого запуска. Цена: строк десять в скрипте, тест рядом, и переименование проверки или её описания в `stack.md`, раз она теперь не только про кавычки. Строки в `src/` (переводы в `i18n`) она не покроет — там правило по-прежнему держится чтением.

— Claude Code · https://claude.ai/code/session_01DaohkDpBRoHfKRhLCUy7EY

**@vzakharov (human)** — 2026-10-28T03:46:04Z

давай-ка всё-таки помечать комменты от "пятипроцентника" не только скрыто -- а то я при прошлом заходе даже не понял, откуда коммент появился (хоть он был и к месту).

да, падать на `--` в статьях и наоборт на `—` в социалке -- хорошая идея.

---

## Timeline (status, references, and other events)

- **2026-10-26T07:31:35Z** @vzakharov renamed from «chore: /five-percent, a polish pass proposing alternatives from the review notes» to «chore: /five-percent, a review-notes polish pass that edits nothing».
- **2026-10-26T07:43:41Z** @vzakharov renamed from «chore: /five-percent, a review-notes polish pass that edits nothing» to «feat: a /five-percent polish pass, and an LSA blog that opens on it».
- **2026-10-26T11:28:37Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5651226375.
- **2026-10-26T11:38:18Z** @vzakharov renamed from «feat: a /five-percent polish pass, and an LSA blog that opens on it» to «feat: an LSA blog opening on the five-percent article, and /five-percent».
- **2026-10-26T14:55:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5654038492.
- **2026-10-27T03:09:05Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5661778733.
- **2026-10-27T05:27:12Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5662444728.
- **2026-10-27T05:40:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5662708879.
- **2026-10-27T06:31:40Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5662908947.
- **2026-10-27T06:37:43Z** @vzakharov cross-referenced this pull request from [#220 chore: show the agent rare words as it writes Vova's English](https://github.com/vzakharov/vovazakharov.com/pull/220).
- **2026-10-28T03:28:59Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5677442469.
- **2026-10-28T03:37:06Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5677494212.
