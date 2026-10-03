# Bite 13 — the brief every agent shares

You work on one package of bite 13 of the mushroom game
(`src/pages/mushrooms/`): rain. A tap on a cloud starts a shower; the sky
darkens, drops fall and splash, flowers close, caps swell, it hisses, and
when it stops a rainbow shows opposite the sun. The contract is
`docs/plans/mushroom-game-syama/rain.md`; the calls it leaves to the scene,
and the packages, are `docs/plans/mushroom-game-syama/bite-13.md` — those
calls are made: build them, don't reopen them. Where one cannot hold as
written, stop and report which and why, with the options measured, rather
than picking another. Read, before anything else:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`, never `cat`/`sed`/heredocs; no Bash
  with `run_in_background`; no lint-suppression comment; no module past ~450
  lines; types derived, never hand-duplicated (`pnpm type-overlap`); comments
  state the code's lasting contract, never the change.
- The plan `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far"
  (the summary above the index names each module's job). Other bites' files
  are opened only when your package needs one.
- `docs/plans/mushroom-game-syama/decisions.md` — the standing design (taps
  for a six-year-old, juice, no text, palette files hold every colour).
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
  off limits. The plan file and `bite-13.md` are the orchestrator's alone:
  never edit them.
- Keep a hand-over note at `docs/remove-before-merging/bite-13/<package>.md`,
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
decision you took that `bite-13.md` did not, every place your work departs
from a line in it or in rain.md, and anything a person looking at the game
would notice differently.
