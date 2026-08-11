---
name: plan
description: File-based stand-in for plan mode and AskUserQuestion. Write the plan to a reviewable file under docs/plans/ instead of calling ExitPlanMode, and ask clarifying questions as numbered prose. Use whenever you would otherwise enter plan mode or call AskUserQuestion in a web/remote session. Do NOT use to make the change itself — that is /implement.
---

## Why this skill exists

In Claude Code **web/remote** sessions, the plan-mode approval UI and the `AskUserQuestion`
tool are unreliable: after a session sits idle the backend re-wakes it and re-emits the
pending prompt, so the operator returns to the same plan or question stacked several times,
and answers given to superseded prompts are silently lost. Sessions sit idle constantly. This
skill routes around both — a plan becomes a file the operator can pull and review at their
leisure, and questions become prose that survives in the transcript.

Adapted from the `/plan` skill in `Playgramai/playgramapp`. Differences from the original are
noted under "Local deviations" at the end; read those before assuming a rule carries over.

## Part 1 — Plan instead of plan mode

A `/plan` session's deliverable is the **pushed plan file**, not code. The operator reviews it
later, often from another machine, and implements in a **different** session. So a plan turn
ends in a handoff, not a continuation.

Do **exactly what you would do in plan mode** — same research, same rigor, same "don't touch
code until approved" discipline. The only difference is where the plan goes:

- Write it to `docs/plans/<slug>.draft.do-not-implement.md`, named for the task or branch.
  The suffix is load-bearing: it is the on-disk marker that this plan is **not** approved,
  visible in every `ls`, tool path, and `git status`, so you cannot drift past the gate
  without noticing.
- **Make line 1 a banner** restating the gate:
  ```
  > ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md`. On an explicit go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) *before* touching code.
  ```
- **Commit and push it.** `docs/plans/` is not gitignored, on purpose.
- Then **end the turn with the handoff block** and stop.

### Handing off

Get the branch with `git branch --show-current`. Introduce the block with wording that **names
the new session** — `To implement — start a new session with:` — because a bare "To implement:"
reads as an offer to do it here, which is the misreading the block exists to remove. Emit the
command in a fence containing only the command:

```
/implement claude/some-branch-name
```

- Emit it at the end of **every** turn that leaves the plan reviewable and complete.
- **Open questions don't hold the block back when they carry recommendations** (Part 2). An
  answer that differs revises the plan; silence is a valid resolution. Hold the block only for
  a fork with no recommendation, where the plan has nothing executable to say.
- **Never** end a plan turn with "Want me to implement it?" or any equivalent. The plan session
  does not implement, so there is nothing to ask — and a turn ending on that question trains
  you to read the operator's next message as assent, so a correction gets taken as a go-ahead
  and code starts getting written.

### The approval gate

**Only start implementing when the operator's message literally contains a go-ahead token** —
"go ahead", "implement", "ship it", "do it", "proceed", or an unmistakable equivalent.

- **A suggestion to do something differently is a plan revision, not a go-ahead.** "How
  about we…" means update the plan and wait.
- **The exception is a combined message:** "let's do X instead and implement" — apply the
  suggestion and proceed. The token unlocks; the suggestion adjusts what.
- **When unsure, treat it as not-yet-approved**, and resolve by re-emitting the handoff block
  rather than asking for a yes. Reverting speculative code costs more than a round-trip.
- Approval is scoped to the plan as it stood when given. If the plan changed materially since,
  re-confirm.

### Plan file lifecycle

The name carries the state; move it with `git mv` (the base slug never changes):

1. `docs/plans/<slug>.draft.do-not-implement.md` — awaiting go-ahead.
2. `docs/plans/<slug>.in-progress.md` — flipped as the first post-go-ahead action.
3. `docs/plans/<slug>.completed.md` — flipped by `/implement` when the work and its checks
   are done.

## Part 2 — Questions as numbered prose

When you would call `AskUserQuestion`, ask the same questions with the same options — as prose.
**Number each question, letter each option, and mark the recommended one**, so the operator can
reply "1b, 2a, 3-default" without typing prose back.

**A recommendation is a commitment, not a lean.** Write the plan with the recommended option
already in force as its single approach, so an unanswered question degrades into "the
recommendation stands" rather than a blocked fork. A fork you genuinely cannot recommend either
way is the exception, and it does block — say so explicitly in the plan rather than picking
silently.

## Part 3 — When the operator picks an option

When a fork gets resolved — in whatever words — **rewrite the plan so the chosen option _is_
the plan**, in the imperative, as if it had never been one of several. Delete the rejected
options' exposition; the plan is re-read on every resume, so dead alternatives are a standing
tax. Keep at most one paragraph per fork noting what was ruled out and the one-line why,
especially where the why is a hard finding worth not rediscovering.

**Picking an option is not a signal to start implementing.** Collapse the plan, then end the
turn with the handoff block like any other reviewable turn.

## What the plan must contain

- **Context** — what and why, enough that a cold reader understands the goal.
- **Locked decisions** — a table of what is already settled and not to be re-litigated.
- **Files and symbols with line references** — `path/to/file.tsx:120-135`, plus exact
  translation keys, props, or config fields. Vague plans get re-researched from scratch.
- **Constraints** the implementer cannot discover cheaply (below).
- **Verification** — the literal commands, plus a checklist of what no command covers.
- **Out of scope** — explicitly, including the tempting adjacent work.

## Repo-specific constraints to carry into any plan

- **Static export.** `next.config.ts` sets `output: 'export'`. No server-side data fetching, no
  runtime env reads, no dynamic route params without `generateStaticParams`.
- **i18n key parity.** `messages/en.json` and `messages/ru.json` are rendered by the same
  components, so a key in one and not the other is a build break. Array lengths must match.
  Only `/cv` is localized; `app/HomePage.tsx` is English-only, so new standalone pages can be.
- **Theme parity.** Three theme states (light / dark / system). Never define a colour only
  inside `.dark` or only outside it.
- **Print view.** `/cv` exists to be printed to PDF. Interactive elements added to it need
  `print:hidden` or a print fallback, or they become dead text in the PDF.
- **Design language.** Black and white only, Merriweather serif, JetBrains Mono for metadata,
  bordered `Card` components with no fills or shadows, opacity as the only de-emphasis. Reuse
  `components/Card.tsx`.
- **Metadata** comes from `constructMetadata()` in `lib/metadata.ts` — never hand-rolled.
- **Dependencies.** Adding to `package.json` is a decision to flag in the plan, not a detail.
  This site carries five runtime dependencies on purpose.
- **This repo is public.** Committing publishes. Working notes and internal docs are fine;
  credentials, third-party confidential material, and other people's personal data are not.

## Local deviations from the playgramapp original

- **Plan files stay.** In `playgramapp` the plan is a transient artifact that must never reach
  `main` — `/finalize` deletes `docs/plans/` wholesale before the PR. Here the plan file is a
  wanted deliverable that lives in the repo. Do not sweep it.
- **No `/from-branch`, `/dry`, `/finalize`, `/pr`, `/propose-issue`.** Those skills do not exist
  here; references to them are dropped rather than faked.
- **`## DRY notes` is not required** — there is no `/dry` pass to feed.
- **Verification is three commands, not `pnpm vet`** — see `/implement`.
