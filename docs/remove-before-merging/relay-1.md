# Relay 1 — basilisk.fyi seal layout (parked)

## Standing constraints

None stated.

## The conversation

1. **Operator:** `/finalize & merge claude/basilisk-case-seals-c86c9y`, then
   mid-turn: «(только увеличь хип линта до 5гб)»
   - **Agent:** attached to PR #184. Gave eslint a 5 GB heap through a new
     `lint:check` script: `pnpm lint` is `lint:check --fix`, vet runs
     `lint:check`, and the flag is appended to `NODE_OPTIONS`. Ran the
     whole finalize. Vet first needed authored fixes: an unused `SealCut`
     export and prettier. The base merge conflicted on a count in
     `the-five-percent.md`, resolved as 79. Attested 5dca270. Stood the merge
     down, because the ask carried a change, vet needed authored fixes and the
     base merge conflicted. Offered the muthur sync (5 commits behind)
     once; it got no answer, so do not make it again.
2. **Operator** (with two screenshots, saved at `tmp/session-images/`):
   «чё-то я поспешил замёрджить, посмотрел локально дизайн и такое себе. но раз
   уж так, давай правки новой таской: 1- тут (1й скриншот) иконки под номером
   дела, а не сбоку 2- на 2м -- либо слева от заголовка+лида, либо там же где
   есть но с нормальной центровкой. попробуй так и так, покажи, решим»
   - **Agent:** #184 had been merged by the operator. Routed through `/task`
     with no plan and started `claude/basilisk-seal-layout` off main. The
     docket fix put the seal under the number. Variant B centred the seal on
     the memo, and variant A moved the seal into the header, left of the title
     and lede. Showed screenshots. Recommended A.
3. **Operator:** «А -- и попробуй только слева от лида (а заголовок выше
   обоих)»
   - **Agent:** committed A (f5609b8), then A′ (a979a1c): title full width,
     seal left of the lede. Recommended A′.
4. **Operator:** «а если справа от лида?»
   - **Agent:** committed A″ (897833f): seal right of the lede, centred on
     its height; on a narrow screen it stands between the title and the lede.
     Recommended A″, because the lede keeps the left edge the title and memo
     share. Asked which one to keep. **Unanswered.**

## Intent

The operator wants basilisk.fyi's seals to sit well:

- **The docket row**: the seal sits under the case number. This is done
  and needs no further choice.
- **The case page**: the seal sits in the header beside the lede. The
  operator chose A over B, then asked to see the seal left of the lede (A′)
  and right of it (A″). They are choosing between those.

## Decisions

- **The seal is a new `mark` slot in `ARTICLE_SLOTS`**, rendered by
  `ArticleHeader` beside the lede. `CaseBrief` now holds only the memo. The
  alternative was keeping the seal inside the brief, as variant B did, but
  the operator chose A.
- **`CaseSeal` lives in its own file**, `src/entities/case/ui/case-seal.tsx`.
- **Each variant is its own commit**, so dropping the unchosen ones is a
  `git revert`:
  - A is f5609b8.
  - A′ is a979a1c.
  - A″ is 897833f, at the tip.
- **Choosing A′ means reverting 897833f.** Choosing A means reverting
  897833f and a979a1c. Whichever stays, the `.marked` comment and the
  `mark` slot docstring must describe the surviving placement.

## Errors and dead ends

None worth carrying.

## State

- **Branch:** `claude/basilisk-seal-layout`, pushed, head cb5d843, a cost
  row after 897833f.
- **PR:** none yet.
- **Plan file:** none. The work is planless.
- **Nothing running.**
- **This session's estimate:** 0.5 h middle developer (lint heap), 1 h
  senior developer (#184 land prep), 1.25 h middle developer (three seal
  placements), 0.5 h senior designer (the placement call).
- **Remainder handed on:** 0.25 h middle developer, "dropping the losing
  variants and opening the PR is routine".

## Pointers

- `src/pages/basilisk-home/ui/basilisk-home.module.scss`, `docket-row.tsx` —
  docket row
- `src/pages/documents/ui/article-header.tsx`, `article-slots.tsx`,
  `documents.module.scss` (`.marked`) — header slot
- `src/entities/case/ui/case-seal.tsx`, `case-brief.tsx`, `case.module.scss`
- Preview: `pnpm dev:basilisk --port 3107`, case route
  `/cases/dpd-chatbot-haiku`; `.claude/skills/preview/SKILL.md`
- Predecessor transcript:
  https://claude.ai/code/session_011mLpw9n9dbgp5k4SGqURpg

## Next step

Wait for the operator to pick the case-page seal placement: left of the lede
(A′) or right of it (A″, the tip and the agent's recommendation). Then revert
the unchosen commits and fix the comments. Run `/go`'s Step 3 (`/polish`) and
Step 4 (`/pr`).
