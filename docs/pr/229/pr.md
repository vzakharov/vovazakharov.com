# PR #229: chore: /five-percent proposals put the problem before the proposal

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/229
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/five-percent-comment-readability-afrpg0
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-28T17:38:33Z
- **Updated:** 2026-10-29T09:31:49Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 940e387). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `writing/notes/five-percent-verdicts/claude/five-percent-comment-readability-afrpg0/verdicts.json`:2 — unresolved — last: @vzakharov (human) 2026-10-29T09:29:41Z — "1- давай сюда записывать ещё и причины, как оператор принял/…" → [↓](#t01)
- **T02** `.claude/skills/five-percent/procedure.md`:107 — unresolved — last: @vzakharov (human) 2026-10-29T09:31:40Z — ""Сейчас:" писать необязательно, оно даёт какое-то ощущение с…" → [↓](#t02)

---

## Body

## Summary

- **The operator could not read `/five-percent` proposals, let alone decide on them.** Each was one dense paragraph: it led with what the change took as given, buried the alternative after an arrow, and stacked clause on clause. A three-part template was already asked for on #227, and the very next pass on #228 ignored it.
- **A proposal now shows three lines, each one plain sentence**: «Сейчас» (what the change does and what is wrong with that), then the bold «Предлагаю», then «Цена». The problem comes first, because a proposal read before its problem cannot be weighed. Naming files and functions is fine; burying the point under them is not. The evidence goes in a `<details>` fold for the session that acts on the answer (`.claude/skills/five-percent/procedure.md` § "Posting").
- **No check script.** An earlier commit here added `scripts/five-percent-proposal/check.py` to ban code names in the visible lines and enforce a question-first order; the operator's answer on this PR rejected both, so it is gone with its `vet` entry.
- **Backfilled:** the five proposals on #225, #227 and #228 that had no answer yet were rewritten in place (same threads, same comment ids, so the verdict ledger is unaffected). Answered ones were left as they stood.

## QA Checklist

- [ ] `backfill-read` — open the rewritten proposals ([#225 ui order](https://github.com/vzakharov/vovazakharov.com/pull/225#discussion_r4400513027), [#225 folder without code](https://github.com/vzakharov/vovazakharov.com/pull/225#discussion_r4400513964), [#227 signature hook](https://github.com/vzakharov/vovazakharov.com/pull/227#discussion_r4399907804), [#228 clusters](https://github.com/vzakharov/vovazakharov.com/pull/228#discussion_r4399929174)): each reads problem, proposal, cost on one pass, and «Подробнее» unfolds the evidence.
- [ ] `next-pass` — the next `/five-percent` run on any PR posts proposals in the new order, each line one plain sentence.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `backfill-read` | manual-only | — | whether a person can parse it is the point |
| `next-pass` | manual-only | — | a subagent's output on a live PR |

https://claude.ai/code/session_01DaohkBes2os7cMQ73eA76j

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
took as given, left the alternative after an arrow mid-way, and stacked
clause on clause. A template asking for three parts had already been
ignored by the very next pass.

A proposal now shows three lines, each one plain sentence: what the
change does and what is wrong with that, then the proposal in bold,
then what taking it costs. The problem comes first, since a proposal
read before its problem cannot be weighed. The evidence goes in a
<details> fold for the session that acts on the answer.

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

<a id="r02"></a>

### R02 — Review by @vzakharov (agent) — COMMENTED

_2026-10-29T08:49:18Z_

[https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5695020062](https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5695020062)

**/five-percent**: одно предложение, критических нет.

<!-- five-percent: 52f5b6ae790d96a313d1070ca0b3ab78b1ed5926 -->

_3 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `writing/notes/five-percent-verdicts/claude/five-percent-comment-readability-afrpg0/verdicts.json`:2 — unresolved — last: @vzakharov (human) 2026-10-29T09:29:41Z — "1- давай сюда записывать ещё и причины, как оператор принял/…" → [↓](#t01)
- **T02** `.claude/skills/five-percent/procedure.md`:107 — unresolved — last: @vzakharov (human) 2026-10-29T09:31:40Z — ""Сейчас:" писать необязательно, оно даёт какое-то ощущение с…" → [↓](#t02)

<a id="t01"></a>

### `writing/notes/five-percent-verdicts/claude/five-percent-comment-readability-afrpg0/verdicts.json`:2 — unresolved

```diff
@@ -0,0 +1,3 @@
+{"pr": 229, "verdicts": [
+  {"comment": 4404026987, "about": "Judge proposal lines by a cold-reader subagent, not jargon regexes", "verdict": 0.1}
```

**@vzakharov (human)** — 2026-10-29T09:29:41Z

1- давай сюда записывать ещё и причины, как оператор принял/отклонил
2- если оператор НИКАК не отреагировал (бывает, не до того) -- не записывать  вообще
3- при финалайзе нужно будет пройтись по уже записанным вердиктам (vet должен падать если нового поля нет)

---

<a id="t02"></a>

### `.claude/skills/five-percent/procedure.md`:107 — unresolved

```diff
@@ -96,31 +96,44 @@ body as text, no thread resolved — and two differences:
… 11 lines elided …
 **/five-percent** · optional
 
-<what the change took as given>
+<Now>: <what the change does, and what is wrong with that>
```

**@vzakharov (human)** — 2026-10-29T09:31:40Z

"Сейчас:" писать необязательно, оно даёт какое-то ощущение структурированности, а не просто общения. Просто описываешь как сейчас, почему этопроблема. "Предлагаю:" и "Цена:" с новых абзацев -- ок.

(на текущих комментариях -- тех которые правил в этой сессии -- можно задогфудить, да)

---

## Timeline (status, references, and other events)

- **2026-10-28T17:38:58Z** @vzakharov renamed from «chore: /five-percent proposals open on a yes-or-no question, under a check» to «chore: /five-percent proposals as a checked yes-or-no question».
- **2026-10-28T17:40:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5687099722.
- **2026-10-29T08:49:18Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5695020062.
- **2026-10-29T08:50:29Z** @vzakharov renamed from «chore: /five-percent proposals as a checked yes-or-no question» to «chore: /five-percent proposals put the problem before the proposal».
- **2026-10-29T08:57:28Z** @vzakharov cross-referenced this pull request from [#228 chore: sub-slices inside a slice under check:masd, on an acyclic src/](https://github.com/vzakharov/vovazakharov.com/pull/228).
- **2026-10-29T09:01:32Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/22a95adbe3cdc38ab4401ddb78df315aa97bc725.
- **2026-10-29T09:22:31Z** @vzakharov cross-referenced this pull request from [#231 feat(unsquatted): unsquatted.com, free domain names and a checker](https://github.com/vzakharov/vovazakharov.com/pull/231).
- **2026-10-29T09:31:49Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/229#pullrequestreview-5695501761.
