COMMON BRIEF (every agent on bite 10)

Repo /home/user/vovazakharov.com, branch claude/mushroom-game-syama-lbirv7 (PR #57), shared working tree — other agents may commit alongside you. Read CLAUDE.md first; it is binding (no lint suppressions — you can't ask, so fix the code; no module past ~450 lines, split at natural seams; derive types from the source of truth; never swallow errors; comments state the lasting contract, never the change).

You are building part of bite 10 of Syama's mushroom game (src/pages/mushrooms/). The plan: docs/plans/mushroom-game-syama.in-progress.md — `## This bite` is what you build to, `## Decisions the whole game carries` and `## Eaten so far` are the game as it stands; do not re-argue them. Nobody can be asked anything: where the plan leaves a fork open, pick the option that best serves a six-year-old on a phone, and state the decision in your report so it can go into the plan.

Rules of work:

- Commit after every step that passes its own tests; push each commit (`git pull --no-rebase origin claude/mushroom-game-syama-lbirv7` then `git push origin HEAD` if rejected — merge, never rebase, never force). `git add` only your own paths; wait out an index.lock. Conventional subjects scoped `(mushrooms)`, descriptive bodies, ending with the two lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_019GUASJxfNC34B8pEHDpVbB
- Your first commit is due within ~60k tokens of work. If you judge you are past ~170k context, stop: commit what passes, and write a hand-over note to docs/remove-before-merging/bite10/<your-group>.md (what is done with SHAs, what is left, decisions made); an unfinished change that does not type-check goes in as a `git apply`-able .patch beside the note, never as source. Never `git reset --hard`, never `git checkout -- .`; leave the tree as it is.
- Tests: `node --import tsx --test <file>` one file at a time (the whole suite at once exceeds the tool timeout). New behaviour that is a pure function gets a test beside its module. Type-check with `pnpm exec tsc --noEmit -p tsconfig.json`. Lint what you touched: `pnpm exec eslint <files>`. Prettier: `pnpm exec prettier --check <files>`. Don't run vet.sh.
- To look at the game: `NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova` (one foreground call, long timeout), then `pnpm play:mushrooms --no-build` (another). Read scripts/play-mushrooms.ts for what it shoots and where (tmp/play/). `pnpm sweep:mushrooms` runs the 2000-visit sweep. Look at frames you shoot before judging the look.
- Do not post on GitHub. Do not touch writing/notes/the-five-percent.md, the plan file, or .claude/.
- The game's standing invariants must hold after your change: the meadow only gets fuller (nothing a child grew or a bee planted disappears on a turn/resize), every tap selects what the finger is on and nothing else, doors stay ≥ 80% in sight, the opening clump's rules in the plan. If one breaks, fix it or report it as a defect, not a footnote.
- Report back in under 400 words: what you built, with commit SHAs; decisions you made that the plan should record, each with the alternative it beat; anything a person looking at the screen would notice; anything left undone.
