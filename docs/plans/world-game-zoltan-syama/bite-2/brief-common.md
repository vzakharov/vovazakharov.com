# Bite 2 — what every build agent's brief shares

- **Start**: your worktree begins on the default branch. First run
  `git fetch origin island/worlds wt/<you> 2>/dev/null; git checkout -B wt/<you> <base sha from your brief>`
  (if `origin/wt/<you>` exists, a predecessor of yours left work there: check it
  out instead and read its hand-over note first). Then `pnpm install --offline`
  if `node_modules` is missing.
- **Read first**: `docs/plans/world-game-zoltan-syama/bite-2.md` (the contract)
  and `docs/plans/world-game-zoltan-syama/bite-2/build.md` (the calls already
  settled). Build to them; where you cannot keep one, stop and report it with
  numbers — never pick another quietly.
- **Push every passing step** to your own branch, `git push origin wt/<you>`,
  never to `island/worlds`; the container can restart without warning, and only
  what is pushed survives. Keep
  `docs/plans/world-game-zoltan-syama/bite-2/notes/<you>.md` current as your
  hand-over note (done, left, decisions, numbers).
- **House rules** (`CLAUDE.md`): no lint-suppression comments; `Read`/`Edit`/
  `Write` for files, not `cat`/`sed`; comments state the code's lasting
  contract, never the change; no file over 400 lines; derive types from their
  source; no `interface`; validate untyped data at boundaries (zod); tests use
  `node:test` beside the module. Conventional commit subjects.
- **Checks** for what you touched: `pnpm test <files>` (or
  `node --import tsx --test <files>`), `pnpm exec tsc -p sites/vova --noEmit`,
  `pnpm exec eslint <files>`, `pnpm check:masd`, `pnpm check:cycles`,
  `pnpm type-overlap`. Not `./scripts/vet.sh` — that is the orchestrator's.
- **Long runs** fit one foreground call (under 10 minutes); never detach one.
- **Files outside your list** are another agent's: do not edit them; a defect
  you find there goes in your final report.
- **The report** ends your run: what landed (commits), every place you departed
  from `build.md` or the contract and why, numbers measured, and anything that
  surprised you. At the context-budget notice, commit what passes (a `.patch`
  beside your note for what does not), bring the note current, and report.
