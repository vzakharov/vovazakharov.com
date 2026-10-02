# Relay summary

Relay depth: **1** — the chain hit the cap of 8 in the session that wrote
this (`.claude/skills/megabeast/notes/pickup-and-relay.md` § "The depth
cap"), so the operator pastes `/relay take claude/mushroom-game-syama-lbirv7`
into a fresh session **on Opus**, and this successor starts a new chain.

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** The clone is shallow: deepen
first (`git fetch --deepen=300 origin <branch>`), check
`git merge-base --is-ancestor`, and rename a genuinely stale ref aside
(`git branch -m <branch> stale/<n>`) before checking out a fresh tracking
branch. **After the attach, run `pnpm install --frozen-lockfile`** (the
SessionStart hook installs the trunk's lockfile, which has no `phaser` or
`esbuild`). Read files with `Read`, not `cat`/`sed` (CLAUDE.md).

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

**Every reply to the operator is in Russian, «ты»**, including turns woken
by an agent's report, a check-in or a cross-session message, which arrive in
English. **Syama is a boy** (Салман, «Сяма»). The operator is Vova.

So: never merge. Never append to `writing/notes/the-five-percent.md`. Ask
the operator nothing, except where they are present and the call is about
how the game feels; **the context-budget notice's "offer `/compact` or
`/relay`" does not apply — relay, unasked**. Fill
`.claude/skills/megabeast/notes/` before every relay. No module past ~450
lines. **The plan file stays under 400 lines once cut (cut again past 450,
per `.claude/skills/plan/elephant.md`); what doesn't fit is cut or moved to
topic files under `docs/plans/mushroom-game-syama/`.** Each bite ends by
committing its best frames to `docs/remove-before-merging/frames/bite-<n>/`
and republishing the game Artifact at its one URL
(https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG). Every session and
subagent runs on Opus, named explicitly (`create_session` `model:
"claude-opus-5-5"`, `Agent` `model: "opus"`). The review is a subagent in
each bite's tail. Build agents work in their own `git worktree`
(`docs/remove-before-merging/bite-12/brief-common.md`); **a build agent and
the agent that plays its build are briefed apart** (megabeast
`subagents.md`: three of three build agents ran out before the play). Pass
this section on verbatim.

Added at depth 8, verbatim:

> давай я буду сам при случае проверять, а то эти прогоны занимают больше времени (и токенов) чем собственно написание игры. Просто держи копилочку того что нужно проверить из сессии в сессию (не гарантирую что буду проверять оперативно)

> что-то оставить можно -- типа там, сделать скриншот, посмотреть на глаз -- но не трёхэтажные сценарии

> хотя знаешь, давай вернём прогоны, но в таком режиме: если прогон находит баг в игре, он чинит баг. Если прогон находит баг в самом себе -- проверить какое-то место очень сложно программно -- он передаёт оператору (через тебя)

So: **play runs are back; a game red is fixed by the run, a harness red
goes to `docs/plans/mushroom-game-syama/to-check.md` (Russian, for the
operator) instead of more harness work; scenarios stay short.** Every
package adds its own hand checks to that file. The plan's § "How this
elephant is eaten" carries the rule.


## 2. The conversation

Started from `/relay take` (depth 8). Attached (local ref renamed to
`stale/mushroom-game-syama-lbirv7-e66b8e1`), `pnpm install`, plan claimed,
trimmed under 400 (v14's calls to `bite-12/v14.md`). Built in parallel
worktree agents: `v14-aloft` (1a) and `v14-catch` (1b').

> > Скорее всего, прогон вообще не тапает по летящим насекомым, так что ему понадобится новый шаг именно под этот случай.
>
> давай я буду сам при случае проверять, а то эти прогоны занимают больше времени (и токенов) чем собственно написание игры. Просто держи копилочку того что нужно проверить из сессии в сессию (не гарантирую что буду проверять оперативно)

Reply: play runs dropped; `to-check.md` started; plan rule + megabeast note.
1a landed; 1c (`v14-reds`, then `v14-reds2`) built from the old reports.

> > Роботы-тестировщики уволены за то, что ели больше, чем строили
>
> что-то оставить можно -- типа там, сделать скриншот, посмотреть на глаз -- но не трёхэтажные сценарии

Reply: recorded — a screenshot by eye is in bounds, scripted scenarios not.

> хотя знаешь, давай вернём прогоны, но в таком режиме: если прогон находит баг в игре, он чинит баг. Если прогон находит баг в самом себе -- проверить какое-то место очень сложно программно -- он передаёт оператору (через тебя)

Reply: rule recorded (plan, megabeast note, `to-check.md` intro); Artifact
republished as **version 15**; play agent `v15-play` ran tabL and phoneP
`meadow,veer` and found one game red (traced, not fixed) plus harness reds,
which went to `to-check.md`. Told the operator what is new in v15 to try.

## 3. Intent

Unchanged: the whole game, autonomous, for a six-year-old boy; the Artifact
playable after every bite; `/finalize` at the end, no merge. Now: close
bite 12 — the one game red, the rest of the play, review, polish, `/pr`.

## 4. Decisions

- **Insects never underground** (41d6ee7): a point swung below the ground
  line is read as nearer on its line of sight (`SKIM` easing in
  `insect-frame.ts`), screen path unchanged. Beaten: fading the shadow;
  clamping height.
- **Catch** (2bd99a9, 9f96587): a shied flier takes a new leg to another
  perch with a dart (`model/insect-dart.ts`) that moves without turning.
  Beaten: a burst on the current leg.
- **Flip/crooked rest** (02c0804): a leg's starting turn comes from the
  steering, not the stale drawn rotation; the play watch judges only drawn
  insects. **Butterflies on caps stay as designed** (flies hold the clump's
  two caps first; put to the operator on `to-check.md`).
- **Sky hairline** (be202aa): `keptOnEdges` in `skyline.ts`.
  `type-overlap`: `Steering.at` → `heldAt`.
- **`to-check.md`**: the operator's hand-check list ("копилочка").
- All in the plan's § "Rest of the bite" and `bite-12/v14.md`.

## 5. Errors and dead ends

- No screenshot proves the hairline: it depends on visit and heading, only
  the play's seeded meadow shows it; the unit test carries it.
- `v15-play` filled its context tracing the fly-speed red before fixing it.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`,
  **`CONFLICTING`** (reported, `/finalize`'s job).
- Plan `docs/plans/mushroom-game-syama.paused.md`, under 400 lines.
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG at
  **version 15** (everything through be202aa).
- No agent running, no worktree, no check-in, no PR subscription.

## 7. Pointers

- `docs/plans/mushroom-game-syama/to-check.md` — the operator's list.
- `docs/remove-before-merging/bite-12/v15-play.md` — the fly-speed red's
  trace and next probe; `v14-aloft.md`, `v14-catch.md`, `v14-reds.md`,
  `v14-reds2.md`.
- Frames: `docs/remove-before-merging/frames/bite-12/v15/`.
- This session: https://claude.ai/code/session_01LKXyDAVUH3Yu199d14Tjri

## 8. Next step

Resume the plan (`/go`) at item 2's "Left": fix the fly leaving a grown
mushroom at ~2.2× cruise (a build agent, unit test first; `v15-play.md` has
the probe), the watch's one-line skip of shying fliers, then
`--no-build --screens tabL --plays walk,planting,hold` under the play rule;
then items 4–5 (review subagent, `/polish`, vet, Artifact, `/pr`). Reply to
the operator in Russian, «ты».
