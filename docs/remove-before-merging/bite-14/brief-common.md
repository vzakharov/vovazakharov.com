# Bite 14 — the brief every agent shares

You work on one package of bite 14 of the mushroom game
(`src/pages/mushrooms/`): after the rain. While it rains, insects shelter
under the nearest cap; when it stops, spores an old mushroom shed sprout into
little mushrooms that grow over the next minutes. The contract is the plan's
`## This bite` (`docs/plans/mushroom-game-syama.in-progress.md`) and
`docs/plans/mushroom-game-syama/bite-14.md` once it exists — the calls there
are made: build them, don't reopen them. Where one cannot hold as written,
stop and report which and why, with the options measured, rather than
picking another. Read, before anything else:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`, never `cat`/`sed`/heredocs; no Bash
  with `run_in_background`; no lint-suppression comment; no module past ~450
  lines; types derived, never hand-duplicated (`pnpm type-overlap`); comments
  state the code's lasting contract, never the change.
- The plan `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far"
  (the summary above the index names each module's job) and `## This bite`.
  Other bites' files are opened only when your package needs one.
- `docs/plans/mushroom-game-syama/decisions.md` — the standing design (taps
  for a six-year-old, juice, no text, nothing dies or is lost, the meadow only
  gets fuller, palette files hold every colour).
- `src/pages/mushrooms/model/weather.ts` — the shower's clock functions.

Open only the modules your package touches.

## Your own worktree

You work in a `git worktree` of your own, never in the shared checkout at
`/home/user/vovazakharov.com`, which is the orchestrator's.

- Set it up first, in the scratchpad directory your prompt names (outside the
  repo — anything under `tmp/` is reached by `pnpm test`'s glob, and
  Turbopack fails in a worktree inside the repo):

  ```
  git -C /home/user/vovazakharov.com fetch origin claude/mushroom-game-syama-lbirv7
  git -C /home/user/vovazakharov.com worktree add --detach <scratchpad>/wt-<package> origin/claude/mushroom-game-syama-lbirv7
  cd <scratchpad>/wt-<package> && git checkout -b wt/<package> && pnpm install --offline --frozen-lockfile
  ```

  A symlinked `node_modules` fails Turbopack; install there.

- **Commit and push after every step that passes** its tests and
  `pnpm typecheck`, with a descriptive conventional-commit message ending in
  the two attribution lines your prompt gives; then
  `git pull --no-rebase origin claude/mushroom-game-syama-lbirv7` and
  `git push origin HEAD:claude/mushroom-game-syama-lbirv7`. On a rejected
  push, pull again and push. The container can restart without warning; what
  is not pushed is lost.
- Touch only the files your package owns; your prompt names them and what is
  off limits. The plan file and `bite-14.md` are the orchestrator's alone:
  never edit them.
- Keep a hand-over note at `docs/remove-before-merging/bite-14/<package>.md`,
  current after every step: what is done (commits), what is left with the
  next step designed so a successor can build it, anything decided. Commit
  it with the step.
- Work that does not type-check yet is committed as a `git apply`-able
  `.patch` beside the note, never as source. Never `git reset --hard`, never
  `git stash`, never force-push.
- Before you report, remove the worktree:
  `git -C /home/user/vovazakharov.com worktree remove --force <path>` and
  `git -C /home/user/vovazakharov.com branch -D wt/<package>` — only after
  everything in it is pushed.

## Checks

- Tests: `node --import tsx --test <file>` one file at a time
  (`fliers.test.ts` alone takes ~6 min; run it only if you touched flight or
  perches). Run every test file your change could touch. Pure functions you
  add get tests beside them. No scratch tests under `tmp/`.
- Anything that builds or serves the site runs under
  `flock /home/user/vovazakharov.com/tmp/site.lock <command>`, so play runs in
  several worktrees do not fight over ports.
- Look at what you draw: `pnpm play:mushrooms --no-build`-style frames or
  the `/preview` skill's screenshots, from your worktree, before you call a
  visual step done.
- Before a commit: `pnpm exec prettier --write` and `pnpm exec eslint` on
  your files, and `pnpm typecheck`.

## Your context

You cannot see your context size; a hook tells you at 170k. Make your first
commit within your first ~60k tokens of work. When your prompt's step list is
done, or the hook or the orchestrator says to wrap up, stop: commit what
passes, bring the note current, and report.

## The report

End with: the commits you pushed (sha + subject), what is left, every
decision you took that `## This bite` / `bite-14.md` did not, every place
your work departs from a line in them or in `decisions.md`, and anything a
person looking at the game would notice differently.
