# Relay summary

Relay depth: 6. The successor is depth 7 and may relay with
`create_session` once more; the cap is 8
(`.claude/skills/megabeast/notes/pickup-and-relay.md` § "The depth cap") —
so the session after next is the one that hands the operator the paste.

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** If the local ref is stale,
first `git fetch --deepen=300 origin <branch>` (the clone is shallow, so
an ancestor looks unrelated), check `git merge-base --is-ancestor`, and
rename a genuinely stale ref aside (`git branch -m <branch> stale/<n>`)
before checking out a fresh tracking branch. **After the attach, run
`pnpm install --frozen-lockfile`** (the SessionStart hook installs the
trunk's lockfile, which has no `phaser` or `esbuild`). Read files with
`Read`, not `cat`/`sed` (CLAUDE.md).

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

**Syama is a boy** (Салман, «Сяма» for short). Never infer otherwise.

So: never merge. Never append to `writing/notes/the-five-percent.md`. Ask
the operator nothing, except where they are present and the call is about
how the game feels. Fill `.claude/skills/megabeast/notes/` before every
relay. No module past ~450 lines. Each bite ends by committing its best
frames to `docs/remove-before-merging/frames/bite-<n>/` and republishing the
game Artifact at its one URL. Every session and subagent runs on Opus,
named explicitly (`create_session` `model: "claude-opus-5-5"`, `Agent`
`model: "opus"`). Pass this section on verbatim.

## 2. The conversation

The operator sent nothing in this session. It started from
`/relay take claude/mushroom-game-syama-lbirv7` with the prompt line's
"never `git reset --hard`… run `pnpm install --frozen-lockfile`", which
held: the stale local ref proved an ancestor after deepening the shallow
clone and was deleted. The previous session's operator turns — the grass,
the keyboard, octaves, every tuft a spot, long press and ring, the endless
meadow, "засевается" — are in its summary:
`git show 2fc18f6:docs/remove-before-merging/relay.md` § 2, and every one
of them is already a decision in the plan.

The agent ran as an orchestrator: eight Opus subagents in waves, one step
each, a ~10-minute context check-in, and relayed itself past the 200k
notice once every agent had reported.

## 3. Intent

Unchanged: the whole game, built autonomously, beautiful and comfortable
for a six-year-old boy; each bite reviewed by an agent, handled by the
next session; the Artifact playable after every bite; `/finalize` at the
end, no merge. Bite 12: the child really walks — turns through 360°,
steps along the heading, the sun as the compass.

## 4. Decisions (all written into the plan's `## Rest of the bite`)

- **A grown mushroom's own tap patch scales with how big it is drawn** —
  16 px at the tablet's camera unit (12 for the clump), × the screen's
  unit, × depth (`min(1, scaleAt(z))`), floored. Beat: one px value per
  screen (phones stopped growing; back rows lost everywhere).
- **`LEAST_PATCH` 8 → 6** (decided, not yet set): the sideways phone's
  back rows open, both remaining reds go green. Beat: 5 (too small for a
  finger at the back), relaxing the tests.
- **Past the seam a thing sinks under the ground** (c3acaa50), not under
  the near hills — the plan's cover popped whole flowers, since the crest
  never dips below ~32 px on tabL. A sliver under 0.2 of the drawn height
  is hidden (fe149c59).
- "**The lost back rows**": the regression 86503fb (drawn-only taps)
  caused — no mushroom grew behind the opening clump on four screens.
  Fixed by the depth-scaled patch (5d6f8d88).

## 5. Errors and dead ends

- The haze test was "fixed" by planting its own back-row mushroom, which
  hid the lost back rows until the orchestrator asked why the fixture
  vanished (`megabeast/notes/quality.md`).
- "Same with patches at 0.1 px" ruled the patch out wrongly — the 8 px
  floor clamped the probe.
- A shared-tree uncommitted edit broke the probe's page; probes are built
  in a scratchpad worktree.

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`, PR #57, draft, base `main`.
- Plan `docs/plans/mushroom-game-syama.paused.md`; `## Rest of the bite`
  § "Left, in order" is the work list, each item carrying what is built
  (with commits and hand-over notes) and what is left.
- Nothing running: every subagent reported; no check-ins pending; no PR
  subscription. The Artifact is still version 12 (bite 11).
- `meadow-scene.ts` and `insect-view.ts` are still over ~450 (insect-view
  481).

## 7. Pointers

- `docs/remove-before-merging/bite-12/` — `step-spec.md` (contract),
  `brief-common.md` (shared brief; its "§ This bite" means `## Rest of the
  bite`), and one hand-over note per package; this session's are
  `p1d-taps.md`, `p1e-patch.md`, `p1f-reds.md`, `play-walk.md`,
  `play-rest.md`, `seam-cover.md`, `seam-tail.md` (+
  `seam-tail-flowers.patch`, a one-line `flower-bed.ts` change).
- Frames: `docs/remove-before-merging/frames/bite-12/` (`*-walk-*.png`).
- The relaying session: https://claude.ai/code/session_01BCH6JoetSwUCQXvFvdyrC1

## 8. Next step

`/go` — continue bite 12 from the plan's § "Left, in order", one step per
Opus subagent with a ~10-minute check-in, the play run beside the source
work. In order: set `LEAST_PATCH` 6 and re-run the patch/layout/clump/
fliers tests; the seam package (flowers' patch, mushroom/house height,
`checkPops`); the two over-long modules; P4 (with buried flowers out of
`inView` and taps); the full five-screen play run with §4's checks and
frames; then the bite's end. Then continue the loop per § 1:
"/relay оставь код ревью на последний кусок" after the bite.
