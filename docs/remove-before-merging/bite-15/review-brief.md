# Bite 15 — the brief every reviewer shares

You review one part of bite 15 of the mushroom game (`src/pages/mushrooms/`,
`scripts/lib/`) on PR #57, as the operator would, with fresh eyes: you have
seen nothing of the build. Bite 15 is the house's dwellers — a mouse runs
out of its door and in at another house's door when one is near enough to
be seen, else peeks and hides; a mouse is sized to its door; a tap on a
window brings a worm that crawls over the cap to another window of the same
house, or peeks and hides.

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
- `docs/plans/mushroom-game-syama/bite-15.md` — calls 1–25 and § "Built".
  They are settled: a finding against a call says what a child sees go
  wrong, with evidence, rather than re-arguing it.
- `docs/plans/mushroom-game-syama/to-check.md` — what is already handed to
  the operator; don't re-raise it.

The diff: `git diff 9096cfb8..origin/claude/mushroom-game-syama-lbirv7 --
<your part's paths>`. Read it by file, not whole.

## Look at the game

The frames under `docs/remove-before-merging/frames/bite-15/` show the
build's state. `pnpm play:mushrooms --plays runs` plays the mice's runs
(`scripts/lib/play-runs.ts`), `--plays meadow` the house with its worm
(`play-house.ts`, `play-worms.ts`). Play before judging the look: run it in
a worktree of your own in the scratchpad your prompt names
(`git -C /home/user/vovazakharov.com worktree add --detach <scratchpad>/wt-<name> origin/claude/mushroom-game-syama-lbirv7`,
then `pnpm install --offline --frozen-lockfile` there), under
`flock /home/user/vovazakharov.com/tmp/site.lock`, one or two `--screens`
per call, and remove the worktree before reporting. Read the frames it
leaves in `tmp/play/` yourself.

## What a finding is

A defect with a concrete failure: these inputs or this screen, this wrong
result, and why it matters to a six-year-old or to the next bite (the map,
then dusk with mice out on their runs). Rank by that. Not a finding: style
the linters own, taste, a call restated, anything on `to-check.md`. Five
strong findings beat fifteen thin ones. Mark each `blocking` or `nit`.

Each finding carries: what fails, the evidence (a number from a run, a frame
name, or the quoted lines), whether you **measured** it or it is a
**hunch**, the file and the changed line that states the contract it breaks
(the line must be inside the diff's hunks:
`git diff -U0 9096cfb8..origin/claude/mushroom-game-syama-lbirv7 -- <file>`),
and an `Ask:` with a checkable property the fix's test can hold.

## Posting

**You post nothing on GitHub.** The orchestrator checks each finding and
posts one review. Never edit source; never touch the plan or the notes. A
frame you take may be committed to
`docs/remove-before-merging/frames/bite-15/review/` and pushed.

## Your context

You cannot see it. Report before you are long into the work — four checked
findings beat ten unchecked ones. Your final message is the report: the
findings in rank order, each in the form above, and any frame you committed.
