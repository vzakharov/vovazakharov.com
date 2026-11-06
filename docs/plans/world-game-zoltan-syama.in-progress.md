# Island — exploring the world Zoltan and Syama drew

**The plan is the board**: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P,
built from `docs/plans/world-game-zoltan-syama/board/` (one JSON file per item).
The north star, the calls everything else stands on, how the mammoth is eaten,
the studio forecast and the open bites are stickers there and nowhere else. This
file keeps only what `/go` needs to resume: the gate name, the standing rules,
what is eaten and the bite in hand. The text it held before the board took over
is in git
(`git show 2ecc10e8:docs/plans/world-game-zoltan-syama.in-progress.md`).

## Standing constraints

- «не забудь взять артефакты и отключаться когда будешь передавать (standing
  constraint)» — a session that picks this work up watches the board artifact
  (`ArtifactComments` `watch`), and one that hands it on stops its watch
  (`on: false`) before the successor starts, so exactly one session is woken by
  the board at a time.
- «не забывай скриншотить каждый значимый вариант (промежуточные поиски цели
  можно не учитывать) для будущего таймлапса -- сохраняй их прямо
  [000N]-[slug-if-needed].png куда-нить; если большие можно в релиз вместо репы»
  — every significant variant, of the board and later of the game, is captured
  and uploaded to the `island-timelapse` prerelease
  (`gh release upload island-timelapse <file>`), numbered on from the highest
  there (`gh release view island-timelapse --json assets -q '.assets[].name'`).
- «очень важно следить, чтобы он не разрастался непотребно и вовремя его
  разбивать на collocated подобласти» — this file stays a page. A bite's
  contract, a member's notes, anything with a home of its own goes in a file
  under `docs/plans/world-game-zoltan-syama/`, and this file points at it.

- «увидел "[имя репозитория]" на скрине, нигде это упоминать не надо» — the
  private repo the memo tooling is ported from is never named, anywhere.

## Eaten so far

- **The board** — `scripts/board/`: `model.ts` (schema, merge), `page/` (the
  client, bundled into one page; `hand.ts` gives every item its hand-drawn tilt,
  tape and line curve from its id), `board.ts`
  (`pnpm board build | sync | snapshot`). Light in every theme; Caveat for zone
  titles and line labels, Shantell Sans for the notes. Not yet seen: an edit
  made in the page itself by the operator.
- **To republish**: sync first — `ArtifactData list items` with
  `out_dir: tmp/board/rows`, then
  `pnpm board sync docs/plans/world-game-zoltan-syama/board tmp/board/rows` —
  then `pnpm board build docs/plans/world-game-zoltan-syama/board` and publish
  `tmp/board/world-game-zoltan-syama/index.html` with `files` mapping `images/*`
  to the built copies and `url` the artifact above. Only the lead publishes.
- **The case study** — `sites/vova/public/case-studies/island.md`,
  `hidden: true` until the game ships. Each entry is dated and carries a board
  snapshot, `assets/island-board-<date>.png` (`pnpm board snapshot`, resized to
  2000 px wide). The first, "how it all began", holds the 3,120 h forecast by
  role, unchanged, for the comparison at the end.

## Rest of the bite — bite 0, the lead's own

2. **`scripts/memo.py`**, ported with its traps intact; sides `lead`/`member`,
   one channel per branch, `wait` over several branches. An operator message
   reaching a session after it handed off is written into the branch's memo, for
   the record, and the successor woken by `send_message`, which a memo cannot
   do.
3. **`.claude/skills/megabeast/` → `.claude/skills/mammoth/`**, every pointer
   with it.
4. **The human-contribution report** — partly eaten: `pnpm contribution lines`
   gives the cumulative-flow CSV, and every cost row now carries `operatorWords`
   and `branchLines` (the Stop hook writes them each turn, so
   `git log cost-ledger` on a row is their curve). Left: the report reading
   them, and back-filling the four sessions before the hook — counted once at
   1,317 words from the server transcripts, in `tmp/` only. The `.claude/costs/`
   change goes upstream to `vzakharov/muthur`.
5. **The first step toward the star** and its member — likely the thinnest
   descent from orbit to the ground; its contract a file beside this one.

## Rest of the elephant

On the board: the north-star zone, and the bites' stickers once they exist.

## DRY notes

- **The board is the only home of the plan's content**; the case study quotes it
  through snapshots rather than copying stickers.
- **One merge function** serves the page's overlay of db rows and `board sync`.
- **The hand-drawn look is one pure module** (`page/hand.ts`), so the page and
  any later renderer of the board draw an item the same way.
- **memo.py is a port, not a share** — its source is another repo with other
  sides; if lead/member proves itself, it goes upstream to `vzakharov/muthur`.
- **The tracer, when it comes, is one TypeScript module** run by the build and
  by the browser alike.
