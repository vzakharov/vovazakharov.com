# PR #186: feat: merge a song's local Whisper hearing into its Deepgram transcript

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/186
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/song-transcript-merge-local-whisper
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-21T16:33:07Z
- **Updated:** 2026-10-22T05:07:04Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/costs/sessions/2026-10/079e4a0d-9d68-5e51-8f48-6abf204598e4.json`:24 — unresolved — last: @vzakharov (human) 2026-10-22T05:03:54Z — "prompter?" → [↓](#t01)
- **T02** `scripts/lib/hearing.py`:1 — unresolved — last: @vzakharov (human) 2026-10-22T05:06:33Z — "так, а у нас это всё DRY по сравнению с теми диктационными ш…" → [↓](#t02)

---

## Body

## Summary

- Вова asked in T17 on #181 whether the repo already has a script that puts Deepgram and Whisper into one output. It half did. `transcribe.py --second-opinion` (the merge ported from vzakharov/life's `transcribe-audio.py`) merges nova-3 only with Deepgram's **hosted** whisper-large. For songs the first hearing is the **local** large-v3 from `lyrics.py`, which hears sung vocals better, and its output stayed a separate `.whisper.md`.
- `lyrics.py --json-dir` now also saves each hearing word by word as `<stem>.whisper.json.gz`, in the same shape as a Deepgram response. `transcribe.py --second-opinion-from <that file>` merges it into the transcript's `## Second opinion` section, so one `.transcript.md` holds both hearings.
- The word alignment only pairs words heard within 3 s of each other. On Nostalgia's «Актёр» the old `difflib` alignment matched one chorus with the *next* one, so from 01:04 onward every verse showed as a disagreement. Dictations with repeated words get the same fix.
- `scripts/song-intake/CLAUDE.md` gives the two commands to run for a song.

## QA Checklist

- [ ] `tests` — `python3 scripts/lib/test_hearing.py` passes, including the new repeated-chorus and `from_segments` cases.
- [ ] `song-e2e` — on a vocals stem from #181 (e.g. `nostalgia-04-actor.mp3`), run `lyrics.py --json-dir` and then `transcribe.py --second-opinion-from`. The transcript's `## Second opinion` agrees on every chorus and puts `[-…-]{+…+}` only where the two hearings really differ (verified in-session: 01:04 «Ты, [-видать,-]{+летать+} увел меня {+с+} собою.»).
- [ ] `dictation` — `transcribe.py --second-opinion` on a speech recording still writes its merged section as before.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `tests` | yes | yes | vet runs it |
| `song-e2e` | partly | no | needs the faster-whisper venv and a Deepgram call |
| `dictation` | partly | partly | merge logic is under fixture tests; the API call is not |

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-21T16:33:20Z — "Proposed squash body: ``` A song is heard twice, by lyrics.p…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-21T16:33:20Z

[https://github.com/vzakharov/vovazakharov.com/pull/186#issuecomment-6321128115](https://github.com/vzakharov/vovazakharov.com/pull/186#issuecomment-6321128115)

Proposed squash body:

```
A song is heard twice, by lyrics.py's local Whisper large-v3 and by
transcribe.py's nova-3, and the two hearings stayed in separate files,
leaving the lines they disagree on to be found by eye. transcribe.py's
--second-opinion merge, ported from vzakharov/life, pairs nova-3 only
with Deepgram's hosted whisper-large, which hears sung vocals worse.

lyrics.py --json-dir now keeps each hearing word by word as
<stem>.whisper.json.gz, shaped as a Deepgram response, and
transcribe.py --second-opinion-from merges that file into the
transcript's Second opinion section, so one transcript carries both.

The word merge pairs only words heard within three seconds of each
other. A global alignment matched one chorus with the next one, and
every verse between came out as a false disagreement; speech with
repeated words gets the same fix.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/costs/sessions/2026-10/079e4a0d-9d68-5e51-8f48-6abf204598e4.json`:24 — unresolved — last: @vzakharov (human) 2026-10-22T05:03:54Z — "prompter?" → [↓](#t01)
- **T02** `scripts/lib/hearing.py`:1 — unresolved — last: @vzakharov (human) 2026-10-22T05:06:33Z — "так, а у нас это всё DRY по сравнению с теми диктационными ш…" → [↓](#t02)

<a id="t01"></a>

### `.claude/costs/sessions/2026-10/079e4a0d-9d68-5e51-8f48-6abf204598e4.json`:24 — unresolved

```diff
@@ -0,0 +1,96 @@
… 20 lines elided …
+      {
+        "hours": 0.5,
+        "grade": "senior",
+        "role": "editor",
```

**@vzakharov (human)** — 2026-10-22T05:03:54Z

prompter?

---

<a id="t02"></a>

### `scripts/lib/hearing.py`:1 — unresolved

**@vzakharov (human)** — 2026-10-22T05:06:33Z

так, а у нас это всё DRY по сравнению с теми диктационными штуками, которые уже были в репе?

---

## Timeline (status, references, and other events)

- **2026-10-22T05:07:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/186#pullrequestreview-5609486484.
