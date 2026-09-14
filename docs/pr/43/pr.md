# PR #43: content: capture the late-stage-agentic dictations and the pipeline behind them

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/43
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/late-stage-agentic-phnz8v
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-14T08:22:50Z
- **Updated:** 2026-09-14T10:08:38Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

Two spoken passes at a new project, written down so they stop living in audio files — and, after review, the pipeline that will do it for the rest of them.

**What it is.** An English site at `latestageagentic.com` plus a Russian Telegram channel, «Клод четвёртой стадии», both about human–agent collaboration: where the person sits in the arrangement, and whether fast and good can be had at once. The larger idea behind the site is a wiki — lessons from actual work, written to be read by agents as much as by people, because that kind of experience is exactly what an agent cannot find in the training set.

**The dictations.** `writing/late-stage-agentic/dictations/`, one file per recording:

| File | What it is |
| --- | --- |
| `p1-the-idea.md` | The premise: the site, the channel, the wiki, why Russian, how the content flows between the two languages. |
| `p2-the-limits.md` | The first content video: why a human is still needed at all, circling limitedness — a person holds only part of the experience there is, a model that absorbed all of it finds a sunset exactly as beautiful as it is indifferent. |

Both are **transcripts, not prose rewrites** — the review's central point, and the reason they were rebuilt from the raw recognizer output rather than edited: the same text becomes the subtitle track, where a sentence that does not match the audio is simply wrong. Filler and false starts out, punctuation and headings in, wording and order left alone. Every place the recognizer was guessing is tabled at the foot of each file, against what it actually heard, so a wrong reading is visible without opening the JSON.

**The pipeline**, split as the review asked:

| Piece | What it owns |
| --- | --- |
| `scripts/transcribe.py` | Everything a re-run does identically: probe the media, reduce a video to mono 64k AAC, call Deepgram, save the whole response, render `<slug>.transcript.md` — a timecoded line per sentence, then every word scored under 0.6. |
| `.claude/skills/dictation/SKILL.md` | The judgement: which words in the recognizer's output are the speaker's and which are its mistakes. Carries the transcript-not-rewrite rule and the do/don't table. |

The low-confidence section is the useful half of the script: on p2 it flags `той` at 0.21 and `изменил` at 0.27, two of the places the text needed a human. It catches three of seven such places, which is why both the script's output and the skill say to read the transcript as well rather than trusting the list.

Subtitles are not built. The skill records why they belong to it rather than to a skill of their own: their input is the *corrected* text, since a track built from the raw response would put the mis-hearings back on screen. The per-word timings are kept for that step — the API will not hand them back without another call.

**What is deliberately not in it.** No plan, no draft post, no site code. More dictations land here as they are recorded; the project then moves to its own repo via `/spinoff`.

**Open, for the operator.** Whether recordings live in git, and where — argued on the thread against `first-content.mp4`. Short version: audio is the irreplaceable source and is 25× smaller, the video is an artifact Telegram will hold once posted, and there is no middle option that both keeps the video and keeps `main` small except LFS. Everything under `docs/remove-before-merging/` goes out with the sweep at finalize either way.

## QA Checklist

- [ ] `script` — `python3 scripts/transcribe.py <any short audio> --out-dir tmp/dg` writes both files and prints their paths; a second run without `--force` refuses instead of re-billing the call.
- [ ] `video` — run it against `docs/remove-before-merging/first-content.mp4`; it reports the extraction (~84 MB → ~3.3 MB) before uploading.
- [ ] `transcripts` — read `p2-the-limits.md` against the audio: each sentence should be findable in `docs/remove-before-merging/deepgram/p2-the-limits.transcript.md`.
- [ ] `garbles` — the table at the foot of each dictation file is where the recognizer guessed; correct any wrong reading in place.
- [ ] `scripts` — `python3 scripts/pr-body.py`, `python3 scripts/export-github-item.py` and `cd scripts && python3 test_authorship.py` still run after `die()` moved to `lib/cli.py`.

| Item | Automatable | Covered? | Notes |
| --- | --- | --- | --- |
| `script` | Yes | No | Would need a recorded Deepgram response to replay; not worth a fixture yet. |
| `video` | Yes | No | Same — ffmpeg half is testable without the API, the API half is not. |
| `transcripts` | No | n/a | The judgement this branch exists to make; a human ear is the check. |
| `garbles` | No | n/a | Operator-only — he is the one who knows what he said. |
| `scripts` | Yes | Partly | `test_authorship.py` covers the exporter's labelling; the import move is covered by the three running at all. |


