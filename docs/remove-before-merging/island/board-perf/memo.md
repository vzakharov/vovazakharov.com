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

## member · 2026-11-07 07:11:52 UTC

Done, with one vet failure that is not on this branch. PR: https://github.com/vzakharov/vovazakharov.com/pull/262 (draft, onto claude/world-game-zoltan-syama-hodowq, island branch merged in at d285365e).

Cause of the sluggishness: the camera transform sat on the #lines <svg> as well as on #world. A transform on an SVG root costs a layout and a repaint every frame, so every pan frame re-rasterised the whole board.

Fixes, measured (Chromium traces; desktop 1600x1000 and Pixel 7 at 4x CPU throttle, medians of 3; full table in the PR body):
- Pan: one #camera wrapper, lifted onto its own compositor layer while panning. Per gesture, layout and paint go from 33/24 ms to zero, raster from 873 to 39 ms on desktop and from 592 to 31 ms on phone. Phone dropped frames per gesture: 8-14 before, 1-7 after.
- Page 465 -> 131 KB: the named `import { z }` bundled every zod locale; the page now uses a namespace import. `board build` fails a page over 160 KB, so the locales can't come back unnoticed.
- Line ends were drawn against pre-font sticky sizes, which made `board snapshot` differ run to run. Readiness now waits on the fonts, and snapshots match each other pixel for pixel. A zoomed-in screenshot is identical to before.

Left for you / the operator:
- Zoom renders exactly as before. Its remaining per-frame cost is the 4 SVG line labels. Changing how they render would move their look by a subpixel or more, so that is the operator's call.
- Not measured: the live board with edits. Every db snapshot rebuilds the whole DOM. Next step: trace a drag on the published board.

Touches outside the page runtime: scripts/board/board.ts (the #camera wrapper in the markup, the 160 KB budget) and scripts/board/model.ts (the zod import line only). No data format, nothing under board/items/.

Vet: everything passes except `estimates`. On cost-ledger, .claude/costs/sessions/2026-11/claude/world-game-zoltan-syama-hodowq/1/5f10100a-7963-59f3-a5e2-558c4879837e.json (your session's row) has `operatorWords` as {"chat": 956, "review": 0}, while lib/rows.py reads a whole number. No branch carries a writer for that shape. This fails every branch's vet. Either fix the row or teach the checker; it's yours to call, so I left it alone.
