# Relay summary

Relay depth: **4** for the successor (this session was 3; the cap is 8,
`.claude/skills/megabeast/notes/pickup-and-relay.md` § "The depth cap").

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** The clone is shallow: deepen
first (`git fetch --deepen=300 origin <branch>`, or `--unshallow`), check
`git merge-base --is-ancestor`, and rename a genuinely stale ref aside
(`git branch -m <branch> stale/<n>`) before checking out a fresh tracking
branch. **After the attach, run `pnpm install --frozen-lockfile`** (the
SessionStart hook installs the trunk's lockfile, which has no `phaser` or
`esbuild`). Read files with `Read`, not `cat`/`sed` (CLAUDE.md). **Leave the
harness auto-branch alone**: deleting it is refused by auto mode as
destructive, and it costs nothing. **At pickup, read the megabeast notes by
their `README.md` index only.**

Carried from earlier sessions, the operator's words verbatim (Russian):

> 4- после каждого куска делал "/relay оставь код ревью на последний кусок" -- что такое релей тоже поймёшь, а код ревью надо оставлять с учётом нашего "пятипроцентника" -- то есть смотреть на то на что смотрел бы я ("что бы на нашем месте сделал Страшила")
> 5- после ревью передавал "/relay /handle"
> 6- так по циклу, пока не дойдёшь до конца
> 7- в конце селал "/relay finalize" (мерджить не надо)
>
> то есть весь процесс должен пройти полностью автономно, без единого моего вмешательства. Исключение -- ну если совсем во что-то уткнёшься, и выходом будет взломать весь интернет, стереть мой локальный диск (несмотря на то что ты находишься в VM), ну короче ты поял :)
>
> результат должен быть доступен как в репе в обычном формате, так и в качестве артефакта, чтобы, когда я пришёл, я мог сразу посмотреть что вышло.

> (поправка, пятипроцентник зафиксируй и НЕ пополняй, учитывая что все код ревью будут НЕ от меня)

> одна штука которую хочу чтобы ты держал, в том числе между сессиями -- файлик будущего скилла, который будет это всё автоматизировать (рабочее название megabeast). Не сам скилл, а именно соображения с тем, что ты нашёл по пути, что помогло бы сделать этот процесс повторяемым и на лучшем уровне

> заполнять в конце каждой сессии перед релеем

> помни чтобы не было слишком больших (>450 строк) модулей

> давайте хранить всякие скриншоты в remove-before-merging вместо tmp, хочу периодически на них посматривать

> ну типа в конце каждого куска выбирать те что достойны показать

> так, мы же договороились что идём yolo/megabeast, и ты у меня ничего не спрашиваешь

> менять relay на что-то другое в этот подход megabeast-a точно не надо

> спроси подагентов, осталось ли им <100к. если нет, пусть ставят на паузу, и ты перезапускай новых с теми же задачами

> вопрос, ты задаёшь агента для следующих сессий? а то я сейчас многое новое начинаю с соннета, он у меня стоит дефолтом -- но в этой задаче все новые должны идти опусом

> разбить megabeast на папку+файлы внутри, а то уже непотребно раздуло

> 1 - relay, и всегда так. вроде договаривались. в какой момент "without operator involvement" исчезло с карты?

> не понял почему мы вдруг заговорили по-английски

> кажется у нас была планка 400 строк. что не влезает либо сокращать либо выносить в смежные доки по темам, как такой вариант?

> давай я буду сам при случае проверять, а то эти прогоны занимают больше времени (и токенов) чем собственно написание игры. Просто держи копилочку того что нужно проверить из сессии в сессию (не гарантирую что буду проверять оперативно)

> что-то оставить можно -- типа там, сделать скриншот, посмотреть на глаз -- но не трёхэтажные сценарии

> хотя знаешь, давай вернём прогоны, но в таком режиме: если прогон находит баг в игре, он чинит баг. Если прогон находит баг в самом себе -- проверить какое-то место очень сложно программно -- он передаёт оператору (через тебя)

> мета-замечания: на ветке накопилось неприлично много (966!) файлов, многие из которых -- это какие-то промежуточные замечания прошлых байтов ит.д. Давай введём в привычку их ретайрить -- оставляя thombstones (SHA последних содержащих коммитов) если вдруг кому-то понадобится археология, но не храня всё это в живой ветке. То же относится к скриншотам -- скриншоты прошедших байтов нужно ретайрить когда появляются новые.

