# Playgram (`Playgramai/playgramapp`) — Facts Dossier

**Mined:** 2026-08-11. **HEAD:** `4cd68a75aacff81442e6d0dc9d5219f3b6015de6` on `main` — `feat: #2084 park a workspace's Weaviate tenant with its access (pr #2341)`.
**Repo visibility:** private (GitHub GraphQL `repository.isPrivate = true`). **Repo created:** 2026-03-06T12:37:15Z. **GitHub `diskUsage`:** 444,921 KB.

> **Mining note that affects reproducibility.** The session's clone was **shallow** (`.git/shallow` present, 50 commits, oldest `2ab4d8d` dated 2026-08-06). Every count below was computed **after** `git fetch --unshallow --no-tags origin main` + `git fetch origin --tags`. If you re-run any command in this dossier on a fresh Claude Code web clone, unshallow first or every history number will be wrong.

> **STATUS NOTE, added 2026-08-11 after a verification pass against a full clone of `playgramapp`.**
> This document was written as the only source for a repo the writing session could not open.
> That is no longer true — the `gh` shim in `.claude/hooks/session-start.sh` plus `GH_TOKEN`
> make the repo clonable, so **this dossier is now an index, not a source.** Verify anything
> before publishing it.
>
> The computed numbers held up well (LOC, per-author commits and lines, trailer tallies, weekly
> cadence, anchor SHAs all reproduce within the drift of one new commit). Several claims did
> not. `docs/plans/playgram-case-study.md` § 2 carries the full list; the load-bearing ones are
> annotated inline below. Known-wrong: the § 7.4 / § 7.5 review claim, the migration count
> (§ 6, § 9), the `pnpm vet` check count (§ 4.5, § 9), the `.claude/rules/` file count (§ 2.2,
> § 4.1), and the release-commit count (§ 3.3). Also note the RLS material in § 2.3 and § 8:
> the code is as described, but `docs/decisions/auth-and-tenancy.md` records a *different*
> decision that was never built — the dossier missed the drift entirely.

---

## SECTION 0 — `/plan` and `/implement`, verbatim

### 0.1 Where they live

There is **no `.claude/commands/` directory**. Slash commands in this repo are Claude Code **skills**: `.claude/skills/<name>/SKILL.md`, invoked as `/<name>`. `/plan` and `/implement` are `.claude/skills/plan/SKILL.md` (84 lines) and `.claude/skills/implement/SKILL.md` (83 lines).

`AGENTS.md` does not exist at the repo root. (One did exist historically at `bubble/AGENTS.md` — consolidated away in `22808571a`, "docs: consolidate and streamline CLAUDE.md and bubble/AGENTS.md (#825)", 2026-05-25.) The root instruction file is `CLAUDE.md` (33,463 bytes). Its `## Plan mode & questions in web sessions` section is the CLAUDE.md-side half of the `/plan` contract and is reproduced in § 0.5.

### 0.2 Full `.claude/` tree

45 files. Verbatim `find .claude -type f | sort` output, with line counts:

```
.claude/gh-repo.json                                     4
.claude/hooks/session-start.sh                          63
.claude/rules/backfills.md                             410
.claude/rules/database.md                               60
.claude/rules/dependencies.md                           46
.claude/rules/eslint.md                                 36
.claude/rules/fsd.md                                    26
.claude/rules/styling.md                                17
.claude/rules/testing.md                                55
.claude/rules/tmp-visual-tests.md                       24
.claude/rules/weaviate.md                               69
.claude/settings.json                                   15
.claude/skills/audit-github-backlog/SKILL.md           317
.claude/skills/audit-github-backlog/analyst-rules.md   118
.claude/skills/autopilot/SKILL.md                      135
.claude/skills/bootstrap-workflow-dispatch/SKILL.md     92
.claude/skills/branch-rename/SKILL.md                   29
.claude/skills/check-merge/SKILL.md                     61
.claude/skills/dry/SKILL.md                            111
.claude/skills/explore/SKILL.md                          9
.claude/skills/finalize/SKILL.md                       102
.claude/skills/fix-ci/SKILL.md                          52
.claude/skills/from-branch/SKILL.md                    128
.claude/skills/hotfix/SKILL.md                         272
.claude/skills/implement/SKILL.md                       83
.claude/skills/issue/SKILL.md                          116
.claude/skills/log-review/SKILL.md                     702
.claude/skills/override-gh/SKILL.md                      9
.claude/skills/plan/SKILL.md                            84
.claude/skills/pr/SKILL.md                             118
.claude/skills/preview/SKILL.md                        181
.claude/skills/propose-issue/SKILL.md                   54
.claude/skills/qa-checklist/SKILL.md                    90
.claude/skills/readonly-probe/SKILL.md                 143
.claude/skills/release/SKILL.md                        321
.claude/skills/renumber-migration/SKILL.md             228
.claude/skills/roundtable/SKILL.md                     224
.claude/skills/squash-message/SKILL.md                 241
.claude/skills/sync-branch/SKILL.md                    152
.claude/skills/synthesize/SKILL.md                      51
.claude/skills/test-on-gh/SKILL.md                     123
.claude/skills/tighten-docs/SKILL.md                   152
.claude/skills/update-docs/SKILL.md                     87
.claude/skills/update-tests/SKILL.md                   139
.claude/skills/watch-ci/SKILL.md                        84
.claude/skills/weigh/SKILL.md                           25
                                                  ─────
                                            total  5,658
```

`.cursor/` also exists (3 files): `.cursor/Dockerfile`, `.cursor/environment.json`, `.cursor/scripts/cloud-install.sh` (14 LOC total).

### 0.3 `.claude/skills/plan/SKILL.md` — COMPLETE VERBATIM

````markdown
---
description: File-based stand-in for plan mode and AskUserQuestion, for web/remote sessions where those UIs are buggy. Write the plan to a reviewable file under docs/plans/ instead of using ExitPlanMode, and ask clarifying questions as numbered prose instead of AskUserQuestion. Use in a remote/web session whenever you would otherwise enter plan mode or call AskUserQuestion.
---

## Why this skill exists

In Claude Code **web/remote** sessions, the plan-mode approval UI and the `AskUserQuestion` tool are unreliable: after a session sits idle, the backend appears to re-wake it and re-emit the pending plan/question prompt repeatedly, so on return the operator sees the plan (or question) stacked several times, answers given to the superseded prompts are silently lost, and the count scales with idle duration. Since operators run many concurrent web sessions, prompts routinely sit idle — so these two UIs can't be trusted here. This skill routes around both: a plan becomes a file the operator can pull and review at their leisure, and questions become prose that survives in the transcript.

Tracking issue (check here for exact wording / current status): **https://github.com/anthropics/claude-code/issues/72704**

## Part 1 — Plan instead of plan mode

A `/plan` session's deliverable is the **pushed plan file**, not code. The operator reviews it from another machine, often hours later, and begins implementation in a **different** session via `/implement <branch>` (`@.claude/skills/implement/SKILL.md` routes that through `/from-branch`, which attaches to the branch and finds the plan under `docs/plans/`) — the handoff works because the plan file rides the branch. So a plan turn ends in a handoff, not a continuation; same-session implementation is the rare exception.

Do **exactly what you would do in plan mode** — same research, same rigor, same "don't touch code until approved" discipline. The _only_ difference is where the plan goes and how it's approved:

