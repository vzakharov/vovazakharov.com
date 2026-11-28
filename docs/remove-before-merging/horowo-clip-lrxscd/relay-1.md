# Relay 1 — the «Хорошо!» music video, a `/carte-blanche` run

Written by the lead while it is still running, and rewritten at every milestone, because the operator expects this account's limit to run out and the work to move to another account. A successor on another account reaches none of this account's sessions and cannot publish to its artifacts: the repository is all it has. Everything below is checked against the tree as of the commit that last touched this file.

**The plan is the memory, this file is the door.** `docs/plans/horowo-clip.in-progress.md` holds the operator's every message verbatim, every design decision with what it beat, the shot list, the team and what is built. Read it whole before acting. It keeps the `.in-progress` name for the whole run by `/carte-blanche`'s own rule; a successor that finds this session unreachable or out of limit takes the plan over as lead under that name — it is not another living session's claim.

## 1. Standing constraints

From `.claude/skills/carte-blanche/SKILL.md` § "What stands without being said", and the operator in this session:

- «в мейн не мерджишь, превью более чем достаточно» — never merge to `main`.
- No outside services: no image or video generators. Everything is drawn in code.
- «всё что я говорю -- не значит "беги и делай", решай сам в какой момент до этого дойти» — a remark is not an order.
- MASD, the linters and the 400-line cap are not negotiable; only an `insignificant` marker may be set, knowing which consumer removes it. No lint-suppression comments.
- «только используемые видюшки надо выложить в релиз, а не в репу» and «то что здесь делаем, тоже лучше делать через релизы, чтобы не забить всю историю» — no mp4 or other heavy binary is committed; videos are GitHub release assets. Board frames stay committed, small (JPEG under ~150 KB) and few.
- «нужно поглядывать за лимитом и вовремя фиксировать прогресс» — every milestone ends committed, pushed and playable from a link.
- «релеи должны быть актуальными» — this file is brought current at every milestone.
- The operator's voice entry (`.claude/voice/operators/vzakharov.md`): replies in Russian, «Вова», «ты»; archive sessions no longer needed and name each in the report; never the words "load-bearing" or "quietly" in anything he reads.

## 2. The conversation

Every operator message is quoted verbatim in the plan, in order: the task under § "The operator's standing rules, verbatim", the pick of the variant under § "Answers to the one batch of questions", and everything since under § "Steering since". In order, with what each got back:

