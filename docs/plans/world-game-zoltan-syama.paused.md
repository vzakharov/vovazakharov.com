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
  as the stickies are; a new zone does not line up with its neighbours.
  «стартовая точка слева, северная звезда максимально вправо, а всё остальное --
  между ними, типа как бы мы продвигаемся к ней. при этом вещи примерно одного
  уровня продвижения должны примерно на одном расстоянии по длине стрелки
  располагаться» — the board reads left to right along one arrow from the map
  straight to the north star through the middle, zones above and below it, never
  on it («стрелочка должна идти посередине, прямо от начала к звезде, а карточки
  -- сверху и снизу от неё»): the start (map, trace, forecast, inspiration),
  then what is done (calls, bite 0, the method), then what is in hand (the open
  bite and its decisions), then what is next (later bites), the north star
  rightmost. A zone sits in the column of its progress, and moves right as its
  work advances.
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
- «пересылай через memo» — whatever the lead passes to a member goes as a memo
  note on the member's branch, never by `send_message` alone.
- «каждое изменение артефакта снапшотить … Для каждого скриншота запоминать
  количество затраченных "часов", долларов API cost up until now, мб строк кода
  итп, чтобы потом наложить» — every board publish is a timelapse frame, and
  beside it in the release goes `NNNN-slug.json` with the figures to date,
  `python3 .claude/costs/contribution.py --at <time> --json`.
- «публиковать, когда появляется что-то интересненькое или значимое, неважно,
  про саму игру или наши обсуждения её … главное чтобы ты вообще не забывал про
  неё в пылу работы» — the lead republishes whenever something interesting or
  significant turns up, in the game or in the conversation; what counts is the
  lead's call. `.claude/hooks/board-notice.py` restates it on every prompt with
  the operator messages since the last publish.

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
- **The case study** — `sites/vova/public/case-studies/island.md`, unlisted
  while in progress (`hidden: true` keeps it out of listings, not off the site —
  «я не имею ничего против того чтобы wip был доступен на сайте»). Each entry is
  dated and carries a board snapshot, `assets/island-board-<date>.png`
  (`pnpm board snapshot`, resized to 2000 px wide). The first, "how it all
  began", holds the 3,120 h forecast by role, unchanged, for the comparison at
  the end.
- **The channel** — `scripts/memo/memo.py`, `--as lead|member`, `memo.md` in the
  bite branch's working directory; the lead waits on every open bite with one
  `wait --branch A --branch B`. Not built: a forward after a handoff (the
  predecessor's note on the lead's own branch is one only `show` reads, since
  `wait` prints the other side's notes).
- **The notes** — `.claude/skills/mammoth/notes/`, renamed from `megabeast`.
- **The human-contribution report** — every cost row carries `operatorWords` and
  `branchLines`, written by the Stop hook each turn (the four sessions before it
  back-filled on `cost-ledger`);
  `python3 .claude/costs/contribution.py [--at TIME] [--json]` sums the branch,
  and `pnpm contribution lines` gives the cumulative-flow CSV. A frame's sidecar
  is `contribution.py --at <its upload time> --json`; 0001–0003 have theirs,
  read at upload rather than capture, since all three went up together. The
  `.claude/costs/` change goes upstream to `vzakharov/muthur`.

- **Bite 1** — the thinnest descent from orbit to 2 m, `/island` under
  `src/island/`, its contract `docs/plans/world-game-zoltan-syama/bite-1.md`,
  its record `docs/plans/island-bite-1.completed.md`. Merged as #259 (19a4366c).
  Left for later bites: 10–20 km spits fray at orbit (orbit tiles are level 3);
  a cached tile keeps its detail cut until evicted; the lake by Цитадель is
  land; four `/dry` calls in #259's body await the operator. The coastline is
  too regular (operator, on the strait: «граница берега … слишком ровная»):
  `heightAt` fades every noise octave out within one wavelength of the coast, so
  the shore is the traced line at every scale, and the strait's authored sea
  stroke is a straight edge. A later bite roughens it below a pixel of the
  drawing (a sub-pixel warp of the coast field), so the drawn shape holds and
  the shore stops being a ruler.

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

- **Review of #255** — member session
  https://claude.ai/code/session_01DaohkBPPsH9jFCtdTa4Qb9 on `island/review-1`,
  handling T01–T10, T12–T20 and R02 (the cut cycle that replaced the epic
  branch); its PR goes onto this branch.
- **Descent video** — https://claude.ai/code/session_01DaohkEzVpgVdUpfbpg4NnQ on
  `island/descent-video`: a video of the descent and its thumbnail in the
  `island-timelapse` release; the lead pins them on the board.
- **Second preview slot** —
  https://claude.ai/code/session_01DaohkDZtwxJGQKbNecB8st on `preview2-slot`,
  its PR onto main: preview2.vovazakharov.com and `/preview live` choosing a
  slot.
- **Board performance** —
  https://claude.ai/code/session_01DaohkDwrHtJy2Zb6SucGnx on
  `island/board-perf`: the page measured and sped up, the look unchanged; the
  lead republishes from its merged code.
- **Controls** — https://claude.ai/code/session_01DaohkF3nmKHi8CHJ3ye7rL on
  `island/controls`: W/S forward and back, A/D strafe, ←/→ turn, ↑/↓ climb,
  right drag turns, an on-screen key hint (the operator's layout).
- The lead waits on all five:
  `memo.py wait --as lead --branch island/review-1 --branch island/descent-video --branch preview2-slot --branch island/board-perf --branch island/controls`.

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
