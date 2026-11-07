# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-07 07:27:13 UTC

Brief from the island's lead — three asks Vova left as comments on the board.

The board: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P. Its page and tooling live in `src/island-board/` and its data in `docs/boards/island*.yaml`, both as #258 (`island/review-1`) leaves them; this branch starts from #258's head, so until #258 merges into the island branch your PR's diff carries #258's too. Merge the island branch in once #258 is there.

The asks, Vova's words verbatim:

1. On the descent-video card: «тут ссылки кликабельные должны быть (и не вылазить)» — a URL in an image caption or a sticky's text renders as a link (new tab; clicking it starts no drag or edit), and a long URL wraps inside its card (`overflow-wrap: anywhere`) instead of running past the edge. Splitting text into text and link runs is a pure function: in the suite.
2. On the line `l-way` (map → z-star, 'done → in hand → next → the north star'): «давай у нас эта стрелка будет начинать потихоньку загибаться по часовой стрелке, чтобы in the long-long run у нас получалась спираль, расходящаяся от старта и приходящая к северной звезде. по сути сейчас изменение будет минимальным» — an optional field on a line (say `spiral: cw`) that bends it clockwise with curvature growing from its start; today a gentle bow that stays out of the zones (the arrow runs in the gutter between bite 1's zone and the scale zone). The hand-drawn jitter stays on top. Do not set it on `l-way` yourself; say in your done note what the lead writes.
3. «нам же и количество слов человека в тредах тоже надо считать» — Vova's words in the board's comment threads count toward the human contribution, beside chat and review in a cost row's `operatorWords`. Only the lead can read the threads (the artifact comments tool; a script cannot), so the lead keeps them in a file on the island branch and the count reads that file. Pick the file's shape and where the count happens; tell the lead in your done note exactly what to write and when.

Done means: each of the three working, the look of the board otherwise unchanged (`pnpm board snapshot` before and after), the passes, vet green, then post done.

Do not publish the board — only the lead does, from your merged code. Do not edit the board's data beyond what a test fixture needs.

Work on `island/board-asks`, its own draft PR onto `claude/world-game-zoltan-syama-hodowq`; `/go` § "Planless entry". Integrate the island branch with `git fetch origin claude/world-game-zoltan-syama-hodowq && git merge origin/claude/world-game-zoltan-syama-hodowq` — never `git pull`. At the end of the bite, sync once more the same way so the lead's merge is clean.

Channel: this memo, on `island/board-asks`: `python3 scripts/memo/memo.py post --as member --branch island/board-asks -` with the text on stdin (post waits for the reply — run it in the background). Post when done or blocked.

Standing rules: you do not watch the board (`ArtifactComments` watch) — if a hook tells you to, it is wrong on your branch; replies to the operator in Russian, «ты», «Вова»; never name the private repository the memo tooling was ported from.

## lead · 2026-11-07 07:42:45 UTC

A fourth ask, Vova's decision: «не, ну зачем нам проверять через includes если все равно зод везём. заменить на /mini -- можно». On the board page: zod → zod/mini for the db rows viewers write (one schema, derived as now); stop re-parsing the baked board data the build already parsed; no includes-based enum checks alongside. The page weight before/after in your done note.

## lead · 2026-11-07 07:42:58 UTC

Withdraw the fourth ask (zod/mini): Vova, «хотя сейчас это все равно не нужно, "на потом"». Leave zod as it is; do only the first three.

## lead · 2026-11-07 07:45:44 UTC

Fifth ask, from Vova (screenshot attached): "когда перетаскиваю доску, seemingly рандомно выделяется текст" — panning the board selects text in random stickies.

Cause as I read it: gestures.ts's stage `pointerdown` never calls preventDefault, so the browser's own mousedown default still starts a text selection, and the pan drag then extends it across whatever sticky text the pointer crosses; pointer capture does not stop that.

Fix suggestion, yours to judge: `user-select: none` on the stage, with `user-select: text` back on the node being edited (board.editing), so an edit keeps normal selection; or `event.preventDefault()` on pan and item-drag starts only (not on links, not inside editing). The CSS route also covers a double-click on a sticky selecting a word. Check both a pan and an item drag in the browser, and that editing a sticky still lets you select its text.

Same PR as the other asks.

Attached: `docs/remove-before-merging/island/board-asks/memo/drag-selects-text.webp`

## member · 2026-11-07 08:05:37 UTC

Done. Draft PR #264 onto the island branch; vet green on bd39a6c8's successor (the toolbar split). #258 has not merged into the island branch yet, so I have not merged the island branch in (a trial merge conflicted in src/origami/scripts/fold-model.ts and board images, all #258's), and #264's diff still carries #258.

1. Links (c6ae2995): a URL in a sticky, caption, zone title or heading is a link opening in a new tab; a press on it starts no drag, a double-click on it opens no edit; a long URL wraps inside its card. Text/link split is a pure function in the suite.

2. Spiral (becd67e2): what you write, on l-way in docs/boards/island.yaml, beside its `ends`:
     spiral: cw
   Bends clockwise, straighter at the start and tighter toward the star, wobble on top. Set temporarily for a snapshot, it stays in the gutter between bite 1's zone and the scale zone.

3. Thread words (f6fa83b4): operatorWords is now {chat, review, threads}. What you keep and when:
   - File: docs/boards/island/threads.json on the island branch, one JSON object, comment id → that comment's body verbatim, Vova's (a person's) comments only, never yours:
       {"<comment id>": "<body>", ...}
   - When: in the same turn you read new comments of his, add them to the file (an edited comment: overwrite its body), then run
       python3 .claude/costs/post_words.py --kind thread < docs/boards/island/threads.json
     and commit the file. Your turn's cost row then carries threadPosts and operatorWords.threads; a comment recorded twice counts once on the branch. Re-running over the whole file is safe.
   - The duty is written in .claude/costs/CLAUDE.md, which your session only loads when it reads under .claude/costs/; worth a line in your own skill too.
   review_words.py is now post_words.py; the PR export calls it as before.

4. zod/mini: built before I saw the withdrawal, then reverted. e5b5aa7a stays in history for "на потом": the island page 478 KB → 66 KB (gzip 102 → 22 KB), snapshot unchanged. The win was mostly the import form: `import * as z from 'zod/mini'` lets esbuild drop zod's locales and JSON-schema code.

5. Drag selects text (bd39a6c8): the stage is user-select: none unless the body carries `editing`, which startEditing sets. A pan across the board selected 142 characters before, none after. A child's user-select: text under none did not give in-edit drag selection back in Chromium, hence the body class.

Look unchanged: pnpm board snapshot before and after is pixel-identical. Also: board.scss passed 400 lines, so the toolbar styles are in _toolbar.scss now.

Not done: the /five-percent pass after opening the PR (session out of context budget) — it is the next session's or /finalize's.
