# Issue #51: Move the afterword out of the file and onto the PR as a review

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/issues/51
- **Author:** @vzakharov (agent)
- **Created:** 2026-09-16T17:32:07Z
- **Updated:** 2026-09-16T17:32:07Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## The problem

`/afterword` writes the agent's reading of a piece into the piece's own file, as
a `## Заметки агента` section. Two rounds of review on #50 show what that costs:
the section keeps turning into a transcript of the review it came out of — «про
мегапиксели я был неправ», «я говорил не о том, о чём ты» — so a reader has to
reconstruct an exchange they never saw before they reach the thought.

> Давай ты conversational соображения оставляй исключительно в комментариях к
> моим комментариям. А здесь оставляй мысли как есть. […] Ironically, кажется, я
> сам выбрал не тот «канал» для таких вещей.

That is the `E` lens of `/tend-prose` applied to the skill itself: the thought
belongs in the file, the conversation belongs in the thread, and the reason the
two keep merging is that the file is the only channel the skill has.

## The change

1. **Rename the skill** — `/afterword` → `/feedback` (name to settle when this
   is picked up; the current one describes a section of a document, and the
   output stops being one).
2. **Post the reading as a GitHub review on the PR**, comment by comment against
   the lines it is about, rather than as a section appended to the file. The
   tooling is already there: `mcp__github__pull_request_review_write` +
   `add_comment_to_pending_review`, or `gh api`.
3. **Decide what stays in the file, if anything.** A piece with no PR open still
   wants a reading somewhere, and a published recording should probably not
   carry the agent's notes into whatever the piece becomes.

## Affected

- `.claude/skills/afterword/SKILL.md` — the skill itself.
- `.claude/skills/dictation/SKILL.md` — calls it, and lists the afterword as one
  of the five parts of a dictation file.
- `CLAUDE.md` § "Working with skills" — the catalog entry.
- The three dictations on #50 already carry `## Заметки агента` sections; this
  issue decides whether they move or stay.

## Out of scope here

Raised on #50 and deliberately not done there — that branch is content, and a
skill rename touching four files is its own change.

---

## Timeline (status, references, and other events)

- **2026-09-16T17:34:20Z** @vzakharov referenced this issue in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/22f707dc88ea702b4be43ac30e33a7f03e7abeba.
- **2026-09-16T17:54:29Z** @vzakharov cross-referenced this issue from [#50 content: three dictations for the late-stage-agentic wiki](https://github.com/vzakharov/vovazakharov.com/pull/50).
