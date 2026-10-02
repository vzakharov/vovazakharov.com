# Relay summary

Relay depth: **3** (the cap is 8, `.claude/skills/megabeast/notes/pickup-and-relay.md`
§ "The depth cap").

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** The clone is shallow: deepen
first (`git fetch --deepen=300 origin <branch>`), check
`git merge-base --is-ancestor`, and rename a genuinely stale ref aside
(`git branch -m <branch> stale/<n>`) before checking out a fresh tracking
branch. **After the attach, run `pnpm install --frozen-lockfile`** (the
SessionStart hook installs the trunk's lockfile, which has no `phaser` or
`esbuild`). Read files with `Read`, not `cat`/`sed` (CLAUDE.md). **Leave the
harness auto-branch alone**: deleting it is refused by auto mode as
destructive, and it costs nothing.

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
Artifact at its one URL (https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG).
Every session and subagent runs on Opus, named explicitly (`create_session`
`model: "claude-opus-5-5"`, `Agent` `model: "opus"`). The review is a
subagent in each bite's tail. Build agents work in their own `git worktree`
(`docs/remove-before-merging/bite-12/brief-common.md`); a build agent and the
agent that plays its build are briefed apart. **Play runs: a game red is
fixed by the run, a harness red goes to
`docs/plans/mushroom-game-syama/to-check.md` (Russian, for the operator);
scenarios stay short.** Every package adds its hand checks to that file.
Pass this section on verbatim.

## 2. The conversation

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); leave the harness auto-branch alone; after attaching, run pnpm install --frozen-lockfile.

The only operator message this session. Reply (and every turn after, all
woken by agents and check-ins, in Russian): attached (the local ref e66b8e1
had diverged from origin and was renamed to
`stale/claude/mushroom-game-syama-lbirv7-e66b8e1`), installed, plan flipped
to in-progress (d3c6a35). Then, one agent at a time:
`v18-drawn-place` built `leg-timing.md` § 4 (47d3a06, e66e719);
`v18-play` measured fly overs 88 → 43, all from legs that pivot first;
the orchestrator decided the watch allows a pivoted leg's dart (§ 5);
`v19-pivot-watch` built it all-or-nothing (1fdf65a) and found that hid
phoneP fly-18; the orchestrator made it proportional (ee84a7e);
`v20-watch-fixes` built that (77fcf75) and fixed the stale tap-in-the-air
check to v14-catch's shy (852a2df), 4 overs left; `v21-fly18` traced them
to a leg to away timed to the band-middle spot and fixed it (3a0b29d),
2–3% left and accepted (§ 6–7). Item 2 closed (4519021). Then three
reviewers by area posted reviews 5391045656, 5391050029, 5391057365; the
calls are in `bite-12/review.md`. The 200k notice came after the second
review; the session waited for the third, paused the plan and relayed.
No question was put to the operator.

## 3. Intent

Unchanged: the whole game, autonomous, for a six-year-old boy; the Artifact
playable after every bite; `/finalize` at the end, no merge. Now: close
bite 12 — the review's fixes, the play, the replies, then item 5 (delete
`## Rest of the bite`, `/polish`, vet, the Artifact, `/pr`).

## 4. Decisions

- Leg timing, every call with what it beat:
  `docs/plans/mushroom-game-syama/bite-12/leg-timing.md` § 4–7.
- The review's calls, one per finding:
  `docs/plans/mushroom-game-syama/bite-12/review.md`. They are decided;
  brief from them.
- The tail review is three reviewers by area (agreed by the plan's
  step 2; recorded in `megabeast/notes/subagents.md`).

## 5. Errors and dead ends

- An all-or-nothing pivot allowance (1fdf65a) hid a real dart (fly-18);
  replaced by a proportional one.
- Two of three reviewers filled their context (155–181k) without a play
  run; their findings rest on reading and probes. The eye-and-world
  reviewer left `geometry.ts`, `motion.ts`, `weather.ts`, `game.ts`,
  `paint-land.ts`, `paint-sky.ts`, `grain.ts`, `backdrop-tones.ts`,
  `sky-layout.ts`, `layout.ts`, `footsteps.ts`, `keyboard.ts`, `baking.ts`,
  `parallax.ts` unread — not a call to review them again.
- This session read three megabeast note files whole at pickup (~38k);
  read the notes' `README.md` only.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`, last pushed 70871b42 (the
  Stop hook's cost rows may follow); PR #57 draft, base `main`,
  **`CONFLICTING`** (reported, `/finalize`'s job).
- Plan `docs/plans/mushroom-game-syama.paused.md`, 394 lines.
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG still at
  **version 15** (not republished since).
- No agent running, no worktree but the shared one, no check-in pending,
  no PR subscription.

## 7. Pointers

- `docs/plans/mushroom-game-syama/bite-12/review.md` — the fixes to brief.
- `docs/plans/mushroom-game-syama/bite-12/leg-timing.md` — the timing
  calls.
- `docs/remove-before-merging/bite-12/review-brief.md`,
  `brief-common.md` (build agents), and the latest notes `v18-*` to
  `v21-fly18.md`.
- The reviews:
  `gh api repos/vzakharov/vovazakharov.com/pulls/57/reviews/<id>/comments`
  for 5391045656, 5391050029, 5391057365.
- `docs/plans/mushroom-game-syama/to-check.md` — the operator's list.
- This session: https://claude.ai/code/session_01UfB8AnjgikX3hw17euejxu

## 8. Next step

Resume the plan (`/go`) at item 4's "Left": brief the fixes from
`bite-12/review.md` as three disjoint groups by files — insects (with the
way-in's leaving spot), eye and world, taps and the harness — each in its
own worktree, one or two steps per agent, a check-in at ~12 minutes; then
a tabL and phoneP play, the frames to `frames/bite-12/review/`, a reply on
each review thread with the fixing sha bare (never resolve); then item 5.
Reply to the operator in Russian, «ты».
