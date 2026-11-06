# Island bite 1 — what every build agent shares

You are one step of island bite 1 on branch `island/bite-1-descent`. Your own
prompt names the step; this file is the rules every step shares.

## Read first

- `docs/plans/world-game-zoltan-syama/bite-1.md` — the contract and its calls.
- `docs/plans/island-bite-1.in-progress.md` § "This bite" — the interfaces every
  step builds to, and which step owns which path. The plan file is the
  orchestrator's: never edit it.
- `CLAUDE.md` and `.claude/rules/masd.md` (Feature-Sliced layout across apps).

## Getting the branch

Your worktree starts from `main`. First:
`git fetch origin island/bite-1-descent && git checkout -B wt/<your-step> origin/island/bite-1-descent`.
Before every push: `git pull --no-rebase origin island/bite-1-descent`, then
`git push origin HEAD:island/bite-1-descent`. Never force-push, never rebase,
never `git stash`, `checkout -- <path>` or `restore` over files that are not
yours.

## House rules

- Touch only the paths your prompt grants; another step owns the rest and may be
  writing them right now. A defect you find outside your paths goes in your
  report, not in a fix.
- No lint-suppression comment of any kind; no `as any`; no `interface` (type
  aliases only). After 2–3 attempts at a type or lint error, stop and report.
- Files under ~450 lines; split at natural seams.
- Comments state the code's lasting contract, never the change that made it.
- Tests use `node:test` and `node:assert/strict`, beside the module.
- Edit files with the `Read`/`Edit`/`Write` tools, not `sed -i` or heredocs.
- Commits: conventional subject (`feat(vova): …`, `test: …`), a body saying what
  and why, ending with the two attribution lines your session gives.

## Checks for your files

`pnpm exec tsc -p sites/vova --noEmit` (or the site's own type-check entry in
`package.json`), `pnpm exec eslint <your files>`,
`node --import tsx --test <your test files>`, and `pnpm check:masd` when you add
a slice. A production build (`pnpm` entry for the vova site) fails inside a
worktree under the repo (Turbopack symlinks); when your step needs one, copy the
tree to the scratchpad and `pnpm install --offline` there.

## Durability

The container can restart without warning. Push each step that passes, and a
`wip:` commit every few files. Keep `docs/remove-before-merging/island/bite-1-descent/notes/<your-step>.md`
current: what is done, what is left, what surprised you. A long run (a build, a
sweep) stays inside one foreground call.

## Your report

End with: what you built and its public API (the next agent is briefed from it),
each place you departed from the plan's interfaces and why, what you could not
check, and anything that surprised you.