- Instead of presenting the plan via `ExitPlanMode`, **write it to `docs/plans/<branch-slug>.draft.do-not-implement.md`** (one file per session; name it after the current branch's task slug, or the issue number when working an issue — e.g. `docs/plans/1234.draft.do-not-implement.md`). The `.draft.do-not-implement.md` suffix is load-bearing: it is the on-disk marker that this plan has **not** been approved, visible in every `ls`, tool-call path, and `git status` so you can't drift past the gate without noticing. This directory is **not** gitignored on purpose: **commit and push it** so the operator can pull and review the plan from another machine. Follow the repo's usual plan-content expectations, including the `## DRY notes` section CLAUDE.md requires.
- **Make line 1 of the file a banner** that restates the gate:
  ```
  > ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.
  ```
- Then **end the turn with the handoff block** (§ "Handing off" below) and stop — do not start implementing.
- **The in-session path is the exception, not the default.** If a literal go-ahead token does arrive in _this_ session, "The approval gate" below governs it unchanged — and on approval you hand off to `@.claude/skills/implement/SKILL.md`, whose Step 1 performs the flip that unlocks source edits (`git mv` the plan to `docs/plans/<branch-slug>.in-progress.md`, drop the draft banner, quote the go-ahead in the commit) as its first action, before any source edit. That flip is the on-record receipt that approval was given, so don't front-run it here; the mechanics live in `/implement` to avoid two copies drifting apart. The gate is exactly as strict on this path as on any other; it just fires rarely.

### Handing off — end the plan turn with a copyable `/implement` block

Get the branch with `git branch --show-current` and substitute the real name. Introduce the block with wording that **names the new session** — `To implement — start a new session with:`, or an unmistakable equivalent. That lead-in is what carries the session model to the operator; a bare "To implement:" reads as an offer to do it here, which is the misreading the block exists to remove. Emit the command in a fenced block containing **only** the command — no language tag, nothing else inside the fence — so it can be copied verbatim:

`````
```
/implement claude/add-usage-charts-k3n2af
```
`````

- Emit it at the end of **every** turn that leaves the plan in a reviewable, complete state — the turn that first writes the plan, and any later turn that revises or collapses it (Part 3). One block per turn, as the last thing in the reply.
- **Open questions don't hold the block back when they carry recommendations.** Part 2 requires every fork to name a recommended option _and_ the plan file to be written with that option already in force, so implementing it unanswered is the same as adhering to the recommendations. Emit the block alongside the questions: an answer that differs revises the plan, and silence is a valid resolution. Hold the block only for a fork with no recommendation, where the plan has nothing executable to say until the operator picks — handing over a command to implement a genuinely unresolved fork invites implementing the wrong one.
- **Never** close a plan turn with "Want me to implement it?", "Shall I proceed?", "Ready for me to start?", or any equivalent. Two reasons: the plan session does not implement, so there is nothing to ask; and a turn that ends on that question trains the agent to read the operator's _next_ message as an answer to it, so a correction ("actually, do X instead") gets taken as assent and code starts getting written. The handoff block is the structural fix that the approval gate's "a suggestion is a plan revision" and Part 3's "picking an option is not a signal to implement" can only exhort.
- The block is built for a session that does not exist yet, which is why the lead-in names it. Pasting it back into _this_ session is a recognizable mistake with its own guard — see `@.claude/skills/implement/SKILL.md` § "Branch-name form" for the canary that catches it.

### The approval gate

**Only start implementing when the operator's message literally contains a go-ahead token** — "go ahead", "let's go ahead", "implement", "let's implement", or an unmistakable equivalent ("ship it", "do it", "proceed", "lgtm go"). Until such a token arrives, you are still in the planning conversation, no matter how the exchange evolves.

- **A suggestion to do something differently is a plan revision, not a go-ahead.** When the operator proposes an alternative approach, tweak, or "how about we…", that means **update the plan file (or discuss it) to reflect the new direction** — it does **not** mean start coding with the suggestion folded in. Reflect the change in the plan and wait for the token.
- **The exception is a combined message:** if the same message pairs a suggestion _with_ a go-ahead token — e.g. "let's do X instead of Y and implement", "go ahead, but use Z" — then apply the suggestion and proceed. The token is what unlocks implementation; the suggestion just adjusts what you implement.
- **When unsure whether a reply is approval, treat it as not-yet-approved** — and resolve the ambiguity by re-emitting the handoff block, not by asking for a yes. A false start costs more than one more round-trip: reverting speculative code and re-aligning is worse than handing the command over again.
- Approval is scoped to the plan as it stands when the token is given. A go-ahead on Monday's plan doesn't authorize a materially different Tuesday reshaping — re-confirm if the plan changed since.
- The `*.draft.do-not-implement.md` → `*.in-progress.md` rename is the **single act** that unlocks source edits, and it belongs at the moment of the go-ahead — as the first thing you do after it, not retroactively once code is already written. If you catch yourself about to edit source while the file still says `do-not-implement`, that is the gate firing: stop and check whether the go-ahead token actually arrived.

This gate applies to the **initial** transition from planning to implementing. Once you're past it and actively implementing an approved plan, the "Scope" section below governs: follow-ups are handled directly, including code changes the operator asks for, without reopening a plan cycle.

### Plan file lifecycle

The plan file carries its state in its name, and moves through it by `git mv` (the base slug never changes):

1. `docs/plans/<slug>.draft.do-not-implement.md` — written here, awaiting the operator's go-ahead.
2. `docs/plans/<slug>.in-progress.md` — flipped as the first post-go-ahead action (above); `@.claude/skills/implement/SKILL.md` owns implementing against it.
3. `docs/plans/<slug>.completed.md` — flipped by `/implement` once implementation and its quality passes are done, just before the draft PR.

Every state still matches `docs/plans/*.md`, so consumers that glob the directory (`/implement`, `/from-branch`, `/finalize`, `/tighten-docs`) keep working unchanged.

The plan file is a working artifact, not a deliverable: it rides the branch for review but must **never land on `main`**. `@.claude/skills/finalize/SKILL.md` deletes the entire `docs/plans/` tree in the last commit before `gh pr ready` (any suffix — `git rm -r docs/plans/`), so the add-then-delete pair cancels out in the squash — the same lifecycle as `docs/issue/`. Do **not** delete it yourself mid-task; leave that to finalization.

## Part 2 — Questions as numbered prose instead of AskUserQuestion

When you would otherwise call `AskUserQuestion`, **ask the same questions, with the same options you'd have offered** — just render them as prose in your chat reply instead. Preserve the fast-answer affordance: **number each question and letter each option**, and state which option is the default/recommended, so the operator can reply tersely (e.g. "1b, 2a, 3-default") without typing prose back. This keeps the whole exchange in the durable transcript rather than in the flaky question UI.

**A recommendation is a commitment, not a lean.** Write the plan file with the recommended option already in force as its single approach — the same collapse Part 3 performs when the operator picks — so an open question degrades into "the recommendation stands" instead of a blocked fork, and the plan is implementable as written no matter which questions go unanswered. That is what lets the handoff block go out with questions still open (Part 1) and lets `/implement` proceed without the answers (`@.claude/skills/implement/SKILL.md` § "Step 1"). A fork you can't recommend either way is the exception, and it does block: say so explicitly in the plan rather than picking silently.

## Part 3 — When the operator picks an option

Whenever the operator resolves one of the option forks you presented — by choosing an option, in whatever words ("the recommended one", "B", "the retry approach", "not the fixed cap") — **rewrite the plan so the chosen option _is_ the plan**: written as the single approach, in the imperative, as if it had never been one of several. No special keyword is required; a plain choice is the trigger. This is the one sanctioned plan rewrite, distinct from the "don't churn the plan after approval" rule in Part 1 (which forbids re-editing per code change during implementation — collapsing a resolved fork _before_ implementing is expected and wanted).

**Picking an option is not a signal to start implementing.** Collapse the plan and then stop — and here "stop" means ending the turn with the handoff block (Part 1 § "Handing off"), same as any other turn that leaves the plan reviewable. Unless the operator's message _also_ explicitly asks you to begin (e.g. "pick B and implement it"), a bare choice means "record this decision," not "go" — when in doubt, hand the command over instead of writing code.

**Delete the rejected options' exposition to save context** — the plan gets re-read on every resume, so carrying dead alternatives is a standing tax. You may keep a brief note of what was rejected, but cap it at **one paragraph covering _all_ rejected options for that fork** (per fork), stating just what was ruled out and the one-line why (especially when the "why" is a hard finding worth not rediscovering). Drop the per-option cost/mechanics detail entirely. If several independent forks were resolved, each may keep its own one-paragraph note.

Then commit and push the rewritten plan (this refresh is explicitly wanted, so it's not the churn Part 1 warns against).

## Scope

This is a **web/remote-session** workaround, and it applies to **new** sessions — see CLAUDE.md ("Plan mode & questions in web sessions") for exactly when it's mandatory vs. optional. It is **not** for continued work: once a plan has been approved and you're implementing, handle the operator's follow-ups directly — answer their questions in chat **and implement any code changes they ask for** — without re-writing the plan file or reopening a plan cycle.

A `/from-branch` launch counts as continued work, not a new session: the skill attaches to an existing branch or PR to resume work started elsewhere, so **do not open a plan cycle for it** — even though it's the first message of the session. Follow its embedded follow-up (or wait for the operator's) directly. The only exception is if that follow-up explicitly asks you to plan a fresh, separable piece of work.
````

> Reproduction note: inside the real file, the `/implement` handoff example is a **4-backtick** fence containing a 3-backtick fence. The block above is shown in a 5-backtick fence so the nesting survives this dossier; when you copy it into another repo, restore the original nesting (outer 4 backticks, inner 3).

### 0.4 `.claude/skills/implement/SKILL.md` — COMPLETE VERBATIM

```markdown
---
description: >-
  Execute an already-approved plan end-to-end: implement it, then run the
  mandatory quality passes (/dry, /tighten-docs) and open
  a draft PR. Built to follow the /plan file-based stand-in, but also works with
  a plain approved plan. Invoke as `/implement` (or `/implement <branch>` to
  attach to an existing branch first).
---

This skill is the **execution phase** — what you do once a plan has the operator's go-ahead. It assumes approval already happened: invoking `/implement` (or reaching it via the `/plan` approval gate, or `/from-branch … implement`) **is** the go-ahead, so there's no plan cycle to open here. If you're mid-planning and the operator hasn't approved yet, that gate lives in `@.claude/skills/plan/SKILL.md` — resolve it there first, don't start coding.

## Branch-name form

`/implement <some/branch>` is shorthand for `/from-branch <some/branch> /implement` — attach to that existing branch, then run this skill. Load `@.claude/skills/from-branch/SKILL.md` and follow it to attach (it re-points the working tree and discards the auto-branch), then continue from Step 1 below. If no branch token was passed, `/implement` runs against the current branch as-is.

The branch form is the **normal** entry point, not an edge case: it is the command a `/plan` session hands the operator at the end of its turn, so implementation usually starts in a session that has to attach before it can do anything (see `@.claude/skills/plan/SKILL.md` § "Handing off").

**Canary — a well-formed handoff is a branch token in a session's first user prompt; every other shape is a copy that didn't land intact.** The block exists to _open_ a session on a branch this one is not on, so it goes wrong in two mirrored ways: it lands in a session that already exists (a branch token where it does not belong), or it arrives stripped of its branch (nothing to attach to).

- **`/implement <branch>` as the session's first user prompt, naming a branch other than the current one** is the intended cross-session path — attach as documented, no question.
- **Any other `/implement <branch>` → stop and ask** whether they meant to implement here or in a fresh session. That covers both wrong-box tells: the branch is already the current one (dead weight — usually a reflex copy right after reading the plan), or an earlier user prompt in this session means the block was pasted into a session with a life of its own. Do not attach, do not flip the plan file, do not touch source until they answer. Without this the already-checked-out tell is invisible: `@.claude/skills/from-branch/SKILL.md` § "Failure modes to call out" says "Target branch already checked out — skip Steps 2–4 and proceed to Step 6", so the attach degrades into a silent no-op and implementation just starts.
- **Bare `/implement` mid-session → no canary, no question.** That is the ordinary same-session go-ahead: the plan was made here and its context is in the conversation. Proceed straight to Step 1.
- **Bare `/implement` as the session's first user prompt → establish what there is to implement before proceeding.** A session that has done nothing yet holds no plan in conversation, so the only implementable thing is a plan file on the branch already checked out. On a harness auto-branch, or with `docs/plans/` empty, the block was copied without its branch token — **ask which branch**, rather than reporting "no plan found" and sending the operator after the wrong problem. A plan file sitting on a non-auto branch (a session opened straight onto the feature branch) is legitimate — proceed to Step 1.

Asking costs one round-trip. The point is that the operator makes the call knowingly, rather than discovering afterwards that the session they meant to keep as a clean planning record started writing code.

## Planless entry

A caller skill may enter here with a **task** in place of a plan — `@.claude/skills/from-branch/SKILL.md` Step 6's free-form follow-up, and `@.claude/skills/pr/SKILL.md` Step 1a's "no plan" waiver. In that mode:

- **Step 1 is already satisfied** — the caller's task text is the plan. Start at Step 2; do not go looking under `docs/plans/`, and do not ask which plan to implement.
- **Step 3 runs unchanged** — its passes are the reason this entry exists. The trailing `git mv` to `*.completed.md` is a no-op with no plan file.
- **Step 4 runs unchanged.** A branch that already has a PR — the normal `/from-branch` case — stops at `/pr`'s own Step 1b pre-check, which reports the existing PR rather than opening a duplicate.
- **The § "Branch-name form" canary does not apply.** It reads _user-typed_ prompts for a handoff block that lost its branch or landed in a session with a life of its own; a skill-to-skill dispatch already holding the task is neither.

Planless is not gateless: locating a plan is the only thing this entry skips.

## Step 1 — Locate the plan

The primary target is a `/plan` stand-in file:

- `ls docs/plans/*.md`. A `/plan` session writes exactly one and sweeps it at finalize, so **one file** is the normal case → read it fully; that's the plan.
- **More than one, or none** → don't guess; ask which plan to implement (numbered prose, per `@.claude/skills/plan/SKILL.md`). More than one means an earlier session forgot to sweep — list the candidates. None means either the file was never written or this is the rare plain-approved-plan case where the plan lives in the conversation (native plan mode / agreed in chat) — ask the operator which, and let them point you at it. Never author a fresh plan in this mode.

**A plan that still lists open questions is implementable when they carry recommendations.** `/plan` writes the recommended option into the plan as its single approach (`@.claude/skills/plan/SKILL.md` § Part 2), so the file is executable exactly as it stands and unanswered questions mean the recommendations hold. Implement it as written, and say in your turn which recommendations you took so the operator can correct any of them. Stop and ask only for a fork the plan text leaves genuinely open — no recommendation, nothing executable to fall back on.

The plan file's name encodes its lifecycle state (see `@.claude/skills/plan/SKILL.md` § "Plan file lifecycle"). Act on it **before writing any code**:

- `*.draft.do-not-implement.md` — not yet cleared. Reaching this skill **is** the go-ahead (the operator invoked `/implement`, approved at `/plan`'s gate, or launched `/from-branch … implement`), so **`git mv` it to `*.in-progress.md` as your first action**. In the **same commit**, also **delete the line-1 ⛔ draft banner** — once the file is `in-progress`, a banner that still says "DO NOT IMPLEMENT" contradicts its own state — and quote the operator's literal go-ahead in the commit message (e.g. `chore: begin implementing <slug> (go-ahead: "…")`). Do this before editing source — a file still named `do-not-implement`, or still carrying the banner, means you have not been cleared, and writing the go-ahead out verbatim is the moment to catch a misread. When the plain-approved-plan case has no file at all, there's nothing to flip; the operator's in-chat go-ahead stands.
- `*.in-progress.md` — already flipped (resumed work) → just continue.
- `*.completed.md` — implementation already finished → don't silently re-run; report and ask.

## Step 2 — Implement

Work through the plan on the current branch. Follow the plan as approved; if reality forces a material deviation, note it to the operator rather than silently reshaping scope.

Commit/push discipline is already governed by the system prompt — don't reinvent it here:

- Commit and push proactively after each meaningful unit of work (CLAUDE.md "Git Conventions" — feature branch in a remote/web env; the operator reviews from another machine and only sees pushed work).
- **Never force-push.** The operator may be following the branch as you work and needs the sequence of changes to read cleanly; force-pushing rewrites that history out from under them. Only ever advance the branch with new commits.
- Conventional-commit subjects; descriptive bodies.
- **Do not** run `pnpm vet` per commit on a feature branch — that's `/finalize`'s job once the operator has reviewed. (Vetting before every commit applies only on `main`.)

## Step 3 — Mandatory quality passes

These run **every time**, in order, and override any contrary "wrap up after implementing" instinct. Each is a real pass over the just-written diff, not a rubber stamp — and each commits its own edits.

1. **`/dry`** — did new duplication the plan didn't foresee creep in during implementation? Plans are written before the code exists, so WETness that wasn't visible at planning time often surfaces only now. Load `@.claude/skills/dry/SKILL.md` and run it over this session's diff: apply the obvious wins, surface the ambiguous calls.
2. **`/tighten-docs`** — load `@.claude/skills/tighten-docs/SKILL.md` and run it over the prose you added. It carries **two halves of equal weight**: rewriting edit-narration into present-tense contracts, and cutting prose back to the non-obvious contract at the length that contract takes. Its report is split into `Durability` and `Tightness` groups. Commit this pass's edits.

Then **`git mv` the plan to `docs/plans/<slug>.completed.md`** and commit — implementation and its quality passes are done. (`/finalize` sweeps the whole `docs/plans/` tree at squash regardless, so this flip is just the honest end-state marker for an operator watching the branch.)

## Step 4 — Draft PR

Implementing an approved plan is itself the operator's request for a PR, so it satisfies the system prompt's "don't open a PR unless asked" gate. Load `@.claude/skills/pr/SKILL.md` and follow it (it pushes and opens the draft with a derived title/body).

The **only** exception is an explicit "no PR" from the operator (e.g. `/implement, no PR`) — then stop after Step 3 and report.

## Do NOT

- Re-open a plan cycle or re-edit the plan file per code change — it's a transient artifact `/finalize` sweeps (see `@.claude/skills/plan/SKILL.md`). Leave it as the approved snapshot (under its `.in-progress.md` name); only refresh it when the operator specifically asks — e.g. so a fresh session can pick up the work from an up-to-date plan.
- Run vet, mark the PR ready, dispatch the integration bucket, or attest — those are `/finalize`.
- Skip either Step-3 pass because the diff "looks clean." They're mandatory.
```

### 0.5 Files these two reference (needed to reproduce them)

`/plan` and `/implement` use `@`-path references, which Claude Code resolves as file includes. The complete closure:

| Referenced from | File | Lines | Role |
|---|---|---|---|
| both | `CLAUDE.md` § "Plan mode & questions in web sessions" | 8 bullets | when the skill is mandatory vs. optional |
| both | `.claude/skills/from-branch/SKILL.md` | 128 | attach a session to an existing branch/PR |
| `/implement` Step 3.1 | `.claude/skills/dry/SKILL.md` | 111 | mandatory DRY pass |
| `/implement` Step 3.2 | `.claude/skills/tighten-docs/SKILL.md` | 152 | mandatory prose pass |
| `/implement` Step 4 | `.claude/skills/pr/SKILL.md` | 118 | opens the draft PR |
| `/plan` § lifecycle | `.claude/skills/finalize/SKILL.md` | 102 | sweeps `docs/plans/` at squash |
| indirect (`/pr` → , `/finalize` →) | `.claude/skills/squash-message/SKILL.md` | 241 | squash title/body |
| indirect (`/pr` Step 2) | `.claude/skills/branch-rename/SKILL.md` | 29 | rename the harness auto-branch |
| indirect (`/pr` Step 4) | `.claude/skills/qa-checklist/SKILL.md` | 90 | PR QA checklist |

**Verbatim text of the five direct dependencies is in Appendix A** at the end of this dossier (`from-branch`, `dry`, `tighten-docs`, `pr`, `finalize`).

CLAUDE.md's plan section, verbatim:

```markdown
## Plan mode & questions in web sessions

Claude Code's **web/remote** sessions have a bug in the plan-mode approval UI and the `AskUserQuestion` tool: after a session sits idle, the backend re-wakes it and re-emits the pending plan/question prompt repeatedly, so the operator sees it stacked several times and answers to superseded prompts are silently lost (tracking issue: https://github.com/anthropics/claude-code/issues/72704). The `@.claude/skills/plan/SKILL.md` skill routes around both — plans go to a reviewable `docs/plans/` file, questions are asked as numbered prose.

- **The plan file's name gates implementation.** A plan is written as `docs/plans/<slug>.draft.do-not-implement.md` and stays that way until the operator gives an explicit go-ahead; only then is it `git mv`'d to `<slug>.in-progress.md` (quoting the go-ahead in the commit) — and to `<slug>.completed.md` when done. The `do-not-implement` token is a deliberate tripwire: if you're about to edit source while the plan still carries it, you have not been cleared. `/plan` writes and flips-on-approval, `/implement` flips draft→in-progress→completed, `/finalize` sweeps the whole tree at squash. Every state still matches `docs/plans/*.md`, so directory-glob consumers are unaffected. Because implementation normally starts in a **new** session, a `/plan` turn ends by handing over a copyable `/implement <branch>` command rather than asking whether to proceed — the block's exact format lives in the skill.

- **If you are in a web/remote session** (the cloud execution environment described in your system prompt), **use the `plan` skill for new sessions instead of native plan mode / `AskUserQuestion`.** Even when launched in edits/auto mode, **assume you were launched in plan mode** and invoke the skill — UNLESS the operator's initial prompt explicitly says "no plan" (or equivalent), **the session is launched via the `/from-branch` skill** (which attaches to an existing branch/PR and so is continued work, not a new session — see the next bullet), **the prompt is a `/release`** (that lane only packages work already planned, reviewed and merged elsewhere, so it always runs in "no plan" mode), **or the prompt is a `/hotfix` that merely ports an already-written fix** (`/hotfix from <sha|#PR>`) — a `/hotfix` describing a fix still to be written is planned like any other task (see `@.claude/skills/hotfix/SKILL.md` § "Step 0").
- **This applies only to new sessions, not continued work.** Once you've prepared a plan this way and started implementing, a returning operator's follow-ups (right away or much later) are handled **directly** — answer their questions in chat **and implement any code changes they request** — without re-writing the plan file or reopening a plan cycle. A `/from-branch` launch is the same situation from the start: it re-points the session at work begun elsewhere, so treat it as continued work — do not open a plan cycle for it (unless the operator's follow-up explicitly asks you to plan a fresh piece of work).
- Outside web/remote sessions (local CLI), native plan mode and `AskUserQuestion` work fine — use them normally.
```

### 0.6 `.claude/settings.json` — COMPLETE VERBATIM

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

No `permissions` block, no `env` block, no subagent definitions. There is **one** hook (SessionStart) and **no** PreToolUse/PostToolUse hooks — a deliberate choice, recorded in `f25140fe1`: *"This is the prompt-level variant chosen by the operator: no PreToolUse hook. The rename is an on-record receipt, not a mechanical lock."*

`.claude/gh-repo.json` — COMPLETE VERBATIM:

```json
{
  "owner": "playgramai",
  "repo": "playgramapp"
}
```

### 0.7 `.claude/hooks/session-start.sh` — COMPLETE VERBATIM

```bash
#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# Two jobs, both remote-only (the hook no-ops when $CLAUDE_CODE_REMOTE is unset,
# so local dev is unaffected):
#
# 1. Install a `gh` shim that routes the GitHub CLI around the outbound HTTPS
#    proxy. The agent egress proxy (HTTPS_PROXY) enforces an org policy that
#    blocks some api.github.com operations — notably `gh run watch`, which
#    long-polls — so our gh-based MCP workarounds (ci-watch, test-on-gh,
#    check-merge, the /watch-ci, /fix-ci, /finalize skills, …) stall. gh talks
#    only to GitHub hosts and works fine connecting directly, so we strip the
#    proxy for gh alone. git is untouched (its origin is a local sandbox URL the
#    HTTPS proxy doesn't route anyway), as is everything else (asset downloads,
#    pnpm, etc.) that legitimately needs the proxy.
#
# 2. Re-run pnpm install. The cloud environment's setup script runs pnpm install
#    once at snapshot build time, then is cached and skipped on subsequent
#    sessions (~7 day expiry, or until the setup script / network config changes
#    — see https://code.claude.com/docs/en/claude-code-on-the-web#setup-scripts).
#    When new direct deps land in pnpm-lock.yaml between snapshot rebuilds,
#    sessions boot with a stale node_modules and vet fails on missing
#    modules. Re-running on every session start keeps the install tree tracking
#    the current lockfile.

set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# --- 1. Install the proxy-stripping gh shim -------------------------------
# $HOME/.local/bin is first on PATH, so a `gh` here shadows the real binary for
# every Bash tool shell this session spawns. The VM is ephemeral and the hook
# runs on every startup|resume, so recreating the shim each session is correct.
install_gh_shim() {
  local shim_dir="${HOME}/.local/bin"
  # Resolve the real gh, ignoring any shim a previous run left in shim_dir, so
  # the shim never ends up exec'ing itself.
  local real_gh
  real_gh="$(PATH="$(printf '%s' "$PATH" | tr ':' '\n' | grep -vFx "$shim_dir" | paste -sd: -)" command -v gh || true)"
  if [ -z "$real_gh" ]; then
    echo "session-start: gh not found on PATH; skipping gh proxy shim." >&2
    return 0
  fi

  mkdir -p "$shim_dir"
  cat > "${shim_dir}/gh" <<EOF
#!/bin/bash
# Auto-generated by .claude/hooks/session-start.sh — do not edit by hand.
# Routes gh around the outbound HTTPS proxy (which blocks some api.github.com
# operations, e.g. long-polling \`gh run watch\`). See the hook for rationale.
exec env -u HTTPS_PROXY -u https_proxy ${real_gh} "\$@"
EOF
  chmod +x "${shim_dir}/gh"
}

install_gh_shim

# --- 2. Keep node_modules in sync with the lockfile -----------------------
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

pnpm install --frozen-lockfile
```

---

## SECTION 4 — AGENTIC INFRASTRUCTURE

This is the repo's defining characteristic. 45 files / 5,658 lines under `.claude/`, plus a 33 KB `CLAUDE.md` revised across **116 commits**, plus 27 project-local ESLint rules and a 13-check `pnpm vet` gate whose explicit purpose is to make agent output safe to merge without CI.

### 4.1 Inventory of agent-shaping files

| Kind | Files | Notes |
|---|---|---|
Root instruction file | `CLAUDE.md` | 33,463 bytes; 116 commits touching it |
Auto-loaded rule files | `.claude/rules/*.md` (10 files, 872 lines) [**corrected: 9 files** — § 0.2's own tree lists 9; `etl.md` was retired with the ETL in `4e98b4952`] | glob-scoped: `fsd.md` on `src/**`, `database.md` on `drizzle/**`+`src/shared/db/**`, `styling.md` on `*.scss`/`*.css`/`*.tsx`, `testing.md` on `*.test.ts(x)`, `eslint.md` on `eslint.config.ts`, `weaviate.md`, `dependencies.md`, `backfills.md` (410 lines), `tmp-visual-tests.md` |
Skills / slash commands | 33 skills, 4,741 lines | see § 4.3 |
Hooks | `.claude/hooks/session-start.sh` | the only hook; SessionStart on `startup\|resume` |
Settings | `.claude/settings.json` (15 lines) | hook wiring only |
Subagents | **none** | no `.claude/agents/`; the multi-agent pattern is `/roundtable` + `/weigh` + `/synthesize` skills instead |
Cursor scaffolding | `.cursor/{Dockerfile,environment.json,scripts/cloud-install.sh}` | Cursor background agents; 3 commits authored by `Cursor Agent <cursoragent@cursor.com>` (2026-04-30 → 2026-05-01), 25 `Co-authored-by: Cursor Agent` trailers |
Docs the agent is pointed at | `docs/DECISIONS_SUMMARY.md`, `docs/decisions/*.md` (28 files), `docs/codebase-guardrails.md`, `docs/responsive-conventions.md`, `README.md`, `src/README.md` | |
Agent-safety enforcement | 27 `playgram/*` ESLint rules; `pnpm vet`; 15 GitHub workflows | § 4.5 |

`.claude/settings.json` first appeared 2026-03-30 in `545709c59` ("chore: GR-3 add flow-gh helper script for agent GitHub workflows") — originally a Bash allowlist for a helper script, later reduced to hook wiring only.

### 4.2 CLAUDE.md evolution — rule added → problem it solved

Extracted from `git log --follow -p -- CLAUDE.md` (116 commits, 2026-03-06 → 2026-08-10), cross-read against each commit's own body for the incident. Each entry is **rule → provoking problem**, with the SHA that added it.

**March 2026 — the base contract**

| Date | SHA | Rule added | Problem it solved |
|---|---|---|---|
2026-03-06 | `f5dad6acb` | CLAUDE.md created: project goal, repo layout, product domain, external services, git conventions | first commit after `Initial commit`; the Bubble export needed reading rules (large split files → "check line count before reading; prefer targeted reads") |
2026-03-06 | `f5dad6acb` | "Secret redaction: `split_bubble.py` automatically redacts secrets before splitting. All string values under the `secure` settings key and any key containing `private_key` are replaced with `***REDACTED***`" | committing a Bubble app export to git would otherwise commit its credentials |
2026-03-09 | `082881032` | "Before every commit, check whether CLAUDE.md needs updating" | doc drift after a docs reorganization the same day |
2026-03-09 | `ce011895c` | **"No 'MVP' mindset."** + **"Don't replace what already works."** | the plan was a rebuild of a working product; both rules exist to stop the agent from greenfielding over functioning external services |
2026-03-10 | `ed8bde430` | **"Never add `eslint-disable` comments without explicit user confirmation."** | landed with the decision to adopt strict ESLint + Steiger — the rule is the anti-escape-hatch clause for that decision |
2026-03-11 | `ae50ef32e` | `## Keeping Docs in Sync`: plan-drift, decision-doc consistency, plan-item voice | work had deviated from `MIGRATION_PLAN.md` (CI before FSD scaffolding) and the docs disagreed with the repo |
2026-03-16 | `2f0902201` | **"Ignore IDE diagnostics until precommit"** (later "…until vet") | the IDE TS server lagged file changes and the agent kept chasing stale errors |
2026-03-17 | `d828289e5` | **"Don't revert unexpected mid-execution changes."** | a schema-rename commit; the operator was editing files concurrently and the agent reverted their edits |
2026-03-19 | `12eccd074` | `server-only` barrel-poisoning guidance | `import 'server-only'` in a barrel broke client builds |
2026-03-20 | `470ae78eb` | "Shared layer organization: segments named by purpose, not essence (`shared/forms` not `shared/hooks`)" | landed with the commit that reorganized `shared/` for exactly that reason |
2026-03-23 | `d9e4873b8` | **"`server-only` placement: only in the most upstream file… downstream importers inherit the taint"** | agents were re-adding `import 'server-only'` to every server file |
2026-03-23 | `d9e4873b8` | **"Don't spin on typing/linting errors."** ("If a type error resists 2–3 straightforward fix attempts, stop… do not resort to `as any`, wrapper functions to hide types") | observed agent behavior: creative workarounds instead of asking |
2026-03-30 | `792578a51` | "Slice promotion" rule | a new slice was added and pertinent code stayed upstream |

**April 2026 — error handling and type derivation**

| Date | SHA | Rule added | Problem it solved |
|---|---|---|---|
2026-04-07 | `aa21e1d29` | **"Never silently swallow errors"** + **"Zod parse over type assertions"** | **Concrete incident (in the same commit body):** image generation ("draw a dog") produced empty assistant messages. AI SDK v6 put OpenAI's `image_generation` tool output in `staticToolResults`, not `result.files`; the streaming pipeline only checked `result.files`, so *"generated images were silently dropped."* Closes #113 |
2026-04-19 | `5b2906175` | **`## Derive Types and Schemas from the Source of Truth`** (drizzle-zod, `$inferInsert`/`$inferSelect`, `z.infer`, `.parse({})` fixtures) | **Concrete incident, verbatim from the commit body:** *"the old hand-written `LogUsageParams` had `tokenCounts: { input, output }` while the DB columns are `inputTokens`/`outputTokens`. Drizzle silently dropped the mismatched fields, so `usage_logs` was persisting 0 tokens on every insert. Deriving `LogUsageParams` from `typeof usageLogs.$inferInsert` surfaced it."* This incident is still quoted verbatim in CLAUDE.md today. |
2026-04-20 | `68897b256` | "Check the ETL on any DB shape change" | migrations were drifting from the Bubble→Supabase ETL extractors (rule later retired with the ETL, `4e98b4952`) |
2026-04-21 | `f0d30fecf` | **"Declare `pgEnum` as a top-level exported constant, never inline in a column."** | *"Inline `pgEnum(...)('col')` is invisible to drizzle's snapshot, so later changes to the value list produce no migration and inserts fail with `invalid input value for enum`"* |
2026-04-22 | `df6a3f861` | "Server/Client naming pairs (`FooServer`+`FooClient`)" | *"preserves git rename detection: git tracks `foo.tsx → foo-client.tsx` as a clean rename"* |
2026-04-24 | `758d6235e` | "Server-read config for the browser… Do not introduce `NEXT_PUBLIC_*`" | PostHog analytics IDs needed to reach the client without a public env var |
2026-04-24 | `7fb1fed4d` | **Tightened** "never swallow errors" to *"On primary code paths, errors must propagate — logging alone isn't enough. A logged-and-continued error is a silent fail with paperwork"* | the April 7 version allowed "logged with full context"; agents used logging as an escape hatch |
2026-04-29 | `cfc9c2cc2` | **"Don't zod-parse arguments that are already type-safe."** | the *opposite* over-correction from the April 7 Zod rule — agents were parsing typed enum params |

**May 2026 — agent process rules appear**

| Date | SHA | Rule added | Problem it solved |
|---|---|---|---|
2026-05-01 | `796daa019` | **"Don't bypass FSD directionality with indirection"** (no injected runtimes / registries / service locators) | a background-streaming feature had smuggled higher-layer functions downward to satisfy the import graph |
2026-05-01 | `a21c080dc` | **"ESLint is a signal, not a puzzle to game."** (+ `fireAndForget` from `@/shared/concurrency` as the sanctioned helper) | agents were writing awkward promise chains purely to silence a rule |
2026-05-15 | `76279c232` | "Server-action barrel (`index.server-actions.ts`) with `'use server'` first; explicit import+export, not `export … from`" | *"Turbopack rejects the latter inside `'use server'` files"* |
2026-05-18 | `2f5bc7aac` | **"Keep production files under ~450 lines"** (rule of thumb; data-dense files exempt) | landed with the commit splitting `chat-view.tsx` into hooks |
2026-05-18 | `586a16218` | **"Don't run Bash with `run_in_background`."** | the `ci/*` tag-trigger CI mechanism was replaced by dispatch; background waits *"stall without an obvious reason and you end up babysitting them anyway"* |
2026-05-21 | `2145c99b6` | `## GitHub Comments` — reply on GitHub to every comment the operator points you at, *"even when you fully agreed and silently fixed it… the reviewer can't see 'silently fixed' from the diff alone"* | reviewers couldn't tell whether feedback landed |
2026-05-21 | `9ce0a1fbf` | **"Skip per-commit precommit on feature branches"** | per-commit vetting was slowing the dev loop; vetting moved to `/prep-merge` |
2026-05-25 | `22808571a` | **"Rename auto-generated remote/web branches early."** | *"`claude/lucid-hamilton-MigdG` tells nobody anything in `git log`, PR lists, or future search"* |

**June 2026 — the debugging meta-rule**

| Date | SHA | Rule added | Problem it solved |
|---|---|---|---|
2026-06-03 | `83f430419` | **"Comments describe the code's lasting contract, not the change that produced it."** (no "now also sets X", "migrated from Y") | a refactor left edit-narration comments behind |
2026-06-04 | `d242ed1e5` | **Made "no `run_in_background`" absolute** by removing its one exception | **Concrete incident, verbatim:** the `/watch-main` skill ran a background poll loop; *"While it ran, the operator's session list still showed the session as 'running', so operators read it as busy and never returned — defeating the unattended watch — and many parallel sessions watching at once burned tokens."* Replaced by the stateless one-shot `/check-merge`. |
2026-06-05 | `ed10969d8` | "Running tests when you have no env/secrets (remote/web VMs)" → dispatch to GH Actions via `/test-on-gh` | env-less agent VMs cannot run integration/E2E |
2026-06-15 | `038c3962b` | **"When analysis keeps failing to explain a real bug, widen the frame — don't just deepen it."** | **Concrete incident (#1299), verbatim root cause:** *"`authProxy` ran on every request and redirected any authenticated user with a workspace cookie away from `/onboarding` to `/chat`, before the page rendered. So an already-onboarded user starting an additional paid workspace never reached `OnboardingPage`, and the resume logic added in #1307 never ran."* The commit body labels the CLAUDE.md change *"lessons-learned"*. The rule's own wording — *"explicitly name what you've been assuming is irrelevant or already-correct"* — is a direct generalization of having scoped the proxy out of the investigation. |
2026-06-15 | `62129ed36` | **"Plans must include a 'DRY notes' section."** | reuse-vs-duplication calls were being discovered in review rather than at plan time |
2026-06-19 | `20d5d0724` | `style:` means **code formatting only**, not visual styling; older `style:` entries in `git log` are visual changes | the prefix had been misused repo-wide; the rule documents the historical inconsistency rather than rewriting it |

**July–August 2026 — the plan/implement gate hardens**

| Date | SHA | Rule added | Problem it solved |
|---|---|---|---|
2026-07-01 | `f389d2e70` | `## Plan mode & questions in web sessions` — use the `plan` skill instead of native plan mode / `AskUserQuestion` | **Upstream harness bug, filed as anthropics/claude-code#72704:** *"an idle session is periodically re-woken on the backend and re-emits its pending plan-mode approval or AskUserQuestion prompt, so the operator sees it stacked several times and answers to superseded prompts are silently lost."* |
2026-07-01 | `9805ca1e3` | **Gated** the branch-rename rule on an already-semantic check | the harness started assigning task-derived names; the rule notes this is *"an **undocumented** harness behavior and may be reverted at any time,"* so the fallback procedure is kept |
2026-07-08 | `ace96dc3e` | `## Weaviate Schemas` — collection schemas are externally owned; adding a field to a Zod schema does not create the property | reads fail hard with a gRPC "no such prop" error when the operator hasn't provisioned it |
2026-07-22 | `f25140fe1` | **"The plan file's name gates implementation."** (`*.draft.do-not-implement.md` → `*.in-progress.md` → `*.completed.md`) | *"Tighten the /plan → /implement handoff so it's harder for an agent to drift into implementing without an explicit operator go-ahead."* Explicitly chose the prompt-level variant over a `PreToolUse` hook, and says so: *"The rename is an on-record receipt, not a mechanical lock — it would harden the drift case and make a misjudged approval loud, but would not physically prevent an agent that believes it was approved from proceeding."* |
2026-07-28 | `b6e9a6310` | **Plan turns end with a copyable `/implement <branch>` block; never "Want me to implement it?"** | **The most instructive lesson in the repo, verbatim:** *"`/plan` assumed planning and implementing were two phases of one session. They are not… Ending the plan turn on 'want me to implement it?' gave them nothing to copy into the session they'd actually use, and primed the agent to read their next message as assent — so a plan correction got code written instead."* |
2026-07-28 | `0e5b23254` | **"A `texts.ts` holds string literals and nothing else"**, enforced by `playgram/texts-literals-only` | copy had to stay mechanically extractable for i18n |
2026-08-04 | `bd73c7bd4` | Type-overlap floor flipped to **threshold 1** (any member two named types both declare is a finding) | see § 5 |
2026-08-08 | `6c1adca44` | **"`pnpm test` is the primary test loop, and it runs here."** + the three-bucket model | see § 5 (the CI-cost reversal) |
2026-08-08 | `5bfffa8fa` | `pnpm precommit` renamed `pnpm vet` | *"named for what it does rather than for a git hook, since there is none"* |
2026-08-09 | `33ef85f36` | `## Third-Party Licenses` — `pnpm license-check` reconciles every prod dep against a doc-as-allowlist; the row pins the **license string**, so a relicensing version bump lapses its own approval | |
2026-08-10 | `19375c2fd` | **"Retiring a doc leaves a tombstone."** (record the last commit containing it + the `git show <sha>:<path>` recipe; one tombstone per retirement; every tombstone matches `*retired.md`) | dead citations in comments/docs/history after the Bubble retirement deleted whole directories |
2026-08-10 | `3274da150` | UI-copy rule amended to admit that **`no-hardcoded-strings` only enforces the attribute half** — *"it has a `JSXAttribute` visitor and no JSX-children rule, so string children are on you, not the linter (#515 …)"* | the rule had been over-claiming enforcement |

**Pattern worth naming:** four of these rules are **corrections of earlier rules**, not new ones — `aa21e1d29`→`7fb1fed4d` (swallow-errors tightened), `aa21e1d29`→`cfc9c2cc2` (Zod over-correction bounded), `586a16218`→`d242ed1e5` (background-Bash exception removed), `22808571a`→`9805ca1e3` (branch-rename gated). The instruction file is treated as a debugged artifact, not a style guide.

### 4.3 Skill inventory with first-appearance SHAs

33 skills, 4,741 lines. Chronological (first commit that added each `SKILL.md`):

| Date | SHA | Skill | Purpose |
|---|---|---|---|
2026-03-10 | `cd9f93dfa` | `weigh` | step 1 of a multi-model workflow: N models independently analyze, each writes a draft file |
2026-03-16 | `97fe8b537` | `synthesize` | step 2: read the independent analyses, commit, synthesize through discussion |
2026-03-16 | `2633e9b2e` | `update-docs` | diff since last doc-update commit → update `DECISIONS_SUMMARY.md` et al |
2026-03-26 | `6934eddb2` | `update-tests` | test-gap analysis → files GitHub issues (does not write tests) |
2026-03-30 | `eee303e4f` | `roundtable` | 4-phase parallel team (researchers + devil's advocate) discussing via a shared banter file |
2026-04-20 | `032b44cc3` | `fix-ci` | triage failing CI, read downloaded Playwright console output, propose fixes |
2026-04-25 | `801986fc0` | `watch-ci`, `explore` | incremental CI watch; read-only codebase investigation |
2026-04-27 | `9599845ee` | `dry` | mandatory DRY pass; **apply obvious wins, surface only ambiguous ones** |
2026-05-01 | `043067167` | `issue` | take a GitHub issue end-to-end |
2026-05-20 | `11d38fb26` | `release` | release-commit promotion model |
2026-05-20 | `b9534800e` | `from-branch` | attach a session to an existing branch/PR, discard the auto-branch |
2026-05-21 | `a182fd2d7` | `hotfix` | urgent fix straight to `production`, bypassing `staging` |
2026-05-25 | `bf56cb022` | `propose-issue` | dedupe-then-file wrapper (born from the `/flow` removal) |
2026-05-27 | `273525d66` | `branch-rename` | rename harness auto-branches |
2026-05-28 | `f62b24daf` | `override-gh` | 9 lines: *"this is just to remind you that you have gh & GH_TOKEN in your environment"* |
2026-06-04 | `d242ed1e5` | `check-merge` | stateless one-shot replacement for the background `/watch-main` |
2026-06-05 | `ed10969d8` | `test-on-gh`, `bootstrap-workflow-dispatch` | dispatch credential-dependent buckets to GH Actions; bootstrap a dispatch workflow not yet on the default branch |
2026-06-05 | `34a24bf80` | `qa-checklist` | derive a QA checklist into the PR body + automatability/coverage table |
2026-06-16 | `17f543332` | `autopilot` | **unattended backlog grooming as a scheduled web routine (~2h).** Claims an issue with the `autopilot` label, posts a plan comment (plan-mode imitation), implements, hands to `/finalize`. Conservative selection (skips bugs, high-priority, assigned, DB/migration work); relabels outdated tickets `stale`, never auto-closes; a hard-boundary section closes the set of permitted external actions and requires STOP AND REPORT on infra blockers *"instead of improvised workarounds"* |
2026-06-25 | `d1d00933f` | `readonly-probe` | dispatch a structurally read-only DB/Weaviate probe against staging/production + fetch Railway logs |
2026-07-01 | `f389d2e70` | **`plan`** | file-based stand-in for plan mode + AskUserQuestion |
2026-07-10 | `b6d42b93b` | `finalize` | renamed from `prep-merge` |
2026-07-14 | `23c261c70` | `log-review` | **702 lines** — read production Railway logs since last run, produce a readout, file deduped issues per problem; `/log-review auto` is the unattended daily routine |
2026-07-16 | `b26ea7b20` | **`implement`** | post-plan execution + mandatory quality passes |
2026-07-20 | `5ca55db2e` | `sync-branch` | generalized from `/sync-epic` (which was split out of the now-deleted `/from-epic`) |
2026-07-28 | `91542e50d` | `squash-message` | owns the squash title/body format + draft-then-tighten discipline |
2026-07-28 | `e1805ac1a` | `tighten-docs` | reframed from `/durable-docs` |
2026-08-06 | `a5f6b1901` | `preview` | **env-less visual verification**: mount a component on an `app/tmp/` route, boot dev against a placeholder env, screenshot at several widths |
2026-08-07 | `b554c5996` | `renumber-migration` | resolve a migration-number collision across in-flight PRs |
2026-08-10 | `4d5fe8597` | `audit-github-backlog` | whole-backlog sweep; fans out one analyst per bucket; *"closes and comments on nothing"* |
2026-08-10 | `2ce412a38` | `pr` | renamed from `/draft-pr` |

Retired skills (each a decision reversal — see § 5): `/flow`, `/cleanup-flow`, `/bubble-sync`, `/etl-sample-check`, `/watch-main`, `/watch-precommit`, `/request-ci`, `/from-epic`, `/sync-epic`, `/durable-docs`, `/draft-pr`, `/prep-merge`, `/cascade`.

### 4.4 The `/plan` → `/implement` pipeline as it evolved

Four discrete hardening steps, each triggered by an observed failure:

1. **`f389d2e70` (2026-07-01)** — plans become files because the approval UI was losing answers (upstream bug #72704). `docs/plans/<slug>.md`, deliberately not gitignored, swept at finalize so the add/delete pair cancels in the squash.
2. **`b26ea7b20` (2026-07-16)** — `/implement` extracted so execution has its own contract, with **three** mandatory quality passes (`/dry`, `/durable-docs`, plus a separate docstring-tightening pass).
3. **`f25140fe1` (2026-07-22)** — the filename becomes the gate. `*.draft.do-not-implement.md` is a *"deliberate tripwire, visible in every `ls`, tool-call path, and `git status`."* The go-ahead must be **quoted verbatim in the commit message** that flips the name — *"writing the go-ahead out verbatim is the moment to catch a misread."* Prompt-level by choice, no hook.
4. **`b6e9a6310` (2026-07-28)** — the handoff block. The plan session stops asking permission and instead emits a copyable `/implement <branch>` for a *new* session, because ending on a question caused the agent to read the operator's next message (a correction) as assent. `/implement` gains a **wrong-session canary** with four enumerated cases.

Independently, **`e1805ac1a` (2026-07-28)** collapsed `/implement`'s three passes to two by reframing `/durable-docs` as `/tighten-docs` — because the skill's *shape* was teaching the wrong lesson: *"Durability got the tells, the fix guidance, and the skill's name; tightening was one sentence at the end of Step 3. Agents took the shape at face value and came back having reworded a few narrating comments and cut nothing."* The fix is structural: a Lens A / Lens B pair of equal depth, and a report with two named groups where *"an empty one gets a sentence saying why"* — so *"a one-group report is now visibly a half-run pass instead of an implicitly clean one."*

That is a rare artifact: a prompt bug diagnosed as an **information-architecture** problem in the prompt, not a wording problem.

### 4.5 Custom scripts / CI that exist to make agent work safe

**`pnpm vet`** — the single mechanical gate. Definition, verbatim from `package.json`:

```
bash -c 'set -o pipefail; pnpm typegen && scripts/run-parallel.py typecheck format:fix lint:fix
  lint:fsd lint:css:fix poison-check deps ast-metrics knip type-overlap db:chain-check
  license-check security-diff test 2>&1 | tee vet.log'
```

13 parallel checks. [**Corrected 2026-08-11: 14.** Count them — `typecheck`, `format:fix`, `lint:fix`, `lint:fsd`, `lint:css:fix`, `poison-check`, `deps`, `ast-metrics`, `knip`, `type-overlap`, `db:chain-check`, `license-check`, `security-diff`, `test` — after a sequential `typegen`.] Bespoke ones (all in `scripts/`, all `tsx`):

| Check | Script | What it prevents |
|---|---|---|
`poison-check` | `scripts/poison-check.ts` (182 lines) + `scripts/lib/poison-graph.ts` | a `'use client'` file or the Node test harness transitively importing a `server-only` module. Walks the **madge** module graph from two root classes and uses the TypeScript parser to exempt type-only imports — *"which makes the check a detector rather than a disarmer: a harness file that type-imports a tainted barrel is one identifier away from failing."* |
`type-overlap` | `scripts/type-overlap-check.ts` (246 lines) | two named types independently declaring the same member. Threshold **1** since `bd73c7bd4` |
`db:chain-check` | `scripts/drizzle-chain-check.ts` (163 lines) | a forked Drizzle migration journal / re-parented snapshot when parallel PRs claim the same number |
`license-check` | `scripts/check-licenses.ts` | a prod dep whose declared license isn't in the `docs/decisions/third-party-licenses.md` allowlist; AGPL/SSPL/bare-GPL fail regardless |
`ast-metrics` | `scripts/ast-metrics.ts` | tracks logical file size (added `933dae80c`, 2026-07-16); output committed to `docs/ast-metrics.txt` |
`security-diff` | `scripts/security-diff.sh` | advisories **this branch's lockfile change** introduces |
`deps` | madge | circular deps; regenerates `docs/dependency-graph.dot` |
`lint:fsd` | Steiger | FSD structure violations (`insignificant-slice`, etc.) |

**27 project-local ESLint rules** under `playgram/`, all registered in `eslint/rule-groups/playgram.ts`, each with its own `*.test.ts` using `@typescript-eslint/rule-tester` (26 rule tests). Several exist purely to make a class of agent mistake impossible:

- `enforce-rls` — every `pgTable()` must chain `.enableRLS()`. Comment: *"The app queries the database via Drizzle as the postgres superuser (bypasses RLS), so no policies are needed. But enabling RLS with zero policies locks down the Supabase Data API (PostgREST) — both anon and authenticated roles get zero access to public tables."*
- `no-uncaused-rethrow` — a rethrow must carry `cause`. Type-aware: it uses the TS checker and models **pino's** `isErrorLike` (string `message`) rather than `instanceof Error`, because *"the bare catch binding is the shape that drops everything when an SDK throws a string."*
- `texts-literals-only` — a `texts.ts` may contain only string literals (added with `0e5b23254`)
- `no-direct-safe-action-call`, `safe-action-required`, `safe-action-name-matches-const`, `no-subaction-server-export`, `server-actions-barrel-use-server` — the server-action discipline
- `db-test-timeout` — every DB-touching test must declare its own timeout budget. Population is **behavioural, not nominal**: the `*.integration.` filename *plus* any test that value-imports `@/shared/db-testing` or `@/shared/db` unmocked (from #2289)
- `no-zod-parse-typed-input` — the machine form of the "don't zod-parse already-typed args" rule
- `no-hardcoded-strings` — `JSXAttribute` visitor only; § 4.2's 2026-08-10 entry documents the gap

**ESLint severity policy** (`.claude/rules/eslint.md`): *"Severity is `error` or `off` — never `warn`… a warning is a rule nobody enforces (LLMs and humans alike treat warnings as negotiable and let them accumulate)."* A new rule that pre-existing code violates gets a **scoped `off` block with a rationale or a tracking issue**, never a repo-wide softening.

**15 GitHub workflows** (`.github/workflows/`): `ci.yml`, `release-gate.yml`, `on-demand-tests.yml`, `reusable-vitest.yml`, `reusable-e2e.yml`, `reusable-tracking-issue.yml`, `nightly-e2e.yml`, `nightly-integration.yml`, `nightly-external.yml`, `nightly-security.yml`, `scheduled-production-deploy.yml`, `readonly-probe.yml`, `railway-logs-fetch.yml`, `backfill-status.yml`, `audit-non-ascii-uploads.yml`.

Three of these exist **only** to give an env-less agent VM capabilities it structurally lacks:
- `on-demand-tests.yml` — run the credential-dependent buckets on demand (`/test-on-gh`)
- `readonly-probe.yml` — run `scripts/diagnostics/readonly-db-probe.ts` against real staging/production. Every query runs inside a Postgres `READ ONLY` transaction: *"Postgres rejects any write (INSERT/UPDATE/DELETE/DDL) inside a read-only transaction even for the superuser connection this uses, so the probe is structurally incapable of mutating the database it inspects — defense in depth for a tool that reads production."*
- `railway-logs-fetch.yml` — fetch production logs for `/log-review`

**Verification-by-attestation.** Since `6c1adca44` a PR runs **no CI at all**. `/finalize` step 7 posts a sticky `<!-- finalize-attestation -->` comment because *"a reviewer cannot see from the diff what was run; if it isn't written down it did not happen as far as anyone else is concerned."* Its integrity rules are explicit: *"Attest what you vetted, not what you meant to vet… An honest partial attestation is useful; a tidy one that overstates is worse than none."* `release-gate.yml` is the backstop: a dispatched full-suite run recording an `attested/<digest>` tag that the production deploy jobs require. One such tag survives in the repo: `attested/60706123e7506132750eb9ed9cb6fc47b72fe6a9`.

**A guardrail written from its own failure.** `/finalize` step 6's sweep of `docs/remove-before-merging/` carries this line: *"A directory name is not self-enforcing: this tree has reached `main` anyway, carrying a 964K Railway log dump with customer email addresses (pr #2234)."* Verified — see § 10, risk R1.

---

## SECTION 1 — PRODUCT

**What it is.** Playgram (`https://app.playgram.ai`) is a **multi-model AI chat platform for teams**. This repo is the production Next.js application, a from-scratch rebuild of a product originally built on Bubble.io. The cutover is complete: `app.playgram.ai` DNS points at this app, every workspace is served by it, and Bubble is retired (kept only as a frozen archive).

**Who it's for.** Teams, not individuals. The entire data model is workspace-scoped: workspaces contain members with roles, projects with their own member lists and roles, shared chats, shared files, shared memory, and one Stripe subscription with credit accounting per workspace and per member.

**Core capabilities** (from `README.md` § Features, verified against routes and schema):

- **Multi-model chat** — streamed replies from many providers through one LiteLLM proxy; per-chat model switch, regenerate, per-chat tool toggles. Providers present in the `llm_model_id` pg enum's migration history: OpenAI (GPT 5.6), Anthropic (Claude Opus 5, Haiku 4.5, Sonnet 5), Google (Gemini 3.5/3.6 Flash, Flash Lite), xAI (Grok 4.5), DeepSeek (v4 Flash), Kimi (K2.6, K3), Qwen, GLM 5.2 — plus an **`auto`** enum value (migration `0081`) that routes on the platform's behalf.
- **Workspaces, projects & members** — project-level roles Owner/Admin/Member (`b3a301fbc`, #1528), invitations, per-member API keys and custom instructions, member groups gating model access (`0092`), superuser "Log in as" impersonation with an audit table (`0050`).
- **Files** — Bunny CDN with signed URLs, proxied through `/cdn/[...path]`; per-provider upload paths (OpenAI / Claude Files API / Gemini Files API); multi-format text extraction for knowledge uploads (docx, xlsx, pptx, pdf, rtf, HEIC, office-as-HTML…) — the dependency list carries `mammoth`, `exceljs`, `officeparser`, `pdf-parse`, `word-extractor`, `@jvmr/pptx-to-html`, `@iarna/rtf-to-html`, `heic-decode`, `tesseract.js`.
- **Vector search + Memory** — Weaviate hybrid search over chat exchanges and document chunks; persistent searchable chat/document memory. Weaviate replaced Bubble's native Elasticsearch.
- **Deep research** — long-running research jobs (`deep_research_jobs` table, migration `0012`) with in-band cancellation.
- **Canvas** — an editable assistant canvas (TipTap) with PDF export (`jspdf`, `@resvg/resvg-js`).
- **Voice input** — Deepgram speech-to-text dictation.
- **Billing** — Stripe subscriptions; plan enum evolved `free`→`pro`→`unlimited`→`ultra` with `free` removed (`0067`) and `free-without-restrictions` added (`0069`); workspace credits (`0085`), per-member credit limits (`0108`, `0111`), a credit-enforcement waiver per workspace (`0105`).
- **Analytics** — workspace analytics tab with XLSX export, usage logs, session-time logs, UTM attribution, and a CRM/Lemlist signup pipeline.

**User-facing routes** (25 `page.tsx`; 5 are `app/tmp/*` `/preview` scaffolds, not product):

```
app/(app)/(active-workspace)/chat                       app/(auth)/login
app/(app)/(active-workspace)/chat/[chatId]              app/(auth)/onboarding
app/(app)/(active-workspace)/library                    app/(auth)/invitation
app/(app)/(active-workspace)/memory                     app/(auth)/new-workspace
app/(app)/(active-workspace)/project/[projectId]        app/(auth)/accept-terms
app/(app)/(active-workspace)/openclaw                   app/(auth)/reset-password
app/(app)/workspace-settings/[[...tab]]                 app/(auth)/reset_pw
app/(app)/admin                                         app/(auth)/set-password
app/shared/[chatId]         app/blocked        app/maintenance
app/public/tests/hydration-canary
```

**Core user flows.** (1) Sign up → onboarding wizard (Company → Profile → Invite → Subscription) → workspace provisioned → `/chat`. (2) Pick a model (or `auto`) → send → SSE stream with reasoning segments, web search, image generation, tool toggles → exchange persisted to Postgres + Weaviate. (3) Create a project → attach instructions/context/files → project chats scoped to project members. (4) Upload to Memory/Knowledge → extracted → chunked → embedded into Weaviate → retrieved as small-to-big RAG. (5) Share a chat via `app/shared/[chatId]` (including legacy Bubble share links via `app/legacy-chat/[id]`). (6) Admin: workspace settings tabs (members, projects, billing, analytics, model access, credits).

**21 route handlers** — the only API surface, reserved for callers the team doesn't own: `api/webhooks/stripe`, `auth/confirm`, `auth/{clear,resume}-session`, `auth/end-impersonation`, `auth/recover-workspace`, `api/health`, `api/chat-attachments`, `api/pending-update`, the two `billing/checkout/success` finalizers, `cdn/[...path]`, `shared-cdn/…`, `legacy-chat/[id]`, and **7 Bubble-legacy compat endpoints** under `app/api/(bubble-legacy)/1.1/wf/*` (`get-server`, `save-server`, `delete-server`, `get-user-servers`, `update-server-{ip,gw-token,root-password}`) — added by `hotfix: #1981 serve OpenClaw inbound API at legacy /api/1.1/wf/*` (`e22f25999`), because an external OpenClaw client was still calling Bubble's URL shape after cutover.

---

## SECTION 2 — STACK & SHAPE

### 2.1 Stack

| Area | Choice | Version |
|---|---|---|
Framework | Next.js App Router | 16.2.12 |
Language | TypeScript | 5.9.3 |
Runtime | Node | 24.14.0 (`.nvmrc`) |
Package manager | pnpm | 10.32.0 |
UI | Mantine v8 + SCSS modules | 8.3.18 |
Editor | TipTap 2 + `tiptap-markdown` | 2.27.2 |
State | TanStack Query 5 + `@normy/react-query` + zustand 5 | |
DB | Supabase Postgres via `postgres.js` | 3.4.8 |
ORM | Drizzle + `drizzle-zod` | 0.45.2 / 0.8.3 |
Auth | Supabase Auth (`@supabase/ssr`) | 0.9.0 |
LLM gateway | LiteLLM proxy (single entry point) + `ai` SDK v6 + provider SDKs | `ai` 6.0.219 |
Vector | Weaviate (`weaviate-client` v3) | 3.12.0 |
Files | Bunny CDN | |
Billing | Stripe | 22.0.1 |
Speech | Deepgram | 5.1.0 |
Validation | Zod | 4.3.6 |
Logging | pino | 10.3.1 |
Analytics | PostHog, Microsoft Clarity | |
Support | Intercom | |
Scheduling | `node-cron` in-app | 4.2.1 |
Tests | Vitest 4.1.8 + RTL + happy-dom + MSW 2; Playwright 1.58.2 | |
Lint | ESLint 10 + typescript-eslint 8.57 + Steiger + Stylelint 17 + knip + madge | |
Hosting | Railway (Dockerfile) | |

81 production dependencies, 52 dev dependencies. **Not a monorepo** — one package; `pnpm-workspace.yaml` exists only to carry `ignoredBuiltDependencies: [sharp, unrs-resolver]`.

### 2.2 LOC by area

Tracked files: **3,569**. Counted with `git ls-files`, restricted to text/code extensions, excluding `pnpm-lock.yaml`, `drizzle/meta/**`, `docs/dependency-graph.dot`, `docs/ast-metrics.txt`. Binary assets (119 PNG, 475 SVG) are excluded — `wc -l` on binaries is meaningless.

| Area | Files | LOC | One line |
|---|---|---|---|
`src/` | 2,168 | **240,499** | all FSD layers — the application |
`scripts/` | 167 | 27,812 | vet checks, diagnostics, backfills, env setup, dep graph |
`docs/` | 116 | 11,833 | 28 decision docs, 67 release notes, 7 runbooks, journal |
`eslint/` | 77 | 8,770 | 27 project-local rules + their rule-tester tests + rule groups |
`.claude/` | 44 | 5,658 | 33 skills, 10 rule files, 1 hook, settings |
`.github/` | 16 | 2,462 | 15 workflows + config |
`drizzle/` | 115 | 1,242 | SQL migrations (`meta/` snapshots excluded) |
`bubble/` | 2 | 1,149 | retirement tombstone + legacy release notes |
`app/` | 73 | 914 | App Router — **routing only**, no logic |
`email-templates/` | 1 | 177 | Supabase auth emails |
root configs | 19 | 1,908 | `eslint.config.ts` alone is 539 |
`stylelint/` | 1 | 61 | custom stylelint rule |
`pages/` | 1 | 13 | intentionally-empty shadow dir README |

By extension (text only): **`.ts` 196,054 (1,824 files)**, `.tsx` 60,452 (508), `.md` 19,646 (172), `.scss` 12,481 (107), `.sh` 3,314 (50), `.yml` 2,475 (17), `.sql` 1,242 (115). Application code (ts+tsx+scss+css+mjs+cjs) ≈ **269,864 LOC**. Test code (`*.test.ts(x)` + `*.spec.ts`) = **118,318 LOC across 687 files** — roughly 44% of the ts/tsx total.

`src/` by FSD layer:

| Layer | Files | LOC |
|---|---|---|
`src/pages/` | 734 | 94,372 |
`src/shared/` | 534 | 39,267 |
`src/features/` | 306 | 36,237 |
`src/app/` | 220 | 26,535 |
`src/entities/` | 216 | 26,316 |
`src/widgets/` | 155 | 17,407 |

### 2.3 Notable architectural choices

1. **FSD (Feature-Sliced Design) + BFF, enforced mechanically.** All layers in `src/`; App Router stays at root `app/` as a routing-only shell (914 LOC across 73 files). Steiger lints structure; `eslint-plugin-boundaries` (`eslint/boundaries.ts`) lints layer direction. An **intentionally empty root `pages/`** shadows `src/pages/` so Next.js doesn't detect a Pages Router — with a README explaining it.
2. **Server Actions are the default; API routes only for inbound callers we don't own.** Explicit in CLAUDE.md: *"If you find yourself defining an API route only called from our own code (including E2E tests), restructure to a server action — the test-only env-gated route pattern is not idiomatic."*
3. **Defense-in-depth data access.** No browser ever holds a DB connection. **RLS is enabled on every table with zero policies** — so Postgres denies everything except the trusted server superuser connection, which also locks down Supabase's PostgREST Data API. Enforced by the `playgram/enforce-rls` lint rule, not by convention.
   > **ADDED 2026-08-11 — this is a documentation-drift story, not a design story.** The code is exactly as described. But `docs/decisions/auth-and-tenancy.md`, the doc that owns this decision, records **"Decided: Option B — RLS as a safety net"**: per-table policies, `SET LOCAL app.current_org_id` inside transactions, a `withOrgContext` wrapper, fail-closed on missing context. There are **zero `CREATE POLICY` statements anywhere in the repo**, and `docs/DECISIONS_SUMMARY.md` still indexes that abandoned version. The doc still says `organization_id` and `memberships`, so it predates the `d828289e5` rename (2026-03-17) and was never revisited. The shipped design is documented consistently in `README.md`, `docs/codebase-guardrails.md`, `.claude/rules/database.md` and the lint rule's own comment — everywhere except the decision record. A silent reversal that was never recorded as one, in the security layer, surviving five months and a `/tighten-docs` skill.
4. **`server-only` taint by import chain, with a graph checker.** `import 'server-only'` goes on the single most-upstream file (the env definitions); the taint trickles down. `pnpm poison-check` walks the madge graph from `'use client'` files *and* from the Node test harness to catch leaks before a build.
5. **A five-suffix barrel system** encoding access level, not just visibility: `index.ts`, `index.client-safe.ts`, `index.server-only.ts`, `index.testing.ts`, `index.node-safe.ts`, `index.server-actions.ts`. `index.node-safe.ts` exists for an axis orthogonal to client/server: `scripts/**` runs under tsx with **no bundler**, so a barrel becomes unimportable the moment its graph reaches a `.module.scss` or a dep publishing no `require` condition.
6. **Derive, never hand-write, anything whose shape tracks another declaration** — with a "type-overlap floor" at threshold 1, machine-enforced by `pnpm type-overlap`.
7. **Three test buckets routed by filename suffix**, where the suffix is a correctness concern: plain `*.test.ts` must pass with **no environment at all**; `*.integration.test.ts` = a deployment we operate and can reset (no retries — *"a retry against our own deterministic infra only masks real flakiness"*); `*.external.test.ts` = a public vendor endpoint we can't pin (generous retries, gates nothing). Gating a test on env presence is **prohibited**, because a skip would convert the one signal that catches a misfiled test into a green tick.
8. **UI copy in `texts.ts` files**, literal-only, with a typed `interpolate()` whose values object is keyed off the template's own literal type.
9. **Chat-list state: a documented rewrite** from hand-rolled coherence to TanStack Query + `@normy` normalization + zustand — see § 5.

---

## SECTION 3 — TIMELINE

**First commit:** `5461cd56` — `Initial commit` — **2026-03-06 15:15:19 +0300**.
**Last commit on `main`:** `4cd68a75` — `feat: #2084 park a workspace's Weaviate tenant with its access (pr #2341)` — **2026-08-11 13:56:23 +0200**.
**Span:** 158 days (~22.6 weeks). **1,509 commits on `main`** (35 of them merge commits; 950 authored via GitHub squash-merge). **1,301 remote branches** still on `origin`.

Commits per month: Mar 272 · Apr 205 · May 280 · Jun 340 · Jul 315 · Aug (1–11) 97.

### 3.1 Seven phases

**Phase 1 — Research & decisions (2026-03-06 → 2026-03-09; W10; 10 commits)**
No application code. The first commit adds the Bubble.io export, an app analysis and `CLAUDE.md`. Days 1–3 are pure decision-making: deployment-platform research, migration paths off Railway, multi-tenancy analysis of the existing Bubble app, a NoSQL-vs-Postgres analysis, `DECISIONS_SUMMARY.md`. A **multi-model decision workflow** (`/weigh` + `/synthesize`, `cd9f93dfa`) is built before the app is.
SHAs: `5461cd56`, `f5dad6acb`, `a9182f6fe`, `2a0a028ce`, `ce011895c`, `dd648f84e`.

**Phase 2 — Scaffolding & guardrails (2026-03-10 → 2026-03-31; W11–W13; ~233 commits; net +32k LOC)**
Next.js 16 bootstrapped (`f07f7b4ae`) on day 5. Then, in order: Prettier, strict ESLint + Steiger, Vitest + Playwright, madge, the FSD layout, Drizzle schema, RLS-on-everything + the `enforce-rls` lint rule (`d6aed10df`), pino structured logging. Auth flow, workspace creation, onboarding. A schema rename lands early — `organizations→workspaces, memberships→members, user_profiles→user_configs` (`d828289e5`).
The `/roundtable` skill and a `/flow` DAG-based project-management methodology appear (`586e32637`, `eee303e4f`). A `Week 2 employee assessment` doc (`66bbf9156`) synthesizes five independent model assessments of the work so far and **downgrades its own level assessment** from "Staff engineer" to "Strong Senior", flagging over-engineering (46% docs commits, 8.5% feat commits).

**Phase 3 — Feature parity against Bubble (2026-04-01 → 2026-05-20; W14–W21; ~400 commits)**
Task-ID-prefixed commits (`CHT-`, `MEM-`, `IMG-`, `SHL-`, `ADM-`, `ANL-`, `DOC-`, `OCL-`, `PIX-`, `E2E-`). Multi-format document extraction (`90f2437ba`), image generation (`aa21e1d29`), memory query router (`756ea8e35`), pixel-matching against the live Bubble UI (`e8f967f1b`), PostHog, workspace analytics, OpenClaw iframe, voice dictation (`56d6c94cf`), background chat streams surviving navigation (`796daa019`), superuser impersonation (`2145c99b6`). W18 (Apr 27–May 3) is the largest code week of the whole history: **+66,570 / −21,529, net +45,041**.
The release-commit promotion model lands 2026-05-20 (`11d38fb26`).

**Phase 4 — First production deploy & release cadence (2026-05-21 → 2026-06-23; W21–W26)**
`release: 4.0.0 first production deployment of the Next.js rebuild (#778)` — **`0bf12dec9`, 2026-05-21**. Then a very high release cadence: 4.0.1 → 4.0.22, **22 patch releases in 33 days**, each a named QA-roundup ("Bubble parity catch-up to 3.5.15", "light mode + legacy share links", "chat-window refresh + Projects bug-bash", "streaming performance & UI parity polish", "subscription billing states & 3.5.18 parity"). The Bubble app is still authoritative; releases are labeled by which Bubble version they've caught up to.
`/flow` is abandoned for plain GitHub Issues (`bf56cb022`, 2026-05-25).

**Phase 5 — Workspace-by-workspace cutover (2026-06-24 → 2026-07-11; W26–W28)**
`release: 4.1.0 first workspace cut over from Bubble (pr #1620)` — **`6d977574c`, 2026-06-24**. Then, in six days: `4.1.1 gate non-cut-over workspaces`, `4.1.2 locked workspace recovery`, `4.1.3`, `4.1.4`, `4.1.5`. A named-customer cutover: `release: 4.2.0 RapidDev workspace cutover (pr #1763)` (2026-07-03). Migrated-data healing releases throughout (`4.0.18 migrated-file healing`, `4.2.1 fix migrated-chat context parsing`, `4.2.3 data repairs`).
Terminus: **`release: 4.3.0 Bubble retirement — all workspaces cut over (pr #1897)` — `17862eb9c`, 2026-07-11**, preceded by `a9ca71df4` retiring the still-on-Bubble gate in code. W28 (Jul 6–12) is the second-largest week: **+71,307 / −25,554, net +45,753**.

**Phase 6 — Post-cutover teardown (2026-07-12 → 2026-08-06; W29–W32)**
Deleting the migration machinery: the ETL pipeline (`4e98b4952`, #2090, 2026-07-21), one-off backfills, the Bubble export split, the GCP/Cloud Run path (`ed19d7d06`, #2312), the Bubble comparison docs, `MIGRATION_PLAN.md`, `legacy-data/`. **W30 (Jul 20–26) is net −59,568 LOC** — the single largest deletion week, and the only negative week in the history.
Simultaneously, feature work continues at full pace: workspace credits, member groups + model access control, Opus 5, deep research disabled by hotfix and rebuilt, Europe CDN migration, per-member credit caps. 15 `hotfix:` commits all fall in this window (2026-07-16 → 2026-08-06).

**Phase 7 — Agent-process consolidation (2026-07-22 → 2026-08-11; W30–W33)**
The densest run of agentic-infrastructure work: the plan-filename gate (`f25140fe1`), the `/implement` handoff block (`b6e9a6310`), `/tighten-docs` (`e1805ac1a`), `/squash-message` (`91542e50d`), the CI-cost reversal moving tests into the agent session (`6c1adca44`), `precommit`→`vet` (`5bfffa8fa`), the license allowlist (`33ef85f36`), `/preview` (`a5f6b1901`), `/renumber-migration` (`b554c5996`), `/audit-github-backlog` (`4d5fe8597`). Last release: `4.4.3 per-member credit limits & spreadsheet reads (pr #2410)`, 2026-08-10.

### 3.2 Weekly table — commits and net lines, whole history

Net lines exclude `pnpm-lock.yaml`, `drizzle/meta/**`, `docs/dependency-graph.dot`, `docs/ast-metrics.txt`, `bubble/**`, `legacy-data/**`. ISO weeks; `week` column is the Monday.

| ISO week | Starts | Commits | + | − | Net |
|---|---|---|---|---|---|
2026-W10 | Mar 02 | 10 | 1,732 | 12 | +1,720 |
2026-W11 | Mar 09 | 105 | 20,159 | 11,790 | +8,369 |
2026-W12 | Mar 16 | 79 | 14,207 | 7,046 | +7,161 |
2026-W13 | Mar 23 | 49 | 21,627 | 5,115 | +16,512 |
2026-W14 | Mar 30 | 51 | 23,348 | 12,344 | +11,004 |
2026-W15 | Apr 06 | 39 | 13,573 | 7,236 | +6,337 |
2026-W16 | Apr 13 | 46 | 22,623 | 7,808 | +14,815 |
2026-W17 | Apr 20 | 47 | 27,321 | 7,498 | +19,823 |
2026-W18 | Apr 27 | 81 | 66,570 | 21,529 | **+45,041** |
2026-W19 | May 04 | 36 | 14,273 | 7,373 | +6,900 |
2026-W20 | May 11 | 59 | 26,342 | 11,278 | +15,064 |
2026-W21 | May 18 | 67 | 26,210 | 11,396 | +14,814 |
2026-W22 | May 25 | 72 | 23,620 | 13,615 | +10,005 |
2026-W23 | Jun 01 | 85 | 22,819 | 7,225 | +15,594 |
2026-W24 | Jun 08 | 84 | 22,947 | 7,972 | +14,975 |
2026-W25 | Jun 15 | 83 | 23,026 | 6,393 | +16,633 |
2026-W26 | Jun 22 | 76 | 17,010 | 5,629 | +11,381 |
2026-W27 | Jun 29 | 36 | 33,926 | 5,879 | +28,047 |
2026-W28 | Jul 06 | 93 | 71,307 | 25,554 | **+45,753** |
2026-W29 | Jul 13 | 89 | 31,143 | 7,521 | +23,622 |
2026-W30 | Jul 20 | 54 | 26,452 | 86,020 | **−59,568** |
2026-W31 | Jul 27 | 46 | 33,093 | 8,754 | +24,339 |
2026-W32 | Aug 03 | 78 | 57,173 | 37,153 | +20,020 |
2026-W33 | Aug 10 | 19 | 15,695 | 6,934 | +8,761 |
| **Total** | | **1,509** | **656,196** | **329,074** | **+327,122** |

Median week: 67 commits. Peak: W28 (93). Including all files (lockfile, snapshots, archives) the totals are +2,625,531 / −1,998,296 / net +627,235.

### 3.3 Releases and hotfixes

**50 `release:` commits** (2026-05-21 → 2026-08-10) [**corrected 2026-08-11: 52 commits on `main`.** One subject lands twice — `4.2.2-hotfix-1 let the sidebar scroll on short viewports (pr #1837)` at both `beeafb025` and `ab8ef967d` — an artifact of the staging/production promotion model. 51 distinct versions, 50 of them tagged.], **87 git tags** (50 SemVer `4.0.0`–`4.4.3` including `4.2.1-hotfix-2` and `4.2.2-hotfix-1`; 36 `ci/*` dispatch tags; 1 `attested/<sha>`; 1 `last-flow-docs`).

Version-line milestones:
- `4.0.0` (2026-05-21, `0bf12dec9`) — first production deployment of the rebuild
- `4.1.0` (2026-06-24, `6d977574c`) — first workspace cut over from Bubble
- `4.2.0` (2026-07-03, `a55d679e4`) — RapidDev workspace cutover
- `4.3.0` (2026-07-11, `17862eb9c`) — **Bubble retirement, all workspaces cut over**
- `4.4.0` (2026-07-30, `3bfbd2ef9`) — workspace credits, model access control, Opus 5
- `4.4.3` (2026-08-10, `c86b82047`) — current `staging`/`production` head

**15 versionless `hotfix:` commits** (2026-07-16 → 2026-08-06). Two are worth quoting because they are the honest kind: `hotfix: #2165 temporarily disable deep research while its backend is rebuilt (pr #2172)` (2026-07-27) and `hotfix: #2239 stop impersonated sessions from consuming the target's tips (pr #2240)`. Others: a dead attachment bricking a whole chat (#1993), a voice-dictation hang bounded twice (#2054, two separate hotfixes 3 days apart), Chromium 150 crashing at launch → pinned to 149, paragraph breaks injected mid-sentence into replies (#2176), knowledge chunking made linear/bounded/interruptible (#2306).

---

## SECTION 5 — DECISION RECORD

1,222 PRs (1,035 merged, 165 closed unmerged, 22 open); 1,214 issues (1,050 closed, 164 open). PR/issue numbers share a sequence up to 2,436. 28 decision docs under `docs/decisions/`. Merged PRs by base: `main` 981, `production` 18, `staging` 11, `epic/*` 10, feature/session branches 15.

**Reversals and abandoned directions — the most valuable findings, ordered by cost:**

**R-1. Deployment platform: Railway → Cloud Run → Railway → Cloud Run deleted (5 months).**
2026-03-06 `8af1cf5fa` picked Railway ("no Dockerfile needed"). 2026-03-10 `dd648f84e` switched to **Google Cloud Run** ("Dockerfile + Cloud Build"). 2026-03-12 `765cf7e21` put it on hold: *"GCP org policy complexity and unconfirmed $25k credits have paused this path. May resume if credits are confirmed."* It never resumed. 2026-08-05 `ed19d7d06` (#2312) deleted it, and the commit is unusually candid about the cost of leaving it parked: *"the repo kept describing it as parked rather than gone, and still carried the tooling to resume it."* Deleting it required unwinding **rationale that had justified unrelated present-day choices by Cloud Run's properties** — postgres.js's persistent-server fit, pnpm's Dockerfile integration, a future worker as a second service, Turso's edge advantage, and the reverse-proxy example lists in `network.ts` and `no-next-url-clone-redirect.ts`.
**Lesson in the artifact:** a parked decision keeps costing you until it is deleted, because other decisions cite it.

**R-2. Project management: a bespoke `/flow` DAG → GitHub Issues (~2 months, built and deleted).**
`586e32637` (2026-03-26) replaced an earlier `/cascade` skill with "unified flow orchestration"; `eee303e4f` migrated flow tracking to GitHub Issues while keeping the graph; the system grew `docs/flow/` (a `FLOW_GRAPH.dot`, current/ready task files, domain task files, plans, **per-agent-persona team files** — `Lev.md`, `Mira`, `Noa`, `Vera`, `Eli`, `Rio`, `Quinn`), an orphan coordination branch, `scripts/flow-sync.sh`, `scripts/flow-gh.py`, and two skills. `bf56cb022` (#836, 2026-05-25) deleted all of it: *"The /flow project-management approach … is being abandoned in favor of standard GitHub issue tracking."* One artifact survived because it was worth keeping: the `/propose-issue` skill, extracted as the dedupe-then-file wrapper. The `last-flow-docs` tag is the tombstone.

**R-3. CI: full per-PR gate → no PR CI at all, tests moved into the agent session (`6c1adca44`, #2329, 2026-08-08).**
The single best-argued decision in the repo, and it reverses the industry default. Verbatim: *"GitHub Actions spend ran ~$190/mo against the Free tier's 2,000-minute allowance, and the per-PR test lane was 69% of it — re-running on every push a suite an agent can run locally for nothing."*
What makes it a real decision rather than a cost cut is what it *refused* to do: *"The retired lane was never a full-suite run — it passed `--changed <pr base sha>` — and keeping only its location would have made every iteration a ~9-minute whole-repo run, a check people skip."* So the replacement reproduces the change-picking, and then goes further: *"What it cannot see is files no test imports — fixtures, setup modules, configs — where Vitest's own `forceRerunTriggers` defaults silently under-select, as they did in the retired lane: editing the RTL setup selected 170 of 526. Setting them explicitly makes the scoped run better than the lane it replaces, not merely equal."*
And it names the bar it then failed: *"Promoting that run to the gate raised a reliability bar it then failed. RTL's 1s `waitFor` and Vitest's 5s default are latency budgets, not assertions, and sit inside the noise beside twelve parallel scripts, so both get explicit ones."*
Cost: *"The ~25 docs, rules and skills encoding the old gate are rewritten around `deployment.md`."* Consequence: a PR carries no verdict, so verification became a written attestation, backstopped by `release-gate.yml` recording an `attested/<digest>` marker that the deploy jobs require.

**R-4. Chat-list state: a hand-rolled coherence system replaced wholesale (`1d227b9a6`, #2006 closing #1756, 2026-08-06).**
Built incrementally over ~2 months as *"multiple independent representations of 'what chats exist' (the RSC project-landing prop, the client-paginated sidebar lists, and the ActiveChatProvider overlay bag: `deletedChatIds`, `titleOverrides`, `chatListVersion`, `listSyncVersion`) reconciled by hand."* Replaced by TanStack Query + `@normy/react-query` normalization (server/list cache) + zustand (client workflow state) + RQ's own `refetchOnWindowFocus`/`refetchInterval` replacing the hand-rolled multiuser poll one-for-one. The framing is the interesting part: *"This eliminates the reported list glitches as classes rather than patches"* — a created chat missing from the project landing, a deleted chat reappearing after refresh, a sidebar loader spinning forever. Staged in phases behind an **invariant ledger** carrying forward every behavior the prior patches bought. Two decision docs exist for this area (`chat-active-state.md`, `chat-list-state.md`), i.e. the first design was documented before it was replaced.

**R-5. Production deploy: `main` HEAD → `staging` branch → deferred to a nightly window (two moves, 8 days apart).**
`83d9aaa51` (#1816, 2026-07-08) — *"ship production from the staging branch instead of main HEAD."* `7449ae400` (#1975, 2026-07-16) — *"defer production deploy to nightly 02:00 UTC window."* So merging a `release:` commit now only **arms** a deploy. `hotfix:` was given a disjoint lane (`7d14d7083`, #1843) precisely so it is *not* deferred — and, being not `is_release`, a hotfix fast-forwarded onto `staging` during reconciliation does not re-deploy prod.

**R-6. Background agent processes: abandoned as a category (`d242ed1e5`, #1112, 2026-06-04).**
See § 4.2. The failure is a UX failure, not a technical one — the session list showed "running", so operators never returned. The replacement (`/check-merge`) is deliberately **stateless**: *"each run fetches the default branch and tests whether the branch already contains its tip (`git merge-base --is-ancestor`)… No state file, no `--reset`, no sleep — the branch's own history is the reference point."* The commit names what it gives up: *"Tradeoff: drops automatic history-rewrite (force-push on main) labeling, which needs memory of the prior tip."*

**R-7. Built-then-torn-down migration machinery (~4 months).** The Bubble→Supabase ETL (`scripts/etl/**`), the export splitter, the CSV snapshots, the reversible-ETL flag + rollback + FK-blocker preflight (`bc7ce7ef9`, `7c586e931`), a cutover-correctness ledger, `.claude/rules/etl.md`, an `/etl-sample-check` skill, an `etl-sample-compare.yml` workflow, the `## ETL` CLAUDE.md section, `BUBBLE_API_*` env, ~14 `bubble-data-export-*` / `bubble-sync-*` branches. All retired by `4e98b4952` (#2090) once no workspace was left on Bubble — deliberately, as *"Bubble-retirement runbook Part B Tier 2."* This was a **planned** teardown of intentionally disposable code, which is the opposite of R-1's failure mode.

**R-8. Smaller reversals, each a named lesson:**
- `529b0d569` renamed the FSD pages layer to `page-components/` to dodge a Next.js quirk; `26c4aa0e8` (2 days later) reverted to the canonical `src/pages/` and solved it with the empty root `pages/` shadow instead.
- `8b7c333c2` renamed dual barrels `index.server.ts` → `index.client-safe.ts` — the suffix should name what's *safe*, not what's tainted.
- `83f430419` replaced a `useSafeAction` `onError` **enum** with a `skipErrorToast` **boolean** — an enum with two members.
- `3680c7867` (#1240) explicitly reverted an `openSectionOnNavCommit` accordion-defer workaround.
- `a244c550d` replaced lazy env getters with eager `createEnv` using a Proxy — 5 days after `12eccd074` introduced `createEnvGetter`.
- `e1bc7cbd0` reverted Prettier `printWidth` to 80 and reformatted the whole codebase.
- `f09678618` replaced a broken `pnpm audit` in CI (the ancestor of today's `security-diff`).
- `bb38b3cfa` (#632) replaced ETL "tombstone skip-with-warn" with an **allowlist gate** — a warn-and-continue replaced by a hard gate, the same instinct as the never-`warn` ESLint policy.
- `/from-epic` → split into `/sync-epic` (`b2382e622`) → generalized into `/sync-branch` and `/from-epic` deleted (`5ca55db2e`) — three shapes in three days.
- Model catalog churn as ordinary product work: Qwen retired and routed to DeepSeek (`527182e20`), Gemini 3.1 Flash Lite → 3.5 (`fe52162a1`), Gemini 3.5 Flash → 3.6 (`ccb8c22c4`), Kimi K2.6 retired onto Auto (`0e3879e0b`).

**R-9. The type-overlap floor, flipped to its strictest setting (`bd73c7bd4`, #2126, 2026-08-04).** `pnpm type-overlap` at **threshold 1**: *any* member two named types both declare is a finding. CLAUDE.md is careful to state what the findings usually are: *"expect a reported group to be a lying key, a drifted spelling or a needless optional as often as a missing base."*

---

## SECTION 6 — DOMAIN MODEL EVOLUTION

**115 SQL migrations** (`0000`–`0113` plus `rollback-cut-12.sql`), 1,242 LOC, 56 files under `src/shared/db/`. [**Corrected 2026-08-11: 114 migrations.** `drizzle/meta/_journal.json` has 114 entries (`0000`–`0113`); the 115th `.sql` file, `rollback-cut-12.sql`, is a hand-written rollback script for one cutover task (added in `864523920`), deliberately outside the journal. Say "114 migrations plus a hand-written rollback", not 115.] Every table is created with `.enableRLS()` and zero policies. Enum values must be declared as top-level exported `pgEnum` constants — a rule that exists because inline enums are invisible to Drizzle's snapshot (§ 4.2, `f0d30fecf`).

### Arc 1 — `0000`–`0009`: the core, and an immediate renaming
`0000_core-workspaces-chats-projects` establishes workspaces / chats / projects. `0001_enable-rls-all-tables` — RLS is the *second* migration, before any feature. `0002` converts the chat model column to an enum. `0003` renames member personal instructions. `0004` adds `message_logs` + `usage_logs`, `0005` `project_members`, `0007` `files`, `0008` per-provider file columns, `0009` subscriptions + `stripe_webhook_events`.
The pre-migration rename (`d828289e5`) is the tell: `organizations→workspaces`, `memberships→members`, `user_profiles→user_configs`. Naming was corrected before the schema hardened, and "workspace" is the term everywhere after.

### Arc 2 — `0010`–`0021`: chat becomes a system, not a table
`0010` additional-context lists on chats · `0011` `in_compression_now` (chat compression is a runtime state, so it needs a column) · `0012` `deep_research_jobs` · `0013` user context lists · `0014` **fixes an enum shape that migration `0012`'s feature had left drifted** · `0015` `subscription_id` on `usage_logs` (the `LogUsageParams` incident) · `0016`–`0017` **ETL id mapping + `legacy_bubble_id` on every Weaviate-addressed table** — the schema starts carrying migration scaffolding · `0018`–`0019` project relevant-context, custom instructions widened to `text` · `0020` first bulk `llm_model_id` enum update · `0021` OpenClaw flags.

### Arc 3 — `0022`–`0047`: identity moves from user to member
The most conceptually significant arc. A cluster of migrations relocates identity from the **user** to the **member** (the user-within-a-workspace):
`0025` backfill `members.name` from `user_configs` → `0026` **drop `user_configs.display_name`** · `0033` **move user context list to members** · `0028` add user avatar → `0074` **add avatar to members** (and `b8288c909`, *"store profile avatars per-member instead of per-user"*) · `0032` `chats.created_by` → member FK · `0070` `members.legacy_bubble_id`.
The realization: in a multi-workspace product, a person's *name, avatar, instructions and context* belong to their membership, not their account.
Also here: `0031` member soft-delete · `0034` `session_time_logs` · `0035`–`0036` chat drafts, incl. `NULLS NOT DISTINCT` · `0037` converted-file fields · `0039` `chats.total_messages_count` (denormalized counter) · `0041` **structured** user context list (a JSON shape formalized) · `0042` grace period **moved** from subscription to workspace · `0043` relax `usage_logs` FKs and widen `cost` — the log table stops being strictly referential so it can survive deletions · `0045`+`0047` a `utms` table then **normalized** attribution · `0046` a chats `type`/`project_id` **invariant** (a CHECK constraint, not app logic).

### Arc 4 — `0048`–`0082`: the schema learns it has two populations
`0048` `is_migrated_from_legacy` · `0049` analytics tables get multi-tenancy **and** the legacy flag · `0051` `requires_password_reset_after_migration` · `0063` backfill "native workspace completed" · `0072` `chats.created_by` made nullable **for legacy** rows · `0078` backfill clearing the migration reset for users who already reset. For roughly six weeks the data model explicitly encodes "migrated vs native", and several NOT NULLs are relaxed to accommodate imported rows.
`0050` `is_superuser` + impersonation audit · `0052` Lemlist pending signals · `0053` **drop** `members.analytics_jwt` (a credential removed from the DB) · `0055` **drop** `workspaces.openclaw_visible` · `0056` **drop** a subscription customer unique constraint · `0064` subscription plan made nullable · `0067` **remove the `free` plan** · `0069` add `free_without_restrictions` · `0080` a `pgrst` anchor schema (PostgREST hardening) · `0081` **add `auto` to the model enum** + `0082` backfill forcing all users onto it — the product decides model choice is better made for the user than by them.

### Arc 5 — `0083`–`0113`: billing becomes the domain
Post-cutover, the schema's center of gravity shifts to credits and access control:
`0085` `workspaces.credits_remaining` · `0086` admin action audit · `0087`–`0088` chat pins + project pins · `0089` `generation_jobs` (+ `0094` a `vanilla_chat` job type) — generation becomes a durable job, not a request · `0090`–`0091` onboarding tips + a backfill establishing a **pre-feature cohort** · `0092` **member groups + model access** (+ `0093` backfill defaults, + `0099` rename **and heal** those defaults) · `0095` `workspace.billing_enabled` → **`0104` drops it** and `0105` replaces it with `waive_credit_enforcement` (see `ae2ef0a2e`, *"retire the billing-enforcement date, move the off-switch onto workspaces"* — a date-based switch replaced by a per-row one) · `0106` a **backfill ledger** (backfills become first-class, tracked data) · `0107` `usage_log.analytics_model` · `0108` per-member credit limit → `0111` individual credit limit · `0110` member default model · `0112` clear unattributed legacy usage logs **and restore NOT NULL** — the legacy accommodation is finally paid off · `0113` `project_id` on usage and message logs.
Ten migrations in this arc are pure `llm_model_id` enum additions (`0079` GLM 5.2, `0083` GPT 5.6, `0098` Grok 4.5, `0100` Claude Opus 5, `0102` Kimi K3, `0103`/`0109` Gemini 3.6 Flash / 3.5 Flash Lite, …), which is what makes the top-level-`pgEnum` rule load-bearing rather than pedantic.

**What the shape says about changing understanding of the product:** (1) tenancy was right from migration `0000` but *identity* took Arc 3 to get right; (2) migration status was a first-class schema concept for ~6 weeks and then deliberately deleted; (3) `0112`'s "restore NOT NULL" is the moment the product stops being a migration; (4) billing evolved from a plan enum to a metered credit ledger with per-member caps and per-workspace waivers — the schema records a business model changing under the app; (5) `0089` (`generation_jobs`) is where an LLM reply stops being a request/response and becomes a durable job.

---

## SECTION 7 — ATTRIBUTION

All numbers computed on `main` (1,509 commits) after unshallowing. Line counts are given **excluding** generated/vendored paths (`pnpm-lock.yaml`, `drizzle/meta/**`, `docs/dependency-graph.dot`, `docs/ast-metrics.txt`, `bubble/**`, `legacy-data/**`) because those swamp everything else.

### 7.1 `git shortlog -sne --all`

```
   1354	Vova Zakharov <vzakharov@gmail.com>
     51	minarotari <mina.rotari@zeroqode.com>
     37	Claude <noreply@anthropic.com>
     35	Sam <semyon.golovachev@zeroqode.com>
     29	JuliaSuhovici <63416383+JuliaSuhovici@users.noreply.github.com>
      3	Cursor Agent <cursoragent@cursor.com>
```

Committers (distinct from authors): `GitHub <noreply@github.com>` 950 (squash-merges), `Vova Zakharov` 524, `Claude` 29, `Cursor Agent` 6.

### 7.2 Per-contributor detail

| Contributor | Commits | % of 1,509 | First commit | Last commit | + | − | Net | With Claude co-author |
|---|---|---|---|---|---|---|---|---|
**Vova Zakharov** `vzakharov@gmail.com` | **1,354** | **89.73%** | 2026-03-06 `5461cd560` *Initial commit* | 2026-08-11 `043393fec` | 600,157 | 310,103 | **+290,054** | 1,145 (84.6%) |
minarotari `mina.rotari@zeroqode.com` | 51 | 3.38% | 2026-05-11 `0adf1f23f` *feat: onboarding signup flow aligned with Bubble UI* | 2026-07-01 `4be5ee740` | 19,400 | 5,586 | +13,814 | 40 (78%) |
Claude `noreply@anthropic.com` (as **author**) | 37 | 2.45% | 2026-05-04 `90a4f82f2` | 2026-08-03 `9a60ae9ed` | 1,574 | 2,279 | −705 | n/a |
Sam / `Saam-G` `semyon.golovachev@zeroqode.com` | 35 | 2.32% | 2026-05-01 `a813f56c8` *Revise bug report statuses and descriptions* | 2026-08-11 `bcb4354f8` | 19,051 | 5,512 | +13,539 | 30 (86%) |
JuliaSuhovici | 29 | 1.92% | 2026-05-11 `496c253ac` *fix: #494 add deepseek_v4_flash to llm_model_id pg enum* | 2026-08-11 `4cd68a75a` | 15,681 | 3,631 | +12,050 | 28 (97%) |
Cursor Agent `cursoragent@cursor.com` | 3 | 0.20% | 2026-04-30 `b61929fba` | 2026-05-01 `c53eee0a3` | 333 | 1,963 | −1,630 | n/a |
| **Total** | **1,509** | 100% | | | **656,196** | **329,074** | **+327,122** | |

**Areas each non-Vova human touched** (top directories by file-touch count):
- **minarotari** — frontend/UI: `src/pages/chat` (100), `src/app/ui` (72), `src/pages/workspace-settings` (70), `src/widgets/message-list` (53), `src/pages/onboarding` (48), `src/shared/ui` (38), `src/pages/auth` (29), `src/pages/memory` (23), `public/icons/*`, `src/widgets/plan-selector`, `app/globals.css`. Onboarding + auth + chat UI + icon assets.
- **Sam (`Saam-G`)** — the deepest of the three: `src/pages/chat` (149), `src/pages/workspace-settings` (135), `src/entities/llm-model` (40), `src/features/usage-analytics` (27), **`src/shared/db` (22)** and `drizzle/meta/_journal.json` (12) — i.e. he authored migrations. Model catalog, analytics, member groups.
- **JuliaSuhovici** — `src/pages/workspace-settings` (64), `src/pages/chat` (64), `src/app/ui` (57), **`src/entities/subscription` (35)**, `src/features/manage-project` (19), `src/pages/onboarding` (19), `src/shared/weaviate` (13), `scripts/backfills/free-plan-restriction` (10). Billing/subscription surface + a backfill.

### 7.3 Human vs. Claude vs. other agents

| Bucket | Commits | % |
|---|---|---|
Authored by Vova | 1,354 | 89.73% |
— of those, carrying a `Co-authored-by: Claude*` trailer | 1,145 | 84.6% of his own |
— carrying **any** agent trailer (Claude / Cursor / Codex) | 1,161 | 85.7% of his own |
— carrying **no** co-author trailer at all | 185 | 13.7% of his own |
Authored by other humans (mina + Sam + Julia) | 115 | 7.62% |
— of those, carrying a Claude co-author trailer | 98 | 85.2% of theirs |
Authored by Claude directly | 37 | 2.45% |
Authored by Cursor Agent directly | 3 | 0.20% |

**1,287 of 1,509 commits (85.3%) carry a `Co-authored-by` trailer.** Trailer tallies:

```
838  Claude <noreply@anthropic.com>
185  Claude Opus 4.6 (1M context) <noreply@anthropic.com>
139  Claude Opus 4.6 <noreply@anthropic.com>
 48  Claude Opus 4.7 (1M context) <noreply@anthropic.com>
 34  Claude Sonnet 4.6 <noreply@anthropic.com>
 25  Cursor Agent <cursoragent@cursor.com>
 15  Vova Zakharov <vzakharov@gmail.com>
  8  Claude Opus 4.8 <noreply@anthropic.com>
  4  Cursor <cursoragent@cursor.com>
  1  Claude Opus 5 <noreply@anthropic.com>
  1  OpenAI Codex <noreply@openai.com>
  1  github-actions[bot]
  1  Cursor <noreply@cursor.com>
  1  Mira (CHT-15)          ← a /flow agent persona
```

Model-trailer timeline (first → last use), i.e. which model was doing the work when:
`Claude Sonnet 4.6` 2026-03-06 → 2026-03-12 · `Claude Opus 4.6` 2026-03-06 → 2026-03-25 · `Claude Opus 4.6 (1M context)` 2026-03-18 → 2026-04-25 · `Claude Opus 4.7 (1M context)` 2026-04-16 → 2026-05-26 · generic `Claude` 2026-05-11 → 2026-08-11 (the trailer stopped naming the model) · `Claude Opus 4.8` 2026-07-01 → 2026-07-20 · `Claude Opus 5` 2026-07-27 (once).
Only **8 commits** carry a `Claude-Session:` trailer; **0** carry "Generated with".

Vova's no-trailer commits by month: Mar 13, Apr 54, May 81, Jun 12, Jul 23, Aug 2 — so trailer discipline was weakest in April–May and tightened afterwards. This means the 84.6% figure is a **floor** on Claude involvement, not a measurement of it.

### 7.4 Pull requests

| Author | All PRs | % of 1,222 | Merged | Closed unmerged | Open | Merged PR + | Merged PR − |
|---|---|---|---|---|---|---|---|
`vzakharov` | **1,096** | **89.69%** | 923 | 156 | 17 | 928,432 | 1,338,679 |
`minarotari` | 57 | 4.66% | 51 | 6 | 0 | 27,452 | 5,426 |
`Saam-G` | 35 | 2.86% | 32 | 1 | 2 | 56,015 | 6,227 |
`JuliaSuhovici` | 34 | 2.78% | 29 | 2 | 3 | 21,618 | 3,887 |

Merged: **923 / 1,035 = 89.18%** are Vova's. His 156 closed-unmerged PRs (14.2% of his own) are themselves a finding — abandoned attempts are visible in the record.

**Review of the other humans' work (the "reviewed the rest" claim), all 126 non-Vova PRs queried via GraphQL:**

| Metric | Count |
|---|---|
Non-Vova PRs, all states | 126 |
— merged | 112 |
— **merged by `vzakharov`** | **111 (99.1%)** |
— merged by someone else | 1 (#2019, self-merged by `Saam-G`) |
Non-Vova PRs with a **formal** review by `vzakharov` | 52 / 126 (41.3%) |
— `APPROVED` | 16 |
— `CHANGES_REQUESTED` | 2 (#1676, #1685) |
— `COMMENTED` | 34 |
Non-Vova PRs reviewed by anyone other than Vova | 0 | ← **WRONG, see correction below** |

No PR in this repo was ever reviewed by anyone except Vova. Every non-Vova PR that landed except one was pressed by him.

> **CORRECTION (2026-08-11, verified against a full clone).** The "0" row above is wrong as
> written, and re-running the obvious query contradicts it: a GraphQL sweep of all 1,222 PRs
> returns **10 PRs carrying a review event whose author is not `vzakharov`** — #1226, #1247,
> #1685 (minarotari), #1711, #2099, #2322, #2341 (JuliaSuhovici), #2019, #2383, #2420 (Saam-G).
>
> In every one of the ten, the "reviewer" is the PR's **own author replying to Vova's inline
> comments**. GitHub records a threaded reply to a review comment as a `REVIEWED` event with an
> empty body, submitted by the author minutes-to-hours after Vova's review. So the *substance*
> of the claim survives — nobody ever reviewed anyone **else's** PR except Vova — but the
> phrasing here does not, and anyone recomputing it will get 10 hits and reasonably conclude the
> dossier is unreliable. When recomputing, exclude review events whose author equals the PR
> author.
>
> Two related figures also move with the tip: non-Vova merged PRs is **113**, of which
> **112** were merged by `vzakharov` (still one exception, #2019, self-merged by `Saam-G`).
> And the review record is livelier than the merge count implies: across the 52 reviewed
> non-Vova PRs, Vova submitted ~149 review events (16 `APPROVED`, 2 `CHANGES_REQUESTED`, the
> rest `COMMENTED`), with genuine multi-round threads — #2099 alternates a dozen times.

### 7.5 Verdict on the "~99% of the code, reviewed the rest" claim

**The "reviewed the rest" half is accurate — 99.1% (111/112) of other people's merged PRs were merged by Vova, and no one else ever reviewed anything.** [**Amended 2026-08-11:** the merge figure is now **112/113**, and "no one else ever reviewed anything" needs the precision in § 7.4's correction box — nobody reviewed anyone *else's* PR, but PR authors do appear as reviewers on their own PRs.]

**The "~99% of the code" half is overstated. The correct figures are ~89–92%.** Pick whichever metric you want to stand behind; all are computed, none rounds to 99%:

| Metric | Vova's share |
|---|---|
Commits authored (of 1,509) | **89.73%** |
Commits authored, counting Claude-authored + Cursor-authored commits as his (all agent runs he directed) | **92.38%** (1,394/1,509) |
Net lines added−removed, excluding generated files | **88.67%** (290,054 / 327,122) |
Lines added, excluding generated files | **91.46%** (600,157 / 656,196) |
PRs authored | **89.69%** (1,096 / 1,222) |
Merged PRs authored | **89.18%** (923 / 1,035) |

**Defensible resume phrasing:** *"authored ~90% of commits and ~91% of lines (1,354 of 1,509 commits; 1,096 of 1,222 PRs), directing Claude on 85% of them, and personally reviewed and merged 99% of everything contributed by the three other engineers."*

**Two corrections worth stating rather than hiding:**
1. **The other three engineers contributed real, non-trivial work** — 115 commits, 112 merged PRs, +39,403 net lines (12.0% of net), including DB migrations (Sam) and the subscription surface (Julia). They were not doing cosmetics.
2. **"With Claude" was not exclusive to Vova.** 98 of the other humans' 115 commits (85.2%) also carry Claude co-author trailers — the same rate as Vova's own 84.6%. The agent-assisted workflow was the team's, not one person's. What *is* uniquely Vova's is the agentic infrastructure itself: all 33 skills, `CLAUDE.md`'s 116 revisions, and the vet gate are on his side of the ledger.

**UNCERTAIN:** (a) The 3 `Cursor Agent` commits and 37 `Claude`-authored commits cannot be attributed to a directing human from git metadata alone; I've assumed Vova, since he owns every skill and the Cursor scaffolding, but the trailers don't prove it. (b) Line counts on a squash-merge workflow attribute the whole squashed diff to the PR author, which is correct for authorship but says nothing about how much of a diff was typed vs. generated. (c) 41.3% formal-review coverage understates actual review: 111 of 112 merges were his, and merging without a formal review event is still a review action in GitHub's model.

---

## SECTION 8 — CODE SNIPPETS

All verbatim at HEAD `4cd68a75`. None contains secrets, credentials, customer data, or personal data.

**1. Type-level privilege-escalation guard** — `src/shared/permissions/types.ts:4-10`

```ts
/**
 * The *effective* "Admin project view" flag — `members.showAllProjects` gated on
 * a live owner/admin role. Branded so the raw column (a plain `boolean`) cannot
 * be passed where the effective flag is required, which would be a privilege
 * escalation. `deriveShouldShowAllProjects` is the only producer in production.
 */
export type ShouldShowAllProjects = Branded<boolean, 'ShouldShowAllProjects'>;
```

*Why it's interesting:* the DB column and the authorization decision are both `boolean`, so the type system would happily let you swap them. Branding makes that swap a compile error and names the single legal producer. A security invariant enforced at zero runtime cost.

**2. Copy templates whose placeholders are type-checked** — `src/shared/formatting/interpolate.ts:6-31`

```ts
type TextTemplate = `${string}{${string}}${string}`;

/** The placeholder names inside a template's literal type, as a union. */
type Placeholders<Template extends string> =
  Template extends `${string}{${infer Name}}${infer Rest}`
    ? Name | Placeholders<Rest>
    : never;

export function interpolate<Template extends TextTemplate>(
  template: Template,
  values: Record<Placeholders<Template>, string | number>,
): string {
  let rendered: string = template;
  for (const [name, value] of Object.entries(values)) {
    rendered = rendered.replaceAll(`{${name}}`, String(value));
  }
  return rendered;
}
```

*Why it's interesting:* a recursive conditional type extracts `{slot}` names from a string literal, so a missing or misspelled slot is a **type error** rather than a `{placeholder}` leaking into production UI. `TextTemplate` additionally rejects a template that lost all its slots. This is what lets `texts.ts` be literal-only (§ 4.5) without giving up interpolation — and the sibling `plural(count, ONE, MANY)` returns `One | Many` specifically so both branches' slots still typecheck.

**3. Lint rule as security control** — `eslint/rules/enforce-rls.ts:3-11`

```ts
/**
 * Require every pgTable() call to be chained with .enableRLS().
 *
 * The app queries the database via Drizzle as the postgres superuser
 * (bypasses RLS), so no policies are needed. But enabling RLS with zero
 * policies locks down the Supabase Data API (PostgREST) — both anon and
 * authenticated roles get zero access to public tables.
 *
 * Auth is unaffected (operates on the auth schema, not public).
 */
```

*Why it's interesting:* a skeptical reviewer's first reaction to "RLS enabled, zero policies" is that someone misunderstood RLS. The comment shows it's deliberate: RLS-with-no-policies is being used as a **kill switch for Supabase's auto-generated REST API**, not as an authorization mechanism. Introduced in `d6aed10df` (2026-03-17) alongside the migration that enabled it, so the invariant and its enforcement landed together.

**4. A read-only tool that cannot write, structurally** — `scripts/diagnostics/readonly-db-probe.ts:83-107`

```ts
/**
 * Guard each section so one failing query still yields the rest + its error,
 * and run every section in its own READ ONLY transaction. Postgres rejects any
 * write (INSERT/UPDATE/DELETE/DDL) inside a read-only transaction even for the
 * superuser connection this uses, so the probe is structurally incapable of
 * mutating the database it inspects — defense in depth for a tool that reads
 * production. Each section is a separate transaction, so an error in one rolls
 * back only that section and the rest still run.
 */
async function section<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T | { error: string }> {
  try {
    return await db.transaction(fn, { accessMode: 'read only' });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error),
    };
  }
}
```

*Why it's interesting:* the threat model is *an LLM agent editing this file to investigate production*. Rather than trusting a naming convention, it pushes enforcement into Postgres — the connection is a superuser, so nothing at the application layer could stop a stray `UPDATE`, but `accessMode: 'read only'` does.

**5. Fixing a test-selection bug the framework's defaults create** — `src/shared/testing/force-rerun-triggers.ts:25-42`

```ts
/**
 * Vitest's own default is
 * `['**\/package.json/**', '**\/{vitest,vite}.config.*\/**']`, and the trailing
 * `/**` means both only match a *directory* of that name — `package.json`
 * matches by accident, `vitest.config.ts` does not match at all. Setting this
 * explicitly is what makes a config change re-run the suite. Patterns are
 * matched against absolute paths, hence the leading `**\/` on every entry.
 */
