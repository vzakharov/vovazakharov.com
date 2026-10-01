# Relay summary

Relay depth: 2 → **the successor is depth 3**
(`.claude/skills/megabeast/notes/pickup-and-relay.md` § "The depth cap").

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

**Every reply to the operator is in Russian, «ты»**, including turns woken
by an agent's report, a check-in or a cross-session message, which arrive in
English. **Syama is a boy** (Салман, «Сяма»). The operator is Vova.

So: never merge. Never append to `writing/notes/the-five-percent.md`. Ask
the operator nothing, except where they are present and the call is about
how the game feels; **the context-budget notice's "offer `/compact` or
`/relay`" does not apply — relay, unasked**. Fill
`.claude/skills/megabeast/notes/` before every relay. No module past ~450
lines. Each bite ends by committing its best frames to
`docs/remove-before-merging/frames/bite-<n>/` and republishing the game
Artifact at its one URL (https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG).
Every session and subagent runs on Opus, named explicitly
(`create_session` `model: "claude-opus-5-5"`, `Agent` `model: "opus"`).
The review is a subagent in each bite's tail. Build agents work in their
own `git worktree` (`docs/remove-before-merging/bite-12/brief-common.md`).
Pass this section on verbatim.

## 2. The conversation

Started from `/relay take`. The attach went like this: the clone was
deepened; the stale local ref was renamed to `stale/mushroom-game-syama-e66b8e1`,
since it had diverged; `pnpm install` ran. The session told the operator
the turn question was open and waited on the depth-1 relaying session's two
agents.

The relaying session (session_01UtZKz1KhUShxyTZXbZ24vD) then forwarded the
operator's answer to the turn question, verbatim:

- «а, всё, докрутил. но это заняло аж 16 секунд; по ощущениям (как если бы
  я был реально человеком так вращающимся, судя по движению грибо и
  цветов) это должно было бы произойти намного раньше»
- «то есть претензии не к тому с какой скоростью движутся цветы-грибы, это
  как раз ок, а к тому какой длины ощущается "полный поворот"»
- «да, точно не через трубу. выглядит как будто ты прямо посреди
  грибочков, стартовые грибы метрах в двух-трёх, и это хорошо»

The agent measured the views (`tmp/fov.ts`, not committed): 7.9 screens a
turn on tabL, 18–19 on portrait. It decided to halve `CLUMP_DISTANCE`, which
it claimed would keep the opening pixel-identical (aba53f0). It then
recorded `drop-in`'s and `v-near`'s leftovers as decisions and briefed
`half-depth`. That agent stopped at step 1: the brow became a dome and side
flowers sank, with 10–36% of the opening's pixels changed. The agent showed
the operator the frames, admitted its claim was wrong, and offered four
options, recommending a 0.7 cut.

1. Operator: «не, это конечно выглядит не айс 🙂 а что нужно бы было
   сделать чтобы сохранив текущую округлость горизонта, но сделать меньше
   поворотов? законы оптики? :)» / «как-то в компьютерных играх-стрелялках
   ж это работает?» Agent: a shooter's horizon is at infinity, so it stays
   straight at any view. Ours is a near circle, which dips harder as the
   view widens. Games with a round horizon (Animal Crossing) render wide
   with a straight horizon and then bend the screen by a fixed curve. It
   proposed a panoramic lens (linear in azimuth, rows by distance) plus
   today's brow curve as a screen-space bend, probe first. It asked:
   «Делаю?»
2. Operator: «да, и 4 экрана как раз кажется правильным "ощущением", сейчас
   проверил, грубо говоря если мы смотрим на "север", то каждый "экран"
   направо это поворот: восток-юг-запад-опять север / про пробу -- ок».
   Agent: wrote the decision (bac7c5a) and briefed `lens-probe`. The probe
   landed (147a6c6) and its four frame pairs were sent to the operator.
   **The operator has not yet answered on the probe.** The agent then
   relayed, at ~200k of context.

## 3. Intent

