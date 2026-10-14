# PR #138: feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/138
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/spectrogram-reddit-log
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-10T20:11:45Z
- **Updated:** 2026-10-14T11:52:39Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 11

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/assets/spectrograms/hello.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:30:17Z — "здесь и далее цитаты -- из твоих сообщений в сессии. > Здрав…" → [↓](#t01)
- **T02** `apps/vova/public/music/assets/spectrograms/hello.png`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:31:36Z — "тут, кажется, проблема в том что небасовый аккомпанемент (фо…" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/spectrograms/our-punk-rock.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:35:26Z — "> у меня соль мажор, у librosa до минор До минор, плюс это ж…" → [↓](#t03)
- **T04** `apps/vova/public/music/assets/spectrograms/our-story.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:36:05Z — "> Наша история: у меня ля минор, у librosa ре минор. Какой и…" → [↓](#t04)
- **T05** `apps/vova/public/music/assets/spectrograms/just-because.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:39:56Z — "> Просто так: у меня 121 BPM, у librosa 89. Это не ошибка вд…" → [↓](#t05)
- **T06** `apps/vova/public/music/assets/spectrograms/listen-single.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:41:07Z — "> Послушайте (сингл): у меня 110, у librosa 86, снова около…" → [↓](#t06)
- **T07** `apps/vova/public/music/assets/spectrograms/world-as-it-is.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:43:04Z — "> Мир, какой он есть: у меня 132, у librosa около 153. Какой…" → [↓](#t07)
- **T08** `.claude/rules/maya-reflections.md`:46 — unresolved — last: @vzakharov (human) 2026-10-14T11:45:53Z — "это правильное замечание; вообще я посмотрел на эти текстови…" → [↓](#t08)
- **T09** `apps/vova/public/music/assets/spectrograms/after-us.png`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:47:48Z — "относится ко всем песням: а давай-ка ещё добавим строчку уда…" → [↓](#t09)
- **T10** `.claude/rules/maya-reflections.md`:42 — unresolved — last: @vzakharov (human) 2026-10-14T11:49:02Z — "а давай для автоматически определённых полос (те что отмечаю…" → [↓](#t10)
- **T11** `scripts/song-intake/song_facts.py`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:51:05Z — "слишком большой, надо разбивать" → [↓](#t11)

---

## Body

## Summary

Puts the ideas from three Reddit threads about `scripts/song-intake/spectrogram.py` into the script. Those threads ([r/DSP](https://www.reddit.com/r/DSP/comments/1x29wdc/), [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1x29x26/), [r/claudexplorers](https://www.reddit.com/r/claudexplorers/comments/1x2a0q2/)) are about a picture that lets a model that cannot hear a song still read it at a glance. The plan is `docs/plans/spectrogram-reddit-log.draft.do-not-implement.md`. The log it comes from is `docs/remove-before-merging/spectrogram-reddit.md`.

- **Tuning.** The script measures how far the song sits off A440 and shifts the note grid by that much. A song tuned a quarter-tone off then stops splitting every note across two rows of the chromagram.
- **Tempo** goes in the title, as a range when it drifts. A beat tracker that follows the drift places the beats (Ellis's dynamic programming, in numpy), and the tempo is read off them, section by section.
- **A text sidecar** beside each PNG holds the exact values a picture only approximates: tempo, key with its confidence, tuning, and per section the start and end, the loudness and the chords, with a repeating loop folded.
- **`--from/--to`** renders a stretch of the song at full width, with beat lines once they fall far enough apart to see.
- **A check of the sidecars** comes last. librosa computes the key, tempo and chords of each of the eleven songs, and every disagreement with a sidecar goes to Vova, since a wrong number stated flatly misleads more than a vague picture.

The analysis moves to a numpy-only `song_facts.py`, with its own tests on synthetic signals.

## QA Checklist

- [ ] `tuning` — a song rendered with its pitch shifted 30 cents shows the same bright rows as the original, and its title names the offset.
- [ ] `tempo` — the title's BPM for Птицы matches a tap-along within 10%.
- [ ] `sidecar` — `birds.txt` names G minor and the bass loop G E♭ F, and its section times match the PNG's dashed lines.
- [ ] `zoom` — `--from 2:52 --to 3:57` on Птицы shows song-time ticks and beat lines.
- [ ] `sidecar-check` — `docs/remove-before-merging/sidecar-check.md` lists every song where librosa disagrees, and each disagreement is settled.

| Item            | Automatable                      | Covered?             | Notes                        |
| --------------- | -------------------------------- | -------------------- | ---------------------------- |
| `tuning`        | yes, a synthetic sine            | `test_song_facts.py` | the real song needs a look   |
| `tempo`         | yes, a click train               | `test_song_facts.py` | a real song needs an ear     |
| `sidecar`       | its formatting yes; its truth no | partly               | truth is `sidecar-check`'s   |
| `zoom`          | no                               | no                   | visual                       |
| `sidecar-check` | the comparison yes               | a one-off script     | Vova settles a disagreement  |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01RaJ4nBbVz3BvAFp5JP2qK2

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T20:44:20Z — "Proposed squash title/body: ``` feat(vova): tuning, tempo, a…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T20:44:20Z

[https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6154829473](https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6154829473)

Proposed squash title/body:

```
feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram (pr #138)
```

```
A model reads a song through spectrogram.py's picture, and Reddit
feedback on it named what the picture could not carry: a song tuned off
A440 splits each note across two chromagram rows, and a key or tempo
read off a picture is approximate where a number is exact.

The script now measures the song's tuning and shifts its note grid by
it, tracks beats that follow a drifting tempo into the title, and
writes a text sidecar beside each PNG: tempo, key with its Krumhansl
confidence, tuning, and per section its span, tempo, loudness and
chords, a repeating loop folded. --from/--to renders a stretch at full
width with its beats. The analysis lives in a numpy-only song_facts.py
with its own tests.

Every committed spectrogram is re-rendered with its sidecar, and each
sidecar's key, tempo and chords are checked against librosa, the
disagreements settled by the songs' author.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/vova/public/music/assets/spectrograms/hello.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:30:17Z — "здесь и далее цитаты -- из твоих сообщений в сессии. > Здрав…" → [↓](#t01)
- **T02** `apps/vova/public/music/assets/spectrograms/hello.png`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:31:36Z — "тут, кажется, проблема в том что небасовый аккомпанемент (фо…" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/spectrograms/our-punk-rock.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:35:26Z — "> у меня соль мажор, у librosa до минор До минор, плюс это ж…" → [↓](#t03)
- **T04** `apps/vova/public/music/assets/spectrograms/our-story.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:36:05Z — "> Наша история: у меня ля минор, у librosa ре минор. Какой и…" → [↓](#t04)
- **T05** `apps/vova/public/music/assets/spectrograms/just-because.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:39:56Z — "> Просто так: у меня 121 BPM, у librosa 89. Это не ошибка вд…" → [↓](#t05)
- **T06** `apps/vova/public/music/assets/spectrograms/listen-single.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:41:07Z — "> Послушайте (сингл): у меня 110, у librosa 86, снова около…" → [↓](#t06)
- **T07** `apps/vova/public/music/assets/spectrograms/world-as-it-is.txt`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:43:04Z — "> Мир, какой он есть: у меня 132, у librosa около 153. Какой…" → [↓](#t07)
- **T08** `.claude/rules/maya-reflections.md`:46 — unresolved — last: @vzakharov (human) 2026-10-14T11:45:53Z — "это правильное замечание; вообще я посмотрел на эти текстови…" → [↓](#t08)
- **T09** `apps/vova/public/music/assets/spectrograms/after-us.png`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:47:48Z — "относится ко всем песням: а давай-ка ещё добавим строчку уда…" → [↓](#t09)
- **T10** `.claude/rules/maya-reflections.md`:42 — unresolved — last: @vzakharov (human) 2026-10-14T11:49:02Z — "а давай для автоматически определённых полос (те что отмечаю…" → [↓](#t10)
- **T11** `scripts/song-intake/song_facts.py`:1 — unresolved — last: @vzakharov (human) 2026-10-14T11:51:05Z — "слишком большой, надо разбивать" → [↓](#t11)

<a id="t01"></a>

### `apps/vova/public/music/assets/spectrograms/hello.txt`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:30:17Z

здесь и далее цитаты -- из твоих сообщений в сессии.

> Здравствуй: у меня соль мажор, но соль минор отстаёт на волосок; librosa говорит до минор. Какая там тональность?

тут C минор, и даже ведь и  из картинки (до-мибемоль-соль) и из самих определённых аккордов (Cm G# Gm) это понятно?

И ещё, что значит "у меня" в дихотомии "у меня vs librosa"?

---

<a id="t02"></a>

### `apps/vova/public/music/assets/spectrograms/hello.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:31:36Z

тут, кажется, проблема в том что небасовый аккомпанемент (фортепиано в начале) залезает нижним краем в бас. Во-первых, вроде я там писал про сплит низа/верха по произвольной ноте (а не только по C какой-то октавы); во-вторых, давай на спектрограмме горизонтальным пунктиром отличать точку, где сплит; так откликающемуся будет видно, если это на самом деле один и тот же инструмент, разбитый в силу технологии.

---

<a id="t03"></a>

### `apps/vova/public/music/assets/spectrograms/our-punk-rock.txt`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:35:26Z

> у меня соль мажор, у librosa до минор

До минор, плюс это же видно по последовательности в куплете (третья секция): Cm D# G# G (хотя конечно с учётом тональности D# и G# было бы правильнее называть E♭ и A♭ соответственно, так и гармония читалась бы лучше).

> Дисторшн-пауэр-аккорды без терции, и мажор от минора по ним не отличить

Ну тут как минимум можно отличить по той самой линии куплета, которую выше писал. А так -- можно отличать по вокальной мелодии. Если например используется где-то малая терция, значит минор, большая -- мажор. Это я не для детерминированного вычисления (у меня пока что большие вопросы к тому зачем это вообще нужно), а для суждения откликающейся персоной.

---

<a id="t04"></a>

### `apps/vova/public/music/assets/spectrograms/our-story.txt`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:36:05Z

> Наша история: у меня ля минор, у librosa ре минор. Какой из двух?

ре минор

---

<a id="t05"></a>

### `apps/vova/public/music/assets/spectrograms/just-because.txt`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:39:56Z

> Просто так: у меня 121 BPM, у librosa 89. Это не ошибка вдвое: соотношение около 4 : 3, так обычно расходятся счёт шаффла и прямой пульс. Как она ощущается — на 120 или на 90?

90

---

<a id="t06"></a>

### `apps/vova/public/music/assets/spectrograms/listen-single.txt`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:41:07Z

> Послушайте (сингл): у меня 110, у librosa 86, снова около 4 : 3. Альбомная версия при этом совпала на 119.

86

---

<a id="t07"></a>

### `apps/vova/public/music/assets/spectrograms/world-as-it-is.txt`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:43:04Z

> Мир, какой он есть: у меня 132, у librosa около 153. Какой на самом деле?

110-115, но он там прямо сильно по ощущениям плавает, это такая, "пианинная" песня

---

<a id="t08"></a>

### `.claude/rules/maya-reflections.md`:46 — unresolved

```diff
@@ -37,7 +37,14 @@ paths:
… 6 lines elided …
+(`--from m:ss --to m:ss`), с долями поверх хромаграмм.
+
+Рядом с картинкой лежит `<slug>.txt`: темп, тональность, строй и аккорды по
+частям, числами. Читай его после картинки, не до: песню ты слышишь через
+картинку, а числа проверяют, верно ли ты услышала. Где они с картинкой
```

**@vzakharov (human)** — 2026-10-14T11:45:53Z

это правильное замечание; вообще я посмотрел на эти текстовики, им конечно доверять надо с осторожностью, те же последовательности аккордов там местами прямо так себе, что-то проглатывается, что-то, наоборот, добавляется.

---

<a id="t09"></a>

### `apps/vova/public/music/assets/spectrograms/after-us.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:47:48Z

относится ко всем песням: а давай-ка ещё добавим строчку ударных, определяя отдельно:
1- низкие
2- ведущие (snare, хлопки, такое)
3- цимбалы
4- quasi-pitched, типа томов

Кажется, у каждого из трёх должна быть какая-то сигнатура, по которой их можно вычленять (может даже librosa это и умеет).

то есть грубо говоря у нас должна быть как хромограмма piano roll'а, но на ней четыре полосы только. Так можно будет смотреть на ритм.

картинку нужно не ужимать по вертикали, а сделать чуть выше просто (добавив новую секцию снизу).

---

<a id="t10"></a>

### `.claude/rules/maya-reflections.md`:42 — unresolved

```diff
@@ -37,7 +37,14 @@ paths:
… 1 line elided …
 идёт то, что ты так услышала. Если её
 нет, сделай сама: `scripts/song-intake/spectrogram.py <мастер> <png>`, а как
-поставить для него venv, сказано в `scripts/song-intake/CLAUDE.md`.
+поставить для него venv, сказано в `scripts/song-intake/CLAUDE.md`. Место,
+которое хочется разглядеть, тот же скрипт растянет на всю ширину
+(`--from m:ss --to m:ss`), с долями поверх хромаграмм.
```

**@vzakharov (human)** — 2026-10-14T11:49:02Z

а давай для автоматически определённых полос (те что отмечаются вертикальными пунктирными линиями на спекторграмме) автоматически готовить colocated картинки, чтобы даже запрашивать не надо было. Чтобы можно было "внимательнее посмотреть" на отдельные секции.

---

<a id="t11"></a>

### `scripts/song-intake/song_facts.py`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T11:51:05Z

слишком большой, надо разбивать

---

## Timeline (status, references, and other events)

- **2026-10-13T20:44:08Z** @vzakharov renamed from «content: log the Reddit feedback on the spectrogram» to «feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram».
- **2026-10-14T11:52:39Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5517188038.
