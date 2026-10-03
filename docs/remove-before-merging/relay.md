# Relay summary

Relay depth: **3** of the chain the operator started at depth 1
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

The relay's launch line, the only operator-shaped turn this session. Reply
(Russian): attached (the stale local ref renamed aside to
`stale/mushroom-game-syama-lbirv7-e66b8e1`, no auto-branch touched),
installed, plan flipped (3be89c4); then the rest of 12b's tail as agents,
one step each, every turn after that an agent report answered with a short
Russian status line. No further operator message.

## 3. Intent

Unchanged: the whole game, autonomous, for a six-year-old boy; the Artifact
playable after every bite; `/finalize` at the end, no merge. Bite 12b is
built, polished and published; next is its own review session (12b being
structural keeps one), then its handling, then bite 13 (rain).

## 4. Decisions

Every call, with its numbers, is in
`docs/remove-before-merging/bite-12b/waves.md` from "tail-turn3" on. The
ones a successor would re-litigate:

- **The turn-rate watch judges a frame only while the body's middle is on
  screen** (74574f4), sharing one `onScreen` test with the heading watch; a
  harness loosening, with its to-check.md line. phoneL `meadow` green.
- **phoneL `approach` was the game's red, not the container's**: 31 ms on
  a quiet container against 26, 24 of a no-work frame's 26 ms in Phaser
  re-triangulating every `Graphics` each frame. Beat: a phoneL budget of
  its own (a real phone runs the same `earcut`), and baking mushrooms to
  textures (the light turns with the heading, so a turn re-bakes all).
  Taken: **a mushroom's chords follow its drawn size** — `curveSteps` in
  `model/mushroom-profile.ts` (567702f), 18.4 ms, the far forest looking
  the same; tap outlines keep full detail.
- **The gill band keeps all 28 chords** (`BAND_STEPS`): no floor under 28
  holds the 1 px bound, the error being where angle samples fall on the
  notch round the stem. Beat: resampling the notch, which moves the tap
  outline, for ~120 of ~1,700 entries.
- **phoneS seen, not traced, handed to the review**: the bees' planted
  flower grew off the right edge (x 351 of 320); a thin forest (12); the
  buttons over nearly all the sky.

## 5. Errors and dead ends

- tail-lod ran to 170k before measuring, leaving a patch; tail-lod2, told
  to land step 1 within ~60k, finished. (Megabeast `subagents.md` already
  says an agent lands one step, maybe two.)
- The earlier call "approach's 47 ms is the container's" was half wrong
  (megabeast `play-run-and-frames.md`, rewritten in place).

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`,
  `CONFLICTING` (reported, `/finalize`'s job). Body refreshed with a 12b
  bullet and QA rows; squash proposal comment updated (5712237909).
- Plan `docs/plans/mushroom-game-syama.paused.md`; `## Rest of the bite`
  says only the review and its handling are left.
- Last polish commit a772d94 (bare `polish:`), so a review's range for 12b's
  tail starts after 385453f; 12b as a whole is everything after bite 12's
  handling (`bite-12b.md` names its range).
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG at version 17
  (the tail's head, 2026-10-03).
- No agent running, no worktree but the shared one, no PR subscription.

## 7. Pointers

- `docs/remove-before-merging/bite-12b/waves.md` — every report and call;
  `tail-phoneS.md`, `tail-lod.md`, `tail-turn3.md` beside it.
- `docs/plans/mushroom-game-syama/bite-12b.md`, `endless-field.md` — the
  bite's calls and contract; `to-check.md` — the operator's hand checks.
- Frames: `docs/remove-before-merging/frames/bite-12b/` (`phoneS-*`,
  `phoneL-lod-*` new).
- The plan's § "How this elephant is eaten" step 2 — the review's reading
  list (`writing/notes/the-five-percent.md`, read only) and form.
- This session: https://claude.ai/code/session_016pbMDts3gGENqQCpRr4T3P

## 8. Next step

The loop's own message for this point, the operator's words from § 1:
"/relay оставь код ревью на последний кусок" — so: **leave the code review
on bite 12b**, its own review session (the plan: a structural bite keeps
one), reviewing as the operator would per the plan's step 2, one PR review
with inline comments; then `/relay /handle`. Reply to the operator in
Russian, «ты».