Draft, and staying draft until there is enough dictated to build from.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Hhsu3uVmJyAJquBFxDr5kq

---

## Comments

### Comment by @vzakharov (agent) on 2026-09-14T09:51:35Z

[https://github.com/vzakharov/vovazakharov.com/pull/43#issuecomment-5662142040](https://github.com/vzakharov/vovazakharov.com/pull/43#issuecomment-5662142040)

Proposed squash title/body:

```
content: the late-stage-agentic dictations and their pipeline (pr #43)
```

```
Two recordings existed only as audio, and there will be more of them:
a phone dictation laying out a new project -- an English site at
latestageagentic.com beside a Russian Telegram channel, both about
where the person sits in human-agent collaboration -- and a video
arguing that a human is still needed because a human is limited,
holding only part of the experience there is while a model that
absorbed all of it finds a sunset exactly as beautiful as it is
indifferent.

Both land under writing/late-stage-agentic/dictations/ as transcripts
rather than prose, which is the constraint the whole change turns on:
the same text becomes the subtitle track, so a sentence that reads
better than the audio is wrong. Filler and false starts come out,
punctuation and headings go in, wording and order stay. Each file
ends with a table pairing what the recognizer heard against what the
text says, so a guess is visible without opening the response.

scripts/transcribe.py takes everything a re-run would do identically
-- reduce a video to mono 64k AAC, call Deepgram, keep the whole
response, render a timecoded transcript that ends with the words
scored under 0.6 -- and .claude/skills/dictation/SKILL.md takes the
judgement the script cannot make: which words in the output are the
speaker's and which are its mistakes. The responses are kept because
their per-word timings are what a subtitle track is built from and
the API will not return them without another call; the skill records
why subtitles will belong to it rather than to a skill of their own,
their input being the corrected text and not the raw response.

die() moves to scripts/lib/cli.py on the way, the transcription
script being the first caller that has nothing to do with GitHub.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

### `docs/remove-before-merging/deepgram/README.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-14T09:27:46Z

let's make it into a script (deterministic part) + skill (manual part), to be used on future videos & audios. Videos will also have to be subtitled (not now, we'll get to this), but idk if that's part of the same skill or better a new one.

**@vzakharov (agent)** — 2026-09-14T09:49:24Z

Сделано в 135c0c7.

`scripts/transcribe.py` — детерминированная часть: ffprobe, извлечение аудио из видео (моно 64k AAC), вызов Deepgram с зафиксированными параметрами, сохранение всего ответа и рендер `<slug>.transcript.md` — по строке на предложение с таймкодом, а в конце все слова, которым распознавалка дала меньше 0.6.

Эта последняя секция оказалась полезнее, чем я ожидал: на p2 она помечает «той» с 0.21 (там было «предрелизный») и «изменил» с 0.27 (там было «кода, который сгенерил Клод») — то есть ровно те места, которые ты правил руками. Но не все: из семи мест, где текст пришлось поправить, список ловит три. Так что в скилле написано «сначала прочитай список, потом всё равно прочитай расшифровку» — переоценивать его не стоит.

`.claude/skills/dictation/SKILL.md` — часть, где нужно решение: какие слова в выдаче твои, а какие её ошибки. Там же зафиксировано правило из твоего третьего комментария (транскрипция, а не пересказ) и таблица «что делать / чего не делать».

Про субтитры: думаю, **в этот же скилл**, и вот почему. Их вход — не JSON, а выправленный текст: ты правишь ошибки распознавания в файле диктовки, и трек, собранный из сырого ответа, вернёт на экран те самые ошибки, которые ты убрал. То есть это не отдельный конвейер, а последний шаг этого. Отдельным будет скрипт (`<slug>.deepgram.json` + выправленный текст → `.srt`/`.vtt`), но решения те же самые и живут в одном месте.

---

### `docs/remove-before-merging/first-content.mp4`:1 — unresolved

**@vzakharov (human)** — 2026-09-14T09:28:38Z

к твоему вопросу, да, мы хотим сохранять эти видео в репе. На мейне или нет -- пока не решил; ты как думаешь?

**@vzakharov (agent)** — 2026-09-14T09:49:42Z

Моё мнение: **аудио — на мейн, видео — нет.**

