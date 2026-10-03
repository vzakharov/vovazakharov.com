# Bite 12b — the brief every reviewer shares

You review one part of bite 12b of the mushroom game (`src/pages/mushrooms/`,
`scripts/lib/`) on PR #57, as the operator would, with fresh eyes: you have
seen nothing of the build. Bite 12b is "the endless field" — the glade rim
gone, stored positions as plane points, the lawn laid by plane cells, light
turning with the heading, insects living on the plane, caps per area, and a
far mushroom drawn with fewer chords.

## What to read

- `CLAUDE.md` — the house rules a review holds the code to (files under ~450
  lines, types derived, comments stating the lasting contract, no silent
  error swallowing, validate at boundaries, no lint suppressions).
- `writing/notes/the-five-percent.md` — **the reading list**: what the
  operator looks at that an agent misses (the frame taken as given, an
  account standing in for running it, reasoning written into the artifact,
  the copy edited instead of the fact, the render checked against intent
  rather than the page). Read it whole; never edit it.
- `.claude/skills/megabeast/notes/quality.md` § "Review practice", § "Sweeps
  and the tests they become" and § "Finding classes" — what earlier reviews
  learned to look for. Read, never edit.
- `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far" (what each
  module is for) and `docs/plans/mushroom-game-syama/decisions.md` (the
  standing design: a six-year-old's hands, no text, juice, palette files
  hold every colour).
- `docs/plans/mushroom-game-syama/bite-12b.md` — the bite's calls and what
  the build settled; `endless-field.md` beside it is the contract. They are
  settled: a finding against a call says what a child sees go wrong, with
  evidence, rather than re-arguing it.
- `docs/plans/mushroom-game-syama/to-check.md` — what is already handed to
  the operator; don't re-raise it.

The diff: `git diff a8d2aff..origin/claude/mushroom-game-syama-lbirv7 --
<your part's paths>`. Read it by file, not whole.

## Look at the game

The frames under `docs/remove-before-merging/frames/bite-12b/` show the
tail's last state. Only the player plays; a reader who needs a frame asks
for it in the report.

## What a finding is

A defect with a concrete failure: these inputs or this screen, this wrong
result, and why it matters to a six-year-old or to the next bite (rain,
`docs/plans/mushroom-game-syama/rain.md`). Rank by that. Not a finding:
style the linters own, taste, a call restated, anything on `to-check.md`.
Five strong findings beat fifteen thin ones. Mark each `blocking` or `nit`.

Each finding carries: what fails, the evidence (a number from a run or a
sweep, a frame name, or the quoted lines), whether you **measured** it or it
is a **hunch**, the file and the changed line that states the contract it
breaks (the line must be inside the diff's hunks:
`git diff -U0 a8d2aff..HEAD -- <file>`), and an `Ask:` with a checkable
property the fix's test can hold.

## Posting

**You post nothing on GitHub.** The orchestrator checks each finding and
posts one review. Never edit source; never touch the plan or the notes.

## Your context

You cannot see it. Report before you are long into the work — four checked
findings beat ten unchecked ones. Your final message is the report: the
findings in rank order, each in the form above, and any frame you committed.
