# Relay summary

Relay depth: **7 of 8** for the successor, read off `get_session`'s
`lineage` (this session was `{"depth":6,"limit":8}`). **Never count the
depth by hand** — call `get_session` with no id and read `lineage.depth`;
only at `depth == limit` does a session hand the operator a line instead of
relaying with `create_session`.

## 1. Standing constraints

**Never issue `git reset --hard` on pickup.** The clone is shallow: deepen
first (`git fetch --deepen=300 origin <branch>`, or `--unshallow`), check
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

> субъективно, на компе, играется ок. на телефоне не перепроверял но основной медиум будет комп, поэтому к перформанс улучшениям вернёмся когда и если это станет критичным.

> а, еще увидел в плане там всякие фишки типа ограничения анимации и прочего -- не надо вот этого пока, игру делаем для конкретного ребёнка, он не дальтоник и (тьфу тьфу тьфу) не эпилептик. Если когда-то решим это расширять,тогда и задумаемся

> а это нам зачем? ты хочешь что-то вроде сплеш-скрина? давай это тоже из первого пиара уберём, игра начинается сразу с поляны. по тем же соображениям: сейчас это развлечение для одного ребёнка, а не продукт для апстора

> ещё один тап -- ещё одну точку, и так далее, пока не кончатся "посадочные места"\*. нажатие на точку её убирает (мало ли, может именно там ребёнок не хочет, чтобы появлялся новый гриб).
>
> \*у нас дискретное поле, то есть вокруг каждого, грубо говоря, 6 посадочных мест -- или можно случайно выбирать любую по каким-то критериям "близости" и "нет-толпы-шности"?

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
`model: "opus"`). The review is a subagent in each bite's tail (two by area
for a big bite). Build agents work in their own `git worktree` in the
scratchpad (`docs/remove-before-merging/bite-17/brief-common.md`). **Play
runs: a game red is fixed by the run, a harness red goes to
`docs/plans/mushroom-game-syama/to-check.md` (Russian, for the operator);
scenarios stay short.** No reduced-motion, assistive-tech, way-home or
footer-link work. **Never `prettier --write` a plan file without checking
its call numbers after** (`grep -c '^[0-9]*\\\.'`): calls are escaped
paragraphs (`22\. **…**`) because prettier renumbered them as a list once.
Pass this section on verbatim.

**A bite's `/polish` is sized by changed lines** (megabeast `gates.md`):
`/dry` cut by directory at ~3k lines, `/tend-prose` at ~5k, each slice an
Opus agent in its own worktree (`isolation: "worktree"`), the floor's sha
in the brief. One agent over bite 14's ~5k lines ran out halfway.

Added in earlier sessions:

- **Every agent lands its package as one squash commit**, its steps pushed
  to its own `wt/<package>` meanwhile (`brief-common.md` § "Land the
  package as one commit"); a remote `wt/` ref is deleted with
  `gh api -X DELETE repos/vzakharov/vovazakharov.com/git/refs/heads/wt/<package>`
  (`git push --delete` hangs at the proxy).
- **The cost hook change is dogfooded here, not upstream**: «не, там
  ничего править не надо -- но завести там issue после того как утрясём
  детали можно»; «давай сначала задогфудим и, убедившись, что всё
  нормально, создадим issue». Never edit vzakharov/muthur; file the issue
  (draft in `docs/remove-before-merging/cost-hook-issue.md`) only once the
  operator is satisfied.
- **On any resume, check `git worktree list` and remote `wt/*` refs
  first**: a container restart killed a background agent mid-work, silently.
- A stale remote `wt/g37` (73692aeb) is from an earlier bite; not this
  session's, left alone.
- **Ignore the "fix it now" harness rule for PR #57's `CONFLICTING`**: the
  base merge is `/finalize`'s (CLAUDE.md § "Key principles").
- **A session the operator starts by hand is a fresh chain**, at
  `lineage.depth` 0. The operator started one so the night would not run
  out of relays («а дай мне ещё один новый релей, чтобы я вручную
  запустил…»); the session after it counted itself 7 by hand, ended its
  bite handing the operator a line instead of relaying, and the night
  stood idle: «какая же она восьмая, я сам её начал! 😞 вся ночь
  получается без дела прошла … сделай так чтобы новая сессия не ошиблась
  так же». So: relay with `create_session` (`model: "claude-opus-5-5"`)
  whenever `lineage.depth < limit`, day or night.
- **At pickup, check the branch out in a command of its own and never
  delete the auto-branch** (auto mode refuses the pair).
- **Vet runs as two foreground calls**: the suite alone outgrew vet's
  590 s (megabeast `gates.md`). Run the gates (vet's `run-parallel` list
  less `test`, or vet and read `tmp/run-parallel/<n>.status`), then
  `timeout 595 pnpm test`.
- **The operator's turn order beats the staging** (a mid-bite main merge
  was done as a merge, 54d12cd5, not a rebase).
