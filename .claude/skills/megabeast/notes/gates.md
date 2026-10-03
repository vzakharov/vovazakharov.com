# Gates and vetting

- **Vet runs at every bite's end, and pays for itself.** `plan/elephant.md`
  § "A bite" says "a bite leaves `vet` green"; `go/SKILL.md` Step 2 says
  "do not run `./scripts/vet.sh` per commit; that is `/finalize`'s job". An
  autonomous loop has no operator review between bites to catch a red tree,
  so the skill should run vet once per bite. Bite 1's first vet run found 17
  lint errors and failures in four gates (type overlap, knip, Steiger's
  segment names, the skill catalogue) — each a quick fix while the bite was
  still loaded, and each a review comment otherwise.
- **A bite's end has an order, because `/polish` and vet change source.**
  Bite 4's polish folded helpers and vet's knip fix made two exports
  private, both after the scene agent's last frame run, which has to follow
  the last source commit. The skill should order it: quick gates
  (`pnpm format:check`, `pnpm knip`, which the scene agent had skipped),
  `/polish`, vet, the play run, then `/pr`.
- **On a structural bite `/polish` is several agents, and only the last
  writes the bare subject.** 12b's range took four agents, each stopping at
  170k: the first mid `/dry` with three bare `polish:` commits, which moved
  the lookup's floor past unreviewed work; the next two by hand from the
  floor f680c86a, committing `polish(12b):`. The skill should brief `/polish`
  over a big range as named slices (`/dry` by directory, then `/tend-prose`
  by lens), every commit scoped but the last, and the closing agent told to
  land the bare `polish:` by ~150k with any short remainder listed in it.
- **A bite's end retires the last bite's leftovers, or the branch drowns
  in them.** By bite 12b PR #57 carried 966 files, about 600 of them earlier
  bites' briefs, hand-over notes and frames that no session opened again.
  The operator asked for a habit: retire them, leaving a tombstone that
  names the last commit holding them, and retire a bite's frames once the
  next bite's land («не храня всё это в живой ветке»). The skill should put
  "retire the previous bite's notes and frames" in the bite-end order,
  after the new frames are committed, with one row per directory in
  `docs/remove-before-merging/retired.md` or `frames/retired.md`.
- **The ~450-line rule needs its own check at a bite's end.** `/polish`
  reads only what changed, so modules that crept past the line over
  several bites went unflagged until 12b's end found four (`game.ts` 498,
  `flower-sight.ts` 484); one split agent brought both logic modules under
  in ~115k. The skill should list `src/` files past ~450 lines in the
  bite-end order and brief a split for each logic module.
- **A frame median on the shared container measures the machine too.**
  12b's "frames after a long walk" lead (27.4 ms against ~17) was a loaded
  container: traced with `__probe.costs()`, every count stayed flat and the
  frames ran 6–12 ms; the approach's 26.2 ms red sat at load 3–4. The skill
  should have every frame measure log the load average beside it, and read
  a median within a few ms of the budget at load > 2 as unsettled, not red.
- **`tsc -p apps/<site>/tsconfig.json` skips the tests.** It passed while a
  test had an implicit-`any` index that the root `tsconfig.json` (and vet)
  rejected. The quick check between commits should be the root project, or
  just the gates vet runs.
- **`/polish` keys its scope on a bare `polish:` subject, and the loop
  never writes one.** Bite-scoped runs wrote `polish(bite 6):` to avoid
  claiming the whole branch was covered, which the lookup skips, so every
  `/polish` from there to `/finalize` re-reads the whole branch. The skill
  should say which subject a bite's end writes; the bare `polish:` is the
  better choice, since the range since the last bite's end is exactly what
  the lookup would otherwise compute. **The lookup also needs the history
  to reach the floor**: at bite 12's end a relayed session's shallow clone
  listed 576 commits and no `polish:` among them, read the branch as
  floorless and paused before a whole-branch run; deepened
  (`git fetch --deepen=800`), the floor was bite 11's end, 1868 commits
  down. The skill should deepen until `git merge-base origin/<base> HEAD`
  resolves before trusting an empty lookup, and write the floor's sha into
  the polish agents' brief rather than have each recompute it.
- **A bite's `/polish` is a wave of agents, sized by changed lines.** Bite
  12's ~18k changed lines took fifteen agents over one committed brief
  (`docs/remove-before-merging/bite-12/brief-polish.md`): every `/dry`
  agent spent its context at ~2–4k changed lines and handed back findings
  it had judged but not applied, which a second agent then applied without
  re-reading; `/tend-prose` agents covered ~4–5k lines each. The skill
  should cut `/dry` by area at ~3k lines and `/tend-prose` at ~5k, run all
  `/dry` before any `/tend-prose` on the same files, let a finished area's
  prose start while another's `/dry` runs, and hand cross-area findings to
  whichever agent next owns those files. Bite 14's tail sent one agent at
  ~5k lines anyway, because a successor told to read these notes by their
  index never opened this file: it spent 175k on half of `/dry` and left a
  bare `polish:` over unread work, and two agents split by directory in
  worktrees then finished in ~150k each. So the sizing belongs where every
  session reads it — the plan's standing rules, or the relay's — not only
  here. It also caught two things only a
  wave reading everything finds: topic files stale against the build
  (`bite-12.md` still described the pinhole), and a test rule standing on
  code that production no longer calls.
  Bite 15's ~5k lines ran as four Opus agents in two slices (model/,
  then ui/ + scripts/ + `.claude/costs`), `/dry` then `/tend-prose` per
  slice, each landing a scoped `polish(<pass> <slice>):` commit and the
  orchestrator the bare `polish:` mark after the last: ~110–165k each,
  none ran out. A `/dry` finding it judged ambiguous, or that lay in the
  other slice, went into the next agent's brief as one named code item to
  apply, which closed it without a second `/dry`.