Сначала про «на мейне или нет», потому что там нет середины, которую можно было бы выбрать. Если видео живёт только в ветке и выметается при финализации, то после удаления ветки GitHub рано или поздно соберёт объекты в мусор, и в свежем клоне их не будет. То есть «не на мейне» на практике означает «не сохранили». Хранить и при этом не платить за это клоном — только через Git LFS.

Дальше арифметика. Одно видео — 84 МБ, извлечённое из него аудио — 3.3 МБ, в 25 раз меньше. Если запись раз в неделю, то плоским гитом это ~4 ГБ в год, и их тянет каждый клон: твой, каждая сессия агента, каждый прогон деплоя. LFS это чинит, но бесплатная квота GitHub — 1 ГБ хранения и 1 ГБ трафика в месяц, то есть примерно на три месяца; дальше $5/мес за пакет на 50 ГБ.

А теперь — зачем видео в репе. Всё, что репозиторий с ним делает, он делает с аудио: расшифровка, тайминги, субтитры. Картинку потребляет только заливка в канал, и после заливки её держит телеграм. Так что аудио — это действительно исходник, который нельзя восстановить, а видео — уже опубликованный артефакт.

Поэтому я бы клал в `writing/late-stage-agentic/dictations/` рядом с текстом только `.m4a`, а видео оставлял вне гита. Если мастер-видео всё-таки хочется держать самому — тогда LFS и отдельный путь, но это уже решение про деньги, и его принимать тебе.

Пока: положил `p2-the-limits.m4a` (3.3 МБ) рядом с mp4 в `remove-before-merging/` — конвейеру нужен именно он. 84 МБ mp4 всё ещё там же и всё ещё в истории ветки.

**@vzakharov (human)** — 2026-09-14T10:01:56Z

> то после удаления ветки GitHub рано или поздно соберёт объекты в мусор, 

я не удаляю ветки. я хочу иметь возможность возвращаться к прошлым пиарам и видеть видео, которые легли в основу всего.

> и их тянет каждый клон: твой, каждая сессия агента, каждый прогон деплоя

кажется, агенты и деплой делаю shallow?

> то плоским гитом это ~4 ГБ в год

можно зипить. можно сжимать сами видео -- как понимаю, я их беру через айфон > телеграм > скачать, вполне вероятно там не оптимальные параметры сжатия.

> LFS это чинит

не хочу, дополнительная сложность вне зависимости от цены (о которой тоже, конечно, не хочется думать)

> Всё, что репозиторий с ним делает, он делает с аудио

не совсем. Под "субтитрами" я подразумевал прямо вставку слов на видео -- как знаешь всякие тиктокеры делают? Это именно обработка видео, не просто создание доп. файла.

---

### `writing/late-stage-agentic/dictations/p2-the-limits.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-14T09:33:52Z

начал править вручную (см. последний коммит) -- но потом понял, что ты слишком сильно переделываешь исходник. Нужно ближе к тексту, по двум причинам: а) он передаёт мою манеру говорить и выражаться и б) мы будем ставить субитры на видео. То есть это должна быть именно транскрипция, а не перефразирование. Убирать ошибки-сбивки, добавлять абзацы и знаки препинания это ок, заголовки тоже помогают, но в основному нужно ближе.

**@vzakharov (agent)** — 2026-09-14T09:49:57Z

Принято, переделал оба файла в 19192d4 — и p2, и p1, потому что p1 был переписан ещё сильнее.

Собирал заново от сырой расшифровки, а не правил то, что было. Проверка, которую я теперь применяю к каждому предложению: оно должно находиться в `<slug>.transcript.md`. Если не находится — это пересказ. Убирал паразитов, ложные начала и повторы; расставлял знаки и абзацы; заголовки оставил. Всё остальное — твой порядок слов, включая «ну», «вот», «значит» и «настолько же им всё равно» три раза подряд.

Это же правило записано в `.claude/skills/dictation/SKILL.md` вместе с таблицей «что делать / чего не делать», чтобы следующая запись не уехала обратно в прозу.

Твои правки из caa6238 сохранил дословно. Два места, которые я **не** трогал и которые лучше глянь сам:

- «со своим Клодом **огода** кожу» — похоже на опечатку, но это твой текст, так что не лезу. «года»?
- internal note про спряжение оставил в тексте как есть — скажи, если он должен уйти перед публикацией.

