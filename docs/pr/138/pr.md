# PR #138: feat(vova): spectrogram sidecar, drum row and a zoom per section

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/138
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/spectrogram-reddit-log
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-10T20:11:45Z
- **Updated:** 2026-10-20T13:36:33Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 7d9827b). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/assets/spectrograms/birds/4.png`:1 — unresolved — last: @vzakharov (human) 2026-10-20T11:47:15Z — "первый ударный в этой песне -- на 1:21 (закрытый хет), всё ч…" → [↓](#t01)
- **T02** `apps/vova/public/music/assets/spectrograms/hello/5.png`:1 — unresolved — last: @vzakharov (human) 2026-10-20T11:50:39Z — "только здесь начинаются ударные -- с бочки; следующий лёгкий…" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/spectrograms/intertwined/3.png`:1 — unresolved — last: @vzakharov (human) 2026-10-20T11:52:23Z — "только здесь начинается бочка (сначала с одним утихающим кре…" → [↓](#t03)

---

## Body

## Summary

Puts the ideas from three Reddit threads about `scripts/song-intake/spectrogram.py` into the script, then Vova's review on top of them. The threads ([r/DSP](https://www.reddit.com/r/DSP/comments/1x29wdc/), [r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1x29x26/), [r/claudexplorers](https://www.reddit.com/r/claudexplorers/comments/1x2a0q2/)) are about a picture that lets a model that cannot hear a song still read it at a glance. The plan is `docs/plans/spectrogram-reddit-log.completed.md`; the log it comes from is `docs/remove-before-merging/spectrogram-reddit.md`.

- **Tuning, tempo and key the way the author hears them.** The note grid shifts by the song's offset from A440; a beat tracker that follows drift (Ellis's dynamic programming, in numpy) places the beats and the tempo is read off them, per section; the key and the chords discount each note's 3rd and 5th overtones, so C minor stops reading as G, and the onset flux is averaged per octave, so the hi-hat stops outvoting the kick. All eleven keys now match Vova's answers, and ten of the eleven tempos.
- **A text sidecar** beside each PNG holds what the picture only approximates: tempo, key with its confidence, tuning, and per numbered section its times, loudness and chords, spelled from the key, a repeating loop folded.
- **A drum row** of four lanes — kick, toms, snare with claps, cymbals — unmixed from each band's rise, so rhythm reads off the picture the way harmony reads off the chroma strips. The image grows taller for it.
- **A zoom per section**, written into `spectrograms/<slug>/<n>.png` with every render, numbered as on the whole picture and in the sidecar; `--from/--to` for any other stretch; `--split` moves the bass/treble cut to any note, drawn as a dotted line.
- **Checked against librosa** (`docs/remove-before-merging/sidecar-check.md`): every disagreement went to Vova, and his answers fixed the method generally, never per song. Майя's rule tells her to read chords with caution, and to judge major or minor over power chords by the vocal's third.

The analysis lives in numpy-only `audio.py`, `pitch.py`, `rhythm.py`, `harmony.py`, `drums.py` and `song_facts.py`, tested on synthetic signals and wired into vet.

## QA Checklist

- [ ] `tuning` — a song rendered with its pitch shifted 30 cents shows the same bright rows as the original, and its title names the offset.
- [ ] `keys` — each of the eleven sidecars names the key Vova gave or that both tools agreed on.
- [ ] `tempo` — the titles' BPM match a tap-along within 10%, except world-as-it-is (121 against 110–115, known).
- [ ] `sidecar` — `birds.txt` names G minor and the bass loop G E♭ F, and its sections match the PNG's numbered dashed lines.
- [ ] `drums` — Птицы's drum row lights a kick on every kick and its toms in the toms lane.
- [ ] `zooms` — `spectrograms/birds/` holds one PNG per section, each titled with its number and tempo, with beat lines.
- [ ] `split` — `--split E3` moves the dotted line and the strips' boundary to E3.

| Item      | Automatable                      | Covered?             | Notes                                 |
| --------- | -------------------------------- | -------------------- | ------------------------------------- |
| `tuning`  | yes, a synthetic sine            | `test_song_facts.py` | the real song needs a look            |
| `keys`    | the comparison yes               | `sidecar-check.md`   | truth is Vova's ear                   |
| `tempo`   | yes, a click train               | `test_song_facts.py` | a real song needs an ear              |
| `sidecar` | its formatting yes; its truth no | partly               | truth is `sidecar-check`'s            |
| `drums`   | yes, synthetic strikes over noise | `test_song_facts.py` | a real mix needs a look               |
| `zooms`   | no                               | no                   | visual                                |
| `split`   | the note parsing yes             | no                   | visual                                |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_015VJWAuug8qXitURWSdJvwS

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T20:44:20Z — "Proposed squash title/body: ``` feat(vova): spectrogram side…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-10-20T12:16:31Z — "> почему мы не хотим устанавливать (в сессиях где это нужно)…" → [↓](#c02)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T20:44:20Z