1. **The task** (`/carte-blanche`, with a photo of the avatar): shoot a clip for «Хорошо!», Gorillaz + the 90s + his robo-avatar as singer and band, funny and frightening, colourful and grim; sketch a storyboard in a few variants, he picks. → The lead drew a cast sheet and three storyboard variants in throwaway SVG, opened draft PR 295 and the review board, and asked four questions (variant; page or mp4; words on screen; whether the puppet is the avatar).
2. **The pick**: variant 1's look; the wall's lettering must look written "with a fingernail-pencil" in blood; tallies struck through after every four, with no end in sight; liked the bunny at night and the bunny with the crystal ball at the end; the channel is «ГБ», not «ХО». → Wall take 2 drawn; questions 2–4 run on defaults (page and mp4 from one code, 16:9 1080p 30 fps; words only where a scene has them; the puppet as on the sheet). The lead landed the drawing kit and started four children.
3. **Four notes with a limits screenshot**: watch the limit and fix progress in time, ideally deployed as an artifact; PR 240 will merge and must be merged in; afterwards, if limit remains, a 30-second vertical cut for a Telegram story ending on a quick montage of clips as at the end of `vovas-music/lebed`'s `Я куплю тебе дом.mov`, the clips in a release; and this work's own heavy output through releases too. → Recorded with the lead's reading of each.
4. **"So it stays plain HTML until the end? You nearly have a tool for video-artifact explainers"** → Yes, HTML until the end; the Motion artifact type was weighed and left (no scene under a second, at most three cuts a second, coworker-safe looks, the film living outside the repo). Taken from it: no full-frame flash faster than three a second.
5. **The song's structure by feel** (intro with bar-start hits to 0:19; double time to 0:28; first half-verse, four-on-the-floor, to 0:36; second half, punk standard time, to 0:43; chorus in half time to 1:00; pre-bridge in quarter time to 1:17; melodic bridge in quarter time to 1:35; then a wholly different tempo, a slow breakdown with glitches). → The shot list was recut so the picture's pace follows the drummer (plan § "The cut by feel").
6. **Rhythm must be felt in the picture**: now and then the kick and the snare coincide with cuts or tangible movement, not overdone. → Kick and snare become onset lists in the score.
7. **Measure tempo per section** — the intro may differ too — **and PR 240 has merged**. → `main` merged into the branch; the engine told to measure each section on its own and to take the audio from the catalogue.
8. **The chorus is faux-happy**: everyone having fun and hopping about the creepy kids'-show meadow, intercut with the words being scratched in the ward. → Chorus recut; hop cycles, a `joy` face, a scratching hand, the meadow's furniture added to the children's packages.
9. **«врезки группы тоже можно делать»** → the band live joins the chorus's rotation.
10. **The finished video goes onto the song's page at the end — likely an Opus session on a new account; relays must be current.** → This file.
11. **«телеканал / грёбаный бал / представляет»**, on the test card frame; then **«заставка с телешумом/паттерном же ДО начала музыки показывается, да?»** → «ГБ» is «Грёбаный бал»; the test card writes the ident on three lines (`testCard(pen, lines)`), and it is a pre-roll of about three seconds before the first note. The engine was told to add `PREROLL` (film time = song time + pre-roll, audio delayed by it in the page, the bundle and the mp4).
12. **The guitarist and the bassist hold the fretting hand on the wrong side of the neck** («я понимаю что треш, но на святое!») → a fix-up child on Opus, branch `claude/horowo-clip-cast-fix-lrxscd`.
13. **How much is 10% of the weekly limit at API rates, and how long do the remaining 15% last before parking** → about $65–70 spent, 1% ≈ $7, about $100 left, an hour to an hour and a half at wave 1's pace; the run parks (`/relay park`) at about 3% left. Wave 2 on Opus only.
14. **«а, и t.me/fknball вставить где подойдёт (лучше раньше)»** → printed on the test card under the ident. (verbatim in Last agent turn)

## 3. Intent

A two-minute music video for the song `horowo`, drawn entirely in code, that is a page on vovazakharov.com (`/music/clips/horowo`) and an mp4 from the same code; then, limit allowing, a 30-second vertical story cut; then the video on the song's page. Ruled out: generators and outside services, merging to `main`, committing video.

## 4. Decisions

All in the plan with what each beat. The ones a successor would otherwise re-litigate:

- **Canvas 2D, a 1280×720 stage, one pure `frame` of the playhead** — no clock, no `Math.random`, no `ctx.filter`. The page plays it against the audio; `film:clip` walks it into an mp4.
- **"Boil"**: the hand-drawn line is each path's anchors nudged by seeded noise eight times a second, in `src/clip/shared/ink`.
- **The puppet's mask sings**: a hinged jaw, one number in `[0, 1]`, driven by the vocal stem's envelope.
- **Two layers told apart by their picture**: "the broadcast" (4:3 TV channel «ГБ» through a worn VHS tape) and "reality" (clean dark 16:9).
- **"Pulse"**: the unit the picture cuts on — a bar in the intro, a beat in double, four-on-the-floor and straight time, two beats in half time, four in quarter time, a detected hit in the breakdown.
- **`Pen.playhead`**, not `Pen.t`: `pnpm type-overlap` forbids a member another named type declares.
- **Motion artifact type: not used** (above).
- **The story cut's montage** is read as cut from the clip's own shots — unconfirmed; check the reference's last seconds before cutting.

## 5. Errors and dead ends