export const FORCE_RERUN_TRIGGERS = [
  '**/package.json',
  '**/pnpm-lock.yaml',
  '**/vitest.config.*',
  '**/vitest.*.config.*',
  '**/vite.config.*',
  '**/tsconfig*.json',
  '**/test-fixtures/**',
  '**/src/shared/testing/**',
  '**/scripts/testing/**',
];
```

*Why it's interesting:* this is the load-bearing detail behind decision R-3 (no CI on PRs). The whole gate rests on `vitest --changed` selecting the right files, and the file documents the exact defect in Vitest's defaults — a trailing `/**` making the pattern directory-only — plus the measured consequence: *"Editing the file that configures RTL for the whole suite selected 170 of 526 files before these entries existed."* A skeptic asking "how do you know your scoped run isn't under-selecting?" gets an answer with a number.

**6. Type-aware lint rule that models a logging library's runtime behaviour** — `eslint/rules/no-uncaused-rethrow.ts:17-27`

```ts
/**
 * Whether pino's error serializer will follow `type` as a cause. Its runtime test
 * is a string `message` (`isErrorLike` in pino-std-serializers) rather than
 * `instanceof Error`, which is what legitimizes the structural fallback below.
 * `any`/`unknown` fail — the bare catch binding is the shape that drops
 * everything when an SDK throws a string.
 */
