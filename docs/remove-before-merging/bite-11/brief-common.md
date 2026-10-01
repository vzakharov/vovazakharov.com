# Bite 11 — the brief every build agent shares

You build one work package of bite 11 of the mushroom game
(`src/pages/mushrooms/`). Read, before anything else:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`, never `cat`/`sed`/heredocs; no Bash
  with `run_in_background`; no lint-suppression comment; no module past ~450
  lines; types derived, never hand-duplicated (`pnpm type-overlap`); comments
  state the code's lasting contract, never the change.
- `docs/plans/mushroom-game-syama.in-progress.md` § "Decisions the whole game
  carries", § "Eaten so far" items 9–10, and § "Rest of the bite" — the decisions
  there are made; build them, don't reopen them. Where one cannot hold as
  written, stop and report which and why rather than picking another.
- `docs/remove-before-merging/bite-11/map.md` — where everything is today.

## The shared tree

- Other agents may work in the same checkout at the same time. Touch only the
  files your package owns; your prompt names them and names what is off
  limits. `git add` only your own paths (never `-A`, never `.`), wait out an
  `index.lock`, and on a rejected push `git pull --no-rebase` then push.
- The plan file is the orchestrator's alone: never edit it.
- **Commit and push after every step that passes** its tests and
  `pnpm typecheck`, with a descriptive conventional-commit message ending
  in the two attribution lines your prompt gives. The container can restart
  without warning; what is not pushed is lost.
- Keep a hand-over note at `docs/remove-before-merging/bite-11/<package>.md`,
  current after every step: what is done (commits), what is left, anything
  decided. Commit it with the step.
- Work that does not type-check yet is committed as a `git apply`-able
  `.patch` beside the note, never as source. Never `git reset --hard`, never
  force-push, **never `git stash`, `git checkout -- <path>` or
  `git restore` on the tree** — each sweeps up or overwrites other agents'
  uncommitted edits. For a baseline, build a throwaway
  `git worktree add tmp/wt-<package> HEAD` and run there.
- Tests: `node --import tsx --test <file>` one file at a time (the whole
  mushroom suite in one call exceeds the tool's time limit). Run every test
  file your change could touch.
- Anything that builds or serves the site runs under
  `flock tmp/site.lock <command>`.

## Your context

You cannot see your context size. Make your first commit within your first
~60k tokens of work. When your prompt's step list is done, or if you have
been working long (many dozens of tool calls), stop: commit what passes,
bring the note current, and report.

## The report

End with: the commits you pushed (sha + subject), what is left, every
decision you took that the plan did not, and anything a person looking at
the game would notice differently.
