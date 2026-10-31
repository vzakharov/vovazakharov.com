# How this repo differs from vzakharov/muthur

The record `/update-muthur` reads whole on every sync; its § "The divergence
record" holds the three rules this file keeps.

## Across the tree

- **The operator's standing answer to `opt-in: ask` rows is take**, unless the
  request that starts a sync says otherwise — given 2026-10-08.
- **This repo has a stack, and the files describing it are its own**:
  `CLAUDE.md` (adopted in full, with § "Language" filled in, and none of the
  source's stackless-vet clause, since `scripts/vet.sh` is real),
  `scripts/vet.sh`, `.claude/rules/stack.md`, `.gitignore`, `.prettierignore`
  and `.prettierrc.json`. A source edit to any of them is read for the idea; the
  file never lands.
- **Issues are filed by hand here**, `/propose-issue` being declined below, so
  every source passage that hands filing to it says the mechanics instead:
  `.claude/skills/go/SKILL.md` (the parent first where it does not exist),
  `.claude/skills/pr/SKILL.md` (the filing in the plan replaces the lost turn),
  `.claude/skills/plan/SKILL.md` (other work is found by reading the open issue
  list), `.claude/skills/plan/carving.md` (states the `gh issue create` and
  `sub_issues` mechanics inline, without the dedupe pass, the judgment half
  verbatim) and `.claude/skills/issue/SKILL.md` (the redirect, taken because
  `/issue` was the shipped name here; its no-number branch names `/task` and
  says filing is by hand).
- **`docs/adopting/` is declined, so nothing here cites it**:
  `.claude/hooks/gh-shim.sh` points at `.claude/skills/override-gh/SKILL.md`,
  which states the unproxied path's risk and its tell itself, and
  `.claude/rules/multi-repo.md` and `scripts/pr-comment.sh` say where the
  source's `web-remote.md` lives.
- **No skill here ships to adopters**, so `.claude/skills/task/SKILL.md` gives
  its bare mentions the routing as their reason, and
  `.claude/skills/tend-prose/SKILL.md` sends a procedure to a skill rather than
  a runbook page.

## Re-expressed paths

- **`.claude/rules/README.md`** — one paragraph of this repo's own: a directory
  whose files are served keeps its conventions in a rule file there, since a
  `CLAUDE.md` under `sites/*/public/` would be published with the site.
- **`.claude/rules/markdown-wrap.md`** — the wrap runs through the prettier
  `package.json` already pins, as a `proseWrap: always` override in
  `.prettierrc.json` that `pnpm format:check` enforces, so `scripts/prettier.sh`
  and `scripts/check-markdown-wrap.sh` are not here and
  `.claude/hooks/format-md.sh` calls the prettier under `node_modules`. The
  scope is agent-facing and repo-doc Markdown; the content trees keep their line
  breaks.
- **`.claude/rules/staging.md`** — the early swap and the size-cap trim point at
  `CLAUDE.md` § "About this file" and the check's own failure, which carry them
  here.
- **`.claude/skills/CLAUDE.md`** — states that the closure check's catalog
  assertions skip here by design.
- **`.claude/context-budget/hooks/post-tool-context-budget.sh`, with
  `.claude/context-budget/test_context_budget.py`,
  `.claude/context-budget/budget_harness.py` and
  `.claude/context-budget/CLAUDE.md`** — carry `MUTHUR_CONTEXT_BUDGET_SUBAGENT`:
  a subagent gets its own notice, read off its own transcript, and the harness
  builds that transcript for the tests.
- **`.claude/costs/sessions/`** — the rows are this repo's own, on its
  `cost-ledger` branch, and never synced.
- **`.claude/hooks/lib.sh`** — its header also names `maya-preview.sh` among the
  hooks that source it.
- **`.claude/settings.json`** — wires this repo's own hooks beside the source's
  (`.claude/hooks/allow-add-repo.py` among them) and allows its own commands.
- **`.claude/hooks/install-deps.sh`** — carries this project's
  `corepack enable pnpm` and `pnpm install --frozen-lockfile` where the source
  ships a TODO.
- **`.claude/hooks/file-tools-nudge.py`** — cites `vzakharov/muthur#118`, so it
  does not resolve to this repo's own #118.
- **`.claude/voice/operators/vzakharov.md`** — the same operator's entry, kept
  here by them and possibly ahead of the source's. Another operator's file is
  their own, never a port.
- **`.claude/skills/finalize/SKILL.md`** — Step 1 pushes before vetting, because
  `scripts/vet.sh` vets the pushed head and refuses a tree that differs from it.
- **`.claude/skills/finalize/merge.md`** — gives `pnpm styles:codegen` as its
  fixer example, and says that here the merge is the deploy.
- **`.claude/skills/sync-branch/SKILL.md`** — Step 5 pushes before vetting, for
  `/finalize`'s reason, and Step 6's push is then a no-op.
- **`.claude/skills/squash-message/SKILL.md`** — the title allows a site scope,
  `<type>[(<site>)]:`, because the scope picks which site a merge publishes
  (`CLAUDE.md` § "Deployment"), and the types are the ones `CLAUDE.md` lists. A
  re-copy of the source's unscoped rule makes every merge publish every site.
- **`.claude/skills/plan/SKILL.md`** — the handoff offers both a fresh session
  and a go-ahead in this one, neither as the rule.
- **`.claude/skills/plan/elephant.md`** — points unattended runs at
  `.claude/skills/megabeast/notes/README.md`, this repo's own.
- **`.claude/skills/preview/SKILL.md`** — hydrated for this stack where the
  source ships a stub.
- **`.claude/skills/take-issue/SKILL.md`** — two accommodations that make a
  `user-attachments` download work here: S3 rejecting a second auth mechanism,
  and the egress proxy refusing the path.
- **`.claude/skills/take-issue/video-frames.md`** — says the `apt-get update`
  before installing ffmpeg is load-bearing.
- **`.claude/skills/bootstrap-workflow-dispatch/SKILL.md`** — without the
  source's `/test-on-gh` pointer: `preview.yml`, dispatch-only, is what makes
  the 404 reachable here.
- **`.claude/skills/spinoff/SKILL.md`** — states the stackless-vet rule itself
  rather than citing the source's `CLAUDE.md` clause, and reads the catalog link
  as any skill's `catalog.md`.
- **`.claude/skills/update-muthur/SKILL.md`** — hydrated for this repo, where
  the source ships a stub, its watermark section describing this repo's file,
  with paragraphs of its own: the record naming a renamed path the source's way,
  Step 3's backtick match, the unit of triage, the renumbered-reference trap,
  the passes that leave a `take` verbatim, the clone with no working tree, and
  the merge of an unmentioned path. It drops what addresses a repo this one is
  not: one with no record, one without the PR loop, one with no standing answer
  to opt-in rows (offered by their own path at the source), and one still
  carrying the source's cost rows, which live on `cost-ledger` here.

## Declined

- **`.claude/skills/audit-github-backlog/`** — the backlog is a handful of
  issues an operator reads in one sitting; revisit when a sweep beats reading
  it.
- **`.claude/skills/propose-issue/`** — issues are opened by hand, and the
  backlog is too small to dedupe against; revisit when filing becomes routine.
- **`.claude/skills/test-on-gh/`** — nothing runs on pull requests, and the bare
  vet run dispatches the whole suite to CI itself, leaving no bucket for a
  dispatcher to pick; revisit if a check appears that needs a browser, a
  service, or minutes rather than seconds.
- **`.claude/skills/hotfix/`** — `main` deploys straight to Pages, so there is
  no promotion path to bypass.
- **`.claude/skills/release/`** — merging to `main` deploys; there is no
  versioned release to cut.
- **`.claude/skills/log-review/`** — a static site has no deployed logs.
- **`.claude/skills/readonly-probe/`** — no production datastore.
- **`.claude/skills/renumber-migration/`** — no migrations.
- **`.claude/skills/implement/`** — never: the redirect stub earns its place
  only right after the rename to `/go`, and that window is closed.
- **`.claude/skills/detemplate/`** — never: this repo took its infrastructure by
  subset copy, not by forking the template.
- **`.claude/skills/update-muthur/catalog.md` and
  `.claude/skills/update-muthur/catalog/`** — never: the source's inventory of
  its own tree, read from the clone at Step 4a; the closure check skips its
  catalog assertions without it.
- **`ADOPTING.md` and `docs/adopting/`** — never: the source's guide for a repo
  taking the template on, which this one did once. A repo adopting from here
  would need its own.
- **`README.md`** — never: each repo's describes that repo.
- **`scripts/check-muthur.sh` and `scripts/check-repo-identity.sh`** — never:
  both key on the catalog and exit 0 downstream, which is the source stating
  that an adopter runs none of it.
- **The unit tests over the source's own scripts** — never: the suite stays
  where that code is edited, and the code itself is taken. A new one is declined
  here by name, as these are: `scripts/test_authorship.py`,
  `scripts/test_checkpoint_review.py`, `scripts/test_claude_md_size.py`,
  `scripts/test_export_awaiting.py`, `scripts/test_export_render.py`,
  `scripts/test_extract_session_images.py`, `scripts/test_file_tools_nudge.py`,
  `scripts/test_find_repo.py`, `scripts/test_go_delegation.py`,
  `scripts/test_markdown_tables.py`, `scripts/test_markdown_wrap.py`,
  `scripts/test_multi_repo_hooks.py`, `scripts/test_muthur_sync.py`,
  `scripts/test_relay_last_reply.py`, `scripts/test_staged.py`.
