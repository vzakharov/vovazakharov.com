# Handling bite 7's review — rules every group follows

Repo `/home/user/vovazakharov.com`, branch `claude/mushroom-game-syama-lbirv7`
(PR #57). The game lives in `src/pages/mushrooms/`. The review is
https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5340556382;
its threads are exported in `docs/pr/57/pr.md` — read the ones your brief
names by anchor (`<a id="t60">` … `<a id="t73">`), plus the review body
above `T01`. The plan (`docs/plans/mushroom-game-syama.in-progress.md`,
§ "Decisions the whole game carries" and § "Eaten so far" bite 7) and
`docs/remove-before-merging/atmosphere/look.md` are the spec; read only the
parts your files touch. The player is six: beauty and comfort beat
cleverness.

## Shared tree

Other agents work on this tree at the same time, on other files.

- `git add` only your own paths, never `-A` / `.`. If `index.lock` exists,
  wait a few seconds and retry.
- Push with `git push origin claude/mushroom-game-syama-lbirv7`; on a
  rejection, `git pull --no-rebase origin claude/mushroom-game-syama-lbirv7`
  then push. Never rebase, amend or force-push.
- **Anything that builds or serves the site** (`pnpm build:vova`, the probe
  build, `pnpm play:mushrooms`, a dev server, `/preview`) runs under
  `flock /tmp/mushroom-site.lock <command>` — build and the use of that
  build in the same locked call — so no one swaps the output under you.
  Keep each hold under ~9 min (tool limit 600 s): the play run goes one
  screen per call, `NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova` then
  `pnpm play:mushrooms --no-build --screens <one>` (tabL, tabP, phoneP,
  phoneL, phoneS; phoneS is the quickest). Frames land in `tmp/play/`.
- Do not edit the plan file or `look.md` unless your brief says so: report
  the wording that should change instead.
- Do not post on GitHub. Your report carries a draft reply per thread.
- Never run Bash in the background.

## House rules (CLAUDE.md is loaded; these bite hardest here)

- No lint-suppression comments. No `interface`. Files stay under ~450
  lines. No colour literals outside `palette*.ts`. Comments state the
  code's lasting contract, never the change.
- Tests are `node:test` beside the module. **A test must be able to fail**:
  assert the property a child would see, measured from what is drawn or
  laid out, never a constant restated — this review exists because several
  tests passed by construction.
- Quick checks between commits: `node --import tsx --test <your test
files>`, `pnpm exec tsc --noEmit -p tsconfig.json` (the root project —
  the app's tsconfig skips tests), and `pnpm exec eslint <your files>`.
  Not `./scripts/vet.sh`.
- Commit per thread or per coherent fix, conventional subjects
  (`fix(mushrooms): …`, `perf(mushrooms): …`, `test(mushrooms): …`), with
  bodies saying what and why, ending with the two trailer lines:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01SdPhg6cj7GGedY3DgbfRVr
  ```

- Look at your change: take before/after frames of what you fixed, and
  copy the ones worth showing into
  `docs/remove-before-merging/frames/bite-7/handle/` with names that say
  what they show; commit them.

## If told to pause, or running long

Commit what passes; work that does not yet type-check goes in as a
`git apply`-able `.patch` beside a note at
`docs/remove-before-merging/handle-bite7/<your group>.md` saying what is
done and what is left. Commit and push the note.

## Report (under 400 words)

Per thread: the commit SHAs, what changed, the measurement before → after,
and a **draft GitHub reply** (1–3 sentences, English, SHAs bare, no
backticks around them). Then two lists: "for a person looking at the
screen" (what a child or parent would notice, good or bad) and "for you to
decide" (anything you traded off or could not meet). Plus plan/look.md
wording that should change.
