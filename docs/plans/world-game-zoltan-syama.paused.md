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
  (`ArtifactComments` `watch`) and opens it (`Artifact` `open`, the only call
  that lists it in the session), and one that hands it on stops its watch
  (`on: false`) before the successor starts, so exactly one session is woken by
  the board at a time. «не дело что раз за разом сессии лида об этом забывают» —
  `.claude/hooks/board-notice.py` names either call on every prompt until the
  session has made it.
- «и надо на английском, будем же шарить в таймлапсе (то что уже выложил и
  сфоткал отменять не надо, это тоже часть процесса)» — everything on the board
  is in English, the operator's own words translated; a frame already published
  and captured stays as it was.
- «вмещающие прямоугольники … опять становятся слишком правильными и скучными по
  расположению» — zones are placed off any grid, staggered and unequal in size,
  as the stickies are; a new zone does not line up with its neighbours. «я бы
  ещё их располагал условно вокруг исходной идеи (пока есть место) -- чтобы она
  оставалась как бы в центре» — the zones ring the map, title above it, and a
  new one takes the next free place around that ring while there is one.
- «надо postmortem и standing constraint чтобы этого избежать» — no `git pull`
  on this branch or a bite's, `--ff-only` included: integrate with
  `git fetch origin <b> && git merge origin/<b>`, naming the ref. A pull merges
  whatever `FETCH_HEAD` holds, and any fetch in the checkout can rewrite it —
  that is how 686f5174 merged bite 1 into this branch and closed #256
  ([postmortem](world-game-zoltan-syama/postmortem-686f5174.md)). No subagent
  works in the lead's checkout while a `memo.py wait` is armed; it gets a
  worktree. A merge commit naming a branch other than the one being integrated
  is not pushed.
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
- «давай заведём правило, что артефакт может править только оркестратор
  ("продюсер"?)» — only the lead, in its producer role, edits or publishes the
  board; members propose through memo.
- «каждое изменение артефакта снапшотить … Для каждого скриншота запоминать
  количество затраченных "часов", долларов API cost up until now, мб строк кода
  итп, чтобы потом наложить» — every board publish is a timelapse frame, and
  beside it in the release goes `NNNN-slug.json` with the figures to date,
  `python3 .claude/costs/contribution.py --at <time> --json`.

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
- **The channel** — `scripts/memo/memo.py`, `--as lead|member`, `memo.md` in the
  bite branch's working directory; the lead waits on every open bite with one
  `wait --branch A --branch B`. Not built: a forward after a handoff (the
  predecessor's note on the lead's own branch is one only `show` reads, since
  `wait` prints the other side's notes); `send_message` stays the wake.
- **The notes** — `.claude/skills/mammoth/notes/`, renamed from `megabeast`.
- **The human-contribution report** — every cost row carries `operatorWords` and
  `branchLines`, written by the Stop hook each turn (the four sessions before it
  back-filled on `cost-ledger`);
  `python3 .claude/costs/contribution.py [--at TIME] [--json]` sums the branch,
  and `pnpm contribution lines` gives the cumulative-flow CSV. A frame's sidecar
  is `contribution.py --at <its upload time> --json`; 0001–0003 have theirs,
  read at upload rather than capture, since all three went up together. The
  `.claude/costs/` change goes upstream to `vzakharov/muthur`.

- **Bite 1 is out** — the thinnest descent from orbit to the ground, its
  contract `docs/plans/world-game-zoltan-syama/bite-1.md`, built by its member
  on `island/bite-1-descent` (PR #256 closed as merged when 686f5174 put its
  head into this branch; the member opens a fresh PR onto this branch at the
  bite's tail).

## Waiting on the operator

Bite 0 is done and polished (floor 89eefbc2); the pause is for the operator's
review. Open:

- `/five-percent`'s two alternatives on #255
  (https://github.com/vzakharov/vovazakharov.com/pull/255#pullrequestreview-5805174087):
  the board and the map live under `docs/plans/`, which `/finalize` sweeps
  (optional); the case study's three misstatements about what is counted
  (critical).
- The branch's line count is written twice, `scripts/contribution/lines.ts` and
  `.claude/costs/lib/branch_lines.py`; the lead recommends the TS calling the
  Python.
- Merge 686f51740 brought bite 1's own files early (a polling fetch's
  `FETCH_HEAD`, fixed in 17337b17); left in place, since they arrive at the
  bite's merge anyway.

## Open bites

- **Bite 1** — member session
  https://claude.ai/code/session_01DaohkDTq595n9RkxwUJ8bc, on Opus; the lead
  waits on it with `memo.py wait --as lead --branch island/bite-1-descent`. When
  it posts done: look at its frames beside the map, run vet on its head, merge
  it into this branch, `/preview live`, tick its stickers.

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
