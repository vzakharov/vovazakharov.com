# `.claude/skills/subtitles/SKILL.md`

<a id="t65"></a>

### `.claude/skills/subtitles/SKILL.md`:27 — resolved

```diff
@@ -15,12 +15,16 @@ there.
… 11 lines elided …
+  output puts the mis-hearings back on screen, in the speaker's voice, burned
+  in. Verbatim mode only — a retake file is the script for a recording that has
+  not been made yet, so there is nothing to lay it over.
+- **The per-word timings**, which are in the Deepgram response and nowhere else.
+  That response lives in gitignored `tmp/deepgram/` and does not survive the
+  session, so a subtitle pass starting cold re-runs `scripts/transcribe.py` over
+  the media on the branch — same model, `--force`, or the two responses are
+  incomparable.
```

**@vzakharov (human)** — 2026-09-16T15:38:15Z

так тоже не оч хорошо; что если сохранять, но зипить (и чтобы сохранять размер, и чтобы они не лезли в превью как текстовый файл). есть зип в контейнере ж?

**@vzakharov (agent)** — 2026-09-16T17:37:30Z

Сделал: ответ Deepgram теперь лежит рядом с транскриптом, `<slug>.deepgram.json.gz`, и коммитится. ~30 КБ против 3.7 МБ аудио по соседству, и как бинарь в превью не лезет.

Зип в контейнере есть, но не понадобился: gzip есть в стандартной библиотеке питона, так что пишет его сам `scripts/transcribe.py`. Скилл сабтитров теперь читает этот файл, а не перезапускает распознавание, — перезапуск даёт другую расшифровку, к которой уже сделанные правки не подходят. 22f707d

---