Таблица неразобранного внизу файла теперь двухколоночная: что услышал Deepgram против того, что стоит в тексте. У p2 в ней шесть строк вместо трёх — прошлая версия часть догадок просто сгладила. «Плейграм кейс-стади» в p1 вернул по твоему сообщению в чате.

---

### `scripts/transcribe.py`:27 — unresolved

```diff
@@ -0,0 +1,297 @@
+#!/usr/bin/env python3
+"""Turn one recording into a Deepgram response and a timecoded transcript.
+
+Usage:
+  python3 scripts/transcribe.py <media> [--slug SLUG] [--out-dir DIR]
+                                       [--audio-out PATH] [--model MODEL]
+                                       [--language LANG] [--force]
+
+`<media>` is audio or video in anything ffmpeg reads. A file carrying a video
+stream is first reduced to mono 64 kbit/s AAC — speech recognition hears no
+difference and the upload shrinks by roughly 25x — and the extracted audio is
+thrown away unless `--audio-out` names somewhere to keep it.
+
+Two files come back, named for the slug (the input's stem unless `--slug` says
+otherwise) under `--out-dir` (default `docs/remove-before-merging/deepgram/`):
+
+  <slug>.deepgram.json    the whole response, kept because per-word timings and
+                          confidences are what a subtitle track is built from
+                          and the API will not hand them back a second time
+  <slug>.transcript.md    one line per sentence with its timecode, plus the
+                          words Deepgram was least sure of
+
+The second file is the one a person or an agent reads. This script makes no
+decision a re-run could make differently; the judgement is
+`@.claude/skills/dictation/SKILL.md`'s.
+
+Requires `ffmpeg`/`ffprobe` on PATH and `DEEPGRAM_API_KEY` in the environment.
```

**@vzakharov (human)** — 2026-09-14T10:03:12Z

давай ауто-устанавливать (вместо вылета по ошибке) если их нет (к ключу, разумеется, не относится)

---

### `.claude/skills/dictation/SKILL.md`:67 — unresolved

```diff
@@ -0,0 +1,100 @@
+---
+description: Turn a dictation — a video shot on camera or audio talked into a phone — into a transcript file under writing/<project>/dictations/. Runs scripts/transcribe.py for the deterministic half, then does the half that needs judgement: cleaning the recognizer's output into readable Russian without rewriting it. Invoke as `/dictation <media file> [<slug>]`. Use when the operator drops a recording into the repo, says "расшифруй", "transcribe this", or commits a video and asks what it says.
+---
+
+End state of this skill: `writing/<project>/dictations/<slug>.md` holds the
+recording as readable text in the speaker's own words, the whole Deepgram
+response is kept beside the media, and every place the recognizer was guessing
+is listed at the foot of the file for the operator to correct.
+
+## The split
+
+`scripts/transcribe.py` does everything a re-run would do identically: extract
+audio from video, call Deepgram, save the response, render a timecoded
+transcript. This skill does the rest, which is one judgement repeated a few
+hundred times — **which words in the recognizer's output are the speaker's, and
+which are its mistakes.**
+
+The script's header carries its flags. The short form:
+
+```bash
+python3 scripts/transcribe.py <media> --slug <slug> \
+  --audio-out docs/remove-before-merging/<slug>.m4a
+```
+
+It writes `<slug>.deepgram.json` and `<slug>.transcript.md` under
+`docs/remove-before-merging/deepgram/`.
+
+## Step 1 — Get the media into the repo
+
+The operator delivers a recording one of two ways, and they are not
+interchangeable:
+
+- **Committed to the branch.** `git pull` — the file is in the tree. When the
+  operator says "pull", this is what they mean; do not go looking through the
+  session's upload directory first.
+- **Attached to a chat message.** It lands in the container's uploads directory
+  and **exists nowhere else** — the transcript outlives it, the file does not.
+  Copy it under `docs/remove-before-merging/` as the first thing you do with it.
+
+## Step 2 — Run the script, then read the transcript
+
+`<slug>.transcript.md` is what you work from, not the raw JSON. It carries one
+line per sentence with a timecode, and — at the foot — every word Deepgram
+scored under 0.6.
+
+**Read that list first, then read the transcript anyway.** It concentrates the
+mis-hearings without holding all of them — on the recordings so far it caught
+three of the seven places the text needed a correction.
+
+## Step 3 — Write the dictation file
+
+`writing/<project>/dictations/<slug>.md`, no frontmatter — the keys in
+`@.claude/rules/writing.md` describe post drafts, and this is not one.
+
+**This is a transcript, not a rewrite.** Two things depend on it: it is the
+speaker's own manner of talking, and it becomes the subtitle track on the video,
+where a sentence that does not match the audio is simply wrong. So:
+
+| Do                                               | Don't                                   |
+| ------------------------------------------------ | --------------------------------------- |
+| Cut filler, false starts, repeated words         | Tighten a sentence that is merely loose |
+| Add punctuation, paragraph breaks, headings      | Reorder clauses to read better          |
+| Fix what the recognizer misheard                 | Replace a word with a better word       |
+| Spell out numbers and acronyms as they were said | Summarize, merge or drop a digression   |
+
+The test is a line-by-line one: **for each sentence you write, the same sentence
+should be findable in `<slug>.transcript.md`.** When it is not, you have
```

