# Bite 12's tail — the brief every polish agent shares

You run one pass of `/polish` over one area of bite 12 of the mushroom game
(`src/pages/mushrooms/`, its play harness under `scripts/`). Your prompt names
the pass (`/dry` or `/tend-prose`) and the area you own.

Read first:

- `CLAUDE.md` — the house rules. The ones that bite most here: files are read
  and edited with `Read`/`Edit`/`Write`; no Bash with `run_in_background`; no
  lint-suppression comment; no module past ~450 lines; types derived, never
  hand-duplicated (`pnpm type-overlap`); comments state the code's lasting
  contract, never the change.
- `.claude/skills/polish/SKILL.md`, then the pass's own skill
  (`.claude/skills/dry/SKILL.md` or `.claude/skills/tend-prose/SKILL.md`).
  Follow the pass as written, with two overrides below.
- `docs/plans/mushroom-game-syama.in-progress.md` § "Eaten so far" — what
  each module is for. The plan file is the orchestrator's: never edit it.

## The scope, settled

The floor is `083a13df` (the last bare `polish:` commit, bite 11's end), so
the scope is `git diff 083a13df..origin/claude/mushroom-game-syama-lbirv7`
restricted to your area. Do not recompute it: the session's clone was too
shallow to find it once, which is why it is written here. Code outside your
area and below the floor is context — read it to find duplication against —
but edit only inside your area. A finding whose fix has to edit outside it
goes in your report, not into the tree.

## The two overrides

- **No question goes to the operator.** The loop runs without them. An
  ambiguous `/dry` call is yours to decide: take the extraction where it
  plainly reduces what a reader holds, leave it where it couples things that
  change for different reasons, and list each call with one line of why.
- **Commit subjects are bare `polish:`** — `polish: <what changed>` — never
  `polish(<scope>):`, so the next run finds its floor. A pass that changes
  nothing in your area commits nothing; the orchestrator writes the empty
  mark once every area reports.

## Your own worktree

Never edit the shared checkout at `/home/user/vovazakharov.com`.

```
git -C /home/user/vovazakharov.com fetch origin claude/mushroom-game-syama-lbirv7
git -C /home/user/vovazakharov.com worktree add --detach <scratchpad>/wt-<name> origin/claude/mushroom-game-syama-lbirv7
cd <scratchpad>/wt-<name> && git checkout -b wt/<name> && pnpm install --offline --frozen-lockfile
```

Commit after each change that passes its checks, then
`git pull --no-rebase origin claude/mushroom-game-syama-lbirv7` and
`git push origin HEAD:claude/mushroom-game-syama-lbirv7` (on a rejected
push, pull and push again). Never `git reset --hard`, never force-push.
Before reporting, with everything pushed:
`git -C /home/user/vovazakharov.com worktree remove --force <path>` and
`git -C /home/user/vovazakharov.com branch -D wt/<name>`.

## Checks

- Before each commit: `pnpm exec prettier --write` and `pnpm exec eslint` on
  the files you touched, and `pnpm typecheck`.
- Tests: `node --import tsx --test <file>`, one file at a time, for every
  test file your change could reach. `fliers.test.ts` takes ~6 min; run it
  only if you touched flight or perches. No scratch tests under `tmp/`.

## Your context

You cannot see your context size. The diff is large: read it file by file,
not as one dump. Make your first commit within ~60k tokens of work; after
many dozens of tool calls, stop where a commit passes, and report what you
covered and what you did not. A message from the orchestrator to wrap up
means the same, now.

## The report

The commits you pushed (sha + subject); the files you read and the ones you
did not get to; each ambiguous call with its one line of why; findings
outside your area.
