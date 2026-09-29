# Bite 9 build — rules every agent follows

Repo `/home/user/vovazakharov.com`, branch `claude/mushroom-game-syama-lbirv7`
(PR #57). The game lives in `src/pages/mushrooms/`. The spec is the plan,
`docs/plans/mushroom-game-syama.in-progress.md`: § "This bite" (item 9.2,
the calls this bite already decided), § "Decisions the whole game carries",
and the entries of § "Eaten so far" for the modules you touch — read those
parts, not the whole file. The design this bite builds is argued in
`docs/remove-before-merging/ideas/idea-1-walking-meadow.md` (Russian), its
last section «Что можно строить в байте 9 при любом решении» above all:
build what it lists for your part, and nothing it puts under «Ждёт твоего
решения». The last frames are in
`docs/remove-before-merging/frames/bite-8/handled/`. Syama's
drawing is `src/pages/mushrooms/reference/syama-drawing.webp`. The player is
six: beauty and comfort beat cleverness.

## Shared tree

Other agents work on this tree at the same time, on other files. Your brief
names your files and the ones that are off limits.

- `git add` only your own paths, never `-A` / `.`. If `index.lock` exists,
  wait a few seconds and retry.
- Push with `git push origin claude/mushroom-game-syama-lbirv7`; on a
  rejection, `git pull --no-rebase origin claude/mushroom-game-syama-lbirv7`
  then push. Never rebase, amend or force-push.
- **Commit and push after every step that passes** — a context runs out in
  about twenty-five minutes of heavy work, and what is not committed is lost.
- **Anything that builds or serves the site** (`pnpm build:vova`, the probe
  build, `pnpm play:mushrooms`, a dev server) runs under
  `flock /tmp/mushroom-site.lock <command>` — build and the use of that
  build in the same locked call. Keep each call under ~9 min (tool limit
  600 s): `NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova`, then
  `pnpm play:mushrooms --no-build --screens <one>` (tabL, tabP, phoneP,
  phoneL, phoneS; phoneS is the quickest), one screen per call. Frames land
  in `tmp/play/`. Copy the after-frames that show your fix to
  `tmp/bite9/<your group>/` and name them in your report.
- Do not edit the plan file: report the wording that should change instead.
- Do not post on GitHub. Never run Bash in the background.

## House rules (CLAUDE.md is loaded; these bite hardest here)

- No lint-suppression comments. No `interface`. Files stay under ~450
  lines — split by seam rather than growing one. No colour literals outside
  `palette*.ts`. Comments state the code's lasting contract, never the
  change. Derive types from their source (`as const` arrays, shared bases;
  `pnpm type-overlap` enforces it).
- Tests are `node:test` beside the module. **A test must be able to fail**:
  assert the property a child would see, measured from what is drawn or
  laid out, never a constant restated. Where the inputs are a small discrete
  set (species, slots, screens), iterate it exhaustively and randomise only
  the continuous genes; fail on a combination left unmeasured. When you keep
  a sweep as a test, break the code on purpose once, see it fail, and say so
  in the report.
- A fix that tightens a rule must not take away what the rule protected:
  sweep the invariants your brief names alongside your own number.
- Quick checks between commits:
  `node --import tsx --test <your test files>`, `pnpm exec tsc --noEmit -p tsconfig.json` (the root project),
  `pnpm exec eslint <your files>`, `pnpm type-overlap`, `pnpm knip`,
  `pnpm exec prettier --check <your files>`. Not `./scripts/vet.sh`. Keep
  the whole `src/pages/mushrooms` suite under its current running time.
- Commit per step where practical, conventional subjects
  (`fix(mushrooms): …`, `test(mushrooms): …`), bodies saying what and why,
  ending with the two trailer lines:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01PN4ML41dri7HvW3Pz54LLo
  ```

## If told to pause, or running long

Commit what passes; work that does not yet type-check goes in as a
`git apply`-able `.patch` beside a note at
`docs/remove-before-merging/bite9/<your group>.md` saying what is
done and what is left. Commit and push the note.

## Report (under 500 words)

The commit SHA(s), what changed, and the measurements that show the
invariants your brief names held — before and after. Then two
lists: "for a person looking at the screen" (what a child or parent would
notice, good or bad) and "for you to decide" (anything traded off or not
met). Plus plan wording that should change, and the after-frames by path.
