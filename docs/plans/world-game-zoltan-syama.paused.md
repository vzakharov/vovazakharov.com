# Island — exploring the world Zoltan and Syama drew

**The plan is the board**, a copy per claude.ai organization the operator works
from, since an artifact is seen only by the account that published it
(`.claude/hooks/board-notice.py` names a session's own):

- `f4b0caba8fa8`: https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P

Every copy is built from `src/island-board/app/config/` (a YAML file per zone),
and each syncs its `db` back there before it is republished. The north star, the
calls everything else stands on, how the mammoth is eaten, the studio forecast
and the open bites are stickers there and nowhere else. This file keeps only
what `/go` needs to resume: the gate name, the standing rules, what is eaten and
the bite in hand. The text it held before the board took over is in git
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
  that is how 686f5174 merged bite 1 into this branch and closed #256, and
  `.claude/hooks/git-pull-guard.py` now refuses one. No subagent works in the
  lead's checkout while a `memo.py wait` is armed; it gets a worktree. A merge
  commit naming a branch other than the one being integrated is not pushed.
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
- R02, settled in chat after «давай создадим ветку epic/island-part-1» — no epic
  branch: the mammoth lives on `island/stretch-N` (#266 for stretch 2; stretch 1
  was #255) and reaches `main` through cuts, `island/cut-N`, each finalized and
  squashed while bites keep landing on the stretch. After a squash the next
  stretch starts off `main`, carrying `docs/plans/` and
  `docs/remove-before-merging/` in one commit; members branch off and merge into
  the current stretch. The plan, board and relays are swept from a cut only.
  `.claude/skills/mammoth/notes/gates.md` carries the cycle.
- «публиковать, когда появляется что-то интересненькое или значимое, неважно,
  про саму игру или наши обсуждения её … главное чтобы ты вообще не забывал про
  неё в пылу работы» — the lead republishes whenever something interesting or
  significant turns up, in the game or in the conversation; what counts is the
  lead's call. `.claude/hooks/board-notice.py` restates it on every prompt with
  the operator messages since the last publish.
- «всё что мы отсюда начинаем должно идти сюда, вне зависимости от его
  "полезности" для мейна» — every member's PR started from this work targets
  this branch, never `main`, and the lead merges it here; a PR opened against
  `main` is retargeted (`gh pr edit <n> --base <this branch>`).
- «где я их прикладываю, скорее всего значит с ними» — screenshots the operator
  attaches to something meant for the board go on the board with it, as images
  beside its sticky.
- «давай держать сессии лида до последнего (300к), а то слишком много скачков» —
  a lead session relays at 300k of context and not before: a priced context
  budget notice under 300k is noted and the work carries on.
- «треды сам не закрывай, ок? принцип тот же что и с код-ревью» — the lead
  answers a board comment thread and never resolves it; resolving is Vova's. A
  reply there carries no `Generated by` footer — the board already shows it as
  Claude's; the footer is GitHub's, where a reply would otherwise read as his.
  «нам же и количество слов человека в тредах тоже надо считать» — the turn that
  reads a new board comment of Vova's adds it to
  `src/island-board/app/config/island/threads.json` (`<thread id>@<minute>` →
  body verbatim, his only), runs
  `python3 .claude/costs/post_words.py --kind thread < src/island-board/app/config/island/threads.json`
  and commits the file.
- «/sync-branch из каждого куска -- ага» — a member ends its bite with
  `/sync-branch` against its PR's base, this branch, before pinging green, so
  the lead's merge lands without conflicts.
- «кажется, никто из агентов не прогоняет свой polish? не дело … на будущее
  пусть озадачиваются этим сами» — a member runs `/polish` over its own diff
  (its commits, and `/five-percent`'s review on its PR) before `/sync-branch`
  and the green ping, and every brief says so in its "done means". The lead
  merges no member PR without `polish:` commits on it.

## Eaten so far

- **The board** — the app `src/island-board/`, its tooling
  `src/island-board/scripts/board.ts`
  (`pnpm board build | sync | refile | snapshot`, usage atop the file); its
  content `src/island-board/app/config/island.yaml` and a YAML per zone with the
  images in `src/island-board/app/config/island/`. Light in every theme; Caveat
  for zone titles and line labels, Shantell Sans for the notes. Not yet seen: an
  edit made in the page itself by the operator.
- **To republish**: sync first — `ArtifactData list items` with
  `out_dir: tmp/board/rows`, then
  `pnpm board sync src/island-board/app/config/island.yaml tmp/board/rows` —
  then `pnpm board build src/island-board/app/config/island.yaml` and publish
  `tmp/board/island/index.html` with `files` mapping `images/*` to the built
  copies and `url` the artifact above. Only the lead publishes.
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
- **Controls** — #260, merged by fast-forward (1035c167): W/S forward and back
  along the heading, A/D strafe, ←/→ turn (80°/s, eased), ↑/↓ climb beside
  PageUp/PageDown and Q/E; right drag and a two-finger twist turn; a key hint
  bottom-left that fades after first use. Open for the operator: the member's
  `/five-percent` suggests collapsing the hint to a `?` button rather than
  hiding it for good.
- **Cut 1** — #265 squashed into `main` as 4e2a4efb: bite 1 and the controls
  live at `/island`.

- **Bite 2 — worlds from one formula** — contract
  `docs/plans/world-game-zoltan-syama/bite-2.md`; #267 merged into
  `island/stretch-2` as 28d4c8e5. Every world, ours included, is a dome plus 128
  harmonics; world 1 is fitted to the drawing through `mask.json`. The strait
  closes. The coast tracer and fit are retired
  (`src/island/entities/coast.retired.md` brings them back to re-fit world 1).
- **Flicker fix** — #268 merged into `island/stretch-2` as 4e4710b7: the scene
  draws the last selection whose tiles are all held until the new one is, so a
  turn or climb no longer shows a blank or coarse frame (the frame-by-frame
  replay is in #268's body).

## Waiting on the operator

The open questions are relay 20's list
(`docs/remove-before-merging/world-game-zoltan-syama-hodowq/relay-20.md` § "Next
step"), less the world-number fork, which bite 2 settles.

## Open bites

None in hand.

## Next bites

- **Objects from dice rolls** — agreed on the board's strait thread («да,
  согласен»): after the base formula, a chain of seeded rolls, each placing a
  water object with harmonics at its own scale; lakes first, the strait as two
  lakes touching each other and the sea, and later rivers and mountains by the
  same mechanism. World 1's rolls are fitted to the mask as the harmonics are
  today. Bite 2 lands with the strait closed; this bite lays over it.
- **Earth as world #0, on a round world** — taken on («я хочу чтобы мы и взялись
  за это же»). Land is defined over the whole sphere, not on the one flat patch
  `src/island/shared/globe/globe.ts` lays on it («как бы я ни любил Пратчетта,
  для нас всё же хочу чего-то менее магического»); a mask per pinned world (#0
  Earth, #1 ours); parameters named rather than indexed, «строго типизированный
  интерфейс … чтобы мы … не заблудились в строках». The rationale is on the
  board's infinite-worlds zone. Its order against objects from dice rolls is
  open.

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
