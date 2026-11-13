# Relay 1 — the cube's intro, parked by its lead on 2026-11-13 ~12:55Z

Written by the lead of a `/carte-blanche` run
(`.claude/skills/carte-blanche/SKILL.md`) at the operator's word, for a session
on **another account**: it has this branch and nothing else — no access to the
lead's session, the children's sessions or their transcripts. Everything needed
is on the branch; this file says where.

## 1. Standing constraints

The operator's words, verbatim, from the opening message (2026-11-12):

> суть, кратко: ты делаешь, что хочешь, создаёшь каких хочешь подагентов и
> подсессии, они НЕ создают свои пиары, но полируют свои ветки, потом ты их
> забираешь. Спрашивать меня не останавливаешься, но сейчас, после первого
> сообщения, можешь задать мне вопросы, которые считаешь самыми важными, и на
> которые я один раз отвечу. На самом деле я потом ещё много буду встревать,
> чтоб steer-нуть туда или сюда, но, так сказать, спорадически.

> предупреждения о пределе релея игнорируешь, у тебя тут автокомпакт на 400к (на
> самом деле на 370к, 30к харнесс берёт запас -- зачем-то); трактуй два
> предупреждения (330к и 350к) как соответственно "с этого момента лучше не
> начинать чего-то большого" и "с этого момента нужно заканчивать большое, чтобы
> после автокомпакта не забыть, о чём речь".

