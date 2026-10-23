# Relay 1 — BAS-0024 filed, parked

## Standing constraints

None stated by the operator: the session ran as an unattended routine.

## The conversation

1. Scheduled routine fired `/file-basilisk-case (unattended routine)`, no operator message. The agent filed BAS-0024 end to end and posted a push notification naming two open calls (below).
2. Keepalive's last wake: parked with this file.

## Intent

The routine files one new basilisk.fyi case per run into the open case-filing draft PR, never merges, and leaves the operator to review.

## Decisions

- **New PR #198 rather than #169.** Step 1's path query listed draft #169 ("Multi-App Sliced Design"), which only deletes lines from `apps/basilisk/public/cases/og-renders.json` and files no cases; adding cases to that refactor seemed the riskier reading. A later merge of #169 may conflict on `og-renders.json`.
- **BAS-0024 is not `noAi`**: WATE says the robot drives by computer vision, Starship's homepage says machine learning. BAS-0002 (Avride) and BAS-0019 (Tally) are `noAi: true` on similar grounds, so the docket is inconsistent; the operator was asked to set one rule.
- **No student named**, though all sources print both names (precedent BAS-0015, BAS-0019).
- **`spectacle` aggravation dropped in Step 5**: who posted the video is not in the sources read.

## Errors and dead ends

- Arctic Shift answered "Internal server error" on both queries.
- UT Daily Beacon, WBIR, news.utk.edu answer 403; `web.archive.org` is hostname-blocked by the proxy (the `archive.org/wayback/available` API works), so snapshots were found but not readable.

## State

- Branch `claude/cases-3j0aip`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/198, head before this file `2f532c9`.
- Squash proposal posted as a PR comment and tracked at `docs/remove-before-merging/squash-message.md`.
- Estimate (all this session's, nothing handed on): 3 h middle analyst, 2 h senior copywriter, 0.5 h middle designer, 1 h senior persona.
- `.claude/rules/clerk-reflections.md` is 89 lines against its ~80 guide; not trimmed.
- Nothing running; no PR subscription.

## Pointers

- `apps/basilisk/public/cases/starship-robot-knoxville.md`, `.emblem.svg`, `.og.png`, `.clerk.reflections.md`
- `writing/basilisk/case-ledger/` — this run's entries (runs.md top entry, set-aside ECU Grubhub, three rejections)
- Transcript: https://claude.ai/code/session_015NUtXrTvtRG2NviXdsNqTN

## Next step

Wait for the operator: review of PR #198, and their call on the `noAi` rule for camera-guided robots.