[https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6154829473](https://github.com/vzakharov/vovazakharov.com/pull/138#issuecomment-6154829473)

Proposed squash title/body:

```
feat(vova): spectrogram sidecar, drum row and a zoom per section (pr #138)
```

```
A model reads a song through spectrogram.py's picture, and Reddit
feedback on it named what the picture could not carry: a song tuned off
A440 splits each note across two chromagram rows, and a key or tempo
read off a picture is approximate where a number is exact. The author's
review then asked for rhythm, a closer look at each section, and the
keys and tempos he hears.

The script measures the song's tuning and shifts its note grid by it,
tracks beats that follow a drifting tempo, and reads the key and chords
with each note's 3rd and 5th overtones discounted, so C minor does not
read as G. A text sidecar beside each PNG states tempo, key with its
confidence, tuning, and per numbered section its span, tempo, loudness
and chords spelled from the key, a repeating loop folded.

The picture gains a drum row - kick, toms, snare, cymbals, unmixed from
each band's rise - and a dotted bass/treble split that --split moves to
any note. Every render writes one full-width zoom per section beside the
PNG. The analysis is numpy-only, split by concern, with synthetic tests
run by vet.

All eleven spectrograms are re-rendered. Checked against librosa and
the author, every key and all tempos but world-as-it-is's are right;
Майя's rule reads chords with caution and judges major or minor over
power chords by the vocal's third.

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

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (human) — COMMENTED

_2026-10-20T11:54:16Z_

[https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5584528134](https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5584528134)

проверил только несколько, но в общем результат по барабанам пока неутешительный.

я ещё не знаю где задавал этот вопрос, возможно потерялся: почему мы не хотим устанавливать (в сессиях где это нужно) librosa и пользоваться ей?

_12 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/assets/spectrograms/birds/4.png`:1 — unresolved — last: @vzakharov (human) 2026-10-20T11:47:15Z — "первый ударный в этой песне -- на 1:21 (закрытый хет), всё ч…" → [↓](#t01)
- **T02** `apps/vova/public/music/assets/spectrograms/hello/5.png`:1 — unresolved — last: @vzakharov (human) 2026-10-20T11:50:39Z — "только здесь начинаются ударные -- с бочки; следующий лёгкий…" → [↓](#t02)
- **T03** `apps/vova/public/music/assets/spectrograms/intertwined/3.png`:1 — unresolved — last: @vzakharov (human) 2026-10-20T11:52:23Z — "только здесь начинается бочка (сначала с одним утихающим кре…" → [↓](#t03)

<a id="t01"></a>

### `apps/vova/public/music/assets/spectrograms/birds/4.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T11:47:15Z

первый ударный в этой песне -- на 1:21 (закрытый хет), всё что отмечено как ударные до этого -- шум; нужна калибровка и порог повыше, или как-то так.

---

<a id="t02"></a>

### `apps/vova/public/music/assets/spectrograms/hello/5.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T11:50:39Z

только здесь начинаются ударные -- с бочки; следующий лёгкий снейр на 1:23; никаких цимбалов в песне нет, но в 1:36 начинается шум который можно принять за цимбал -- это само по себе было бы ок, но никаких многих цимбалов в начале этого куска, как показывает график, нет.

---

<a id="t03"></a>

### `apps/vova/public/music/assets/spectrograms/intertwined/3.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-20T11:52:23Z

только здесь начинается бочка (сначала с одним утихающим крешем), фактически просто с одной скоростью без других ударных вплоть до 1:17, где всё опять заканчивается

---

## Timeline (status, references, and other events)

- **2026-10-13T20:44:08Z** @vzakharov renamed from «content: log the Reddit feedback on the spectrogram» to «feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram».
- **2026-10-14T11:52:39Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5517188038.
- **2026-10-14T12:40:19Z** @vzakharov renamed from «feat(vova): tuning, tempo, a sidecar and a zoom for the spectrogram» to «feat(vova): spectrogram sidecar, drum row and a zoom per section».
- **2026-10-20T11:54:16Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5584528134.
- **** @vzakharov reviewed (PENDING): https://github.com/vzakharov/vovazakharov.com/pull/138#pullrequestreview-5590208848.
