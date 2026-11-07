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
