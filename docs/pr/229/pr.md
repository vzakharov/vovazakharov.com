# PR #229: chore: /five-percent proposals as a checked yes-or-no question

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/229
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/five-percent-comment-readability-afrpg0
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T17:38:33Z
- **Updated:** 2026-10-29T08:42:59Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `scripts/five-percent-proposal/check.py`:32 — unresolved — last: @vzakharov (human) 2026-10-29T08:42:59Z — "эта проверка вообще не нужна; проблема была не в том что упо…" → [↓](#t01)

---

## Body

## Summary

- **The operator could not read `/five-percent` proposals, let alone decide on them.** Each was one dense paragraph: it led with what the change took as given, buried the alternative after an arrow, and spoke in the plan's and the code's names (dominators, ΔQ, «Eaten so far», add/add, `segmentOrder`). A three-part template was already asked for on #227, and the very next pass on #228 ignored it.
- **A proposal now shows three lines**: a bold question a yes or a no answers, what the change does now, and what taking it costs, in the operator's nouns. The evidence goes in a `<details>` fold for the session that acts on the answer (`.claude/skills/five-percent/procedure.md` § "Posting").
- **`scripts/five-percent-proposal/check.py` holds that floor**, so it no longer rests on a template being read: the shape, a 60-word cap on the visible lines, and no code spans, paths, links or code-cased names in them. The pass runs it on every body before posting; `vet` runs its tests in the `five-percent` entry.
- **Backfilled:** the five proposals on #225, #227 and #228 that had no answer yet were rewritten in place into the new shape (same threads, same comment ids, so the verdict ledger is unaffected). Answered ones were left as they stood.

## QA Checklist

- [ ] `backfill-read` — open the five rewritten proposals ([#225 ui order](https://github.com/vzakharov/vovazakharov.com/pull/225#discussion_r4400513027), [#225 folder without code](https://github.com/vzakharov/vovazakharov.com/pull/225#discussion_r4400513964), [#227 signature hook](https://github.com/vzakharov/vovazakharov.com/pull/227#discussion_r4399907804), [#228 rule](https://github.com/vzakharov/vovazakharov.com/pull/228#discussion_r4399207940), [#228 clusters](https://github.com/vzakharov/vovazakharov.com/pull/228#discussion_r4399929174)): each is answerable with a yes or a no on one read, and «Подробнее» unfolds the evidence.
- [ ] `check-old` — `python3 scripts/five-percent-proposal/check.py` on any pre-change proposal body fails, naming what is wrong.
- [ ] `next-pass` — the next `/five-percent` run on any PR posts proposals in the new shape.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `backfill-read` | manual-only | — | whether a person can parse it is the point |
| `check-old` | unit | ✅ | `test_check.py` — a paragraph, jargon, an unlabelled line, past the cap, a doubled footer |
| `next-pass` | manual-only | — | a subagent's output on a live PR |

https://claude.ai/code/session_01DaohkDT4fvBDNrmuyRw9h3

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-28T17:38:56Z — "Proposed squash body: ``` The operator could not read /five-…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-28T17:38:56Z

[https://github.com/vzakharov/vovazakharov.com/pull/229#issuecomment-6476194635](https://github.com/vzakharov/vovazakharov.com/pull/229#issuecomment-6476194635)

Proposed squash body:

```
The operator could not read /five-percent's proposals, let alone decide
on them: each was one dense paragraph that opened on what the change
took as given, left the alternative after an arrow mid-way, and spoke in
the plan's and the code's names. A template asking for three parts had
already been ignored by the very next pass.

A proposal now shows three lines in the operator's nouns: a bold
question a yes or a no answers, what the change does now, and what
taking it costs. The evidence, with every file and function name, goes
in a <details> fold for the session that acts on the answer.

scripts/five-percent-proposal/check.py holds that floor rather than a
template being read: the shape, a 60-word cap on the visible lines and
no code spans, paths, links or code-cased names in them. The pass runs
it on each body before posting, and vet runs its tests.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-10-28T17:40:54Z_

[https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5687099722](https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5687099722)

**/five-percent**: два предложения, критических нет.

<!-- five-percent: 3f186d7bed73d90b30942cf748dec1ffbee4c5bf -->

_1 resolved thread omitted; re-run with `--include-resolved` to export it._

- **T01** `scripts/five-percent-proposal/check.py`:32 — unresolved — last: @vzakharov (human) 2026-10-29T08:42:59Z — "эта проверка вообще не нужна; проблема была не в том что упо…" → [↓](#t01)

<a id="t01"></a>

### `scripts/five-percent-proposal/check.py`:32 — unresolved

```diff
@@ -0,0 +1,81 @@
… 21 lines elided …
+FOOTER = ["---", "_Generated by [Claude Code](https://claude.ai/code)_"]
+VISIBLE_WORDS_MAX = 60
+
+# Names only the code or the plan gives a thing; the operator's own nouns pass.
+JARGON = {
+    "a code span": re.compile(r"`"),
+    "a link": re.compile(r"https?://"),
+    "a path": re.compile(r"\w/\w"),
+    "a camelCase name": re.compile(r"\b[a-z]+[A-Z]\w*"),
+    "a snake_case name": re.compile(r"\b[A-Za-z]+_[A-Za-z]\w*"),
+}
```

**@vzakharov (agent)** — 2026-10-28T17:40:40Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

**Отдавать три строки на суд читателю, не видевшему ни плана, ни правок, вместо списка шаблонов?**
Сейчас: проверка ловит только слова, похожие на код, и пропускает «ΔQ», «доминаторы» и «Eaten so far» — то, из-за чего #228 и было не прочесть.
Цена: лишний вызов агента на каждое предложение, и его вердикт — суждение, которое vet не прогонит.

<details><summary>Подробнее</summary>

Тело PR называет непонятными на #228 четыре вещи: dominators, ΔQ, «Eaten so far», add/add. Из них `JARGON` в `scripts/five-percent-proposal/check.py` ловит одну — `add/add`, и то регуляркой пути `\w/\w`. Проба на этой ветке — тело с вопросом «Считать ΔQ по поддеревьям доминаторов вместо замыканий?» и строкой «план в «Eaten so far» остановился на доминаторах» проходит с кодом 0.

Причина в том, кто пишет: процедура сама говорит, что имена плана и кода «come first to hand» тому, кто их только что читал. Тот же агент не увидит в них жаргона, а регулярка видит только форму слова (обратные кавычки, слэш, camelCase, snake_case), не то, знает ли его Вова.

Вариант: после `check.py` — субагент, которому дают только три строки (без плана, диффа и свёртки) и спрашивают, что предлагается и чем это грозит; если пересказ не сходится с намерением — переписать. `check.py` остаётся полом формы.

</details>

**@vzakharov (human)** — 2026-10-29T08:42:59Z

эта проверка вообще не нужна; проблема была не в том что упоминаются какие-то штуки из кода, это нормально, а что в принципе всё было написано трёхэтажно.

в текущем варианте (на примере этого коммента) НЕ нравится начало с вопроса. Зачем мне задают вопрос до того, как я пойму, в чём проблема?

---

## Timeline (status, references, and other events)

- **2026-10-28T17:38:58Z** @vzakharov renamed from «chore: /five-percent proposals open on a yes-or-no question, under a check» to «chore: /five-percent proposals as a checked yes-or-no question».
- **2026-10-28T17:40:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5687099722.
