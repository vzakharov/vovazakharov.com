> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Speech recognition without Deepgram

The operator removed `DEEPGRAM_API_KEY` on purpose: every recognizer this repo
calls runs locally, on the session's CPU, from free open models. This repo goes
first; `vzakharov/life` gets a mirror PR once this one holds, built on what it
proves.

## What the experiment found

Run 23.10.2026 on the session's 4 CPUs, no GPU, models through `faster-whisper`
1.2.1 and `onnx-asr` 0.12.0. Spike code in `tmp/asr/` (not committed).

**A sung vocal** — «Здравствуй» (`hello`), the htdemucs vocals stem of its
video's audio, scored against the published `hello.ru.vtt`: its words for word
error rate, its cue starts for timing (each cue's first word, where the model
heard it). nova-3 is read off the committed `krylya-03-hello.deepgram.json.gz`,
heard from the master's stem, so its timings carry the video's 0.19 s offset.

```
model                              WER    cues   median / max start error
nova-3 (committed)                 0.27    9/12   0.16 / 0.56 s
Whisper large-v3, VAD 0.5          0.38    6/12   1.43 / 6.83 s
Whisper large-v3, no VAD           0.15   12/12   0.89 / 2.70 s   + invented credits
Whisper large-v3, VAD 0.1          0.10    9/12   1.33 / 2.94 s
Whisper large-v3-turbo, VAD 0.5    0.42    6/12   0.43 / 0.47 s
GigaAM-v3 CTC, VAD 0.1             0.29    8/12   0.07 / 0.67 s
GigaAM-v3 RNNT, VAD 0.2            0.35    8/12   0.16 / 0.55 s
Parakeet-TDT-0.6b-v3               0.58    3/12   —   (hears Polish and English)
Whisper VAD 0.1 words, GigaAM-CTC
  forced alignment                 0.10    9/12   0.06 / 0.76 s
the printed lyrics, GigaAM-CTC
  forced alignment                  —     12/12   0.10 / 2.06 s
```

- **Whisper large-v3 hears sung Russian best, and places it worst.** With the
  voice filter's threshold at 0.1 instead of 0.5 it heard 90% of the words and
  invented nothing; without the filter it invented `Субтитры сделал DimaTorzok`.
  Its own word timings are a second or more off.
- **GigaAM-v3's CTC head places words to a frame.** Its log-probs, run through
  `torchaudio.functional.forced_align` with Whisper's words as the target, put
  every cue Whisper heard within 0.06 s median — better than nova-3. Given the
  printed lyrics instead, it placed all twelve cues, which is what `captions.py`
  needs.
- Parakeet v3 is out: on a Russian vocal it drifts into Polish and English.

**Speech** — Вова's 2:08 voice note of 19.10 from `life`
(`health/migraine/sources/2026-10-19-voice-note.m4a`), scored against its
hand-corrected transcript, whose timecodes are whole seconds:

```
model                       WER    time
GigaAM-v3 RNNT (e2e)        0.10    22 s
GigaAM-v3 CTC               0.24    14 s
Whisper large-v3            0.23   169 s
Whisper large-v3-turbo      0.25    66 s
Parakeet-TDT-0.6b-v3        0.25    41 s
```

GigaAM-v3 RNNT is the clear first hearing for Russian speech: punctuated,
capitalised, half the errors of anything else, eight times faster than Whisper.
On the mumbled 01.10 note (`2026-10-01-voice-note.m4a`, nova-3 lost 0:21–0:58)
the two complement each other: GigaAM got «30 сентября», «разбаливаться»,
«троечку»; Whisper large-v3 — not turbo — got «выпил 3 пива», «5-30», «выпил
аспирин», the words Вова had to supply by hand.

## The shape

- **First hearing**: GigaAM-v3 RNNT for Russian, Whisper large-v3 for any other
  language and when `--language` is omitted (Whisper detects it; GigaAM is
  Russian-only).
