---
description: The agent's own reading of a piece — a dictation, a draft, anything the operator wrote and wants answered rather than summarised — posted as a review on the PR that carries it, each block anchored to the lines it is about. Invoke as `/feedback <file> [<language>]`. Use when the operator asks what you think of something, says "а твой отклик?", "рефлексия", or asks for the agent's half of a two-voice piece.
---

End state of this skill: the PR carrying the piece has one review saying what you
would say if the operator asked what you thought — in the material's language,
the whole-piece blocks in the review body and the rest anchored to the passages
they are about. The file is untouched.

## What it is for

A reading goes where it can be answered. The operator replies to a block in the
thread it hangs off, their answer sits under the block rather than beside it, and
what the two of you settled is legible as an exchange because that is what it is.
`@.claude/skills/dictation/SKILL.md` names this skill for its transcripts.

**This is not `/code-review`.** That one hunts defects in a diff; this one reads
a piece — what it argues under what it says, where the argument is missing a
step. The two share three API calls and no judgement.

## The bar

What earns a block is open. What the piece argues under what it says, what it
takes for granted without saying, where the argument is missing a step, what is
said three times where once would carry it — those are the kind of thing, offered
to show the altitude rather than to be worked through as a list.

**This is the half that earns the review.** A summary of what was already read,
or a compliment, is the failure mode — agreeing is fine where something actually
lands, but a block that only agrees is praise wearing the shape of a response.

**What would be cut from a post is not what gets cut from the source.** A
digression carrying a third of a recording is still the recording. Say "in a post
I would cut this" and leave the text alone.

**Language is a parameter**, `/feedback <file> [<language>]`, defaulting to the
language the material is written in — the reading answers the piece, so it speaks
the piece's language rather than this file's.

## Where each block goes

**A block goes inline only where it points at a passage.** Most of what a reading
has to say is about the piece whole — its shape, what it assumes, the step it
skips — and a whole-piece thought forced onto a line is a false anchor: the
operator clicks it and lands on a sentence that is not what the block is about.
Those go in the **review body**, which is also where the reading is read first.

Two further reasons the body carries the weight:

- **Inline comments are read in the file's order, not yours.** GitHub sorts them
  by position. So anything whose sequence is doing work — an argument that builds,
  a ranking of what matters — belongs in the body, where your order survives.
- **An anchor needs a line in the diff.** A piece the branch adds is wholly in
  it, so anything in it can be anchored; a file the branch only partly changes
  can carry an anchor in the touched hunks alone, and a block about an untouched
  passage quotes it in the body instead.

## Posting it

One review, not a scatter of comments: the operator gets one notification and
reads the blocks in order. Three calls, in this order:

1. `mcp__github__pull_request_review_write` with `method: "create"` and **no**
   `event` — that opens a pending review rather than submitting an empty one.
2. `mcp__github__add_comment_to_pending_review` per anchored block —
   `subjectType: "LINE"`, `path`, `side: "RIGHT"`, `line`, and `startLine` for a
   range. (`subjectType: "FILE"` is the whole-file form, for a review spanning
   several files; with one piece under review the body is that home.)
3. `mcp__github__pull_request_review_write` with `method: "submit_pending"`,
   `event: "COMMENT"`, and the whole-piece reading as `body`.

`COMMENT`, always. A reading is not an approval and not a change request, and the
PR's approval state is not this skill's to move.

**The rest of the mechanics are `CLAUDE.md` § "GitHub comments"** — the
attribution footer on every comment, bare SHAs rather than backticked ones, a
body posted as text and not as a path, and, load-bearing here: **never resolve a
thread.** The blocks are the operator's to close as they answer them, and a
reading that resolves its own threads takes the list away from the person it was
written for.

## It needs a PR

No PR on the branch, no review. Say so and run `@.claude/skills/pr/SKILL.md`,
rather than putting the reading somewhere else — a second output shape is what
this skill had before, and a boundary between "thought" and "discussion" inside
one file had nothing holding it.

## Do NOT

- Write one for a file the operator did not ask about. An unrequested reading on
  their PR is the agent talking over their work.
- Edit the material to make a finding land. The finding is about the text as it
  stands.
