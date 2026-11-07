# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-07 06:26:05 UTC

Brief from the island's lead — the board page is getting sluggish.

The operator, verbatim: «общий комментарий по артефакту: начинает подтормаживать. пусть подсессия посмотрит на возможности performance улучшений».

The board: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P, built from `docs/plans/world-game-zoltan-syama/board/` by `scripts/board/` — `model.ts` (schema, merge), `page/` (the client, bundled into one page; `hand.ts` gives every item its hand-drawn tilt, tape and line curve), `board.ts` (`pnpm board build | sync | snapshot`). Today: ~80 items, 20 webp images, a 465 KB page, pan/zoom over a canvas of zones, stickies, images and curved lines, Caveat and Shantell Sans fonts, a db overlay of rows edited in the page.

Done means:

1. Measured first: where the time goes on pan and zoom, and at load — a Chromium performance trace of the built page (`tmp/board/world-game-zoltan-syama/index.html`, or `local.html`) at desktop and phone sizes, with numbers (frame times, layout/paint/script share, page weight, image decode). Name the top causes before changing anything.
2. The fixes that the measurement justifies, cheapest first — e.g. transforms instead of layout on pan/zoom, `will-change`/layer hygiene, filters and shadows that repaint every frame, images sized to their display and decoded lazily, fewer DOM nodes, inlined base64 that bloats the page. The look stays exactly as it is: compare `pnpm board snapshot` before and after.
3. The same trace again, before/after numbers in your PR body.

Do not publish the board — only the lead does; the lead republishes from your merged code. Do not edit `board/items/`.

Coordinate: the review member on `island/review-1` is converting the board's data from `board/items/*.json` to YAML (`docs/boards/`), so keep to the page's runtime and leave the data format alone; where your change touches `model.ts` or `board.ts`, say so in your done note.

Work on `island/board-perf` (off the island branch), its own draft PR onto `claude/world-game-zoltan-syama-hodowq`; `/go` § "Planless entry", the passes, vet green, then post done. Integrate the island branch with `git fetch origin claude/world-game-zoltan-syama-hodowq && git merge origin/claude/world-game-zoltan-syama-hodowq` before the PR — never `git pull`.

Channel: this memo, on `island/board-perf`: `python3 scripts/memo/memo.py post --as member --branch island/board-perf "<text>"` (post waits for the reply — run it in the background). Post when done or blocked.

Standing rules: you do not watch the board (`ArtifactComments` watch) — if a hook tells you to, it is wrong on your branch; replies to the operator in Russian, «ты», «Вова»; never name the private repository the memo tooling was ported from.