> субъективно, на компе, играется ок. на телефоне не перепроверял но основной медиум будет комп, поэтому к перформанс улучшениям вернёмся когда и если это станет критичным.

> а, еще увидел в плане там всякие фишки типа ограничения анимации и прочего -- не надо вот этого пока, игру делаем для конкретного ребёнка, он не дальтоник и (тьфу тьфу тьфу) не эпилептик. Если когда-то решим это расширять,тогда и задумаемся

> а это нам зачем? ты хочешь что-то вроде сплеш-скрина? давай это тоже из первого пиара уберём, игра начинается сразу с поляны. по тем же соображениям: сейчас это развлечение для одного ребёнка, а не продукт для апстора

> ещё один тап -- ещё одну точку, и так далее, пока не кончатся "посадочные места"\*. нажатие на точку её убирает (мало ли, может именно там ребёнок не хочет, чтобы появлялся новый гриб).
>
> \*у нас дискретное поле, то есть вокруг каждого, грубо говоря, 6 посадочных мест -- или можно случайно выбирать любую по каким-то критериям "близости" и "нет-толпы-шности"?

**Every reply to the operator is in Russian, «ты»**, including turns woken
by an agent's report, a check-in or a cross-session message, which arrive in
English. **Syama is a boy** (Салман, «Сяма»). The operator is Vova.

So: never merge. Never append to `writing/notes/the-five-percent.md`. Ask
the operator nothing, except where they are present and the call is about
how the game feels; **the context-budget notice's "offer `/compact` or
`/relay`" does not apply — relay, unasked**. Fill
`.claude/skills/megabeast/notes/` before every relay. No module past ~450
lines. **The plan file stays under 400 lines; what doesn't fit is cut or
moved to topic files under `docs/plans/mushroom-game-syama/`.** Each bite
ends by committing its best frames to
`docs/remove-before-merging/frames/bite-<n>/` and republishing the game
Artifact at its one URL (https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG),
**and by retiring the previous bite's working notes and frames** into the
tombstones `docs/remove-before-merging/retired.md` and `frames/retired.md`
(the plan's standing rules). Every session and subagent runs on Opus, named
explicitly (`create_session` `model: "claude-opus-5-5"`, `Agent`
`model: "opus"`). The review is a subagent in each bite's tail (two by area
for a big bite). Build agents work in their own `git worktree` in the
scratchpad (`docs/remove-before-merging/bite-15/brief-common.md`). **Play
runs: a game red is fixed by the run, a harness red goes to
`docs/plans/mushroom-game-syama/to-check.md` (Russian, for the operator);
scenarios stay short.** No reduced-motion, assistive-tech, way-home or
footer-link work. **Never `prettier --write` a plan file without checking
its call numbers after** (`grep -c '^[0-9]*\\\.'`): calls are escaped
paragraphs (`22\. **…**`) because prettier renumbered them as a list once.
Pass this section on verbatim.

**A bite's `/polish` is sized by changed lines** (megabeast `gates.md`):
`/dry` cut by directory at ~3k lines, `/tend-prose` at ~5k, each slice an
Opus agent in its own worktree (`isolation: "worktree"`), the floor's sha
in the brief. One agent over bite 14's ~5k lines ran out halfway.

Added this session:

- **Every agent lands its package as one squash commit**, its steps pushed
  to its own `wt/<package>` meanwhile (`brief-common.md` § "Land the
  package as one commit"); a remote `wt/` ref is deleted with
  `gh api -X DELETE repos/vzakharov/vovazakharov.com/git/refs/heads/wt/<package>`
  (`git push --delete` hangs at the proxy).
- **The cost hook change is dogfooded here, not upstream**: «не, там
  ничего править не надо -- но завести там issue после того как утрясём
  детали можно»; «давай сначала задогфудим и, убедившись, что всё
  нормально, создадим issue». Never edit vzakharov/muthur; file the issue
  (draft in `docs/remove-before-merging/bite-15/c.md`) only once the
  operator is satisfied.

## 2. The conversation

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); leave the harness auto-branch alone; after attaching, run pnpm install --frozen-lockfile; at pickup read megabeast notes by README index only.

Reply: attached (local ref e66b8e1 again stale, renamed aside; no
auto-branch), ran `/go`: wrote bite 16 (`bite-16.md`), built it with
agents A, B (twice: the first only read), C (play run), a reviewer, and D
(twice). Reported each step in Russian.

