# Relay summary

Relay depth: **2** of the chain the operator started at depth 1
(`.claude/skills/megabeast/notes/pickup-and-relay.md` § "The depth cap": 8).

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** The clone is shallow: deepen
first (`git fetch --deepen=300 origin <branch>`), check
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
`model: "opus"`). The review is a subagent in each bite's tail, except
12b, a structural bite, which keeps a review session of its own. Build
agents work in their own `git worktree`
(`docs/remove-before-merging/bite-12b/brief-common.md`). **Play runs: a game
red is fixed by the run, a harness red goes to
`docs/plans/mushroom-game-syama/to-check.md` (Russian, for the operator);
scenarios stay short.** Pass this section on verbatim.

## 2. The conversation

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); leave the harness auto-branch alone; after attaching, run pnpm install --frozen-lockfile; at pickup read megabeast notes by README index only.

The relay's launch line. Reply (Russian): attached, installed, plan flipped
(6f1e193); the tail went out as agents one step each.

> мета-замечания: на ветке накопилось неприлично много (966!) файлов, … То же относится к скриншотам -- скриншоты прошедших байтов нужно ретайрить когда появляются новые.

(Verbatim in § 1.) Reply: retired bites 4–12's notes (85 files) and frames
(340) in df30548, 966 → 437 files, tombstones naming 6f1e193a9f; kept
`bite-12b/`, `ideas/` (the map's spec), `deepgram/` (the dictation skills
read it); the habit written into the plan's standing rules and
megabeast `gates.md`.

The rest of the session was agent reports and check-ins, answered with
short Russian status lines; no further operator message.

## 3. Intent

Unchanged: the whole game, autonomous, for a six-year-old boy; the Artifact
playable after every bite; `/finalize` at the end, no merge. Bite 12b's
tail is nearly done; then 12b's own review session, then bite 13 (rain).

## 4. Decisions

Every call is in `docs/remove-before-merging/bite-12b/waves.md`
§ "The tail, continued (relay depth 1)". The ones a successor would
re-litigate:

- **A flier's body turns by its drawn step, measured unsunk** (70fc342,
  2d5283a): the screen's bend near the sides and over the grass is
  followed; the brow's sink past `D_SEE`, which mirrors rows, is not — a
  one-frame spin is worse than a far sinking flier pointing along its
  flight.
- **The flight watch judges what a child can see**: no heading past the
  brow, none whose window's first or middle frame is off screen; next, the
  turn rate only while the body's middle is on screen.
- **Harness reds loosened, each with a to-check.md line**: `DASH_SLACK`
  1.25 (a bee darting off a flower at 1.22 of its curve); the cap-rest wait
  a minute; the walk's pop check passes over changes past a side;
  `veer` notes a bee kept off the one planted flower by butterflies.
- **Multi-second stalls and a 47 ms median in `approach` are the
  container's** while other agents run tests (every frame kind equally
  slow); re-run on a quiet container, not traced.
- **Retiring**: one tombstone row per directory, the SHA the last commit
  that held it.

## 5. Errors and dead ends

- `/polish` over 12b's range took four agents, each stopping at 170k; the
  first's bare `polish:` commits moved the lookup's floor past unreviewed
  work (megabeast `gates.md`).
- A container restart stopped tail-turn mid-fix; `SendMessage` resumed it
  whole (megabeast `subagents.md`).
- 70fc342's credited cause (skim and lay) was wrong; the bend was the
  brow's mirror, corrected in `tail-face.md`.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`,
  `CONFLICTING` (reported, `/finalize`'s job); 459 files against `main`.
- Plan `docs/plans/mushroom-game-syama.paused.md`; `## Rest of the bite`
  lists what is left.
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG still at bite
  12's version.
- No agent running, no worktree but the shared one, no PR subscription; a
  stale `send_later` check-in may fire into the old session, harmlessly.

## 7. Pointers

- `docs/remove-before-merging/bite-12b/waves.md` — every report and call.
- `tail-turn.md` beside it — § Left is the next agent's brief;
  `tail-phoneL.md`, `tail-phoneP.md` — the screen-run template.
- `docs/plans/mushroom-game-syama/to-check.md` — the operator's hand checks.
- Frames: `docs/remove-before-merging/frames/bite-12b/`.
- `scripts/build-mushroom-artifact.ts` — the Artifact build.
- This session: https://claude.ai/code/session_013gbeQFTor1ThDoWwaDK59j

## 8. Next step

`/go` — the rest of bite 12b's tail, from the plan's `## Rest of the bite`:
one agent for the turn-rate watch off screen plus phoneL `meadow`; phoneL
`approach` once on a quiet container; one agent for every play on phoneS,
one play per call; then the Artifact republished (read the live version
first, megabeast `play-run-and-frames.md`), `/pr`; then `/relay` to 12b's
own review session. Reply to the operator in Russian, «ты».
