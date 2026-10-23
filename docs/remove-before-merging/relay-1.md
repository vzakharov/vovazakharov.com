# Relay 1 — vet split: draft plan published, naming under discussion

## 1. Standing constraints

None stated in this session.

## 2. The conversation

1. **Operator** (session launch, from the predecessor's relay): `/relay take claude/vet-on-pull-requests — land PR #192: finalize and merge.`

   **Agent:** ran `/finalize and merge` on #192: staged swap, `/polish` (acb28eb), corrected the PR body's disproved "`needs` lags by minutes" line, vet green, merged `main` (one conflict in `writing/notes/the-five-percent.md`, both sides kept), vet green again, swept, attested. Stood the merge down because of the conflict (merge.md Step 2 rule). Asked whether to drop "then" from CLAUDE.md § "Vetting".
   A forward from the predecessor (session_014Zp5xJCAydc7UuhaoCGTZf) carried the operator's «это не "можно" для меня, это то, что должна сделать следующая (или послеследующая) сессия, когда мёрджнем» — i.e. the vet-split task is due once #192 merges. Verified against the predecessor's user turns.

2. **Operator:** «поправь здесь же»

   **Agent:** fixed the sentence via a staged copy (now "every site's build, lint, type-check, format-check, the repo's own gates and the tests, as parallel jobs on GitHub's runners"), swapped, vet green on eeca231, attestation updated.

3. **Operator:** «мерджнул, можно идти дальше. новую сессию запускать необязательно, просто считай это новой таской. новую сессию можно запустить на _muthur_, но уже после того как разберёмся здесь»

   **Agent:** #192 merged as 4b194cf. Routed the vet split through `/task`: measured the phases locally, wrote `docs/plans/split-vet.draft.do-not-implement.md`, opened draft PR #199 with a squash proposal. Call: plan and hand off (naming was explicitly the operator's open question). Plan recommended `vet.sh` (fast, local) + `vet-full.sh` (the GitHub run, only at `/finalize`).

4. **Operator:** «с названиями не уверен "vet -- быстрая проверка", а потом "а вот вам полный vet" говорит как будто бы это "полная быстрая проверка". какие ещё есть варианты, давай поидеируем»

   **Agent:** reframed: the two differ in role, not size, so name by role. Five options: (1) `check.sh` fast + `vet.sh` heavy — "to vet" means thorough pre-admission scrutiny, and this repo's prose already uses "vet" for the gate, so almost nothing renames here; muthur renames its fast `vet.sh`; con: `check.sh` reads as umbrella of `check-*.sh`. (2) `smoke.sh` + `vet.sh` — fast part is more than a smoke test. (3) `pre-push.sh` + `pre-merge.sh`. (4) `vet-local.sh` + `vet-ci.sh` — leaks implementation. (5) `vet.sh` + `land-check.sh`. **Recommended (1).** Under (1) the plan flips: bare `vet.sh` stays the GitHub run, new fast `check.sh` runs at `/finalize` Step 1 and `/sync-branch` Step 5, and the new pre-attestation step runs `vet.sh`. Asked which option to take before rewriting the plan and PR body. **No answer yet.**

## 3. Intent

Split vet: a fast local check, and the heavy GitHub run only `/finalize` makes, with names that hold up for muthur. Then — only after this repo's side is settled — a session on **muthur** proposing the stub and names upstream. The operator does not need a new session for this repo's side.

## 4. Decisions

- Fast run (measured, 4-core container): `source`+`typecheck`+`local` in parallel 57 s; whole-tree lint 95 s, two files 8 s → plan lints only changed files in the fast run (open question 2 in the plan).
- The heavy run goes after `/finalize`'s sweep, before the attestation, so it verifies exactly the attested SHA.
- `gate.sh` rejected: `deploy.yml` already has a `gate` job meaning the publish switch.
- Naming: pending operator choice; plan file still says `vet.sh` + `vet-full.sh`.

## 5. Errors and dead ends

- The local clone was shallow, so `git merge origin/main` said "unrelated histories"; `git fetch --unshallow` fixed it.

## 6. State

- Branch `claude/split-vet` off `main` @ 4b194cf; PR https://github.com/vzakharov/vovazakharov.com/pull/199 — open, draft.
- Plan: `docs/plans/split-vet.draft.do-not-implement.md` — draft, not approved.
- Squash proposal: `docs/remove-before-merging/squash-message.md`, posted as PR comment 6358704815 (written for the `vet-full.sh` naming).
- Nothing running; no PR subscription, no check-in.
- Estimate: this session 1 h senior developer (land prep of #192) + 0.5 h staff architect (the split's shape and naming). Remainder handed on: ~1 h staff architect (settle naming, rewrite plan) + ~2 h senior developer (implement across `vet.sh`, skills, `stack.md`, CLAUDE.md, watermark).
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/split-vet.draft.do-not-implement.md` — the plan.
- `scripts/vet.sh`, `.github/workflows/vet.yml`, `.claude/rules/stack.md` — the run today.
- `.claude/skills/finalize/SKILL.md` Step 1/6/7, `.claude/skills/sync-branch/SKILL.md` Step 5, `.claude/skills/finalize/merge.md` — callers to re-point.
- `.claude/skills/update-muthur/watermark.json` — rows for `/finalize`, `/sync-branch`, `scripts/vet.sh`.
- This session's transcript: https://claude.ai/code/session_01Ay5R381kxbdP1ksi4Y7TCK

## 8. Next step

Wait for the operator's pick among the naming options (message 4 above, recommended option 1 `check.sh` + `vet.sh`). On their answer, rewrite the plan, PR body and squash proposal to it; the plan stays a draft until a go-ahead.
