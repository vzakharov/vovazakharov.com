---
name: implement
description: Execute an existing plan file from docs/plans/ end to end — make the changes, verify them, and commit. Use when the user asks to implement, build, or execute a plan, or points at a file in docs/plans/. Do NOT use to write or revise a plan — that is /plan.
---

# /implement

Execute a plan from `docs/plans/`. The plan is the specification; your job is to make it
real and verified, not to redesign it.

Adapted from the `/implement` skill in `Playgramai/playgramapp`. See
`docs/plans/playgram-case-study.md` §7 — this version has not yet been reconciled against
that original, and the verification section below replaces that repo's test gates with this
repo's actual surface.

## Procedure

1. **Read the whole plan first.** If the user named no plan, list `docs/plans/` and ask which
   one rather than guessing.
2. **Honour the locked decisions.** A plan's decisions table is a record of choices the user
   already made. Do not reopen them because a better idea occurs to you mid-implementation.
3. **Read every file the plan cites** before editing it. Line references in plans go stale.
4. **Implement the whole plan.** If one part turns out to be blocked, finish everything else
   and say plainly what you left and why — narrowing the scope is the user's call.
5. **Deviate only when the plan is wrong**, and then say so explicitly in your report and in
   the commit message. Silent deviation is the failure mode that makes plans worthless.
6. **Verify** (below). Do not report completion on unverified work.
7. **Commit** on the branch the plan names. Do not push or open a PR unless asked.

## Verification

This repo has no test suite. The real surface is three commands, and all three must pass:

```bash
pnpm install
pnpm lint            # eslint --fix
pnpm format:check    # prettier
pnpm build           # must succeed under output:'export'
```

`pnpm build` is the load-bearing one: it catches missing translation keys, static-export
violations, and type errors that lint does not.

Then confirm by eye what no command can check:

- Light **and** dark mode, for every element added or changed.
- No horizontal scroll on the page body at 375px width — this site is mobile-first. Wide
  content (code blocks, tables) scrolls inside its own container.
- Both `/en/cv` and `/ru/cv` render, if translation files were touched.
- The `/cv` print view, if that page was touched: no orphaned links, no broken page breaks.
- New pages are actually reachable from somewhere. An unlinked page is not shipped.
- `git status` contains no credentials, third-party confidential material, or personal data
  about other people. **This repo is public**, so committing publishes.

## Reporting

State what you did, what you verified and how, and anything you deviated from or skipped.
If a command failed, show the output rather than describing it. Report completion only when
the work is done and the checks above actually passed.
