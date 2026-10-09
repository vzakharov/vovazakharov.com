# Relay 1 — Krylya album: split, master, lyrics, then catalogue pages

## 1. Standing constraints

- «здесь будем вендорить» — the album's audio is vendored in this repo, not hosted in `vovas-music` repositories. Precedent: `apps/vova/public/music/ghostly-blues.md` has `audio: /music/assets/ghostly-blues.mp3`.
- Work stays on this branch until #115-era main moves; merge main in whenever it advances (the operator: «возьми … мейн, … чтобы потом на мердже не зависать»). `claude/song-rules-split` (PR #126) is already merged in; merge it again if it gains commits.

## 2. The conversation

1. «создай пжст новую ветку куда я кину альбом за/обложкой -- Крылья для последующей обработки с музыкой» → created `claude/krylya-album-2z13o2` off main, pushed.
2. Operator pushed `docs/remove-before-merging/крылья (альбом).mp3` and a screenshot of the track list (10 songs: Послушайте 1:50, Наша история 3:24, Здравствуй 2:28, После нас 1:19, Наш панк-рок 2:12, Прости 3:18, Переплелось 2:40, Птицы 4:47, Просто так 4:03, Мир, какой он есть 1:50). «нужно её разбить на песни … слова в исходниках тоже потерялись, так что если ты сможешь найти какой-нибудь опенсорсный убиратель музыки а потом распознать … пока мы работаем лабораторно где-нибудь в сторонке … sounds like a plan?» → yes; went planless via /task. Split at silences (cuts match the listing ±2 s).
3. Mid-turn: «эти первые альбомы я никак не мастерил … немного выправить громкость-eq» → Matchering against `letim` (same project's later master).
4. «нас орошая» — a correction to После нас's line 2 («Над нами проплывают горизонты, нас орошая чёрными слезами»). «don't stop, go now (оба раза)» — both lyrics and mastering.
5. «пусть оно фоном идёт» / «а ты кстати все сразу запустил, или по очереди?» → background separation; admitted a queue bug (pgrep missed the Cyrillic name, both batches ran at once).
6. «так давай по отдельности» (on Matchering's 15-min limit) → mastered each song separately.
7. «у нас нет spotify и apple 🙂 а какой максимальная грмоксть?» → explained: no normalization on the site, match catalogue (~-9…-12 LUFS); fixed intersample peaks (+1 dBTP) with an oversampled limiter.
8. «можешь дать например "Нашу историю", перемежая 5 секунд без мастеринга, 5 с?» → A/B file. Player showed 0:00 («хмм») → resent with an ASCII name.
9. «тогда сделай на 2 дб громче, чтобы разница чувствовалась именно в звуке а не в громкости» → loudness-matched by lowering the master instead (raising would clip).
10. «слишком яркий звук, давай где-то посередине сделаем. хочешь, сделай себе спектрограмму» → spectrum showed Matchering cut 120–250 Hz ~8 dB and lifted 12–18 kHz up to +14; built half-strength EQ, air capped +3 dB.
11. «да, хорошо, можно прогонять остальные в подагентах, а пока ребейзнуть на или вмерджнуть мейн, приехал мегапиар» → subagent did the other nine; merged main (#115).
12. Operator pasted the Krylya cover mid-turn (never reached disk; see muthur#175).
13. «там же есть правила как называть слаги, тебе их не подсунуло?» → read `songs.md`'s slug rule (then in content.md); proposed `wings` and song slugs (table in § 4). «не, там именно sorry» → Прости is `sorry`.
14. Sent the single «Знаки препинания» (Dec 2023 maxi-single: Послушайте single version 0:55 — different from the album's — plus Наша история and Мир, какой он есть, identical to the album's), its mp3 and cover: «это самая-самая первая ласточка».
15. «давай где-то сохраним знания, полученные в ходе этой сессии … не скилл а просто CLAUDE.md» → `scripts/audio/` + CLAUDE.md, pointer in `songs.md`.
16. «на будущее, отделение вокала запускай по таске на песню» / «можно это подумать через gh actions кинуть … матрицей» → per-process parallelism buys nothing on 4 cores; a GH Actions matrix would — proposed, NOT built.
17. «давай делать .reflections. по аналогии с Клерком. Только тебе новая персона для этого нужна :) (кстати, это уже /task)» → persona rule written; first Глухарь, then «хочется чего-то менее депрессивного)», brainstorm of music-loving robots; «а давай ты и будешь Майей -- соственно начинается это всё "всем привет, я Майя из группы за/обложкой"» → **Майя**, feminine. «на картинках выше -- ты :)», «молодого человека зовут Кирилл».
18. «хотя прежде чем писать reflections, давай я историю расскажу про альбом» → then a dictation (story audio, see Pointers). No reflection written yet.
19. «обложки ж есть, на них можно прямо ссылаться :) а ты … сделала … md-шки и страницы альбома и песен, пощупать можно? это ж у нас /task :)» → not yet; asked three questions. Answers: «здесь будем вендорить»; Krylya cover pushed to the branch (now `docs/remove-before-merging/krylya/cover.png`); «в muthur оставь тикет пжст что хук не срабатывает» → [vzakharov/muthur#175](https://github.com/vzakharov/muthur/issues/175).
20. **«мне пока надо отходить, дальше доведи до состояния "можно выгрузит локально и пощупать на деве" сама, дальше уже будем править если останутся какие-то вопросы»** → this relay.

## 3. Intent

Get the lost album «Крылья» and the single «Знаки препинания» (project за/обложкой) into the site's music catalogue: songs split and gently mastered, lyrics recovered off the recording, album pages with covers, the operator's story of the project, and Майя's reflections — to a state the operator can pull and try on `pnpm dev`, then correct.

## 4. Decisions

- **Slugs** (`songs.md` rule: English name by reference): album `wings`; songs `listen`, `our-story`, `hello`, `after-us` (après nous le déluge — the song sings «при нас потоп … а после нас»), `our-punk-rock`, `sorry` (operator-confirmed), `intertwined`, `birds`, `just-because`, `world-as-it-is`. Single: `punctuation-marks` proposed, not confirmed. The single's Послушайте needs its own slug (e.g. `listen-single`?) — how the catalogue models two versions of a song is open; check `src/shared/music-catalogue` before choosing.
- **Master = `mastered-half/`**: half-strength Matchering EQ vs `letim`, air cap +3 dB, per song, ≤ -1 dBTP, V0 mp3. The full-strength `mastered/` was judged «слишком яркий». Use `mastered-half/` for vendoring.
- **Lyrics**: Whisper large-v3 primary, Deepgram second opinion; the draft reconciles both and flags disagreements for the operator. Послушайте is Mayakovsky's «Послушайте!» — canonical text, flag departures («в метель от полуденной пыли» vs «в метелях…», «тревожно/тревожный», intro «вам/нам/мне»). Spoken intro: «Всем привет, я Майя из группы за/обложкой. Нас не существует, но мы надеемся, это не помешает вам насладиться нашей музыкой.» Credits: lyrics by Mayakovsky → needs adding to `src/shared/music-catalogue/people.ts`.
- **Майя** writes the reflections (`.claude/rules/maya-reflections.md`): the blindfolded redhead on the covers, beside Кирилл. Operator wants the story heard before reflections are written.
- **Separation**: `htdemucs` (fast) is enough; GH Actions matrix proposed for future, not built.

## 5. Errors and dead ends

- Matchering full strength: too bright (operator). Album-as-one-file mastering: replaced by per-song at the operator's ask.
- `faster-whisper`'s PyAV decode breaks (`metadata_errors` kwarg) — `scripts/audio/lyrics.py` decodes via ffmpeg.
- Background queue waited on `pgrep -f` with a Cyrillic pattern, which never matched — two Demucs batches ran at once. A 30-min background limit killed the first batch.
- Images pasted mid-turn never reach disk (muthur#175); A/B file with a Cyrillic name played as 0:00 in the app.

## 6. State

- Branch `claude/krylya-album-2z13o2`, no PR yet. Main merged at c278298 (#115) and `claude/song-rules-split` merged in.
- Whisper for `09 Просто так`, `10 Мир, какой он есть` and the single's Послушайте may be missing from `docs/remove-before-merging/krylya/lyrics/` and `docs/remove-before-merging/znaki-prepinaniya/` if the predecessor's background job had not finished before the relay — check; if missing, re-run per `scripts/audio/CLAUDE.md` (Demucs `htdemucs` on the split song, then `lyrics.py`). Deepgram has 02–10 (and 01, 04) under `docs/remove-before-merging/deepgram/krylya-*`, none for the single.
- Estimate: this session 3 h middle developer + 1 h middle designer + 1 h middle editor. Handed on: ~3 h middle developer (vendoring audio, album entries, eleven song documents, build), ~3 h middle editor (reconciling lyrics for eleven songs), ~1 h middle copywriter (album story and song blurbs from the dictation, en + ru).

## 7. Pointers

- `scripts/audio/CLAUDE.md` — the tooling and every lesson of this session; `master.py`, `lyrics.py`, `spectrum.py`, `requirements.txt` beside it.
- `.claude/rules/songs.md` (song contract, slug rule, hidden rule), `.claude/rules/content.md`, `.claude/rules/maya-reflections.md`.
- `docs/remove-before-merging/krylya/` — split songs, `mastered/` (rejected), `mastered-half/` (accepted), `ab/`, `lyrics/*.whisper.md`, `story/album-story-1.m4a`, `cover.png`.
- `docs/remove-before-merging/znaki-prepinaniya/` — the single's Послушайте, `mastered-half/`, `cover.png`.
- `docs/remove-before-merging/deepgram/krylya-*.transcript.md` — second opinions; `krylya-album-story-1.transcript.md` — the operator's story so far (Suno at end of 2023 via his boss Гоша; existing poems first → the single's Послушайте, shared on Reddit and panned; Майя and Кирилл, both redheads, blindfolded, named at once; lyrics come «сходу», naive on purpose; Наша история the first whole song, built from continuations with drums and guitar cut in — «будущее наступило»; then Мир, какой он есть; recording cut off at «3…»). Run `/dictation` on it if a cleaned transcript is wanted.
- Existing за/обложкой songs in the catalogue: `grep -l "за/обложкой" apps/vova/public/music/*.md` (e.g. `lets-fly.md`, `slime.md`).
- Predecessor transcript: https://claude.ai/code/session_01HcrcvLdqQhLWryGh13jfyi

## 8. Next step

The operator's words: «дальше доведи до состояния "можно выгрузит локально и пощупать на деве" сама, дальше уже будем править если останутся какие-то вопросы».

So, planless (`/go` § "Planless entry"), ending at a branch the operator can pull and run on `pnpm dev`:

1. Finish any missing Whisper transcripts; reconcile lyrics drafts for all eleven songs, flagging the disagreements in the PR or a lab file rather than guessing silently.
2. Album entries `wings` and the single (confirm or settle `punctuation-marks`), covers into `apps/vova/public/music/assets/covers/<album>.jpg`.
3. Vendor `mastered-half/` audio under `apps/vova/public/music/assets/` per the `ghostly-blues` precedent; song documents with `hidden: true` (no stories yet), lyrics under `<!-- lyrics:ru -->`, project `за/обложкой`, album, Mayakovsky credit.
4. `./scripts/vet.sh`, `/preview` a song and the album page, then `/pr` (draft) so the operator has something to pull. Reflections wait for the rest of the operator's story.