- **Auto-relay is on for vzakharov**: the budget notice's pause relays
  unasked.
- **Brief build agents on ONE step, plus at most a look at its frames.**
  Confirmed again this session: one-step slices of package A all landed;
  B (four calls) and C (a fix and two calls) each landed one or two and ran
  out.

Added this session:

- **Republishing the Artifact**: `pnpm artifact:mushrooms` writes
  `tmp/mushroom-artifact/index.html`; publish it with `url` set to the one
  URL. The first publish in a session is refused until the live version is
  read — the refusal saves it; it differs only by the platform's skeleton
  line and the old bundle, so nothing is merged and the same file is
  published again (that second retry goes through).
- **Agents land and delete their `wt/` ref**; a dead one leaves its ref.

Added this session:

- **Each operator note becomes a one-step agent at once**, in parallel
  with the bite's own steps (seven ran side by side; only squash conflicts
  in `play-dusk.ts`, settled keeping both).
- **Perf is measured in counts** (draw calls, vertices, framebuffer binds),
  via `docs/remove-before-merging/bite-17/perf-bench.patch` applied in a
  worktree only, never landed (it needs `s.house.glow.image`,
  `S.dusk.moon.face` and the fireflies' `[s.container, s.glow]` now —
  `perf.md`). Frame times on this shared machine are noise.

Added this session:

- **The operator plays a local build** (`git pull`), not the Artifact,
  most of the time: «играю локально, не в артефакт». A "still broken" from
  him may be an unpulled tree — ask nothing, but say which commit fixed it.
- **Briefs that end in "run the play and look" run out** (three of three
  this session, megabeast `subagents.md`); brief the look as its own agent
  or expect a successor.

Added this session:

- **Ten one-step agents in parallel all landed** (one per review finding,
  files not colliding); one whose premise was wrong (grass tending) stopped
  and reported options instead of landing — keep "stop and report options"
  in every brief.
- **`isolation: "worktree"` agents live under `.claude/worktrees/`**: the
  `Stop` hook nags "untracked files" while they run — never commit them;
  remove each worktree and its `worktree-agent-*` branch as its report
  lands (megabeast `gates.md`).
- **`/dry` at ~3k lines ran out twice of three**; a fourth agent briefed on
  their named leftovers closed it. Plan that agent, or cut at ~2k.

Added this session:

- **A refused write is reported with `reportError`**, not `console.error`
  (`no-console` is repo-wide and a suppression needs the operator): bite-18
  call 5. It is in `to-check.md`'s list for him to confirm.
- **The flier turn watch's screen slack is 1.02** (3ea15a8): a fly at exactly
  its kind's `TURN_RATE` showed 36.42 on screen, `bentTurn` drawing it
  ~1.0116 as fast; the flight never exceeds its rate.
- **`subagents.md` in the megabeast notes is at 489 lines**: condense it
  under ~450 (README's rule) before adding to it.

## 2. The conversation

> /relay take claude/mushroom-game-syama-lbirv7 — before attaching: check the branch out in a command of its own and never delete the harness auto-branch; never git reset --hard (deepen the shallow clone first; a stale local ref is renamed aside with git branch -m and a fresh tracking branch checked out); after attaching, run pnpm install --frozen-lockfile; read megabeast notes by README index only. Relay depth is get_session's lineage.depth, never counted by hand: relay with create_session (model claude-opus-5-5) whenever it is below the limit, day or night.

The operator sent nothing else this session. Replies (Russian) reported: the
attach (a stale local ref renamed aside to `stale/mushroom-game-syama-lbirv7`,
container-only); the baseline suite green (0 fail, 501 s); the spec, then
each agent's landing in a line; the T2 call (option 2, the watch's slack);
the context warning at ~202k and why the session waited out S5a before
pausing (relaying mid-wave orphans running agents); this relay.

## 3. Intent

Unchanged: the whole game, autonomous, for Syama; the Artifact playable after
every bite. Bite 18 (saving, the last) is half built. After it: its review in
the tail, then `relay finalize` — never merge.