- The lead's first section map was wrong about feel: it had the zapping accelerate through 1:00–1:35, where the song is in quarter time. The operator's map replaced it.
- The first wall frame's lettering read as type, not as scratched; take 2 (`docs/remove-before-merging/frames/wall-take-2.jpg`) has no verdict yet.
- `Pen.t` failed `type-overlap` against the mushroom game's `Frame.t`; renamed.
- The repo's Bash hook refuses `cat`/`sed`/`head` on files: use Read/Edit/Write, or prefix a deliberate batch with `BATCH_EDIT=1`.

## 6. State

- **Branch** `claude/horowo-clip-lrxscd`, draft **PR** https://github.com/vzakharov/vovazakharov.com/pull/295 (title and squash proposal posted; nothing attested). `main` with PR 240 is merged in.
- **Plan** `docs/plans/horowo-clip.in-progress.md`.
- **In the lead's branch** (head `786d62f5` plus the plan commit after it): everything wave 1 built, merged — the kit `src/clip/shared/ink`; the tape `src/clip/shared/tape` with the ident and `T.ME/FKNBALL` on its test card; the cast `src/clip/entities/puppet` with the fretting hand fixed; the props (`src/clip/entities/{bunny,meadow,serotonin,snow-globe,tally}`, `src/clip/features/ear-fireworks`, `src/clip/shared/lettering`, the wall's lettering in its third, pencil-thin take); the engine (`src/clip/pages/horowo-clip`, `src/clip/shared/{score,timeline,film}`, `src/clip/scripts`; `clip` has parents `scene` and `music`). The shot list is a file per section (`src/clip/pages/horowo-clip/ui/shots-*.ts`, helpers in `stand-in.ts`), every entry still a stand-in card. Frames under `docs/remove-before-merging/frames/`, verdicts in `docs/remove-before-merging/review-focus.json`.
- **Archived sessions**: tape, cast, the fretting-hand fix, props. Their branches are merged.
- **In flight**, each pushing as it goes — a successor reads the branch, not the session:
  - `claude/horowo-clip-engine-lrxscd` (Opus, `session_01MZoAKDHpcNax8XmHbMJmAK`) — merged at `ab976bb4`; one last package asked at 11:52 UTC: the pre-roll (`PREROLL = 3.2`, the playhead starting negative so scenes stay in song time, `shots-ident.ts` listed first in `shots.ts`, audio held until song time 0 in the page, the bundle and the mp4).
  - **Wave 2**, started 11:52 UTC from `786d62f5`, all Opus, about $12 each, briefed by `docs/remove-before-merging/horowo-clip-lrxscd/wave-2.md` (the whole brief; it stands alone, so a replacement session is started with the same file and the package's letter):
    - A, `session_01MZoAKCYpzFVG8CYLX323qQ`, `claude/horowo-clip-scenes-a-lrxscd` — the kids' show intro and the chorus meadow; `shots-intro.ts`, `shots-chorus.ts`.
    - B, `session_01MZoAKB8jcFjpioDt9FQYoB`, `claude/horowo-clip-scenes-b-lrxscd` — the gig and the channels; `shots-double.ts`, `shots-prebridge.ts`.
    - C, `session_01MZoAKERHcdpfR5yxYMoa2y`, `claude/horowo-clip-scenes-c-lrxscd` — the bedroom, the ward and the ending; `shots-verse.ts`, `shots-bridge.ts`, `shots-breakdown.ts`.
  - **The seam the lead wires at merge**: A's chorus placeholders `ward insert` and `gig insert` become C's `wardInsert(progress)` and B's `gigInsert`; C's verse placeholders `channel 1`…`channel 7` become B's `channel(n)`.
- **Red on purpose**: `pnpm knip` fails until wave 2 consumes the wave-1 slices and the sketch under `docs/remove-before-merging/` is removed. `pnpm costs` fails on another session's row (role `musician`); read ledger rows off the `cost-ledger` branch directly.
- **The limit**: by the ledger at 11:45 UTC about $100 was spent on the run and about 11% of the week was left (1% is about $7); wave 2 is budgeted at $36 plus the lead's share. The run parks (`/relay park`) at about 3% left.
- **Waiting**: reports from A, B, C and the engine arrive as cross-session messages; a fallback check-in is scheduled in the lead's session; the cache keepalive watcher runs in the lead's session.
- **Estimate**: the whole job is booked on the lead's session (60 h designer, 32 h developer, 4 h audio-engineer, 6 h producer); nothing has been handed on.

### Watches

https://claude.ai/artifact/5hqSFnzRjgT8nVshU3oeKJ

The review board. It is private to the account that published it; a successor on another account builds and publishes its own (`/review-board`) and replaces the link in the PR's sticky comment.

https://claude.ai/artifact/DzDDbJfmEA8ugouf4NTeR2

The clip as it stands, playable: `pnpm bundle:clip` writes `tmp/clip/artifact/index.html` and `horowo.mp3`, published as the page plus one supporting file (`contentType: audio/mpeg`). Republished at every milestone (Version 2 at 11:52 UTC: stand-in cards on the real audio and cuts); also private to this account. Whether its audio plays inside the claude.ai frame is unverified; the preview slot is the fallback (`/preview live vova`).

## 7. Pointers

- `docs/plans/horowo-clip.in-progress.md` — everything.
- `.claude/skills/carte-blanche/SKILL.md` — the mode.
- `src/clip/shared/ink/index.ts`, `src/clip/shared/tape/index.ts` — what scenes draw with.
- `sites/vova/public/music/songs/horowo.md`, `docs/music/transcripts/horowo.*` — the words and two recognisers' word timings.
- The song's repository: `gh api "repos/vovas-music/horowo/git/trees/main?recursive=1"`; the master at `https://raw.githubusercontent.com/vovas-music/horowo/main/horowo_master.master.mp3`; the vocal stem at `https://raw.githubusercontent.com/vovas-music/horowo/main/Media/audio%20%5Bvocals%5D.wav`.
- The story cut's reference: `Я куплю тебе дом.mov` in `vovas-music/lebed`, 105 MB, added by commit `161d879e`.
- The lead's transcript: https://claude.ai/code/session_01MZoAKCKwqeVGKcCw6iKKPs (readable only from this account).

## 8. Next step

Continue the run as lead, in `/carte-blanche` mode, from the plan's § "Built, in flight, left". In the operator's words: «нужно поглядывать за лимитом и вовремя фиксировать прогресс (в идеале ещё разворачивать его -- либо артефактом, либо на превью. в принципе артефакта должно хватить)». Concretely, in order:

1. As each of A, B, C and the engine reports (or stops on the limit): `git fetch origin <b> && git merge origin/<b>`, the quick gates, a look at its `scene-*.jpg`, the frames onto the board with a verdict each.
2. Wire the seam (see State), `pnpm bundle:clip`, republish the clip artifact, watch a few stills across the song for cuts that miss the pulse.
3. `/dry` and `/tend-prose` once over everything (the children skipped them), `pnpm knip` green, `./scripts/vet.sh` green, `/pr` refresh. The mp4 by `pnpm film:clip` as a release asset, never committed. Never merge.
4. Limit allowing: the 30-second vertical story cut. Then the video on the song's page — «это уже скорее после тебя опус займётся».

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Записал: в припеве теперь крутятся три картинки, которым в одной песне делать нечего, — луг, стена и концерт в студии, группа врезается по такту.

Детям это ничего нового не добавляет: играющая группа у куклы и так в задании, студию соберу во второй волне.
```

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Записал: в припеве теперь крутятся три картинки, которым в одной песне делать нечего, — луг, стена и концерт в студии, группа врезается по такту.

Детям это ничего нового не добавляет: играющая группа у куклы и так в задании, студию соберу во второй волне.
```