function isErrorType(type: ts.Type, seen: Set<ts.Type>): boolean {
  if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
    return false;
  }
  if (type.isUnion())
    return type.types.every((part) => isErrorType(part, seen));
```

*Why it's interesting:* the rule enforces `cause` chaining on rethrows, but it defines "is this an Error" **structurally**, deliberately matching pino's `isErrorLike` rather than `instanceof Error` — because the check has to predict what the *logger* will serialize, not what TypeScript thinks. It also rejects `any`/`unknown`, naming the real failure mode: a bare `catch (e)` binding silently drops everything when an SDK throws a string.

**7. The agent's own environment, patched from inside the repo** — `.claude/hooks/session-start.sh:36-56`

```bash
install_gh_shim() {
  local shim_dir="${HOME}/.local/bin"
  # Resolve the real gh, ignoring any shim a previous run left in shim_dir, so
  # the shim never ends up exec'ing itself.
  local real_gh
  real_gh="$(PATH="$(printf '%s' "$PATH" | tr ':' '\n' | grep -vFx "$shim_dir" | paste -sd: -)" command -v gh || true)"
  if [ -z "$real_gh" ]; then
    echo "session-start: gh not found on PATH; skipping gh proxy shim." >&2
    return 0
  fi
  mkdir -p "$shim_dir"
  cat > "${shim_dir}/gh" <<EOF
#!/bin/bash
exec env -u HTTPS_PROXY -u https_proxy ${real_gh} "\$@"
EOF
  chmod +x "${shim_dir}/gh"
}
```

*Why it's interesting:* the agent VM's egress proxy blocks long-polling `api.github.com` calls, so `gh run watch` hangs and every CI-watching skill stalls. The fix is a PATH-shadowing shim that strips the proxy **for `gh` only** — with the non-obvious detail handled: PATH is filtered to exclude the shim directory before resolving the real binary, so a re-run never produces a shim that `exec`s itself. `git` is deliberately left alone.

**8. A guardrail whose comment cites its own breach** — `.claude/skills/finalize/SKILL.md:64`

```markdown
A directory name is not self-enforcing: this tree has reached `main` anyway,
carrying a 964K Railway log dump with customer email addresses (pr #2234). So
verify the sweep actually ran — and **never end the turn with the tree still on
the branch**, since from here the operator is free to merge.
```

*Why it's interesting:* the file is a process document, and this is the process documenting its own failure with the PR number attached. It also explains *why* this sweep runs last, after every other step — because the squash proposal it holds is edited right up to the merge, and sweeping it earlier would leave the single most consequential edit (the permanent `git log` record) as the only one made with the doc gone. Verified in § 10, R1.

---

## SECTION 9 — HARD NUMBERS

Everything here was computed, not estimated. Commands are in each row where non-obvious.

| Metric | Value | How |
|---|---|---|
**Total commits** (`main`) | **1,509** | `git rev-list --count HEAD` (after unshallow) |
— merge commits | 35 | `git rev-list --count --merges HEAD` |
— landed via GitHub squash-merge | 950 | committer `noreply@github.com` |
**Total PRs** | **1,222** | GraphQL `pullRequests.totalCount` |
— merged | 1,035 | |
— closed unmerged | 165 | |
— open | 22 | |
**Total issues** | **1,214** (1,050 closed / 164 open) | GraphQL |
Contributors (git authors) | 6 identities: 4 humans + Claude + Cursor Agent | `git shortlog -sne --all` |
**Tracked files** | **3,569** | `git ls-files \| wc -l` |
Application LOC (ts+tsx+scss+css+mjs+cjs) | **~269,864** | |
— `.ts` | 196,054 across 1,824 files | |
— `.tsx` | 60,452 across 508 files | |
`src/` LOC | 240,499 across 2,168 files | |
Markdown LOC | 19,646 across 172 files | |
**Test files** | **687** total | |
— default (credential-free) Vitest suite | **562 files** | `vitest list --config vitest.config.ts` |
— `*.integration.test.ts` | 83 files | |
— `*.external.test.ts` | 12 files | |
— Playwright `*.spec.ts` | 30 files | |
**Test cases, default suite** | **5,235** | `vitest list` well-formed case lines (4,874 in the `src` project + 361 in the `scripts` project + multi-line names) |
Test cases, E2E | ~72–75 `test(` in 34 `describe` blocks | static grep; **UNCERTAIN** — `playwright test --list` needs env |
Test cases, integration + external | **UNCERTAIN** | collection needs credentials; static grep over all 687 files gives 5,268 `it(`/`test(` occurrences total |
Test LOC | 118,318 across 687 files (~44% of ts/tsx) | |
**Coverage** | **UNMEASURED** — `pnpm test:coverage` (`@vitest/coverage-v8`) exists but no threshold is configured and no coverage artifact is committed | do not put a coverage number on a resume |
**DB migrations** | **115** (`0000`–`0113` + `rollback-cut-12.sql`) | `git ls-files drizzle \| grep -c '\.sql$'` |
Drizzle schema files | 56 under `src/shared/db/` | |
**Routes** | 25 `page.tsx` (20 product, 5 `/preview` scaffolds), 21 `route.ts`, 4 `layout.tsx` | |
**CI workflows** | **15** | `.github/workflows/` |
**Custom ESLint rules** | **27** registered `playgram/*` (+26 rule-tester test files) | `eslint/rule-groups/playgram.ts` |
Checks in `pnpm vet` | 13, run in parallel | `package.json` |
npm scripts | 59 | |
Production dependencies | 81 | |
Dev dependencies | 52 | |
**Monorepo packages** | **1 — not a monorepo.** `pnpm-workspace.yaml` carries only `ignoredBuiltDependencies` | |
Claude Code skills | 33 (4,741 LOC) | |
Agent instruction surface | 5,658 LOC in `.claude/` + 33,463 bytes `CLAUDE.md` | |
`CLAUDE.md` revisions | 116 commits | `git log --follow --oneline -- CLAUDE.md` |
Architecture decision docs | 28 in `docs/decisions/` | |
Release notes | 67 files in `docs/release-notes/` | |
Runbooks | 7 in `docs/runbook/` | |
**Releases shipped** | **50** `release:` commits, 2026-05-21 → 2026-08-10 (`4.0.0`–`4.4.3`) | |
**Hotfixes shipped** | **15** `hotfix:` commits, 2026-07-16 → 2026-08-06 | |
Git tags | 87 (50 SemVer, 36 `ci/*`, 1 `attested/*`) | |
Remote branches still on `origin` | 1,301 | |
Project duration | 158 days (2026-03-06 → 2026-08-11) | |
Median commits/week | 67 | |
Peak week | W28 (Jul 6–12): 93 commits, +71,307/−25,554 | |
Time from first commit to production | **76 days** (2026-03-06 → 2026-05-21) | |
Time from first commit to full Bubble retirement | **127 days** (2026-03-06 → 2026-07-11) | |
Documented CI cost saving | GitHub Actions spend was ~$190/mo; the retired per-PR lane was **69%** of it | `6c1adca44` commit body |

---

## SECTION 10 — RISKS: what is NOT safe to publish

**R1 — CRITICAL: customer email addresses are in `main`'s git history.**
`docs/remove-before-merging/logs.1785761954545.json`, **984,924 bytes** of Railway production logs, was added to `main` in `0b46440b9` (`fix: #2221 transcode non-native image attachments so providers accept them (pr #2234)`, 2026-08-03) and removed in `e08b3fc8d` (2026-08-04). It is **not** in the working tree but **is** reachable in history. The repo's own `/finalize` skill describes the contents: *"a 964K Railway log dump with customer email addresses."* I did not open the file (and the sandbox blocked reads of it), so I cannot enumerate what else it holds — assume production log lines: user emails, workspace/chat/member IDs, possibly prompt fragments.
→ The repository **cannot be made public without rewriting history** (BFG / `git filter-repo`) or being re-created from a squashed snapshot.

**R2 — CRITICAL: retired legacy CSV snapshots of real customer data are in history.**
Per `legacy-data/retired.md`, `legacy-data/bubble/**` held *"de-timestamped 'all fields' exports of every Bubble data type (`Chats.csv`, `Users.csv`, `Usage-logs.csv`, …)"* and `legacy-data/analytics/**` held `message_logs.csv` + `session_time_logs.csv`. The tombstone gives the recovery recipe — the tree last existed at commit **`455ed3d`**, restorable with `git checkout 455ed3d -- legacy-data/`. That is a full production user table plus every chat, in git history, by design and with instructions.
(Also in history: `bubble/playgram_split/**`, the Bubble app export. Its secrets were redacted by `split_bubble.py`, but the app definition itself is proprietary.)

**R3 — HIGH: real internal service hostnames are in the tracked `.env.local.example`.**
No secret *values* are committed — every key holds a short placeholder (verified: 3–16 char values; `git log --diff-filter=A` finds no `.env*` file ever committed except the example; the only secret-shaped literals anywhere in source are two obvious fakes in `scripts/backfills/lib/target-db.test.ts`). But several **URLs** appear to be real and full-length: `SUPABASE_URL` (32 chars), `LITELLM_BASE_URL` (48), `WEAVIATE_URL` (35), `OPENCLAW_BASE_URL` (44), `CRM_URL` (50), `DATABASE_URL_TEMPLATE` (90), `POSTHOG_HOST`. Redact these before publishing anything that quotes the example file. Also: the env var *names* alone disclose the full vendor stack (Deepgram, Bunny, Lemlist, OpenClaw, PostHog, LiteLLM, Weaviate, Stripe) and feature flags (`BILLING_ON`, `FREE_PLAN_RESTRICTION_ON`, `HIDE_UPDATE_RELATED_BANNERS`).

**R4 — MEDIUM: a named customer appears in the release history.**
`release: 4.2.0 RapidDev workspace cutover (pr #1763)` (2026-07-03) names a specific customer workspace, as do surrounding release notes and cutover runbooks. Publishing the release list discloses who Playgram's customers were and when they were migrated. Get consent or genericize ("first enterprise workspace cutover").

**R5 — MEDIUM: third-party and contractor identification.**
Three of the four human contributors have **`@zeroqode.com`** email addresses (Zeroqode is a Bubble-ecosystem agency) — publishing shortlog output discloses that the team was agency-staffed, and names the individuals. `JuliaSuhovici`'s identity is a GitHub noreply address (already public), but `mina.rotari@` and `semyon.golovachev@` are direct work emails. Get consent before naming anyone, and consider redacting the email domains.
Vendors named throughout: Bubble.io, Zeroqode, Railway, Supabase, Weaviate, Bunny CDN, LiteLLM, Stripe, Deepgram, PostHog, Microsoft Clarity, Intercom, Lemlist, "OpenClaw", DigitalOcean, GCP. All are ordinary vendor disclosures except the Bubble/Zeroqode relationship and Lemlist (implies outbound cold email).

**R6 — MEDIUM: unflattering / sensitive internal content.**
- **`66bbf9156` (2026-03-21) — "Week 2 employee assessment"**: a synthesized performance review of the author's own work from five model assessments, which **downgrades the level from "Staff engineer" to "Strong Senior"** and flags *"over-engineering… (46% docs commits, 20-page decisions)"* and *"feature velocity… (8.5% feat commits, Stage 2 of 8 after 2 weeks)."* Quotable as candor, damaging out of context. Whoever publishes should decide deliberately; don't let a mining tool surface it by accident.
- **`docs/flow/team/*.md`** (in history): per-agent personas with human first names (`Lev`, `Mira`, `Noa`, `Vera`, `Eli`, `Rio`, `Quinn`), and branch names like `claude/cht-29-noa`. Readable as real employees if unexplained.
- **`docs/journal/20260311-gcp-staging-blocker.md`**: references *"unconfirmed $25k credits"* from GCP — a commercial detail about a vendor negotiation.
- **The `~$190/mo` GitHub Actions figure** and *"the Free tier's 2,000-minute allowance"* disclose that the company was on GitHub Free. Harmless but a business detail.
- Two hotfixes are candid about production defects worth thinking about before quoting: `hotfix: #2239 stop impersonated sessions from consuming the target's tips` (**correction, from Vova: "tips" here are the _onboarding tips_ added in migrations `0090`–`0091`, not anything to do with billing or credits. Impersonating a user burned through the tips they had not seen yet. The original gloss in this dossier called it "a superuser impersonation billing bug", which was wrong — and note § 6 of this same document records `0090`–`0091` correctly, so the evidence to catch it was already here**) and `hotfix: #2165 temporarily disable deep research while its backend is rebuilt` (a shipped feature switched off for ~9 days).

**R7 — LOW: the 7 Bubble-legacy compat endpoints** under `app/api/(bubble-legacy)/1.1/wf/*` are named for server management operations (`update-server-root-password`, `update-server-gw-token`, `save-server`, `delete-server`). Publishing the route list advertises an inbound-token-authenticated API surface on a live production host. Describe it, don't enumerate it.

**R8 — LOW / verify: `.claude/skills/pr/SKILL.md` lines 72 and 94** contain a hardcoded example Claude Code session URL (`https://claude.ai/code/session_01K5BCCuPcNaCJMEiZJgwK94`). It is a template placeholder, but it is a real-looking session identifier. Replace it before publishing that file.

**Cleared as safe:**
- No `.env` file has ever been committed except `.env.local.example` (verified across all refs with `git log --all --diff-filter=A --name-only`).
- No `.pem` / `.key` / `.p12` / service-account file has ever been committed.
- The only secret-shaped literals in source are two deliberate fakes in a test file.
- `.gitignore` correctly ignores `.env*` with a single `!.env.local.example` exception.
- **UNCERTAIN:** I did not run GitHub's secret-scanning API, and I did not grep every historical blob for secret patterns (the naive scan across all tracked content produced 13 MB of binary false positives). Before publishing, run `git filter-repo --analyze` plus a proper history secret scan (`gitleaks detect --log-opts="--all"` or `trufflehog git`). **Treat R1 and R2 as proof that history contains data the working tree does not.**

**Bottom-line publication guidance.** The *case study* — architecture, the agentic infrastructure, the reversals, the numbers, and the snippets in § 8 — is safe to publish as written, with R3/R4/R5 redactions. **The repository itself is not**, and no amount of file deletion at HEAD changes that: R1 and R2 both live in reachable history with documented recovery recipes.

---

## Appendix A — verbatim text of the five skills `/plan` and `/implement` reference

(Reproduced so the two skills can be lifted into another repository without dangling `@`-references. Each is the complete file at HEAD `4cd68a75`. Outer fences are 5 backticks so the files' own 3-backtick blocks survive.)

### `.claude/skills/from-branch/SKILL.md`

`````markdown
---
description: Attach the current session to an existing branch or PR and continue work from there, abandoning the auto-created session branch. Invoke as `/from-branch <branch-name|#PR|PR-url> [<follow-up instruction or /skill ...>]`. The PR target may be a bare PR link or any deep link into it (a review link like `.../pull/NNN#pullrequestreview-<id>`, a review-comment or conversation-comment link, or a `/files` tab URL) — the PR number after `/pull/` is the basis for finding the branch. Also use when a session's launch prompt just names an existing branch to continue (e.g. `implement claude/foo-xxxx`) instead of a literal `/from-branch`. The follow-up can be `implement`/`execute` to run the plan a prior `/plan` session left under `docs/plans/`.
---

When a Claude Code on-the-web session starts, the harness usually creates a fresh branch (e.g. `claude/add-foo-bar-XXXX`) and checks it out. This skill **discards that auto-branch** and re-points the working tree at an existing branch or PR head so the rest of the session continues that work.

## Recognizing the signal (explicit _and_ implicit)

The obvious trigger is an explicit `/from-branch …` invocation. But a session can also **start** with a launch prompt that just names an existing branch to continue — with no literal `/from-branch`. Common shapes:

- `implement claude/some-feature-xxxx` (or `execute …`),
- "continue the work on `<branch>`", "pick up `<branch>`", "keep going on `#123`".

These are the **same signal**: the harness has put you on a fresh auto-branch, but the operator's intent is to attach to the _named_ existing branch and continue its work — not to start new work on the auto-branch. Treat such a launch prompt as an implicit `/from-branch <that-branch> <the rest of the prompt as follow-up>` and run this skill: resolve the named branch as the **Target** (Step 1), and take everything else in the prompt as the **Follow-up** (bare `implement`/`execute` → run the plan under `docs/plans/`; anything richer → free-form follow-up). The tell is a launch prompt whose subject is an _existing_ branch/PR the session is not already on — when in doubt, `git ls-remote --heads origin <name>` confirms the branch exists before attaching.

## Argument shape

The skill argument has two parts:

1. **Target** (required, first token): a branch name, a `#NNN` PR number, or **any URL that carries a PR number** — a bare PR URL (`https://github.com/<owner>/<repo>/pull/NNN`) or a deep link into that PR: a review link (`.../pull/NNN#pullrequestreview-<id>`), a review-comment link (`.../pull/NNN#discussion_r<id>`), a conversation-comment link (`.../pull/NNN#issuecomment-<id>`), or a tab/file URL (`.../pull/NNN/files`, `.../pull/NNN/commits/<sha>`, …). The PR number `NNN` after `/pull/` is the basis; the `#fragment`, trailing path, and any `?query` are stripped when resolving the branch (see Step 1), but a review/comment fragment is worth keeping as a pointer to _which_ feedback the operator wants addressed.
2. **Follow-up** (optional, everything after the target): one of —
   - a free-form instruction ("…fix the failing test, then push"),
   - a slash-command invocation of another skill (e.g. `/finalize`, `/fix-ci`) — if so, load and follow that skill **after** the attach step completes, or
   - the keyword **`implement`** (or its synonym **`execute`**), optionally trailed by "the plan" / "plan" filler, meaning "execute the plan file a prior `/plan` session left under `docs/plans/`". Bare `implement` — with no plan named — still means "implement the plan". Step 6 dispatches it.

Examples:

- `/from-branch #123` — attach and wait for further instructions.
- `/from-branch #123 finish the migration and push` — attach, then do the described work.
- `/from-branch #123 implement` — attach, then execute the plan under `docs/plans/`.
- `/from-branch #123 implement the plan` — same thing (the trailing "the plan" is just filler).
- `/from-branch #123 /finalize` — attach, then invoke `@.claude/skills/finalize/SKILL.md`.
- `/from-branch feat/new-thing /fix-ci` — same idea with a raw branch name.
- `/from-branch https://github.com/<owner>/<repo>/pull/123#pullrequestreview-999` — a review deep link: parse `123` as the PR, attach to its branch, and treat that review's comments as the feedback to address.

## Environment note (read this before running gh)

This remote execution environment has **both** the `gh` CLI **and** a populated `GH_TOKEN` environment variable available. Prefer `gh` for branch/PR operations in this skill — the GitHub MCP tools (`mcp__github__*`) are scoped to a narrow allowlist and will refuse some branch-level actions you need here (e.g. checking out a PR head, fetching arbitrary refs, pushing). If a step seems blocked by MCP restrictions, fall back to `gh` / plain `git` over HTTPS using `GH_TOKEN`. Do **not** assume the MCP restriction means the action is impossible — `gh` will work.

## Step 1 — Resolve the target to a branch + remote ref

Parse the first token of the argument:

- **`#NNN`, a PR URL, or any deep link into a PR** → the branch is keyed off the **PR number**, so first extract it. Don't hand a fragment-bearing URL straight to `gh` — a trailing `#pullrequestreview-…` / `#discussion_r…` / `#issuecomment-…`, a `/files`|`/commits/<sha>` path, or a `?query` can confuse it. Pull `NNN` out of the URL with a `pull/(\d+)` match and resolve the bare number: `gh pr view <NNN> --json number,headRefName,headRepository,headRepositoryOwner,isCrossRepository,state,url` (a bare `#NNN` needs no extraction). The branch you want is `headRefName`. If `isCrossRepository` is true, the PR is from a fork — note this; the remote will be the fork, not `origin`.
  - **If the link carried a review/comment fragment**, it's telling you _which_ feedback to act on — resolve it so the follow-up is grounded in it. `#pullrequestreview-<id>` is a review (its inline comments carry the substance even when the review body is just "see below" — read them with `gh api repos/<owner>/<repo>/pulls/<NNN>/reviews/<id>/comments`, or the equivalent MCP `get_review_comments`); `#discussion_r<id>` is one review comment; `#issuecomment-<id>` is a conversation comment. Treat addressing that feedback as the implicit follow-up when the operator didn't spell one out.
- **Plain branch name** → use it as-is. Confirm it exists on `origin` with `git ls-remote --heads origin <branch>` (or on the fork remote if the user gave `owner:branch`).

If resolution fails (PR not found, branch doesn't exist on the remote), **stop and report** — do not silently fall back to the auto-branch.

**Always look for any PRs on the target branch — open _or_ closed — and skim them before doing anything else.** Even when the target is a plain branch name (not a `#NNN`/URL), the branch usually has PR history that tells you what the work is, what's already been reviewed, and whether an earlier PR was closed/merged/superseded. Run `gh pr list -R <owner>/<repo> --head <branch> --state all --json number,title,state,url,isDraft,baseRefName`, then for each hit skim its body, commits, and reviews (`gh pr view <NNN> -R <owner>/<repo> --json body,commits,reviews,comments,mergeable,mergeStateStatus,isDraft,state`). This grounds the rest of the session in the branch's actual history — reviewer feedback still to address, a merged PR meaning follow-up must restart from `main` (see the system prompt's merged-PR rule), or a draft that `/finalize` will later land.

**Detect an epic slice from the PR base ref.** You already fetched `baseRefName` above. If the open PR's base matches `^epic/` (e.g. `epic/durable-generation-jobs`), this branch is a **slice of that epic**, not ordinary work off `main`. The base ref _is_ the epic — GitHub acts on it, so it's the source of truth (no dedicated marker needed; a `Part of epic …` prose line in the body, if present, is human context only). When it's an epic slice:

- **Report it in your turn output** — name the epic (`this is a slice of \`epic/<slug>\``) so the operator and any later handoff see the context.
- **Carry it into the follow-up.** The slice lands by merging/squash-merging onto the epic, not `main`; its review diff and CI target the epic. Any follow-up you dispatch (`/finalize`, `/check-merge`, `/sync-branch`, free-form work) inherits base-awareness from resolving the PR's own base — but state the epic explicitly when you hand off so nothing silently reverts to a `main` assumption.

This only recognizes epic slices that already carry a `base=epic/*` PR; the no-PR case isn't covered, but a later `/from-branch` never attaches to that.

## Step 2 — Record the auto-branch and sanity-check it

`/from-branch` is meant to be the **first** message of a session, so the branch you're currently on is essentially always the harness-created auto-branch — empty, unpushed work, exists only because the harness needed something to check out. Capture its name so Step 4 can clean it up:

```bash
AUTO_BRANCH="$(git branch --show-current)"
```

**Sanity check** (don't trust the assumption blindly — verify there's no work to lose):

```bash
git fetch origin main
git rev-list --count origin/main..HEAD     # expected: 0
```

If the count is `0` and the working tree is clean, proceed — the auto-branch is empty and will be discarded in Step 4.

If the count is non-zero, or there are uncommitted changes, **stop and ask the user**. This shouldn't happen in normal `/from-branch` usage (the skill is meant for fresh sessions), so it's a signal that something is off — maybe the user invoked the skill mid-session after doing work, maybe the harness behavior changed. Don't auto-cherry-pick or auto-discard; surface the situation and let the user direct.

## Step 3 — Fetch and check out the target

```bash
git fetch origin <branch>                 # same-repo PR or plain branch
# For a cross-repo PR, add the fork as a remote first:
#   gh pr checkout <NNN>                  # easiest path — gh sets up the remote
git checkout <branch>
git pull --ff-only origin <branch>        # ensure tip matches remote
```

`gh pr checkout <NNN>` is the most robust path when the input was a PR — it handles fork remotes, sets upstream, and leaves you on the PR head. Prefer it for PR inputs.

Verify the result with `git branch --show-current` and `git log --oneline -3` — the head should match the PR/branch you intended, not the auto-branch.

## Step 4 — Clean up the auto-branch

Delete the auto-branch both locally and on `origin` — a local-only delete leaves the empty branch lingering remotely, which is exactly the clutter this step exists to prevent.

```bash
git branch -D "$AUTO_BRANCH"
git push origin --delete "$AUTO_BRANCH"     # ok if the remote ref doesn't exist; the command will just fail harmlessly
```

If the remote delete fails because the branch was never pushed, that's fine — ignore the error and move on. If it fails for any other reason (protected branch, permission issue), report it but don't block; the local cleanup is the important half.

## Step 5 — Update the development-branch contract

The session was launched with instructions to develop on the auto-branch (see the system prompt's "Git Development Branch Requirements"). That instruction is now stale. From this point on:

- Treat the **target branch** as the working branch for commits and pushes.
- Push with `git push -u origin <target-branch>` (not the auto-branch).
- Do **not** push to the auto-branch even if it still exists on `origin`.

State this explicitly in your turn output so the user can see the redirect took effect.

## Step 6 — Dispatch the follow-up

- **No follow-up provided** → report the attach (current branch, last commit, PR link if applicable) in 1–2 sentences and stop. Wait for the user's next instruction.
- **`implement` / `execute` follow-up** (the keyword optionally trailed by "the plan" / "plan" — nothing richer) → load `@.claude/skills/implement/SKILL.md` and follow it from its Step 1; it owns locating the plan under `docs/plans/`, the plan-file lifecycle flip, and the closing draft PR. Do **not** inline-copy those steps. A `/from-branch` launch is already continued work, so there is no plan cycle to open — this follow-up **is** the go-ahead the lifecycle flip quotes. If the follow-up carries a real instruction beyond `implement`/`execute` + that filler, it's a free-form follow-up — handle it as the bullet below instead.
- **Free-form follow-up** → load `@.claude/skills/implement/SKILL.md` and follow it via its § "Planless entry", treating the follow-up text as the task. Two points are `/from-branch`-specific:
  - **A concrete request is not a plan cycle.** `/from-branch` is continued work (CLAUDE.md § "Plan mode & questions in web sessions"), so routing through `/implement` is not an invitation to write a plan file first.
  - **The quality passes are diff-scoped, so they self-limit.** A follow-up that produced no code ("explain why X fails", "rerun CI") leaves them nothing to act on, and each says so in its own "When to use". That is a property of the passes — "the change was small" is not grounds to skip them.
- **Slash-command follow-up** (e.g. `/finalize`, `/fix-ci`, `/test-on-gh`) → load `@.claude/skills/<name>/SKILL.md` and follow it. Do **not** inline-copy its steps; read and execute the actual file so updates to that skill flow through.

## Failure modes to call out

- **Auto-branch is unexpectedly non-empty** (commits ahead of `origin/main`, uncommitted changes, detached HEAD) — Step 2 already stops on this. Don't try to recover automatically; ask the user.
- **Target branch already checked out** — skip Steps 2–4 and proceed to Step 6.
- **MCP says "not allowed"** for a branch/PR action — switch to `gh` (the token is in `GH_TOKEN`). Don't report the action as impossible.
- **Branch was force-pushed since the PR was opened** — `git pull --ff-only` will refuse; do a `git reset --hard origin/<branch>` only after confirming with the user that there's no local work to lose.
- **`implement`/`execute` given but `docs/plans/` has zero or multiple files** — don't guess; `@.claude/skills/implement/SKILL.md` Step 1 owns the resolution, and Step 6 dispatches there.
`````

### `.claude/skills/dry/SKILL.md`

`````markdown
---
description: >-
  Review code from the current (or clearly-restored) session for DRY
  opportunities. Apply the obvious wins immediately; surface only the
  ambiguous calls for the user to decide. Invoke as: /dry [optional focus guidance]
---

You are reviewing code written in this session (or in a prior session whose work this session is clearly continuing) for DRY violations. The scope is _just the work that was done_ — not the whole codebase.

The output of this skill is **edits, not a report**. Apply the obvious wins yourself and only ask the user about the genuinely ambiguous calls.

## When to use

- After implementing a feature in the current session and before / during housekeeping.
- When resuming a summarized session that has a clear concrete deliverable in flight (e.g. a flow task), the scope is the deliverable's diff.
- Skip if the session has no concrete recent code work (research-only, planning-only, conversation-only).

## Step 1: Determine the diff scope

Pick the right scope, in this order:

1. **Uncommitted changes**: `git diff HEAD` and untracked files via `git status --short`. If non-empty, that's the scope.
2. **Commits made in this session**: `git log --oneline @{u}..HEAD` (commits ahead of upstream on the current branch). If non-empty, that's the scope.
3. **Restored session with concrete prior work**: if the session summary references specific files modified in named commits on the current branch, use the SHA range from the summary (`git diff <start-sha>..HEAD`). Confirm with the user before assuming.
4. **Nothing matches**: tell the user there's nothing to review and stop.

Run `git diff <range> --stat` first to confirm the scope and surface the file count.

## Step 2: Read the changed files

Read every file in scope fully. For test files, read them too — duplicated assertion patterns or fixture builders are fair game.

If the user provided focus guidance ("focus on the streaming changes"), narrow accordingly but still glance at the rest.

## Step 3: Triage each candidate into one of three buckets

For every duplication you spot, check whether it's **real** (the code already says the same thing twice) vs **speculative** (the code _might_ need to be the same later). Only real duplication counts.

Triage dimensions:

- **Callsite count**: 2 callsites is the threshold for considering an extraction; 3+ makes it a clear win. 2 is borderline — extract only if the rule itself is non-trivial or coupled (e.g. provider-namespacing, a magic string with semantic meaning).
- **Coupling**: do the duplicates need to change together? If yes, dedupe protects against drift. If no (they happen to look alike now), don't dedupe — premature abstraction.
- **Abstraction cost**: a 1-line predicate or a Sass `%placeholder` is cheap; a new component with props is expensive. Match the cost to the win.
- **Distance**: same file = local extraction. Cross-file in the same slice = small helper. Cross-slice = check if it belongs in `shared/`.

Sort each candidate into one of:

### OBVIOUS — apply silently in Step 4

A clear win on every dimension: real coupled rule, ≥2 callsites, cheap extraction, no naming or placement ambiguity. Examples:

- A magic string with semantic meaning duplicated in 2+ places in the same file → extract a 1-line predicate or constant.
- A 4+ line CSS rule block repeated in 2+ classes in the same module → extract a Sass `%placeholder`.
- A literal expression repeated 3+ times → extract a const.

### AMBIGUOUS — surface to the user in Step 5

The duplication is real, but at least one dimension is genuinely unclear and a code reviewer might reasonably prefer either choice. Examples:

- Borderline cost/value: 2 callsites with a moderately expensive extraction.
- Naming or placement uncertain: should the helper live in this file, the slice's `lib`, or `shared`?
- Semantic ambiguity: the duplicates _look_ identical but might be expressing different intent that future edits would diverge.
- A new shared component would replace the duplication but with non-trivial prop API design.

### NON-ISSUE — do not mention

Reject these as **non-issues**, even if the code looks repetitive:

- **Belt-and-suspenders patterns** (e.g. `.done()` in both success and `.finally()`): intentional, not duplication.
- **Same shape, different semantics** (e.g. one helper returns last value, another returns all): merging hides intent.
- **Boilerplate the framework requires** (e.g. `'use client'`, `import` lines, mock setup blocks).
- **Test fixtures across files** with different scenarios — duplication there documents intent.
- **Visual similarity without rule similarity** — e.g. two CSS classes with the same color but for unrelated UI concepts.

## Step 4: Apply OBVIOUS fixes immediately

Make the edits surgically — one DRY fix per logical change, minimal surrounding churn. Do not bundle unrelated cleanups. Do not rename things that aren't part of the dedupe.

If there are no OBVIOUS items, skip this step.

## Step 5: Surface AMBIGUOUS items for discussion

For each ambiguous candidate, give the user:

- The exact files and line ranges.
- The shared code (verbatim or near-verbatim).
- The candidate extraction (1–5 lines of code).
- A one-sentence statement of _why it's ambiguous_ — what dimension is unclear and what choices the user has.

Do **not** rank these or recommend one. The point of surfacing them is that you don't know.

If there are no AMBIGUOUS items, skip this step.

## Step 6: Report

Tell the user, briefly:

- What was applied (one bullet per OBVIOUS fix, with file:line references).
- What's pending discussion (the AMBIGUOUS list, if any).

Do not list non-issues — keep the report tight.

Once done, commit the applied fixes.

## Anti-patterns to avoid

- **Don't propose extractions you wouldn't make in a code review.** If a 2-line repetition is genuinely fine, treat it as a non-issue and skip silently.
- **Don't invent abstractions.** New helpers must replace existing duplication, not anticipate future duplication.
- **Don't widen scope.** If a file in the diff calls a duplicate that exists _elsewhere_ in the codebase (outside the diff), mention it once but don't fix it — that's a separate task.
- **Don't reorder, rename, or "while you're at it" cleanups.** DRY only.
- **Don't ask permission for OBVIOUS fixes.** That's the whole point of triaging — if it's obvious, just do it.
`````

### `.claude/skills/tighten-docs/SKILL.md`

`````markdown
---
description: >-
  Review the prose you added in recent work — code comments, docstrings, and
  Markdown — against two equal defects: it narrates the change instead of stating
  the code's lasting contract ("no longer parsed", "now also sets X", "migrated
  from Y"), and it spends more words than it informs — restating what the name,
  signature, and types already say, or stretching a real point over four lines.
  Rewrites and cuts in place. Invoke as: /tighten-docs [optional focus guidance]
---

You are reviewing prose _you_ recently added — code comments, JSDoc/docstrings,
and Markdown (skill bodies, `docs/`, READMEs) — for two defects that carry
**equal weight**:

- **Narration** — text that describes the change relative to the previous
  intra-PR step rather than the code's durable behaviour. CLAUDE.md: "Comments
  describe the code's lasting contract, not the change that produced it."
- **Bloat** — text that spends more words than it informs: it restates what the
  function name, signature, and types already convey, or stretches a real point
  past the length it needs. CLAUDE.md JSDoc rule: document only the non-obvious
  contract (side effects, runtime constraints, cross-boundary coupling,
  don't-change-this traps).

The output is **edits, not a report**. Fix the clear cases in place; only ask
about genuinely ambiguous ones.

## When to use

- After an autonomous run (several commits since the operator last engaged),
  before handing back — both defects accumulate step-to-step.
- Any time you notice a comment reads like a diff note, or a docstring restates
  its own signature.
- Skip if recent work added no prose (pure logic/test edits with no new comments).

## Step 1: Scope to what you added since the operator last engaged

In order:

1. **Uncommitted changes**: `git diff HEAD` + untracked files (`git status --short`).
2. **Commits since upstream / since the operator's last turn**: `git log --oneline @{u}..HEAD`, or the SHA range the session summary names. `git diff <range>` is the scope.
3. **Nothing matches** → tell the user there's nothing to review and stop.

Only the **added/changed** prose lines are in scope — don't rewrite pre-existing
comments you didn't touch.

## Step 2: Read each added prose line and ask both questions

A line can fail either check, or both. Work through the diff **once**, applying
both lenses to each comment — not one traversal per lens.

### Lens A — is it narration?

A line is narration when it only makes sense to a reader who knows the previous
step. Tells:

- Change verbs anchored to the past: **"no longer"**, **"now also"**, **"used to"**,
  **"previously"**, **"migrated from"**, **"this used to…"**, **"as of this change"**, **"renamed from"**.
- **"for now" / "temporarily" / "once X lands"** — situational hedges that go stale.
- References to a prior step, ticket, or version as if the reader is watching the diff.

The test: **would this sentence still be true and useful to someone reading the
final code a year from now, with no memory of the edit?** If it only informs
"what changed", it's narration.

### Lens B — is it bloat?

A line is bloat when it costs a reader more than it tells them — either they
already had the fact from the name, signature, and types, or the fact is real
but buried in twice the prose it needs. Tells:

- **Restates the signature** — names the params or return type, or paraphrases the
  function name (`/** Fetches the user by id. */` over `fetchUserById(id: string)`).
- **Narrates the next lines of code** — "Loop over the items and set the flag",
  "If the list is empty we skip".
- **Restates a type's or enum's members** in prose sitting next to the declaration.
- **Ceremony** — "This function is responsible for…", "Helper that…", "Note that…"
  wrapped around one actual fact.
- **A JSDoc block on something that crosses no boundary** — the contract is already
  obvious from name + types, so the block is decoration.
- **Length**: **> 4 lines** is almost certainly too much; find the one or two facts
  that aren't self-evident and keep only those. Even exactly 4 is too much unless
  it's a proper JSDoc block on a function/class/etc. **A good inline clarification
  fits ~2 lines.** The point is often real and the prose still too long:
  - "We await this before returning, because otherwise the transaction may still be
    open by the time the caller commits, which can deadlock under concurrent writes."
    → "Await before returning — an open transaction here deadlocks concurrent writes."
  - "It's worth noting that this cache can only be used on the server, since the key
    includes the workspace id and the browser bundle has no access to it."
    → "Server-only: the cache key needs the workspace id."
- **Markdown**: an added paragraph that re-explains what the adjacent bullet or code
  block already shows; a "Note:" restating the rule directly above it.

## Step 3: Fix

**Narration:**

- **Rephrase to a present-tense property** when the underlying fact is durable:
  "The emoji is no longer parsed" → "Nothing parses the emoji." "Now also sets
  `x`" → "Sets `x`."
- **Delete** when the note carried no lasting information beyond the change
  itself ("Migrated from the old helper", "Renamed for clarity").
- **Keep** genuine forward-references to still-pending work (e.g. "§F2 is
  deferred") and durable rationale phrased in the present ("kept in sync by
  hand because…"). These are contracts, not changelog.

**Bloat:**

- **Cut to the non-obvious facts** — the side effect, the runtime constraint, the
  coupling, the trap. Drop every clause the name and types already carry.
- **Downgrade a JSDoc block to a one-line inline comment inside the function**
  when its only real purpose is a don't-break-this warning — CLAUDE.md says the
  dev editing the code will see it there, and that's enough.
- **Delete entirely.** This is a normal outcome and often the right one; a comment
  the code already makes true earns nothing by being shortened.
- If you can't say it in ~2 lines, question whether the **code** should be clearer
  rather than the comment longer.

When both lenses fire on one comment, resolve bloat first — deciding it shouldn't
exist saves you from carefully rewording it.

## Step 4: Do NOT touch

- **Commit messages and PR bodies** — narrating the change is their job.
- **`docs/plans/*.md`** — transient by nature, swept at finalize.
- **`docs/remove-before-merging/squash-message.md`** — a commit body, and transient
  by nature.
- **CHANGELOG / release-notes files** — a dated record of changes is the point.
- **Deliberately thorough reference prose** — a decision doc or rules file that
  spends paragraphs on rationale is doing its job. Length carrying rationale the
  reader can't get elsewhere is not bloat; length carrying nothing is.

## Step 5: Report + commit

Report the two classes **separately, each with a count**, one bullet per fix
(`file:line` + before → after in a few words):

```
Durability (2)
- src/foo.ts:14 — "no longer parsed" → "Nothing parses the emoji."
- …

Tightness (3)
- src/bar.ts:8 — 7-line JSDoc → 2 lines (dropped param restatement)
- src/baz.ts:31 — deleted (signature says it)
- …
```

Both groups always appear; **an empty one gets a sentence saying why** rather
than silence ("nothing added was over-documented" is a real outcome).

Then commit the edits (feature branch: just commit; on `main`, the usual
vet gate).
`````

### `.claude/skills/pr/SKILL.md`

`````markdown
---
description: Open a draft PR for the current branch — renames the harness auto-branch first (via the branch-rename skill), pushes, then creates the PR with a title/body derived from the branch's commits. Invoke as `/pr [optional task to implement first]`. Use when the user says "/pr", "open a PR", "draft PR", "open a draft", or similar after committing some work.
---

End state of this skill: a draft PR exists on `Playgramai/playgramapp` against `<base>`, targeting a semantically-named branch (`claude/<task-slug>-<hash>`), with a title and body derived from the commits on the branch, and with the copy-ready squash proposal posted as a comment and tracked on the branch per `@.claude/skills/squash-message/SKILL.md`.

## Caller parameters

An outer skill may pass these; a bare `/pr` takes the defaults, so the ordinary path reads as if they weren't there.

- **`<base>`** — the branch the PR merges into, and the left side of every diff range below (`origin/<base>..HEAD`). Defaults to `main`. When a PR already exists, its `baseRefName` wins over what the caller said.
- **A pre-created PR** — when the caller already opened the PR, Step 1b treats it as satisfying the duplicate check rather than tripping it, and Step 5 fills it in instead of creating one.

## Environment note (read this before running gh)

This remote execution environment has **both** the `gh` CLI **and** a populated `GH_TOKEN` environment variable available, even though the default system prompt says you only have GitHub MCP tools. Use `gh` for PR creation in this skill. If `gh pr create` complains that "none of the git remotes … point to a known GitHub host" (the proxy quirk in remote sessions), pass `--repo Playgramai/playgramapp` explicitly.

## Step 1 — Pre-checks

### Step 1a — Plan gate (do this FIRST, before any git command)

**Any arguments after `/pr` are a task to implement** — work to plan, code, and commit before drafting the PR. So if the invocation has args, **STOP: do not run the PR steps yet.** Plan the task first — in a web/remote session invoke the `plan` skill (per CLAUDE.md "Plan mode & questions in web sessions"); in a local CLI session use native plan mode — get it reviewed, implement it, commit, and only then run `/pr` from the top over the finished work.

The **only** waiver is the args themselves explicitly saying no plan is needed (e.g. "no plan"). Nothing else exempts the task: not `/pr` (it is not a plan-skill exemption), not the branch already carrying commits (that does not make new args "continued work"), and not the task looking small, well-specified, or like a tweak to existing work — plan it anyway.

When the waiver applies, skipping the plan does **not** mean skipping the quality rounds. Rather than implementing inline and jumping to the PR steps, hand off to `@.claude/skills/implement/SKILL.md` via its § "Planless entry" (load and follow it) — the explicit "no plan" is what makes the args the task. Its Step 4 then re-invokes this skill with no args (the bare mid-session path below → Step 1b), which opens the draft over the finished work.

`/pr` with **no arguments** → skip to Step 1b and draft the PR from the commits already on the branch. Bare `/pr` only ever happens **mid-session**, wrapping up work this session already did and discussed but never opened a PR for (e.g. a session that started as brainstorming or testing). A fresh session never opens with a bare `/pr` — there'd be nothing to PR — so no-args always means continued in-session work, never a task that needs a plan.

### Step 1b — Mechanical pre-checks

- `git status --porcelain` must be empty. If there are unstaged or staged-but-uncommitted changes, **stop and ask the user** — this skill creates a PR from what's already committed, it does not auto-commit. (If Step 1a sent you through the plan+implement path, your changes should already be committed before you reach here.)
- `git rev-list --count origin/<base>..HEAD` must be ≥ 1. If 0, the branch has no commits to PR — stop and report.
- `gh pr view --json number,url,baseRefName 2>/dev/null` — if a PR already exists for this branch, **stop and report its URL**. Don't open a duplicate. (User may want `/finalize` instead.) The exception is the caller-bootstrapped PR above: that one is the PR this run fills in, so read `baseRefName` off it as `<base>` and continue.

## Step 2 — Rename the auto-branch (by reference)

If the current branch name matches the harness auto-branch pattern (`claude/<adjective>-<noun>-<5-char-hash>`, e.g. `claude/upbeat-shannon-whWSn`), invoke `@.claude/skills/branch-rename/SKILL.md` — load and follow it; do **not** inline-copy its steps. Updates to that skill should flow through.

If the branch is already semantically named (e.g. `claude/<slug>-<hash>`, `feat/foo`, `fix/bar`), skip this step. (The harness now frequently assigns a semantic name up front — see CLAUDE.md "Rename auto-generated remote/web branches early" — so this skip is increasingly the common path, not the exception.)

**Do NOT skip the rename because your system prompt names a "develop on branch `claude/<...>`" branch or says "never push to a different branch without explicit permission."** That is the _normal_ harness auto-branch assignment — it is the branch you are _supposed_ to rename, not a pin. Renaming swaps only the `<adjective>-<noun>` for a task slug while **keeping the same `-<hash>` suffix**, so it is the same session branch, not a "different branch" in the sense that prohibition means (that rule is about `main`, `production`, or someone else's branch). Treat `/pr` itself as the explicit go-ahead to rename. The **only** thing that suppresses this step is an explicit, literal instruction not to rename the branch (e.g. "do not rename this branch" / "this branch name is fixed") — and absent that, you rename. If you ever feel torn between this step and a system-prompt line, this clarification wins; do not invent a pin that was not stated.

The rename should land before the PR is created so the PR points at the final branch name from the start — saves a follow-up rename + force-push later. (If you skipped it and a PR already exists, renaming after the fact via GitHub's branch-rename API **closes** the open PR rather than retargeting it, forcing a recreate — another reason to do it here, in order.)

## Step 3 — Push the branch

```bash
git push -u origin "$(git branch --show-current)"
```

Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network errors. Don't push to `main` or `production`.

## Step 4 — Draft the title and body

Read the commits and diff:

```bash
git log --format='%s%n%n%b' origin/<base>..HEAD
git diff --stat origin/<base>..HEAD
```

**Title**: conventional-commit format (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`, `test:`, `ci:`, `perf:`). Reuse the subject of the lead commit when there's only one; for multi-commit branches, synthesize a subject that covers the whole branch. Keep under 70 chars.

**Body**: two sections.

- **Summary** — 2-4 bullets explaining _what_ changed and _why_. Pull from commit bodies, not just subjects.
- **QA Checklist** — a `## QA Checklist` markdown checklist of how to verify the change end-to-end, derived over `origin/<base>..HEAD`. For how to derive it, follow the "Derive the checklist" guidance in `@.claude/skills/qa-checklist/SKILL.md`.

If the PR or any commit references a GitHub issue, end the body with `Closes #N` (for `feat`/`refactor`/etc.) or `Fixes #N` (for `fix`).

Append the session attribution line: `https://claude.ai/code/session_<REDACTED>` (replace with the actual session id from the system prompt).

If `/pr` was invoked with args, those describe the task you just planned and implemented (Step 1a) — let them inform the Summary and QA Checklist alongside the commits, not just the commit messages.

## Step 5 — Create the draft PR (or fill in the pre-created one)

```bash
gh pr create --draft --base <base> \
  --title "<title>" \
  --body "$(cat <<'EOF'
## Summary

- …

## QA Checklist

- [ ] `slug` — …

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `slug` | …         | …        | … |

https://claude.ai/code/session_<REDACTED>
EOF
)"
```

If `gh` fails with "none of the git remotes … point to a known GitHub host" (the remote-execution proxy quirk), re-run with `--repo Playgramai/playgramapp` prepended.

**When the caller pre-created the PR**, swap the `create` for `gh pr edit <PR> --title … --body …`. Pass no `--base` — re-asserting it would silently undo a retarget the caller made on purpose.

## Step 6 — Post the squash proposal

Invoke `@.claude/skills/squash-message/SKILL.md` in default mode, passing the PR's base — load and follow it; do **not** inline-copy its steps, exactly as Step 4 delegates the QA checklist to `/qa-checklist`. That skill owns the format, the draft-then-tighten pass, where the draft is tracked, and when it must be re-synced.

It sits **after** creation because the title carries a `(pr #N)` suffix, so it cannot run before the PR number exists. It earns its place because the condensed title/body is the best quick lede for anyone opening the PR page — it answers "what is this?" in a few lines, complementary to the body's detail and QA checklist rather than a duplicate of them.

## Step 7 — Report

Print the PR URL on its own line so it's easy to copy. One sentence summary of what was opened (title + base + draft state), and note that the squash proposal is posted as a comment on it. Stop.

Do **not**:

- Mark the PR ready for review (that's `/finalize`'s job).
- Run vet (also `/finalize`).
- Dispatch the integration bucket (also `/finalize`, via `/test-on-gh`).
- Push further commits unless asked.
`````

> **Redaction applied:** the real file hardcodes a Claude Code session URL at lines 72 and 94 (`https://claude.ai/code/session_01K5…`). Replaced above with `session_<REDACTED>` — see § 10 risk R8. Everything else is verbatim.

### `.claude/skills/finalize/SKILL.md`

`````markdown
---
description: Finalize (a.k.a. "prep merge") — land prep: verify there's a draft PR, run the vet suite, merge main, dispatch the integration bucket if the diff warrants, mark ready for review, propose a squash title/body, and post the attestation comment. Pass an optional branch/PR target first (`/finalize <branch|#PR|PR-url>`) to attach to that existing branch before finalizing. `/finalize no vet` is the docs-only mode.
---

**Optional branch/PR target**: if the first token of the argument is a branch name, `#NNN` PR number, or PR URL, then `/finalize <target>` is shorthand for attaching to that branch first and then finalizing — equivalent to `/from-branch <target> /finalize`. Load `@.claude/skills/from-branch/SKILL.md` and follow it to attach to `<target>`, then run the finalize steps below. If the argument has no target token, skip this and finalize the current branch as usual.

**`no vet` is the docs-only mode.** Pass it when the diff has nothing to verify — markdown, top-level docs, read-only reference data. It swaps `pnpm vet` for `pnpm format:fix` and skips any bucket dispatch. It does **not** skip step 7: the attestation still goes up, stating that verification was a deliberate no-op and why. Everything else below still applies. (`no ci` and `no attest` are accepted spellings of this flag.)

**Pre-check**:

- If `HEAD` is detached, create a branch with a meaningful name derived from the work (e.g., task id or topic) and check it out.
- Run `gh pr view --json isDraft,number,url,baseRefName` on the current branch.
  - No PR → push the branch and create a **draft** PR (`gh pr create --draft`).
  - PR exists but is non-draft → convert it back to draft (`gh pr ready --undo`).
  - Draft PR exists → continue.
- **Resolve the PR's base branch** from `baseRefName` — this is the branch the work merges into and is gated against, `<base>` in every step below. It's usually `main`, but a release PR bases on `staging`, a hotfix on `production`, and an **epic slice** on `epic/<slug>`. Everywhere a step compares against or merges from the merge target, use `origin/<base>`, not a hardcoded `origin/main`. (If there's no PR yet — the no-PR case above — treat `<base>` as the repo default branch, i.e. `main`.) For an epic slice (`base=epic/<slug>`), the squash-merge lands the slice onto the epic, so every diff/merge here targets the epic; keeping the epic current with `main` (`@.claude/skills/sync-branch/SKILL.md`) and the eventual epic→`main` PR are separate, operator-driven steps, not part of this finalize.

**Two-shot rule**: on any failure, try up to two rounds of fixing, then stop and ask the user. Commit after each round of fixes.

Doc-only changes: swap `pnpm vet` → `pnpm format:fix` everywhere below (that is what `no vet` does).

**What actually gates this PR: you.** A PR triggers no workflow at all (`docs/decisions/deployment.md` § "Test bucket split & CI lanes"), so nothing downstream will report on this branch before someone merges it.

- **Step 1's `pnpm vet` runs the default test suite and the lockfile-advisory diff** (no env needed). It is the only thing that runs them before the merge, which is why vetting is not optional on this path even though ordinary development skips it.
- **The `*.integration.test.*` bucket needs an explicit dispatch** (step 6) when the diff reaches it. `pnpm test` says nothing about that bucket, and only the nightly will otherwise touch it — after the merge.
- **Step 7's attestation comment is the record.** A reviewer cannot see from the diff what was run; if it isn't written down it did not happen as far as anyone else is concerned.

Steps (stop on first unresolved failure):

1. **Vet**: `pnpm vet`. Fix and rerun until green.
2. **Merge the base branch**: `git fetch origin && git merge origin/<base>` (`<base>` from the Pre-check — `main` for an ordinary PR, `staging`/`production`/`epic/<slug>` otherwise). Resolve conflicts; if you can't, ask. A clean merge (no conflicts) is not the end of the thought: review what the base brought in and consider whether it **overlaps** with this branch's change or opens an **optimization**. Git only flags textual conflicts — it won't tell you the base added a helper/util/component that now duplicates something you wrote, introduced a shared abstraction you should route through instead of your local one, renamed or moved a symbol you still reference the old way, or changed a pattern this branch should now follow for consistency. Skim the merged-in diff (`git log --oneline ORIG_HEAD..origin/<base>`, `git diff ORIG_HEAD origin/<base> -- <areas you touched>`) for these. If you spot a clear, low-risk dedup/simplification, apply it and commit; if it's ambiguous or large, surface it to the user rather than silently shipping the redundancy.
3. **Working-artifact cleanup**: some directories ride the branch for in-flight review but must never land on `main`. Sweep the two below **now**, deleting each **entire** tree (not just the current session's subfolder) and including the deletions in the **last** pushed commit before step 4. (`docs/remove-before-merging/` is the exception — it is swept at the **end** of step 6, after the merge check; see there for why.)
   - **`docs/issue/`** and **`docs/pr/`** — issue/PR exports from `pnpm gh:export`. If **any** `docs/issue/<n>/` or `docs/pr/<n>/` tree exists, `git rm -r` it. The export was committed earlier by `@.claude/skills/issue/SKILL.md` on purpose — while the branch is in flight, any agent that resumes it (post-compaction handoff, parallel session) reads the full thread from there instead of re-exporting. Paired with the earlier add, the deletion cancels out in the squash to `main`.
   - **`docs/plans/`** — file-based plans from `@.claude/skills/plan/SKILL.md` (the web-session stand-in for plan mode). If **any** `docs/plans/*.md` exists — in any lifecycle state (`.draft.do-not-implement.md`, `.in-progress.md`, `.completed.md`) — `git rm -r docs/plans/`. Same rationale: the plan was committed so the operator could pull and review it, but it's a working artifact — the add-then-delete pair cancels out in the squash so the plan never reaches `main`.
     **Don't limit any sweep to the current session** — clean up any other `docs/issue/<m>/`, `docs/pr/<m>/`, or `docs/plans/*.md` leftovers earlier agents/operators forgot too; there's no reason for these to ever live on `main`. Do **not** skip this step — leaving any folder in means it ships to `main`.

4. **Ready for review**: `gh pr ready`. Nothing to chase afterwards — a PR triggers no workflow, so an empty Checks tab is the expected end state. Do **not** push an empty commit to "relaunch CI"; there is nothing to relaunch.
5. **Reconcile the squash message**: invoke `@.claude/skills/squash-message/SKILL.md` — load and follow it, passing `<base>` as the diff base. A proposal normally already exists, posted when the PR opened and still tracked on the branch, so this is an **edit** to a live doc in light of the merge, any review comments and the final committed state — not a fresh composition. It owns the title/body format, the draft-then-tighten pass, and both outputs (the PR comment beside the merge button and the two fenced blocks in the transcript). Do not draft the message inline here: printing an untightened first draft is the failure mode that skill exists to prevent.
6. **Dispatch the integration bucket if the diff reaches it** — then check the base. Judgement call from the diff, not a reflex:
   - **Touches the integration surface** (server actions/API under `src/**/api/**`, `src/shared/db`, Stripe/subscription, members/tenancy/access-control, streaming, migrations under `drizzle/`) → dispatch it: `scripts/test-on-gh.sh --integration` (or `/test-on-gh`), which blocks for the result. On a migration branch this is also what exercises the Supabase branch DB (`docs/decisions/database-branching.md`).
   - **Doesn't** (pure logic, UI, docs, config inert to it) → skip the dispatch and say why in your report. Don't dispatch reflexively; don't skip it because the diff "looks fine".

   The dispatch is scoped to the branch diff, so it costs minutes proportional to the change rather than the bucket's full run. That lowers the price of dispatching but not the bar: the question is still whether the diff reaches that surface, and a scoped run of a bucket the diff never touches selects nothing and proves nothing. Re-dispatching after merging the base is the case where the answer is usually no — what the base brought in is the base's to verify.

   **E2E is deliberately not dispatched here.** It is a `next build` plus four shards — the expensive one — and the nightly covers it before anything ships. Dispatch it (`/test-on-gh --auto-e2e`, or `--e2e "<specs>"`) only when you have a specific reason on this branch, such as a change to the E2E harness itself or a route whose failure the default suite provably cannot see.

   A red dispatch is a real failure — fix it under the two-shot rule (if the analysis suggests a flake rather than a defect, `gh run rerun <run-id> --failed` and re-watch instead of patching). Then, before ending the turn, run `/check-merge` (`.claude/skills/check-merge/SKILL.md`) **once**: verification takes a while, so `origin/<base>` has often advanced while it ran and the target you just validated against may already be stale. Whatever the outcome, the final report **must state the `origin/<base>` SHA this check verified against** (short SHA + subject, e.g. `main @ 8903396 "style: #1223 …" as of this check`) — the operator compares it against current `origin/<base>` at a glance without re-running `/check-merge`.
   - **contained** (no movement) → go to step 7, then **end the turn** so the session reads as idle; the operator can run `/check-merge` again when they return.
   - **`origin/<base>` advanced** → run the **base-advanced deliberation** below, then step 7.
   - **PR merged/closed** → the work landed — nothing more to do.
     This is **one** automatic check, not a loop: after acting on it once, end the turn rather than re-checking — further movement is the operator's `/check-merge` to catch on return.
   - **Base-advanced deliberation** — when `origin/<base>` moves out from under the branch, your local green no longer necessarily reflects what would land. Nothing re-checks the merge afterwards except the nightly, so this deliberation is the last chance to catch it. A clean merge (no conflicts) does **not** mean the code is compatible: semantic incompatibilities (renamed exports used elsewhere, changed function signatures, altered runtime invariants) merge cleanly and still break. Whether to re-verify is your call, but make it deliberately — don't reflexively skip it:
     - You **MUST** read the incoming diff before deciding — `git log --oneline <merge-base>..origin/<base>` and `git diff <merge-base>..origin/<base> -- <areas this branch touched>`, where `<merge-base>` is the base commit the branch already contains (`/check-merge` prints it as `base=…`, or compute `git merge-base HEAD origin/<base>`). Deciding without reading the diff is not allowed.
     - Weigh the same interactions step 2 warns about (a helper/util/component that now duplicates something you wrote, a shared abstraction you should route through instead of your local one, a renamed/moved symbol you still reference the old way, a pattern this branch should now follow) **plus** the semantic incompatibilities above.
     - **Default to re-verify when unsure.** The test is _interaction_, not _whether the base touched code_ — most advances touch some code, and that alone doesn't warrant it. Skip re-verification when, having read the diff, you can say why the incoming commits and this branch's changes don't overlap: they're in different areas/modules, nothing this branch imports or depends on was touched, and no symbol/signature/pattern this branch uses was changed. If you can see a plausible interaction, or you genuinely can't tell, re-verify.
       - **Interacting or ambiguous** → re-run step 2 (`git merge origin/<base>`, applying any dedup/simplification it opens), then step 1 (`pnpm vet`, or `format:fix` for doc-only), push, and re-run any step-6 dispatch the diff still warrants. The two-shot rule does **not** apply to these base-advanced re-runs; they're keeping the target current, not fixing failures.
       - **Demonstrably independent** → `git merge origin/<base>`, push, and run `/check-merge` again when you return to confirm `origin/<base>` hasn't moved since. Unrelated code changes qualify: e.g. the base reworks a chat-deletion modal on the frontend while this branch changes how the system prompt is composed — both touch code, but they don't interact.
   - Do NOT merge the PR — the user controls the final title/body and merge.

   **Then, once the merge check is done, sweep `docs/remove-before-merging/`** — `git rm -r` the **entire** tree, not just the `squash-message.md` that `@.claude/skills/squash-message/SKILL.md` tracks there: the directory's name is a standing declaration that nothing inside it may land, so a `/preview` screenshot or anything else an agent parked there goes with it. Paired with the earlier add, the deletion cancels out in the squash. Push it before step 7 so the SHA the attestation names is the branch's final head.

   **Why this tree goes last, after everything else.** The squash proposal is a live doc for the whole time the PR is in flight: every edit to it — a review comment, what the base merge brought in, a fix pushed after a red dispatch, work `/check-merge` just pulled in from an advanced base — is a deliberation over the text that's already there. Sweeping it at step 3 would leave the single most important edit, the one that becomes the permanent `git log` record, as the only one made with the doc gone; sweeping it before `/check-merge` would do the same to whatever that check drags in.

   A directory name is not self-enforcing: this tree has reached `main` anyway, carrying a 964K Railway log dump with customer email addresses (pr #2234). So verify the sweep actually ran — and **never end the turn with the tree still on the branch**, since from here the operator is free to merge.

7. **Attest** — the last act, and the only durable record that this branch was verified. Nothing GitHub-side ran, so a reviewer looking at the PR has no way to tell a fully-verified branch from an unverified one except this comment. Post it on the PR — or, on a re-run, edit it in place; it is sticky, keyed on the `<!-- finalize-attestation -->` marker, and the marker is how you find it (mechanic below the templates):

   ```md
   <!-- finalize-attestation -->

   ### Attestation

   Verified `<short-sha>` (`<branch>`) against `<base>` @ `<base-short-sha>` "<base subject>".

   - `pnpm vet` — **green** (includes the default Vitest suite and the lockfile-advisory diff)
   - Integration bucket — **<passed (run link) | not dispatched: the diff doesn't reach it>**
   - E2E — **not dispatched** (nightly covers it)

   No workflow runs on a PR; this comment is the verification record.
   ```

   In `no vet` mode the comment still goes up — same marker, same place — saying that there was nothing to verify:

   ```md
   <!-- finalize-attestation -->

   ### Attestation — none required

   `<short-sha>` (`<branch>`) against `<base>` @ `<base-short-sha>` "<base subject>".

   Finalized in `no vet` mode: <why the diff has nothing to verify — e.g. "markdown only, no code path touched">. `pnpm format:fix` ran in place of `pnpm vet`; no bucket was dispatched.

   No workflow runs on a PR; this comment is the verification record.
   ```

   **Finding the comment: match the marker, never `--edit-last`.** Same mechanic `@.claude/skills/squash-message/SKILL.md` § "Emit" uses for its own sticky comment — list the PR's comments (`gh api repos/<owner>/<repo>/issues/<n>/comments --paginate`), pick the one whose body contains `<!-- finalize-attestation -->`, and `gh api repos/<owner>/<repo>/issues/comments/<id> -X PATCH -F body=@<file>` that id; post a new comment only when no match exists. `gh pr comment --edit-last` looks like the tool for this and is not: it targets your most recent comment on the PR whatever that happens to be, so on the ordinary finalize ordering — squash proposal posted at step 5, attestation at step 7 — it overwrites the squash proposal with the attestation. Both comments are then one comment, and the loss is silent.

   Rules that make it worth trusting:
   - **Attest what you vetted, not what you meant to vet.** If the vet run was not green, or a dispatch was skipped for a reason other than "the diff doesn't reach it", or you stopped under the two-shot rule — say exactly that, in the comment. An honest partial attestation is useful; a tidy one that overstates is worse than none.
   - **One comment, edited in place.** Re-running `/finalize` after a base-advanced re-verify updates it; it must always describe the branch's current head, not the first pass. A branch finalized once in `no vet` mode and later re-finalized for real replaces the no-op body with the full one.
   - **A no-op is a result, and it gets posted.** Never resolve `no vet` by staying silent. An operator coming back to the PR — days later, or from another machine — cannot distinguish "verification was skipped on purpose" from "nobody ever finalized this" unless one of them is written down, and the missing comment looks identical to the forgotten one. Say which it was.
   - End the body with the attribution footer the repo requires of every GitHub comment.
`````

---

*End of dossier. Written to `DOSSIER.md`, uncommitted and unpushed, as instructed. No tracked file was modified.*