> над кубиком сейчас работает другой агент по рефакторингу (см. #275), и он
> занял борду. Заведи отдельную подсессию, единственной целью которой будет
> координировать работу с тем и черипикать борду с той ветки так, чтобы у нас
> потом получился линейный таймлапс в результате.

Second message: «про /task и остальной луп: руководствуйся ими как guidelines,
не как жёстким требованием.»

The rest of the opening message's rules are verbatim in
`docs/plans/cube-intro.paused.md` § "Standing rules", and every later one in
`brief.md` and `journal.md` beside this file (§ 7). The ones that forbid
something, in the lead's wording where the plan does not quote them:

- **Never merge to `main`.** Merge is deploy. The build is shown on preview slot
  2 only; slot 1 is PR 275's.
- **Children open no PRs** and push only their own branch; the lead pushes only
  `claude/cube-intro-j2wt34`. The PR, when it comes, goes through `/pr` with
  base `claude/cube-review-perf`.
- **No Russian on the design board**
  (https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3), and **the pill's
  colour-change story never goes to the board**.
- **Nothing authored** — `src/cube/CLAUDE.md` holds the four rules of the world.
- **Every frame is recorded with its eye, its clock and its commit**
  (`briefs/notice.md`, 11:25Z).
- **Exposure 0.3 and core's `daylightFilm` stay**; the approved frames were
  judged through them. **The sky stays as it is** (no dimmed ring round the sun,
  no painted hole).
- **The body's shadow does not come back; the cube's specks stay; no legs or
  trunk out of doors.**
- **Floor 1's clock is not derived from the sun**: «вредит трушности… лучше
  приму часы которые показывают неправильное время».
- The operator's e-mail address is private: it goes to no outside service.
- No lint-suppression comment without the operator's yes; never resolve or
  re-open a review thread; no model identifier in a commit, a PR or code.
- The Workflow tool only on the operator's explicit ask.
- Builders run on the flagship model, readers and coordinators on cheaper ones;
  children are written to in English.
- A session no longer needed is archived unasked, and named to the operator.
- The operator's voice entry: `.claude/voice/operators/vzakharov.md`.

## 2. The conversation

The run is two days and several compactions long. Its operator messages are
kept verbatim on the branch, each with how it was read, and are not copied here:

- **2026-11-12, the brief and the one batch of questions** — `brief.md` § "The
  brief (the operator's words)", § "The one batch of questions".
- **2026-11-12 22:32Z–23:10Z** — `brief.md` § "Steering on 2026-11-12": the
  sun's direction (his sketch, `frames/operator/sun-direction.webp`), no Russian
  on the board, identical frames, interactions at a price, the look-under scene
  cut, the ladder vanishing, "swallow" not "drink", the pause.
- **2026-11-13 09:05Z–10:55Z** — `brief.md` § "Steering on 2026-11-13, morning"
  and the two "Progress" sections: the restart with a second team, "nothing
  authored", adaptation of the eye, the beam comparison.
- **10:48Z–11:27Z** — `journal.md`: the interior's quarter-turn, the body's
  shadow, the frame approved as the future splash screen, the decor rules.
- **11:45Z–12:10Z** — `journal.md` § "The plan's state blocks…": the clock's
  ruling, the answers at ~11:52Z.

Since then, in order:

1. **Operator**: «вот и хорошо :) какой статус у нас?» — **Lead**: the state at
   12:10Z (as in the journal's block) and four open questions: do the cube's
   specks stay, does the body's shadow return, the title, the lens toward the
   sun.
2. **Operator**: «1 да, 2 нет, 3 "нравилось звучание cubed away", 4 не знаю» —
   **Lead**: recorded; on 4 ruled that the sky stays as it is.
3. **Operator** (with the `ladder-foot` frame): «какой-то "строительно-серый"
   получился в промежутке, кажется раньше было позагадочнее» — **Lead**: agreed,
   the cause being the lead's own literal push for "black with grey bands";
   ordered from shell three finishes for the bands (A as dark as at 315051b5, B
   deep graphite satin, C today's) at `ladder-foot` and the approved eye, for
   him to pick.
4. **Operator** (with the `doorway-out` frame): «это где раньше ослепляло? а
   почему ослепление не устрило? или это после того как глаз привыкнет?» —
   **Lead**: that frame was shot with `--indoors 0`, the eye already used to
   daylight; through the room's own lens the opening is still a white dazzle, by
   design.
5. **Operator**: «> после правила чистой полосы у проёма — что за правило?» —
   **Lead**: the decor keeps a strip in front of floor 1's doorway clear, with
   15 cm past each jamb (`clearZones`), so nothing stands on the way in.
6. **Operator** (with the `wake-sea` frame and a crop of the wet sand's edge):
   «есть ощущение, что у настоящего песка "мокрота" сходит менее ровным фронтом.
   НО возможно я уже придираюсь, и хотелось бы уже всё это сводить вместе
   независимо от улучшения отдельных частей (которое может идти параллельно)» —
   **Lead**: merged every package as it stood (6637594a); the wet front goes to
   sand as a parallel improvement (not yet sent, § 8).
7. **Operator** (with `wake-sea` and an early frame of the island from above):
   «а почему здесь тень заходит на воду? помню, на первоначальном снимке она
   влезала внутри острова. или мы изменили с тех пор положения? кстати вот этот
   кадр сверху нужно тоже переснять с уже имеющимися улучшениями» — answered
   only in the park's own reply (§ 6 "The shadow on the water" holds the
   numbers); the re-shoot is § 8's first step.
8. **Operator**: «отметь как-то текущее состояние, чувствую сейчас опять
   кончится лимит и надо будет продолжать с другого акка (у которого не будет
   доступа к сессиям)» — **Lead**: asked every child to push everything and
   write `reports/<package>.md`.
9. **Operator**: «давай наверное доведи до точки, от которой можно начинать
   продолжать с ветки не имея контекста сессии» — **Lead**: this park: the
   children's last heads merged, the plan released to `.paused`, this file
   (verbatim in Last agent turn).

The operator also spoke to children directly; what reached the lead: to sound,
«теперь идеально» (the sill's cut to silence); to sky, that the upper cloud has
the uneven top "a real cloud should have" and the lower "a mushroom's cap" — sky
restored the cloud body of 54b3c2c7.

## 3. Intent

An intro sequence for the cube game (`src/cube`, `/cube` on the `vova` site):
the player wakes on a tiny sand island before sunset, a black cube hangs in the
air, a wooden ladder leads to a doorway, floor 1's room is lit through it, a
pill waits on a shelf. Everything procedural and deterministic, and
indistinguishable from real. He wants it **brought together now** and improved
in parallel, not perfected part by part. Ruled out: authored images, anything
that changes the world for the next player, a look-under cut scene, legs or a
body's shadow, a clock told by the sun, merging to `main`.

## 4. Decisions

All with their reasons in `docs/plans/cube-intro.paused.md` § "Design
decisions"; the ones made after that section was last written:

- **The interior is turned a quarter in its shell** (`INTERIOR_TURN = 1`,
  `src/cube/shared/outside/turn.ts`): the doorway is on the shell's east face
  and in the room's south wall, so the beam ends on the pill's shelf and stays
  off the hole. It beat moving the hole or the shelf by hand (authored).
- **What stands in the beam shades the room from the decor's own boxes**
  (`sunBlockers` in `@/cube/features/decor`, baked as `RECEPTION_BEAM_BOXES` and
  pinned by a test). It beat an authored box and a general shadow pass.
- **The bands on the cube are told from the faces by finish, not by a lighter
  grey** — the direction of the three variants; the pick is the operator's.
- **The dazzle in the doorway stays**: the eye adapts by where it looks
  (`pages/cube/lib/adaptation.ts`), "not a speed game".
- Terms: **the approved eye** — `--at -15.203,2.0962,15.203 --yaw -45 --pitch 4`,
  the frame the operator approved for its feeling and marked as a future splash
  screen; **the lead's eyes** — the seven named eyes in `frames/lead/README.md`;
  **a strip** — a scripted scene shot every N seconds (`pnpm scenes:cube`);
  **slot 2** — the second preview host, `/preview live vova 2`.
- `yaw` in `outside:cube` is the heading's angle from +x toward +z, in degrees
  (0 east, −90 north, 180 west); world x east, y up, z south.

## 5. Errors and dead ends

- **Dimming the sky's ring round the sun** milked the whole sky; closed, the sky
  stays.
- **"Black with grey bands" taken literally** gave construction grey (the
  operator's word); see § 4.
- **The lead's finding that the wet mirror is brighter in the cube's shadow**
  was wrong (measured: distance and Fresnel).
- **A message to a child session arrives only when its turn ends**
  (`briefs/notice.md`): children run shoots in the background and end turns.
- **Reader agents given seven-section briefs** filled their context before
  finishing; three sections at most.
- **Shell's 9e8e019b is a throwaway**: three band finishes behind
  `NEXT_PUBLIC_BANDS`, which its own report says fails `pnpm typecheck`. It is
  on shell's branch only; the lead merged shell through 726d4863 and took
  `reports/shell.md` by itself.
- A Bash hook in this repo rejects `cat`, `tail`, `sed` and `echo >` on files;
  use Read/Write/Edit, a scratch script under `tmp/` for anything longer.

## 6. State

Checked by command at the park.

- **Branch** `claude/cube-intro-j2wt34`, pushed; the commit that adds this file
  is its head (`git log -1`). **No PR is open on it** (the open cube PRs are 275
  and 276, neither this branch's). The branch keeps its name: the board, the
  children's branches and `briefs/notice.md` all cite it.
- **Plan**: `docs/plans/cube-intro.paused.md` (342 lines). Files that still name
  it `cube-intro.in-progress.md` — `brief.md`, `journal.md`, `contract.md`,
  `briefs/board.md` — are right again once a resuming session renames it back.
- **Merged into the lead**: sky a6c022d8 and sound 423f1231 (final), sand
  69ac8423, core 79f8c242, walk 966ecc5a, pill e1577d87, sea 7abe3943, shell
  726d4863. `git log --no-merges --oneline HEAD..origin/claude/cube-intro-<name>`
  is empty for all but shell (one commit, the throwaway).
- **Gates on the merged tree** (6259f6d2 plus docs): `pnpm typecheck`,
  `pnpm shaders:cube`, `pnpm type-overlap`, `pnpm masd:clusters`,
  `pnpm check:masd`, `pnpm check:cycles`, `pnpm exec eslint src/cube`, prettier
  over `src/cube` and the docs, and the cube's tests
  (`node --import tsx --test $(git ls-files 'src/cube/**/*.test.ts')`) all
  green. **`./scripts/vet.sh` has never run on this branch**, nor `/polish`.
- **What each package owes** — its own `reports/<name>.md` here, newest first
  (core, walk, pill, sea, shell; sky's is final; sand and sound wrote none):
  - **shell** (first in line): the bands' finish — shoot A/B/C, the operator
    picks; the bench in floor 1's beam shades itself (fix in `slabShade`); its
    pin test moves from `standingBoxes` to `sunBlockers`, after which
    `src/cube/features/decor/index.ts` drops `standingBoxes`; indoor frames
    predate the quarter-turn.
  - **walk**: strips of climb, jump and jump-small unshot on this tree; the
    climb unjudged on the turned interior; `/dry`, `/tend-prose`.
  - **pill**: floor 1's act sheet (≈50 min on SwiftShader); `/dry`,
    `/tend-prose`; full gates.
  - **sea**: 376d8709 and 7abe3943 (far foam as the pixel's mean, foam in the
    cube's shadow lit from the horizon, the lace's filter) unjudged in frames;
    keeper frames; `/dry`, `/tend-prose`; `water-level.ts` is at 398 lines.
  - **sand** (parked, no report): thin dark arcs by the waking spot were its
    last open item, answered by the weed's rework (69ac8423, frames
    `frames/sand/1113-weed-*`); the wet front's even retreat is new (§ 8); sea
    found a pixel-wide sand-coloured line across the swash near (−19, 21) that
    looks like the sand's mesh.
  - **core**: nothing.
- **The lead's own frames**: `frames/lead/` with its README — seven eyes at
  49186bc5 / 874eab51 / b0852de6, all read. None is shot at the park's head.
- **The shadow on the water** (the operator's question 7): at a 9° sun the
  cube's shadow lies from 17.0 m (its underside, y 2.7) to 48.6 m (its top, y
  7.7) down-sun, toward west-south-west; the sand meets the sea about 37 m
  down-sun (0.06 m at 35 m, −0.10 m at 40 m), so the last ~11 m lie on water.
  Positions did change since the first frame from above: the island's body
  (sand's `islandHeight`, db2723a4) and the sun's direction (5f761cfb, "the sun
  stands where the operator's sketch puts it"). `tmp/shadow.ts` in the parked
  container computed it and is not on the branch; it is fifteen lines over
  `CUBE_BOX`, `SUN_DIR` and `islandHeight` from `@/cube/shared/outside`.
- **The frame from above**: its original eye was never recorded. A re-shoot at
  the park's head was started with
  `pnpm outside:cube --at -15,60,70 --yaw -90 --pitch -45 --name aerial`; if it
  landed, it is `frames/lead/1113-1255-aerial.webp` with its `.shot.json` and a
  README row, and § 8's first step is done but for showing it.
- **The board**: v88–v89. The protocol agreed with PR 275's session was kept in
  the board session's own `board-protocol.md`, which is not on this branch; what
  is here is `briefs/board.md` (frames under `frames/`, English captions, a
  linear history cherry-picked onto 275's board), and the rest is to be agreed
  again on PR 275's thread.
- **Sessions** (the parking account's; unreachable from another, listed so the
  operator can archive them): core `session_01DaohkCDdGLyRAp2Yux9jAB`, walk
  `session_01DaohkE74S5ZqiB98XpJ7Cy`, pill `session_01DaohkFTr7K29Yvof56czQp`,
  shell `session_01DaohkDRoXkash4Q7kfmQ8Q`, sea
  `session_01DaohkDD34tV9S8mR3o9S3o`, sand `session_01DaohkFqNfZaGgSSE9bfE4h`,
  board `session_01DaohkC6bqy1HmL5Nbbm66J`. Archived already: sound, sky, the
  clouds explainer. PR 275's session is not this run's.
- **Nothing is scheduled or subscribed.** The keepalive watcher is stopped.
- **Estimate**: this session's is revised to the work done — 100 h graphics
  programmer (ocean, sky, shell, beam built and merged), 45 h technical artist
  (island, wet sand, weed, materials), 22 h environment artist (palettes,
  ladder, shelf), 42 h gameplay programmer (waking, climb, way out, pill's act),
  10 h game designer (staging decided), 20 h audio engineer (all sound final),
  21 h producer (two teams run and parked); all senior. **Handed on**: 10 h
  senior graphics-programmer (bands, the bench's shade, judging the sea, the fix
  round), 5 h senior technical-artist (the wet front), 2 h senior
  environment-artist (the bands' tone), 8 h senior gameplay-programmer (strips,
  the act sheet, the end-to-end run), 2 h senior game-designer (judging the
  whole), 13 h senior producer (a new team from the reports, merges, preview,
  polish, the PR).

### Watches

https://claude.ai/artifact/UxGSPAXn2USWZSfpwJ7uFM

(«Два океана», the lead's own explainer. The board's watch was the board
session's, not the lead's: a resuming lead that wants comments sent to Claude
from the board watches https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3 itself.
«Два неба»: https://claude.ai/artifact/RqLHmQ9TkpzjdX6ztDfUcq, never watched
here.)

## 7. Pointers

- `docs/plans/cube-intro.paused.md` — the lead's memory: rules, facts, design
  decisions, the team as it was. Read whole.
- `brief.md` — the brief, the answers, steering to 10:55Z, verbatim.
  `journal.md` — steering and state 10:48Z–12:10Z. `contract.md` — the seam
  between packages. `pause.md` — where the first team stopped.
- `briefs/` — each package's first brief, `restart.md`, `notice.md` (the
  standing notices to all children), `beam-comparison.md`, `board.md`.
- `reports/<package>.md` — each package's state and how to re-shoot its frames.
- `frames/<package>/README.md` — every committed frame with eye, clock, commit.
- `facts-*.md` — reader agents' fact sheets on the renderer, play, sound, the
  island game's board, frames and gates.
- `.claude/skills/carte-blanche/SKILL.md` — the mode; `src/cube/CLAUDE.md` — the
  world's four rules.
- Shooting: `pnpm outside:cube --eyes a,b --out <absolute dir>` (two eyes a run,
  ~3 min a frame on SwiftShader, clock `PLAY_INSTANT` 2026-11-01T12:00:00Z,
  1280×800; `--indoors 0|0.5|1`; `--at x,y,z --yaw --pitch --name`), named eyes
  in `src/cube/scripts/outside-cube.ts`; `pnpm scenes:cube`, `pnpm play:cube`,
  `pnpm pill:cube`, `pnpm grip:cube`. No edits to `src/` while a shoot runs.
- The parked session, for its owner only:
  https://claude.ai/code/session_01DaohkEr63nSs6fbnbbEpGd

## 8. Next step

In line with the operator's last requests — «хотелось бы уже всё это сводить
вместе независимо от улучшения отдельных частей (которое может идти
параллельно)» and «вот этот кадр сверху нужно тоже переснять с уже имеющимися
улучшениями»:

1. Rename the plan back to `docs/plans/cube-intro.in-progress.md`; load
   `.claude/skills/carte-blanche/SKILL.md`.
2. **The frame from above**: if `frames/lead/1113-1255-aerial.webp` is absent or
   frames the island badly, shoot it (§ 6), record eye, clock and commit, show
   it to the operator and put it on the board.
3. **The intro played end to end** (`pnpm play:cube`, and walk's strips via
   `pnpm scenes:cube --scenes waking,climb,jump,jump-small --every 2.4`) and
   looked at; then one fix round on what it shows.
4. **In parallel, a new team from the reports** — fresh child sessions on the
   existing branches `claude/cube-intro-{shell,walk,pill,sea,sand}`, each
   briefed with `briefs/restart.md`, `briefs/notice.md` and its
   `reports/<name>.md`: shell's bands first (the operator picks from the
   three-up sheet), then the bench's shade; sand gets the operator's remark that
   real sand's wetness retreats along a less even front, and sea's pixel-wide
   line; walk, pill and sea what § 6 lists. Merge each as it reports green.
5. **Preview slot 2** (`/preview live vova 2`), checking the deployed commit
   before saying it is up.
6. `/polish`, then `/pr` (base `claude/cube-review-perf`), then
   `./scripts/vet.sh`. Never merge to `main`.

Waiting on the operator, none of it blocking: the pick among the bands'
finishes once the sheet exists; a title ("cubed away" is the one whose sound he
likes — no decision).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Доска на версии 88: обе пометки внесены. Жду от куба лист с тремя вариантами полос, от ходьбы — полосу кадров, от таблетки и моря — их правки.
```
