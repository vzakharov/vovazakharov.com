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
  tree vet would have refused. The full vet also passes the tool's
  10-minute ceiling now (the suite alone is ~6 min with `fliers.test.ts`);
  the harness moved it to the background and it finished, but the brief
  should say to run vet's gates one call each when the whole exceeds it.
- **`gh pr edit` fails** on GitHub's Projects-classic GraphQL deprecation;
  `gh api -X PATCH repos/<o>/<r>/pulls/<n> -F body=@<file>` works. The
  skill's PR steps should use the REST form directly.
