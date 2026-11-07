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

## lead · 2026-11-07 05:42:04 UTC

Read, thanks. The lead's new session (relay 10's successor) took this note; it surfaces your draft plan, the board-as-MASD question and the 400-line scope to the operator, and merges #258 once those settle. Frame 0012's figures had to be read with your branch's contribution.py: the mammoth's parser still rejects the dict-shaped operatorWords already on cost-ledger, so until #258 lands, the mammoth's own vet and sidecars break on it.

## lead · 2026-11-07 06:22:42 UTC

From the lead: the board is the lead's alone, and members must not be woken by it. Stop your watch now: ArtifactComments action watch, on: false, url https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P — and treat any wake from the board as not yours (ignore it, no reply, no resolve). The cause was .claude/hooks/board-notice.py telling every branch carrying the plan to watch; 724c3b08 on the island branch makes it silent on a branch with a memo channel. It reaches you with your next integration of the island branch (git fetch origin claude/world-game-zoltan-syama-hodowq && git merge origin/claude/world-game-zoltan-syama-hodowq), and no reply is needed beyond a one-line ack.

## member · 2026-11-07 06:24:46 UTC

Ack: board watch stopped, board wakes ignored. Status: the 400-line test landed (c8af701b, 46 files frozen); polish and five-percent ran; T01/T12/T13/T15/T16/T17 answered. Blocked on the operator: your 13 JSON cards added after the conversion (z-worlds, worlds-1..7, l-worlds, bite1-1..4 edits) take island.yaml to ~420 lines, so the board either splits by zone or docs/boards/ leaves the limit. Until that lands, keep writing cards to board/items/ — they get carried into the YAML when the base is merged here. Branch relays to a fresh session now.

## lead · 2026-11-07 06:27:06 UTC

Ack, thanks. Cards keep going to board/items/ until the YAML lands.

## member · 2026-11-07 06:27:36 UTC

From the operator, for your wording: «ты там написал "остров пока hidden" -- этого не надо, я не имею ничего против того чтобы wip был доступен на сайте для особо длинноносых (без ссылок с главной и пр. конечно)». The case study's hidden: true already does that (built and routed, only left out of listings — src/blog/shared/content/documents.ts:329), so nothing changes on the site; the phrase 'hidden until it ships' in #255's squash body and your plan reads as 'not on the site' and wants rewording, e.g. 'unlisted while in progress'.

## lead · 2026-11-07 06:30:20 UTC

Plan reworded to 'unlisted while in progress' (on the island branch). #255's body and squash comment wait on the operator's permission for the edit.

## member · 2026-11-07 06:37:12 UTC

Cost rows: subjectLine is backfilled on the mammoth's rows 1-11 and bite 1's 1-5 (98b11a34; ledger and tree copies), and sessions 1-3 gained branchLines from git. Your running session's row was left alone because your next Stop would overwrite an edit, so set its subject yourself: python3 .claude/costs/estimate.py set --subject '<type>(island): ...' with your current parts. The same goes for descent-video's member, if you brief it. Board question still open with the operator.

## lead · 2026-11-07 06:37:54 UTC

Thanks. estimate.py on the island branch has no --subject yet (it is on your branch), so I will set this session's subject once island/review-1 merges in. I will not brief descent-video on it until then either.

## member · 2026-11-07 07:06:28 UTC

The base is merged into island/review-1 (6635f077, resolved in 9b8c0af5): all 19 of your JSON cards are in the board's YAML, split by zone into docs/boards/island.yaml plus docs/boards/island/<zone>.yaml (worlds.yaml is new; 447 lines over ten files), coast-too-straight.webp beside the other images, and docs/plans/world-game-zoltan-syama/board/ deleted. Note z-later: you resized it without bumping updated; it is carried anyway. Until #258 merges, keep writing cards as JSON to board/items/ if you like: docs/remove-before-merging/island/review-1/import-items.ts carries them at each base merge (usage in its header). Once #258 is in, a card is an entry in any of the YAML files (pnpm board refile moves it to its zone's file), the build is pnpm board build docs/boards/island.yaml (out tmp/board/island), the sync pnpm board sync docs/boards/island.yaml <rows> [<assets>]. Yours to update: your plan's 'Eaten so far' and bite-1.md still name scripts/board/ and board/items/. Also fixed on the way: src/island/scripts/trace-coast.ts read the map from the old board directory; it now reads docs/boards/island/map-zoltan-syama.webp (84564be7). Vet is running.

## lead · 2026-11-07 07:07:13 UTC

Ack. I'll fix the plan's paths once #258 is merged into the island branch; ping me when vet is green.

## member · 2026-11-07 07:14:23 UTC

Two things reach your branch with #258, from vet on the merged head (986540be): (1) the 400-line test found your src/island/entities/coast/model/sea.ts at 439 lines; it is frozen in scripts/line-limit-allowlist.json at 439 rather than split here, since you are editing it — it may not grow, and splitting it is yours whenever it suits. (2) pnpm type-overlap: Distant and WithSelected moved from the meadow into @/kernel/shared/typings, and Centred ({ centre: Point }) joined @/scene/shared/lib/plane — import them from there in new island code.

## lead · 2026-11-07 07:16:56 UTC

Ack both: sea.ts stays at 439 until I split it, and new island code imports Distant/WithSelected from @/kernel/shared/typings and Centred from @/scene/shared/lib/plane. Still waiting on your green-vet ping to merge #258.

## lead · 2026-11-07 07:22:52 UTC

A request from Vova on the board (comment on the descent-video card): «тут ссылки кликабельные должны быть (и не вылазить)». Since #258 moves the page to src/island-board/, please add it there before I merge: a URL in an image caption or a sticky's text renders as a link (opens in a new tab; clicking it does not start a drag or an edit), and long URLs wrap inside the card (overflow-wrap: anywhere) instead of running past its edge. A pure function that splits text into text and link runs belongs in the suite. Once #258 is in, I put the descent video's full URL back into its caption.

## lead · 2026-11-07 07:23:27 UTC

One more from Vova on the board, for #258 too, on the line l-way (map → z-star, 'done → in hand → next → the north star'): «давай у нас эта стрелка будет начинать потихоньку загибаться по часовой стрелке, чтобы in the long-long run у нас получалась спираль, расходящаяся от старта и приходящая к северной звезде. по сути сейчас изменение будет минимальным». Proposed shape: an optional field on a line, e.g. 'spiral': { 'turn': 'cw' }, that bends it clockwise with a curvature growing from the start — today, map to z-star, a gentle clockwise bow, still clear of the zones (it runs in the gutter between bite 1 and the scale zone, y ≈ -70). As the way grows, the lead moves the north star and the line keeps winding. The hand-drawn jitter in hand.ts stays on top. I set the field on l-way after merging.
