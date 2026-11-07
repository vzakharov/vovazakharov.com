# The board as a MASD app, its source one YAML

#255 review threads T01, T12, T13, T15, T16, T17. The board today is
`scripts/board/` (CLI, zod model, a 596-line `page/main.ts`, raw `style.css`)
reading one JSON file per item under `docs/plans/world-game-zoltan-syama/board/`
— which `/finalize` deletes with the rest of `docs/plans/`.

## Shape

- **`src/board/`, a new app**, `"board": ["kernel"]` in `src/masd.json`. No
  route: like `origami`, it is consumed by its own script. Its layers:
  - `entities/item/` — today's `model.ts` (the `Item` union, `mergeItems`,
    `parseDbRow`) and the YAML codec beside it; node-safe, read by the page and
    the script.
  - `pages/board/` — the page, `index.ts` exporting `startBoard()`, with
    `main.ts` split along its seams: `state.ts` (DOM refs and the mutable state,
    as one `BoardState` object), `viewport.ts` (fit, screen points, camera
    wiring), `actions.ts` (edit, add, remove, recolor, line tool, image upload),
    `gestures.ts` (pan, move, resize, pinch, wheel), `controls.ts` (toolbar,
    swatches, keys, paste), `status.ts`. `store`, `runtime`, `render`, `hand`,
    `camera`, `dom` move in as they are, each test beside its module
    (`camera.test.ts`, `hand.test.ts`, `model.test.ts`).
  - `app/styles/board.scss` — `style.css` as SCSS, the seven `.c-<color>` blocks
    folded into one `@each` over a map.
  - `scripts/board.ts` — the CLI (`build | sync | snapshot`), `pnpm board`
    pointing at it; it bundles `pages/board` with esbuild against the repo
    `tsconfig.json` (as `src/mushrooms/scripts/build-mushroom-artifact.ts` does,
    so `@/` resolves) and compiles the SCSS with `sass.compileAsync`.
- **The source is one file, `docs/boards/island.yaml`**, images in
  `docs/boards/island/`. Outside `docs/plans/`, so it survives the merge; the
  plan file points at it. A later board is a sibling file.
- **The YAML is the file codec only.** The page still bakes the decoded items as
  today's JSON, and the artifact's db rows keep their shape, so rows already
  written on the published board stay valid and `sync` works across the move.

## The item shape (T13)

```yaml
title: Island — exploring the world Zoltan and Syama drew
artifact: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P
items:
  - id: call-5
    type: sticky
    updated: ['2026-11-06T22:30:00.000Z', 'agent:lead']
    box: [1512, -573, 244, blue]
    text: 'Two tiers: …'
  - id: z-calls
    type: zone
    updated: [...]
    box: [1120, -930, 1060, 790, blue] # x, y, w, h, colour
    text: The calls everything else stands on
  - id: l-way
    type: line
    updated: [...]
    ends: [map, z-star, dashed]
    text: done → in hand → next
```

- **`box`** is the invented key: the numbers are geometry read positionally per
  type (`x, y, w` for a sticky or image, `x, y, w, h` for a zone, `x, y, w` and
  a size word for text), and a trailing word is the colour or size. It is a flow
  sequence, not `1512, -573, 244, 'blue'` as written in the thread, which YAML
  reads as one string.
- **`text`** is each type's one text field (a zone's title, an image's caption).
- **Rotation and tape stay derived** from the id, as now; nothing stores them.
- **`deleted: true`** stays, as the tombstone `sync` needs.
- Sixty-five items at five lines each come to about 330 lines — inside the limit
  below, and the point at which the file splits by zone if it grows.

`sync` edits the file through the `yaml` package's `Document` API: it sets only
the keys that changed on each changed item, appends new items, and keeps
comments and order, then formats through prettier. A round-trip test holds
decode → encode at a fixed point.

## The line limit (T16)

A test fails any tracked text file over **400 lines** (confirmed: lines, not
characters) — code, Markdown, YAML alike. **Recommended scope: the whole repo,
with today's 51 offenders frozen in an allowlist that can only shrink**, each
entry at its current length, so a file on it may not grow either. The
alternative, scoping it to `src/board/` and `docs/boards/`, catches nothing
elsewhere. Generated and data files (the lockfile, `docs/pr/`, cost rows,
`lexicon.json` and its kind) are excluded by pattern, not listed. CLAUDE.md's
"keep production files under ~450 lines" becomes a pointer to the test at
`/finalize`'s swap, since a rule of thumb beside a hard limit would contradict
it.

## Steps

1. `src/board/` skeleton, `masd.json`, knip entry for the page.
2. Move `model.ts` and tests; the YAML codec with its round-trip test.
3. Convert the 65 item files into `docs/boards/island.yaml` by script, images
   moved; check `build` renders the same page as before (screenshot diff).
4. Move and split `main.ts`; move the rest of `page/`.
5. SCSS and the sass step in `build`.
6. `sync` writing YAML; its test against db rows.
7. The line-limit test and its allowlist.
8. Repoint the plan, `package.json`, the republish recipe; `scripts/board/`
   deleted.

The board is republished by the lead only: this work ends with the lead told, by
memo, that the next publish is from the new source.

## Progress

Done (bf080539): steps 1–6 and the `package.json` half of 8. Where the work
departed from the shape above:

- `board` hangs off `scene` in `masd.json`, for the plane types.
- The YAML codec is `src/board/scripts/lib/board-file.ts`, not in the entity:
  only the script reads the file, and the page bundle stays free of `yaml`.
- `pages/board` is three sub-slices, `camera/`, `drawing/` (render, hand) and
  `canvas/` (the rest), because `masd:clusters` found render+hand a cluster.