- **Second opinion**: the other one — Whisper large-v3 behind GigaAM, GigaAM
  behind Whisper on Russian. Whisper is large-v3, never turbo (the 01.10 note).
- **Word timings for a song**: Whisper large-v3 at VAD 0.1 for the words,
  GigaAM-v3 CTC forced alignment for where they fall.
- **Captions**: `captions.py` takes the printed lyrics and aligns them itself
  with GigaAM-v3 CTC, so a line is placed where it was sung rather than where a
  recognizer happened to hear it; `--at` stays for a line the aligner misplaces.
- **The response stays in its present shape** (`metadata`,
  `results.channels[0] .alternatives[0]` with `words` and `paragraphs`), so
  every committed `.deepgram.json.gz`, `hearing.py`'s merge and the subtitles
  skill read old and new hearings alike. New files are named for their model,
  `<slug>.<model>.json.gz`, under `docs/remove-before-merging/transcripts/`.
- **The venv**: one `scripts/requirements-hearing.txt` (faster-whisper,
  onnx-asr, torch and torchaudio from the CPU index), installed into
  `tmp/hearing-venv` the way song-intake's is; `transcribe.py` runs under it.
  Models download from Hugging Face on first use, into `tmp/` for onnx-asr —
  onnxruntime refuses external weights behind the Hugging Face cache's symlinks.

## Steps

1. `scripts/lib/hearing.py` — keep pure and stdlib. Generalise `from_segments`
   to any recognizer's words (GigaAM's token timestamps become words the way
   Whisper's segments do now), with a confidence from GigaAM's token
   log-probabilities. Tests in `test_hearing.py`.
2. `scripts/lib/ears.py` (new) — the heavy half: decode with ffmpeg, load each
   model once, `hear(audio, model, language, keyterms)` returning a response,
   `place(audio, words)` doing the CTC forced alignment. Keyterms reach Whisper
   as `hotwords`; GigaAM has none, which the help text says.
3. `scripts/transcribe.py` — the Deepgram call goes; `--model` picks among
   `gigaam-v3`, `whisper-large-v3`; `--second-opinion` runs the other;
   `--second-opinion-from` stays. The confidence floor is recalibrated for
   GigaAM against the 19.10 note's corrections (nova-3's 0.95 means nothing on
   another model's scale), and the docstring states the new traps from this run.
   No key, no network beyond the first model download.
4. `scripts/song-intake/lyrics.py` — folded into `transcribe.py`
   (`--model whisper-large-v3 --vad 0.1`), the one place Whisper is driven; its
   citations in `song-intake/CLAUDE.md` move to the new command.
5. `scripts/song-intake/captions.py` — aligns the printed lyrics with
   `ears.place` instead of reading a response; verified by re-timing `hello` and
   diffing against the committed `hello.ru.vtt`.
6. Prose: `dictation`, `subtitles` skills, `song-intake/CLAUDE.md`,
   `.claude/rules/stack.md`'s roster line for `test_hearing.py`. The CV's
   `cv-stack.ts` keeps Deepgram — it lists what Вова has used, not what this
   repo runs.
7. `/polish`, `/pr`. Then the mirror in `life`, planned there against its own
   `transcribe-audio.py` (utterances, `--diarize`, `--json`), which this PR's
   modules do not reach.

## DRY notes

- `hearing.py` is already the one home of the response shape and the merge; both
  new recognizers write into it rather than a second shape.
- `lyrics.py` and `transcribe.py` both drive Whisper today; folding the first
  into the second leaves one loader, one decode, one set of transcribe options.
- `captions.py`'s own word-level DP alignment stays for nothing once the lyrics
  are force-aligned; it goes, rather than living beside the new path.
- `life/scripts/transcribe-audio.py` duplicates `hearing.py`'s merge across
  repositories. The repos share no code, so the mirror PR copies `ears.py` into
  `life` rather than importing across them — a cross-repo package would cost
  more than two files kept in step.
- The bench and align spikes stay in `tmp/`: the findings live in the docstrings
  that rely on them, as nova-3's did.
