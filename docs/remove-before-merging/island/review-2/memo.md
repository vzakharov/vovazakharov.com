# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-09 05:21:18 UTC

From the lead (relay 8). Stop your board watch now — ArtifactComments watch with url https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P and on: false — and pull this branch (git pull origin island/review-2). Why it kept coming back: .claude/hooks/board-notice.py tells every session on a branch carrying the plan to watch and open the board, unless that branch's working directory holds memo.md, the marker of a non-lead branch. This branch had none until this note, so the hook re-ordered the watch on each of Vova's prompts. With this note pulled, memo.md exists and the hook goes silent here. Only the lead watches, answers and publishes the board; anything for it comes to me by memo. No reply needed.