- **Agents' scratch breaks `pnpm test`.** The test glob `**/*.test.ts`
  reaches into gitignored `tmp/`: a subagent's copy of the mushroom sources
  in `tmp/clump/` (to measure old constants), throwaway tests and a
  leftover `git worktree` with debug edits all turned vet red. Moving
  another agent's leftovers aside was flagged by auto mode as interfering
  with another workload. The brief should say: measure old values by
  importing the live modules with overrides, or from a `git worktree` of the
  old commit outside the repo; keep scratch tests out of `tmp/`; remove your
  own worktree before reporting. Excluding `tmp/` from the test glob is the
  alternative worth proposing.
- **`type-overlap` is the gate a new creature trips.** A second creature
  repeats members (`size`, `phase`, `stemBend`, `seed`) the first declared
  inline. The bite checklist for "a new kind of thing" should say: name the
  shared bases first (`Footing`, `Phased`, `Bent`, `Seeded`), then write the
  types.
- **A code span wrapped across a line can break prettier on a nested
  list.** A `` `y u o p [` `` wrapped so its continuation opened the line:
  the first `--write` pushed that line to column 0, the second flattened
  item 10's whole bullet list into a paragraph, and `--check` failed after
  each. The skill should run `prettier --check` after every `--write` on the
  plan, and its prose rule should say never to wrap inside a code span.
- **A review's handling ends with its own vet, since the bite's may not
  have run.** Bite 11's tail found knip, format and type-overlap red, all
  three since the bite's build commits, so the review was read against a
  tree vet would have refused. The full vet also runs past the tool's
  10-minute ceiling (the suite alone is ~6 min with `fliers.test.ts`);
  the harness moved it to the background and it finished, but the brief
  should say to run vet's gates one call each when the whole exceeds it.
- **`gh pr edit` fails** on GitHub's Projects-classic GraphQL deprecation;
  `gh api -X PATCH repos/<o>/<r>/pulls/<n> -F body=@<file>` works. The
  skill's PR steps should use the REST form directly.
- **`prettier --write` renumbers a plan's calls.** Calls are numbered in
  the order they were made, not the order they sit in, so a run of them
  reads to prettier as one ordered list: bite 14's two formatting runs
  turned 22–24 into 12–14 and 36–40 into a sequence, and both reviewers
  found every "call N" pointing at the wrong call. Each call is a
  paragraph of its own with an escaped number (`22\. **…**`), which
  prettier leaves alone. The skill's plan template should start that way.
- **A branch's commit count is mostly the loop's own noise, and both
  sources are cut at the root.** By bite 15 PR #57 carried 2896 commits:
  990 cost rows (the `Stop` hook committed one at every turn's end, and an
  orchestrator's turns end at every agent report and check-in) and 423
  `pull --no-rebase` merges, one per agent push; code was under a quarter.
  The operator asked («откуда стока?»). Each agent now pushes its steps to
  its own `wt/<package>` (restarts still lose nothing) and lands one squash
  commit on the shared branch; the cost hook commits only when an
  operator record (`origin.kind` or a queued attachment's
  `attachment.origin.kind` `"human"`) follows the last row's marker, with
  `/relay` and `/finalize` flushing (52f6bf0b), dogfooded on the branch
  before an upstream issue. Four agents in a row landed one commit each.
  `git push --delete` hangs at the proxy; `gh api -X DELETE
repos/<o>/<r>/git/refs/heads/wt/<package>` works. The skill's common
  brief carries the squash landing from the template.
- **The agents' gates miss knip, and vet nearly misses its clock.** A
  package's brief runs typecheck, eslint, prettier and `type-overlap`, not
  knip, so bite 15's vet went red on thirteen exports nothing read (an
  agent's new helper exported for a test it never wrote, aliases, schemas
  no play parses), some of them bites old. The skill should put
  `pnpm knip` in every package's checks. Vet itself took ~9 min 20 s
  under `flock`, just inside a foreground call's 600 s cap with
  `timeout 590`; the day it passes that, it needs splitting (the build,
  then the gates) rather than a background run.
- **A new session's Artifact publish is refused once.** The URL's live
  copy was never read in this session, so the first publish saves it and
  refuses, and an unchanged resend is refused again until a `Read` of the
  saved file. For a generated build the merge is a check, not an edit:
  diff the saved copy's lines minus the bundle line against the new build
  (only the publish wrapper differs), `Read` its head, publish. The skill
  should do that in one step at a bite's end.
