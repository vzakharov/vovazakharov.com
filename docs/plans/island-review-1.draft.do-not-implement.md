> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

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

## DRY notes

- **Reused:** `mergeItems`/`newerThan` keep serving the page's store and `sync`
  alike; the esbuild-with-tsconfig call follows the mushroom artifact build's
  shape rather than sharing code with it, since the two bundle different entries
  with different post-steps — a shared helper would be one function call wrapped
  in another.
- **Shared:** the `Item` schema is the one source for the codec, the page and
  `sync`; the YAML shape is derived from it per type, never redeclared.
- **Not extracted:** the line-limit test is one file; it has nothing to share.
