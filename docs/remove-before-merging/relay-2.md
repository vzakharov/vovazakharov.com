# Relay 2 — seamless HQ switching (parked)

## 1. Standing constraints

None stated by the operator beyond the repo's own CLAUDE.md.

## 2. The conversation

Session started as `/relay take claude/seamless-quality-switch-i2xtai` from relay-1.

**Agent:** Reported the branch state; flagged the one non-reproduced harness run (a swap that did not land within 6 s) as worth chasing before merge if reliability matters.

**Operator:** «мне больше важно чтобы флейков не было, поэтому давай я сам потесчу, а флейчный (-е) тест(ы) убивай»

**Agent:** Nothing to kill: the flaky harness lived only in the predecessor's scratchpad, never in the repo; the branch adds no tests, and the PR's QA table already marks the swap scenarios ❌. The unexplained no-land case still exists in the code — if HQ "doesn't switch on" in manual testing, that is likely it.

**Operator:** «кинул один коммент»

**Agent:** Ran `/handle`. One thread on `deck-swap.ts:34`: «никаких Pick, см. #158 (пока не доехал, но будем заранее готовы)». Fixed in 1aa6da7 (`Landing`, `Swapping` declared first; `SwapDone`/`Swapper`/`Decks` intersect them; `SwapDone` un-exported, which knip had flagged since the split). Replied on the thread (thread left open). `/polish`: 4c651c0 (one `markPlayed` in `decks.ts`), c6ebb22 (dropped `DeckPlayback`'s docstring). Five-percent note caa664f. PR body and squash proposal left unchanged (type-only). Asked one non-blocking question: extract the duplicated active-deck check (`decks.ts:111-122` vs `onActive` in `deck-swap.ts`)? Recommended leaving it. No answer yet.

## 3. Intent

Near-seamless HQ/MP3 switching, production-grade. The operator tests manually rather than relying on a harness, and wants no flaky tests. New code follows #158's no-Pick/Omit rule ahead of its merge.

## 4. Decisions

- The swap's narrow types are named first and the wide ones intersect them (per #158), not `Pick`.
- Pre-existing `Pick`s in `src/pages/music/lib/` on `main` are left to #158.
- The duplicated active-deck check stays duplicated unless the operator says «выноси».

## 5. Errors and dead ends

None this session.

## 6. State

- Branch `claude/seamless-quality-switch-i2xtai`, last code commit c6ebb22, all pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/168 — open, draft, mergeable, base `main`. Review thread on `deck-swap.ts:34` answered, open.
- No plan file. No CI on PRs, no subscriptions, no check-ins.
- Estimate: this session 0.5 h senior developer (review fix and polish). Remaining handed on: `/finalize` land prep, about 0.25 h senior developer.
- Polish floor is now c6ebb22.

## 7. Pointers

- `src/pages/music/lib/deck-swap.ts`, `decks.ts`, `deck-element.ts`, `use-audio-player.ts`.
- `docs/pr/168/pr.md` — the last PR export.
- `docs/remove-before-merging/relay-1.md` — the earlier context, including how to rebuild the headless harness.
- This session's transcript: https://claude.ai/code/session_01Nyap6PimBLfL2M5aQseDYN
- Predecessor's: https://claude.ai/code/session_01CUX3SSQcqu7TRBpW2LhEdX

## 8. Next step

Wait for the operator. Pending on their side: manual testing (incl. iPhone, QA item `ios`), the answer to the duplicated-check question, then `/finalize`.
