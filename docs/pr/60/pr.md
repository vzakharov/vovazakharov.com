# PR #60: docs: /afterword becomes /feedback, the reading onto the PR

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/60
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/afterword-channel-6sei96
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T12:08:09Z
- **Updated:** 2026-09-22T13:51:21Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **`/afterword` becomes `/feedback`, and the agent's reading of a piece is posted as a review on the PR carrying it** rather than written into the piece's own file. Whole-piece blocks go in the review body, inline comments only where a block points at a passage.
- **Why it is a format change and not a prose one.** Both rules that should have stopped the leak were already in force through three review rounds on #50: the skill's own "No account of how the afterword got here", and `CLAUDE.md` § "GitHub comments" requiring a reply on every comment pointed at. The cause is that the file was the skill's only channel, so a boundary between thought and discussion inside it had nothing holding it. One channel removes the boundary instead of restating it.
- **The durability argument the skill made is answered by tooling that postdates it.** `scripts/export-github-item.py` exports a PR's review threads with their reply chains and line anchors — which is how this branch read the instruction it is built on, the issue export having quoted it with the decisive paragraph behind an ellipsis. The argument goes out rather than getting rebutted in place.
- **Two constraints the move adds, and the skill states both.** Inline comments are sorted by file position, so an argument whose order is doing work belongs in the review body; and an anchor needs a line in the diff, so a block about a passage the branch did not touch quotes it in the body instead.
- **`/dictation` stops carrying the reading as a part of the transcript file** and names `/feedback` among the things that happen to an agreed transcript later. The late-stage-agentic plan keeps the human half of the two-voice post format and files the second voice as open: every reading so far is feedback for the operator, and what a stranger reading the post is owed is a different question.
- **The six `## Заметки агента` sections that merged with #50 stay.** They are in the state the operator took, #50 is merged so there is no open PR to re-post them onto, and deleting reviewed content from `main` is not what a rename is for.

## QA Checklist

- [ ] `rename` — `/feedback` loads by name and nothing still points at `afterword`: `scripts/check-skill-catalog.sh` passes
- [ ] `review-posted` — invoke `/feedback` on a file on an open PR; one review appears, whole-piece blocks in its body and line-anchored comments only where a block points at a passage
- [ ] `language` — the same run on a Russian dictation writes the review in Russian
- [ ] `no-pr` — on a branch with no PR the skill stops and names `/pr`, rather than falling back to a file section
- [ ] `threads-open` — the run resolves no thread, submits as `COMMENT` rather than an approval, and every comment carries the attribution footer
- [ ] `dictation-clean` — read `/dictation` end to end: the parts table and Step 5 no longer name the afterword, and § "What happens after" names `/feedback` beside `/subtitles` and `/dictation-to-post`
- [ ] `post-format` — `writing/late-stage-agentic/plan.md` § "Post format" keeps the human half and the second voice is an open question at the foot
- [ ] `sections-intact` — the six `## Заметки агента` sections that merged with #50 are untouched

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `rename` | integration | ✅ | `scripts/check-skill-catalog.sh` assertion 1, in the vet run |
| `review-posted` | manual-only | — | Whether a reading earns its comment, and whether it hangs off the right line, is the operator's call — dogfooded on this PR |
| `language` | manual-only | — | Judged by reading the review |
| `no-pr` | manual-only | — | A refusal an agent has to actually hit; nothing asserts a skill's own control flow |
| `threads-open` | manual-only | — | Observable only on a real PR after a real run |
| `dictation-clean` | manual-only | — | Prose review: no surviving reference, and no polar bear left denying the old format |
| `post-format` | manual-only | — | Prose review against the second voice being filed as open rather than specified |
| `sections-intact` | unit | ✅ | `git diff origin/main -- writing/` is empty for those files |

Closes #51

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_016vrrbpUFuc1BYDXCwJsk8b

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T12:08:51Z — "Proposed squash title/body: ``` docs: #51 the agent's readin…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T12:08:51Z

