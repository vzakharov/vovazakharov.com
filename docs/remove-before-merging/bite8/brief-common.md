# Bite 8, real mushrooms — rules every agent follows

Repo `/home/user/vovazakharov.com`, branch `claude/mushroom-game-syama-lbirv7`
(PR #57). The game lives in `src/pages/mushrooms/`. The spec is the plan,
`docs/plans/mushroom-game-syama.in-progress.md`: § "This bite" (bite 8,
with every call already decided), § "Decisions the whole game carries", and
the entries of § "Eaten so far" for the modules you touch — read those
parts, not the whole file. Syama's drawing is
`docs/remove-before-merging/syama-drawing.webp`; bite 7's look is in
`docs/remove-before-merging/atmosphere/look.md`. The player is six: beauty
and comfort beat cleverness.

## Shared tree

Other agents may work on this tree at the same time, on other files.

- `git add` only your own paths, never `-A` / `.`. If `index.lock` exists,
  wait a few seconds and retry.
- Push with `git push origin claude/mushroom-game-syama-lbirv7`; on a
  rejection, `git pull --no-rebase origin claude/mushroom-game-syama-lbirv7`
  then push. Never rebase, amend or force-push.
- **Anything that builds or serves the site** (`pnpm build:vova`, the probe
  build, `pnpm play:mushrooms`, a dev server, `/preview`) runs under
  `flock /tmp/mushroom-site.lock <command>` — build and the use of that
  build in the same locked call. Keep each call under ~9 min (tool limit
  600 s): `NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova`, then
  `pnpm play:mushrooms --no-build --screens <one>` (tabL, tabP, phoneP,
  phoneL, phoneS; phoneS is the quickest), one screen per call. Frames land
  in `tmp/play/`.
- Do not edit the plan file unless your brief says so: report the wording
  that should change instead.
- Do not post on GitHub. Never run Bash in the background.

## House rules (CLAUDE.md is loaded; these bite hardest here)

- No lint-suppression comments. No `interface`. Files stay under ~450
  lines — split by seam (one module per species' outline or painter) rather
  than growing one. No colour literals outside `palette*.ts`. Comments state
  the code's lasting contract, never the change. Derive types from their
  source (`as const` arrays, shared bases; `pnpm type-overlap` enforces it).
- Tests are `node:test` beside the module. **A test must be able to fail**:
  assert the property a child would see, measured from what is drawn or
  laid out, never a constant restated. When you keep a sweep as a test,
  break the code on purpose once and see it fail.
- Quick checks between commits: `node --import tsx --test <your test
  files>`, `pnpm exec tsc --noEmit -p tsconfig.json` (the root project —
  the app's tsconfig skips tests), `pnpm exec eslint <your files>`,
  `pnpm type-overlap`, `pnpm knip`. Not `./scripts/vet.sh`.
- Commit per coherent step, conventional subjects (`feat(mushrooms): …`,
  `refactor(mushrooms): …`, `test(mushrooms): …`), with bodies saying what
  and why, ending with the two trailer lines:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_016Y6EaGWoqB9Vy7wF3UQzeb
  ```

## If told to pause, or running long

Commit what passes; work that does not yet type-check goes in as a
`git apply`-able `.patch` beside a note at
`docs/remove-before-merging/bite8/<your part>.md` saying what is done and
what is left. Commit and push the note.

## Report (under 500 words)

The commits, what exists now (the API the next agent builds on, by module
and export), and the measurements your sweeps took. Then two lists: "for a
person looking at the screen" (what a child or parent would notice, good or
bad) and "for you to decide" (anything you traded off or could not meet).
Plus plan wording that should change.
