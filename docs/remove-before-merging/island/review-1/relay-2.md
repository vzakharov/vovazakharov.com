# Relay 2 — island/review-1

## Standing constraints

Carried from relay 1 and `docs/plans/world-game-zoltan-syama.paused.md` §
"Standing constraints" (the lead's plan; read it whole):

- No `git pull`, ever — integrate with
  `git fetch origin <b> && git merge origin/<b>`. A hook refuses `pull`.
- Only the lead publishes or edits the board artifact
  (https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P). Change the board's code
  and source freely, never publish; propose content changes with
  `python3 scripts/memo/memo.py post --as member --branch island/review-1 "<text>"`.
- The private repo the memo tooling is ported from is never named.
- Everything on the board is in English.
- From the original launch prompt: the PR goes onto
  `claude/world-game-zoltan-syama-hodowq`, not main (#258); reply on #255 in
  Russian per CLAUDE.md § "GitHub comments"; never resolve a thread; run on
  Opus throughout; when done or blocked, post a memo — the lead waits on it.
- The muthur sync offer was made; do not make it again. (This session never
  made it, but a predecessor's summary line stands for the whole chain.)

## The conversation

1. Launch: `/relay take island/review-1 — ревью #255 разобрано, план доски-аппа
одобрен и ждёт стройки`. → Attached, read relay 1, set the estimate,
   flipped the plan quoting the go-ahead «а, да, ок, приступай» (5f62ecc7),
   merged the base in (the lead had added cards), and built steps 1–6 of the
   plan (bf080539). The context budget warning then came at ~258k; the work
   left would not fit, so the plan was paused (f683cd22) and this relay
   written.

No operator message arrived during this session.

## Intent

All of #255's review handled on this sub-branch without holding up the lead.
What remains is the tail of the board-as-app plan, which the operator approved.

## Decisions

- **`board` hangs off `scene`** in `src/masd.json`, for the plane types.
- **The YAML codec lives in `src/board/scripts/lib/board-file.ts`**, not the
  entity the plan named: only the script reads the file, and the page bundle
  stays free of `yaml`.
- **`pages/board` is three sub-slices** — `camera/`, `drawing/` (render, hand),
  `canvas/` (everything else) — because `masd:clusters` found render+hand a
  cluster. Beat: a `masd-disable cluster` marker, which needs the operator.
- **The page is one `Board` object** (`canvas/model/board.ts`) every module
  takes, replacing `main.ts`'s module-level `let`s. `showStatus` takes the
  status node, not the board, because the store reports its first status
  while the board is still being built.
- **The page entry is inline in the script** (`stdin`, as the mushroom build
  does), so `knip.ts` names `src/board/pages/board/index.ts` and
  `src/board/app/styles/board.scss` as entries.
- **An image item keeps `src:`** beside `box`; the file's `title` is `Island
board`, the page `<title>` unchanged.
- **The default build output is now `tmp/board/island`** (named after the
  YAML), where it was `tmp/board/world-game-zoltan-syama`.

## Errors and dead ends

- The hook steering file reads/writes to `Read`/`Write` refuses `cat >`,
  `head`, `sed -n`; `BATCH_EDIT=1` in front passes a deliberate batch.
- `yaml`'s `toString` pads flow sequences (`[ a ]`) where prettier does not;
  `flowCollectionPadding: false` makes `writeItems` a fixed point.
- Moving the page into `src/` brought the repo's strict lint
  (`unicorn/consistent-destructuring`, `vova/no-redundant-property-copy` —
  `pick` from `@/kernel/shared/lib/collections` answers it,
  `require-atomic-updates` — answered by splitting `startBoard` into
  `drawBaked`, `live` and `goLive`).
- knip flagged `scripts/contribution/lines.ts`'s exported `Commit` (from an
  earlier commit on this branch); it is unexported now.

## State

- Branch `island/review-1`, PR #258 (draft) onto
  `claude/world-game-zoltan-syama-hodowq`. Last pushed: see `git log -1`
  (f683cd22 when written, plus this summary's commit).
- Plan: `docs/plans/island-review-1.paused.md`, its `## Progress` section
  listing what is done and what is left.
- `./scripts/vet.sh` not yet run. Local: tsc, ESLint on `src/board`, knip,
  Steiger, `check:masd`, `check:cycles`, `masd:clusters`, `check:poison`,
  prettier, and the board's 28 tests green.
- Board watch: this session watched the artifact; it stops before the
  successor starts.
- Estimate: this session revised to its part — 7 h senior developer (the move,
  the split, the codec), 1.5 h senior qa (decode equality and the pixel diff).
  Remainder handed on: ~2.5 h senior developer — the line-limit test with its
  allowlist, the polish passes, the PR refresh and six thread replies.

## Pointers

- `docs/plans/island-review-1.paused.md` — the plan and its `## Progress`.
- `src/board/` — the app; `src/board/scripts/board.ts` the CLI
  (`pnpm board build|sync|snapshot`), `scripts/lib/board-file.ts` the codec.
- `docs/boards/island.yaml`, `docs/boards/island/` — the board's source.
- `docs/pr/255/pr.md` — the review (`python3 scripts/export-github-item.py 255`
  re-takes it).
- `docs/remove-before-merging/island/review-1/relay-1.md` — the session before.
- This session: https://claude.ai/code/session_01DaohkC16SqoT9rUiFqT3UP

## Next step

Resume the paused plan through `/go` Step 1 (go-ahead given and quoted in
5f62ecc7): build step 7, the line-limit test — any tracked text file over 400
lines fails, today's offenders frozen in a shrink-only allowlist each at its
current length, generated and data files excluded by pattern (the plan's §
"The line limit"). Then `/polish`, `/pr` refresh, replies on #255's T01, T12,
T13, T15, T16, T17 with the SHAs (Russian, the SHA bare), and a memo to the
lead: the board's source is `docs/boards/island.yaml` (images
`docs/boards/island/`), build with `pnpm board build docs/boards/island.yaml`
(out `tmp/board/island`), sync with
`pnpm board sync docs/boards/island.yaml <rows> [<assets>]`, and new cards go
into the YAML, not `board/items/` — plus the republish recipe in the lead's
plan is theirs to repoint.

## Last agent turn

`scripts/relay-last-reply.py` appended nothing: "no turn before this one wrote
any text" — the whole session was the one launch turn, which also ran this
relay. Its chat text was progress lines only; the commits above carry what it
did.
