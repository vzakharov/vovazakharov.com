# Bite 12b — the brief every agent shares

You work on one package of bite 12b of the mushroom game
(`src/pages/mushrooms/`): the endless field — the glade rim goes, stored
positions become plane points, the lawn is laid by plane cells, light turns
with the heading and the insects live on the plane. The bite's calls are made
in `docs/plans/mushroom-game-syama/bite-12b.md`; its contract
is `docs/plans/mushroom-game-syama/endless-field.md`, and its spec, once
written, is `docs/remove-before-merging/bite-12b/spec.md` — read the sections
your package names. Read, before anything else:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`, never `cat`/`sed`/heredocs; no Bash
  with `run_in_background`; no lint-suppression comment; no module past ~450
  lines; types derived, never hand-duplicated (`pnpm type-overlap`); comments
  state the code's lasting contract, never the change.
- The plan's § "Eaten so far" (the summary above the index names each
  module's job) and `bite-12b.md`. Those calls are made: build them, don't
  reopen them. Where one cannot hold as written, stop and report which and
  why, with the options measured, rather than picking another. What bite 12
  built and why is in `docs/plans/mushroom-game-syama/bite-12.md`; bite 12's
  working notes are retired (`docs/remove-before-merging/retired.md` gives
  the commit to `git show` them from), opened only when your package needs
  one.
- `docs/plans/mushroom-game-syama/decisions.md` — the standing design (taps
  for a six-year-old, juice, no text, palette files hold every colour).

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
  off limits. The plan file is the orchestrator's alone: never edit it.
- Keep a hand-over note at `docs/remove-before-merging/bite-12b/<package>.md`,
  current after every step: what is done (commits), what is left, anything
  decided. Commit it with the step.
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
  perches). Run every test file your change could touch. No scratch tests
  under `tmp/`.
- Anything that builds or serves the site runs under
  `flock /home/user/vovazakharov.com/tmp/site.lock <command>`, so play runs in
  several worktrees do not fight over ports.
- Before a commit: `pnpm exec prettier --write` and `pnpm exec eslint` on
  your files, and `pnpm typecheck`.

## Your context

You cannot see your context size; a hook tells you at 170k. Make your first
commit within your first ~60k tokens of work. When your prompt's step list is
done, or the hook or the orchestrator says to wrap up, stop: commit what
passes, bring the note current, and report.

## The report

End with: the commits you pushed (sha + subject), what is left, every
decision you took that the plan did not, every place your work departs from a
line in the plan, and anything a person looking at the game would notice
differently.
