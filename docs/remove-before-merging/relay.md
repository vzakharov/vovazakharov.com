# Relay summary

Relay depth: **2** (this chain began at the session that wrote depth 1's
summary's successor; the cap is 8, `.claude/skills/megabeast/notes/pickup-and-relay.md`
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

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); after attaching, run pnpm install --frozen-lockfile.

The only operator message this session. Reply (and every turn after, all
woken by agents and check-ins): attached (no stale ref), installed, plan
flipped to in-progress (561b356), item 2 resumed by agents —
`v15-watch` (293ea93, the watch skips shying fliers), `v15-flyspeed` (traced
the fast leg to places in the opening frame; ran out before fixing),
`v15-eyeframe` (30e4919, places in the eye's frame), `v16-play` (9d1ba38,
the way-in timing; the cap→away red came back), `v16-capaway` (74ed8ec, a
leg cut mid-flight; the orchestrator's hypothesis measured wrong),
`v17-play` (units green, overs down to 88/worst 71, frame median is the
container). Told the operator, in two asks still unanswered: the empty
auto-branch `claude/mushroom-game-4npgfs` could not be deleted (auto mode
refused) — delete it or allow it; and the muthur sync claimed 34 h ago by
https://claude.ai/code/session_014y4ugppjSmJiuUotQyWuhe has not landed —
`scripts/muthur-sync.sh claim --takeover` then `/update-muthur claimed` only
on their word that it is dead.

## 3. Intent

Unchanged: the whole game, autonomous, for a six-year-old boy; the Artifact
playable after every bite; `/finalize` at the end, no merge. Now: close
bite 12 — the last fly-timing fix, its play, the review subagent, polish,
vet, the Artifact, `/pr`.

## 4. Decisions

All in `docs/plans/mushroom-game-syama/bite-12/leg-timing.md` (§ 1–4 with
what each beat) and the plan's § "Rest of the bite" item 2. The open one:
**§ 4, the scene tells the model where it drew a flier cut mid-flight** —
the sight sent with each tick carries each drawn flier's place, `onward`
times the new leg from it, `placesFlying` the fallback. The frame median is
noise in this container (f584982 measures 32.1 ms now).

## 5. Errors and dead ends

- The orchestrator's hypothesis for the cap→away red (`aloftOfLayout`
  inverting the opening layout wrongly for caps grown turned) was measured
  wrong by `v16-capaway`: feet and seats agree with the drawn caps.
- `v17-play` tried placing a cut leg by the dash curve (`progress` in
  `insect-paths.ts`): worse (162.6 px), reverted.
- `v15-flyspeed`, `v15-eyeframe`, `v16-capaway` each filled ~180k; one
  step per agent, check-ins every ~12 min, a nudge at ~160–178k worked.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`, last pushed e252fd4e; PR #57
  draft, base `main`, **`CONFLICTING`** (reported, `/finalize`'s job).
- Plan `docs/plans/mushroom-game-syama.paused.md`, 391 lines.
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG still at
  **version 15** (not republished this session).
- No agent running, no worktree, no check-in pending, no PR subscription.

## 7. Pointers

- `docs/plans/mushroom-game-syama/bite-12/leg-timing.md` — the fly-timing
  calls.
- `docs/remove-before-merging/bite-12/v17-play.md` (latest numbers, the
  cut-leg samples), `v16-capaway.md`, `v16-play.md`, `v15-eyeframe.md`,
  `brief-common.md`.
- `docs/plans/mushroom-game-syama/to-check.md` — the operator's list.
- Frames: `docs/remove-before-merging/frames/bite-12/v16/`, `v17/`.
- This session: https://claude.ai/code/session_01M3eYAhJUzVwJKpLsB92S5Z

## 8. Next step

Resume the plan (`/go`) at item 2's "Left": a build agent for
`leg-timing.md` § 4 (unit test first), then a play agent on tabL `veer`
tallying fly overs by leg kind; then items 4–5 (review subagent, `/polish`,
vet, the Artifact republished, `/pr`). Reply to the operator in Russian,
«ты».