Unchanged: the whole game, built autonomously, beautiful and comfortable
for a six-year-old boy; each bite reviewed by a subagent and its findings
fixed; the Artifact playable after every bite; `/finalize` at the end, no
merge. Bite 12: the child really walks, and now a full turn feels like a
person's — **4 screens on tabL, one screen per compass quarter**. The
opening stays as it is (the clump, the round brow).

## 4. Decisions (all in the plan, just before `**Left, in order:**`)

- **A panoramic lens with a bent screen.** Across, the screen is linear in
  azimuth. Rows go by distance, so the `D_SEE` circle is one row and every
  row is turn-invariant. The whole ground is then bent by today's brow curve
  (`hypot(1, dx / focal)` at today's focal). The meadow's angles widen by
  one factor (`SPREAD` 1.9617), giving 4 screens a turn on tabL; the other
  screens take whatever that factor gives them. The slide in px stays.
  - Beaten: the half-depth pinhole (a dome, side flowers sunk); a smaller
    cut; a straight brow (a far flower vanishes as you turn toward it); a
    brow drawn at the old focal over a wide pinhole (sinking things ride up
    and down as the child turns).
- **"Half depth" is the beaten attempt.** `half-depth.patch` is kept only as
  a reference for which constants follow `CLUMP_DISTANCE`. Its rule that
  plane constants follow `CLUMP_DISTANCE` rather than literals still holds
  in spirit.
- **A flier sinks under the brow by its ground point**, not its middle. This
  fixes ~1% of releases that were hidden while in front of the brow.
- **An insect is culled by its own drawn extent**, not by `V_NEAR`.
- **`V_NEAR = 0.58 · CLUMP_DISTANCE`** (2c1ed70, by `v-near`). Its ceiling of
  0.613 needs re-measuring after the lens changes.
- **The release rises over the brow in front** (d290cd0, by `drop-in`).
  Leftovers in `drop-in.md`: `PAST_BROW` as a share of `D_SEE`, the no-perch
  first leg lengthened, no release past the world's end.

## 5. Errors and dead ends

- **The agent promised the operator a pixel-identical opening for half
  depth, and it was wrong.** It checked one projection, not the brow, which
  is a circle of plane distance. The operator saw the dome. The lesson is in
  megabeast `quality.md` (last entry): a geometry call goes through a frame
  probe before a build is briefed.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57, draft, base `main`,
  **`CONFLICTING`** (reported, not fixed — `/finalize`'s job).
- Plan `docs/plans/mushroom-game-syama.paused.md`.
- No agent is running, here or in the depth-1 session (both reported). No
  PR subscription, no scheduled check-in from this session.
- The Artifact has not been republished this bite.

## 7. Pointers

- `docs/remove-before-merging/bite-12/lens-probe.md` and `lens-probe.patch`:
  the probe, its numbers, and what a real build must change.
- `docs/remove-before-merging/frames/bite-12/lens-probe-*.png`: the frames
  the operator was shown.
- `docs/remove-before-merging/bite-12/half-depth.md` and `.patch`; also
  `drop-in.md`, `v-near.md`, `brief-common.md`.
- This session: https://claude.ai/code/session_01Hsurffgkik4M4cmidrfK6B

## 8. Next step

**Wait for the operator's verdict on the lens probe**, the one open thing.
If it is a yes (or anything short of a no), brief the lens build
("on a yes, that build is the next package" in the plan): spread the ground
itself (`planeOf`/`ofLayout`) rather than inside `viewOf`, the inverse
projections and taps, the insects, the tests. Then the half-depth package's
carried items, re-measured under the new lens: the fliers' ground-point
sink, `PAST_BROW`, the no-perch leg, the world's-end release, the insect
cull, and `V_NEAR`'s ceiling. Then continue bite 12 from the plan's
«Where the relay at 13:00 on 1 Oct left it»: the five-screen run with
frames, the phoneL edge flower, the review subagent and its fixes, delete
`## Rest of the bite`, `/polish`, vet, the Artifact, `/pr`. Then 12b.
