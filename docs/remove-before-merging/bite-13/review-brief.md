# Bite 13 — the brief every reviewer shares

You review one part of bite 13 of the mushroom game (`src/pages/mushrooms/`,
`scripts/lib/`) on PR #57, as the operator would, with fresh eyes: you have
seen nothing of the build. Bite 13 is rain — a tap on a cloud starts a
shower; the sky darkens under a wash, drops fall and splash, flowers fold
into buds, caps swell, it hisses, and when it stops a rainbow stands
opposite the sun.

## What to read

- `CLAUDE.md` — the house rules a review holds the code to (files under ~450
  lines, types derived, comments stating the lasting contract, no silent
  error swallowing, validate at boundaries, no lint suppressions).
- `writing/notes/the-five-percent.md` — **the reading list**: what the
  operator looks at that an agent misses (the frame taken as given, an
  account standing in for running it, reasoning written into the artifact,
  the copy edited instead of the fact, the render checked against intent
  rather than the page). Read it whole; never edit it.
- `.claude/skills/megabeast/notes/quality.md` § "Review practice" and
  § "Finding classes" — what earlier reviews learned to look for. Read,
  never edit.
- `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far" (what
  each module is for) and `docs/plans/mushroom-game-syama/decisions.md`
  (the standing design: a six-year-old's hands, no text, juice, palette
  files hold every colour).
- `docs/plans/mushroom-game-syama/rain.md` — the contract — and
  `bite-13.md` beside it, its calls 1–15 and what the build settled. They
  are settled: a finding against a call says what a child sees go wrong,
  with evidence, rather than re-arguing it.
- `docs/plans/mushroom-game-syama/to-check.md` — what is already handed to
  the operator; don't re-raise it.

The diff: `git diff 2ef49b60..origin/claude/mushroom-game-syama-lbirv7 --
<your part's paths>`. Read it by file, not whole.

## Look at the game

The frames under `docs/remove-before-merging/frames/bite-13/` show the
build's state. `pnpm play:mushrooms --plays rain` plays a shower (read
`scripts/lib/play-rain.ts` for what it checks); a reviewer whose prompt says
to play runs it in a worktree of its own in the scratchpad the prompt names
(`git worktree add --detach <scratchpad>/wt-<name> origin/claude/mushroom-game-syama-lbirv7`,
then `pnpm install --offline --frozen-lockfile` there), under
`flock /home/user/vovazakharov.com/tmp/site.lock`, and removes the worktree
before reporting.

## What a finding is

A defect with a concrete failure: these inputs or this screen, this wrong
result, and why it matters to a six-year-old or to the next bite (after the
rain: insects shelter under caps, spores sprout — the plan's item 14). Rank
by that. Not a finding: style the linters own, taste, a call restated,
anything on `to-check.md`. Five strong findings beat fifteen thin ones. Mark
each `blocking` or `nit`.

Each finding carries: what fails, the evidence (a number from a run, a frame
name, or the quoted lines), whether you **measured** it or it is a
**hunch**, the file and the changed line that states the contract it breaks
(the line must be inside the diff's hunks:
`git diff -U0 2ef49b60..origin/claude/mushroom-game-syama-lbirv7 -- <file>`),
and an `Ask:` with a checkable property the fix's test can hold.

## Posting

**You post nothing on GitHub.** The orchestrator checks each finding and
posts one review. Never edit source; never touch the plan or the notes. A
frame you take may be committed to
`docs/remove-before-merging/frames/bite-13/review/` and pushed.

## Your context

You cannot see it. Report before you are long into the work — four checked
findings beat ten unchecked ones. Your final message is the report: the
findings in rank order, each in the form above, and any frame you committed.
