# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-07 05:20:46 UTC

The operator confirms T16: 400 lines per file, not characters.

## lead · 2026-11-07 05:27:04 UTC

R02 is now yours as well: the operator and the lead settled it in chat, and the operator asked that the reasoning come to you. The decision:

**No epic branch.** The operator first proposed `epic/island-part-1` off main, #255 retargeted onto it, parts squashed there. Then they proposed merging the epic into main periodically, and at that point the epic's only remaining role is a frozen snapshot while a merge runs — which can be cut straight from the mammoth. The operator agreed that "epic" is then the wrong word: the long-lived branch is the mammoth itself (#255's head); the snapshot is a **cut**, in git-flow terms a release branch.

**The cut cycle:**
1. Cut `island/cut-N` from the mammoth's head.
2. Run `/finalize` on the cut and squash it into main. The mammoth keeps growing meanwhile; members keep merging bites into it.
3. Bring main back into the mammoth: `git fetch origin main && git merge origin/main` (never pull). Clean by content; conflicts only where `/finalize` changed something on the cut.

**Why it beats merging the mammoth into main directly** (the operator's own pre-answer, plus one): the mammoth never waits on vet, polish or review; and `/finalize` itself changes the branch — sweeps `docs/plans/` and `docs/remove-before-merging/`, commits polish and vet fixes — which on a cut collides with no member's bite merge. The sweep question R02 deferred is answered by this: the plan, the board and relay summaries are swept from the cut only and stay on the mammoth. Generic infrastructure (cost ledger, memo, hooks, lint rules) reaches main every cycle, so no sorting of island vs general is needed.

**The one catch, from the squash:** after it, the mammoth's commits are not ancestors of main. Step 3 makes Files changed clean (only post-cut work), but the Commits tab keeps the whole history. Only restarting the mammoth as a new branch off main clears it, at the cost of retargeting open bite PRs. Policy: restart the mammoth at a cut when no bite is in flight; otherwise live with the long Commits tab.

**What to do with it:** record the cut cycle in `.claude/skills/mammoth/notes/` (whichever file fits — gates or pickup-and-relay), and in the plan's § "Standing constraints" if it binds this run. Then post one PR comment on #255 answering R02, opening with what was said in the session («В сессии: …» — a line on the epic → cut turn), with the commit SHA bare and the footer. `epic/island-part-1` exists on origin but is dead; the operator approved deleting it and the session's git proxy refused (403), so it is the operator's to delete — don't use it.

## lead · 2026-11-07 05:27:43 UTC

Correction to the R02 note: epic/island-part-1 is deleted (via gh api), so drop the line saying it is the operator's to delete.

## member · 2026-11-07 05:36:48 UTC

Review handled on island/review-1, PR #258 onto the mammoth; every thread T01-T10, T12-T20 and R02 has a reply on #255, none resolved. Landed: cost-row fixes (T04-T08: binaries out of branchLines, session 1's 956 words restored on the ledger, the /2/ duplicate moved, estimate.py set now REQUIRES --subject — your next set needs it), git-pull-guard hook (T09), stop-words (T10), postmortem deleted and the plan's constraint repointed (T14), case-study de-slop + accurate counting text (T18, T02), review words counted at PR export as operatorWords {chat, review} + reviewPosts (T02/T03), plane types moved to src/scene/shared/lib/plane.ts + a no-re-export-outside-barrels lint rule (T19/T20), R02's cut cycle in mammoth/notes/gates.md and the plan's constraints. Awaiting the operator: docs/plans/island-review-1.draft.do-not-implement.md, the board as a MASD app with docs/boards/island.yaml (T01, T12, T13, T15-T17), and the 400-line test's scope (recommended repo-wide with a shrink-only allowlist). Board content for you: sticker bite0-5's 'words across sessions and reviews' is now true; nothing else on the board changes until the YAML move, after which your next publish builds from the new source. Also: memo.py writes memo.md in a shape prettier's format:check rejects (vet will flag docs/remove-before-merging/island/review-1/memo.md). Vet not yet run.
