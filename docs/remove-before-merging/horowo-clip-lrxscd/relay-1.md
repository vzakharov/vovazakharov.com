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

Every operator message is quoted verbatim in the plan, in order: the task under § "The operator's standing rules, verbatim", the pick of the variant under § "Answers to the one batch of questions", and everything since in `steering.md` beside this file, which the plan's § "Steering since" points at. In order, with what each got back:

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
15. **«Можешь продолжать но в принципе надо закругляться. Подсессии разбудил»** (after a five-hour limit stopped every session for two hours) → no new scenes and no third passes; the second passes he woke are merged as far as they got, then the run closes: gates green, the mp4 in a release, the PR and this summary current.
16. **«Ок»** to the lead's one question, whether to put `masd-disable promotion` in `puppet/body` and `puppet/head` → both markers set; `check:masd` is green.

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

- **Branch** `claude/horowo-clip-lrxscd`, draft **PR** https://github.com/vzakharov/vovazakharov.com/pull/295 (nothing attested). `main` with PR 240 is merged in. `./scripts/vet.sh` was green on `ae69ac20`.
- **Plan** `docs/plans/horowo-clip.in-progress.md`; the operator's messages verbatim in `steering.md` beside this file.
- **The clip is whole**: a 3.2-second channel ident before the first note (`shots-ident.ts`, the playhead negative there), then every section of the song, drawn and cut in `src/clip/pages/horowo-clip/ui/shots-*.ts` from the widgets in `src/clip/widgets/` (`kids-show`, `meadow-party`, `gig`, `channels`, `bedroom`, `ward`, `ending`). Second-pass level: the chorus meadow, the intro, the gig, the pre-bridge's channels, the bedroom. First-pass level: the ward (bridge and the chorus's inserts) and the ending (breakdown stabs, the snow globe, the tube switching off).
- **The mp4**: https://github.com/vzakharov/vovazakharov.com/releases/tag/horowo-clip holds `horowo-clip-720p.mp4` (77 MB), re-encoded from the 640 MB 1080p master that `pnpm film:clip` writes to `tmp/clip/horowo--3.2-119.7.mp4` (a vova build, then about half an hour of frames). A newer cut replaces the asset: `gh release upload horowo-clip <file> --clobber`.
- **Not built**: from the bedroom-ward-ending session's second pass, the bunny seated beside the man in the ward, the globe pull-back staged in clear steps, and breakdown holes that differ on each return. In the pre-bridge only two channels have people who turn to the camera; the rest freeze.
- **Not run**: `/dry`, `/tend-prose` and `/five-percent` over `src/clip` (the children were told to skip them; the lead left them for a session with more limit). No operator verdict yet on any frame of the scenes.
- **Sessions**: all fourteen children are archived, their branches merged.
- **The limit**: the week's limit was in its warning zone from 14:25 UTC on 2026-11-28 and resets about 54 hours after that. `pnpm costs` fails on another session's row; read ledger rows off the `cost-ledger` branch directly.
- **Estimate**: each session's row carries its own part; the lead's is 14 h designer, 6 h developer, 4 h audio-engineer, 8 h producer.

### Watches

https://claude.ai/artifact/5hqSFnzRjgT8nVshU3oeKJ

The review board. It is private to the account that published it; a successor on another account builds and publishes its own (`/review-board`) and replaces the link in the PR's sticky comment.

https://claude.ai/artifact/DzDDbJfmEA8ugouf4NTeR2

The clip as it stands, playable: `pnpm bundle:clip` writes `tmp/clip/artifact/index.html` and `horowo.mp3`, published as the page plus one supporting file (`contentType: audio/mpeg`). Republished at every milestone (Version 7 at 15:10 UTC: the ident, then every section, second passes in); also private to this account. Whether its audio plays inside the claude.ai frame is unverified; the preview slot is the fallback (`/preview live vova`).

## 7. Pointers

- `docs/plans/horowo-clip.in-progress.md` — everything.
- `.claude/skills/carte-blanche/SKILL.md` — the mode.
- `src/clip/shared/ink/index.ts`, `src/clip/shared/tape/index.ts` — what scenes draw with.
- `sites/vova/public/music/songs/horowo.md`, `docs/music/transcripts/horowo.*` — the words and two recognisers' word timings.
- The song's repository: `gh api "repos/vovas-music/horowo/git/trees/main?recursive=1"`; the master at `https://raw.githubusercontent.com/vovas-music/horowo/main/horowo_master.master.mp3`; the vocal stem at `https://raw.githubusercontent.com/vovas-music/horowo/main/Media/audio%20%5Bvocals%5D.wav`.
- The story cut's reference: `Я куплю тебе дом.mov` in `vovas-music/lebed`, 105 MB, added by commit `161d879e`.
- The lead's transcript: https://claude.ai/code/session_01MZoAKCKwqeVGKcCw6iKKPs (readable only from this account).

## 8. Next step

The run is wound down on the operator's word («Можешь продолжать но в принципе надо закругляться») and waits for his verdict on the clip. Nothing is in flight. When he comes back, in the order he is likeliest to ask:

1. His notes on the mp4 and the board's frames: quote each into `steering.md` in a commit of its own, then fix on Opus or Sonnet children, never the flagship for a fix-up.
2. The quality passes over `src/clip` — `/polish` — then `./scripts/vet.sh`, a re-film, the release asset replaced, `/pr` refresh. Never merge.
3. Only on his word: the unbuilt second-pass items, the 30-second vertical story cut, the video on the song's page — «это уже скорее после тебя опус займётся».
