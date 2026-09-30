COMMON BRIEF (every agent on this handling)

Repo /home/user/vovazakharov.com, branch claude/mushroom-game-syama-lbirv7 (PR #57), shared working tree — other agents commit alongside you. Read CLAUDE.md first; it is binding (no lint suppressions — you can't ask, so fix the code; no module past ~450 lines; derive types; never swallow errors; comments state the lasting contract, never the change).

You are handling part of review 5360733525 (an agent's loop review of bite 10 of Syama's mushroom game — the flowers as an instrument, the child planting them). The whole review with thread text: docs/pr/57/pr.md, anchors #t108 … #t119. The plan: docs/plans/mushroom-game-syama.in-progress.md — item 10 (under `## Eaten so far`) is the bite; its claims are yours to make true, or to restate where the review shows them false. The review's asks are the target: meet each one, or say precisely why not.

Rules of work:

- Commit after every step that passes its own tests; push each commit (`git pull --no-rebase origin claude/mushroom-game-syama-lbirv7` then `git push origin HEAD` if rejected — merge, never rebase, never force). `git add` only your own paths; wait out an index.lock. Commit messages end with the two lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01XyW49KwhrenZGUGVG5bxT7
- Your first commit is due within ~60k tokens of work. If you judge you are past ~170k context, stop: commit what passes, and write a hand-over note to docs/remove-before-merging/handle-bite10/<your-group>.md (what is done with SHAs, what is left, decisions made); an unfinished change that does not type-check goes in as a `git apply`-able .patch beside the note, never as source. Never `git reset --hard`, never `git checkout -- .`, never `git stash`; leave the tree as it is.
- Tests: `node --import tsx --test <file>` one file at a time (the whole suite at once exceeds the tool timeout). Type-check with `pnpm exec tsc --noEmit -p tsconfig.json`. Lint the files you touched: `pnpm exec eslint <files>`. Prettier: `pnpm exec prettier --check <files>`. Scratch output (sweeps, renders) goes under tmp/handle-bite10/<your-group>/.
- A property the review measured by sweep gets a test that holds it — seeds the review names included — and the test is checked to fail against the old code (mutation or revert) before you trust it.
- Do not post on GitHub, do not resolve threads. Do not touch writing/notes/the-five-percent.md. Do not edit the plan file except the lines your threads name as wrong; say in your report which lines you changed.
- A constraint-tightening fix must not break the game's standing invariants: the meadow only gets fuller (nothing a child grew or a bee planted disappears on a turn/resize), every tap selects what the finger is on and nothing else, doors stay ≥ 80% in sight, the opening clump's rules in the plan, every picker stage finger-sized and apart. Sweep those too; if one breaks, fix it or say so as a defect, not a footnote.
- Report back in under 400 words: per thread (Txx) — commit SHA(s) and a one-to-two-sentence reply draft in English stating what changed (bare SHAs, no backticks around them); then anything a person looking at the screen would notice; then any trade-off you made.
