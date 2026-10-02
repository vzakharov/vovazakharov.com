# Relay summary

Relay depth: **4** (the cap is 8, `.claude/skills/megabeast/notes/pickup-and-relay.md`
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

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); leave the harness auto-branch alone; after attaching, run pnpm install --frozen-lockfile; at pickup read megabeast notes by README index only.

The only operator message this session (it came as the relay's launch
line). Reply, and every turn after (all woken by agents, check-ins and the
Stop hook), in Russian: attached (local ref e66b8e1 renamed to
`stale/mushroom-game-syama-lbirv7-e66b8e1`), installed, plan flipped
(39583b9). Then, agent by agent: `rv-eye-world` (279060f, d66ad69, 66e0188),
`rv-insects` (0a60977, ed5b34e, 8b1c551), `rv-taps` (ae6bf31, 116f588,
aec937c; out of context at 3 of 5), the orchestrator's call on the drag
baseline — two drags (df4e24d), `rv-taps2` (c512639, 11777c9), every
review thread replied with its sha; `rv-play` (ef174a5, frames) found a
bee over; `rv-bee8` traced it to the model and view framing a leg
differently; the orchestrator chose to time a leg in its drawn frame
(`leg-timing.md` § 8, 05fe0d2); `rv-legframe` (cbfce09, out of context
after its move), `rv-legframe2` (34788c2), `rv-veer2` (3aaf95a: no bee
over; a veer-watch harness fix for the held turn's slide). Then the
orchestrator retired the dead `parallax.ts`, updated `Eaten so far`,
`bite-12.md`, `leg-timing.md` § 7–8, the megabeast notes, and paused the
plan at the 200k notice. No question was put to the operator.

## 3. Intent

Unchanged: the whole game, autonomous, for a six-year-old boy; the Artifact
playable after every bite; `/finalize` at the end, no merge. Now: close
bite 12 — `/polish`, vet, the Artifact, `/pr` — then the elephant's next
item (12b, the endless field, `endless-field.md`).

## 4. Decisions

- The review's calls, one per finding, with the drag-baseline call:
  `docs/plans/mushroom-game-syama/bite-12/review.md`.
- A leg timed in the frame it is drawn in, what it beat:
  `bite-12/leg-timing.md` § 8; § 7 rewritten (tabL fly-3's 2% was the
  turn's slide).
- Agents went outside their file lists in small, reported ways
  (`walking.ts`, `arrivals.ts`, `mushroom-bed.ts`, `ground.ts`'s `Eyed`,
  harness imports); all accepted.

## 5. Errors and dead ends

- Three agents ran out of context mid-package (5 steps, 3 steps with a
  trace, a play with a trace); successors finished from hand-over notes.
  Brief at most two steps (`megabeast/notes/subagents.md`).
- **`/polish` found no floor**: `git log origin/main..HEAD` holds no
  `polish:` subject (576 commits listed in the shallow clone), so by the
  skill it is a `full` run over the whole branch — huge. Check first
  whether the clone is too shallow for the merge base, and how earlier
  bites' tails polished (`megabeast/notes/gates.md` § on `/polish`'s
  scope), before running it.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`, last pushed 36e59b8d (Stop
  hook cost rows may follow); PR #57 draft, base `main`, **`CONFLICTING`**
  (reported, `/finalize`'s job).
- Plan `docs/plans/mushroom-game-syama.paused.md`, 352 lines; its
  `## Rest of the bite` lists what is left.
- Artifact https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG still at
  **version 15**.
- No agent running, no worktree but the shared one, no check-in pending,
  no PR subscription. All 13 review threads have a reply.

## 7. Pointers

- `docs/remove-before-merging/bite-12/rv-*.md` — this round's notes.
- `docs/remove-before-merging/frames/bite-12/review/` — the frames
  (`legframe-*` after § 8).
- `docs/plans/mushroom-game-syama/to-check.md` — the operator's list
  (nothing added this round).
- This session: https://claude.ai/code/session_016xbr7x4apK8DQ38aF8ctLg

## 8. Next step

Resume the plan (`/go`) at `## Rest of the bite`: `/polish` (settle its
scope first, § 5), vet, the frames chosen for the bite, the Artifact
republished at its one URL, `/pr`; delete the section, and per Step 4 of
`/go` the bite pauses for the next one, which then starts by the plan's
§ "How this elephant is eaten" (the next bite being 12b). Reply to the
operator in Russian, «ты».
