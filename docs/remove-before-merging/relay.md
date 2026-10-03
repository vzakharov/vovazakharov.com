# Relay summary

Relay depth: **5** for the successor (this session was 4; the cap is 8,
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

Added in earlier sessions:

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

Added this session:

- **On any resume, check `git worktree list` and remote `wt/*` refs
  first**: a container restart killed a background agent mid-work, silently.
- A stale remote `wt/g37` (73692aeb) is from an earlier bite; not this
  session's, left alone.

## 2. The conversation

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); leave the harness auto-branch alone; after attaching, run pnpm install --frozen-lockfile; at pickup read megabeast notes by README index only.

Reply: attached (local ref e66b8e1 stale, renamed aside), `/go` on bite
16's tail: wrote § Built and calls 15–16, folded the bite into the plan
(index row 17), retired `bite-16/` notes, launched a `/dry` agent.

> [screenshot of the previous session's door-crash explanation] объяснение из предыдущей сессии. не очень понимаю, почему оно ищется ещё где-то, кроме выделенного гриба? но даже если и не на нём, то не понимаю, почему оно ищется *сначала* с первой точки? первая точка -- вроде никакая не особенная

Reply: the door always goes on the selected mushroom; what is searched is
the spot on its stem that neighbours in front don't hide, and "in front"
depends on the viewpoint. Opening-view-first was a leftover from before
12b; agreed it is wrong, to be fixed: seat from the current view only.

> [screenshot of the open map: bare paper, orange cross] и вопрос по карте: она и предполагается, что останется с таким никаким фоном? и ещё кнопка закрытия выглядит аляписто, и закрываться должна по эскейпу тоже

> хм, что это всё остановилось?

Reply: a container restart killed the `/dry` agent; rescued its work
(4df67fb on `wt/dry16`), relaunched; recorded calls 17–19 (door from the
current eye, the map a meadow from above, a plain ink close cross,
Escape) and launched package E after the `/dry` landed (aca95c5).

> хорошо, и ещё, с червячком (отличная работа!) окна то ли перестали открываться, то ли они никогда и не открывались, но логично, конечно, чтобы червячок лез не из закрытого окна в закрытое :)

Reply: they never opened (no open state); call 20, package F in
parallel. F landed 32f8a533, E landed 710f170a (after one agent ran out
and a successor finished). Artifact v23 published; then this relay at
the 200k budget line.

## 3. Intent

Unchanged: the whole game, autonomous, for Syama; the Artifact playable
after every bite; `/finalize` at the end, no merge. The operator is
playing the Artifact and sending asks as they come; each becomes a
numbered call in the open bite's file before its agent launches.

## 4. Decisions

Bite 16's calls 1–20 in `docs/plans/mushroom-game-syama/bite-16.md`; its
§ Built lists each package (A–F, `/dry`) with commits and the open
decisions each agent took (the worm comes out 0.2 s after the tap; the
map's door at the station nearest its seat's height; the wedge a
warm-white veil). Not yet in the plan's summary (`## Eaten so far`):
calls 17–20 — that is in § Left.

## 5. Errors and dead ends

- The first `/dry` agent died in a container restart with uncommitted
  work; the session did not notice until the operator asked.
- Package E's first agent hit 170k with call 19, plays and landing left.
- The Artifact publish was refused twice (normal: the saved live copy
  must be read, then an unchanged resend goes through).

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`,
  `CONFLICTING` (`/finalize`'s job). PR body not refreshed for bite 16.
- Plan `docs/plans/mushroom-game-syama.paused.md` (398 lines),
  `## Rest of the bite` pointing at `bite-16.md` § "Left".
- Frames `docs/remove-before-merging/frames/bite-16/` (map on its meadow,
  close cross, door on the map, windows open).
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG at v23
  (710f170a). Vet not run this bite.
- No agent running, no worktree, no PR subscription, no check-in.

## 7. Pointers

- `docs/plans/mushroom-game-syama/bite-16.md` — calls, Built, Left.
- `docs/plans/mushroom-game-syama/to-check.md` — add: the cross window
  never opened in a play; the map's mottles read large on a phone.
- `.claude/skills/megabeast/notes/gates.md` — the bite's end order.
- This session: https://claude.ai/code/session_017g9ZLR6Hg9A6K8tx4u3kJx.

## 8. Next step

/go

(Finish bite 16 per `bite-16.md` § "Left": the module splits, `/tend-prose`
over `8abc5a6..HEAD` then the bare `polish:` mark, vet, the plan's summary
for calls 17–20, the two `to-check.md` lines above, `/pr` refresh,
megabeast notes, pause; then relay `/go` for item 17, dusk. Reply to the
operator in Russian, «ты».)
