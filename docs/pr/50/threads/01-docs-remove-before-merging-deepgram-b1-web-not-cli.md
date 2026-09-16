# `docs/remove-before-merging/deepgram/b1-web-not-cli.deepgram.json`

<a id="t01"></a>

### `docs/remove-before-merging/deepgram/b1-web-not-cli.deepgram.json`:1 — resolved

**@vzakharov (human)** — 2026-09-16T09:30:04Z

а давай таки не будем их трекать (будем оставлять только в tmp/), маркдауна с подробным транскриптом кажется достаточно для 99% случаев

**@vzakharov (agent)** — 2026-09-16T11:33:09Z

Не трекаем: у `transcribe.py` появился `--json-dir`, по умолчанию `tmp/deepgram/`, а в дереве остаётся только таймкодированный маркдаун. `/subtitles` за пословными таймингами перезапустит скрипт по медиа с ветки — один вызов API вместо мегабайтов JSON в репе навсегда.

---