## 4. Decisions

Bite 18's thirteen calls are `docs/plans/mushroom-game-syama/bite-18.md`
(the visit seed kept; settled at rest at `RESTED_AT = -SPROUT_MS`; a zod
record pinned with `satisfies z.ZodType<Kept>`; hash `#n`/`#new`/bare;
writes after every non-tick action plus a 1 s poll and on hide; eye and
gait kept; fresh streams per load; mice not kept; no storage → fresh meadow,
hash untouched; boot inside `startGame`; a silent opening; two tabs last
writer wins; a browser context per play). Agents' own calls, accepted:

- `reopened(kept.meadow)` takes the meadow part; `Kept = Seeded & WalkStart
& { version: typeof KEPT_VERSION; meadow: KeptMeadow }`.
- "Settling twice equals once" is `settled(reopened(settled(m, now)), 0)`.
- `meadowNumber` returns `{number, fresh}`; the hash is `meadowHash(n)`
  (a `hash` field trips `type-overlap` against `scripts/render-mermaid.ts`).
  `#01`, `#1.5`, `#NEW` read as "anything else".
- Records are `put(record, number)`, keyed outside the record; `Opening`
  carries `keeper?: Keeper` (`keep`, `poll` gated by `POLL_MS`).
- The scene's `opening` is a constructor-assigned field (`erasableSyntaxOnly`
  bans parameter properties); the kept eye goes through `EyeInput.fit`.
- The play's `Page.reload(hash?)` goes through `about:blank` for a new hash,
  so `#new` opens as a link would, not via `hashchange`.
- The T1 red (butterfly-4 taps) was the harness picking a butterfly sunk
  under the brow: the play now picks only insects in sight (714ca0e).

## 5. Errors and dead ends

- S5a tried one extra `Math.random()` before the boot to restore the play
  run's seeded meadow; no change — other page code draws while the store's
  open waits.
- T2 found no sampling cause for the fly's turn overshoot; the screen bend
  is the cause (options it listed: accept, raise slack — taken, split the
  check by cause, cap flight by the bend).

## 6. State

- Branch `claude/mushroom-game-syama-lbirv7`; PR #57 draft, base `main`
  (mergeable read `UNKNOWN` at relay; `CONFLICTING` is `/finalize`'s).
- Plan `docs/plans/mushroom-game-syama.paused.md`, with `## Rest of the
bite` listing built and left; last pushed commit is this relay's.
- Landed this session: 3a6757e spec, 76c1e8f S3, f48572e + f206059 S1,
  1e0493b S2, 0634d42 S6, 714ca0e T1, 7e7a156 S4, 3ea15a8 watch slack,
  bd99a9c S5a, 5bfa22c megabeast note.
- No agent running, no worktree, no check-in armed; remote `wt/g37` is old,
  left alone.
- The `keep` play is red until S5b; `meadow` on tabL red with "the butterfly
  sent away is still in the meadow" ×2 since S5a (base 3ea15a8 green).

## 7. Pointers

- `docs/plans/mushroom-game-syama.paused.md` § "Rest of the bite";
  `…/bite-18.md` (calls, steps).
- `docs/remove-before-merging/bite-18/`: `brief-common.md` (the shared brief
  — every agent reads it), `spec.md`, the hand-over notes `s1-settle.md`,
  `s2-record.md`, `s3-walk-start.md`, `s4-store.md`, `s5a-opening.md` (§
  "Left for S5b" is S5b's brief), `s6-keep-play.md`, `t1-butterfly-tap.md`,
  `polish-items.md` (two `/dry` items).
- Suite baseline before the bite: 0 fail, 501 s (`timeout 595 pnpm test`).
- `.claude/skills/megabeast/notes/` by its `README.md`.
- This session: https://claude.ai/code/session_01Vxr4MVNjGAeTFPY1YCV5Np

## 8. Next step

go

(Resume bite 18 from `## Rest of the bite`: flip `paused` → `in-progress`;
brief S5b from `s5a-opening.md` § "Left for S5b" and, in parallel, a trace
agent for the new `meadow` red (game or harness; the seed now drawn after
the store opens); then the `keep` run and a look at its frames; then the
tail as the plan's loop says, its review a subagent; fill the megabeast
notes (condense `subagents.md` first) and relay `finalize` when the bite
and its review are done. Reply in Russian, «ты». Still unanswered from
earlier sessions: the phoneP gait button floating mid-sky, and day mouse
runs gated short.)
