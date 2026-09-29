COMMON BRIEF (every agent on this handling)

Repo /home/user/vovazakharov.com, branch claude/mushroom-game-syama-lbirv7 (PR #57), shared working tree — other agents may commit alongside you. Read CLAUDE.md first; it is binding (no lint suppressions without asking — you can't ask, so fix the code; no module past ~450 lines; derive types; never swallow errors; comments state the lasting contract, never the change).

You are handling part of review 5356809390 (an agent's loop review of bite 9 of Syama's mushroom game). The whole review with thread text: docs/pr/57/pr.md, anchors #t96 … #t107. The plan: docs/plans/mushroom-game-syama.in-progress.md — item 9 and its "Review 5356809390's calls" bullet are the decisions you build to; do not re-argue them.

Rules of work:
- Commit after every step that passes its own tests; push each commit (`git pull --no-rebase origin <branch>` then `git push origin HEAD` if rejected — merge, never rebase, never force). `git add` only your own paths; wait out an index.lock.
- Your first commit is due within ~60k tokens of work. If you judge you are past ~170k context, stop: commit what passes, and write a hand-over note to docs/remove-before-merging/handle-bite9/<your-group>.md (what is done with SHAs, what is left, decisions made); an unfinished change that does not type-check goes in as a `git apply`-able .patch beside the note, never as source. Never `git reset --hard`, never `git checkout -- .`; leave the tree as it is.
- Tests: `node --import tsx --test <file>` one file at a time (the whole suite at once exceeds the tool timeout). Type-check with `pnpm exec tsc --noEmit -p tsconfig.json` (root project). Lint the files you touched: `pnpm exec eslint <files>`. Prettier: `pnpm exec prettier --check <files>`.
- Do not post on GitHub, do not resolve threads. Do not touch writing/notes/the-five-percent.md.
- A constraint-tightening fix must not break the game's standing invariants: the meadow only gets fuller (nothing a child grew or a bee planted disappears on a turn/resize), every tap selects what the finger is on and nothing else, doors stay ≥ 80% in sight, the opening clump's rules in the plan. Sweep those too; if one breaks, fix it or say so as a defect, not a footnote.
- Report back in under 400 words: per thread (Txx) — commit SHA(s) and a one-to-two-sentence reply draft in English stating what changed (bare SHAs); then anything a person looking at the screen would notice; then any trade-off you made.
