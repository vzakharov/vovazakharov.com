# Relay 1 — muthur sync to 0f16275, paused at the context budget

## 1. Standing constraints

None stated by the operator. The sync lock `muthur-sync-lock-460e11099a57` is
held on this sync's behalf (the parent session claimed it; this session ran
`/update-muthur claimed`) — do not claim another one.

## 2. The conversation

No operator message was typed in this session. It was spawned by the parent
session (`session_015FVowBFW5zv12Bs8vazfKZ`) with the prompt `/update-muthur
claimed`, after the operator said yes to the sync offer there.

- Agent: greeted Vova, cloned the source, found 8 candidate commits
  (`460e110..0f16275`), ran `/task`'s call (plan, then go — no fork without a
  recommendation, and the source's #187 says no approval is needed), wrote and
  flipped the plan, ported four commits, then hit the 200k context-budget
  warning and paused.

## 3. Intent

Pull the agent infrastructure forward from `vzakharov/muthur` per
`.claude/skills/update-muthur/SKILL.md`, the watermark bumped last, ending in
`/polish` and `/pr` (the PR does not exist yet).

## 4. Decisions

- **One PR, no session split.** #187's "split the sync at this commit" is read
  as ordering inside the sync: everything before it ported as usual, then its
  tooling only, then this repo's own reflow.
- **Wrap with this repo's prettier, not the source's `npx`-pinned
  `scripts/prettier.sh`**: a `proseWrap: always` override in `.prettierrc.json`
  for the in-scope globs, enforced by the existing `pnpm format:check` in vet —
  so no `check-markdown-wrap.sh`. The `format-md.sh` hook is translated to call
  the local prettier (and wrap `*.md.staged` with `--parser markdown --prose-wrap
  always`).
- **Wrap scope**: every `CLAUDE.md`, `.claude/**/*.md`, `docs/plans/`,
  `README.md`, `src/**/*.md`, `scripts/**/*.md`. Excluded: `apps/*/public/`
  (served pages and raw `.md` variants — a reflow there is a site change),
  `writing/` (copy-exact drafts pasted into channels that keep newlines),
  `docs/music/` (transcripts). The source wraps all tracked Markdown; this is
  the recommendation written into the plan.
- **No-tables rule** is the source's `opt-in: ask`, taken under the
  watermark's standing `optIn` ("take every opt-in path").
- **`CONTEXT_BUDGET_SUBAGENT`** (this repo's own extension of the context-budget
  hook, absent in the source) was renamed `MUTHUR_CONTEXT_BUDGET_SUBAGENT` with
  the rest.
- **[attn adopters] env checks (b296641, 6631e06)**: none of the old names is
  set in `.claude/settings*.json` or this environment's variables — nothing to
  rename. The report should say the operator's other environments were not
  checked.
- Squash commit 86f2ade is a **translate**: keep the `<type>[(<site>)]:` scope
  rule in `/squash-message`; the deploy gate (`.github/workflows/deploy.yml`)
  reads only the subject prefix, so GitHub's ` (#n)` suffix is harmless.
- "Rung" is the ladder's word for what were table "rows" in CLAUDE.md's routing
  ladder (source's wording).

## 5. Errors and dead ends

- The first port wrote into the real `CLAUDE.md`; reverted and redone in the
  staged copy (`CLAUDE.md` is always loaded). `git merge-file` into the staged
  copy conflicted wholesale (local CLAUDE.md is heavily rewritten), so the
  ladder was hand-edited instead.
- Conflict markers left in `post-tool-context-budget.sh` broke the live hook
  for a few calls; resolved. Grep for markers after every port
  (`git grep -nE '^(<<<<<<<|>>>>>>>) '`).
- The repo's PreToolUse hook rejects `cat`/`sed -n`/`sed -i` on files; rerun
  the identical command or prefix `BATCH_EDIT=1` when the shell is right.

## 6. State

- Branch `update-muthur-md-wrap`, pushed; head `2621814` before this summary.
  No PR yet.
- Plan: `docs/plans/update-muthur-md-wrap.paused.md` — its § "Progress" lists
  done and left precisely.
- Staged: `.claude/staged/CLAUDE.md.staged`, `.claude/staged/.claude/voice/voice.md.staged`.
- Source clone: `tmp/muthur-source` is gone with this container; recreate with
  `scripts/muthur-sync.sh clone tmp/muthur-source`.
- Estimate: this session 2.5 h senior prompter ("the first four of eight source
  commits, each port a judgment call per conflict against locally rewritten
  files"). Remainder handed on: 2.5 h senior prompter (the remaining four
  commits' ports, including the reflow) + 1.5 h middle developer ("wiring the
  Markdown wrap onto the existing prettier, the hook and the vet line is routine
  tooling").

## 7. Pointers

- `docs/plans/update-muthur-md-wrap.paused.md` — the plan and what is left.
- `.claude/skills/update-muthur/SKILL.md` and `watermark.json` — procedure and
  the `adopted`/`declined` lists; the `.claude/context-budget/` note still names
  `auto-relay/`, now `manual-relay/`.
- Port helper used (recreate in the scratchpad): for each file a source commit
  `C` touched, skipping `declined` paths, `.claude/costs/sessions/`,
  `scripts/test_*.py`, the catalog, README/ADOPTING/docs/adopting and the
  watermark: `git merge-file -L local -L base -L source <local> <(C^:f) <(C:f)`;
  new files copied, deleted ones `git rm`'d.
- Source commits left: `c75ea67` (narrow tables rule), `86f2ade` (squash on PR
  title), `a8b1d06` (English keepalive example), `0f16275` (wrap tooling — read
  its body's `Adopters:` paragraph).
- Predecessor transcript: https://claude.ai/code/session_01UByV3uXANx6qHjoQg5Ebv2

## 8. Next step

Resume the paused plan through `/go` (Step 1's `*.paused.md` case), starting at
c75ea67, and carry it through items 5–8, `/polish` and `/pr`.
