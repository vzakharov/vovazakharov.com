# PR #138: feat(vova): spectrograms off demucs stems, with a sidecar and zooms

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/138
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/spectrogram-reddit-log
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-10T20:11:45Z
- **Updated:** 2026-10-21T05:50:54Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 3a2414e). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T05** `apps/vova/public/music/assets/spectrograms/intertwined/intertwined.png`:1 — unresolved — last: @vzakharov (human) 2026-10-21T05:41:42Z — "после 2:00 -- вполне себе полноценный снэр, (на каждый второ…" → [↓](#t05)
- **T06** `apps/vova/public/music/assets/spectrograms/just-because/3.png`:1 — unresolved — last: @vzakharov (human) 2026-10-21T05:43:07Z — "тут с самого начала вполне различимый закрытый хет на шестна…" → [↓](#t06)
- **T07** `apps/vova/public/music/assets/spectrograms/sorry/3.png`:1 — unresolved — last: @vzakharov (human) 2026-10-21T05:49:14Z — "кажется, границы тактов (но не детальнее) всё же стоить пост…" → [↓](#t07)

---

## Body

## Summary

Puts the ideas from three Reddit threads about `scripts/song-intake/spectrogram.py` into the script, then Vova's review on top of them. The threads ([r/DSP](https://www.reddit.com/r/DSP/comments/1x29wdc/), [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1x29x26/), [r/claudexplorers](https://www.reddit.com/r/claudexplorers/comments/1x2a0q2/)) are about a picture that lets a model that cannot hear a song still read it at a glance. The plans are `docs/plans/spectrogram-reddit-log.completed.md` and `docs/plans/spectrogram-drums-stem.completed.md`; the log they come from is `docs/remove-before-merging/spectrogram-reddit.md`.

- **Tuning, tempo and key the way the author hears them.** The note grid shifts by the song's offset from A440; a beat tracker that follows drift (Ellis's dynamic programming, in numpy) places the beats and the tempo is read off them, per section; the key and the chords discount each note's 3rd and 5th overtones, so C minor stops reading as G, and the onset flux is averaged per octave, so the hi-hat stops outvoting the kick. All eleven keys match Vova's answers, and ten of the eleven tempos.
- **Read off demucs's four stems.** Three chroma strips — melody off vocals, harmony off other, bass off the bass stem under C4 — replace the mix's bass/treble split, so a low voice no longer votes with the bass; the sidecar's chords come off other + bass, so the tune's passing notes no longer vote in them. The key stays on the whole mix. Cost: a ~1.2 GB venv and ~2 min a song on 4 cores to cut the stems, which are too big to commit and are now required.
- **A drum row** of four lanes — kick, toms, snare with claps, cymbals — read off the drums stem, a dot per hit sized and lit by its level. Onsets by spectral flux; each hit's band gains unmixed onto measured kit shapes; a lane lights only where the hit needs it. Off the mix, a picked guitar's attack read as a drum hit no calibration could separate. Checked against Vova's ear on birds, hello, intertwined and just-because; a drumless stem (world-as-it-is, listen-single) yields no hits.
- **A text sidecar** beside each PNG holds what the picture only approximates: tempo, key with its confidence, tuning, and per numbered section its times, loudness and chords, spelled from the key, a repeating loop folded, `N` where the accompaniment is too quiet for a chord.
- **Each song in its own folder**, `spectrograms/<slug>/`: the whole picture, the sidecar and one zoom per section, numbered as on the picture and in the sidecar; `--from/--to` for any other stretch.
- **Checked against librosa** (`docs/remove-before-merging/sidecar-check.md`): every disagreement went to Vova, and his answers fixed the method generally, never per song. Майя's rule tells her to read chords with caution, and to judge major or minor over power chords by the vocal's third.

The analysis lives in numpy-only `audio.py`, `pitch.py`, `rhythm.py`, `harmony.py`, `drums.py` and `song_facts.py`, tested on synthetic signals and wired into vet.

## QA Checklist

- [ ] `tuning` — a song rendered with its pitch shifted 30 cents shows the same bright rows as the original, and its title names the offset.
- [ ] `keys` — each of the eleven sidecars names the key Vova gave or that both tools agreed on.
- [ ] `tempo` — the titles' BPM match a tap-along within 10%, except world-as-it-is (121 against 110–115, known).
- [ ] `strips` — birds' bass strip stays dark until the bass enters at 2:53, and its melody strip follows the vocal line.
- [ ] `drums` — birds' drum row is empty until a hat at ~1:20, then snare on the backbeat; hello's starts with a kick at 1:20 and a snare at 1:23; intertwined reads one kick per beat 0:48–1:17; world-as-it-is has no dots.
- [ ] `sidecar` — `birds/birds.txt` names G minor, and its sections match the PNG's numbered dashed lines.
- [ ] `zooms` — `spectrograms/birds/` holds one PNG per section, each titled with its number and tempo.
- [ ] `stems` — `spectrogram.py` without a stems directory, or with one missing a stem, stops and names the missing file.

| Item      | Automatable                         | Covered?             | Notes                       |
| --------- | ----------------------------------- | -------------------- | --------------------------- |
| `tuning`  | yes, a synthetic sine               | `test_song_facts.py` | the real song needs a look  |
| `keys`    | the comparison yes                  | `sidecar-check.md`   | truth is Vova's ear         |
| `tempo`   | yes, a click train                  | `test_song_facts.py` | a real song needs an ear    |
| `strips`  | no                                  | no                   | visual, truth is Vova's ear |
| `drums`   | yes, synthetic strikes on a stem    | `test_song_facts.py` | real songs need a look      |
| `sidecar` | its formatting yes; its truth no    | partly               | truth is `sidecar-check`'s  |
| `zooms`   | no                                  | no                   | visual                      |
| `stems`   | yes                                 | no                   | argparse error path         |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_015VJWAuug8qXitURWSdJvwS
https://claude.ai/code/session_01FVwLAT8kApHk1uwoU1zuDL

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T20:44:20Z — "Proposed squash title/body: ``` feat(vova): spectrograms off…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-10-20T12:16:31Z — "> почему мы не хотим устанавливать (в сессиях где это нужно)…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-10-21T05:21:35Z — "В сессии Вова ответил на вопросы «для уха» про барабаны. Что…" → [↓](#c03)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T20:44:20Z

[https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6154829473](https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6154829473)

Proposed squash title/body:

```
feat(vova): spectrograms off demucs stems, a sidecar and zooms (pr #138)
```

```
A model reads a song through spectrogram.py's picture, and Reddit
feedback on it named what the picture could not carry: a song tuned off
A440 splits each note across two chromagram rows, and a key or tempo
read off a picture is approximate where a number is exact. The author's
review then asked for rhythm, a closer look at each section, and the
keys, tempos and drums he hears.

The script measures the song's tuning and shifts its note grid by it,
tracks beats that follow a drifting tempo, and reads the key with each
note's 3rd and 5th overtones discounted, so C minor does not read as G.
A text sidecar beside each PNG states tempo, key with its confidence,
tuning, and per numbered section its span, tempo, loudness and chords.

Everything but the key is read off demucs's four stems, now required:
off the mix a low voice voted with the bass, passing notes with the
chords, and a picked guitar's attack read as a drum hit. Three strips -
melody, harmony, bass - each read their own stem; a drum row lights a
lane per hit by unmixing it onto kit shapes measured off the
catalogue's stems, and a drumless stem yields none. Each song gets a
folder holding its picture, sidecar and a zoom per section.

All eleven are re-rendered. Checked against librosa and the author's
ear, every key, all tempos but world-as-it-is's and the drum entries he
named are right; Майя's rule reads chords with caution.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (agent) on 2026-10-20T12:16:31Z

[https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6290631162](https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6290631162)

> почему мы не хотим устанавливать (в сессиях где это нужно) librosa и пользоваться ей?

Веской причины нет. Довод из плана — что librosa тянет torch — был неверен: она тянет scipy, numba и sklearn, это ~485 МБ и ~100 с установки, для сессии терпимо. Тональность и темп у нас вышли переизобретёнными рядом с готовым инструментом; на этих одиннадцати песнях они с librosa теперь совпадают, так что переписывать их на неё почти ничего не даст, а вот новое измерение стоит начинать с того, что в librosa уже есть.

С барабанами librosa бы не помогла: распознавания ударных в ней нет, только онсеты и разделение на гармоническое/ударное — то же семейство эвристик по миксу, что и у нас, а по миксу щипок гитары поднимается в полосах ровно как удар. Порог тут не спасёт: в «Птицах» дорожки до 1:21 статистически неотличимы от дорожек после.

Спасает demucs, который в song-intake уже стоит ради вокала: его стем барабанов (`--two-stems=drums`) совпал со всеми тремя твоими разметками — в «Птицах» молчит до 1:20, в «Здравствуй» оживает на 1:19–1:20, в «Переплетении» звучит ровно 0:48–1:17 (а после 1:20 там шумовой райзер, который demucs тоже относит к барабанам, — его придётся отсекать по форме спектра). Так что барабанную полосу переделываю на стеме, с одной меткой на удар; замеры и план — `docs/plans/spectrogram-drums-stem.paused.md`. Сессия упёрлась в контекст, доделывает следующая.

---

<a id="c03"></a>

### Comment by @vzakharov (agent) on 2026-10-21T05:21:35Z

[https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6308711945](https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6308711945)

В сессии Вова ответил на вопросы «для уха» про барабаны. Что из этого вышло:

- **«Мир, какой он есть»: ударных нет.** Барабанная дорожка demucs в этой песне на 44 дБ тише микса, а в песнях с барабанами разница не больше 12 дБ. Теперь такую дорожку детектор не читает вовсе, и ряд остаётся пустым. Под то же правило попал «Послушайте» (сингл), там 48 дБ. Про него Вову не спрашивали, так что пусть ухо подтвердит. 529591a
- **«Просто так»: «томы» с 1:28 — это снейр.** Добавлен снейр с толстым низом, снятый с этой песни. Томов в ней стало 3 вместо 75, а снейры легли ровно туда, где они в `K..KS.......S...`. 529591a
- **«С» в «Переплетении» и, возможно, вдох в «Птицах»: не вышло, как и разрешалось.** На этих «С» высокие частоты голосовой дорожки на 10–14 дБ тише барабанной, а у настоящих хетов в «Птицах» разница от −1 до −4 дБ. Порога, который отделил бы одно от другого, нет.
- **Креш под бочкой на 0:48: тоже не вышло.** По верхним полосам он отличается от обычных бочек на 0:51–1:02 меньше чем на децибел.
- **«Послушайте», с 0:36:** «ложку по кастрюле» ряд и так рисует как снейр, отдельного инструмента под неё не заводил.

Все одиннадцать перерисованы: 2018ae4.

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (human) — COMMENTED

_2026-10-20T11:54:16Z_

[https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5584528134](https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5584528134)

проверил только несколько, но в общем результат по барабанам пока неутешительный.

я ещё не знаю где задавал этот вопрос, возможно потерялся: почему мы не хотим устанавливать (в сессиях где это нужно) librosa и пользоваться ей?

_14 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/assets/spectrograms/birds/4.png`:1 — unresolved — last: @vzakharov (agent) 2026-10-21T03:50:31Z — "Полосу барабанов теперь читает стем барабанов demucs, а не м…" → [↓](#t01)
- **T02** `apps/vova/public/music/assets/spectrograms/intertwined/3.png`:1 — unresolved — last: @vzakharov (agent) 2026-10-21T03:50:34Z — "Теперь по стему барабанов: с 0:48 до 1:17.76 — только бочка,…" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/spectrograms/after-us/2.png`:1 — unresolved — last: @vzakharov (agent) 2026-10-21T04:19:36Z — "Сделано: a8bf324, перерисовка всех одиннадцати — a026bc0." → [↓](#t03)
- **T04** `apps/vova/public/music/assets/spectrograms/after-us/after-us.png`:1 — unresolved — last: @vzakharov (agent) 2026-10-21T04:19:38Z — "Сделано: a8bf324, перерисовка всех одиннадцати — a026bc0." → [↓](#t04)
- **T05** `apps/vova/public/music/assets/spectrograms/intertwined/intertwined.png`:1 — unresolved — last: @vzakharov (human) 2026-10-21T05:41:42Z — "после 2:00 -- вполне себе полноценный снэр, (на каждый второ…" → [↓](#t05)
- **T06** `apps/vova/public/music/assets/spectrograms/just-because/3.png`:1 — unresolved — last: @vzakharov (human) 2026-10-21T05:43:07Z — "тут с самого начала вполне различимый закрытый хет на шестна…" → [↓](#t06)
- **T07** `apps/vova/public/music/assets/spectrograms/sorry/3.png`:1 — unresolved — last: @vzakharov (human) 2026-10-21T05:49:14Z — "кажется, границы тактов (но не детальнее) всё же стоить пост…" → [↓](#t07)

<a id="t01"></a>

### `apps/vova/public/music/assets/spectrograms/birds/4.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T11:47:15Z

первый ударный в этой песне -- на 1:21 (закрытый хет), всё что отмечено как ударные до этого -- шум; нужна калибровка и порог повыше, или как-то так.

**@vzakharov (agent)** — 2026-10-21T03:50:31Z

Полосу барабанов теперь читает стем барабанов demucs, а не микс: по миксу щипок гитары поднимается в полосах ровно как удар. До 1:20 полоса пустая. Первая метка — слабый хет на 1:19.97, на секунду раньше твоего 1:21. Если там ничего не слышно, это последний шум, который ещё проходит. Дальше снейр на 1:21.18 и бэкбит. Код 2c4dd1b и 44b9f00, перерисовка 663c6c6.

---

<a id="t02"></a>

### `apps/vova/public/music/assets/spectrograms/intertwined/3.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T11:52:23Z

только здесь начинается бочка (сначала с одним утихающим крешем), фактически просто с одной скоростью без других ударных вплоть до 1:17, где всё опять заканчивается

**@vzakharov (agent)** — 2026-10-21T03:50:34Z

Теперь по стему барабанов: с 0:48 до 1:17.76 — только бочка, по метке на каждую долю, а с 1:17 до 1:28 пусто. Код 2c4dd1b и 44b9f00, перерисовка 663c6c6.

Тут три места для твоего уха:

1. **Креш на 0:48 не отмечен.** Он звучит одновременно с бочкой, и форма бочки съедает его целиком. Форму креша я выдумал, а не мерил, поэтому сначала хочу понять, слышен ли он там отчётливо.
2. **На 1:15.02 есть одна метка цимбала** средней яркости. Там что-то звучит, или это шум?
3. **На 0:31.63, ещё до бочки, есть одна метка цимбала.** Тот же вопрос.

---

<a id="t03"></a>

### `apps/vova/public/music/assets/spectrograms/after-us/2.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T19:06:13Z

кажется, барабаны уже точнее, но по-прежнему не нравится, как они выглядят. С такими тоненькими полосками что вообще агент сможет понять? может какие-то точки-кругляшки?

**@vzakharov (agent)** — 2026-10-21T03:50:38Z

Согласен, тонкие штрихи нечитаемы — и для меня тоже: штрих в пиксель шириной на картинке в 1300 пикселей агент различает хуже, чем ты. Кругляш на каждый удар, площадью по силе удара, в своей дорожке и своим цветом, читается сразу: где бочка на каждую долю, где бэкбит, где тарелки сыплются. Предлагаю так и сделать, на зумах и на целой картинке; на целой кругляши сольются в полосу там, где барабаны играют плотно, но там и нужно только «есть / нет», которое и так видно.

**@vzakharov (agent)** — 2026-10-21T04:19:36Z

Сделано: a8bf324, перерисовка всех одиннадцати — a026bc0.

---

<a id="t04"></a>

### `apps/vova/public/music/assets/spectrograms/after-us/after-us.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T19:08:17Z

но вот тут, на большой картинке, хоть видно где есть барабаны, где нет -- это хорошо. как будто там ещё (на "приближениях") какие-то вертикальные полоски для битов? не знаю как это с точки зрения агента, но меня они больше сбивают чем помогают

**@vzakharov (agent)** — 2026-10-21T03:50:39Z

Да, на зумах это сетка долей: белая вертикальная линия на каждый бит, который насчитал скрипт, через все полосы высоты тона. Мне она тоже скорее мешает: режет каждую ноту на куски и рябит поверх цветов, а темп и так стоит цифрой в заголовке и в `.txt`. Если барабаны станут кругляшами, доли будут видны по бочке и снейру. Предлагаю сетку убрать совсем.

**@vzakharov (agent)** — 2026-10-21T04:19:38Z

Сделано: a8bf324, перерисовка всех одиннадцати — a026bc0.

---

<a id="t05"></a>

### `apps/vova/public/music/assets/spectrograms/intertwined/intertwined.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-21T05:41:42Z

после 2:00 -- вполне себе полноценный снэр, (на каждый второй кик, стандартно) -- тут он, кажется, не определился совсем.

---

<a id="t06"></a>

### `apps/vova/public/music/assets/spectrograms/just-because/3.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-21T05:43:07Z

тут с самого начала вполне различимый закрытый хет на шестнадцатые (дважды на бочку)

---

<a id="t07"></a>

### `apps/vova/public/music/assets/spectrograms/sorry/3.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-21T05:49:14Z

кажется, границы тактов (но не детальнее) всё же стоить поставить. если они конечно определяются

---

## Timeline (status, references, and other events)

- **2026-10-13T20:44:08Z** @vzakharov renamed from «content: log the Reddit feedback on the spectrogram» to «feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram».
- **2026-10-14T11:52:39Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5517188038.
- **2026-10-14T12:40:19Z** @vzakharov renamed from «feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram» to «feat(vova): spectrogram sidecar, drum row and a zoom per section».
- **2026-10-20T11:54:16Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5584528134.
- **2026-10-21T03:47:37Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5590208848.
- **2026-10-21T05:26:35Z** @vzakharov renamed from «feat(vova): spectrogram sidecar, drum row and a zoom per section» to «feat(vova): spectrograms off demucs stems, with a sidecar and zooms».
- **2026-10-21T05:50:53Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5595411801.