[https://github.com/vzakharov/vovazakharov.com/pull/60#issuecomment-5714095175](https://github.com/vzakharov/vovazakharov.com/pull/60#issuecomment-5714095175)

Proposed squash title/body:

```
docs: #51 the agent's reading moves onto the PR as a review (pr #60)
```

```
The afterword kept arriving as a transcript of the review it came out
of — «про мегапиксели я был неправ» — so a reader had to reconstruct an
exchange they never saw before reaching the thought. Both rules that
forbade that were already in force through three rounds on #50: the
skill's own "no account of how the afterword got here", and CLAUDE.md's
requirement of a reply on every comment pointed at. The cause was not a
missing rule but a single channel — a boundary between thought and
discussion inside one file has nothing holding it.

So `/afterword` becomes `/feedback` and posts the reading as a review on
the PR: whole-piece blocks in the review body, inline comments only
where a block points at a passage. Two properties of the new channel are
stated with it — inline comments sort by file position, so an argument
whose order does work belongs in the body, and an anchor needs a line in
the diff. The bar for what earns a block survives unchanged; what goes
is the durability argument, answered by the PR exporter that carries
review threads with their line anchors, along with the two rules that
were compensating for the one channel. Posting ends the skill — the
blocks are the operator's to answer, and what they answer comes back
through `/handle`.

`/dictation` stops carrying the reading as a part of the transcript file
and names `/feedback` beside `/subtitles` and `/dictation-to-post`, the
other two things that happen to an agreed transcript later. The
late-stage-agentic plan keeps the human half of the two-voice post
format and files the second voice as open: every reading so far is
feedback for the operator, and what a stranger reading the post is owed
is a different question. The six `## Заметки агента` sections that
merged with #50 stay as the operator took them.

Closes #51

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

### Review by @vzakharov (agent) — COMMENTED

_2026-09-22T12:36:57Z_

A reading of `.claude/skills/feedback/SKILL.md` at 2ecfac7 — the skill run against itself, which is the dogfood. Three blocks here are about the skill whole; three more are anchored to the lines they are about. In English because the material is, which is itself the third block.

**The loop has no end, and the skill doesn't say so.** It specifies how a reading is posted and stops there. In the old format the other half was covered by accident: the reading lived in the file, so an answer was folded back into it and the file's last state *was* the settled reading. Here the answer lands in a thread and the skill says neither that the agent replies to it nor that anything folds. `CLAUDE.md` § "GitHub comments" covers the case where you point me at a comment; it does not cover a block you answered in passing while the session that wrote it was gone. The honest description of the new format is that the reading is posted and then owned by you — which may be exactly right, since it was always your reading to close, but it is the half the file leaves unsaid.

**Nothing says how big a reading should be.** The old end state carried "short enough that every block in it earns its place" and this one dropped it; the only sizing signal left is an aside about "an eight-block review" down in the mechanics, which reads as a norm rather than an example. A skill that specifies placement to the line and says nothing about length will drift long, and the new channel pushes that way — an inline comment costs nothing to add, which is a pressure the file format did not have.

**The language rule collides with `CLAUDE.md` § "Language", in exactly the case this review is standing in.** The skill says the reading speaks the piece's language. `CLAUDE.md` files PR comments and review replies under "conversation — the language it was asked in". You asked in Russian; the piece is an English skill file; the two rules disagree and this review is in English on the skill's authority. For a dictation they agree and the collision is invisible — it is live for every skill, plan and rule in this repo, which are English by the same section's ruling while the asking is usually not.

- **T01** `.claude/skills/feedback/SKILL.md`:61 — resolved — last: @vzakharov (agent) 2026-09-22T12:38:01Z — "Fixed in 76d3a7a — the sentence now keeps the half that surv…" → [↓](#t01)
- **T02** `.claude/skills/feedback/SKILL.md`:38 — resolved — last: @vzakharov (agent) 2026-09-22T12:38:02Z — "Moved in 76d3a7a — it now sits directly under the end state,…" → [↓](#t02)
- **T03** `.claude/skills/feedback/SKILL.md`:19 — resolved — last: @vzakharov (agent) 2026-09-22T12:38:03Z — "Cut in 76d3a7a. The sentence before it does the separating,…" → [↓](#t03)
- **T04** `.claude/skills/dictation/SKILL.md`:281 — unresolved — last: @vzakharov (human) 2026-09-22T13:47:33Z — "медведь?" → [↓](#t04)
- **T05** `.claude/skills/feedback/SKILL.md`:78 — unresolved — last: @vzakharov (human) 2026-09-22T13:50:11Z — "SHA сюда не относятся, агент не делает коммитов" → [↓](#t05)
- **T06** `.claude/skills/feedback/SKILL.md`:62 — unresolved — last: @vzakharov (human) 2026-09-22T13:50:30Z — "не очень понимаю что эта строчка говорит" → [↓](#t06)

<a id="t01"></a>

### `.claude/skills/feedback/SKILL.md`:61 — resolved

```diff
@@ -0,0 +1,92 @@
… 56 lines elided …
+
+## Posting it
+
+One review, not a scatter of comments: the operator gets one notification and
+reads the blocks in order. Three calls, in this order:
```

**@vzakharov (agent)** — 2026-09-22T12:36:29Z

"Reads the blocks in order" is the one thing a review cannot promise, and this file says so itself eleven lines further down: GitHub sorts inline comments by file position, so the only blocks that arrive in the order they were written are the ones in the body.

The sentence is the old format's promise carried across — a section at the foot of a file did read top to bottom. What survives the move is the first half: one review means one notification instead of five.

**@vzakharov (agent)** — 2026-09-22T12:38:01Z

Fixed in 76d3a7a — the sentence now keeps the half that survives the move and states the half that doesn't: five comments are five notifications, and the body is the only part that arrives in the order it was written.

---

<a id="t02"></a>

### `.claude/skills/feedback/SKILL.md`:38 — resolved

```diff
@@ -0,0 +1,92 @@
… 32 lines elided …
+digression carrying a third of a recording is still the recording. Say "in a post
+I would cut this" and leave the text alone.
+
+**Language is a parameter**, `/feedback <file> [<language>]`, defaulting to the
+language the material is written in — the reading answers the piece, so it speaks
+the piece's language rather than this file's.
```

**@vzakharov (agent)** — 2026-09-22T12:36:37Z

This sits under "The bar", which is the section about what a block has to do to earn its place. Which language the review is written in is not a bar — it is invocation, and it reads here as though a reading in the wrong language were a weak reading rather than a mis-called one.

It came from the old skill's § "The section", where it was next to the heading name and had company. Here it has none, which is the tell.

**@vzakharov (agent)** — 2026-09-22T12:38:02Z

Moved in 76d3a7a — it now sits directly under the end state, as invocation beside the other invocation, and "The bar" is only about what a block has to do to earn its place.

---

<a id="t03"></a>

### `.claude/skills/feedback/SKILL.md`:19 — resolved

```diff
@@ -0,0 +1,92 @@
… 15 lines elided …
+
+**This is not `/code-review`.** That one hunts defects in a diff; this one reads
+a piece — what it argues under what it says, where the argument is missing a
+step. The two share three API calls and no judgement.
```

**@vzakharov (agent)** — 2026-09-22T12:36:43Z

This is the plan's DRY note wearing a skill's clothes: it is addressed to whoever might one day merge the two skills, not to the agent about to write a reading. The sentence before it already does the separating, and an agent that has read it is not wondering about the API surface.

It is also the line most likely to go quietly false — either skill's mechanics can change without anyone counting the calls again.

**@vzakharov (agent)** — 2026-09-22T12:38:03Z

Cut in 76d3a7a. The sentence before it does the separating, and the DRY note has its home in the plan, which `/finalize` sweeps.

---

<a id="t04"></a>

### `.claude/skills/dictation/SKILL.md`:281 — unresolved

```diff
@@ -281,8 +275,10 @@ Each one gets its link as the file is written, under the rule
… 2 lines elided …
 never on a fresh call. Turning a recording into something written for a reader
-is `@.claude/skills/dictation-to-post/SKILL.md`. Neither is this skill's work,
-and neither starts until the operator has agreed the transcript.
+is `@.claude/skills/dictation-to-post/SKILL.md`. Saying what you make of what
+they said is `@.claude/skills/feedback/SKILL.md`, which posts it as a review on
+the PR the transcript arrives on. None is this skill's work, and none starts
+until the operator has agreed the transcript.
```

**@vzakharov (human)** — 2026-09-22T13:47:33Z

медведь?

---

<a id="t05"></a>

### `.claude/skills/feedback/SKILL.md`:78 — unresolved

```diff
@@ -0,0 +1,106 @@
… 74 lines elided …
+PR's approval state is not this skill's to move.
+
+**The rest of the mechanics are `CLAUDE.md` § "GitHub comments"** — the
+attribution footer on every comment, bare SHAs rather than backticked ones, a
```

**@vzakharov (human)** — 2026-09-22T13:50:11Z

SHA сюда не относятся, агент не делает коммитов

---

<a id="t06"></a>

### `.claude/skills/feedback/SKILL.md`:62 — unresolved

```diff
@@ -0,0 +1,106 @@
… 58 lines elided …
+## Posting it
+
+One review, not a scatter of comments — five comments are five notifications,
+and the body is the only part that arrives in the order you wrote it. Three
```

**@vzakharov (human)** — 2026-09-22T13:50:30Z

не очень понимаю что эта строчка говорит

---

## Timeline (status, references, and other events)

- **2026-09-22T12:34:03Z** @vzakharov renamed from «docs: plan /afterword → /feedback, the reading onto the PR» to «docs: /afterword becomes /feedback, the reading onto the PR».
- **2026-09-22T12:36:57Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/60#pullrequestreview-5278106001.
- **2026-09-22T13:51:20Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/60#pullrequestreview-5278954710.
