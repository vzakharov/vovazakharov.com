# Bite 12 — the brief every build agent shares

You build one work package of bite 12 of the mushroom game
(`src/pages/mushrooms/`): the rain shower. Read, before anything else:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`, never `cat`/`sed`/heredocs; no Bash
  with `run_in_background`; no lint-suppression comment; no module past ~450
  lines; types derived, never hand-duplicated (`pnpm type-overlap`); comments
  state the code's lasting contract, never the change.
- `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far" (the
  summary above the index; it names each module's job) and § "This bite" —
  the decisions there are made; build them, don't reopen them. Where one
  cannot hold as written, stop and report which and why, with the options
  measured, rather than picking another.
- `docs/plans/mushroom-game-syama/decisions.md` — the standing design (taps
  for a six-year-old, juice, no text, palette files hold every colour).

Open only the modules your package touches; the plan's summary tells you
which those are.

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
- Keep a hand-over note at `docs/remove-before-merging/bite-12/<package>.md`,
  current after every step: what is done (commits), what is left, anything
  decided. Commit it with the step.
- Work that does not type-check yet is committed as a `git apply`-able
  `.patch` beside the note, never as source. Never `git reset --hard`, never
  force-push, **never `git stash`, `git checkout -- <path>` or
  `git restore` on the tree** — each sweeps up or overwrites other agents'
  uncommitted edits. For a baseline, build a throwaway `git worktree` in the
  scratchpad directory (outside the repo — anything under `tmp/` is reached by
  `pnpm test`'s glob), and remove it before you report.
- Tests: `node --import tsx --test <file>` one file at a time
  (`fliers.test.ts` alone takes ~6 min; run it only if you touched flight or
  perches). Run every test file your change could touch. No scratch tests
  under `tmp/`.
- Anything that builds or serves the site runs under
  `flock tmp/site.lock <command>`.
- Before a commit: `pnpm exec prettier --write` and `pnpm exec eslint` on
  your files, and `pnpm typecheck`.

## Your context

You cannot see your context size. Make your first commit within your first
~60k tokens of work. When your prompt's step list is done, or if you have
been working long (many dozens of tool calls), stop: commit what passes,
bring the note current, and report.

## The report

End with: the commits you pushed (sha + subject), what is left, every
decision you took that the plan did not, every place your work departs from
a line in the plan, and anything a person looking at the game would notice
differently.
