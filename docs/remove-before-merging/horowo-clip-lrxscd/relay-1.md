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
10. **The finished video goes onto the song's page at the end — likely an Opus session on a new account; relays must be current.** → This file. (verbatim in Last agent turn)

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
- **In the lead's branch**: the kit `src/clip/shared/ink`; the finished tape `src/clip/shared/tape` (merged from `claude/horowo-clip-tape-lrxscd` at `e7d0a99e`); `"clip": ["scene"]` in `src/masd.json`; the storyboard sketch under `docs/remove-before-merging/horowo-clip-lrxscd/sketch/`; frames under `docs/remove-before-merging/frames/` with verdicts in `docs/remove-before-merging/review-focus.json`.
- **Children's branches**, each cut from the lead's `71b7bb75` and pushed as they go — a successor reads the branch, not the session:
  - `claude/horowo-clip-engine-lrxscd` (Opus, `session_01MZoAKDHpcNax8XmHbMJmAK`) — in flight; page, timeline, score, `film:clip`, `bundle:clip`. Not merged.
  - `claude/horowo-clip-cast-lrxscd` (Fable, `session_01MZoAKBkF3h1YJyKztvmqtT`) — in flight; the puppet, band forms, instruments, hop cycle, hand. Not merged.
  - `claude/horowo-clip-props-lrxscd` (Opus, `session_01MZoAKBLUod263MnDXVYSWV`) — in flight; bunny, lettering, tallies, fall, globe, meadow. Not merged.
  - `claude/horowo-clip-tape-lrxscd` (Opus, `session_01MZoAKD4RDV89XAtTpvb3py`) — done, merged, session archived.
    The briefs each child was given are in the lead's transcript; the plan's § "The team" has each package's scope. A stopped child is replaced, not woken: a new session on the same branch with a brief that stands alone.
- **Waiting**: a one-shot check-in on wave 1 scheduled in the lead's session for 11:17 UTC on 2026-11-28; the cache keepalive watcher in the lead's session.
- **Estimate**: the whole job is booked on the lead's session (60 h designer, 32 h developer, 4 h audio-engineer, 6 h producer); nothing has been handed on.

### Watches

https://claude.ai/artifact/5hqSFnzRjgT8nVshU3oeKJ

The review board. It is private to the account that published it; a successor on another account builds and publishes its own (`/review-board`) and replaces the link in the PR's sticky comment.

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

1. Fetch each child branch above; merge what is pushed (`git fetch origin <b> && git merge origin/<b>`), run the quick gates, look at its frames, wire it into the page.
2. Publish the clip as it stands as an artifact (the engine's `bundle:clip` writes `tmp/clip/artifact/`), and the new frames on the board.
3. Wave 2: the scenes of the plan's § "The cut by feel", sized to the limit left; then the assembly cut to the pulse, the kick and the snare.
4. The mp4 as a release asset; `/polish`; green `./scripts/vet.sh`; `/pr` refresh. Never merge.
5. Limit allowing: the 30-second vertical story cut. Then the video on the song's page — «это уже скорее после тебя опус займётся».

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Записал: в припеве теперь крутятся три картинки, которым в одной песне делать нечего, — луг, стена и концерт в студии, группа врезается по такту.

Детям это ничего нового не добавляет: играющая группа у куклы и так в задании, студию соберу во второй волне.
```
