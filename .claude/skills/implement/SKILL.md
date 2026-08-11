---
name: implement
description: Execute an already-approved plan from docs/plans/ end to end — implement it, verify it, and commit. Invoke as /implement, or /implement <branch> to attach to an existing branch first. Do NOT use to write or revise a plan — that is /plan.
---

This skill is the **execution phase** — what you do once a plan has the operator's go-ahead.
Invoking `/implement` **is** the go-ahead, so there is no plan cycle to open here. If the
operator has not approved yet, that gate lives in `.claude/skills/plan/SKILL.md`; resolve it
there rather than starting to code.

Adapted from the `/implement` skill in `Playgramai/playgramapp`. Differences are noted under
"Local deviations" at the end.

## Branch-name form

`/implement <branch>` means: check out that existing branch, then run this skill. If no branch
token was passed, run against the current branch as-is.

**Canary — a well-formed handoff is a branch token in a session's _first_ user prompt.** The
handoff block exists to open a session on a branch this one is not on, so it goes wrong in two
mirrored ways: it lands in a session that already exists, or it arrives stripped of its branch.

- **`/implement <branch>` as the first prompt, naming a branch other than the current one** —
  the intended path. Attach and proceed, no question.
- **Any other `/implement <branch>` → stop and ask** whether they meant to implement here or in
  a fresh session. That covers both tells: the branch is already checked out (a reflex copy
  right after reading the plan), or an earlier prompt means this session has a life of its own.
  Do not attach, do not flip the plan file, do not touch source until they answer.
- **Bare `/implement` mid-session → no canary.** The ordinary same-session go-ahead; proceed.
- **Bare `/implement` as the first prompt → establish what there is to implement.** A session
  that has done nothing holds no plan in conversation, so the only implementable thing is a
  plan file on the current branch. If `docs/plans/` has nothing in progress, the block was
  copied without its branch token — **ask which branch**, rather than reporting "no plan found"
  and sending the operator after the wrong problem.

## Step 1 — Locate the plan

`ls docs/plans/*.md`. Read the target fully before touching anything.

`docs/plans/` holds plan files and nothing else — reference material a plan depends on goes in
`docs/`, so that this glob keeps returning one obvious answer.

If several plans could be meant, **ask which** (as numbered prose, per `/plan`) rather than
guessing. Never author a fresh plan in this mode.

**A plan that still lists open questions is implementable when they carry recommendations** —
`/plan` writes the recommended option in as the single approach, so the file is executable as
it stands. Implement it, and say in your turn which recommendations you took so the operator
can correct them. Stop only for a fork the plan leaves genuinely open.

The filename encodes lifecycle state. Act on it **before writing any code**:

- `*.draft.do-not-implement.md` — reaching this skill is the go-ahead, so **`git mv` it to
  `*.in-progress.md` as your first action**. In the same commit, delete the line-1 ⛔ banner and
  quote the operator's literal go-ahead in the commit message. Doing this before editing source
  is the point: writing the go-ahead out verbatim is the moment to catch a misread.
- `*.in-progress.md` — already flipped; continue.
- `*.completed.md` — already finished; don't silently re-run. Report and ask.

## Step 2 — Implement

Work through the plan on the current branch.

- **Honour the locked decisions.** A plan's decisions table records choices the operator already
  made. Do not reopen them because a better idea occurs to you mid-implementation.
- **Read every file the plan cites** before editing it — line references go stale.
- **Implement the whole plan.** If one part is blocked, finish everything else and say plainly
  what you left and why. Narrowing scope is the operator's call.
- **Deviate only when the plan is wrong**, and then say so in your report and in the commit
  message. Silent deviation is what makes plans worthless.
- Commit and push after each meaningful unit — the operator reviews from another machine and
  only sees pushed work.
- **Never force-push.** They may be following the branch; force-pushing rewrites history out
  from under them.

## Step 3 — Verify

This repo has no test suite. The real surface is three commands, and all three must pass:

```bash
pnpm install
pnpm lint            # eslint --fix
pnpm format:check    # prettier
pnpm build           # must succeed under output:'export'
```

`pnpm build` is load-bearing: it catches missing translation keys, static-export violations,
and type errors that lint does not.

Then confirm what no command can check:

- Light **and** dark mode, for every element added or changed.
- No horizontal scroll on the page body at 375px — this site is mobile-first. Wide content
  scrolls inside its own container.
- Both `/en/cv` and `/ru/cv` render, if translation files were touched.
- The `/cv` print view, if that page was touched: no orphaned links, no broken page breaks.
- New pages are reachable from somewhere. An unlinked page is not shipped.
- `git status` carries no credentials, third-party confidential material, or other people's
  personal data. **This repo is public**, so committing publishes.

Then `git mv` the plan to `docs/plans/<slug>.completed.md` and commit.

## Step 4 — Report

State what you did, what you verified and how, and anything you deviated from or skipped. If a
command failed, show the output rather than describing it. Report completion only when the work
is done and the checks above actually passed.

**Do not open a PR unless the operator asked for one.**

## Local deviations from the playgramapp original

- **Step 3 replaces `pnpm vet`** with this repo's three commands. There is no test suite, no
  migrations, no monorepo packages, no backend services — rules about those are dropped rather
  than carried over dead.
- **The mandatory `/dry` and `/tighten-docs` passes are dropped** — those skills do not exist
  here. Their intent (catch duplication the plan didn't foresee; cut narration back to
  contract) is worth doing by hand on a large diff.
- **No automatic draft PR.** The original treats implementing an approved plan as consent to
  open one; here the default is to commit and stop.
- **Plan files stay in the repo** rather than being swept before the PR.
