# Bite 15 — the brief every agent shares

You work on one package of bite 15 of the mushroom game
(`src/pages/mushrooms/`): the house's dwellers. A mouse runs out of its door
and in at another house's door when one is near enough to be seen, else
peeks and hides as today; a mouse is sized to its door; a tap on a window
brings a worm that crawls over the cap to another window of the same house,
or peeks and hides. The contract is the plan's `## This bite`
(`docs/plans/mushroom-game-syama.in-progress.md`) and
`docs/plans/mushroom-game-syama/bite-15.md` once it exists — the calls there
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
  Other bites' files are opened only when your package needs one
  (`bite-04.md` is the mouse house's).
- `docs/plans/mushroom-game-syama/decisions.md` — the standing design (taps
  for a six-year-old, juice, no text, nothing dies or is lost, the meadow only
  gets fuller, palette files hold every colour).

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
  `pnpm typecheck` — to your own branch, `git push -u origin wt/<package>`,
  never to the shared one mid-package. The container can restart without
  warning; what is not pushed is lost.
- **Land the package as one commit** when you are done (or told to wrap
  up), so the shared branch gains one commit per agent rather than one per
  step plus a merge each:

  ```
  git fetch origin claude/mushroom-game-syama-lbirv7
  git checkout -B land-<package> origin/claude/mushroom-game-syama-lbirv7
  git merge --squash wt/<package>
  git commit        # one conventional subject for the package, a body listing what each step did, the attribution lines
  git push origin HEAD:claude/mushroom-game-syama-lbirv7
  ```

  On a rejected push, repeat from the fetch. A squash that conflicts is
  settled keeping both sides' intent, never by dropping the other agent's
  lines. Once it is on the shared branch, `git push origin --delete
wt/<package>`. Report the landed commit's SHA: it is what review replies
  cite.

- Touch only the files your package owns; your prompt names them and what is
  off limits. The plan file and `bite-15.md` are the orchestrator's alone:
  never edit them.
- Keep a hand-over note at `docs/remove-before-merging/bite-15/<package>.md`,
  current after every step: what is done (commits), what is left with the
  next step designed so a successor can build it, anything decided. Commit
  it with the step.
- Work that does not type-check yet is committed as a `git apply`-able
  `.patch` beside the note, never as source. Never `git reset --hard`, never
  `git stash`, never force-push.
- Before you report, remove the worktree:
  `git -C /home/user/vovazakharov.com worktree remove --force <path>` and
  `git -C /home/user/vovazakharov.com branch -D wt/<package> land-<package>`
  — only after the package has landed on the shared branch.

## Checks

- Tests: `node --import tsx --test <file>` one file at a time
  (`fliers.test.ts` alone takes ~6 min; run it only if you touched flight or
  perches). Run every test file your change could touch. Pure functions you
  add get tests beside them. No scratch tests under `tmp/`.
- Anything that builds or serves the site runs under
  `flock /home/user/vovazakharov.com/tmp/site.lock <command>`, so play runs in
  several worktrees do not fight over ports. A play run is capped at what
  fits one foreground call: `--screens` one or two, `--plays` the ones you
  need.
- Before a commit: `pnpm exec prettier --write` and `pnpm exec eslint` on
  your files, and `pnpm typecheck`.

## Your context

You cannot see your context size; a hook tells you at 170k. Make your first
commit within your first ~60k tokens of work. When your prompt's step list is
done, or the hook or the orchestrator says to wrap up, stop: commit what
passes, bring the note current, and report.

## The report

End with: the commits you pushed (sha + subject), what is left, every
decision you took that `## This bite` / `bite-15.md` did not, every place
your work departs from a line in them or in `decisions.md`, and anything a
person looking at the game would notice differently.
