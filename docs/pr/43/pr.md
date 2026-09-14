# PR #43: content: capture the late-stage-agentic dictation as prose

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/43
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/late-stage-agentic-phnz8v
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-14T08:22:50Z
- **Updated:** 2026-09-14T09:34:00Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

Two spoken passes at a new project, written down so they stop living in audio files.

**What it is.** An English site at `latestageagentic.com` plus a Russian Telegram channel, «Клод четвёртой стадии», both about human–agent collaboration: where the person sits in the arrangement, and whether fast and good can be had at once. The larger idea behind the site is a wiki — lessons from actual work, written to be read by agents as much as by people, because that kind of experience is exactly what an agent cannot find in the training set.

**What is in the PR.** `writing/late-stage-agentic/dictations/`, one file per recording:

| File | What it is |
| --- | --- |
| `p1-the-idea.md` | The premise: the site, the channel, the wiki, why Russian, how the content flows between the two languages. |
| `p2-the-limits.md` | The first content video: why a human is still needed at all, circling limitedness — a person holds only part of the experience there is, a model that absorbed all of it finds a sunset exactly as beautiful as it is indifferent. |

Each is the transcription (Deepgram, `nova-3`) cleaned into readable prose — fillers and false starts out, wording kept. Open questions and the phrases the transcription garbled are listed at the end of each file rather than quietly guessed at.

**What is deliberately not in it.** No plan, no draft post, no site code. More dictations land here as they are recorded; the project then moves to its own repo via `/spinoff`.

`docs/remove-before-merging/first-content.mp4` is the source video for p2 and goes out with the sweep at finalize.

Draft, and staying draft until there is enough dictated to build from.

---


## Review threads

### `docs/remove-before-merging/deepgram/README.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-14T09:27:46Z

let's make it into a script (deterministic part) + skill (manual part), to be used on future videos & audios. Videos will also have to be subtitled (not now, we'll get to this), but idk if that's part of the same skill or better a new one.

---

### `docs/remove-before-merging/first-content.mp4`:1 — unresolved

**@vzakharov (human)** — 2026-09-14T09:28:38Z

к твоему вопросу, да, мы хотим сохранять эти видео в репе. На мейне или нет -- пока не решил; ты как думаешь?

---

### `writing/late-stage-agentic/dictations/p2-the-limits.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-14T09:33:52Z

начал править вручную (см. последний коммит) -- но потом понял, что ты слишком сильно переделываешь исходник. Нужно ближе к тексту, по двум причинам: а) он передаёт мою манеру говорить и выражаться и б) мы будем ставить субитры на видео. То есть это должна быть именно транскрипция, а не перефразирование. Убирать ошибки-сбивки, добавлять абзацы и знаки препинания это ок, заголовки тоже помогают, но в основному нужно ближе.

---

## Timeline (status, references, and other events)

- **2026-09-14T09:34:00Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/43#pullrequestreview-5196067098.
