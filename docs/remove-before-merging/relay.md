# Relay summary

Relay depth: 4 → **the successor is depth 5**
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

Started from `/relay take`. Attach: deepened; the local ref (e66b8e1) was
not an ancestor of origin's tip, renamed to
`stale/mushroom-game-syama-e66b8e1`; fresh tracking branch; `pnpm install`.
The plan flipped paused → in-progress. The agent ran seven agents in waves
(see § 6) and reported each round in Russian.

1. Operator (mid-turn): «у нас же пока ещё в том что на ветке не
   масштабируются насекомые? потому что пока я этого не увидел». Agent:
   right — neither the Artifact (version 13) nor the branch sizes insects by
   distance yet; the built pieces are not wired into the scene, package C
   does that, then the Artifact is republished with what to look for.

No other operator message this session.

## 3. Intent

Unchanged: the whole game, autonomous, beautiful and comfortable for a
six-year-old boy; reviewed per bite by a subagent; the Artifact playable
after every bite; `/finalize` at the end, no merge. Bite 12 now: insects
that live in the world — seen from any heading, sized by distance, veering
past the child's head, flying at their own calm cruise however long the
way. The operator is waiting to *see* the sizing.

## 4. Decisions

In the plan's `## Rest of the bite` (`docs/plans/mushroom-game-syama.paused.md`,
item 1 of **Left** carries this session's) and `insect-plane.md` § R3:

- **Veer**: `R_V = V_NEAR · bendAt(pinhole, 0)` (0.625 · CLUMP_DISTANCE on
  the tablet), `w = 0.1 · CLUMP_DISTANCE`; a leg to/from a seat inside the
  band fades the veer over 0.3 of `flown` scaled by the seat's depth in the
  band, landing exactly. Beaten: `R_V = V_NEAR` alone (1.86–1.92× zoom); a
  veered landing beside the seat. Accepted cost: up to ~2.4× during a fade
  by a perch; rare one-frame fly flicks; a ~60 ms brow blink looking back —
  all three for C's play check.
- **Pace**: leg time = max(flown, drawn length / cruise), no ceiling,
  ARRIVAL gone, a fixed dash shape per kind. **Cruise set by the catch
  test** (`ip-dart`): fly 5, bee 4, butterfly 0.95 butterfly sizes/s; dash
  fly 0.85 of the way in 0.2 of the time, bee 0.75 in 0.2. Beaten: fly 7 /
  bee 4.6 (caught 0.43 on the upright tablet); darting only on long legs
  (worse, 0.32–0.36). The butterfly's ~45 s longest leg is for play to judge.
- **A perch's distance** is its foot's forward distance in the frame turned
  to the eye's heading, floored at `V_NEAR` (`ip-B`). Beaten: `stands.ahead`
  (reads high off the middle).
- **Packages are additive; C switches over and deletes.** C1's three calls,
  decided: every non-away leg fades the veer in from its start; `drawnFlier`
  returns the veered point; `Perched` a seat/air union, `seatedZoom` at the
  seat's drawn point.
- Terms: **"the leg's frame"** — the opening layout's pinhole stood at the
  eye, turned to `centreOf` at set-off; **`forward`** — the spec's `q`
  (renamed for `type-overlap`); **`fromEye`** — a place's distance.

## 5. Errors and dead ends

- ip-measures stopped before writing the spec; ip-spec3 wrote Round 3.
- ip-pace left `fliers.test.ts`'s fly catch red (0.43, 0.68); its guessed
  cause was backwards; ip-dart fixed it (§ 4).
- **ip-C1 built nothing**: its whole 178k went on reading six notes and the
  view code. Its design and a partial patch are committed. Lesson in
  megabeast `subagents.md` ("Additive packages, then one switch-over").
- The branch still has the live regression from depth 3: a release while
  looking back is invisible; insects shrink toward the middle looking back.
  C fixes both.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57, draft, base `main`,
  **`CONFLICTING`** (reported, not fixed — `/finalize`'s job).
- Last pushed commit: the one carrying this file (after 9d4518a1).
- Plan `docs/plans/mushroom-game-syama.paused.md` (412 lines).
- No agent running; no PR subscription; no scheduled check-in.
- The Artifact is version 13, not republished this session.
- Built this session: `insect-frame.ts` (d3cb5b21, cac36794, 5178c0e4),
  pace (a9827e74, 24a64947, 55de90a2, 2dd972a4), spec R3 (9d2090c0,
  47e813a8), A (7495c9ff, 0bd642d2), B (4982bbfd, 7cca03f7), C1's note
  (e2b6f123).

## 7. Pointers

- `docs/remove-before-merging/bite-12/insect-plane.md` § R3.3 — package C.
- `docs/remove-before-merging/bite-12/ip-C1.md` + `ip-C1.patch` — the
  switch-over's design (call sites, `mushroom-probe.ts` `insect()` outside
  C's list, `meadow-scene.ts`'s three reads of `perches.sight`, `airSpots`
  stays). Start C's next agent from it.
- `ip-frame.md`, `ip-veer.md`, `ip-A.md`, `ip-B.md` — the APIs C calls;
  `ip-pace.md`, `ip-dart.md` — pace; `ip-measures.md` + `.patch` — the
  prototype scripts.
- Quick catch check: `node --import tsx --test --test-name-pattern="caught by a tap" src/pages/mushrooms/ui/scene/fliers.test.ts` (~6 s).
- This session: https://claude.ai/code/session_01Mb57F2fFiH5LcRRo66oKts

## 8. Next step

Continue bite 12 from the plan's `**Left, in order:**`, item 1: brief
package C's switch-over from `ip-C1.md` — one step per agent (the switch,
`fliers.test.ts` green; then the flowerLiftAt/`drawn` tests; then the play
checks on tabL and phoneP with frames), check-ins at ~12 min. Then
republish the Artifact and tell the operator what to try (turn your back and
release a bug; insects smaller over the back caps, bigger near; a fly on a
long leg, calm). Then items 2–5 of the Left list.
