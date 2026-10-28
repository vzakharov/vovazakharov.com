# Scoring an answered proposal

Every `/five-percent` proposal opens on a marker naming this file
(`@.claude/skills/five-percent/procedure.md` § "Posting" spells it, and says
what it is for). **A thread whose root carries it and whose tail is the
operator's is a verdict to record**, by the session answering that thread —
usually `/handle`'s review lane — whatever else the answer asks for. The record
is the only measure of whether a question distilled from seven weeks of reviews
catches anything, so a skipped row is a hole in it.

**The row goes in the branch's own file**,
`writing/notes/five-percent-verdicts/<branch>/verdicts.json`, the branch name
spelled as nested directories, so no two branches ever edit one file.
`scripts/five-percent-verdicts/tally.py`'s docstring is the shape; a file that
does not exist yet starts with the PR's number and an empty list.

- **`comment`** — the proposal's review-comment id (the number after
  `#discussion_r` in its link).
- **`about`** — what it proposed, at most 80 characters, in English.
- **`verdict`** — your reading of the operator's answer, 0 to 1: a bare "не" is
  0, "круто, давай" is 1, and the rest falls between by how much of the proposal
  they took and whether its frame was the right one. A proposal taken but
  faulted for stopping short of the real question scores low, since that is the
  frame this pass is for.

The operator coming back on the thread rewrites the row rather than adding one.
**The row rides in a commit the session makes anyway** — the one carrying the
work the answer asked for, or the next one where it asked for none — never in
one of its own, since the cost ledger's commits crowd the log enough. Run
`python3 scripts/five-percent-verdicts/tally.py --check` before it.