**@vzakharov (human)** — 2026-09-14T10:04:47Z

хм, как такое получится, если там будут поправляться ошибки, пунктуация и пр.?

---

### `.claude/skills/dictation/SKILL.md`:55 — unresolved

```diff
@@ -0,0 +1,100 @@
+---
+description: Turn a dictation — a video shot on camera or audio talked into a phone — into a transcript file under writing/<project>/dictations/. Runs scripts/transcribe.py for the deterministic half, then does the half that needs judgement: cleaning the recognizer's output into readable Russian without rewriting it. Invoke as `/dictation <media file> [<slug>]`. Use when the operator drops a recording into the repo, says "расшифруй", "transcribe this", or commits a video and asks what it says.
+---
+
+End state of this skill: `writing/<project>/dictations/<slug>.md` holds the
+recording as readable text in the speaker's own words, the whole Deepgram
+response is kept beside the media, and every place the recognizer was guessing
+is listed at the foot of the file for the operator to correct.
+
+## The split
+
+`scripts/transcribe.py` does everything a re-run would do identically: extract
+audio from video, call Deepgram, save the response, render a timecoded
+transcript. This skill does the rest, which is one judgement repeated a few
+hundred times — **which words in the recognizer's output are the speaker's, and
+which are its mistakes.**
+
+The script's header carries its flags. The short form:
+
+```bash
+python3 scripts/transcribe.py <media> --slug <slug> \
+  --audio-out docs/remove-before-merging/<slug>.m4a
+```
+
+It writes `<slug>.deepgram.json` and `<slug>.transcript.md` under
+`docs/remove-before-merging/deepgram/`.
+
+## Step 1 — Get the media into the repo
+
+The operator delivers a recording one of two ways, and they are not
+interchangeable:
+
+- **Committed to the branch.** `git pull` — the file is in the tree. When the
+  operator says "pull", this is what they mean; do not go looking through the
+  session's upload directory first.
+- **Attached to a chat message.** It lands in the container's uploads directory
+  and **exists nowhere else** — the transcript outlives it, the file does not.
+  Copy it under `docs/remove-before-merging/` as the first thing you do with it.
+
+## Step 2 — Run the script, then read the transcript
+
+`<slug>.transcript.md` is what you work from, not the raw JSON. It carries one
+line per sentence with a timecode, and — at the foot — every word Deepgram
+scored under 0.6.
+
+**Read that list first, then read the transcript anyway.** It concentrates the
+mis-hearings without holding all of them — on the recordings so far it caught
+three of the seven places the text needed a correction.
+
+## Step 3 — Write the dictation file
+
+`writing/<project>/dictations/<slug>.md`, no frontmatter — the keys in
+`@.claude/rules/writing.md` describe post drafts, and this is not one.
+
+**This is a transcript, not a rewrite.** Two things depend on it: it is the
```

**@vzakharov (human)** — 2026-09-14T10:06:51Z

я думаю стоит ли создавать какой-то отдельный файл (или возможно lede-текст выше транскрипиции) с саммари того что было сказано. Оператору это самому поможет понять (ага, значит, вот о таком я говорил). Аналогично, *после* транскрипта вставлять мысли агента: что думаешь о том, что наговорено, что возможно пропущено, что возможно наоборот стоит сократить.

---

## Timeline (status, references, and other events)

- **2026-09-14T09:34:00Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/43#pullrequestreview-5196067098.
- **2026-09-14T09:50:59Z** @vzakharov renamed from «content: capture the late-stage-agentic dictation as prose» to «content: capture the late-stage-agentic dictations and the pipeline behind them».
- **2026-09-14T10:08:38Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/43#pullrequestreview-5196357420.
