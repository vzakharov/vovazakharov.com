# #258's late review, handled on the island branch

The task: `/handle claude/world-game-zoltan-syama-hodowq` — the operator left
review comments on #258 (`island/review-1`, already merged into this branch) by
mistake, plus one open thread on #255. Handle them here.

## Done

Every addressed comment has a reply on GitHub; no thread was resolved.

- **Cost rows held whole** (#258 T01, T02) — 0832c16a: `check_estimates.py`
  fails a carried row lacking a key the writer writes (`unwritten()` in
  `.claude/costs/lib/shape.py`, derived from the dataclasses) or with a null
  `subjectLine` / `operatorWords` / `branchLines`. 28 rows rewritten through
  `estimate.py set --session`; subjects drop the `(island)` scope.
- **`Gridded`, `Distant`** out of kernel into `scene/shared/lib/plane.ts` —
  a4ca906a.
- **The board's data** is `src/island-board/app/config/` — 5ea82220.
- **Sticky `done: true`** replaces a leading ✓ — 3cdcfb54.
- **`.claude/rules/writing.md`**: the machine-prose tells, scoped to drafts and
  served Markdown; `contrast.md` folded in and removed — 979fd555.
- **Answered without a change**: board-notice's docstring (the notice text and
  the plan carry the rule), notes files, memo pushing, `coast.json`, `?play`,
  origami, island-board → scene.

## Left

1. `/polish` over this session's commits, then `/pr` to refresh #255's body.
2. Waiting on the operator: #258 T07's domain idea is an image the container
   gets a 403 on — asked for it as text. #258 T10 offered an illustrated
   `coast.json` primer for the board, to pin at the next board publish.
