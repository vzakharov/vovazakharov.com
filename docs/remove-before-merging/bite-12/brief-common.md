# Bite 12 — the brief every build agent shares

You build one work package of bite 12 of the mushroom game
(`src/pages/mushrooms/`): walking — a heading on the plane, turning through
360° and stepping along it. Your package's contract is
`docs/remove-before-merging/bite-12/step-spec.md`; read its §1–§3 and the
sections your package names. Read, before anything else:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`, never `cat`/`sed`/heredocs; no Bash
  with `run_in_background`; no lint-suppression comment; no module past ~450
  lines; types derived, never hand-duplicated (`pnpm type-overlap`); comments
  state the code's lasting contract, never the change.
- `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far" (the
  summary above the index; it names each module's job) and § "Rest of the
  bite" — the decisions there are made; build them, don't reopen them. Where
  one cannot hold as written, stop and report which and why, with the
  options measured, rather than picking another.
- `docs/plans/mushroom-game-syama/decisions.md` — the standing design (taps
  for a six-year-old, juice, no text, palette files hold every colour).

Open only the modules your package touches; the plan's summary tells you
which those are.

## Your own worktree

You work in a `git worktree` of your own, never in the shared checkout at
`/home/user/vovazakharov.com`, which is the orchestrator's: other agents
build at the same time, and a half-done edit in a shared tree breaks
everyone's typecheck and trips the Stop hook's git check.

- Set it up first, from the shared checkout, in the scratchpad directory
  your prompt names (outside the repo — anything under `tmp/` is reached by
  `pnpm test`'s glob, and Turbopack fails in a worktree inside the repo):

  ```
  git -C /home/user/vovazakharov.com fetch origin claude/mushroom-game-syama-lbirv7
  git -C /home/user/vovazakharov.com worktree add --detach <scratchpad>/wt-<package> origin/claude/mushroom-game-syama-lbirv7
  cd <scratchpad>/wt-<package> && git checkout -b wt/<package> && pnpm install --offline --frozen-lockfile
  ```

  A symlinked `node_modules` fails Turbopack; install there.

- **Commit and push after every step that passes** its tests and
  `pnpm typecheck`, with a descriptive conventional-commit message ending
  in the two attribution lines your prompt gives; then
  `git pull --no-rebase origin claude/mushroom-game-syama-lbirv7` and
  `git push origin HEAD:claude/mushroom-game-syama-lbirv7`. On a rejected
  push, pull again and push. The container can restart without warning;
  what is not pushed is lost.
- Touch only the files your package owns; your prompt names them and names
  what is off limits. The plan file is the orchestrator's alone: never edit
  it.
- Keep a hand-over note at `docs/remove-before-merging/bite-12/<package>.md`,
  current after every step: what is done (commits), what is left, anything
  decided. Commit it with the step.
- Work that does not type-check yet is committed as a `git apply`-able
  `.patch` beside the note, never as source. Never `git reset --hard`, never
  force-push.
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
  `flock /home/user/vovazakharov.com/tmp/site.lock <command>`, so play runs
  in several worktrees do not fight over ports.
- Before a commit: `pnpm exec prettier --write` and `pnpm exec eslint` on
  your files, and `pnpm typecheck`.

## Your context

You cannot see your context size. Make your first commit within your first
~60k tokens of work. When your prompt's step list is done, or if you have
been working long (many dozens of tool calls), stop: commit what passes,
bring the note current, and report. A message from the orchestrator saying
to wrap up means the same, now.

## The report

End with: the commits you pushed (sha + subject), what is left, every
decision you took that the plan did not, every place your work departs from
a line in the plan, and anything a person looking at the game would notice
differently.
