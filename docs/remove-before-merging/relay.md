# Relay summary

Relay depth: 5 → **the successor is depth 6**
(`.claude/skills/megabeast/notes/pickup-and-relay.md` § "The depth cap", limit 8).

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** If the local ref is stale,
first `git fetch --deepen=300 origin <branch>` (the clone is shallow),
check `git merge-base --is-ancestor`, and rename a genuinely stale ref
aside (`git branch -m <branch> stale/<n>`) before checking out a fresh
tracking branch. **After the attach, run `pnpm install --frozen-lockfile`**
(the SessionStart hook installs the trunk's lockfile, which has no
`phaser` or `esbuild`). Read files with `Read`, not `cat`/`sed` (CLAUDE.md).

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
(`docs/remove-before-merging/bite-12/brief-common.md`). Pass this section
on verbatim.

## 2. The conversation

Started from `/relay take`. Attach: deepened; the local ref (e66b8e1, an
older relay commit) was not an ancestor of origin's tip, renamed to
`stale/claude/mushroom-game-syama-lbirv7-e66b8e1`; fresh tracking branch;
`pnpm install`. Plan flipped paused → in-progress (06e4457).

No operator message this session. Every turn was the orchestrator, agent
reports and check-ins; each was answered to the operator in Russian.

## 3. Intent

Unchanged: the whole game, autonomous, beautiful and comfortable for a
six-year-old boy; reviewed per bite by a subagent; the Artifact playable
after every bite; `/finalize` at the end, no merge. Bite 12 now: insects
that live in the world, sized by distance, veering past the child's head,
flying at their own calm cruise. The operator is waiting to *see* the
sizing (asked at depth 4: «у нас же пока ещё в том что на ветке не
масштабируются насекомые?») — the Artifact is still version 13, without it.

## 4. Decisions (all in the plan's `## Rest of the bite`)

- ip-C1's three calls built as recommended (veer fades in from every leg not
  from away; `drawnFlier` returns the veered aloft; `Perched` a union).
- **The insect view has no jump bug** (`ip-jump.md`): every butterfly/bee
  jump was the play's one-frame `face()`; the fly's are its designed dash
  magnified near the eye.
- **Dash bound**: `step / zoom ≤ 1.1 ×` the dash curve's own peak, derived
  from `insect-motion.ts` (fly ~65, bee ~48 butterfly px a frame on tabL),
  fly and bee; the width/20 drawn bound for the butterfly only. Beaten: a
  lower dash; slowing the drawn dash by zoom. `dash-cap.md`'s 60/36
  sizes/s figure is stale (pace removed `across`) — do not use it.
- **Looking back is bare by design** (12b makes the field endless): the
  veer play lands its looking-back releases at the farthest heading with
  room (~1.8 rad tabL, ~1.6 phoneP; `15d6d8b`'s sweep logs it).
- Whether the dash reads too fast is for the operator's play.

## 5. Errors and dead ends

- The first switch agent hit 174k with nothing pushed; one nudge landed it.
- `ip-Cplay` filled (185k) writing the play, never ran it; lesson in
  megabeast `subagents.md` ("two agents").
- The orchestrator briefed a 66 px fly bound from `dash-cap.md`; the code's
  dash is different and both kinds failed it. Lesson in `subagents.md`.
- A worker restart killed a foreground `fliers.test.ts`; rerun passed.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`,
  **`CONFLICTING`** (reported, `/finalize`'s job).
- Last pushed commit: the one carrying this file (after c9a2aa5).
- Plan `docs/plans/mushroom-game-syama.paused.md` (425 lines).
- No agent running, no worktree, no pending check-in, no PR subscription.
- Artifact: version 13, not republished.
- `pnpm knip` reports 11 unused exports, none in C's files; not checked
  against the base — `/finalize`'s vet will show it.

## 7. Pointers

- `docs/remove-before-merging/bite-12/ip-C2.md` (the switch), `ip-Cplay3.md`
  (the play as it stands, per-screen numbers), `ip-jump.md` (the trace;
  its repro script was in this session's scratchpad, gone — recipe in the
  note).
- Frames: `docs/remove-before-merging/frames/bite-12/insect-plane/`.
- Play: `flock tmp/site.lock env NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova`,
  then `flock tmp/site.lock pnpm play:mushrooms --no-build --screens <one> --plays veer`.
- This session: https://claude.ai/code/session_016QmYmqofLgheYYYYgU827x

## 8. Next step

Continue bite 12 from the plan's `**Left, in order:**`, item 1: one agent
(scripts only) makes the two veer-play bound changes and reruns tabL then
phoneP, committing frames; C's step 2 tests in parallel in `src/`. Then
build and republish the Artifact and tell the operator, in Russian, what to
try: turn your back and release a bug (it flies out by the side, drawn the
whole way); insects smaller over the back caps, bigger near; walk at a
hovering fly — it veers past; is the fly's dash too fast? Then items 2–5.