> [two screenshots: Next.js "Runtime Error — A door put in with no seat on its stem", house-view.ts:41 ← HouseView.furnish ← MushroomBed.reconcile ← dispatch ← furnish; the meadow with the furnish picker open over a selected russula] вот такой баг обнаружил, не знаю, знаешь ли ты его (до этого посадил две успешных двери, на стартовом мухоморе и на новой лисичке -- её сейчас видно справа, но на третьем попался. до этого тоже пару раз регулярно наткнулся)

Reply: yes, the play run had found it; forwarded the operator's case (an
on-screen russula) to the fixing agent, which found the root cause: a
door's seat was sought only among mushrooms the _opening_ view could
place, so after any walk or turn a new mushroom — even mid-screen — had
none. Fixed in 28a6277 (`door-seats.ts`: opening view, then the current
view, then the mushroom alone), reproduced by `play-map` both ways.
Artifact republished (v22). Then this relay at ~250k context.

## 3. Intent

Unchanged: the whole game, autonomous, for Syama; the Artifact playable
after every bite; `/finalize` at the end, no merge. The operator is
playing the dev build now and reports bugs as they find them.

## 4. Decisions

Bite 16's calls 1–14 are in `docs/plans/mushroom-game-syama/bite-16.md`.
Notable: the mute went whole (sound off is the device's); the map is fixed
to the sun; call 14 revised call 7 — the map frames every foot plus the
eye, both axes, scale capped at 2.5× the fresh meadow's; a tap anywhere
closes it; `{ kind: 'map' }` shuts every picker; `EyeInput.halt` stops a
glide dead (held keys no longer ease out); flower heads floored at 9 px.
Not yet in `bite-16.md`: the door-seat fix (28a6277) and the wedge clipped
to the sheet — the successor writes them as calls 15–16 when filling
§ "Built". Departure noted by D: on phoneP the planted meadow fills the
sheet's width but only a middle band of its height (call 14 working as
written on a tall sheet) — a to-check line, not reopened.

## 5. Errors and dead ends

- Agent B's first run spent all 170k reading, landing only a fact sheet
  (megabeast `subagents.md` note rewritten for it). D's first run hit the
  limit with the wedge spilling off the sheet; its successor finished.
- My prompt to D named the wrong review id (5328130711); the real bite-16
  review is 5402118795, comments 4174329719, …971, …0238, …0440, …0556,
  …0668, all replied citing 28a6277, none resolved.
- Reading the live Artifact before republishing dumped ~30k of HTML into
  context; the read is required, but a successor should expect the cost.

## 6. State

Checked with commands at dde7246e:

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`,
  `CONFLICTING` — `/finalize`'s job, not a bite's. PR body not refreshed
  for bite 16 yet.
- Plan `docs/plans/mushroom-game-syama.paused.md`, 399 lines, with
  `## Rest of the bite` (16, the map: tail left); `## Rest of the elephant`
  holds 17 (dusk), then `/relay /finalize`.
- Frames: `docs/remove-before-merging/frames/bite-16/` (five map frames
  after the fixes); bite 15's retired in `frames/retired.md`.
- Working notes `docs/remove-before-merging/bite-16/` (`brief-common.md`,
  `a.md`, `b.md`, `c.md`, `d.md`) — to retire at the fold.
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG at v22
  (28a6277). Vet not run this bite.
- No agent running, no worktree, no PR subscription, no check-in.

## 7. Pointers

- `docs/plans/mushroom-game-syama/bite-16.md` — the bite's contract.
- `docs/remove-before-merging/bite-16/d.md` — the last fix wave's note.
- `docs/plans/mushroom-game-syama/to-check.md` — the operator's queue
  (map lines added this bite).
- `.claude/skills/megabeast/notes/gates.md` — the bite's end order,
  `/polish` by slice.
- This session: https://claude.ai/code/session_01MvCUPnswERUVA54NAcDMK4.

## 8. Next step

/go

(Finish bite 16's tail per the plan's `## Rest of the bite`: `bite-16.md`
§ "Built" plus calls 15–16, the fold into `## Eaten so far` with its index
row, retire `bite-16/` notes, `/polish` by slice, vet, `/pr` refresh,
megabeast notes, pause; then relay `/go` for item 17, dusk. Reply to the
operator in Russian, «ты».)