- The page's entry is written inline by the script (as the mushroom build does),
  so knip names `pages/board/index.ts` and `board.scss` as entries.
- An image item carries `src:` beside `box`; the file's `title` is
  `Island board`, the page's title as before.
- Checked: decode of the YAML equals the 69 old item files; the built page's
  snapshot is pixel-identical to the pre-move one; lint, tsc, knip, Steiger,
  `check:masd`, cycles, clusters, poison and the board's 28 tests green.

Done (c8af701b, c66c357b): step 7 — `scripts/line-limit.test.ts`, 46 files
frozen in `scripts/line-limit-allowlist.json` at their exact length, JSON data
excluded by pattern along with the lockfile and `docs/pr|issue/`; CLAUDE.md's
rule of thumb (staged) and `.claude/rules/testing.md` point at it.

Done: `/polish` (b8439de6; `/dry` applied nothing — its `storeFor` question in
`canvas/ui/start.ts` is answered no: the store is built inside the `board`
literal it belongs to, and two call sites do not pay for a two-step build);
`/five-percent` posted
(https://github.com/vzakharov/vovazakharov.com/pull/258#pullrequestreview-5810517114);
replies on #255's T01, T12, T13, T15, T16, T17.

Answered (operator: «не исключать, придумать способ разбиения»), done
(783e2848f): the board splits by zone — `docs/boards/island.yaml` keeps title,
artifact and the unzoned items, each zone `docs/boards/island/<zone>.yaml`; the
file is derived per item on every write
(`src/island-board/scripts/lib/board-files.ts`), `pnpm board refile` re-derives
it all. Also done on #258's second review: the app is `src/island-board` (T05,
a4c28ad5f); `subjectLine` under `at` (T03, 68a713bc9); the case study's contrast
and `.claude/rules/contrast.md` (T04, c55b0543f, f73fc9c69) — each answered.

Done, T01 answered: the import is
`docs/remove-before-merging/island/review-1/import-items.ts` (a6d13652); it
takes a card absent from the board, or differing and no older (the lead resized
`z-later` without bumping `updated`). The base is merged (6635f077, resolved in
9b8c0af5): all 19 cards the base held are in the YAML, `board/` deleted;
`src/island/scripts/trace-coast.ts` repointed at the map's new home (84564be7);
the lead told by memo. Until #258 merges, the lead may keep writing JSON cards:
each base merge re-runs the import.

Done: vet green on the merged head (b7adcbbc; the meadow's six shards green on
986540be, before a lint-only fix), after fixing what the merge tripped —
type-overlap bases, knip, the line limit (`sea.ts` frozen at 439, the lead's to
split), the island page's catalogue re-export; `/polish` (5506e170;
`/five-percent` answered); `/pr` refreshed with the squash proposal. The
operator put the l-way spiral and board-thread word counts outside #258, for a
new member session of the lead's.

- Not ours: the ledger holds four more October rows under a branch named `HEAD`
  (a Stop on a detached HEAD files them there) — reported to the operator.

Also open, asked by the operator on #255 after this plan was written — both
backfills of cost rows from session transcripts, which `list_events` /
`get_event` (Claude Code Remote tools) read from the server even with the
container gone:

- **T05**
  (https://github.com/vzakharov/vovazakharov.com/pull/255#discussion_r4500334746):
  session 1's row
  (`.claude/costs/sessions/2026-11/claude/world-game-zoltan-syama-hodowq/1/5f10100a-….json`)
  carries `operatorWords: 956` as a lower bound — its last nine minutes were
  never counted — and sessions 1–3 have no `branchLines`. The operator: «вроде
  бы у тебя есть тулы для получения транскриптов сессий». Recount from the
  server transcripts, with the code that counts them today
  (`.claude/costs/lib/words.py`, `branch_lines.py`, `transcript.py`).
- **The `subjectLine` thread**
  (https://github.com/vzakharov/vovazakharov.com/pull/255#discussion_r4500340353,
  on session 9's row): «надо добавить задним числом» — every older row lacks
  `estimate.subjectLine`; write one per row from what that session did.

Both rows live on the base branch, so the backfill commits land here and reach
the base with #258. Reply on each thread with the SHA.

Done (98b11a34, both threads answered): 956 is exact — the server transcript
holds seven operator messages, the last at 17:33. Sessions 1–3's `branchLines`
come from git, each session's last commit against its merge base with main (the
method reproduces session 4's row at c6f606ad). `subjectLine` is on the
mammoth's rows 1–11 and bite 1's 1–5; the lead's running session and
descent-video's set their own, since their next `Stop` would overwrite an edit.
Still open: whether the rest of the ledger (≈520 rows on other branches) gets
one too — asked.

Left:

- Step 8's rest: the republish recipe in the lead's plan is the lead's to
  change, so it goes in the memo (below) rather than an edit here.
- `/polish`, then `/pr` refresh; replies on #255's T01, T12, T13, T15, T16, T17
  with the SHAs; a memo to the lead that the board's source moved
  (`pnpm board build docs/boards/island.yaml`, default out `tmp/board/island`,
  `sync docs/boards/island.yaml <rows> [<assets>]`) and that new cards go into
  the YAML, not `board/items/`.

## DRY notes

- **Reused:** `mergeItems`/`newerThan` keep serving the page's store and `sync`
  alike; the esbuild-with-tsconfig call follows the mushroom artifact build's
  shape rather than sharing code with it, since the two bundle different entries
  with different post-steps — a shared helper would be one function call wrapped
  in another.
- **Shared:** the `Item` schema is the one source for the codec, the page and
  `sync`; the YAML shape is derived from it per type, never redeclared.
- **Not extracted:** the line-limit test is one file; it has nothing to share.
