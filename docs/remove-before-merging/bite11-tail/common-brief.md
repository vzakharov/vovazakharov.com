COMMON BRIEF (every agent on bite 11's tail)

Repo /home/user/vovazakharov.com, branch claude/mushroom-game-syama-lbirv7 (PR #57), shared working tree — other agents may commit alongside you. Read CLAUDE.md first; it is binding (no lint suppressions — you can't ask, so fix the code; no module past ~450 lines; derive types; never swallow errors; comments state the lasting contract, never the change).

The work is Syama's mushroom game at `/mushrooms` (`src/pages/mushrooms/`). Bite 11 (the wider meadow, panned) is built and its review (5373085053) is fixed in code; this is its tail: `/polish`, vet, the five-screen play run, the frames. The plan: docs/plans/mushroom-game-syama.in-progress.md is the index; bite 11 is docs/plans/mushroom-game-syama/bite-11.md, and its "Decided at bite 11's review" bullets are rules, not questions to reopen — in particular a press taps on the press, and a pan begun on something taps it too (accepted).

Rules of work:

- Commit after every step that passes; push each commit (`git pull --no-rebase origin claude/mushroom-game-syama-lbirv7` then `git push origin HEAD` if rejected — merge, never rebase, never force). `git add` only your own paths; wait out an index.lock. Commit messages end with the two lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01UuJeXhkErjH7ZCown4ZshT
- You cannot see your own context size, so count steps: your brief names two or three; when they are done, stop. If told to wrap up, commit what passes and write a hand-over note to docs/remove-before-merging/bite11-tail/<your-name>.md (done with SHAs, left, decisions). The container can restart without warning: push every passing step.
- Never `git reset --hard`, `git checkout -- <path>`, `git restore`, or `git stash` — the tree is shared. A baseline comes from a throwaway `git worktree add` under the session scratchpad, removed after.
- Tests: `node --import tsx --test <file>` one file at a time; `fliers.test.ts` takes ~6 min. Type-check with `pnpm exec tsc --noEmit -p tsconfig.json` (the root project — the app tsconfig skips tests). Lint touched files with `pnpm exec eslint <files>`, prettier with `pnpm exec prettier --check <files>`. Scratch output under tmp/bite11-tail/<your-name>/, never a `*.test.ts` there (the suite's glob reaches tmp/). Anything that builds or serves the site runs under `flock tmp/bite11-tail/build.lock <command>`. Every Bash call is foreground (no run_in_background) with an explicit timeout up to 600000 ms.
- Do not post on GitHub, do not resolve threads. Do not touch writing/notes/the-five-percent.md. Do not edit the plan or its bite files; a plan line your work shows false goes in your report with the wording you propose.
- A fix must not break the game's standing invariants: the meadow only gets fuller, every tap selects what the finger is on, a drag from bare ground pans, doors stay ≥ 80% in sight, every control and picker stage finger-sized and apart.
- Report back in under 400 words: what you ran and its result (exit codes, failures with their first lines), commit SHAs (bare), anything a person looking at the screen would notice, and each place your work departs from a plan line.
