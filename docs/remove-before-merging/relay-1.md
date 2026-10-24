# Relay 1 — local speech recognition in place of Deepgram

## Standing constraints

- The operator removed `DEEPGRAM_API_KEY` on purpose: «да, ключ я намеренно
  убрал уже». No Deepgram call, and no proposal to bring it back.
- Order of work, verbatim: «сначала достичь результата на одной репе, потом уже
  по результату создать зеркальный пиар на другой» — vovazakharov.com first, the
  mirror PR in `vzakharov/life` only after this one holds.

## The conversation

1. **Operator** (opening prompt, cloud session with `life` and
   `vovazakharov.com` attached): «давай в обеих репах уйдём от дипграма,
   посмотрим что можно сделать локальными и/или бесплатными моделями. Для
   эксперимента можно взять вокальную дорожку с какой-нибудь песни на
   vovazakharov.com / сначала достичь результата на одной репе, потом уже по
   результату создать зеркальный пиар на другой»

   **Agent**: routed rung 1 → `/task` in vovazakharov.com; renamed the branch to
   `claude/local-asr-elow1h`; benchmarked local models (below); wrote the plan,
   opened draft PR #200, judged /task Step 3 "no" (models picked by measurement,
   shape given by the operator) and flipped the plan to in-progress quoting the
   prompt as go-ahead.

2. **Operator** (mid-turn): «да, ключ я намеренно убрал уже»

   **Agent**: acknowledged — baselines come from the nova-3 responses already
   committed, never a new call.

Then implementation began: `hearing.py` generalised, `lib/ctc.py` aligner
written; the context budget warning (300k) arrived and the plan was paused for
this relay.

## Intent

Every speech-recognition path in both repos runs on free models on the
session's CPU. The results in this repo decide what the `life` mirror does.

## Decisions

- **GigaAM-v3 RNNT first for Russian speech; Whisper large-v3 first for songs,
  other languages and language detection; each the other's second opinion.**
  Measured — the numbers are in `docs/plans/local-asr.paused.md` § "What the
  experiment found". Parakeet v3 rejected for Russian (drifts into Polish and
  English on a vocal); large-v3-turbo rejected (worse, and history says it drops
  mumbled speech).
- **Whisper on songs runs its voice filter at threshold 0.1**: no filter
  invented `Субтитры сделал DimaTorzok`; the default 0.5 dropped half the song.
- **Russian word timings come from CTC forced alignment over GigaAM-v3 CTC
  frames** (median 0.06 s vs nova-3's 0.16 s, Whisper's own ~1.3 s).
- **The aligner is numpy, not torchaudio** — `scripts/lib/ctc.py` matched
  `torchaudio.functional.forced_align` to the frame, so the hearing venv needs
  no torch.
- **captions.py keeps reading a hearing** (deviation from the first draft of the
  plan, which had it align the lyrics itself): GigaAM CTC spells Russian only,
  and caption tracks serve any language. Aligning the printed lyrics directly
  placed all 12 `hello` cues (median 0.10 s, on the full mix too) — noted in the
  plan as a later Russian-only upgrade. **Tell the operator about this
  deviation** in the next report; it has not been said in chat yet.
- **The response keeps Deepgram's shape** so the committed `.deepgram.json.gz`
  hearings and `hearing.py`'s merge read old and new alike.
- `lyrics.py` folds into `transcribe.py`. The CV's `cv-stack.ts` keeps
  "Deepgram" (it lists what Вова has used).

## Errors and dead ends

- onnx-asr through the Hugging Face cache fails for Parakeet ("External data
  path escapes model directory") — load with `path=` a plain directory.
- onnx-asr refuses stereo input; pass a mono 16 kHz float32 array with
  `sample_rate=16000`. `with_vad(...)` must come before `.with_timestamps()`.

## State

- Branch `claude/local-asr-elow1h`, head `6c4f87b`, pushed, tree clean.
- PR https://github.com/vzakharov/vovazakharov.com/pull/200 — draft, open.
  Squash proposal comment posted and tracked in
  `docs/remove-before-merging/squash-message.md` (already updated for the
  captions deviation). PR body still says captions force-align the lyrics —
  `/pr` refresh at `/go` Step 4 fixes it.
- Plan: `docs/plans/local-asr.paused.md`, with a `## Progress` section (done:
  step 1 and the ctc aligner; left: steps 2–7) and the spike's API notes.
- Nothing running, no subscription, no check-in.
- Estimate: this session 5 h senior analyst (the benchmark) + 2 h middle
  developer (aligner, hearing.py, tests). Remainder for the successor: 4 h
  middle developer ("ears.py, transcribe.py's local backends and lyrics.py's
  fold behind the existing CLI, with a real-audio run") + 1 h middle editor
  ("the docstrings and skills that state Deepgram's traps rewritten to the new
  models' facts").
- `vzakharov/life`: untouched, its branch `claude/festive-gates-elow1h` has no
  commits. The successor starts on vovazakharov.com alone; `life` must be
  attached (`add_repo`) for the mirror PR, and its corrected voice note
  `health/migraine/sources/2026-10-19-voice-note.{m4a,md}` is the speech
  benchmark and calibration set (also reachable as
  `gh api repos/vzakharov/life/contents/...`).
- The muthur-sync offers from the session-start hook were not made.

## Pointers

- `docs/plans/local-asr.paused.md` — the plan, results tables, Progress notes.
- `scripts/lib/hearing.py`, `scripts/lib/ctc.py` and their tests — done.
- `scripts/transcribe.py`, `scripts/song-intake/{lyrics.py,captions.py,CLAUDE.md}`,
  `.claude/skills/{dictation,subtitles}/SKILL.md` — still to change.
- Test material: `apps/vova/public/music/assets/hello.mp4` and `hello.ru.vtt`;
  `docs/music/transcripts/krylya-03-hello.deepgram.json.gz` (nova-3 baseline).
  Vocals stem: `python -m demucs --two-stems=vocals -n htdemucs` (~90 s).
- Predecessor transcript: https://claude.ai/code/session_01V3tgC4XRnF7zrMCWaJj1aQ

## Next step

Resume the paused plan with `/go`: write `scripts/lib/ears.py`,
`scripts/requirements-hearing.txt`, rewrite `scripts/transcribe.py`, fold
`lyrics.py`, calibrate GigaAM's confidence floor, verify on `hello.mp4` +
`captions.py` and on the 19.10 voice note, update the prose, `/polish`, `/pr`.
Then report to the operator (in Russian), including the captions deviation, and
offer the `life` mirror as the next step.
