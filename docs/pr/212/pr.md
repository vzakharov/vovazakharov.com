# PR #212: feat: a /five-percent polish pass, and an LSA blog that opens on it

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/212
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/five-percent-qryluk
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T07:31:16Z
- **Updated:** 2026-10-26T11:28:38Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/remove-before-merging/squash-message.md`:10 — unresolved — last: @vzakharov (human) 2026-10-26T11:25:00Z — "то есть не тот же который делает предыдущие шаги polish? есл…" → [↓](#t01)
- **T02** `docs/plans/five-percent.draft.do-not-implement.md`:39 — unresolved — last: @vzakharov (human) 2026-10-26T11:27:24Z — "не уверен что на review body как-то можно вообще отвечать, т…" → [↓](#t02)
- **T03** `docs/plans/five-percent.draft.do-not-implement.md`:41 — unresolved — last: @vzakharov (human) 2026-10-26T11:27:48Z — "нужны какие-то короткие/хлёсткие имена для каждой линзы, что…" → [↓](#t03)
- **T04** `docs/plans/five-percent.draft.do-not-implement.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T11:28:34Z — "я думаю ещё до выполнения нужно разобрать что там за lenses…" → [↓](#t04)

---

## Body

## Summary

- **Plan only, for review** — `docs/plans/five-percent.draft.do-not-implement.md`. Nothing is implemented until the go-ahead.
- `writing/notes/the-five-percent.md` has enough in it for conclusions: 214 bumps over fourteen learnings, 42% of them on one ("What it was handed, it treats as fixed").
- **`/five-percent`**, a read-only third `/polish` pass: it puts the learnings to a branch's diff as lenses and posts at most three alternatives as one PR review anchored to the lines, each graded critical or optional — no edits, no commits. Its floor is a marker in its own review; planless `/go` runs it after `/pr`; `/finalize and merge` stops only on a critical one its own run posted. The mandatory notes entry leaves `CLAUDE.md`.
- **A bilingual blog on latestageagentic.com**, on the pattern Майя's site set in #208, opening with the five-percent article: Russian original, English translation, a measurement with its deflating half kept in. vovazakharov.com's `/writing` points at it. The notes retire with it.
- #187 (the six music posts) is not this blog's: they are Vova's rather than the agency's, and stay for a vovazakharov.com blog.

## QA Checklist

- [ ] `pass-posts` — on a test PR, `/five-percent` posts one `COMMENT` review of at most three proposals: each names its lens, carries a grade and a concrete alternative, anchored where it points at lines, and the body ends with the `five-percent` head-SHA marker
- [ ] `no-edits` — after the pass, `git status` is clean and no new commit sits on the branch
- [ ] `empty-run` — on a diff that triggers no lens, no review is posted and the report says so
- [ ] `floor` — a second run after one new commit reviews only that commit's diff
- [ ] `no-pr` — `/polish` on a branch with no PR reports the pass as deferred; planless `/go` runs it after `/pr`
- [ ] `finalize-stop` — `/finalize and merge` stops on a critical proposal its own polish posted, and merges past optional ones
- [ ] `claude-md` — the staged `CLAUDE.md` no longer asks for a notes entry after a review session
- [ ] `lsa-blog` — on the LSA preview, the home page lists the blog in English, `/ru` in Russian, and the switch moves between them
- [ ] `article` — `/blog/the-five-percent` and `/blog/the-five-percent/ru` render, each with its feed entry and social card
- [ ] `writing-card` — vovazakharov.com/writing carries a card linking to the article

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `pass-posts` | manual-only | — | An agent's judgement posted to GitHub; read the review |
| `no-edits` | manual-only | — | Inspect the tree after a live run |
| `empty-run` | manual-only | — | Needs a live run on a trivial diff |
| `floor` | manual-only | — | Needs two live runs on one PR |
| `no-pr` | manual-only | — | Skill wiring, observed in a run |
| `finalize-stop` | manual-only | — | Skill wiring, observed in a run |
| `claude-md` | manual-only | — | Read the staged copy's diff |
| `lsa-blog` | e2e | — | Build `lsa`, assert both locale homes list the post |
| `article` | e2e | — | Build `lsa`, assert both article pages and feeds exist |
| `writing-card` | e2e | — | Build `vova`, assert the link on /writing |

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

/five-percent is a third /polish pass, after /dry and /tend-prose. A
fresh subagent puts each learning to the branch's diff as a lens and
posts at most three alternatives as one COMMENT review on the PR,
anchored to the lines they concern, each naming its lens and graded
critical or optional. It edits and commits nothing; an answered
proposal becomes work through /handle. Its floor is a head-SHA marker
in its own last review. Planless /go runs it after /pr, and /finalize
and merge stops on a critical proposal its own run posted.

latestageagentic.com gets a blog, bilingual as Майя's is: English at
the bare address, Russian under /ru. It opens with the five-percent
article, a measurement written in Russian and translated, its
deflating half kept in. vovazakharov.com's /writing points at it.

The notes retire with the article, and the mandatory entry after a
review session leaves CLAUDE.md.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:10 — unresolved — last: @vzakharov (human) 2026-10-26T11:25:00Z — "то есть не тот же который делает предыдущие шаги polish? есл…" → [↓](#t01)
- **T02** `docs/plans/five-percent.draft.do-not-implement.md`:39 — unresolved — last: @vzakharov (human) 2026-10-26T11:27:24Z — "не уверен что на review body как-то можно вообще отвечать, т…" → [↓](#t02)
- **T03** `docs/plans/five-percent.draft.do-not-implement.md`:41 — unresolved — last: @vzakharov (human) 2026-10-26T11:27:48Z — "нужны какие-то короткие/хлёсткие имена для каждой линзы, что…" → [↓](#t03)
- **T04** `docs/plans/five-percent.draft.do-not-implement.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T11:28:34Z — "я думаю ещё до выполнения нужно разобрать что там за lenses…" → [↓](#t04)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:10 — unresolved

```diff
@@ -0,0 +1,31 @@
… 5 lines elided …
+it. That is enough to put them to work before review, and to write
+them up.
+
+/five-percent is a third /polish pass, after /dry and /tend-prose. A
+fresh subagent puts each learning to the branch's diff as a lens and
```

**@vzakharov (human)** — 2026-10-26T11:25:00Z

то есть не тот же который делает предыдущие шаги polish? если так, то почему?

---

<a id="t02"></a>

### `docs/plans/five-percent.draft.do-not-implement.md`:39 — unresolved

```diff
@@ -0,0 +1,202 @@
… 34 lines elided …
+- **A proposal is an alternative approach**, concrete enough to pick: what the
+  change took as given, the other way to do it, and what that way costs.
+  "Consider whether…" is not one.
+- **Inline where it points at lines**, in the review body where it is about the
+  change whole — `/feedback`'s placement rule, for `/feedback`'s reasons.
```

**@vzakharov (human)** — 2026-10-26T11:27:24Z

не уверен что на review body как-то можно вообще отвечать, так что лучше всё-таки цеплять если не к строкам то хотя бы к конкретным файлам. Не обязательно чтобы было строгое равенство между тем о чём коммент и к кому он привязан

---

<a id="t03"></a>

### `docs/plans/five-percent.draft.do-not-implement.md`:41 — unresolved

```diff
@@ -0,0 +1,202 @@
… 36 lines elided …
+  "Consider whether…" is not one.
+- **Inline where it points at lines**, in the review body where it is about the
+  change whole — `/feedback`'s placement rule, for `/feedback`'s reasons.
+- **Each proposal names its lens**, so the operator's reply also tells the
+  catalogue which lenses earn their keep.
```

**@vzakharov (human)** — 2026-10-26T11:27:48Z

нужны какие-то короткие/хлёсткие имена для каждой линзы, чтобы легко было обращаться.

---

<a id="t04"></a>

### `docs/plans/five-percent.draft.do-not-implement.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T11:28:34Z

я думаю ещё до выполнения нужно разобрать что там за lenses и к чему они например будут применяться, хотя бы вкратце

---

## Timeline (status, references, and other events)

- **2026-10-26T07:31:35Z** @vzakharov renamed from «chore: /five-percent, a polish pass proposing alternatives from the review notes» to «chore: /five-percent, a review-notes polish pass that edits nothing».
- **2026-10-26T07:43:41Z** @vzakharov renamed from «chore: /five-percent, a review-notes polish pass that edits nothing» to «feat: a /five-percent polish pass, and an LSA blog that opens on it».
- **2026-10-26T11:28:37Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/212#pullrequestreview-5651226375.
